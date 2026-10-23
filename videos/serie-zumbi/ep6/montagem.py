# Montagem final, por partes (pouca memória): começo da história → abertura com a voz "Os Sobreviventes, episódio seis..." → resto do episódio
import json, subprocess
P = json.loads(open('legenda-dados.js').read().split('window.PALAVRAS = ', 1)[1].split(';\nwindow.SEGMENTOS')[0])
SEG = {s['id']: s for s in json.load(open('segmentos.json'))}
W = lambda i, n: [p for p in P if p['seg'] == i][n]['start']
a0 = round(W('N01', 7) - 0.1, 3)            # "E a Aninha está andando..."
corte = round(SEG['N03']['de'] - 0.1, 3)     # "Enquanto isso..." (cidade)
v0, v1 = 0.2, round(W('N01', 7) - 0.12, 3)    # "Os Sobreviventes. Episódio seis: Dimas, o motoqueiro."
AB = '../abertura3/abertura-os-sobreviventes.mp4'; TV = 12.45   # a voz entra quando o título aparece
ENC = ['-c:v', 'libx264', '-crf', '21', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2']
ff = lambda *a: subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *a], check=True)
ff('-ss', str(a0), '-to', str(corte), '-i', 'video.mp4', '-af', f'afade=t=out:st={corte - a0 - 0.25}:d=0.25', *ENC, 'parteA.mp4')
ff('-i', AB, '-i', 'fala_master.wav', '-filter_complex', f"[0:a]volume='if(gte(t,{TV - 0.2}),0.45,1)':eval=frame[m];[1:a]atrim={v0}:{v1},asetpts=PTS-STARTPTS,adelay={int(TV * 1000)}|{int(TV * 1000)},apad[vo];[m][vo]amix=inputs=2:normalize=0:duration=first[a]",
   '-map', '0:v', '-map', '[a]', *ENC, 'parteI.mp4')
ff('-ss', str(corte), '-i', 'video.mp4', *ENC, 'parteB.mp4')
open('partes.txt', 'w').write("file 'parteA.mp4'\nfile 'parteI.mp4'\nfile 'parteB.mp4'\n")
ff('-f', 'concat', '-safe', '0', '-i', 'partes.txt', '-c', 'copy', '-movflags', '+faststart', 'episodio6-dimas-o-motoqueiro.mp4')
print('ok', a0, corte, v1)
