import subprocess, glob, os
U="/root/.claude/uploads/05325f6e-240e-5d44-a300-d63cc78b57d0"
def src(n): return glob.glob(f"{U}/*IMG_{n}.mov")[0]
import json, wave
MAP=json.load(open("map.json"))
_w=wave.open("narr_tight.wav"); TOTAL=_w.getnframes()/_w.getframerate()
def nt(t):
    for i,(s0,e0,p) in enumerate(MAP):
        if t<s0: return p
        if t<e0: return p+(t-s0)
    return TOTAL
# (narr_inicio, narr_fim, take, inicio_no_take, filtro extra)
Z_QUEIJO="crop=560:996:290:900,"
Z_FOGO="crop=920:1636:80:284,"
cuts=[(1.9,9.0,2616,3.0,""),
 (9.0,12.0,2618,2.2,""),
 (12.0,16.6,2616,10.0,Z_QUEIJO),
 (16.6,18.3,2619,1.7,""),
 (18.3,19.6,2619,12.6,""),
 (19.6,22.8,2619,6.4,""),
 (22.8,25.8,2619,16.8,""),
 (25.8,30.3,2620,4.5,""),
 (30.3,31.9,2621,1.0,Z_FOGO),
 (31.9,33.2,2622,8.0,""),
 (33.2,35.3,2623,0.0,""),
 (35.3,40.4,2624,0.5,""),
 (40.4,43.4,2626,1.8,""),
 (43.4,44.7,2627,2.5,""),
 (44.7,47.6,2629,2.5,""),
 (47.6,51.5,2630,1.0,""),
 (51.5,55.5,2631,0.5,""),
 (55.5,57.7,2632,0.5,""),
 (57.7,62.4,2634,0.3,""),
 (62.4,64.4,2635,6.0,""),
 (64.4,65.2,2637,0.3,""),
 (65.2,67.7,2639,0.0,"")]
LOOK="eq=contrast=1.07:brightness=0.015:saturation=1.12,colorbalance=rs=0.04:gs=0.01:bs=-0.05:rm=0.03:bm=-0.04"
os.makedirs("seg",exist_ok=True); lst=open("seg/list.txt","w")
for i,(a,b,n,t0,ex) in enumerate(cuts):
    d=(TOTAL if i==len(cuts)-1 else nt(b))-(0 if i==0 else nt(a)); print(n,round(d,2)); o=f"seg/{i:02d}.mp4"
    subprocess.run(["ffmpeg","-v","error","-y","-ss",str(t0),"-i",src(n),"-t",f"{d:.3f}","-an",
      "-vf",f"{ex}scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,{LOOK}",
      "-c:v","libx264","-preset","fast","-crf","18","-pix_fmt","yuv420p",o],check=True)
    lst.write(f"file '{i:02d}.mp4'\n")
lst.close()
subprocess.run("ffmpeg -v error -y -f concat -safe 0 -i seg/list.txt -c copy video_mudo.mp4",shell=True,check=True)
subprocess.run(["ffmpeg","-v","error","-y","-i","video_mudo.mp4","-i","narr_tight.wav",
  "-af","highpass=f=80,afftdn=nf=-25,loudnorm=I=-14:TP=-1.5:LRA=11",
  "-map","0:v","-map","1:a","-c:v","copy","-c:a","aac","-b:a","192k","-ar","48000","-shortest","receita.mp4"],check=True)
