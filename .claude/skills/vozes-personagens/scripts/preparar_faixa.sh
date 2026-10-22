#!/usr/bin/env bash
# Masteriza a faixa (-10 LUFS), transcreve, gera legenda-dados.js (palavras do roteiro com o tempo da transcrição
# e quem fala) e bocas.js (boca de cada personagem mexendo pelo volume da voz). uso: preparar_faixa.sh fala.wav segmentos.json
set -e
F="$1"; SEG="$2"; D=$(dirname "$F")
CH="highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,equalizer=f=3000:t=q:w=1.2:g=2"
J=$(ffmpeg -i "$F" -af "$CH,loudnorm=I=-10:TP=-1:LRA=9:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -loglevel error -y -i "$F" -af "$CH,loudnorm=I=-10:TP=-1:LRA=9:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 "$D/fala_master.wav"
ffmpeg -loglevel error -y -i "$D/fala_master.wav" -b:a 192k "$D/fala.mp3"
mkdir -p "$D/tr"; NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt npx hyperframes transcribe "$F" -d "$D/tr" -m small -l pt --json > "$D/tr/log" 2>&1 < /dev/null
python3 - "$D" "$SEG" <<'PY'
import json,re,sys,subprocess,numpy as np
D,SEG=sys.argv[1],sys.argv[2]
w=json.load(open(f'{D}/tr/transcript.json')); w=w if isinstance(w,list) else w['words']
segs=json.load(open(SEG)); P=[]
for s in segs:
    ws=s['texto'].replace('...','…').split()
    ww=[x for x in w if x['start']>=s['de']-0.15 and x['start']<s['ate']]
    if len(ww)==len(ws): tm=[(x['start'],x['end']) for x in ww]
    else:
        L=[len(re.sub(r'\W','',x))+1 for x in ws]; tot=sum(L); a=s['de']; tm=[]
        for l in L: d=(s['ate']-s['de'])*l/tot; tm.append((a,a+d)); a+=d
    for t,(a,b) in zip(ws,tm): P.append(dict(text=t,start=round(a,2),end=round(b,2),id=f'w{len(P)}',quem=s['quem'],seg=s['id']))
open(f'{D}/legenda-dados.js','w').write('window.PALAVRAS = '+json.dumps(P,ensure_ascii=False)+';\nwindow.SEGMENTOS = '+json.dumps(segs,ensure_ascii=False)+';\n')
d=subprocess.check_output(['ffmpeg','-loglevel','error','-i',f'{D}/fala_master.wav','-f','f32le','-ac','1','-ar','48000','-']); x=np.frombuffer(d,np.float32)
n=int(len(x)/1600); r=np.array([np.sqrt((x[i*1600:(i+1)*1600]**2).mean()) for i in range(n)])
B={}
for q in sorted({s['quem'] for s in segs if s['quem']!='narrador'}):
    o=['-']*n
    for s in segs:
        if s['quem']!=q: continue
        a,b=int(s['de']*30),min(int(s['ate']*30),n); m=r[a:b].max()+1e-9
        for i in range(a,b): v=r[i]/m; o[i]='0' if v<0.12 else '1' if v<0.3 else '2' if v<0.55 else '3'
    B[q]=''.join(o)
open(f'{D}/bocas.js','w').write('window.BOCAS = '+json.dumps(B)+';\n')
print('palavras',len(P))
PY
