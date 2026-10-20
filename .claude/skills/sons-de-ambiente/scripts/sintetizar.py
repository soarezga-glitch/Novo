#!/usr/bin/env python3
"""Gera a biblioteca de sons de ambiente e efeitos (skill "sons-de-ambiente").

Uso:
    python3 sintetizar.py --saida biblioteca/ [--voz narracao.mp3] [--seed 7]

Tudo é sintetizado (numpy/scipy) — sem download. A multidão ("walla") é feita picando,
mudando o tom e invertendo trechos de uma voz (--voz), até virar burburinho sem palavras.
Sem --voz, a multidão usa ruído com formantes (menos realista).

Saída: WAV 48 kHz estéreo. Loops (amb_*) têm 24 s e emendam sem clique; efeitos (sfx_*) são curtos.
"""
import argparse, os, subprocess, json
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000


def rng_for(seed):
    return np.random.default_rng(seed)


# ---------------------------------------------------------------- utilidades
def ruido(n, cor, r):
    """branco / rosa / marrom"""
    w = r.standard_normal(n)
    if cor == 'branco':
        return w
    if cor == 'marrom':
        x = np.cumsum(w)
        x = signal.lfilter([1], [1, -0.995], w)
        return x / (np.abs(x).max() + 1e-9)
    # rosa (filtro de Paul Kellet)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
    a = [1, -2.494956002, 2.017265875, -0.522189400]
    x = signal.lfilter(b, a, w)
    return x / (np.abs(x).max() + 1e-9)


def filtro(x, tipo, f, ordem=4):
    if tipo == 'banda':
        sos = signal.butter(ordem, [f[0] / (SR / 2), f[1] / (SR / 2)], btype='band', output='sos')
    else:
        sos = signal.butter(ordem, f / (SR / 2), btype='low' if tipo == 'baixa' else 'high', output='sos')
    return signal.sosfilt(sos, x)


def env(n, ataque, queda):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(ataque, 1e-4)) * np.exp(-t / max(queda, 1e-4))
    return e


def reverb(x, sala=0.5, mistura=0.3):
    """Schroeder simples: 4 combs em paralelo + 2 allpass."""
    out = np.zeros_like(x)
    for d, g in [(1557, .84), (1617, .83), (1491, .82), (1422, .81)]:
        d = int(d * (0.6 + sala))
        b = np.zeros(d + 1); b[0] = 1
        a = np.zeros(d + 1); a[0] = 1; a[d] = -g * (0.7 + 0.3 * sala)
        out += signal.lfilter(b, a, x)
    for d, g in [(225, .5), (556, .5)]:
        b = np.zeros(d + 1); b[0] = -g; b[d] = 1
        a = np.zeros(d + 1); a[0] = 1; a[d] = -g
        out = signal.lfilter(b, a, out)
    out = out / (np.abs(out).max() + 1e-9) * np.abs(x).max()
    return (1 - mistura) * x + mistura * out


def loop_suave(x, xf=1.0):
    """emenda o fim no começo com crossfade (loop sem clique)"""
    n = int(xf * SR)
    a = x[:-n].copy()
    fade = np.linspace(0, 1, n)
    a[:n] = a[:n] * fade + x[-n:] * (1 - fade)
    return a


def estereo(x, r, largura=0.25):
    """estéreo com leve descorrelação (atraso + ruído de fase)"""
    d = int(0.011 * SR)
    l = x
    rr = np.concatenate([x[d:], x[:d]])
    rr = (1 - largura) * x + largura * rr
    return np.stack([l, rr], axis=1)


def normaliza(x, pico_db=-3):
    m = np.abs(x).max() + 1e-9
    return x / m * 10 ** (pico_db / 20)


def salvar(caminho, x):
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    wavfile.write(caminho, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))


