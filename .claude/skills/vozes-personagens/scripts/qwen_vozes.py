#!/usr/bin/env python3
"""Vozes NATURAIS com Qwen3-TTS VoiceDesign (local, CPU, licença Apache-2.0; skill qwen3-tts): a voz é descrita em
texto (idade, sexo, sotaque, emoção, ritmo) e o modelo fala como gente — sem engrossar nada no computador.
uso: python3 qwen_vozes.py roteiro.tsv elenco-qwen.json --pasta falas
roteiro.tsv: id <TAB> personagem <TAB> texto [<TAB> direção da fala, opcional: "sussurrando, com medo"]
elenco-qwen.json: { "tiao": "descrição fixa da voz do personagem (em inglês funciona melhor)", ... }
Instalação: pip install torch torchaudio transformers==4.57.3 accelerate==1.12.0 librosa soundfile onnxruntime einops;
pip install --no-deps qwen-tts; e um sox.py vazio no site-packages (o sox só é usado pelo tokenizer de 25 Hz).
"""
import sys, os, json, argparse, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
ap = argparse.ArgumentParser(); ap.add_argument('roteiro'); ap.add_argument('elenco'); ap.add_argument('--pasta', default='falas'); ap.add_argument('--refazer', action='store_true')
a = ap.parse_args(); os.makedirs(a.pasta, exist_ok=True); el = json.load(open(a.elenco))
torch.set_num_threads(os.cpu_count() or 4); torch.manual_seed(7)
m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
for linha in open(a.roteiro, encoding='utf-8'):
    if not linha.strip() or linha.startswith('#'): continue
    p = linha.rstrip('\n').split('\t'); id_, quem, txt = p[0], p[1], p[2]; dirc = p[3] if len(p) > 3 else ''
    out = f'{a.pasta}/v_{id_}.wav'
    if os.path.exists(out) and not a.refazer: continue
    ins = el[quem] + (f' In this line: {dirc}.' if dirc else '') + ' Speak naturally and fluidly like a real person in a conversation, Brazilian Portuguese.'
    w, sr = m.generate_voice_design(text=txt, language='Portuguese', instruct=ins)
    sf.write(out, w[0], sr); print(id_, quem, round(len(w[0]) / sr, 2), 's', flush=True)
