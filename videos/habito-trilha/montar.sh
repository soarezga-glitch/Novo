#!/bin/bash
# Junta o vídeo gravado (embaixo) + camada animada (camada.mov, de render.js) em tela dividida 1080x1920,
# com zooms nas palavras-chave e efeitos sonoros leves nas trocas de imagem.
# Uso: ./montar.sh <video-original.mov> <camada.mov> <pasta-temporaria>
set -e
F="$1"; CAMADA="$2"; S="$3"
cd "$(dirname "$0")"

ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.35:c=pink:a=0.6" -af "bandpass=f=1800:w=1500,afade=t=in:d=0.12,afade=t=out:st=0.12:d=0.23,volume=0.5" -ar 48000 -ac 2 $S/whoosh.wav
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.6*sin(2*PI*(500+900*t)*t)*exp(-25*t)':d=0.18" -ar 48000 -ac 2 $S/pop.wav

WT="2.0 4.0 6.2 7.98 10.0 12.0 14.0 16.0 17.98 19.13 22.2 25.15 27.13 30.03 32.45 34.4"   # trocas de cena (whoosh)
PT="1.12 11.3 13.2 13.38 13.56 24.0 27.45 28.55 30.6 35.1 35.9"                           # palavras de impacto (pop)
IN=""; FL=""; L=""; i=2
for t in $WT; do ms=$(python3 -c "print(int($t*1000-120))"); IN="$IN -i $S/whoosh.wav"; FL="$FL[$i:a]adelay=$ms|$ms[s$i];"; L="$L[s$i]"; i=$((i+1)); done
for t in $PT; do ms=$(python3 -c "print(int($t*1000))"); IN="$IN -i $S/pop.wav"; FL="$FL[$i:a]adelay=$ms|$ms,volume=0.6[s$i];"; L="$L[s$i]"; i=$((i+1)); done
N=$((i-2))

ZS="between(t,6.2,10)+between(t,14,16)+between(t,19.13,22.2)+between(t,24,25.15)+between(t,30.03,32.45)"  # zoom (tela dividida)
ZF="between(t,1.12,2.0)+between(t,33.9,34.5)"                                                          # zoom (tela cheia)

ffmpeg -v error -y -i "$F" -i "$CAMADA" $IN -filter_complex "\
[0:v]setpts=PTS-STARTPTS,split=4[n1][z1][n2][z2];\
[n1]scale=1080:1920,crop=1080:960:0:360[sn];\
[z1]scale=1242:2208,crop=1080:960:81:500[sz];\
[sn][sz]overlay=0:0:enable='$ZS'[sp];\
[sp]pad=1080:1920:0:960:black[spc];\
[n2]scale=1080:1920[fn];\
[z2]scale=1242:2208,crop=1080:1920:81:140[fz];\
[fn][fz]overlay=0:0:enable='$ZF'[full];\
[spc][full]overlay=0:0:enable='between(t,0,2.1)+between(t,32.55,34.55)'[base];\
[base][1:v]overlay=0:0,format=yuv420p[v];\
${FL}[0:a]aresample=48000[voz];[voz]${L}amix=inputs=$((N+1)):normalize=0:duration=first[a]" \
-map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 19 -r 30 -c:a aac -b:a 192k -movflags +faststart -t 36.45 habito-trilha-tiktok.mp4
