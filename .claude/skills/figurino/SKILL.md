---
name: figurino
description: Veste os personagens (stickman da skill movimento-humano) com roupas, calçados, cabelos e acessórios de época ou atuais, presos às articulações (mangas seguem os braços, calça segue as pernas, sapato aponta para onde o pé aponta). Traz figurinos prontos — Roma (romano, cidadão de toga, senador, romana de estola e palla, legionário, vendedor, trabalhador), hoje (casual, moletom) e a roupa da MARCA do usuário — e a "bíblia" do PROTAGONISTA, que tem marca registrada fixa (careca, tênis laranja e preto em qualquer época; roupa da marca fora da história). Use sempre que criar ou animar personagens num vídeo, ao trocar de época, quando a narração citar roupa/calçado, ou quando pedirem personagens "de época", "mais detalhados" ou "com a minha cara". Regra do usuário: só o protagonista tem os elementos da marca; todos os outros usam a vestimenta completa da época (roupa, sandália, cabelo, acessórios).
---

# figurino — quem é quem pela roupa

O figurino é uma opção do `Boneco` (motor em `../movimento-humano/assets/boneco.js`):

```js
new Boneco(g, { escala: 0.6, figurino: 'legionario' });                      // figurino pronto
new Boneco(g, { escala: 0.6, figurino: { preset: 'romana', cor: '#9E2A22' } }); // pronto + ajustes
new Boneco(g, { escala: 0.9, figurino: { preset: 'romano', cor: '#2A2A30', cinto: '#FF7A00', cabelo: 'nenhum', protagonista: true } });
```

Campos: `tronco` (`tunica`, `tunicaLonga`, `toga`, `estola`, `vestido`, `armadura`, `camiseta`,
`moletom`), `cor`, `cor2` (faixa/barra/gola), `mangas` (`curta`, `longa`, `nenhuma`), `pernas`
(`calca`, `bermuda`, `nua`) + `corPernas`, `pes` (`sandalia`, `caliga`, `sapato`, `bota`, `tenis`,
`descalco`) + `corPes`/`corPes2`, `cabelo` (`curto`, `longo`, `coque`, `cacheado`, `nenhum`) +
`corCabelo`, `chapeu` (`louros`, `capacete`, `bone`, `capuz`, `palla`, `chapeu`) + `corChapeu`,
`cinto` (cor ou `'none'`), `extras` (`['capa', 'avental', 'bolsa']`) + `corCapa`.

`assets/passarela.html` (e `passarela.jpg`) mostra todos os figurinos de frente e andando.

**Gladiadores / Coliseu** (`videos/coliseu`): `'gladiador'` (tanga *subligaculum* — tronco `subligaculo`,
peito de fora — com `manica` no braço e `greva` na canela), `'secutor'` (o mesmo + `chapeu: 'secutor'`,
capacete liso com dois furinhos que gira com a cabeça), `'reciario'` (tanga azul, `galero` no ombro,
rede + tridente), `'lanista'` (treinador) e `'imperador'` (toga roxa com louros). Campos novos:
`manica: 'd'|'e'`, `galero: 'd'|'e'`, `greva: 0|1` (perna), `corManica`, `corGreva`.
Protagonista como gladiador: `{ preset: 'gladiador', cor: '#2A2A30', cinto: '#FF7A00', cabelo: 'nenhum', protagonista: true }`
(tanga preta + cinto laranja + tênis da marca), e `chapeu: 'secutor'` na hora da luta.

## O PROTAGONISTA (bíblia do personagem do usuário)
Decidido pelo usuário — vale para **todo vídeo**:
| Sempre | Por quê |
|---|---|
| Cabeça **careca** (stickman branco) | rosto reconhecível, nunca coberto por cabelo |
| **Tênis laranja e preto** (`protagonista: true`) | marca registrada: aparece em qualquer época, como um "viajante do tempo" |
| Detalhe laranja na roupa de época (ex.: **cinto laranja** na túnica preta em Roma) | liga a roupa de época às cores da marca |

- **Dentro da história**: roupa da época **com** os itens acima (Roma: túnica preta + cinto laranja + tênis).
- **Fora da história** (abertura, tela final, chamada para comentar): figurino `'marca'` —
  camiseta preta com gola e barra laranja, calça escura e tênis laranja.
- Expressões e movimentos: skill `movimento-humano`.

## Todos os outros personagens
**Vestimenta 100% de época** — roupa, calçado, cabelo e acessório coerentes com o lugar e a
classe social (ver `references/figurino.md`). Nada de tênis, laranja da marca ou roupa moderna
em figurante de época. Varie cor (tons de época da `paleta-de-epoca`) e cabelo para não parecerem clones.

## Regras de figurino (character design)
Adaptadas de `character-design` (omer-metin) e `character-design-continuity` (calesthio):
1. **3 leituras**: o personagem tem que ser identificado pela **silhueta** (toga longa, capacete
   com crista, saia de tiras), depois pela **cor**, só então pelos **detalhes**.
2. **A roupa diz quem é**: classe social e função (soldado, vendedor, cidadão, escravo) antes
   de qualquer fala. Toga = cidadão; faixa roxa = senador; avental = comerciante; descalço = pobre.
3. **Contraste com o cenário**: roupa escura em fundo claro e vice-versa; o protagonista
   precisa ser o mais fácil de achar na tela.
4. **Continuidade**: o mesmo personagem mantém o mesmo figurino a cena toda (só muda se a história mudar).
5. **Movimento**: roupas longas (toga, estola) andam mais devagar e com passos menores; armadura
   = postura mais rígida (braços afastados).
