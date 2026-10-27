import wave, numpy as np, json
SR=48000
w=wave.open("narr48.wav"); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)
sil=[tuple(map(float,l.split())) for l in open("sil.txt") if len(l.split())==2]
# regiões de fala
reg=[]; prev=0.0
for s,e in sil:
    if s>prev: reg.append([prev,s])
    prev=e
reg=[r for r in reg if r[1]-r[0]>0.05]
# agrupa pausas pequenas (<0.2s) dentro da mesma região
m=[reg[0]]
for r in reg[1:]:
    if r[0]-m[-1][1]<0.2: m[-1][1]=r[1]
    else: m.append(r)
PRE,POST=0.03,0.07
OVER=0.12   # entre frases: próxima entra antes da anterior acabar
GAPIN=0.05  # pausa interna vira quase nada
out=np.zeros(len(a)+SR,dtype=np.float32); pos=0.0; mapping=[]
for i,(s,e) in enumerate(m):
    s0=max(0,s-PRE); e0=min(len(a)/SR,e+POST)
    seg=a[int(s0*SR):int(e0*SR)].copy()
    fi=int(0.015*SR); fo=int(0.06*SR)
    seg[:fi]*=np.linspace(0,1,fi); seg[-fo:]*=np.linspace(1,0,fo)
    if i>0:
        gap=s-m[i-1][1]
        pos = pos - OVER if gap>=0.4 else pos + GAPIN
        pos=max(pos,0)
    st=int(pos*SR); out[st:st+len(seg)]+=seg
    mapping.append((s0,e0,pos)); pos+= (e0-s0)
out=out[:int(pos*SR)+int(0.3*SR)]
out=np.clip(out,-32768,32767).astype(np.int16)
o=wave.open("narr_tight.wav","wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes(out.tobytes())
json.dump(mapping,open("map.json","w"))
print(len(m),"trechos; antes",round(len(a)/SR,1),"s -> depois",round(len(out)/SR,1),"s")
