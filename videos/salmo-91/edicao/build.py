"""Builds every asset for the full Salmo 91 video: cards, panel crops,
on-screen text overlays, and the clip render list (render_all.sh).

Timeline is in seconds of narracao_fluida.wav.
"""
import json
from PIL import Image, ImageDraw, ImageFont
import numpy as np

F = '/mnt/skills/examples/canvas-design/canvas-fonts/'
IMG = '/home/user/Novo/videos/salmo-91/imagens/'
W, H = 1920, 1080
PAPER = (250, 244, 234); INK = (70, 45, 25); GOLD = (176, 122, 40); RED = (170, 40, 30)
TOTAL = 836.4

def font(name, size): return ImageFont.truetype(F + name, size)
TITLE, SERIF, ITAL, BOLD = 'YoungSerif-Regular.ttf', 'Lora-Regular.ttf', 'Lora-Italic.ttf', 'Lora-Bold.ttf'

def paper():
    n = np.random.default_rng(3).normal(0, 3, (H, W, 1))
    return Image.fromarray(np.clip(np.array(PAPER, float) + n, 0, 255).astype(np.uint8))

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines

def center(d, y, text, f, fill, cx=W / 2):
    d.text((cx - d.textlength(text, font=f) / 2, y), text, font=f, fill=fill)

def fit(d, text, name, size, maxw):
    while d.textlength(text, font=font(name, size)) > maxw: size -= 4
    return font(name, size)

# ---------- full-screen cards ----------
def card_chapter(n, title, out):
    bg = paper(); d = ImageDraw.Draw(bg)
    center(d, 330, f'CAPÍTULO {n}', font(SERIF, 60), GOLD)
    f = fit(d, title, TITLE, 160, 1700)
    center(d, 440, title, f, INK)
    d.line([(700, 680), (1220, 680)], fill=GOLD, width=5)
    bg.save(out)

def card_verse(text, ref, out):
    bg = paper(); d = ImageDraw.Draw(bg)
    d.rounded_rectangle([230, 150, 1690, 930], radius=30, fill=(243, 228, 196), outline=(190, 150, 90), width=6)
    f = font(ITAL, 70); lines = wrap(d, f'“{text}”', f, 1250)
    y0 = 540 - (len(lines) * 110 + 110) / 2
    for i, l in enumerate(lines): center(d, y0 + i * 110, l, f, INK)
    center(d, y0 + len(lines) * 110 + 40, ref, font(BOLD, 60), GOLD)
    bg.save(out)

def card_aline(sub1, sub2, out):
    bg = paper(); d = ImageDraw.Draw(bg)
    center(d, 300, 'Aline', font(TITLE, 230), INK)
    d.line([(760, 590), (1160, 590)], fill=GOLD, width=5)
    center(d, 630, sub1, font(ITAL, 78), INK)
    center(d, 740, sub2, font(ITAL, 60), GOLD)
    bg.save(out)

def card_4nomes(out):
    bg = paper(); d = ImageDraw.Draw(bg)
    cols = [('1', 'Altíssimo', 'Elyon'), ('2', 'Onipotente', 'Shaddai'), ('3', 'Senhor', 'o nome sagrado'), ('4', 'meu Deus', '?')]
    for i, (n, nome, heb) in enumerate(cols):
        cx = 240 + i * 480
        d.ellipse([cx - 70, 340, cx + 70, 480], outline=GOLD, width=6)
        center(d, 360, n, font(TITLE, 90), GOLD, cx)
        center(d, 560, nome, fit(d, nome, TITLE, 76, 420), INK, cx)
        center(d, 670, heb, font(ITAL, 52), GOLD, cx)
    bg.save(out)

