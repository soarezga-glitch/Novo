"""Trilha original (estilo deserto / Egito antigo) + efeitos (lápis e whoosh) + mixagem com a narração.

uso: python3 -I audio.py NARRACAO.mp3 SAIDA.wav
Tudo é sintetizado aqui, sem nenhum som de terceiros.
"""
import numpy as np, subprocess, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import SEGS, AUDIO_END

SR = 44100
N = int(AUDIO_END * SR) + SR
rng = np.random.default_rng(11)

def lowpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))

def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 / np.sqrt(1 + (f / hi) ** 4) * (1 - 1 / np.sqrt(1 + (f / lo) ** 4))
    return np.fft.irfft(X * g, len(x))

def add(buf, x, t):
    i = int(t * SR)
    if i >= len(buf): return
    x = x[:len(buf) - i]; buf[i:i + len(x)] += x

# ---------------------------------------------------------------- oud (Karplus-Strong)
def pluck(freq, dur=1.6):
    n = int(dur * SR); p = int(SR / freq)
    buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(0, n, p):
        k = min(p, n - i); out[i:i + k] = buf[:k]
        buf = 0.5 * (buf + np.roll(buf, -1)) * 0.996
    out += 0.3 * np.sin(2 * np.pi * freq * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 3)
    return out * np.exp(-np.arange(n) / SR * 1.8)

D3 = 146.83
HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16]          # D Eb F# G A Bb C D Eb F#
NOTES = {s: pluck(D3 * 2 ** (s / 12)) for s in HIJAZ + [-2, -5]}

BEAT = 60 / 76
music = np.zeros(N)

# drone grave (D + A), com respiração lenta
t = np.arange(N) / SR
drone = sum(a * np.sin(2 * np.pi * f * t + ph) for f, a, ph in
            [(73.42, 0.5, 0), (73.62, 0.35, 1), (110.0, 0.25, 2), (146.83, 0.12, 3), (220.0, 0.05, 1)])
drone *= 0.75 + 0.25 * np.sin(2 * np.pi * t / 11)
music += 0.16 * drone

# melodia em frases: 4 compassos tocando, 2 descansando
bar = BEAT * 4; tb = 1.0; deg = 2
while tb < AUDIO_END - 6:
    for b in range(4):
        for e in range(8):
            if rng.random() < (0.55 if e % 2 == 0 else 0.25):
                deg = int(np.clip(deg + rng.choice([-2, -1, -1, 0, 1, 1, 2]), 0, len(HIJAZ) - 1))
                if e == 0 and b == 3: deg = 0
                tt = tb + b * bar + e * BEAT / 2 + rng.normal(0, 0.008)
                add(music, NOTES[HIJAZ[deg]] * (0.22 + 0.08 * rng.random()), tt)
                if rng.random() < 0.15:  # trêmulo típico do oud
                    add(music, NOTES[HIJAZ[deg]] * 0.12, tt + 0.09)
        if b in (0, 2): add(music, NOTES[-5] * 0.18, tb + b * bar)
    tb += bar * 6

# percussão (def / darbuka) em maqsum: D T . T D . T .
def dum():
    n = int(0.45 * SR); tt = np.arange(n) / SR
    f = 50 + 60 * np.exp(-tt * 25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
def tek():
    n = int(0.12 * SR); tt = np.arange(n) / SR
    return bandpass(rng.uniform(-1, 1, n), 1500, 6000) * np.exp(-tt * 45)
DUM, TEK = dum(), tek()
quiet = [(276.0, 301.0), (379.0, 390.0), (530.0, 546.0)]   # trechos mais íntimos, sem tambor
tb = 17.76
while tb < AUDIO_END - 3:
    if not any(a <= tb < b for a, b in quiet):
        for e, kind in enumerate('DT.TD.T.'):
            if kind == 'D': add(music, DUM * 0.35, tb + e * BEAT / 2)
            if kind == 'T': add(music, TEK * 0.10, tb + e * BEAT / 2)
    tb += bar

music = lowpass(music, 5000)
fade = np.clip(t / 3, 0, 1) * np.clip((AUDIO_END - t) / 4, 0, 1)
music *= fade

# ---------------------------------------------------------------- efeitos
sfx = np.zeros(N)
def pencil(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = bandpass(rng.uniform(-1, 1, n), 1800, 6500)
    strokes = 0.5 + 0.5 * np.sin(2 * np.pi * (6 + 2 * np.sin(2 * np.pi * 0.7 * tt)) * tt)
    env = np.clip(tt / 0.08, 0, 1) * np.clip((dur - tt) / 0.15, 0, 1)
    return x * strokes ** 2 * env
def whoosh():
    n = int(0.6 * SR); tt = np.arange(n) / SR
    x = rng.uniform(-1, 1, n); out = np.zeros(n); step = n // 12
    for k in range(12):   # varredura de grave para agudo
        seg = bandpass(x, 200 + k * 180, 600 + k * 500)[k * step:(k + 1) * step]
        out[k * step:k * step + len(seg)] = seg
    return out * np.sin(np.pi * tt / 0.6) ** 2

def windows(i):
    s = SEGS[i]
    if s['kind'] == 'still': return []
    if s['kind'] == 'full':
        D = s['t1'] - s['t0']; return [(s['t0'] + 0.35, float(np.clip(D * 0.38, 2.5, 7.0)))]
    out = []
    for k, (_, ts) in enumerate(s['els']):
        nxt = s['els'][k + 1][1] if k + 1 < len(s['els']) else s['t1']
        out.append((ts, float(np.clip((nxt - ts) * 0.55, 0.8, 6.0))))
    return out

W = whoosh()
for i, s in enumerate(SEGS):
    if i: add(sfx, W * (0.35 if s['kind'] != 'still' else 0.2), s['t0'] - 0.15)
    for ts, d in windows(i):
        add(sfx, pencil(d) * 0.05, ts)

# ---------------------------------------------------------------- mixagem
voz = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', sys.argv[1], '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                     capture_output=True).stdout
voz = np.frombuffer(voz, np.float32).astype(np.float64)
voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]
# abaixa a música quando há fala (ducking)
def movavg(x, n):
    c = np.cumsum(np.concatenate([[0], x])); y = (c[n:] - c[:-n]) / n
    return np.pad(y, (n // 2, len(x) - len(y) - n // 2), mode='edge')
env = np.sqrt(movavg(voz ** 2, 2205))
env = movavg((env > 0.02).astype(float), SR // 3)
duck = 1 - 0.55 * np.clip(env, 0, 1)
mix = voz + music * duck * 0.5 + sfx * 1.4
r=lambda x: 20*np.log10(np.sqrt((x[60*SR:120*SR]**2).mean())+1e-9)
print('voz', r(voz), 'musica', r(music*duck*0.5), 'sfx', r(sfx*1.4), 'pico', np.abs(mix).max())
mix = np.where(np.abs(mix) > 0.85, np.sign(mix) * (0.85 + 0.12 * np.tanh((np.abs(mix) - 0.85) / 0.12)), mix)  # limitador suave
mix = mix[:int(AUDIO_END * SR)]
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', sys.argv[2]],
               input=mix.astype(np.float64).tobytes())
print('ok', len(mix) / SR)
