# Montagem final: começo da história (Aninha → Seu Zé levantando) → abertura com "Os Sobreviventes, episódio seis..." na voz do narrador → resto do episódio
import json, subprocess
P = json.loads(open('legenda-dados.js').read().split('window.PALAVRAS = ', 1)[1].split(';\nwindow.SEGMENTOS')[0])
SEG = {s['id']: s for s in json.load(open('segmentos.json'))}
W = lambda i, n: [p for p in P if p['seg'] == i][n]['start']
a0 = round(W('N01', 7) - 0.1, 3)            # "E a Aninha está andando..."
corte = round(SEG['N03']['de'] - 0.1, 3)     # "Enquanto isso..." (cidade)
v0, v1 = 0.2, round(W('N01', 7) - 0.12, 3)    # "Os Sobreviventes. Episódio seis: Dimas, o motoqueiro."
AB = '../abertura/abertura-os-sobreviventes.mp4'; TV = 11.85   # a voz entra quando o título aparece
fc = (f"[0:v]trim={a0}:{corte},setpts=PTS-STARTPTS[va];[0:a]atrim={a0}:{corte},asetpts=PTS-STARTPTS,afade=t=out:st={corte - a0 - 0.25}:d=0.25[aa];"
      f"[0:v]trim=start={corte},setpts=PTS-STARTPTS[vb];[0:a]atrim=start={corte},asetpts=PTS-STARTPTS[ab];"
      f"[1:v]setpts=PTS-STARTPTS,fps=30[vi];[1:a]volume='if(gte(t,{TV - 0.2}),0.45,1)':eval=frame[mi];"
      f"[2:a]atrim={v0}:{v1},asetpts=PTS-STARTPTS,adelay={int(TV * 1000)}|{int(TV * 1000)},apad[vo];[mi][vo]amix=inputs=2:normalize=0:duration=first[ai];"
      f"[va][aa][vi][ai][vb][ab]concat=n=3:v=1:a=1[v][a]")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'video.mp4', '-i', AB, '-i', 'fala_master.wav', '-filter_complex', fc, '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-crf', '21', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', 'episodio6-dimas-o-motoqueiro.mp4'], check=True)
print('ok', a0, corte, v1)