# ---------------------------------------------------------------- elementos
def walla(dur, r, voz=None, densidade=14, tom=(0.82, 1.18), abafar=1900, sala=0.6):
    """burburinho de multidão: muitos pedaços de fala, com tom mudado e invertidos"""
    n = int(dur * SR)
    out = np.zeros(n)
    if voz is None:
        # sem voz: ruído com formantes moduladas
        for k in range(densidade):
            base = filtro(ruido(n, 'rosa', r), 'banda', (300 + 90 * k % 600, 1200 + 70 * k % 900))
            am = filtro(np.abs(r.standard_normal(n)), 'baixa', 4)
            out += base * am / (np.abs(am).max() + 1e-9)
    else:
        pos = 0
        while pos < n:
            for _ in range(densidade):
                L = int(r.uniform(0.35, 1.3) * SR)
                ini = r.integers(0, len(voz) - L)
                pedaco = voz[ini:ini + L].copy()
                fator = r.uniform(*tom)
                pedaco = signal.resample(pedaco, int(L / fator))
                if r.random() < 0.45:
                    pedaco = pedaco[::-1]
                pedaco *= np.hanning(len(pedaco)) * r.uniform(0.3, 1.0)
                at = pos + r.integers(0, int(1.2 * SR))
                fim = min(n, at + len(pedaco))
                if at < n:
                    out[at:fim] += pedaco[:fim - at]
            pos += int(1.0 * SR)
    out = filtro(filtro(out, 'baixa', abafar), 'alta', 180)
    out = reverb(out, sala, 0.45)
    return normaliza(out, -6)


def passaros(dur, r, quantos=10):
    n = int(dur * SR); out = np.zeros(n)
    for _ in range(quantos):
        t0 = r.uniform(0, dur - 1)
        f0 = r.uniform(2600, 4800)
        for k in range(r.integers(2, 6)):
            L = int(r.uniform(0.05, 0.14) * SR)
            t = np.arange(L) / SR
            f = f0 * (1 + r.uniform(-0.25, 0.35) * np.sin(np.pi * t / t[-1]))
            ph = 2 * np.pi * np.cumsum(f) / SR
            s = np.sin(ph) * np.sin(np.pi * t / t[-1]) ** 2
            at = int((t0 + k * r.uniform(0.09, 0.2)) * SR)
            if at + L < n:
                out[at:at + L] += s * r.uniform(0.3, 1)
    return normaliza(reverb(out, 0.9, 0.3), -8)


def grilos(dur, r):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n)
    for k in range(5):
        f = r.uniform(4200, 5200); ritmo = r.uniform(2.2, 3.4); fase = r.uniform(0, 1)
        trem = (np.sin(2 * np.pi * 30 * t) > 0).astype(float)          # pulsos rápidos
        frase = ((t * ritmo + fase) % 1 < 0.22).astype(float)            # frases
        frase = filtro(frase, 'baixa', 60)
        out += np.sin(2 * np.pi * f * t) * trem * frase * r.uniform(0.4, 1)
    return normaliza(reverb(out, 1.0, 0.4), -10)


def vento(dur, r, intensidade=1.0):
    n = int(dur * SR)
    x = filtro(ruido(n, 'rosa', r), 'banda', (120, 900))
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * np.arange(n) / SR / r.uniform(5, 9) + r.uniform(0, 6))
    return normaliza(x * lfo * intensidade, -8)


def tom_sala(dur, r):
    n = int(dur * SR)
    return normaliza(filtro(ruido(n, 'marrom', r), 'baixa', 260), -12)


def agua_corrente(dur, r, forte=1.0):
    n = int(dur * SR)
    x = filtro(ruido(n, 'rosa', r), 'banda', (350, 6500))
    gotas = np.zeros(n)
    for _ in range(int(dur * 60 * forte)):
        at = r.integers(0, n - 2000); L = r.integers(300, 1200)
        f = r.uniform(600, 2400)
        t = np.arange(L) / SR
        gotas[at:at + L] += np.sin(2 * np.pi * f * (1 + 3 * t) * t) * np.exp(-t * 60) * r.uniform(0.2, 0.8)
    am = 0.75 + 0.25 * filtro(r.standard_normal(n), 'baixa', 3) * 8
    return normaliza((x * am + 0.6 * gotas), -7)


