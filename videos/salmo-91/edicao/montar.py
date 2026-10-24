"""Joins the clips, lays the text tags over them, mixes voice + music, normalizes.

usage: python3 -I montar.py OUT.mp4
"""
import json, subprocess, sys

TOTAL = 836.4
tags = json.load(open('tags.json'))

subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', 'lista_full.txt',
                '-c', 'copy', 'video_sem_texto.mp4'], check=True)

inputs = ['-i', 'video_sem_texto.mp4', '-i', 'narracao_fluida.wav', '-i', 'musica_full.wav']
graph = []
last = '0:v'
for k, t in enumerate(tags):
    dur = t['b'] - t['a']
    inputs += ['-loop', '1', '-framerate', '30', '-t', f'{dur:.2f}', '-i', t['png']]
    idx = 3 + k
    graph.append(f"[{idx}:v]format=rgba,fade=t=in:st=0:d=0.45:alpha=1,"
                 f"fade=t=out:st={dur - 0.45:.2f}:d=0.45:alpha=1,setpts=PTS+{t['a']:.2f}/TB[t{k}]")
    graph.append(f"[{last}][t{k}]overlay=x={t['x']}:y={t['y']}:eof_action=pass[v{k}]")
    last = f'v{k}'
graph.append("[1:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit[voz][chave]")
graph.append("[2:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.16[mus]")
graph.append("[mus][chave]sidechaincompress=threshold=0.02:ratio=3:attack=80:release=900[musd]")
graph.append("[voz][musd]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=11[a]")
open('graph.txt', 'w').write(';\n'.join(graph))

subprocess.run(['ffmpeg', '-y', '-v', 'error', *inputs, '-filter_complex_script', 'graph.txt',
                '-map', f'[{last}]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
                '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
                '-t', f'{TOTAL}', '-movflags', '+faststart', sys.argv[1]], check=True)
print('ok', sys.argv[1])
