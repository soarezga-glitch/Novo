"""Cartões em PNG transparente (1920x1080) para o vídeo de Números 21.

uso: python3 -I cartoes.py   (gera tudo em cartoes/)
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTES = os.path.join(AQUI, 'fontes')
SAIDA = os.path.join(AQUI, 'cartoes')
W, H = 1920, 1080
CREME = (244, 232, 205, 255)
OURO = (222, 172, 86, 255)
OURO_ESC = (160, 112, 48, 255)


def fonte(nome, tam, peso=None):
    f = ImageFont.truetype(os.path.join(FONTES, nome), tam)
    if peso:
        try:
            f.set_variation_by_axes([peso])
        except Exception:
            pass
    return f


def serif(t, p=500): return fonte('cormorant.ttf', t, p)
def italico(t, p=500): return fonte('cormorant-italic.ttf', t, p)
def titulo(t, p=600): return fonte('cinzel.ttf', t, p)


def quebra(d, texto, f, larg):
    linhas, cur = [], ''
    for w in texto.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= larg:
            cur = t
        else:
            linhas.append(cur); cur = w
    if cur:
        linhas.append(cur)
    return linhas


def centro(d, y, txt, f, cor, cx=W / 2):
    d.text((cx - d.textlength(txt, font=f) / 2, y), txt, font=f, fill=cor)


def com_sombra(img):
    """sombra suave atrás do texto para ler sobre qualquer fundo"""
    a = img.split()[3]
    sombra = Image.new('RGBA', img.size, (0, 0, 0, 0))
    sombra.putalpha(a.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.85)))
    preto = Image.new('RGBA', img.size, (8, 5, 2, 255))
    preto.putalpha(sombra.split()[3])
    return Image.alpha_composite(preto, img)


def ornamento(d, y, larg=360):
    cx = W / 2
    d.line((cx - larg, y, cx - 26, y), fill=OURO_ESC, width=2)
    d.line((cx + 26, y, cx + larg, y), fill=OURO_ESC, width=2)
    d.polygon([(cx, y - 11), (cx + 11, y), (cx, y + 11), (cx - 11, y)], fill=OURO)


def versiculo(nome, texto, ref):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    tam = 74
    while True:
        f = italico(tam); linhas = quebra(d, f'“{texto}”', f, 1400)
        if len(linhas) * tam * 1.28 < 560 or tam <= 50:
            break
        tam -= 4
    lh = tam * 1.28
    bloco = len(linhas) * lh + 130
    y = (H - bloco) / 2
    ornamento(d, y - 30)
    for i, l in enumerate(linhas):
        centro(d, y + i * lh, l, f, CREME)
    yref = y + len(linhas) * lh + 40
    centro(d, yref, ref.upper(), titulo(44), OURO)
    ornamento(d, yref + 95)
    com_sombra(img).save(os.path.join(SAIDA, nome + '.png'))


def capitulo(nome, n, texto):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    centro(d, 400, f'CAPÍTULO {n}', titulo(46, 500), OURO)
    ornamento(d, 480, 300)
    f = titulo(96, 700)
    while d.textlength(texto.upper(), font=f) > 1700:
        f = titulo(f.size - 6, 700)
    centro(d, 520, texto.upper(), f, CREME)
    com_sombra(img).save(os.path.join(SAIDA, nome + '.png'))


def abertura(nome):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    centro(d, 330, 'SE VOCÊ ENTENDER', titulo(64, 500), OURO)
    centro(d, 420, 'A SERPENTE', titulo(150, 800), CREME)
    centro(d, 590, 'DE BRONZE', titulo(150, 800), CREME)
    ornamento(d, 790, 380)
    centro(d, 820, 'Números 21 · João 3', italico(54), OURO)
    com_sombra(img).save(os.path.join(SAIDA, nome + '.png'))


def palavra(nome, port, heb, translit, sub):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    fh = ImageFont.truetype('/usr/share/fonts/truetype/freefont/FreeSerif.ttf', 150)
    centro(d, 290, heb, fh, OURO)
    centro(d, 500, translit, italico(110), CREME)
    ornamento(d, 660, 280)
    centro(d, 700, port.upper(), titulo(58), OURO)
    if sub:
        centro(d, 790, sub, italico(52), CREME)
    com_sombra(img).save(os.path.join(SAIDA, nome + '.png'))


def dupla(nome):
    """nachash x nechoshet lado a lado"""
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    fh = ImageFont.truetype('/usr/share/fonts/truetype/freefont/FreeSerif.ttf', 140)
    for cx, heb, tr, pt in [(W * 0.29, 'נָחָשׁ', 'nachash', 'SERPENTE'), (W * 0.71, 'נְחֹשֶׁת', 'nechoshet', 'BRONZE')]:
        centro(d, 300, heb, fh, OURO, cx)
        centro(d, 500, tr, italico(100), CREME, cx)
        centro(d, 650, pt, titulo(56), OURO, cx)
    d.line((W / 2, 320, W / 2, 720), fill=OURO_ESC, width=2)
    com_sombra(img).save(os.path.join(SAIDA, nome + '.png'))


def final(nome):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    centro(d, 360, 'NOITES BÍBLICAS', titulo(110, 700), CREME)
    ornamento(d, 520, 360)
    centro(d, 560, 'Fica em paz. Até a próxima noite.', italico(66), OURO)
    com_sombra(img).save(os.path.join(SAIDA, nome + '.png'))


def comentario(nome):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    centro(d, 380, 'Comente:', italico(64), OURO)
    centro(d, 470, '“EU OLHO PARA JESUS”', titulo(100, 700), CREME)
    ornamento(d, 650, 340)
    com_sombra(img).save(os.path.join(SAIDA, nome + '.png'))


if __name__ == '__main__':
    os.makedirs(SAIDA, exist_ok=True)
    abertura('abertura')
    V = [
        ('v_jo3_14', 'E, como Moisés levantou a serpente no deserto, assim importa que o Filho do Homem seja levantado.', 'João 3:14'),
        ('v_nm21_4', 'Porém a alma do povo angustiou-se neste caminho.', 'Números 21:4'),
        ('v_nm21_5', 'Por que nos fizestes subir do Egito, para que morrêssemos neste deserto? Pois aqui nem pão nem água há; e a nossa alma tem fastio deste pão tão vil.', 'Números 21:5'),
        ('v_jo6_35', 'Eu sou o pão da vida.', 'João 6:35'),
        ('v_nm21_6', 'Então o Senhor mandou entre o povo serpentes ardentes, que morderam o povo; e morreu muito povo de Israel.', 'Números 21:6'),
        ('v_nm21_7', 'Havemos pecado, porquanto temos falado contra o Senhor e contra ti; ora ao Senhor que tire de nós estas serpentes.', 'Números 21:7'),
        ('v_nm21_8', 'Faze-te uma serpente ardente e põe-na sobre uma haste; e será que viverá todo mordido que olhar para ela.', 'Números 21:8'),
        ('v_nm21_9', 'E era que, mordendo alguma serpente a alguém, olhava para a serpente de metal e ficava vivo.', 'Números 21:9'),
        ('v_is45_22', 'Olhai para mim e sereis salvos, vós, todos os termos da terra; porque eu sou Deus, e não há outro.', 'Isaías 45:22'),
        ('v_2co5_21', 'Àquele que não conheceu pecado, o fez pecado por nós; para que, nele, fôssemos feitos justiça de Deus.', '2 Coríntios 5:21'),
        ('v_gl3_13', 'Cristo nos resgatou da maldição da lei, fazendo-se maldição por nós, porque está escrito: Maldito todo aquele que for pendurado no madeiro.', 'Gálatas 3:13'),
        ('v_jo12_32', 'E eu, quando for levantado da terra, todos atrairei a mim.', 'João 12:32'),
        ('v_jo3_16', 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.', 'João 3:16'),
        ('v_jo19_39', 'E foi também Nicodemos (aquele que, anteriormente, se dirigira de noite a Jesus), levando quase cem arráteis de um composto de mirra e aloés.', 'João 19:39'),
        ('v_2rs18_4', 'Fez em pedaços a serpente de metal que Moisés fizera, porquanto até àquele dia os filhos de Israel lhe queimavam incenso; e lhe chamaram Neustã.', '2 Reis 18:4'),
    ]
    for v in V:
        versiculo(*v)
    caps = ['Quase chegando', 'O pão que eles desprezaram', 'Serpentes ardentes', 'A ordem mais estranha',
            'Bastava olhar', 'Por que uma serpente?', 'O homem que veio de noite', 'O que aconteceu com a serpente']
    for i, c in enumerate(caps, 1):
        capitulo(f'cap{i}', i, c)
    palavra('saraf', 'ardente · serafim', 'שָׂרָף', 'saraf', '')
    palavra('neusta', 'um pedaço de bronze', 'נְחֻשְׁתָּן', 'Neustã', '')
    dupla('nachash')
    comentario('comentario')
    final('final')
    print('ok')


def joao3(nome):
    from PIL import ImageOps
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    centro(d, 150, 'ASSISTA TAMBÉM', titulo(52, 600), OURO)
    th = Image.open(os.path.join(AQUI, 'arte', 'thumb_joao3.jpg')).convert('RGBA').resize((1024, 576))
    moldura = Image.new('RGBA', (1024 + 12, 576 + 12), OURO)
    img.alpha_composite(moldura, ((W - 1036) // 2, 244))
    img.alpha_composite(th, ((W - 1024) // 2, 250))
    centro(d, 860, 'Se Você Entender João 3, Entende a Bíblia Toda', italico(58), CREME)
    com_sombra(img).save(os.path.join(SAIDA, nome + '.png'))


if __name__ == '__main__':
    joao3('joao3')
