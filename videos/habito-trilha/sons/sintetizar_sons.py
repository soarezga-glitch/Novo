#!/usr/bin/env python3
"""Sons próprios do vídeo do hábito (sintetizados, sem internet):
sino.wav (ding do gatilho), soco.wav (luva), trilha.wav (batida de fundo 96 BPM), riser_fim.wav (fim do riser)."""
import numpy as np, subprocess, os
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000
D = os.path.dirname(os.path.abspath(__file__))
r = np.random.default_rng(5)

def salvar(nome, x, pico=-3):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (pico / 20)
    if x.ndim == 1: x = np.stack([x, x], 1)
    wavfile.write(os.path.join(D, nome), SR, (x * 32767).astype(np.int16))

def lp(x, f): return sosfilt(butter(4, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(4, f, 'high', fs=SR, output='sos'), x)
def t_(d): return np.arange(int(d * SR)) / SR

# sino: parciais inarmônicas com decaimento longo
t = t_(2.2)
sino = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in [(880, 1, 2.2), (1760, .5, 3), (2340, .35, 4), (3120, .2, 5.5), (440, .3, 1.8)])
sino *= np.minimum(1, t / 0.003)
salvar('sino.wav', sino)

# soco: baque grave + estalo
t = t_(0.35)
soco = np.sin(2 * np.pi * (140 * np.exp(-t * 12) + 45) * t) * np.exp(-t * 14) + 0.5 * hp(r.standard_normal(len(t)), 1500) * np.exp(-t * 60)
salvar('soco.wav', soco, -2)

# trilha de fundo: 96 BPM, Am F C G, pad + baixo + kick + palma + chimbal
BPM = 96; b = 60 / BPM; DUR = 37.0; N = int(DUR * SR)
mix = np.zeros(N)
def notas(m): return 440 * 2 ** ((m - 69) / 12)
acordes = [(57, [69, 72, 76]), (53, [65, 69, 72]), (48, [64, 67, 72]), (55, [67, 71, 74])]
compasso = 4 * b
for c in range(int(DUR / compasso) + 1):
    raiz, ac = acordes[c % 4]; i0 = int(c * compasso * SR); n = int(compasso * SR)
    if i0 >= N: break
    n = min(n, N - i0); tt = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * notas(m) * tt + 0.3 * np.sin(2 * np.pi * 0.4 * tt)) for m in ac) / 3
    pad *= np.minimum(1, tt / 0.3) * np.minimum(1, (compasso - tt) / 0.3)
    baixo = np.zeros(n)
    for k in range(8):
        j = int(k * b / 2 * SR)
        if j >= n: break
        m = min(n - j, int(b / 2 * SR)); tb = np.arange(m) / SR
        baixo[j:j + m] += np.tanh(2 * np.sin(2 * np.pi * notas(raiz - 12) * tb)) * np.exp(-tb * 5)
    mix[i0:i0 + n] += 0.35 * pad + 0.45 * lp(baixo, 600)
batidas = int(DUR / b)
for k in range(batidas):
    i = int(k * b * SR)
    if k % 4 in (0, 2):
        m = min(N - i, int(0.3 * SR)); tt = np.arange(m) / SR
        mix[i:i + m] += 1.0 * np.sin(2 * np.pi * (120 * np.exp(-tt * 20) + 48) * tt) * np.exp(-tt * 9)
    if k % 4 in (1, 3):
        m = min(N - i, int(0.2 * SR)); tt = np.arange(m) / SR
        mix[i:i + m] += 0.35 * hp(r.standard_normal(m), 900) * np.exp(-tt * 22)
    for h in (0, 0.5):
        j = int((k + h) * b * SR); m = min(N - j, int(0.05 * SR))
        if m > 0: mix[j:j + m] += 0.12 * hp(r.standard_normal(m), 7000) * np.exp(-np.arange(m) / SR * 80)
salvar('trilha.wav', mix, -6)

# fim do riser da biblioteca (últimos 2,2 s), para subir até "o segredo"
src = os.path.join(D, '../../../.claude/skills/sons-de-ambiente/biblioteca/ui/riser.mp3')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-2.3', '-i', src, '-af', 'afade=t=in:d=0.4', os.path.join(D, 'riser_fim.wav')], check=True)
print('ok')
