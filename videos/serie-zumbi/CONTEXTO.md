# CONTEXTO — Série "OS SOBREVIVENTES" (para continuar em outra conversa)

Repositório: `soarezga-glitch/Novo`, branch `claude/download-find-skills-32a8ey`, pasta `videos/serie-zumbi/`.
Leia também a skill mestre: `.claude/skills/os-sobreviventes/SKILL.md` (direção de arte, luz, paleta, câmera, continuidade).

## Quem é o criador e como ele trabalha
- Brasileiro, fala português simples, usa o celular. Responder sempre em português simples.
- Posta no **TikTok**: vídeo **em pé 1080×1920**, 30 fps. Para monetizar, o vídeo precisa ter **mais de 1 minuto** (mirar 62–70 s).
- Ele **grava a narração** numa IA dele e manda o áudio (mp3). As **vozes dos personagens** são feitas aqui (Qwen3-TTS).
- Quer: storyboard antes do render; muitos efeitos sonoros; narração a −10 LUFS; legenda dinâmica; nada de sangue explícito
  (a Parte 4 antiga foi derrubada pelo TikTok por violência). Golpes = clarão/corte; feridas = mancha escura.
- Episódios novos: **curtos (≈65 s), com começo, meio e fim**, suspense a cada ~5 s, e uma pontinha de mistério no fim.
- Abertura dos episódios curtos: **3 segundos** (sobrevivente + nome dele + nome do episódio).

## A história até agora
- Sítio no interior, dia 3 do apocalipse. Personagens: **Tião** (caipira de uns 65 anos, chapéu de palha, enxada),
  **Aninha** (8 anos, vestido rosa, tiara amarela), **Seu Zé** (avô da Aninha — virou zumbi e morreu no Ep. 6),
  **Dimas** (motoqueiro roqueiro de uns 40 anos, colete preto, besta nas costas, facão, machadinha, moto antiga).
- **Ep. 6 – "Dimas, o Motoqueiro"** (pronto, `ep6/episodio6-dimas-o-motoqueiro.mp4`, 2min51s): o Dimas chega pela estrada,
  pula o mata-burro, derruba a porteira e mata o Seu Zé zumbi antes de ele pegar a Aninha. Termina com o Dimas olhando a
  perna rasgada do Tião: "Então me explica essa perna aí."
- Os 3 personagens principais daqui pra frente: **Aninha, Tião e Dimas**. O Dimas é o **líder** (toma as decisões).

## O plano da temporada "A Fazenda" (trend de construir base no apocalipse)
| Ep. | Título | Etapa | Perigo |
|---|---|---|---|
| 7 | A Perna do Tião | os três se juntam; Dimas vira o chefe | o Tião foi mordido? |
| 8 | A Cerca | cercar o sítio | zumbis chegam antes de fechar |
| 9 | Água | limpar poço e caixa d'água | algo dentro do poço |
| 10 | Sementes | buscar sementes na cidadezinha | a agropecuária não está vazia |
| 11 | A Horta | primeira plantação (Aninha cuida) | chuva, praga, rastro estranho |
| 12 | A Torre | torre de vigia e alarme de latas | primeiro ataque à noite |
| 13 | O Estranho | primeiro personagem novo | deixar entrar ou não? |

## EPISÓDIO 7 — "A Perna do Tião" (≈65 s) — PRÓXIMO A FAZER
Abertura (0–3 s): Dimas de frente em contraluz com a besta + "DIMAS" + "EP. 7 · A PERNA DO TIÃO".
Visual: noite no curral, o farol da moto como luz principal; closes (besta, rosto do Tião suando, mão da Aninha);
a perna mostra só um corte (sem sangue forte); o Dimas olha o sítio destruído; final: sombra torta na estrada sob a lua.

Roteiro (N = narrador gravado pelo criador; personagens = Qwen):
1. N: A besta do Dimas está apontada pra cabeça do Tião. Ele tem três segundos pra explicar essa perna.
2. TIÃO: Foi o arame da porteira! Eu juro!
3. ANINHA: Não atira! Ele é tudo que eu tenho.
4. N: O Dimas não abaixa a arma. Só acende o farol da moto.
5. DIMAS: Puxa a calça. Devagar.
6. N: O tecido gruda no sangue seco. A Aninha fecha os olhos.
7. N: Corte reto. Fundo. Sem marca de dente.
8. DIMAS: Arame. Tu teve sorte, velho.
9. N: Ele abaixa a besta e olha em volta. A porteira no chão. A cerca podre. A casa sem tranca.
10. DIMAS: Desse jeito, ninguém aqui passa do inverno. Se for pra ficar, vai ser do meu jeito.
11. N: O Tião olha pra menina. E pela primeira vez desde a festa, alguém sabe o que fazer.
12. DIMAS: Amanhã a gente começa a cerca.
13. N: Mas, enquanto os três dormem, alguma coisa segue o rastro de sangue… até a porteira.