def fogo(dur, r, forte=1.0):
    n = int(dur * SR)
    ronco = filtro(ruido(n, 'marrom', r), 'baixa', 500)
    ronco *= 0.7 + 0.3 * filtro(r.standard_normal(n), 'baixa', 2) * 6
    estalos = np.zeros(n)
    for _ in range(int(dur * 38 * forte)):
        at = r.integers(0, n - 3000); L = r.integers(80, 900)
        clique = r.standard_normal(L) * np.exp(-np.arange(L) / (L / 5))
        estalos[at:at + L] += filtro(clique, 'alta', 1800, 2) * r.uniform(0.2, 1.0) ** 2
    return normaliza(0.8 * ronco + 0.9 * estalos * forte, -5)


def batida_coracao(dur, r, bpm=110):
    n = int(dur * SR); out = np.zeros(n); per = 60 / bpm
    t = 0.2
    while t < dur - 0.4:
        for dt, a in [(0, 1), (0.16, 0.7)]:
            at = int((t + dt) * SR); L = int(0.18 * SR); tt = np.arange(L) / SR
            if at + L < n:
                out[at:at + L] += np.sin(2 * np.pi * 52 * tt) * np.exp(-tt * 22) * a
        t += per
    return normaliza(out, -6)


# ---------------------------------------------------------------- efeitos curtos
def passo(r, piso='pedra'):
    L = int(0.16 * SR)
    x = r.standard_normal(L) * env(L, 0.002, 0.03 if piso == 'pedra' else 0.045)
    if piso == 'pedra':
        x = filtro(x, 'banda', (250, 3500)) + 0.4 * filtro(x, 'banda', (2500, 7000))
    elif piso == 'madeira':
        t = np.arange(L) / SR
        x = filtro(x, 'banda', (120, 1400)) + 0.8 * np.sin(2 * np.pi * 95 * t) * np.exp(-t * 35)
    else:  # terra
        x = filtro(x, 'banda', (150, 1800))
    return normaliza(x, -3)


def moeda(r):
    L = int(0.9 * SR); t = np.arange(L) / SR; x = np.zeros(L)
    for k, dt in enumerate([0, 0.11, 0.19]):
        at = int(dt * SR)
        for f, d in [(2140, 9), (3420, 13), (5710, 18), (7900, 25)]:
            seg = np.sin(2 * np.pi * f * r.uniform(0.98, 1.02) * t[:L - at]) * np.exp(-t[:L - at] * d)
            x[at:] += seg * (0.7 ** k)
    return normaliza(reverb(x, 0.3, 0.2), -4)


def splash(r):
    L = int(1.2 * SR); t = np.arange(L) / SR
    corpo = filtro(r.standard_normal(L), 'baixa', 1400) * np.exp(-t * 5)
    glub = np.sin(2 * np.pi * (180 - 90 * t) * t) * np.exp(-t * 7) * 0.8
    respingos = filtro(r.standard_normal(L), 'alta', 2500) * np.exp(-t * 14) * 0.5
    return normaliza(corpo + glub + respingos, -2)


def baque_madeira(r):
    L = int(0.5 * SR); t = np.arange(L) / SR
    x = np.sin(2 * np.pi * 140 * t) * np.exp(-t * 18) + filtro(r.standard_normal(L), 'banda', (200, 1500)) * np.exp(-t * 30) * 0.6
    return normaliza(x, -3)


def rugido_fogo(r):
    """o fogo 'acendendo' de uma vez: subida de ruído + estalos"""
    L = int(2.5 * SR); t = np.arange(L) / SR
    x = filtro(ruido(L, 'marrom', r), 'baixa', 900) * np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 0.6) * 1.6)
    return normaliza(x + 0.5 * fogo(2.5, r, 1.6) * np.exp(-t * 0.8), -1)


