# Monta fala.wav: narração gravada (cortada por cortes-narrador.json) intercalada com as falas Qwen, seguindo ordem.tsv
import json,subprocess
C=json.load(open('cortes-narrador.json'))
ordem=[l.rstrip('\n').split('\t') for l in open('ordem.tsv',encoding='utf-8') if l.strip()]
dur=lambda f: float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
TRIM="silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse"
extra={'T00':0.3,'P01':0.3,'N02':0.4,'N03':0.6,'N04':0.7,'P04':0.3,'N05':0.4,'N06':0.5,'N07':1.0}
segs=[];t=0.3;prev=None   # abre com o título (titulo.wav, gravado pelo criador)
for id_,quem,texto in ordem:
    out=f'falas-final/{id_}.wav'
    if quem=='narrador':
        a,b=C[int(id_[1:])-1]; subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',str(a),'-to',str(b),'-i','narrador.wav','-af',TRIM,'-ac','1','-ar','48000',out],check=True)
    elif quem=='titulo': subprocess.run(['ffmpeg','-loglevel','error','-y','-i','titulo.wav','-af',TRIM,'-ac','1','-ar','48000',out],check=True)
    else: subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'falas-qwen/v_{id_}.wav','-af',TRIM,'-ac','1','-ar','48000',out],check=True)
    if prev: t+=(0.3 if prev==quem else 0.5)+extra.get(id_,0)
    d=dur(out); segs.append(dict(id=id_,quem=quem,texto=texto,de=round(t,3),ate=round(t+d,3))); t+=d; prev=quem
inp,flt=[],[]
for k,s in enumerate(segs):
    inp+=['-i',f"falas-final/{s['id']}.wav"]; ms=int(s['de']*1000); flt.append(f'[{k}]adelay={ms}|{ms}[a{k}]')
flt.append(''.join(f'[a{k}]' for k in range(len(segs)))+f'amix=inputs={len(segs)}:normalize=0,apad=pad_dur=3[o]')
subprocess.run(['ffmpeg','-loglevel','error','-y',*inp,'-filter_complex',';'.join(flt),'-map','[o]','-ar','48000','fala.wav'],check=True)
json.dump(segs,open('segmentos.json','w'),ensure_ascii=False,indent=1)
for s in segs: print(f"{s['id']} {s['quem']:<9}{s['de']:7.2f}-{s['ate']:7.2f} {s['texto'][:55]}")