def card_compare(out):
    bg = paper(); d = ImageDraw.Draw(bg)
    for x0, head, ref, body, cut in [
        (90, 'O que o diabo citou', 'Mateus 4:6',
         'Aos seus anjos dará ordens a teu respeito, e tomar-te-ão nas mãos, para que nunca tropeces em alguma pedra.', None),
        (990, 'O que o salmo diz', 'Salmo 91:11-12',
         'Aos seus anjos dará ordem a teu respeito, para te guardarem', 'em todos os teus caminhos.')]:
        d.rounded_rectangle([x0, 140, x0 + 840, 940], radius=26, fill=(243, 228, 196), outline=(190, 150, 90), width=5)
        cx = x0 + 420
        center(d, 190, head, font(TITLE, 56), INK, cx)
        center(d, 270, ref, font(BOLD, 44), GOLD, cx)
        f = font(ITAL, 60); y = 400
        for l in wrap(d, body, f, 740): center(d, y, l, f, INK, cx); y += 88
        if cut:
            fb = font(BOLD, 62)
            for l in wrap(d, cut, fb, 740): center(d, y + 14, l, fb, RED, cx); y += 88
    bg.save(out)

def crop_panel(src, box, out):
    im = Image.open(src); c = im.crop(box); s = 1000 / c.height
    c = c.resize((int(c.width * s), 1000), Image.LANCZOS)
    bg = paper(); bg.paste(c, ((W - c.width) // 2, 40)); bg.save(out)

# ---------- small text tags shown over the images ----------
def tag(main, sub, out, quote=False):
    tmp = Image.new('RGBA', (10, 10)); d = ImageDraw.Draw(tmp)
    fm = font(ITAL if quote else TITLE, 54 if quote else 66)
    fs = font(BOLD if quote else ITAL, 40)
    mains = wrap(d, f'“{main}”' if quote else main, fm, 1300)
    wmax = max([d.textlength(l, font=fm) for l in mains] + [d.textlength(sub, font=fs) if sub else 0])
    lh = 78 if quote else 86
    w = int(wmax + 110); h = int(len(mains) * lh + (64 if sub else 0) + 60)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=24, fill=(246, 234, 206, 238), outline=(190, 150, 90, 255), width=4)
    y = 26
    for l in mains: center(d, y, l, fm, INK, w / 2); y += lh
    if sub: center(d, y + 4, sub, fs, GOLD, w / 2)
    im.save(out); return w, h

# ---------- build ----------
card_chapter(1, 'O Esconderijo', 'cap1.png')
card_chapter(2, 'Os Quatro Nomes', 'cap2.png')
card_chapter(3, 'O Laço Escondido', 'cap3.png')
card_chapter(4, 'Debaixo das Asas', 'cap4.png')
card_chapter(5, 'Mil Cairão ao Teu Lado', 'cap5.png')
card_chapter(6, 'O Salmo que o Diabo Citou', 'cap6.png')
card_chapter(7, 'A Voz que Muda', 'cap7.png')
card_verse('Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.', 'Salmo 91:1', 'v1.png')
card_verse('Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei.', 'Salmo 91:2', 'v2.png')
card_verse('Porque ele te livrará do laço do passarinheiro, e da peste perniciosa.', 'Salmo 91:3', 'v3.png')
card_verse('Porque aos seus anjos dará ordem a teu respeito, para te guardarem em todos os teus caminhos.', 'Salmo 91:11', 'v11.png')
card_aline('A Bíblia, devagar.', 'Versículo por versículo.', 'card_aline.png')
card_aline('Fique debaixo das asas d’Ele.', 'Até o próximo vídeo.', 'card_fim.png')
card_4nomes('card_4nomes.png')
card_compare('card_compare.png')
crop_panel(IMG + 'imagem-02.png', (10, 30, 835, 915), 'img02_esq.png')
crop_panel(IMG + 'imagem-02.png', (845, 30, 1665, 915), 'img02_dir.png')
crop_panel(IMG + 'imagem-17.png', (10, 30, 830, 915), 'img17_esq.png')
crop_panel(IMG + 'imagem-17.png', (845, 30, 1665, 915), 'img17_dir.png')

im = lambda n: IMG + f'imagem-{n:02d}.png'
P3 = lambda a, b: [(0, a), (a, b), (b, 1920)]
P2 = [(0, 965), (965, 1920)]
# (source, start, end, panel starts (abs) or None, extra args)
clips = [
    (im(1), 0.0, 14.9, list(zip(P3(666, 1252), [0.0, 4.8, 8.1])), '--zoom 1.04'),
    ('img02_esq.png', 14.9, 47.1, None, '--zoom 1.18 --focus 1080,590'),
    ('card_aline.png', 47.1, 55.8, None, '--fast --zoom 1.04'),
    ('img02_dir.png', 55.8, 64.4, None, '--zoom 1.10 --focus 654,639'),
    ('cap1.png', 64.4, 67.5, None, '--fast --zoom 1.03'),
    ('v1.png', 67.5, 74.6, None, '--fast --zoom 1.04'),
    (im(3), 74.6, 122.5, list(zip(P3(629, 1280), [74.6, 78.0, 95.7])), '--zoom 1.05'),
    (im(4), 122.5, 161.3, None, '--zoom 1.14 --focus 574,310'),
    ('cap2.png', 161.3, 163.6, None, '--fast --zoom 1.02'),
    ('v2.png', 163.6, 180.0, None, '--fast --zoom 1.06'),
    ('card_4nomes.png', 180.0, 197.0, list(zip([(0, 480), (480, 960), (960, 1440), (1440, 1920)], [180.0, 182.6, 185.7, 189.7])), '--fast --zoom 1.04 --panzoom 1.0'),
    (im(5), 197.0, 228.5, list(zip(P3(631, 1277), [197.0, 208.9, 217.3])), '--zoom 1.04'),
    (im(6), 228.5, 278.7, None, '--zoom 1.15 --focus 960,560'),
    ('cap3.png', 278.7, 280.8, None, '--fast --zoom 1.02'),
    ('v3.png', 280.8, 288.0, None, '--fast --zoom 1.04'),
    (im(7), 288.0, 329.2, list(zip(P3(632, 1280), [288.0, 305.6, 322.0])), '--zoom 1.04'),
    (im(8), 329.2, 350.6, list(zip(P2, [329.2, 339.5])), '--zoom 1.04'),
    (im(9), 350.6, 367.0, None, '--zoom 1.12 --focus 600,560'),
    ('cap4.png', 367.0, 369.1, None, '--fast --zoom 1.02'),
    (im(10), 369.1, 418.4, list(zip(P3(615, 1301), [369.1, 378.7, 399.4])), '--zoom 1.05'),
    (im(11), 418.4, 441.2, None, '--zoom 1.14 --focus 700,300'),
    (IMG + 'imagem-cta.png', 441.2, 453.0, None, '--zoom 1.04'),
    ('cap5.png', 453.0, 461.0, None, '--fast --zoom 1.05'),
    (im(12), 461.0, 497.7, list(zip(P3(630, 1278), [461.0, 464.3, 488.3])), '--zoom 1.05'),
    (im(13), 497.7, 521.0, list(zip(P2, [497.7, 507.3])), '--zoom 1.04'),
    ('cap6.png', 521.0, 530.6, None, '--fast --zoom 1.05'),
    ('v11.png', 530.6, 540.3, None, '--fast --zoom 1.04'),
    (im(14), 540.3, 573.5, list(zip(P2, [540.3, 553.5])), '--zoom 1.05'),
    ('card_compare.png', 573.5, 594.7, list(zip(P2, [573.5, 584.6])), '--fast --zoom 1.03 --panzoom 1.0'),
    (im(15), 594.7, 660.5, list(zip(P2, [594.7, 634.1])), '--zoom 1.06'),
    ('cap7.png', 660.5, 668.0, None, '--fast --zoom 1.05'),
    (im(16), 668.0, 752.0, list(zip(P2, [668.0, 716.2])), '--zoom 1.06'),
    ('img17_esq.png', 752.0, 764.0, None, '--zoom 1.10 --focus 820,420'),
    (im(18), 764.0, 791.0, None, '--zoom 1.14 --focus 1300,600'),
    (IMG + 'imagem-cta.png', 791.0, 813.0, None, '--zoom 1.06'),
    ('img17_dir.png', 813.0, 829.6, None, '--zoom 1.10 --focus 1000,500'),
    ('card_fim.png', 829.6, TOTAL, None, '--fast --zoom 1.04 --nofade'),
]

lines = ['set -e', 'cd "$(dirname "$0")"', 'run() { python3 -I whiteboard.py "$@" > /dev/null; }']
names = []
for i, (src, a, b, segs, extra) in enumerate(clips, 1):
    name = f'clip_{i:02d}.mp4'; names.append(name)
    seg = ''
    if segs:
        seg = ' '.join(f'--seg {x0}:{x1}:{t - a:.2f}' for (x0, x1), t in segs)
    lines.append(f'run "{src}" mao_real.png {name} {b - a:.2f} {seg} {extra} &')
    if i % 6 == 0: lines.append('wait')
lines.append('wait')
open('render_all.sh', 'w').write('\n'.join(lines) + '\n')
open('lista_full.txt', 'w').write(''.join(f"file '{n}'\n" for n in names))

tags = [
    (85.6, 93.0, 'HABITAR  ≠  VISITAR', 'habitar = morar', False),
    (95.7, 108.5, 'Não é um amuleto', 'é um lugar para morar', False),
    (122.8, 130.5, 'DESCANSARÁ', 'a recompensa de quem mora ali', False),
    (197.1, 208.5, 'ALTÍSSIMO', 'Elyon · acima de tudo', False),
    (208.9, 217.0, 'ONIPOTENTE', 'Shaddai · pode tudo', False),
    (217.3, 228.3, 'SENHOR', 'o nome revelado a Moisés', False),
    (246.3, 256.5, 'MEU Deus', 'o nome mais simples', False),
    (294.1, 303.0, 'Passarinheiro', 'o caçador de pássaros', False),
    (324.5, 329.0, 'Ele te livra do que você não vê', '', False),
    (383.6, 392.5, 'Ele te cobrirá com as suas penas', 'Salmo 91:4', True),
    (425.4, 437.3, 'Quantas vezes quis eu ajuntar os teus filhos, como a galinha ajunta os seus pintos debaixo das asas', 'Mateus 23:37', True),
    (488.5, 497.5, 'Mil cairão ao teu lado... mas não chegará a ti', 'Salmo 91:7', True),
    (510.7, 520.8, 'O que esse salmo promete?', 'a resposta vem no final', False),
    (560.5, 570.6, 'Se tu és o Filho de Deus, lança-te daqui abaixo', 'Mateus 4:6', True),
    (609.7, 616.2, 'Não tentarás o Senhor teu Deus', 'Mateus 4:7', True),
    (626.8, 634.1, 'Do versículo 12 para o 13', 'onde o diabo parou', False),
    (634.3, 646.8, 'Pisarás o leão e a cobra', 'Salmo 91:13', True),
    (650.7, 660.2, 'Ele só não leu até o fim.', '', False),
    (673.5, 680.3, 'Versículo 14', 'Deus começa a falar', False),
    (680.5, 691.0, 'Pois que tão encarecidamente me amou, também eu o livrarei', 'Salmo 91:14', True),
    (698.5, 711.5, 'Porque ele me AMOU', 'não porque era perfeito', False),
    (727.2, 738.5, 'Estarei com ele na angústia', 'Salmo 91:15', True),
    (743.5, 751.5, 'Não é uma vida sem tempestade.', 'É nunca mais enfrentar uma sozinho.', False),
    (775.7, 781.6, 'Dar-lhe-ei abundância de dias', 'Salmo 91:16', True),
    (808.0, 812.8, 'Comente o nome de quem você quer que a gente ore', '', False),
    (813.1, 829.0, 'Próximo vídeo', 'Se Você Entender o Salmo 23', False),
]
meta = []
for k, (a, b, m, s, q) in enumerate(tags, 1):
    w, h = tag(m, s, f'tag_{k:02d}.png', q)
    meta.append({'png': f'tag_{k:02d}.png', 'a': a, 'b': b, 'x': (W - w) // 2, 'y': H - h - 50})
json.dump(meta, open('tags.json', 'w'))
print(len(clips), 'clips,', len(meta), 'tags')
