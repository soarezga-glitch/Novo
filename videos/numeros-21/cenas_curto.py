"""Reel vertical (até 1 min) de Números 21 para o Facebook, com trechos da narração completa.

uso:
  python3 -I cenas_curto.py                         -> audio/narracao_curta.wav + legendas
  CENAS=cenas_curto python3 -I render.py preview 0 57
  CENAS=cenas_curto python3 -I render.py parte 0 57 curto_0.mp4 && CENAS=cenas_curto python3 -I render.py final
"""
import os, json, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cenas import FOCO as _FOCO

AQUI = os.path.dirname(os.path.abspath(__file__))
TAMANHO = (1080, 1920)
W, H = TAMANHO
ABRE = 0            # começa já com imagem: o gancho tem que aparecer no primeiro quadro
VOLUME_MUSICA = 0.20
NARRACAO = os.path.join(AQUI, 'audio', 'narracao_curta.wav')
SAIDA = 'numeros21-reel.mp4'
PREFIXO_PARTES = 'curto_'
PAUSA = 0.35

# trechos da narração completa (início, fim) e a imagem de cada um
TRECHOS = [
    ((18.50, 25.55), [('ts_serpente', 'in')]),
    ((33.75, 39.85), [('ts_fariseu', 'in')]),
    ((244.80, 253.45), [('dore_praga', 'in'), ('ts_moises', 'in')]),
    ((255.48, 263.55), [('dore_serpente', 'in')]),
    ((340.60, 345.65), [('ts_serpente', 'out')]),
    ((449.35, 460.75), [('dore_cruz', 'in'), ('ts_descida', 'in')]),
    ((649.48, 653.70), [('ts_ora_so', 'in')]),
]
FINAL = 4.5          # cartão final só com música
CORRIGE = {'Fase': 'Faze', 'filho': 'Filho', 'homem': 'Homem', 'ele': 'Ele'}

# linha do tempo do Reel
CENAS, _t, _mapa = [], 0.0, []
for (a, b), imgs in TRECHOS:
    dur = b - a
    for i, (k, mov) in enumerate(imgs):
        CENAS.append((round(_t + dur * i / len(imgs), 3), k, None, mov))
    _mapa.append((a, b, _t))
    _t += dur + PAUSA
CENAS.append((round(_t - PAUSA, 3), 'ts_ora_so', None, 'out'))
FIM = round(_t - PAUSA + FINAL, 3)
FOCO = dict(_FOCO)
FOCO['ts_ora_so'] = (0.12, 0.14)


# ---------------------------------------------------------------- legenda
def palavras():
    segs = json.load(open(os.path.join(AQUI, 'audio', 'transcricao.json')))
    ws = [w for s in segs for w in s['words']]
    out = []
    for a, b, t0 in _mapa:
        for w in ws:
            if w['s'] >= a - 0.05 and w['e'] <= b + 0.05:
                txt = w['w'].strip()
                base = txt.strip('.,?!')
                if base in CORRIGE:
                    txt = txt.replace(base, CORRIGE[base])
                out.append({'t': txt, 's': w['s'] - a + t0, 'e': w['e'] - a + t0})
    # junta "-te", "-na" na palavra anterior
    res = []
    for w in out:
        if w['t'].startswith('-') and res:
            res[-1]['t'] += w['t']; res[-1]['e'] = w['e']
        else:
            res.append(w)
    return res


def grupos(ws, maxp=3):
    g, cur = [], []
    for w in ws:
        cur.append(w)
        fim_frase = w['t'][-1] in '.,?!'
        if len(cur) >= maxp or fim_frase:
            g.append(cur); cur = []
    if cur:
        g.append(cur)
    return g


F_LEG = ImageFont.truetype(os.path.join(AQUI, 'fontes', 'anton.ttf'), 96)
F_GANCHO = ImageFont.truetype(os.path.join(AQUI, 'fontes', 'anton.ttf'), 118)
F_PEQ = ImageFont.truetype(os.path.join(AQUI, 'fontes', 'cinzel.ttf'), 46)
OURO, BRANCO, PRETO = (255, 196, 40), (255, 255, 255), (10, 6, 2)
Y_LEG = int(H * 0.66)
_cache = {}


def _png_para_arr(img):
    a = np.asarray(img).astype(np.float32)
    rgb = a[..., [2, 1, 0]]; al = a[..., 3:4] / 255
    return rgb * al, al


