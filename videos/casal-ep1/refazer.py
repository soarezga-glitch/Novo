import json, torch, soundfile as sf, sys
from qwen_tts import Qwen3TTSModel
el = json.load(open('elenco-qwen.json'))
m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
J = [('P01','ela','Tá tudo bem.','cold, dry, annoyed, pretending she is fine, short, clear words'),
     ('P02','ele','Amor... tem certeza?','cautious, a little scared, asking a question with rising intonation, hesitating after amor')]
for id_, q, t, d in J:
    for s in (11, 23, 42):
        torch.manual_seed(s)
        w, sr = m.generate_voice_design(text=t, language='Portuguese', instruct=el[q] + f' In this line: {d}. Speak naturally, Brazilian Portuguese.')
        sf.write(f'cand_{id_}_{s}.wav', w[0], sr); print(id_, s, len(w[0])/sr, flush=True)
