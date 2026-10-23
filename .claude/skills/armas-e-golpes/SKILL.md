---
name: armas-e-golpes
description: Desenha as armas de sobrevivência da série (facão de cana, machadinha, lança de vergalhão, faca) como peça de jogo — silhueta forte, peças reais, 3 tons e brilho no fio — presas na mão do boneco, e coreografa GOLPES NÍTIDOS NA CABEÇA do zumbi (preparação → golpe com rastro → contato com clarão e respingo → cabeça tranca → zumbi cai → recuperação), com o som certo em cada fase. Use sempre que um personagem atacar, segurar ou carregar arma, quando aparecer o Dimas, ou quando o usuário pedir golpe "real", "nítido", "na cabeça".
---

# armas-e-golpes

Feita a partir das skills achadas com a find-skills: **create-game-assets** (gamedev-skills, 5,8 mil instalações — objeto como
peça: silhueta, família coerente, ler no tamanho real) e **design-action-combat** (mengto, 1,2 mil — golpe como estados:
preparação, ativo, contato, recuperação; o efeito vem DEPOIS do contato resolvido).

## Armas (`assets/armas.js`)
Origem na mão, apontando para +x. Segurar: `translate(b.mao('d')) rotate(ângulo do antebraço)`.
| arma | onde fica | detalhe que não pode faltar |
|---|---|---|
| `Armas.facao` | nas costas (bainha) / na mão | lâmina larga com fio claro, cabo de madeira com 3 rebites |
| `Armas.machadinha` | no cinto | cabeça de aço com fio brilhante, cabo curvo com fita no pé |
| `Armas.vergalhao` | preso na lateral da moto / arremessado | nervuras do vergalhão, ponta esmerilhada, punho de fita isolante |

## Golpe na cabeça (regra do usuário: nítido, real, sempre na cabeça)
1. **Preparação (0,25–0,35 s):** braço vai para trás, corpo gira, peso no pé de trás.
2. **Golpe (0,08–0,12 s):** arma corta o ar com `Armas.rastro` (arco claro mostrando o caminho).
3. **Contato (1 quadro + 0,2 s):** a lâmina PARA na cabeça (não atravessa), `Armas.estrela` (clarão) + `Armas.respingo`
   escuro saindo do lado oposto, câmera treme, a cabeça do zumbi tranca para o lado do golpe.
4. **Queda (0,4–0,6 s):** zumbi desaba (joelhos → corpo → `deitado`), a arma sai da cabeça.
5. **Recuperação:** quem bateu volta à guarda / segue andando.
Sons: whoosh no golpe, `impact-bass` + baque seco no contato, corpo caindo no chão. Sem sangue vermelho vivo: respingo escuro.
Lança arremessada: rastro reto + vergalhão cravado na cabeça (fica preso), o zumbi cai de lado.
