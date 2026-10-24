set -e
cd "$(dirname "$0")"
run() { python3 -I whiteboard.py "$@" > /dev/null; }
run "/home/user/Novo/videos/salmo-91/imagens/imagem-01.png" mao_real.png clip_01.mp4 14.90 --seg 0:666:0.00 --seg 666:1252:4.80 --seg 1252:1920:8.10 --zoom 1.04 &
run "img02_esq.png" mao_real.png clip_02.mp4 32.20  --zoom 1.18 --focus 1080,590 &
run "card_aline.png" mao_real.png clip_03.mp4 8.70  --fast --zoom 1.04 &
run "img02_dir.png" mao_real.png clip_04.mp4 8.60  --zoom 1.10 --focus 654,639 &
run "cap1.png" mao_real.png clip_05.mp4 3.10  --fast --zoom 1.03 &
run "v1.png" mao_real.png clip_06.mp4 7.10  --fast --zoom 1.04 &
wait
run "/home/user/Novo/videos/salmo-91/imagens/imagem-03.png" mao_real.png clip_07.mp4 47.90 --seg 0:629:0.00 --seg 629:1280:3.40 --seg 1280:1920:21.10 --zoom 1.05 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-04.png" mao_real.png clip_08.mp4 38.80  --zoom 1.14 --focus 574,310 &
run "cap2.png" mao_real.png clip_09.mp4 2.30  --fast --zoom 1.02 &
run "v2.png" mao_real.png clip_10.mp4 16.40  --fast --zoom 1.06 &
run "card_4nomes.png" mao_real.png clip_11.mp4 17.00 --seg 0:480:0.00 --seg 480:960:2.60 --seg 960:1440:5.70 --seg 1440:1920:9.70 --fast --zoom 1.04 --panzoom 1.0 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-05.png" mao_real.png clip_12.mp4 31.50 --seg 0:631:0.00 --seg 631:1277:11.90 --seg 1277:1920:20.30 --zoom 1.04 &
wait
run "/home/user/Novo/videos/salmo-91/imagens/imagem-06.png" mao_real.png clip_13.mp4 50.20  --zoom 1.15 --focus 960,560 &
run "cap3.png" mao_real.png clip_14.mp4 2.10  --fast --zoom 1.02 &
run "v3.png" mao_real.png clip_15.mp4 7.20  --fast --zoom 1.04 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-07.png" mao_real.png clip_16.mp4 41.20 --seg 0:632:0.00 --seg 632:1280:17.60 --seg 1280:1920:34.00 --zoom 1.04 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-08.png" mao_real.png clip_17.mp4 21.40 --seg 0:965:0.00 --seg 965:1920:10.30 --zoom 1.04 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-09.png" mao_real.png clip_18.mp4 16.40  --zoom 1.12 --focus 600,560 &
wait
run "cap4.png" mao_real.png clip_19.mp4 2.10  --fast --zoom 1.02 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-10.png" mao_real.png clip_20.mp4 49.30 --seg 0:615:0.00 --seg 615:1301:9.60 --seg 1301:1920:30.30 --zoom 1.05 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-11.png" mao_real.png clip_21.mp4 22.80  --zoom 1.14 --focus 700,300 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-cta.png" mao_real.png clip_22.mp4 11.80  --zoom 1.04 &
run "cap5.png" mao_real.png clip_23.mp4 8.00  --fast --zoom 1.05 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-12.png" mao_real.png clip_24.mp4 36.70 --seg 0:630:0.00 --seg 630:1278:3.30 --seg 1278:1920:27.30 --zoom 1.05 &
wait
run "/home/user/Novo/videos/salmo-91/imagens/imagem-13.png" mao_real.png clip_25.mp4 23.30 --seg 0:965:0.00 --seg 965:1920:9.60 --zoom 1.04 &
run "cap6.png" mao_real.png clip_26.mp4 9.60  --fast --zoom 1.05 &
run "v11.png" mao_real.png clip_27.mp4 9.70  --fast --zoom 1.04 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-14.png" mao_real.png clip_28.mp4 33.20 --seg 0:965:0.00 --seg 965:1920:13.20 --zoom 1.05 &
run "card_compare.png" mao_real.png clip_29.mp4 21.20 --seg 0:965:0.00 --seg 965:1920:11.10 --fast --zoom 1.03 --panzoom 1.0 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-15.png" mao_real.png clip_30.mp4 65.80 --seg 0:965:0.00 --seg 965:1920:39.40 --zoom 1.06 &
wait
run "cap7.png" mao_real.png clip_31.mp4 7.50  --fast --zoom 1.05 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-16.png" mao_real.png clip_32.mp4 84.00 --seg 0:965:0.00 --seg 965:1920:48.20 --zoom 1.06 &
run "img17_esq.png" mao_real.png clip_33.mp4 12.00  --zoom 1.10 --focus 820,420 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-18.png" mao_real.png clip_34.mp4 27.00  --zoom 1.14 --focus 1300,600 &
run "/home/user/Novo/videos/salmo-91/imagens/imagem-cta.png" mao_real.png clip_35.mp4 22.00  --zoom 1.06 &
run "img17_dir.png" mao_real.png clip_36.mp4 16.60  --zoom 1.10 --focus 1000,500 &
wait
run "card_fim.png" mao_real.png clip_37.mp4 6.80  --fast --zoom 1.04 --nofade &
wait
