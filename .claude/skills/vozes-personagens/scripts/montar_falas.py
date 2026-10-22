#!/usr/bin/env python3
"""Gera cada fala do roteiro com a voz do personagem e monta a faixa de narração (skill vozes-personagens).

uso: python3 montar_falas.py roteiro.tsv elenco.json --saida fala.wav
roteiro.tsv: id <TAB> personagem <TAB> texto   (uma fala por linha; linhas com # são ignoradas)
elenco.json: { "narrador": {"motor": "edge", "voz": "pt-BR-AntonioNeural", "rate": "-8%", "pitch": "-6Hz", "fx": "..."}, ... }
  motor: "edge" (vozes neurais da Microsoft — precisa de speech.platform.bing.com liberado na rede),
         "elevenlabs" (a mais natural, com emoção — precisa de ELEVENLABS_API_KEY e api.elevenlabs.io liberado),
         "piper" (local, sem internet — /root/piper/pt_BR-*.onnx), "kokoro" (local, npx hyperframes tts)
  fx: filtros de ffmpeg da cena (ex.: voz atrás da porta = "lowpass=f=2800,aecho=0.8:0.6:18:0.2"); nada de engrossar com asetrate (fica robótico)
  pausa: segundos de silêncio antes da fala (padrão: 0,35 mesmo personagem, 0,55 troca de personagem)
Saída: fala.wav + segmentos.json (quem fala, de, até, texto) para o vídeo saber de quem é a boca/legenda.
"""
import json, os, subprocess, sys, argparse
ap = argparse.ArgumentParser(); ap.add_argument('roteiro'); ap.add_argument('elenco'); ap.add_argument('--saida', default='fala.wav'); ap.add_argument('--pasta', default='falas')
a = ap.parse_args(); os.makedirs(a.pasta, exist_ok=True)
elenco = json.load(open(a.elenco))
env = dict(os.environ, NODE_USE_ENV_PROXY='1', NODE_EXTRA_CA_CERTS='/root/.ccr/ca-bundle.crt')
def gerar(c, texto, out):
    m = c.get('motor', 'piper')
    if m == 'edge':
        subprocess.run(['edge-tts', '--voice', c['voz'], f"--rate={c.get('rate', '+0%')}", f"--pitch={c.get('pitch', '+0Hz')}", '--text', texto, '--write-media', out + '.mp3'], check=True)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', out + '.mp3', out], check=True)
    elif m == 'elevenlabs':
        from elevenlabs import ElevenLabs
        au = ElevenLabs().text_to_speech.convert(text=texto, voice_id=c['voz'], model_id=c.get('modelo', 'eleven_v3'), output_format='mp3_44100_128')
        with open(out + '.mp3', 'wb') as fh: [fh.write(x) for x in au]
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', out + '.mp3', out], check=True)
    elif m == 'piper':
        subprocess.run([sys.executable, '-m', 'piper', '-m', f"/root/piper/{c['voz']}.onnx", '-f', out, '--length-scale', str(c.get('lento', 0.92)), '--noise-w-scale', str(c.get('ritmo', 0.9)), '--sentence-silence', '0.12'], input=texto.encode(), check=True)
    else:
        subprocess.run(['npx', 'hyperframes', 'tts', texto, '--voice', c['voz'], '--speed', str(c.get('velocidade', 1.12)), '-o', out], check=True, env=env, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
segs, t, prev = [], 0.25, None
for linha in open(a.roteiro, encoding='utf-8'):
    if not linha.strip() or linha.startswith('#'): continue
    p = linha.rstrip('\n').split('\t'); id_, quem, texto = p[0], p[1], p[-1]
    c = elenco[quem]; raw, fin = f'{a.pasta}/raw_{id_}.wav', f'{a.pasta}/v_{id_}.wav'
    if not os.path.exists(raw): gerar(c, texto, raw)
    fx = c.get('fx', 'anull')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af', fx, '-ac', '1', '-ar', '48000', fin], check=True)
    if prev is not None: t += c.get('pausa', 0.35 if prev == quem else 0.55)
    d = dur(fin); segs.append(dict(id=id_, quem=quem, texto=texto, de=round(t, 3), ate=round(t + d, 3))); t += d; prev = quem
inp, flt = [], []
for k, s in enumerate(segs):
    inp += ['-i', f"{a.pasta}/v_{s['id']}.wav"]; ms = int(s['de'] * 1000); flt.append(f'[{k}]adelay={ms}|{ms}[a{k}]')
flt.append(''.join(f'[a{k}]' for k in range(len(segs))) + f'amix=inputs={len(segs)}:normalize=0,apad=pad_dur=0.5[o]')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *inp, '-filter_complex', ';'.join(flt), '-map', '[o]', '-ar', '48000', a.saida], check=True)
json.dump(segs, open('segmentos.json', 'w'), ensure_ascii=False, indent=1)
for s in segs: print(f"{s['id']} {s['quem']:<10} {s['de']:6.2f}–{s['ate']:6.2f}  {s['texto'][:60]}")
