# Corta a gravação do narrador fala por fala: alinha o texto do roteiro (ordem.tsv) com a transcrição palavra a palavra
# e corta no ponto mais silencioso entre o fim de uma fala e o começo da próxima. uso: python3 cortar.py narrador.wav
import json, re, sys, subprocess, unicodedata, difflib, numpy as np
WAV = sys.argv[1]
def norm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', w)
NUM = {'3': 'tres', '1': 'um', '2': 'dois'}
tr = json.load(open('tr-narr/transcript.json')); tr = tr if isinstance(tr, list) else tr['words']
tw = [NUM.get(norm(x['text']), norm(x['text'])) for x in tr]
linhas = [l.rstrip('\n').split('\t') for l in open('ordem.tsv', encoding='utf-8') if l.strip()]
narr = [(i, t) for i, q, t in linhas if q == 'narrador']
sw, ini = [], []
for i, t in narr: ini.append(len(sw)); sw += [norm(w) for w in t.replace('...', ' ').replace('…', ' ').split() if norm(w)]
M = {}
for a, b, n in difflib.SequenceMatcher(None, sw, tw, autojunk=False).get_matching_blocks():
    for k in range(n): M[a + k] = b + k
def tidx(si):   # índice na transcrição da palavra si do roteiro (ou a casada mais próxima depois)
    for d in range(0, 8):
        if si + d in M: return M[si + d] - d
    raise SystemExit(f'não achei a fala que começa na palavra {si}: {sw[si:si+4]}')
d = subprocess.check_output(['ffmpeg', '-loglevel', 'error', '-i', WAV, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-']); x = np.frombuffer(d, np.float32)
e = np.array([np.sqrt((x[i:i + 480] ** 2).mean()) for i in range(0, len(x) - 480, 480)])
T = len(x) / 48000; cortes = [0.0]
for k in range(1, len(narr)):
    fim = ini[k] - 1                           # última palavra da fala anterior que casou → a próxima palavra é o começo desta fala
    while fim > 0 and fim not in M: fim -= 1
    j = max(1, M[fim] + 1 + (ini[k] - 1 - fim)) if fim in M else max(1, tidx(ini[k]))
    j = min(j, len(tr) - 1); lo, hi = tr[j - 1]['end'] - 0.05, tr[j]['start'] + 0.1
    a0, b0 = int(lo * 100), int(hi * 100); m = a0 + int(np.argmin(e[a0:b0])) if b0 > a0 else int(tr[j]['start'] * 100) - 5
    # recua até o começo do som da próxima fala não vazar (procura o último ponto silencioso antes da palavra)
    db = 20 * np.log10(e + 1e-9); 
    m0 = m
    while m > m0 - 60 and db[m] > -42: m -= 1   # se caiu no meio da fala, volta (até 0,6 s) até o silêncio
    if db[m] > -42: m = m0
    cortes.append(m / 100); print(narr[k][0], f'{m/100:7.2f}', ' '.join(x['text'] for x in tr[j - 1:j + 2]))
cortes.append(T)
json.dump([[cortes[k], cortes[k + 1]] for k in range(len(narr))], open('cortes-narrador.json', 'w'))
print('ok', len(narr), 'falas')
