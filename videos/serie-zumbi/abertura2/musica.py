# Música original da abertura OS SOBREVIVENTES (15 s): começa forte (batida + drone + vento), piano melancólico em lá menor,
# cordas graves crescendo e batida final no logo (11,6 s). Skill os-sobreviventes §12.
import numpy as np, subprocess, wave
SR = 44100; DUR = 15.0; LOGO = 11.6
N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(11)
f = lambda n: 440 * 2 ** ((n - 69) / 12)
def put(s, t0, pan=0.0):
    n0 = int(t0 * SR); n1 = min(N, n0 + len(s)); s = s[:n1 - n0]; L[n0:n1] += s * (1 - pan); R[n0:n1] += s * (1 + pan)
def piano(n, t0, vol=0.3, d=3.0, pan=0.0):
    t = np.arange(int(d * SR)) / SR; fr = f(n)
    s = sum(np.sin(2 * np.pi * fr * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (1.2 + k * 0.9)) / k ** 1.3 for k in range(1, 8))
    s += rng.normal(0, 1, len(t)) * np.exp(-t * 90) * 0.05
    put(s * vol * np.clip(t / 0.004, 0, 1), t0, pan)
def corda(n, t0, d, vol, ataque=0.8, pan=0.0):
    t = np.arange(int((d + 0.6) * SR)) / SR; fr = f(n) * (1 + 0.003 * np.sin(2 * np.pi * 5.2 * t))
    ph = 2 * np.pi * np.cumsum(fr) / SR; s = sum(np.sin(k * ph + rng.uniform(0, 6)) / k * 0.88 ** k for k in range(1, 10))
    env = np.clip(t / ataque, 0, 1) * np.where(t < d, 1, np.exp(-(t - d) / 0.25)); put(s * env * vol, t0, pan)
def boom(t0, vol=1.0):
    t = np.arange(int(3.5 * SR)) / SR; fr = 42 * (1 + 1.2 * np.exp(-t * 18)); ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sin(ph) * np.exp(-t * 1.4) + 0.5 * np.sin(ph * 0.5) * np.exp(-t * 1.0) + rng.normal(0, 1, len(t)) * np.exp(-t * 25) * 0.4
    put(s * vol, t0)
def vento(t0, t1, vol):
    n = int((t1 - t0) * SR); x = rng.normal(0, 1, n); y = np.zeros(n); a = 0.0
    for i in range(0, n, 64):   # filtro passa-baixa com corte que "respira"
        c = 0.02 + 0.03 * (1 + np.sin(2 * np.pi * 0.23 * i / SR)); seg = x[i:i + 64]; o = np.empty_like(seg)
        for j, v in enumerate(seg): a += c * (v - a); o[j] = a
        y[i:i + 64] = o
    env = np.clip(np.arange(n) / SR / 0.3, 0, 1) * np.clip((t1 - t0 - np.arange(n) / SR) / 1.0, 0, 1)
    put(y / (np.abs(y).max() + 1e-9) * env * vol, t0, 0.3)
def drone(t0, t1, n, vol):
    t = np.arange(int((t1 - t0) * SR)) / SR; s = sum(np.sin(2 * np.pi * f(n) * k * t * (1 + 0.0006 * k)) / k for k in range(1, 6))
    put(s * np.clip(t / 0.05, 0, 1) * np.clip((t1 - t0 - t) / 0.8, 0, 1) * vol, t0)
def reverso(t1, d=1.6, vol=0.35):
    n = int(d * SR); t = np.arange(n) / SR; s = rng.normal(0, 1, n); s = np.convolve(s, np.ones(6) / 6, 'same') * (t / d) ** 3
    put(s * vol, t1 - d)
# começa forte
boom(0.0, 1.2); drone(0, DUR, 33, 0.16); drone(0, DUR, 40, 0.08); vento(0, DUR, 0.22)
# piano: motivo em lá menor (original), um pouco mais rápido no meio
mot = [57, 64, 69, 72, 71, 64, 67, 69, 57, 64, 69, 76, 74, 72, 71, 69]
t = 0.35
for i, n in enumerate(mot):
    if t >= LOGO - 0.2: break
    piano(n, t, 0.34 if i % 4 == 0 else 0.26, pan=-0.2 + (i % 3) * 0.2)
    if i % 4 == 0: piano(n - 24, t, 0.22)
    t += 0.72
# cordas graves crescendo (lá m – fá – ré m – mi)
for k, (a, b) in enumerate([(45, 52), (41, 48), (38, 45), (40, 47)]):
    t0 = 1.0 + k * 2.6; d = min(2.7, LOGO - t0)
    if d > 0: corda(a, t0, d, 0.09 + k * 0.03, 0.9, -0.3); corda(b, t0, d, 0.07 + k * 0.025, 0.9, 0.3)
for tt in [2.95, 5.75, 8.55]: boom(tt, 0.45)   # batidas nos cortes de cena
reverso(LOGO, 1.8, 0.45)
# logo: batida forte + acorde que fica
boom(LOGO, 1.4)
for n in [33, 45, 48, 52, 57]: corda(n, LOGO, DUR - LOGO - 0.6, 0.12, 0.02)
piano(69, LOGO + 0.05, 0.3, 3.4); piano(81, LOGO + 0.05, 0.18, 3.4)
st = np.stack([L, R], 1); st /= np.abs(st).max() * 1.1
st *= np.clip((DUR - np.arange(N) / SR) / 0.8, 0, 1)[:, None]
with wave.open('musica_seca.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
B = '/home/user/Novo/.claude/skills/sons-de-ambiente/biblioteca/'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'musica_seca.wav', '-i', B + 'hoje/sfx_gemido_2.mp3', '-i', B + 'apocalipse/sfx_porteira_range.mp3',
  '-filter_complex', '[0:a]aecho=0.8:0.55:70|130:0.3|0.2[m];[1:a]adelay=8700|8700,volume=0.45,lowpass=f=2500,aecho=0.8:0.6:90:0.4[g];[2:a]adelay=3600|3600,volume=0.25,lowpass=f=3000,aecho=0.8:0.7:120:0.4[c];[m][g][c]amix=inputs=3:normalize=0:duration=first,highpass=f=28,loudnorm=I=-11:TP=-1',
  '-ar', '48000', 'musica.wav'], check=True)
print('ok')
