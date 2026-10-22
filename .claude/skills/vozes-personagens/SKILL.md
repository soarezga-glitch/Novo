---
name: vozes-personagens
description: Dá voz a cada personagem dos vídeos narrados (TikTok/Reels) a partir de um roteiro com NARRADOR e falas (ex.: "NARRADOR: ...", "TIÃO: ...", "SEU ZÉ (nervoso): ..."). Escolhe uma voz natural e diferente para cada um — narrador grave tipo apresentador de TV, protagonista, velho, criança, mulher, zumbi —, aplica o efeito da cena (atrás da porta, rádio, eco, rouco), monta a faixa com as pausas certas e gera segmentos.json (quem fala e quando) para o vídeo mexer a boca certa e mostrar a legenda/balão do personagem. Use sempre que o usuário mandar roteiro com vários personagens, pedir "voz para o narrador", "cada um com sua voz", dublagem, diálogo, ou reclamar que a voz está artificial/robótica.
---

# vozes-personagens — cada um com a sua voz

Feita a partir das skills achadas com a find-skills: **elevenlabs/skills@text-to-speech** (16 mil instalações, oficial da
ElevenLabs — a voz mais natural, com emoção e sussurro/grito) e **aahl/skills@edge-tts** (8 mil — vozes neurais da Microsoft,
grátis, ótimas em português). As duas estão instaladas em `.claude/skills/`.

## Regras do usuário
- Narrador: voz **grossa e natural, tipo apresentador de TV**. Nada de engrossar a voz no computador (`asetrate`/pitch forte):
  fica robótico — o usuário reprovou. Escolha uma voz que JÁ É grave.
- Cada personagem com voz própria e reconhecível; a mesma voz em todos os episódios (anote no elenco.json da série).
- Rubricas do roteiro viram interpretação: "(nervoso)" = mais rápido; "(baixo)" = mais lento e baixo; "(chorando)" = pausas;
  "(voz rouca e lenta)" = lento + rouco; "(batendo na porta)" = voz abafada atrás da porta + som de batida.
- Narração/vozes em **-10 LUFS** no fim (skill sons-de-ambiente) e efeitos sonoros por baixo.

## Motores (do melhor para o reserva)
| motor | qualidade | precisa |
|---|---|---|
| `elevenlabs` | a mais natural, com emoção | `ELEVENLABS_API_KEY` + `api.elevenlabs.io` liberado na rede do ambiente |
| `edge` | muito natural (neural) | `pip install edge-tts` + `speech.platform.bing.com` liberado na rede |
| `piper` | razoável, local | `pip install piper-tts` + vozes em `/root/piper` (huggingface `rhasspy/piper-voices` pt_BR: cadu, jeff, edresson, faber) |
| `kokoro` | robótica em pt | nada (`npx hyperframes tts`, vozes pm_alex, pm_santa, pf_dora) |

Vozes `edge` em pt-BR: **pt-BR-AntonioNeural** (homem, voz de locutor — narrador), pt-BR-FranciscaNeural e pt-BR-ThalitaNeural
(mulheres), e as multilíngues (`pt-BR-` + `--voice en-US-AndrewMultilingualNeural` etc. falam português) para variar os homens.
Rate/pitch leves (`--rate=-8% --pitch=-4Hz`) — nunca mais que isso.

## Fluxo
1. Roteiro → `roteiro.tsv` (`id<TAB>personagem<TAB>texto`), tirando as rubricas do texto e anotando no elenco.
2. `elenco.json` com a voz de cada personagem (+ `fx` da cena, + `pausa`).
3. **Amostra antes**: gere a primeira fala de cada personagem e mande para o usuário aprovar (ele ouve no celular).
4. `python3 scripts/montar_falas.py roteiro.tsv elenco.json --saida fala.wav` → `fala.wav` + `segmentos.json`.
5. Masterizar (-10 LUFS, skill sons-de-ambiente), transcrever para a legenda palavra por palavra e usar `segmentos.json`
   para: boca do personagem certo mexendo, cor/nome na legenda ("SEU ZÉ:"), balão de fala quando ele está fora da cena.

## Efeitos de cena prontos (`fx`)
- atrás da porta: `lowpass=f=2800,aecho=0.8:0.6:18:0.2`
- rádio/telefone: `highpass=f=400,lowpass=f=3200,acrusher=bits=12:mix=0.15`
- nervoso/tremendo: `vibrato=f=6:d=0.08`
- rouco/virando zumbi: `acrusher=bits=10:mix=0.2:mode=log,lowpass=f=2600,vibrato=f=4:d=0.15`
- narrador com presença: `equalizer=f=120:t=q:w=1:g=3,equalizer=f=3000:t=q:w=1.2:g=2,aecho=0.8:0.4:40:0.08`

## Voz de gente do interior e mais velha (pedido do usuário: "não pode soar adolescente")
- **Melhor caminho:** ElevenLabs. Ou gera direto com uma voz madura da biblioteca (busque "old man", "Brazilian",
  "raspy", "deep"), ou o usuário/um amigo grava a fala com sotaque e jeito do interior e a skill **voice-changer**
  (elevenlabs/skills@voice-changer, instalada) troca só o timbre, mantendo o sotaque, a emoção e o ritmo dele.
- **Local (piper):** baixar o tom 10–14% com `rubberband=pitch=0.86:formant=shifted` (soa maior/mais velho sem virar robô),
  falar mais pausado (`lento` 1,05–1,15), tremor de idade bem raso (`vibrato=f=5.5:d=0.03`), menos agudo (corte em 2,8 kHz).
- **Sotaque no texto** (só para a pronúncia; a legenda mostra o roteiro original): "sô", "uai", "bão", "homi", "trem", "cê".

## Fluidez (pedido do usuário: "está falando separado, in-por-tan-te, parece robô")
- Fala inteira e corrida, sem pausa onde não tem: piper com `lento` 0,92 e `ritmo` (noise-w) 0,9; kokoro com `velocidade` 1,12.
- Tirar do texto as vírgulas que não são pausa de verdade (ex.: "quem chega machucado espera vinte e quatro horas").
- Pausa só entre falas (a montagem cuida) e onde o roteiro pede ("..." = hesitação).
- Elenco da série Apocalipse Zumbi (escolha do usuário, "combinação B"): Tião = piper pt_BR-cadu-medium; Seu Zé = kokoro pm_santa. Sem efeito nenhum na voz.
