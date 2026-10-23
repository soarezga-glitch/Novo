# Música original da abertura OS SOBREVIVENTES (15 s): PIANO dramático e melancólico em primeiro plano (lá menor),
# baixo em oitavas, cordas e drone discretos por baixo, batidas suaves nos cortes e batida forte no logo (12,25 s).
import numpy as np, subprocess, wave
SR = 44100; DUR = 15.0; LOGO = 12.25; CORTES = [0.0, 2.45, 4.6, 6.8, 8.8, 10.4]
N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(21)
f = lambda n: 440 * 2 ** ((n - 69) / 12)
def put(s, t0, pan=0.0):
    n0 = int(t0 * SR); n1 = min(N, n0 + len(s)); s = s[:n1 - n0]; L[n0:n1] += s * (1 - pan * 0.6); R[n0:n1] += s * (1 + pan * 0.6)
def piano(n, t0, vol=0.3, d=4.0, pan=0.0):
    t = np.arange(int(d * SR)) / SR; fr = f(n); B = 0.00012 * (n / 60) ** 2
    s = sum(np.sin(2 * np.pi * fr * k * np.sqrt(1 + B * k * k) * t + k) * np.exp(-t * (0.6 + k * 0.55 + n / 120)) / k ** 1.15 for k in range(1, 10))
    s += 0.25 * np.sin(2 * np.pi * fr * 1.002 * t) * np.exp(-t * 0.9)                      # segunda corda levemente desafinada
    s += rng.normal(0, 1, len(t)) * np.exp(-t * 120) * 0.08                                  # martelo
    put(s * vol * np.clip(t / 0.003, 0, 1), t0, pan)
def corda(n, t0, d, vol, pan=0.0):
    t = np.arange(int((d + 0.8) * SR)) / SR; fr = f(n) * (1 + 0.003 * np.sin(2 * np.pi * 5 * t)); ph = 2 * np.pi * np.cumsum(fr) / SR
    s = sum(np.sin(k * ph + rng.uniform(0, 6)) / k * 0.85 ** k for k in range(1, 9)); env = np.clip(t / 1.0, 0, 1) * np.where(t < d, 1, np.exp(-(t - d) / 0.4)); put(s * env * vol, t0, pan)
def boom(t0, vol=1.0, nota=28):
    t = np.arange(int(3.5 * SR)) / SR; fr = f(nota) * (1 + 1.0 * np.exp(-t * 16)); ph = 2 * np.pi * np.cumsum(fr) / SR
    put((np.sin(ph) * np.exp(-t * 1.3) + rng.normal(0, 1, len(t)) * np.exp(-t * 30) * 0.3) * vol, t0)
def drone(t0, t1, n, vol):
    t = np.arange(int((t1 - t0) * SR)) / SR; s = sum(np.sin(2 * np.pi * f(n) * k * t * (1 + 0.0006 * k)) / k for k in range(1, 6)); put(s * np.clip(t / 0.05, 0, 1) * np.clip((t1 - t0 - t) / 1.0, 0, 1) * vol, t0)
def reverso(t1, d=1.6, vol=0.3):
    n = int(d * SR); t = np.arange(n) / SR; s = np.convolve(rng.normal(0, 1, n), np.ones(8) / 8, 'same') * (t / d) ** 3; put(s * vol, t1 - d)
# harmonia: lá m – fá – dó – sol – lá m – fá → mi (tensão) → lá m (logo)
ACORDES = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62]), (45, [57, 60, 64]), (41, [57, 60, 65])]
MELODIA = [[76, 74, 72, 71], [72, 69, 67, 69], [67, 64, 67, 72], [71, 67, 62, 74], [76, 74, 72, 71], [72, 77, 76, 74, 71]]
drone(0, DUR, 33, 0.07)
for i, t0 in enumerate(CORTES):
    t1 = CORTES[i + 1] if i + 1 < len(CORTES) else LOGO; baixo, acorde = ACORDES[i]; forte = 1.0 if i == 0 else 0.8 + i * 0.05
    piano(baixo - 12, t0, 0.55 * forte, 4.5, -0.2); piano(baixo, t0, 0.42 * forte, 4.5, -0.2)                 # baixo em oitava (mão esquerda)
    for k, n in enumerate(acorde): piano(n, t0 + 0.02 * k, 0.26 * forte, 4.0, 0.1)                           # acorde
    mel = MELODIA[i]; passo = (t1 - t0 - 0.25) / len(mel)
    for k, n in enumerate(mel): piano(n, t0 + 0.25 + k * passo, (0.42 if k == 0 else 0.34) * forte, 3.5, 0.25)   # melodia (mão direita)
    corda(baixo + 12, t0, t1 - t0, 0.035 + i * 0.008, -0.3); corda(acorde[-1], t0, t1 - t0, 0.025 + i * 0.006, 0.3)
    boom(t0, 0.5 if i else 1.0)
for k, n in enumerate([52, 56, 59, 64]): piano(n, 11.2 + k * 0.22, 0.32, 2.5, 0.2)                            # mi maior subindo (tensão antes do logo)
reverso(LOGO, 1.6, 0.35)
boom(LOGO, 1.5, 26)
for n in [33, 45, 57, 60, 64, 69]: piano(n, LOGO, 0.5 if n < 50 else 0.36, 3.0)                                # lá menor cheio no logo
for n in [45, 52, 57]: corda(n, LOGO, DUR - LOGO - 0.6, 0.08)
st = np.stack([L, R], 1); st /= np.abs(st).max() * 1.05; st *= np.clip((DUR - np.arange(N) / SR) / 0.7, 0, 1)[:, None]
with wave.open('musica_seca.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'musica_seca.wav', '-af', 'aecho=0.85:0.6:45|95|160:0.32|0.24|0.16,highpass=f=30,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=120,loudnorm=I=-9:TP=-1', '-ar', '48000', 'musica.wav'], check=True)
print('ok')
