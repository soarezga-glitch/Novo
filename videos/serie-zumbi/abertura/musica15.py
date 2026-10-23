# Música da abertura (original): ostinato de cordas graves em lá menor, violino agudo subindo, tímpanos, crescendo e batida final.
import numpy as np, subprocess, wave
SR = 44100; BPM = 82; B = 60 / BPM; DUR = 15.0; TIT = 16 * B
N = int(SR * DUR); L = np.zeros(N); Rr = np.zeros(N)
rng = np.random.default_rng(7)
f = lambda n: 440 * 2 ** ((n - 69) / 12)            # nota MIDI → Hz
def corda(nota, t0, d, vol, brilho=10, ataque=0.03, pan=0.0, vib=5.0):
    n0, n1 = int(t0 * SR), min(N, int((t0 + d + 0.25) * SR)); t = np.arange(n1 - n0) / SR
    fr = f(nota) * (1 + 0.004 * np.sin(2 * np.pi * vib * t) * np.clip(t / 0.4, 0, 1))
    ph = 2 * np.pi * np.cumsum(fr) / SR; s = np.zeros_like(t)
    for k in range(1, brilho + 1): s += np.sin(k * ph + rng.uniform(0, 6)) / k * (0.9 ** k)
    s += 0.5 * np.sin(ph * 1.003) * 0.6                 # leve desafinação = naipe
    env = np.clip(t / ataque, 0, 1) * np.where(t < d, 1, np.exp(-(t - d) / 0.12))
    s *= env * vol; L[n0:n1] += s * (1 - pan) ; Rr[n0:n1] += s * (1 + pan)
def timpano(t0, vol=1.0, nota=33):
    n0 = int(t0 * SR); n1 = min(N, n0 + int(2.2 * SR)); t = np.arange(n1 - n0) / SR
    fr = f(nota) * (1 + 0.5 * np.exp(-t * 30)); ph = 2 * np.pi * np.cumsum(fr) / SR
    s = (np.sin(ph) + 0.3 * np.sin(1.5 * ph)) * np.exp(-t * 2.2) + rng.normal(0, 1, len(t)) * np.exp(-t * 40) * 0.3
    s *= vol; L[n0:n1] += s; Rr[n0:n1] += s
def prato_reverso(t1, d=2.0, vol=0.35):
    n0 = int((t1 - d) * SR); n1 = int(t1 * SR); t = np.arange(n1 - n0) / SR
    s = rng.normal(0, 1, len(t)); s = np.convolve(s, [1, -0.6], 'same') * (t / d) ** 3 * vol; L[n0:n1] += s; Rr[n0:n1] += s
def drone(t0, t1, nota, vol):
    n0, n1 = int(t0 * SR), int(t1 * SR); t = np.arange(n1 - n0) / SR
    s = sum(np.sin(2 * np.pi * f(nota) * k * t * (1 + 0.0007 * k)) / k for k in range(1, 6))
    env = np.clip(t / 2.5, 0, 1) * np.clip((t1 - t0 - t) / 1.0, 0, 1); s *= env * vol; L[n0:n1] += s; Rr[n0:n1] += s
drone(0, DUR - 0.3, 33, 0.22)
timpano(0.0, 1.3, 28); prato_reverso(0.05, 0.05, 0.0)
motivo = [45, 45, 48, 45, 45, 45, 47, 45, 45, 45, 48, 45, 45, 45, 44, 45]
t = 0.0
while t < TIT - 0.01:
    for i, n in enumerate(motivo):
        tt = t + i * B / 2
        if tt >= TIT - 0.05: break
        cres = 0.8 + 0.2 * tt / TIT
        corda(n, tt, B / 2 * 0.8, 0.26 * cres, brilho=10, ataque=0.012, pan=-0.3)
        corda(n + 12, tt, B / 2 * 0.7, 0.14 * cres, brilho=8, ataque=0.012, pan=0.3)
    timpano(t, 0.75); timpano(t + 4 * B, 0.5)
    t += 8 * B
for k, n in enumerate([76, 77, 79, 81]):
    corda(n, 0.2 + k * 2.9, 2.8, 0.09 + k * 0.015, brilho=6, ataque=0.25, pan=0.2, vib=6)
prato_reverso(TIT, 1.8, 0.4)
timpano(TIT, 1.7, 28); timpano(TIT, 1.0, 33)
for n in [33, 45, 48, 52]: corda(n, TIT, DUR - TIT - 0.4, 0.17, brilho=10, ataque=0.01)
corda(81, TIT + 0.05, DUR - TIT - 0.5, 0.06, brilho=5, ataque=0.3)
mx = max(np.abs(L).max(), np.abs(Rr).max()); st = np.stack([L, Rr], 1) / mx * 0.9
fade = np.clip((DUR - np.arange(N) / SR) / 0.9, 0, 1); st *= fade[:, None]
with wave.open('musica15_seca.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'musica15_seca.wav', '-af', 'aecho=0.8:0.6:60|110|170:0.35|0.25|0.18,highpass=f=30,lowpass=f=9000,loudnorm=I=-12:TP=-1', '-ar', '48000', 'musica15.wav'], check=True)
print('ok')
