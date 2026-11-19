"""Baixa as pinturas (domínio público, Wikimedia Commons) listadas em cenas.IMAGENS para arte/.
Vai devagar de propósito: o Wikimedia limita pedidos por endereço.
uso: python3 -I baixar_arte.py
"""
import os, sys, time, hashlib, urllib.parse, urllib.request, urllib.error
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from cenas import IMAGENS
UA = {"User-Agent": "NoitesBiblicasVideoBot/1.0 (one-off educational video; low request rate)"}
os.makedirs(os.path.join(AQUI, 'arte'), exist_ok=True)


def urls(titulo):
    n = titulo[5:].replace(' ', '_')
    h = hashlib.md5(n.encode()).hexdigest()
    q = urllib.parse.quote(n)
    base = f"https://upload.wikimedia.org/wikipedia/commons"
    yield f"{base}/thumb/{h[0]}/{h[:2]}/{q}/1920px-{q}" + ('.jpg' if n.lower().endswith('.png') else '')
    yield f"{base}/{h[0]}/{h[:2]}/{q}"


def baixa(u):
    for tentativa in range(12):
        try:
            return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=90).read()
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print('   429, esperando 90s', flush=True); time.sleep(90); continue
            return None
    return None


for k, t in IMAGENS.items():
    dest = os.path.join(AQUI, 'arte', k + '.jpg')
    if os.path.exists(dest):
        continue
    dados = None
    for u in urls(t):
        dados = baixa(u)
        if dados:
            break
    if not dados:
        print('FALHOU', k, flush=True); continue
    if t.lower().endswith('.png') and dados[:4] == b'\x89PNG':
        import io
        from PIL import Image
        Image.open(io.BytesIO(dados)).convert('RGB').save(dest, quality=93)
    else:
        open(dest, 'wb').write(dados)
    print('ok', k, len(dados) // 1024, 'KB', flush=True)
    time.sleep(8)
print('FIM', flush=True)
