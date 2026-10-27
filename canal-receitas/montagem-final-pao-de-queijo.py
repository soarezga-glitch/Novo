import subprocess, glob
U="/root/.claude/uploads/05325f6e-240e-5d44-a300-d63cc78b57d0"
def src(n): return glob.glob(f"{U}/*IMG_{n}.mov")[0]
def run(*a): subprocess.run(["ffmpeg","-v","error","-y",*a],check=True)
LOOK="eq=contrast=1.07:brightness=0.015:saturation=1.12,colorbalance=rs=0.04:gs=0.01:bs=-0.05:rm=0.03:bm=-0.04"
FPS=30
# som natural: mesmo ganho em todos os takes de fala, sem normalizar take por take
FALA_AF="highpass=f=80,volume=9dB,alimiter=limit=0.89:level=false"
partes=[("abertura",2642,0.9,8.2),"receita",("queijo",2640,3.6,8.9),("esfriar",2644,2.6,8.3),
        ("queimou",2645,0.6,6.0),("trembao",2647,4.6,7.9),("comenta",2649,0.0,9.0)]
vids=[]; auds=[]
for p in partes:
    if p=="receita":
        d=float(subprocess.check_output(["ffprobe","-v","error","-select_streams","v","-show_entries","stream=duration","-of","csv=p=0","receita.mp4"]))
        d=round(d*FPS)/FPS
        run("-i","receita.mp4","-an","-c:v","copy","v_receita.mp4")
        run("-i","narr_tight.wav","-af",f"highpass=f=80,afftdn=nf=-25,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,apad,atrim=0:{d}","-ac","2","-c:a","pcm_s16le","a_receita.wav")
        vids.append("v_receita.mp4"); auds.append("a_receita.wav"); continue
    nome,n,a,b=p; d=round((b-a)*FPS)/FPS
    run("-ss",str(a),"-i",src(n),"-t",f"{d:.4f}","-an","-vf",f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps={FPS},{LOOK}",
        "-c:v","libx264","-preset","fast","-crf","18","-pix_fmt","yuv420p",f"v_{nome}.mp4")
    run("-ss",str(a),"-i",src(n),"-vn","-af",f"{FALA_AF},aresample=48000,apad,atrim=0:{d}","-ac","2","-c:a","pcm_s16le",f"a_{nome}.wav")
    vids.append(f"v_{nome}.mp4"); auds.append(f"a_{nome}.wav")
open("vl.txt","w").write("".join(f"file '{v}'\n" for v in vids))
open("al.txt","w").write("".join(f"file '{a}'\n" for a in auds))
run("-f","concat","-safe","0","-i","vl.txt","-c","copy","v_all.mp4")
run("-f","concat","-safe","0","-i","al.txt","-c","copy","a_all.wav")
run("-i","v_all.mp4","-i","a_all.wav","-map","0:v","-map","1:a","-c:v","libx264","-preset","medium","-crf","19","-pix_fmt","yuv420p",
    "-c:a","aac","-b:a","192k","-movflags","+faststart","video_v4.mp4")
