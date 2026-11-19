"""Baixa as pinturas de cenas.IMAGENS do acervo WikiArt (Hugging Face, Artificio/WikiArt_Full).
Lê só as linhas necessárias dos arquivos parquet (pedidos parciais por HTTP).
uso: python3 -I baixar_arte.py   (primeira vez cria arte/indice.json com título/artista de cada obra)
"""
import os, sys, json, io
import fsspec, pyarrow.parquet as pq
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from cenas import IMAGENS
URL = "https://huggingface.co/datasets/Artificio/WikiArt_Full/resolve/refs%2Fconvert%2Fparquet/default/train/{:04d}.parquet"
ARTISTAS = {a for a, _ in IMAGENS.values()}
fs = fsspec.filesystem("http")
os.makedirs(os.path.join(AQUI, 'arte'), exist_ok=True)
IDX = os.path.join(AQUI, 'arte', 'indice.json')

if os.path.exists(IDX):
    indice = json.load(open(IDX))
else:
    indice = []
    for i in range(7):
        with fs.open(URL.format(i), "rb", block_size=2**20) as f:
            p = pq.ParquetFile(f)
            for g in range(p.num_row_groups):
                for j, r in enumerate(p.read_row_group(g, columns=["title", "artist"]).to_pylist()):
                    if r["artist"] in ARTISTAS:
                        indice.append([i, g, j, r["title"].strip(), r["artist"]])
    json.dump(indice, open(IDX, 'w'), ensure_ascii=False)

pedidos = {}
for k, (art, tit) in IMAGENS.items():
    if os.path.exists(os.path.join(AQUI, 'arte', k + '.jpg')):
        continue
    achou = [x for x in indice if x[4] == art and x[3] == tit.strip()]
    if not achou:
        print('NÃO ACHEI', k, art, tit); continue
    i, g, j = achou[0][:3]
    pedidos.setdefault((i, g), []).append((j, k))

for (i, g), itens in sorted(pedidos.items()):
    with fs.open(URL.format(i), "rb", block_size=2**22) as f:
        col = pq.ParquetFile(f).read_row_group(g, columns=["image"]).column(0).to_pylist()
    for j, k in itens:
        dados = col[j]["bytes"]
        from PIL import Image
        im = Image.open(io.BytesIO(dados)).convert('RGB')
        im.save(os.path.join(AQUI, 'arte', k + '.jpg'), quality=94)
        print('ok', k, im.size, flush=True)
print('FIM')
