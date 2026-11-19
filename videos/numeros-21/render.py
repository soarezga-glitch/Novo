"""Monta o vídeo de Números 21: pinturas animadas + cartões + narração + trilha.

uso:
  python3 -I render.py preview INI FIM   -> render/preview.mp4 (trecho, 960x540)
  python3 -I render.py video             -> render/numeros21-video.mp4 (sem áudio, 1920x1080)
  python3 -I render.py final             -> render/numeros21-final.mp4 (vídeo + narração + trilha)
"""
import os, sys, subprocess, math
import numpy as np, cv2

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from cenas import CENAS, FIM, FOCO

W, H, FPS = 1920, 1080, 30
XF = 1.0            # duração do cruzamento entre imagens (s)
CARD_IN, CARD_OUT = 0.7, 0.6
GRAVURA = ('dore_', 'wel_', 'luyken', 'lebrun', 'hoet', 'schenck', 'hayman', 'rubens', 'masson')
rng = np.random.default_rng(21)


# ---------------------------------------------------------------- imagens
def tom_gravura(img):
    """preto e branco -> sépia noturno com realce dourado"""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    g = np.clip((g - 0.04) / 0.92, 0, 1) ** 1.1
    pts = np.array([0, 0.45, 1.0])
    cores = np.array([[5, 7, 11], [40, 78, 125], [165, 208, 238]], np.float32)  # BGR
    out = np.stack([np.interp(g, pts, cores[:, c]) for c in range(3)], -1)
    return out.astype(np.uint8)


def tom_pintura(img):
    f = img.astype(np.float32)
    cinza = f.mean(-1, keepdims=True)
    f = cinza + (f - cinza) * 0.88               # um pouco menos saturado
    f *= np.array([0.90, 0.97, 1.04], np.float32)  # puxa para o quente
    f = 255 * (np.clip(f / 255, 0, 1) ** 1.08)   # sombras mais fundas
    return np.clip(f, 0, 255).astype(np.uint8)


def maior_trecho(mask):
    melhor, ini, a = (0, 0, len(mask)), None, 0
    for i, v in enumerate(list(mask) + [False]):
        if v and ini is None:
            ini = i
        elif not v and ini is not None:
            if i - ini > melhor[0]:
                melhor = (i - ini, ini, i)
            ini = None
    return melhor[1], melhor[2]


def recorta_bordas(img):
    """tira moldura branca, legenda impressa e marca d'água das bordas"""
    claro = (img.min(-1) > 215)
    linhas = (~claro).mean(1) > 0.55
    y0, y1 = maior_trecho(linhas)
    colunas = (~claro[y0:y1]).mean(0) > 0.55
    x0, x1 = maior_trecho(colunas)
    h, w = y1 - y0, x1 - x0
    if h < img.shape[0] * 0.4 or w < img.shape[1] * 0.4:
        return img
    my, mx = int(h * 0.015), int(w * 0.015)
    return img[y0 + my:y1 - my, x0 + mx:x1 - mx]


_cache = {}
def imagem(chave):
    if chave not in _cache:
        img = cv2.imread(os.path.join(AQUI, 'arte', chave + '.jpg'), cv2.IMREAD_COLOR)
        if img is None:
            raise SystemExit('falta arte/' + chave + '.jpg')
        img = recorta_bordas(img)
        foco = FOCO.get(chave, ())
        if len(foco) > 2:
            img = img[:int(img.shape[0] * (1 - foco[2]))]
        img = tom_gravura(img) if chave.startswith(GRAVURA) else tom_pintura(img)
        if len(_cache) > 6:
            _cache.pop(next(iter(_cache)))
        _cache[chave] = img
    return _cache[chave]


def ease(x):
    x = min(max(x, 0.0), 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * x)