def img_legenda(grupo, ativo):
    chave = (tuple(w['t'] for w in grupo), ativo)
    if chave not in _cache:
        img = Image.new('RGBA', (W, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
        textos = [w['t'].upper() for w in grupo]
        esp = d.textlength(' ', font=F_LEG)
        larg = sum(d.textlength(t, font=F_LEG) for t in textos) + esp * (len(textos) - 1)
        f = F_LEG
        if larg > W - 120:
            f = ImageFont.truetype(F_LEG.path, int(96 * (W - 120) / larg))
            larg = W - 120
        x = (W - larg) / 2
        for i, t in enumerate(textos):
            cor = OURO if i == ativo else BRANCO
            d.text((x, 60), t, font=f, fill=cor, stroke_width=9, stroke_fill=PRETO)
            x += d.textlength(t, font=f) + d.textlength(' ', font=f)
        if len(_cache) > 40:
            _cache.pop(next(iter(_cache)))
        _cache[chave] = _png_para_arr(img)
    return _cache[chave]


def img_texto(nome, linhas):
    """bloco de texto central (gancho e final)"""
    if nome not in _cache:
        img = Image.new('RGBA', (W, 700), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
        y = 20
        for txt, f, cor in linhas:
            w = d.textlength(txt, font=f)
            d.text(((W - w) / 2, y), txt, font=f, fill=cor, stroke_width=10 if f is not F_PEQ else 4, stroke_fill=PRETO)
            y += f.size * 1.18
        _cache[nome] = _png_para_arr(img)
    return _cache[nome]


def cola(f, arr, y, k=1.0):
    pm, a = arr
    h = pm.shape[0]
    reg = f[y:y + h]
    f[y:y + h] = reg * (1 - a * k) + pm * k
    return f


_WS = None
_GS = None


def sobrepor(t, f):
    global _WS, _GS
    if _WS is None:
        _WS = palavras(); _GS = grupos(_WS)
    # gancho nos primeiros 3,2 s
    if t < 3.4:
        k = 1.0 if t < 2.9 else max(0.0, (3.4 - t) / 0.5)
        topo = np.linspace(0.75, 0, 520)[:, None, None]
        f[:520] *= (1 - topo * k)
        f = cola(f, img_texto('gancho', [('POR QUE JESUS SE', F_GANCHO, BRANCO), ('COMPAROU A UMA', F_GANCHO, BRANCO),
                                         ('SERPENTE?', F_GANCHO, OURO)]), 120, k)
    # legenda palavra por palavra
    for g in _GS:
        if g[0]['s'] - 0.05 <= t < g[-1]['e'] + 0.12:
            ativo = max(i for i, w in enumerate(g) if w['s'] - 0.05 <= t or i == 0)
            f = cola(f, img_legenda(g, ativo), Y_LEG)
            break
    # cartão final
    t_fim = FIM - FINAL
    if t >= t_fim - 0.2:
        k = min(1.0, (t - t_fim + 0.2) / 0.6)
        f *= (1 - 0.55 * k)
        f = cola(f, img_texto('final', [('VÍDEO COMPLETO', F_GANCHO, OURO), ('NO YOUTUBE', F_GANCHO, BRANCO),
                                        ('NOITES BÍBLICAS', F_PEQ, BRANCO)]), int(H * 0.36), k)
    return f


# ---------------------------------------------------------------- áudio
if __name__ == '__main__':
    src = os.path.join(AQUI, 'audio', 'narracao.mp3')
    partes = []
    for i, ((a, b), _) in enumerate(TRECHOS):
        partes.append(f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st={b - a - 0.08}:d=0.08,'
                      f'apad=pad_dur={PAUSA}[p{i}]')
    filtro = ';'.join(partes) + ';' + ''.join(f'[p{i}]' for i in range(len(TRECHOS))) + \
        f'concat=n={len(TRECHOS)}:v=0:a=1[a]'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-filter_complex', filtro, '-map', '[a]',
                    '-ar', '48000', NARRACAO], check=True)
    print('duração do Reel:', FIM, 's  ·  cenas:', len(CENAS))
    for g in grupos(palavras())[:6]:
        print(f"{g[0]['s']:6.2f} {' '.join(w['t'] for w in g)}")
