import subprocess, glob
U="/root/.claude/uploads/05325f6e-240e-5d44-a300-d63cc78b57d0"
def src(n): return glob.glob(f"{U}/*IMG_{n}.mov")[0]
LOOK="eq=contrast=1.07:brightness=0.015:saturation=1.12,colorbalance=rs=0.04:gs=0.01:bs=-0.05:rm=0.03:bm=-0.04"
AF="highpass=f=90,afftdn=nf=-25,loudnorm=I=-14:TP=-1.5:LRA=11"
# (take, início, fim)
fala=[("abertura",2642,0.9,8.2)]
fim=[("queijo",2640,3.6,8.9),("esfriar",2644,2.6,8.3),("queimou",2645,0.6,6.0),("trembao",2647,4.6,7.9),("comenta",2649,0.0,9.0)]
def seg(nome,n,a,b):
    subprocess.run(["ffmpeg","-v","error","-y","-ss",str(a),"-i",src(n),"-t",f"{b-a:.3f}",
      "-vf",f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,{LOOK}",
      "-af",AF+",aresample=48000","-ac","2","-c:v","libx264","-preset","fast","-crf","18","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k",f"f_{nome}.mp4"],check=True)
    return f"f_{nome}.mp4"
partes=[seg(*f) for f in fala]
subprocess.run(["ffmpeg","-v","error","-y","-i","receita.mp4","-c:v","copy","-ac","2","-ar","48000","-c:a","aac","-b:a","192k","f_receita.mp4"],check=True)
partes.append("f_receita.mp4")
partes+=[seg(*f) for f in fim]
ins=sum([["-i",p] for p in partes],[]); n=len(partes)
fc="".join(f"[{i}:v][{i}:a]" for i in range(n))+f"concat=n={n}:v=1:a=1[v][a]"
subprocess.run(["ffmpeg","-v","error","-y",*ins,"-filter_complex",fc,"-map","[v]","-map","[a]",
  "-c:v","libx264","-preset","medium","-crf","19","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-movflags","+faststart","video_v3.mp4"],check=True)