_fundos = {}
def fundo_desfocado(chave):
    """fundo para pintura em pé: a própria pintura ampliada, desfocada e escura + máscara de borda suave"""
    if chave not in _fundos:
        img = imagem(chave); ih, iw = img.shape[:2]
        s = max(W / iw, H / ih) * 1.1
        f = cv2.resize(img, (int(iw * s), int(ih * s)))
        y0, x0 = (f.shape[0] - H) // 2, (f.shape[1] - W) // 2
        f = f[y0:y0 + H, x0:x0 + W]
        f = cv2.GaussianBlur(cv2.resize(f, (W // 8, H // 8)), (0, 0), 3)
        f = cv2.resize(f, (W, H)).astype(np.float32) * 0.38
        m = np.zeros((ih, iw), np.float32)
        b = max(4, int(min(ih, iw) * 0.012))
        m[b:-b, b:-b] = 1
        m = cv2.GaussianBlur(m, (0, 0), b)
        if len(_fundos) > 4:
            _fundos.pop(next(iter(_fundos)))
        _fundos[chave] = (f, m)
    return _fundos[chave]


def quadro_imagem(chave, mov, p):
    """recorte animado da pintura no progresso p (0..1)"""
    img = imagem(chave)
    ih, iw = img.shape[:2]
    cobre = max(W / iw, H / ih)          # escala que cobre a tela
    alta = iw / ih < 1.15                 # pintura em pé: a câmera passeia pela faixa que importa
    e = ease(p)
    if alta:
        f0, f1 = FOCO.get(chave, (0.3, 0.45))[:2]
        if mov == 'cima':
            f0, f1 = f1, f0
        z0, z1 = {'in': (1.0, 1.10), 'out': (1.10, 1.0)}.get(mov, (1.04, 1.04))
        s = cobre * (z0 + (z1 - z0) * e)
        vis_h, vis_w = H / s, W / s
        cy = min(max(ih * (f0 + (f1 - f0) * e), vis_h / 2), ih - vis_h / 2)
        cx = iw / 2
    else:
        z0, z1 = {'in': (1.06, 1.20), 'out': (1.20, 1.06)}.get(mov, (1.14, 1.14))
        s = cobre * (z0 + (z1 - z0) * e)
        vw, vh = W / s, H / s
        mx, my = (iw - vw) / 2, (ih - vh) / 2
        dx = {'esq': (0.8, -0.8), 'dir': (-0.8, 0.8)}.get(mov, (0, 0))
        dy = {'cima': (0.7, -0.7), 'baixo': (-0.7, 0.7)}.get(mov, (0, -0.15 if mov == 'in' else 0))
        cx = iw / 2 + mx * (dx[0] + (dx[1] - dx[0]) * e)
        cy = ih / 2 + my * (dy[0] + (dy[1] - dy[0]) * e)
    M = np.array([[s, 0, W / 2 - s * cx], [0, s, H / 2 - s * cy]], np.float32)
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR if s < 1.3 else cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_REFLECT)


# ---------------------------------------------------------------- tomadas
def montar_tomadas():
    """junta cenas seguidas com a mesma imagem numa só tomada (movimento contínuo)"""
    tomadas = []
    for i, (ini, chave, _card, mov) in enumerate(CENAS):
        fim = CENAS[i + 1][0] if i + 1 < len(CENAS) else FIM
        if tomadas and tomadas[-1]['chave'] == chave:
            tomadas[-1]['fim'] = fim
        else:
            tomadas.append({'chave': chave, 'mov': mov, 'ini': ini, 'fim': fim})
    return tomadas


def montar_cartoes():
    cards = []
    for i, (ini, _c, card, _m) in enumerate(CENAS):
        if not card:
            continue
        fim = CENAS[i + 1][0] if i + 1 < len(CENAS) else FIM
        t = ini
        for parte in card.split('|'):
            nome, _, dur = parte.partition('@')
            f = min(t + float(dur), fim) if dur else fim
            cards.append({'nome': nome, 'ini': t + 0.15, 'fim': f - 0.1})
            t = f
    return cards


_cards = {}
def cartao(nome):
    if nome not in _cards:
        c = cv2.imread(os.path.join(AQUI, 'cartoes', nome + '.png'), cv2.IMREAD_UNCHANGED)
        rgb = c[..., :3].astype(np.float32); a = c[..., 3:4].astype(np.float32) / 255
        if len(_cards) > 3:
            _cards.pop(next(iter(_cards)))
        _cards[nome] = (rgb * a, a)
    return _cards[nome]


# ---------------------------------------------------------------- efeitos
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
VINHETA = (1 - 0.55 * np.clip((r - 0.45) / 0.95, 0, 1) ** 1.6)[..., None]
GRAOS = [rng.normal(0, 5.0, (H, W, 1)).astype(np.float32) for _ in range(6)]
N_PO = 70
PO = {'x': rng.uniform(0, W, N_PO), 'y': rng.uniform(0, H, N_PO), 'vx': rng.uniform(-6, 6, N_PO),
      'vy': rng.uniform(-14, -3, N_PO), 'r': rng.uniform(1.0, 2.6, N_PO), 'a': rng.uniform(0.15, 0.5, N_PO),
      'f': rng.uniform(0.2, 0.7, N_PO), 'ph': rng.uniform(0, 6.28, N_PO)}


def poeira(t):
    camada = np.zeros((H // 2, W // 2), np.float32)
    x = (PO['x'] + PO['vx'] * t + 12 * np.sin(t * PO['f'] + PO['ph'])) % W
    y = (PO['y'] + PO['vy'] * t) % H
    for i in range(N_PO):
        brilho = PO['a'][i] * (0.6 + 0.4 * math.sin(t * PO['f'][i] * 2 + PO['ph'][i]))
        cv2.circle(camada, (int(x[i] / 2), int(y[i] / 2)), int(round(PO['r'][i])), brilho, -1, cv2.LINE_AA)
    camada = cv2.GaussianBlur(camada, (0, 0), 1.2)
    return cv2.resize(camada, (W, H))[..., None] * np.array([150, 205, 245], np.float32)


def chama(t):
    """oscilação lenta de luz de vela"""
    return 1 + 0.018 * math.sin(t * 1.7) + 0.012 * math.sin(t * 4.3 + 1) + 0.008 * math.sin(t * 9.1 + 2)


def desfoque(f):
    p = cv2.resize(f, (W // 8, H // 8), interpolation=cv2.INTER_AREA)
    p = cv2.GaussianBlur(p, (0, 0), 2.2)
    return cv2.resize(p, (W, H), interpolation=cv2.INTER_LINEAR)


# ---------------------------------------------------------------- quadro
def quadro(t, tomadas, cards):
    # fundo: tomada atual (+ cruzamento com a vizinha)
    camadas = []
    for tm in tomadas:
        a, b = tm['ini'] - XF / 2, tm['fim'] + XF / 2
        if a <= t < b:
            p = (t - a) / (b - a)
            peso = min(1.0, (t - a) / XF, (b - t) / XF) if tm['ini'] > 0 else min(1.0, (b - t) / XF)
            camadas.append((tm, p, max(0.0, peso)))
    if not camadas:
        f = np.zeros((H, W, 3), np.float32)
    else:
        f = None; soma = 0
        for tm, p, peso in camadas:
            q = quadro_imagem(tm['chave'], tm['mov'], p).astype(np.float32)
            f = q * peso if f is None else f + q * peso
            soma += peso
        f /= max(soma, 1e-6)
    # entrada do vídeo e saída
    abre = min(1.0, t / 1.5); fecha = min(1.0, (FIM - t) / 2.5)
    # cartão ativo
    for c in cards:
        if c['ini'] - 0.01 <= t < c['fim'] + CARD_OUT:
            k = min(1.0, (t - c['ini']) / CARD_IN, (c['fim'] + CARD_OUT - t) / CARD_OUT)
            k = ease(max(k, 0.0))
            if k > 0:
                fundo = desfoque(f) * 0.42
                f = f * (1 - k) + fundo * k
                pm, a = cartao(c['nome'])
                dy = int(round((1 - k) * 18))
                if dy:
                    pm = np.roll(pm, dy, axis=0); a = np.roll(a, dy, axis=0)
                f = f * (1 - a * k) + pm * k
    f = f * VINHETA * chama(t)
    f += poeira(t)
    f += GRAOS[int(t * FPS) % len(GRAOS)]
    f *= min(abre, fecha)
    return np.clip(f, 0, 255).astype(np.uint8)


def gerar(saida, t0, t1, escala=1.0, crf=19, preset='medium'):
    tomadas, cards = montar_tomadas(), montar_cartoes()
    ow, oh = int(W * escala), int(H * escala)
    cmd = ['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{ow}x{oh}', '-r', str(FPS),
           '-i', '-', '-c:v', 'libx264', '-preset', preset, '-crf', str(crf), '-pix_fmt', 'yuv420p', saida]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n0, n1 = int(t0 * FPS), int(t1 * FPS)
    for n in range(n0, n1):
        q = quadro(n / FPS, tomadas, cards)
        if escala != 1.0:
            q = cv2.resize(q, (ow, oh), interpolation=cv2.INTER_AREA)
        pr.stdin.write(q.tobytes())
        if (n - n0) % (FPS * 10) == 0:
            print(f'{n / FPS:7.1f}s / {t1:.0f}s', flush=True)
    pr.stdin.close(); pr.wait()


if __name__ == '__main__':
    os.makedirs(os.path.join(AQUI, 'render'), exist_ok=True)
    R = lambda n: os.path.join(AQUI, 'render', n)
    modo = sys.argv[1]
    if modo == 'preview':
        gerar(R('preview.mp4'), float(sys.argv[2]), float(sys.argv[3]), escala=0.5, crf=24, preset='veryfast')
    elif modo == 'parte':  # parte INI FIM NOME  (para renderizar em paralelo)
        gerar(R(sys.argv[4]), float(sys.argv[2]), float(sys.argv[3]))
    elif modo == 'final':
        partes = sorted(p for p in os.listdir(R('')) if p.startswith('parte_'))
        open(R('lista.txt'), 'w').write(''.join(f"file '{p}'\n" for p in partes))
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', R('lista.txt'), '-c', 'copy', R('video.mp4')], check=True)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', R('video.mp4'),
                        '-i', os.path.join(AQUI, 'audio', 'narracao.mp3'), '-i', os.path.join(AQUI, 'audio', 'musica.wav'),
                        '-filter_complex',
                        '[1:a]aresample=48000,volume=1.0[v];[2:a]aresample=48000,volume=0.16[m];'
                        '[v][m]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]',
                        '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                        '-t', str(FIM), '-movflags', '+faststart', R('numeros21-final.mp4')], check=True)
        print('ok', R('numeros21-final.mp4'))
