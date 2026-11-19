"""Thumbnail 1280x720 de Números 21. uso: python3 -I thumbnail.py"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

AQUI = os.path.dirname(os.path.abspath(__file__))
W, H = 1280, 720


def fonte(n, t):
    return ImageFont.truetype(os.path.join(AQUI, 'fontes', n), t)


def texto_contorno(d, xy, txt, f, cor, contorno=10):
    d.text(xy, txt, font=f, fill=cor, stroke_width=contorno, stroke_fill=(10, 6, 2))


def gerar(saida, linha1, linha2, linha3):
    # Tissot: Moisés e a serpente na haste (faixa de cima da pintura)
    img = Image.open(os.path.join(AQUI, 'arte', 'ts_serpente.jpg')).convert('RGB')
    iw, ih = img.size
    s = W * 1.05 / iw
    img = img.resize((int(iw * s), int(ih * s)), Image.LANCZOS)
    y0 = int(img.height * 0.02)
    img = img.crop((img.width - W - 20, y0, img.width - 20, y0 + H))
    img = ImageEnhance.Contrast(ImageEnhance.Color(img).enhance(1.15)).enhance(1.12)
    a = np.asarray(img).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # escurece a esquerda (onde vai o texto) e as bordas
    lado = np.clip((xx - 200) / 520, 0, 1) ** 1.3
    vin = 1 - 0.5 * np.clip(np.hypot((xx - W * 0.7) / W, (yy - H * 0.35) / H) - 0.2, 0, 1)
    a *= (0.18 + 0.82 * lado)[..., None] * vin[..., None]
    # brilho dourado na serpente (topo, perto do centro-direita)
    brilho = np.exp(-(((xx - W * 0.66) / 170) ** 2 + ((yy - H * 0.17) / 150) ** 2))
    a += brilho[..., None] * np.array([255, 170, 60], np.float32) * 0.55
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    f1, f2, f3 = fonte('anton.ttf', 92), fonte('anton.ttf', 150), fonte('anton.ttf', 62)
    x = 46
    texto_contorno(d, (x, 80), linha1, f1, (255, 255, 255))
    texto_contorno(d, (x, 180), linha2, f2, (255, 196, 40), 12)
    texto_contorno(d, (x, 380), linha3, f3, (255, 255, 255), 8)
    img.save(os.path.join(AQUI, saida), quality=95)


if __name__ == '__main__':
    gerar('thumb-A-por-que-uma-serpente.jpg', 'POR QUE UMA', 'SERPENTE?', 'JESUS EXPLICOU')
    gerar('thumb-B-serpente-de-bronze.jpg', 'SE VOCÊ ENTENDER', 'A SERPENTE', 'ENTENDE A CRUZ')
    print('ok')
