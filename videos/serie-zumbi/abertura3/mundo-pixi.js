/*
  mundo-pixi.js — o MUNDO de OS SOBREVIVENTES pintado por código no PixiJS v8 (skill os-sobreviventes §2–6):
  cidade abandonada há anos, natureza tomando conta, pôr do sol dramático. Tudo é desenhado aqui (nenhuma imagem de fora).
  Cada pintor devolve um PIXI.Container já pronto para virar CAMADA de parallax.
    Mundo.ceu(w, h, { horizonte, sol })          céu em faixas (roxo → laranja queimado), com sol e brilho
    Mundo.nuvens(w, h, { horizonte, sol, n })    nuvens pintadas: base iluminada de laranja, topo roxo
    Mundo.skyline(w, base, { cor, alt, n })       silhueta distante de prédios (alguns quebrados)
    Mundo.predio(x, base, w, h, opts)             prédio abandonado: janelas vazias, laje quebrada, trepadeiras, árvore no topo, borda de luz
    Mundo.carro(x, base, k, opts)                 carro enferrujado de 3/4 (traseira), mato e trepadeira em cima
    Mundo.folhagem(g, cx, cy, r, n, opts)         moita de folhas pontudas (lado do sol amarelado, sombra verde-escura)
    Mundo.cipo(g, x0, y0, comp, opts)             trepadeira pendurada (fio + folhinhas)
  Luz: o sol fica no fundo; tudo recebe BORDA de luz laranja do lado do sol e sombra roxa do outro (cel shading em blocos).
*/
(function (global) {
  const LINHA = 0x140E14;
  const hex = c => typeof c === 'number' ? c : parseInt(c.replace('#', ''), 16);
  const mix = (a, b, u) => { a = hex(a); b = hex(b); const r = (a >> 16) + (((b >> 16) - (a >> 16)) * u), g = ((a >> 8) & 255) + ((((b >> 8) & 255) - ((a >> 8) & 255)) * u), bl = (a & 255) + (((b & 255) - (a & 255)) * u); return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(bl); };
  // aleatório com semente (o mesmo cenário sempre igual)
  const RNG = seed => { let s = seed >>> 0 || 1; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); r.entre = (a, b) => a + (b - a) * r(); r.pick = l => l[Math.floor(r() * l.length)]; return r; };
  const PAL = { ceuTopo: 0x2A2040, ceuMeio: 0x6A3A5A, ceuLaranja: 0xE07A44, ceuBaixo: 0xF2A65A, sol: 0xFFE2A0, borda: 0xFFA860, sombra: 0x2A1E34,
    concreto: 0x6E625E, concretoEsc: 0x4A3E44, verdeLuz: 0xC8C044, verde: 0x6A8A2E, verdeEsc: 0x24321A, ferrugem: 0x8A4A2A, asfalto: 0x3A3238 };

  const Mundo = { PAL, RNG, mix };

  Mundo.ceu = (w, h, { horizonte = h * 0.55, sol = [w * 0.7, h * 0.4] } = {}) => {
    const c = new PIXI.Container(), g = new PIXI.Graphics(); c.addChild(g);
    const paradas = [[0, PAL.ceuTopo], [0.45, PAL.ceuMeio], [0.8, PAL.ceuLaranja], [1, PAL.ceuBaixo]];
    for (let i = 0; i < 160; i++) { const u = i / 159, y = u * horizonte * 1.15; let k = 0; while (k < paradas.length - 2 && u > paradas[k + 1][0]) k++;
      const [u0, c0] = paradas[k], [u1, c1] = paradas[k + 1]; g.rect(0, y, w, horizonte * 1.15 / 159 + 1).fill(mix(c0, c1, (u - u0) / (u1 - u0))); }
    // brilho do sol (camadas em "add")
    const b = new PIXI.Graphics(); for (let i = 0; i < 30; i++) b.circle(sol[0], sol[1], 100 + i * 18).fill({ color: 0xFFB060, alpha: 0.035 });
    b.blendMode = 'add'; c.addChild(b);
    const s = new PIXI.Graphics(); s.circle(sol[0], sol[1], 92).fill(PAL.sol); s.circle(sol[0], sol[1], 70).fill(0xFFF4D0); c.addChild(s);
    return c;
  };

  Mundo.nuvens = (w, h, { horizonte = h * 0.55, sol = [w * 0.7, h * 0.4], n = 26, seed = 3 } = {}) => {
    const r = RNG(seed), c = new PIXI.Container();
    for (let i = 0; i < n; i++) { const g = new PIXI.Graphics(), cy = r.entre(h * 0.04, horizonte * 0.82), cx = r.entre(-300, w + 300), L = r.entre(300, 900) * (0.6 + cy / horizonte), H = r.entre(16, 46) * (0.5 + cy / horizonte);
      const perto = Math.max(0, 1 - Math.hypot(cx - sol[0], (cy - sol[1]) * 1.6) / 900), baixa = cy / horizonte;
      const corTopo = mix(0x3A2448, 0x8A4A66, baixa), corBase = mix(0xB0566A, 0xFFB060, Math.min(1, baixa * 0.7 + perto * 0.6));
      for (let k = 0; k < 14; k++) { const ex = cx + r.entre(-L / 2, L / 2), ey = cy + r.entre(-H / 2, H / 3), rx = r.entre(L * 0.08, L * 0.2), ry = r.entre(H * 0.5, H);
        g.ellipse(ex, ey, rx, ry).fill({ color: corTopo, alpha: 0.95 }); g.ellipse(ex + r.entre(-6, 6), ey + ry * 0.45, rx * 0.95, ry * 0.45).fill({ color: corBase, alpha: 0.9 }); }
      g.__vel = r.entre(5, 14); c.addChild(g); }
    return c;
  };

  Mundo.skyline = (w, base, { cor = 0x5A3E58, alt = 420, n = 30, seed = 5, janelas = true } = {}) => {
    const r = RNG(seed), g = new PIXI.Graphics();
    let x = -40; while (x < w + 40) { const bw = r.entre(40, 110), bh = r.entre(alt * 0.35, alt), quebrado = r() < 0.35;
      const topo = base - bh; const pts = quebrado ? [x, base, x, topo + r.entre(0, 40), x + bw * 0.4, topo + r.entre(30, 80), x + bw * 0.7, topo + r.entre(0, 30), x + bw, topo + r.entre(40, 90), x + bw, base] : [x, base, x, topo, x + bw, topo, x + bw, base];
      g.poly(pts).fill(mix(cor, 0x000000, r.entre(0, 0.12)));
      if (r() < 0.4) g.rect(x + bw * 0.45, topo - r.entre(20, 50), 3, 50).fill(cor);   // antena
      if (janelas) for (let yy = topo + 18; yy < base - 10; yy += 16) for (let xx = x + 8; xx < x + bw - 8; xx += 13) if (r() < 0.55) g.rect(xx, yy, 5, 7).fill({ color: r() < 0.06 ? 0xFFB060 : mix(cor, 0x000000, 0.35), alpha: 0.9 });
      x += bw + r.entre(-8, 14); }
    return g;
  };

  Mundo.cipo = (g, x0, y0, comp, { seed = 1, cor = PAL.verde, luz = PAL.verdeLuz, k = 1, balanco = 0 } = {}) => {
    const r = RNG(seed); let x = x0, y = y0;
    const pts = [[x, y]]; for (let s = 0; s < comp; s += 14 * k) { x += Math.sin(s * 0.05 + seed) * 2 * k + balanco * s * 0.004; y += 14 * k; pts.push([x, y]); }
    g.moveTo(...pts[0]); pts.forEach(p => g.lineTo(...p)); g.stroke({ width: 2.2 * k, color: 0x2A3A1A });
    pts.forEach(([px, py], i) => { if (i % 2) return; const lado = i % 4 ? 1 : -1, sz = r.entre(5, 9) * k, lit = r() < 0.5;
      g.poly([px, py, px + lado * sz * 1.4, py + sz * 0.4, px + lado * sz * 2.2, py + sz * 1.6, px + lado * sz * 0.6, py + sz * 1.3]).fill(lit ? luz : cor); });
  };

  // folha pontuda; lado do sol (sx>0 → sol à direita) mais clara
  Mundo.folhagem = (g, cx, cy, rad, n, { seed = 1, sol = 1, escuro = false, k = 1 } = {}) => {
    const r = RNG(seed);
    g.ellipse(cx, cy, rad * 0.9, rad * 0.65).fill(escuro ? 0x0C1008 : PAL.verdeEsc);
    for (let i = 0; i < n; i++) { const a = r.entre(0, Math.PI * 2), d = Math.sqrt(r()) * rad, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.7, L = r.entre(14, 26) * k, ang = r.entre(0, Math.PI * 2);
      const borda = d > rad * 0.55, luzLado = borda && (Math.cos(a) * sol * 0.8 - Math.sin(a) * 0.7) > 0.25, cor = escuro ? (luzLado ? 0x8A8A26 : (r() < 0.5 ? 0x141C0C : 0x1C2810)) : (luzLado ? (r() < 0.6 ? PAL.verdeLuz : 0xE8D050) : (r() < 0.5 ? 0x3A5222 : 0x2A3A1A));
      const c = Math.cos(ang), s = Math.sin(ang), P = (u, v) => [x + c * u - s * v, y + s * u + c * v];
      g.poly([...P(0, 0), ...P(L * 0.5, -L * 0.32), ...P(L, 0), ...P(L * 0.5, L * 0.32)]).fill(cor); }
  };

  Mundo.predio = (x, base, w, h, { seed = 1, lado = 0.28, sol = 1, cor = PAL.concreto, quebrado = true, vegetacao = 1, anuncio = null } = {}) => {
    const r = RNG(seed), c = new PIXI.Container(), g = new PIXI.Graphics(); c.addChild(g);
    const topo = base - h, wl = w * lado, fx = sol > 0 ? x : x + wl, sx = sol > 0 ? x + w : x;   // face da frente e face lateral
    const corLado = sol > 0 ? mix(cor, PAL.borda, 0.35) : mix(cor, PAL.sombra, 0.5), corFrente = mix(cor, PAL.sombra, 0.55);
    // contorno do prédio com o topo quebrado
    const jag = []; const passos = 7; for (let i = 0; i <= passos; i++) jag.push([fx + w * i / passos, topo + (quebrado ? (i % 2 ? r.entre(0, h * 0.08) : r.entre(0, h * 0.02)) : 0)]);
    g.poly([fx, base, ...jag.flat(), fx + w, base]).fill(corFrente).stroke({ width: 4, color: LINHA });
    g.poly([sx, base, sx, jag[sol > 0 ? passos : 0][1], sx + (sol > 0 ? wl : -wl), jag[sol > 0 ? passos : 0][1] + 18, sx + (sol > 0 ? wl : -wl), base]).fill(corLado).stroke({ width: 4, color: LINHA });
    g.rect(sol > 0 ? sx - 5 : sx, topo, 5, h).fill({ color: PAL.borda, alpha: 0.75 });   // borda de luz na quina
    // andares: lajes, janelas vazias (algumas com reflexo do sol), sacadas
    const andar = r.entre(48, 64), cols = Math.max(3, Math.round(w / 52));
    for (let y = topo + andar * 0.6; y < base - andar * 0.5; y += andar) {
      g.rect(fx, y + andar * 0.82, w, 5).fill(mix(corFrente, 0x000000, 0.25));
      for (let i = 0; i < cols; i++) { const jx = fx + 10 + i * (w - 20) / cols, jw = (w - 20) / cols - 12, jh = andar * 0.55; if (r() < 0.06) continue;
        const reflexo = r() < 0.12; g.rect(jx, y + 6, jw, jh).fill(reflexo ? mix(PAL.borda, 0xFFE2A0, r()) : 0x16101A);
        if (!reflexo && r() < 0.3) g.poly([jx, y + 6, jx + jw * 0.5, y + 6, jx, y + 6 + jh * 0.6]).fill({ color: 0x3A3040, alpha: 0.8 });   // caco de vidro
        if (r() < 0.15) g.rect(jx - 3, y + jh + 2, jw + 6, 6).fill(0x4A3E3E).stroke({ width: 2, color: LINHA }); }
      for (let i = 0; i < 2; i++) g.rect(sx + (sol > 0 ? 8 + i * wl * 0.45 : -8 - wl * 0.35 - i * wl * 0.45), y + 8, wl * 0.3, andar * 0.5).fill({ color: 0x16101A, alpha: 0.85 }); }
    // rachaduras e manchas de umidade
    for (let i = 0; i < 6; i++) { let px = fx + r.entre(0, w), py = topo + r.entre(h * 0.1, h * 0.9); g.moveTo(px, py); for (let k = 0; k < 4; k++) { px += r.entre(-14, 14); py += r.entre(10, 26); g.lineTo(px, py); } g.stroke({ width: 2.5, color: LINHA, alpha: 0.7 }); }
    for (let i = 0; i < 5; i++) g.ellipse(fx + r.entre(0, w), topo + r.entre(0, h), r.entre(14, 40), r.entre(30, 80)).fill({ color: 0x2A2A1E, alpha: 0.25 });
    if (anuncio) { const ax = fx + w * 0.12, ay = topo + h * 0.08, aw = w * 0.7, ah = h * 0.32; g.rect(ax, ay, aw, ah).fill(anuncio).stroke({ width: 4, color: LINHA });
      for (let i = 0; i < 6; i++) g.poly([ax + r.entre(0, aw), ay + r.entre(0, ah), ax + r.entre(0, aw), ay + r.entre(0, ah), ax + r.entre(0, aw), ay + r.entre(0, ah)]).fill({ color: 0xD8C8B8, alpha: 0.5 }); }
    // vegetação: trepadeiras descendo da laje, moitas nas sacadas, árvore no topo
    const v = new PIXI.Graphics(); c.addChild(v);
    const nc = Math.round(cols * 1.5 * vegetacao); for (let i = 0; i < nc; i++) Mundo.cipo(v, fx + r.entre(4, w - 4), topo + r.entre(0, h * 0.4), r.entre(h * 0.15, h * 0.65), { seed: seed * 31 + i });
    for (let i = 0; i < Math.round(6 * vegetacao); i++) Mundo.folhagem(v, fx + r.entre(0, w), topo + r.entre(0, h), r.entre(18, 40), 30, { seed: seed * 7 + i, sol });
    if (vegetacao > 0.5) { Mundo.folhagem(v, fx + w * r.entre(0.3, 0.7), topo - 20, w * 0.22, 70, { seed: seed + 99, sol }); v.rect(fx + w * 0.48, topo - 10, 6, 30).fill(0x3A2A1E); }
    Mundo.folhagem(v, fx + w * 0.15, base - 30, w * 0.25, 60, { seed: seed + 5, sol }); Mundo.folhagem(v, fx + w * 0.8, base - 20, w * 0.22, 50, { seed: seed + 6, sol });
    return c;
  };

  // carro abandonado de trás (contraluz: escuro, borda acesa no teto), ferrugem, mato e trepadeira. Origem = chão no meio
  Mundo.carro = (x, base, k = 1, { seed = 1, cor = null, sol = 1, mato = 1, rot = 0 } = {}) => {
    const r = RNG(seed), c = new PIXI.Container(), g = new PIXI.Graphics(); c.addChild(g); c.position.set(x, base); c.rotation = rot;
    const C = mix(cor ?? r.pick([0x6A6A5E, 0x5E4A3E, 0x7A6A5A, 0x4A5A5A, 0x6A3A30]), 0x1A1220, 0.45), L = 0x0E0A10, BORDA = Mundo.PAL.borda;
    const P = pts => pts.map(v => v * k);
    g.ellipse(0, 6 * k, 170 * k, 20 * k).fill({ color: 0x000000, alpha: 0.5 });
    g.poly(P([-150, -18, -156, -70, -140, -96, 140, -96, 156, -70, 150, -18])).fill(C).stroke({ width: 4, color: L });                 // tampa e para-choque
    g.poly(P([-118, -96, -92, -150, 92, -150, 118, -96])).fill(mix(C, 0x000000, 0.15)).stroke({ width: 4, color: L });                 // cabine
    g.poly(P([-102, -100, -82, -142, 82, -142, 102, -100])).fill(0x120E16);                                                              // vidro escuro
    g.poly(P([-60, -138, -20, -138, -70, -104, -90, -104])).fill({ color: 0xFFB070, alpha: 0.28 });                                     // reflexo do sol no vidro
    g.moveTo(-92 * k, -151 * k).lineTo(92 * k, -151 * k).stroke({ width: 4 * k, color: BORDA, alpha: 0.9 });                            // borda de luz no teto
    g.moveTo(sol > 0 ? 150 * k : -150 * k, -20 * k).lineTo(sol > 0 ? 156 * k : -156 * k, -70 * k).lineTo(sol > 0 ? 140 * k : -140 * k, -96 * k).stroke({ width: 4 * k, color: BORDA, alpha: 0.7 });
    g.rect(-138 * k, -78 * k, 38 * k, 16 * k).fill(0x4A1410); g.rect(100 * k, -78 * k, 38 * k, 16 * k).fill(0x4A1410);                  // lanternas apagadas
    g.rect(-36 * k, -58 * k, 72 * k, 22 * k).fill(0x8A8070).stroke({ width: 3, color: L });                                             // placa
    g.rect(-152 * k, -34 * k, 304 * k, 12 * k).fill(mix(C, 0x000000, 0.3));
    for (let i = 0; i < 10; i++) g.ellipse(r.entre(-140, 140) * k, r.entre(-92, -24) * k, r.entre(8, 22) * k, r.entre(4, 10) * k).fill({ color: 0x6A3220, alpha: 0.8 });
    [-112, 112].forEach(wx => g.roundRect((wx - 20) * k, -26 * k, 40 * k, 30 * k, 6 * k).fill(0x0A080C));
    if (mato) { const v = new PIXI.Graphics(); c.addChild(v);
      Mundo.folhagem(v, r.entre(-60, 60) * k, -150 * k, 38 * k, 26, { seed: seed + 1, sol, k: k * 0.9 });
      Mundo.folhagem(v, -150 * k, -14 * k, 48 * k, 34, { seed: seed + 2, sol, k }); Mundo.folhagem(v, 160 * k, -10 * k, 44 * k, 30, { seed: seed + 3, sol, k });
      for (let i = 0; i < 4; i++) Mundo.cipo(v, r.entre(-110, 110) * k, -150 * k, r.entre(40, 90) * k, { seed: seed * 5 + i, k: k * 0.8 }); }
    return c;
  };

  // tufo de capim alto (lâminas finas, pontas acesas pelo sol)
  Mundo.capim = (g, x, y, alt, n, { seed = 1, k = 1, sol = 1 } = {}) => {
    const r = RNG(seed);
    for (let i = 0; i < n; i++) { const bx = x + r.entre(-alt * 0.4, alt * 0.4), h = alt * r.entre(0.5, 1.1), inc = r.entre(-0.5, 0.5) + 0.15 * sol, w = r.entre(2, 4.5) * k;
      const tx = bx + Math.sin(inc) * h, ty = y - Math.cos(inc) * h, lit = r() < 0.4;
      g.poly([bx - w, y, tx, ty, bx + w, y]).fill(lit ? 0x8A8A2A : (r() < 0.5 ? 0x24301A : 0x1A2412));
      if (lit) g.poly([tx, ty, tx - Math.sin(inc) * h * 0.3 - w * 0.4, ty + Math.cos(inc) * h * 0.3, tx - Math.sin(inc) * h * 0.3 + w * 0.4, ty + Math.cos(inc) * h * 0.3]).fill(0xE8C860); }
  };
  global.Mundo = Mundo;
})(typeof window !== 'undefined' ? window : globalThis);
