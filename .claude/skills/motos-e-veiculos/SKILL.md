---
name: motos-e-veiculos
description: Desenha veículos da série em SVG com cara de verdade — começando pela MOTO DE ROQUEIRO ANTIGA (bobber/chopper anos 70: tanque gota, banco solo de couro, motor V2 com aletas, escapamentos cromados duplos, guidão alto e largo, farol redondo, rodas raiadas, alforjes, lança de vergalhão) — em 3 vistas (de lado, vindo de frente, indo embora), com os pontos de contato para o piloto (banco, pedaleira, guidão) e rodas girando. Use sempre que aparecer moto, carro ou outro veículo, quando alguém pilotar/dirigir, ou quando o veículo vier na direção da câmera ou for embora.
---

# motos-e-veiculos

Feita a partir da skill **vehicle-design** (omer-metin, achada com a find-skills): proporção primeiro, depois silhueta (tem
que ler pequena), rodas no tamanho certo em relação ao corpo, postura (stance), e "turnaround" — o mesmo veículo coerente
de lado, de frente e de trás.

## Moto (`assets/moto.js`)
```js
g.innerHTML = Moto.lado(k, { roda: anguloDasRodas, farol: true, lanca: true });   // de lado, frente para +x (scale(-1,1) espelha)
const P = Moto.lado.pontos(k);  b.base(t0, t1, 'montar', { assento: P.assento, pe: P.pe, guidao: P.guidao, chao: 0 });
g.innerHTML = Moto.frente(k);   // vindo para a câmera: piloto 'agachar' vista frente (pernas abertas no banco), mãos 'alcancar' P.guidao[0]/[1]
g.innerHTML = Moto.tras(k, { freio });   // indo embora: o mesmo, com { costas: true } na pose (nuca, sem rosto)
```
- Vindo/indo: a moto + piloto num grupo só, escalado pela perspectiva (horizonte) e balançando leve (motor); rodas de lado
  giram pela distância (ângulo = distância / raio).
- Escala real: moto ≈ 2,1 m; banco na altura do quadril; guidão na altura do peito do piloto sentado.
- A besta do Dimas vai nas costas, atravessada do ombro ao quadril.
