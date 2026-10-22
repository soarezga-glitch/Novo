# corta o vídeo completo do dia 3 em PARTE 2 e PARTE 3 (no gancho "são muitos mais") e cola abertura/final de cada parte
import json, subprocess
SEG = {s['id']: s for s in json.load(open('completo/segmentos.json'))}
FIM = SEG['P25']['ate'] + 0.35
cortA = SEG['N16']['ate'] + 0.08
cortB = SEG['N17']['de'] - 0.05
def junta(partes, saida):
    inp = []; flt = []
    for i, (arq, a, b) in enumerate(partes):
        inp += ['-i', arq]; tr = f'trim={a}:{b},' if b else ''; atr = f'atrim={a}:{b},' if b else ''
        flt.append(f'[{i}:v]{tr}setpts=PTS-STARTPTS,fps=30,format=yuv420p[v{i}];[{i}:a]{atr}asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.05,afade=t=out:st={max(0,(b or 99)-a-0.25) if b else 99}:d=0.25[a{i}]')
    n = len(partes); flt.append(''.join(f'[v{i}][a{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=1[v][a]')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *inp, '-filter_complex', ';'.join(flt), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', saida], check=True)
junta([('completo/video.mp4', 0, round(cortA, 3)), ('vinhetas/cartaoP2.mp4', 0, None)], 'dia3-parte2.mp4')
junta([('vinhetas/ganchoP3.mp4', 0, None), ('completo/video.mp4', round(cortB, 3), round(FIM, 3)), ('vinhetas/cartaoP3.mp4', 0, None)], 'dia3-parte3.mp4')
for f in ['dia3-parte2.mp4', 'dia3-parte3.mp4']: print(f, subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode().strip())
