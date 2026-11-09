#!/usr/bin/env python3
"""Monta o vídeo final do hábito.
Vídeo gravado (embaixo) + camada animada (camada.mov, de render.js) em tela dividida 1080x1920,
com cortes de zoom a cada frase (perto/longe) e "soco" de zoom nas palavras de impacto.
O áudio vem pronto de sons/mix.wav (partitura-sons.json + misturar.py da skill sons-de-ambiente).

Uso: python3 montar.py <video-original.mov> <camada.mov>
"""
import subprocess, sys, os

F, CAMADA = sys.argv[1], sys.argv[2]
os.chdir(os.path.dirname(os.path.abspath(__file__)))
FIM = 36.45

# trechos de tela cheia (rosto) — o resto é tela dividida
CHEIA = [(0, 2.1), (32.55, 34.55)]
# começo de cada frase: o zoom alterna perto/longe a cada corte
FRASES = [2.0, 4.0, 6.2, 7.98, 10.0, 12.0, 14.0, 16.0, 17.98, 19.13, 20.0, 22.2, 24.0, 25.15, 26.4,
          27.13, 28.03, 29.13, 30.03, 31.98, 34.4, 35.15]
# "soco" de zoom (mais perto) nas palavras de impacto
SOCOS = [(1.12, 2.1), (5.95, 6.2), (11.3, 12.0), (24.0, 24.6), (27.13, 27.6), (33.9, 34.55), (35.9, FIM)]


def entre(trechos):
    return '+'.join(f'between(t,{a},{b})' for a, b in trechos) or '0'


bordas = FRASES + [FIM]
perto = [(bordas[i], bordas[i + 1]) for i in range(len(FRASES)) if i % 2 == 1]

# níveis de zoom: normal 1.0, perto 1.15, soco 1.3 (rosto no mesmo lugar nos três)
filtro = f"""
[0:v]setpts=PTS-STARTPTS,split=6[a0][a1][a2][b0][b1][b2];
[a0]scale=1080:1920,crop=1080:960:0:360[s0];
[a1]scale=1242:2208,crop=1080:960:81:500[s1];
[a2]scale=1404:2496,crop=1080:960:162:616[s2];
[s0][s1]overlay=0:0:enable='{entre(perto)}'[s01];
[s01][s2]overlay=0:0:enable='{entre(SOCOS)}'[sp];
[sp]pad=1080:1920:0:960:black[spc];
[b0]scale=1080:1920[c0];
[b1]scale=1242:2208,crop=1080:1920:81:128[c1];
[b2]scale=1404:2496,crop=1080:1920:162:256[c2];
[c0][c1]overlay=0:0:enable='between(t,32.55,33.9)'[c01];
[c01][c2]overlay=0:0:enable='{entre(SOCOS)}'[full];
[spc][full]overlay=0:0:enable='{entre(CHEIA)}'[base];
[base][1:v]overlay=0:0,format=yuv420p[v]
""".replace('\n', '')

subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', F, '-i', CAMADA, '-i', 'sons/mix.wav',
                '-filter_complex', filtro, '-map', '[v]', '-map', '2:a',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-r', '30',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', str(FIM),
                'habito-trilha-tiktok.mp4'], check=True)
print('ok habito-trilha-tiktok.mp4')
