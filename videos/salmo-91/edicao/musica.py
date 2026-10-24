"""Calm ambient piano + string pad bed, generated from scratch.

usage: python3 -I musica.py OUT.wav SECONDS
"""
import sys, numpy as np, subprocess
from scipy.signal import fftconvolve, butter, sosfilt

SR = 44100
DUR = float(sys.argv[2])
N = int(DUR * SR) + SR * 6
rng = np.random.default_rng(91)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# D major, slow and peaceful: D - Bm - G - A / G - D - Em - A
D, Bm, G, A, Em = [50, 54, 57], [47, 50, 54], [43, 47, 50], [45, 49, 52], [40, 43, 47]
prog = [D, Bm, G, A, G, D, Em, A]
CH = 8.0  # seconds per chord

pad = np.zeros(N, np.float32)
piano = np.zeros(N, np.float32)

def env_adsr(n, a, r):
    e = np.ones(n, np.float32)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e

# string pad: each chord voiced in two octaves, soft detuned sines with slow swell
t_chord = 0.0; k = 0
while t_chord < DUR + CH:
    chord = prog[k % len(prog)]
    n = int((CH + 3.0) * SR); t = np.arange(n) / SR
    s = np.zeros(n, np.float32)
    for m in chord + [chord[0] + 12, chord[1] + 12]:
        for det in (-0.12, 0.0, 0.12):
            f = hz(m + det)
            s += (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) * 0.5).astype(np.float32)
    s += 0.6 * np.sin(2 * np.pi * hz(chord[0] - 12) * t).astype(np.float32)  # soft bass
    s *= env_adsr(n, 2.5, 3.5) * (1 + 0.08 * np.sin(2 * np.pi * 0.15 * t))
    i0 = int(t_chord * SR)
    seg = pad[i0:i0 + n]; seg += s[:len(seg)] * 0.035
    t_chord += CH; k += 1

# piano: sparse gentle arpeggio notes from the current chord
def piano_note(f, dur, vel):
    n = int(dur * SR); t = np.arange(n) / SR
    tone = np.zeros(n, np.float32)
    for h, amp, dec in [(1, 1.0, 1.6), (2, 0.45, 1.1), (3, 0.18, 0.8), (4, 0.08, 0.6)]:
        tone += amp * np.sin(2 * np.pi * f * h * t) * np.exp(-t / dec * (1 + 0.15 * h))
    att = np.minimum(1, t / 0.006)
    return (tone * att * vel).astype(np.float32)

t = 1.5
while t < DUR:
    chord = prog[int(t // CH) % len(prog)]
    pool = [m + 12 for m in chord] + [m + 24 for m in chord[:2]]
    m = pool[rng.integers(len(pool))]
    vel = rng.uniform(0.05, 0.09)
    note = piano_note(hz(m), 4.0, vel)
    i0 = int(t * SR); seg = piano[i0:i0 + len(note)]; seg += note[:len(seg)]
    if rng.random() < 0.25:  # occasional soft second voice
        m2 = chord[rng.integers(3)] + 12
        n2 = piano_note(hz(m2), 4.0, vel * 0.6)
        i1 = i0 + int(0.35 * SR); seg2 = piano[i1:i1 + len(n2)]; seg2 += n2[:len(seg2)]
    t += rng.choice([1.6, 2.0, 2.4, 3.2])

mix = pad + piano
# reverb: decaying filtered noise impulse response
ir_n = int(3.0 * SR); it = np.arange(ir_n) / SR
ir = (rng.normal(0, 1, ir_n) * np.exp(-it / 0.9)).astype(np.float32)
ir = sosfilt(butter(2, 4000, 'low', fs=SR, output='sos'), ir).astype(np.float32)
ir /= np.abs(ir).sum() / 6
wet = fftconvolve(mix, ir)[:N].astype(np.float32)
out = 0.6 * mix + 0.4 * wet
out = sosfilt(butter(2, 6500, 'low', fs=SR, output='sos'), out).astype(np.float32)
out = out[:int(DUR * SR)]
fade = int(4 * SR); out[:fade] *= np.linspace(0, 1, fade); out[-fade:] *= np.linspace(1, 0, fade)
out /= np.abs(out).max() / 0.8
pcm = (out * 32767).astype(np.int16).tobytes()
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-',
                '-c:a', 'pcm_s16le', sys.argv[1]], input=pcm, check=True)
print('ok', sys.argv[1], DUR)