def respiracao_ofegante(r, dur=4.0):
    n = int(dur * SR); out = np.zeros(n); t = 0.0
    while t < dur - 0.5:
        for k, (L, f) in enumerate([(0.22, (500, 2500)), (0.3, (300, 1800))]):
            at = int((t + k * 0.24) * SR); m = int(L * SR)
            if at + m < n:
                out[at:at + m] += filtro(r.standard_normal(m), 'banda', f) * np.hanning(m) * (0.8 if k == 0 else 0.6)
        t += 0.55
    return normaliza(out, -6)


# ---------------------------------------------------------------- ambientes prontos (loops)
def ambientes(r, voz):
    D = 25
    def mix(*partes):
        n = int(D * SR); x = np.zeros(n)
        for p, g in partes:
            x += p[:n] * 10 ** (g / 20)
        return loop_suave(normaliza(x, -4))
    w = lambda **k: walla(D, r, voz, **k)
    return {
        'amb_quarto':     mix((tom_sala(D, r), -2), (w(densidade=6, abafar=700, sala=0.9), -16), (passaros(D, r, 4), -22)),
        'amb_rua':        mix((w(densidade=12, abafar=2200, sala=0.5), -4), (passaros(D, r, 10), -10), (vento(D, r), -16)),
        'amb_mercado':    mix((w(densidade=22, abafar=2600, sala=0.4), -2), (tom_sala(D, r), -14), (passaros(D, r, 3), -18)),
        'amb_praca_fonte':mix((agua_corrente(D, r), -3), (w(densidade=8, abafar=2000, sala=0.6), -10), (passaros(D, r, 10), -12)),
        'amb_latrina':    mix((reverb(agua_corrente(D, r, 0.4), 0.9, 0.5), -4), (w(densidade=6, abafar=1500, sala=0.95), -10)),
        'amb_escada':     mix((tom_sala(D, r), -4), (w(densidade=5, abafar=600, sala=0.95), -14)),
        'amb_noite':      mix((grilos(D, r), -4), (vento(D, r, 0.7), -12), (tom_sala(D, r), -16)),
        'amb_fogo':       mix((fogo(D, r, 1.3), -2), (w(densidade=16, tom=(1.05, 1.4), abafar=2600, sala=0.5), -6)),
        'amb_fuga':       mix((fogo(D, r, 0.8), -10), (batida_coracao(D, r, 118), -4), (tom_sala(D, r), -12)),
        'amb_amanhecer':  mix((passaros(D, r, 26), -1), (vento(D, r, 0.6), -14), (fogo(D, r, 0.2), -24)),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--saida', default='biblioteca')
    ap.add_argument('--voz', default=None, help='arquivo de voz para fazer a multidão (walla)')
    ap.add_argument('--seed', type=int, default=7)
    a = ap.parse_args()
    os.makedirs(a.saida, exist_ok=True)
    r = rng_for(a.seed)
    voz = None
    if a.voz:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.voz, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
        voz = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    feitos = []
    for nome, x in ambientes(r, voz).items():
        salvar(os.path.join(a.saida, nome + '.wav'), estereo(x, r)); feitos.append(nome)
    efeitos = {
        'sfx_passo_pedra': [passo(r, 'pedra') for _ in range(4)],
        'sfx_passo_madeira': [passo(r, 'madeira') for _ in range(4)],
        'sfx_moeda': [moeda(r)], 'sfx_splash': [splash(r)], 'sfx_baque_madeira': [baque_madeira(r)],
        'sfx_rugido_fogo': [rugido_fogo(r)], 'sfx_ofegante': [respiracao_ofegante(r)],
    }
    for nome, lista in efeitos.items():
        for i, x in enumerate(lista):
            arq = nome + (f'_{i + 1}' if len(lista) > 1 else '')
            salvar(os.path.join(a.saida, arq + '.wav'), x); feitos.append(arq)
    print(json.dumps({'gerados': feitos}, ensure_ascii=False))


if __name__ == '__main__':
    main()
