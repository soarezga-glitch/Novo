#!/usr/bin/env bash
# do áudio do narrador ao vídeo final do episódio (com a abertura na frente). uso: ./fazer.sh narrador.mp3
set -e
cd "$(dirname "$0")"
ffmpeg -loglevel error -y -i "$1" -ac 1 -ar 48000 narrador.wav
mkdir -p tr-narr falas-final
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt npx hyperframes transcribe narrador.wav -d tr-narr -m small -l pt --json > tr-narr/log 2>&1 < /dev/null
python3 cortar.py narrador.wav
python3 montar.py
bash /home/user/Novo/.claude/skills/vozes-personagens/scripts/preparar_faixa.sh fala.wav segmentos.json
python3 partitura.py