**Só o narrador (para o criador gravar, na ordem, com pausa entre as frases):**
```
A besta do Dimas está apontada pra cabeça do Tião. Ele tem três segundos pra explicar essa perna.

O Dimas não abaixa a arma. Só acende o farol da moto.

O tecido gruda no sangue seco. A Aninha fecha os olhos.

Corte reto. Fundo. Sem marca de dente.

Ele abaixa a besta e olha em volta. A porteira no chão. A cerca podre. A casa sem tranca.

O Tião olha pra menina. E pela primeira vez desde a festa, alguém sabe o que fazer.

Mas, enquanto os três dormem, alguma coisa segue o rastro de sangue... até a porteira.
```

## Como produzir (o que já existe no repositório)
- **Modelo de episódio:** copiar `ep6/` para `ep7/`. Arquivos-chave:
  - `ordem.tsv` (id · personagem · texto, na ordem do vídeo), `roteiro-qwen.tsv` (falas dos personagens + direção de voz),
    `elenco-qwen.json` (vozes fixas: tiao, aninha, ze, dimas — ver também `elenco-vozes.json`).
  - Vozes dos personagens: `python3 .claude/skills/vozes-personagens/scripts/qwen_vozes.py roteiro-qwen.tsv elenco-qwen.json --pasta falas-qwen`
    (Qwen3-TTS VoiceDesign, roda na CPU; conferir cada fala com o whisper).
  - Quando o áudio do narrador chegar: `./fazer.sh narrador.mp3` → transcreve, **corta fala por fala sozinho** (`cortar.py`),
    intercala com as vozes (`montar.py`), masteriza a −10 LUFS e gera legenda/bocas (`preparar_faixa.sh`) e a trilha de sons (`partitura.py`).
  - `cena.html` = a animação (GSAP + SVG). Os tempos de cada plano vêm das falas (`SG(id)`, `W(id, n)`).
  - Render: `node .claude/skills/edit/scripts/render.mjs cena.html video_novo.mp4 --width 1080 --height 1920 --fps 30 --audio fala.mp3 --audio-offset 0 --jpeg`
    depois `python3 .claude/skills/sons-de-ambiente/scripts/misturar.py partitura-sons.json --saida mix.wav --video video_novo.mp4 --video-saida video.mp4`.
    Storyboard antes: `--frames t1,t2,... --outdir previews`.
  - `montagem.py` junta começo da história → abertura → resto (no Ep. 7 a abertura é de 3 s, mais simples).
- **Estilo dos personagens (novo):** `boneco.js` (esqueleto, poses, IK, boca) desenhado por `volume.js` (corpo com volume,
  cel shading, luz de borda colorida, rosto expressivo). Looks em `Volume.LOOK` (dimas, aninha, tiao, seuze, zeZumbi, zumbi, vulto…).
  Zumbis: olho vazado, sem nariz, boca torta com dentes, pedaço faltando — **sem sangue**.
- **Cenários:** `.claude/skills/cenario-ilustrado/assets/sitio.js` (curral detalhado, porteira, estrada ao entardecer,
  mata-burro, casa destruída…) e `cidade-zumbi.js`. Luz colorida por cenário (mapa `LUZ` na `ep6/cena.html`).
- **Abertura longa (15 s) "Os Sobreviventes":** `abertura3/` — desenhada por código no **PixiJS** (`mundo-pixi.js`: céu,
  nuvens, skyline, prédios com trepadeira, carros, moitas, capim, árvores) + logo oficial (`abertura3/img/logo.png`).
  Cuidado com o cache: só camadas sem filtro; Graphics solto precisa ser embrulhado num Container.
- **Skills instaladas úteis:** os-sobreviventes, vozes-personagens, armas-e-golpes, motos-e-veiculos, sons-de-ambiente,
  cenario-ilustrado, movimento-humano, pixijs (oficiais, MIT), gsap-*.
- Sons: `.claude/skills/sons-de-ambiente/biblioteca/apocalipse/` (trilha_rock, moto, besta, golpe, porteira, grito da Aninha, mugido…).

## Lições aprendidas
- Nunca deixar a fala do título maior que o tempo do logo (no Ep. 6 cortou o "episódio seis"; corrigido segurando o logo).
- Conferir o vídeo final quadro a quadro (o cache do PixiJS chegou a sumir com a ponte e a base do cervo).
- O narrador manda o áudio às vezes com palavras diferentes do texto; o `cortar.py` alinha pelo texto e acha os cortes sozinho.
- Commit e push sempre ao final (o hook exige). Vídeos > 100 MB não sobem no GitHub (pôr no .gitignore).
