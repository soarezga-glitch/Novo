/*
  volume.js — ESTILO "VOLUME" (inspirado em jogos cartoon como Brawl Stars): o mesmo esqueleto do Boneco (pose, IK, caminhada,
  expressão, boca) desenhado com CORPO DE VERDADE em vez de palitinho:
    · membros como cápsulas afinadas (coxa grossa → tornozelo fino), tronco com ombro/peito/cintura, cabeça grande
    · contorno escuro grosso por peça (sem emenda no cotovelo/joelho)
    · sombra em 2 tons (cel-shading) vinda da luz principal + LUZ DE BORDA colorida do lado oposto (rim light)
    · rosto expressivo: olho grande com pálpebra, sobrancelha forte, boca por fonema
  uso:  const v = Volume(b, LOOK.dimas, { luz: [-0.7, -0.6], borda: '#FF8AD8', sombra: '#3A2058' });
        // depois de b.desenhar(t):  g.innerHTML = v.svg(t)      (esconda o grupo original do boneco)
*/
(function (global) {
  const L = '#100C16', f = v => (Math.round(v * 10) / 10).toString(), P2 = p => f(p[0]) + ' ' + f(p[1]);
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const len = a => Math.hypot(a[0], a[1]) || 1, nrm = a => mul(a, 1 / len(a)), perp = a => [-a[1], a[0]], dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const lerp = (a, b, u) => a + (b - a) * u, lp = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const hex = c => { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)); };
  const mix = (a, b, u) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], u)).toString(16).padStart(2, '0')).join(''); };

  // ---------- figurinos no estilo volume ----------
  const LOOK = {
    dimas: { pele: '#E8B48E', cabelo: { tipo: 'medio', cor: '#1C1A22', brilho: '#4A4A6A' }, barba: '#2A2024', olhos: 'pesado', cabeca: 1.3, queixo: 'quadrado',
      tronco: { cor: '#1A1A20', colete: true, cinto: '#3A2A1E', fivela: '#C8CED6' }, braco: { pele: true, luva: '#22222A' }, calca: '#24242C', bota: '#121216', largura: 1.45 },
    aninha: { pele: '#F2C6A4', cabelo: { tipo: 'longo', cor: '#4A2A1C', brilho: '#7A4A30', tiara: '#F2D23A' }, olhos: 'grande', cabeca: 1.55, queixo: 'redondo', cilios: true,
      tronco: { cor: '#D9789E', vestido: true, gola: '#F2E8EE' }, braco: { pele: true, manga: '#D9789E' }, perna: 'pele', meia: '#F2F2F2', bota: '#F4F4F4', largura: 1.15 },
    tiao: { pele: '#C98E6A', cabelo: { tipo: 'curto', cor: '#4A4640', brilho: '#6A665E' }, barba: '#5A544C', olhos: 'normal', cabeca: 1.3, queixo: 'quadrado', chapeu: '#C8A860',
      tronco: { cor: '#6A5238', cinto: '#2A1E14' }, braco: { manga: '#6A5238' }, calca: '#3A4458', bota: '#3A2618', largura: 1.35 },
    seuze: { pele: '#E2B89A', cabelo: { tipo: 'curto', cor: '#E8E6DE', brilho: '#FFFFFF' }, olhos: 'normal', cabeca: 1.25, queixo: 'quadrado',
      tronco: { cor: '#7A8A9A', cinto: '#2A1E14' }, braco: { pele: true, manga: '#7A8A9A' }, calca: '#4A3A2A', bota: '#2A1E14', largura: 1.15 },
    zeZumbi: { pele: '#AEBA9A', cabelo: { tipo: 'curto', cor: '#D8D8CC', brilho: '#F2F2E8' }, olhos: 'zumbi', cabeca: 1.25, queixo: 'quadrado', rasgado: true,
      tronco: { cor: '#6E7A88', cinto: '#2A1E14' }, braco: { pele: true, manga: '#6E7A88' }, calca: '#4A3A2A', bota: '#2A1E14', largura: 1.1 },
    zumbi: { pele: '#A2AE8E', cabelo: { tipo: 'curto', cor: '#3A3A30', brilho: '#5A5A4A' }, olhos: 'zumbi', cabeca: 1.2, queixo: 'quadrado', rasgado: true,
      tronco: { cor: '#5E6A4E' }, braco: { pele: true, manga: '#5E6A4E' }, calca: '#3A4A5A', bota: '#5A5A50', largura: 1.1 },
    vulto: { pele: '#1A1A22', cabelo: { tipo: 'curto', cor: '#101016', brilho: '#22222A' }, olhos: 'zumbi', cabeca: 1.15, queixo: 'quadrado', rasgado: true, sombraTotal: true,
      tronco: { cor: '#16161E' }, braco: { pele: true }, calca: '#121218', bota: '#0C0C10', largura: 1.1 },
    seuzeMoco: { pele: '#E2B89A', cabelo: { tipo: 'curto', cor: '#3A2A20', brilho: '#5A4A3A' }, olhos: 'normal', cabeca: 1.25, queixo: 'quadrado',
      tronco: { cor: '#7A8A9A', cinto: '#2A1E14' }, braco: { pele: true, manga: '#7A8A9A' }, calca: '#4A3A2A', bota: '#2A1E14', largura: 1.15 },
    tiaozinho: { pele: '#C98E6A', cabelo: { tipo: 'curto', cor: '#3A2A1A', brilho: '#5A4A3A' }, olhos: 'grande', cabeca: 1.6, queixo: 'redondo',
      tronco: { cor: '#8AA0C0' }, braco: { pele: true, manga: '#8AA0C0' }, perna: 'pele', bota: '#3A2618', largura: 1.1 },
  };

  function Volume(b, look, { luz = [-0.75, -0.55], borda = '#FF8AD8', sombra = '#3A2058', contorno = 7, id = 'v' + Math.floor(Math.random() * 1e6) } = {}) {
    const Ld = nrm(luz);                                   // de onde vem a luz principal
    let gid = 0, defs = '';
    const tons = cor => ({ base: cor, sombra: mix(cor, sombra, 0.3), borda: mix(cor, borda, 0.55) });
    const setLuz = (b2, s2) => { if (b2) borda = b2; if (s2) sombra = s2; };
    // gradiente "cel": lado da luz = base, lado oposto = sombra, beirada oposta = luz de borda colorida
    const grad = (centro, n, r, cor, som = 0.66) => { const T = tons(cor), k = dot(n, Ld) < 0 ? 1 : -1, a = add(centro, mul(n, -k * r)), z = add(centro, mul(n, k * r)), i = `${id}g${gid++}`;
      defs += `<linearGradient id="${i}" gradientUnits="userSpaceOnUse" x1="${f(a[0] + Ld[0] * r * 0.4)}" y1="${f(a[1] + Ld[1] * r * 0.4)}" x2="${f(z[0])}" y2="${f(z[1])}"><stop offset="0" stop-color="${mix(T.base, '#FFFFFF', 0.14)}"/><stop offset=".3" stop-color="${T.base}"/><stop offset="${som}" stop-color="${T.base}"/><stop offset="${som}" stop-color="${T.sombra}"/><stop offset=".88" stop-color="${T.sombra}"/><stop offset=".9" stop-color="${T.borda}"/><stop offset="1" stop-color="${T.borda}"/></linearGradient>`;
      return `url(#${i})`; };
    // cápsula afinada de A até B
    const capsula = (A, B, r1, r2) => { const d = nrm(sub(B, A)), n = perp(d), a1 = add(A, mul(n, r1)), a2 = add(A, mul(n, -r1)), b1 = add(B, mul(n, r2)), b2 = add(B, mul(n, -r2)), c = 1.33;
      return `M${P2(a1)} L${P2(b1)} C${P2(add(b1, mul(d, r2 * c)))} ${P2(add(b2, mul(d, r2 * c)))} ${P2(b2)} L${P2(a2)} C${P2(add(a2, mul(d, -r1 * c)))} ${P2(add(a1, mul(d, -r1 * c)))} ${P2(a1)}Z`; };
    const membro = (A, B, r1, r2, cor) => ({ d: capsula(A, B, r1, r2), fill: grad(lp(A, B, 0.5), perp(nrm(sub(B, A))), (r1 + r2) / 2, cor) });
    // uma "peça": contorno de todas as formas juntas (sem emenda), depois os preenchimentos
    const peca = (formas, ol = contorno) => `<path d="${formas.map(x => x.d).join(' ')}" fill="${L}" stroke="${L}" stroke-width="${f(ol * 2)}" stroke-linejoin="round"/>` + formas.map(x => `<path d="${x.d}" fill="${x.fill}"${x.extra || ''}/>`).join('');

    return { luz: setLuz, svg(t) {
      const E = b._esq; if (!E || b.g.style.display === 'none') return '';
      defs = ''; gid = 0;
      const { pernas, bracos, perto, longe, top, H, vista, dir, s, rot } = E, R = p => rot(p);
      const W = look.largura || 1, costas = E.costas;
      const up = nrm(sub(top, H)), lat = perp(up), sx = vista === 'frente' ? 1 : dir;
      const pele = look.pele, ex = b.expressaoEm(t).nome; let sobSvg = '';
      // ----- pernas -----
      const perna = i => { const Lg = pernas[i], q = R(Lg.q), j = R(Lg.j), tz = R(Lg.tz), calc = R(Lg.calc), ponta = R(Lg.ponta);
        const corC = look.perna === 'pele' ? pele : look.calca, F = [membro(q, j, 21 * s * W, 17 * s * W, corC), membro(j, tz, 17 * s * W, 12 * s * W, corC)];
        if (look.meia) F.push(membro(lp(j, tz, 0.72), tz, 13 * s, 12 * s, look.meia));
        // bota / sapato: cano + pé com sola
        const pd = nrm(sub(ponta, calc)), pn = perp(pd), alto = vista === 'frente' ? 16 * s : 22 * s;
        const sola0 = add(calc, mul(pd, -6 * s)), sola1 = add(ponta, mul(pd, 10 * s)), cimaP = add(sola1, mul(pn, (pn[1] < 0 ? 1 : -1) * alto * 0.7)), cimaC = add(tz, mul(nrm(sub(tz, j)), -10 * s));
        const up2 = pn[1] < 0 ? pn : mul(pn, -1);
        F.push({ d: `M${P2(add(cimaC, mul(lat, -15 * s)))} L${P2(add(cimaC, mul(lat, 15 * s)))} L${P2(add(sola1, mul(up2, alto)))} Q${P2(add(sola1, mul(pd, 8 * s)))} ${P2(sola1)} L${P2(sola0)} Q${P2(add(sola0, mul(up2, alto)))} ${P2(add(cimaC, mul(lat, -15 * s)))}Z`, fill: grad(lp(tz, ponta, 0.5), up2, alto, look.bota) });
        F.push({ d: `M${P2(sola0)} L${P2(sola1)} L${P2(add(sola1, mul(up2, -5 * s)))} L${P2(add(sola0, mul(up2, -5 * s)))}Z`, fill: '#0A0A0E' });
        return peca(F); };
      // ----- braços -----
      const braco = l => { const B = bracos[l], o = R(B.o), c = R(B.c), m = R(B.m), corB = look.braco.pele ? pele : look.braco.manga;
        const F = [membro(o, c, 15 * s * W, 12 * s * W, corB), membro(c, m, 12 * s * W, 10 * s * W, look.braco.pele ? pele : look.braco.manga)];
        if (look.braco.manga && look.braco.pele) F.push(membro(o, lp(o, c, 0.45), 18 * s * W, 16 * s * W, look.braco.manga));   // manguinha bufante
        else if (look.braco.manga) F[1] = membro(c, lp(c, m, 0.8), 12 * s * W, 11 * s * W, look.braco.manga);
        const mr = 15 * s * Math.max(1, W);
        F.push({ d: `M${P2(add(m, [mr, 0]))} A${f(mr)} ${f(mr)} 0 1 1 ${P2(add(m, [-mr, 0]))} A${f(mr)} ${f(mr)} 0 1 1 ${P2(add(m, [mr, 0]))}Z`, fill: grad(m, [1, 0], mr, look.braco.luva || pele) });
        if (look.braco.luva) F.push({ d: `M${P2(add(m, [-mr * 0.6, -mr * 0.35]))} Q${P2(add(m, [0, -mr * 0.75]))} ${P2(add(m, [mr * 0.6, -mr * 0.35]))}`, fill: 'none', extra: ` stroke="${mix(look.braco.luva, '#FFFFFF', 0.25)}" stroke-width="${f(3 * s)}" stroke-linecap="round"` });
        return peca(F); };
      // ----- tronco -----
      const tronco = () => { const T = look.tronco, ws = (vista === 'frente' ? 44 : 28) * s * W, ww = (vista === 'frente' ? 30 : 22) * s * W, wh = (vista === 'frente' ? 34 : 24) * s * W;
        const ombro = add(top, mul(up, 6 * s)), peito = lp(top, H, 0.3), cint = lp(top, H, 0.72), off = vista === 'frente' ? [0, 0] : mul(lat, -sx * 4 * s);
        const P = (c, w, k = 1) => add(add(c, off), mul(lat, w * k));
        let d = `M${P2(P(ombro, ws, -1))} Q${P2(add(P(ombro, 0), mul(up, 8 * s)))} ${P2(P(ombro, ws))} Q${P2(P(peito, ws * 1.06))} ${P2(P(cint, ww))} L${P2(P(H, wh))} Q${P2(add(H, mul(up, -10 * s)))} ${P2(P(H, wh, -1))} L${P2(P(cint, ww, -1))} Q${P2(P(peito, ws * 1.06, -1))} ${P2(P(ombro, ws, -1))}Z`;
        const F = [{ d, fill: grad(lp(top, H, 0.5), lat, ws, T.cor) }];
        if (T.vestido) { const barra = add(H, mul(up, -110 * s)), wb = (vista === 'frente' ? 70 : 52) * s;
          F.push({ d: `M${P2(P(cint, ww * 1.02, -1))} L${P2(P(cint, ww * 1.02))} Q${P2(P(lp(cint, barra, 0.5), wb * 0.8))} ${P2(P(barra, wb))} Q${P2(add(barra, mul(up, -10 * s)))} ${P2(P(barra, wb, -1))} Q${P2(P(lp(cint, barra, 0.5), wb * 0.8, -1))} ${P2(P(cint, ww * 1.02, -1))}Z`, fill: grad(lp(cint, barra, 0.5), lat, wb, T.cor) });
          if (T.gola && !costas) F.push({ d: `M${P2(P(ombro, 16 * s, -1))} Q${P2(add(ombro, mul(up, -26 * s)))} ${P2(P(ombro, 16 * s))} L${P2(P(ombro, 10 * s))} Q${P2(add(ombro, mul(up, -14 * s)))} ${P2(P(ombro, 10 * s, -1))}Z`, fill: T.gola }); }
        if (T.colete && !costas) { const w2 = vista === 'frente' ? 1 : 0.5, v0 = P(ombro, 14 * s * w2, -1), v1 = P(ombro, 14 * s * w2), vb = P(lp(top, H, 0.62), 0);
          F.push({ d: `M${P2(v0)} L${P2(v1)} L${P2(vb)}Z`, fill: grad(lp(top, vb, 0.5), lat, 14 * s, pele) });
          F.push({ d: `M${P2(lp(v0, vb, 0.55))} q${f(3 * s)} ${f(6 * s)} ${f(8 * s)} ${f(4 * s)}`, fill: 'none', extra: ` stroke="${mix(pele, sombra, 0.5)}" stroke-width="${f(3 * s)}"` });
          F.push({ d: `M${P2(add(P(ombro, ws * 0.95, -1), [0, 4 * s]))} L${P2(add(P(ombro, ws * 0.95, -1), [0, 18 * s]))}`, fill: 'none', extra: ` stroke="#3A3A46" stroke-width="${f(3 * s)}"` }); }
        if (T.cinto) { const c0 = P(lp(cint, H, 0.55), wh * 1.02, -1), c1 = P(lp(cint, H, 0.55), wh * 1.02), dn = mul(up, -9 * s);
          F.push({ d: `M${P2(add(c0, mul(dn, -1)))} L${P2(add(c1, mul(dn, -1)))} L${P2(add(c1, dn))} L${P2(add(c0, dn))}Z`, fill: T.cinto });
          if (T.fivela) { const fc = P(lp(cint, H, 0.55), vista === 'frente' ? 0 : sx * wh * 0.6); F.push({ d: `M${P2(add(fc, [-9 * s, -9 * s]))} h${f(18 * s)} v${f(18 * s)} h${f(-18 * s)}Z`, fill: T.fivela, extra: ` stroke="${L}" stroke-width="${f(2.5 * s)}"` }); } }
        return peca(F); };
      // ----- cabeça (grande), cabelo e rosto -----
      const cabeca = () => { const Rh = 58 * s * (look.cabeca || 1), pesc = R(E.pescoco), yaw = E.cabeca.yaw || 0, ay = Math.abs(yaw), sy = ay > 0.5 ? Math.sign(yaw) : 0;
        const incl = ((E.cabeca.inclinar || 0) - (E.cabeca.baixar || 0) * 0.3 * (sy || 1)) * (sy || 1);
        const C = add(pesc, mul(up, Rh * 0.92 + 14 * s));   // um pedaço de pescoço à mostra
        const hb = look.cabelo, F0 = [], F = [];
        let o = '';
        // cabelo de trás
        if (hb.tipo === 'longo') F0.push({ d: `M${P2(add(C, [-Rh * 1.05, -Rh * 0.2]))} Q${P2(add(C, [-Rh * 1.25, Rh * 1.6]))} ${P2(add(C, [-Rh * 0.7, Rh * 2.1]))} L${P2(add(C, [Rh * 0.7, Rh * 2.1]))} Q${P2(add(C, [Rh * 1.25, Rh * 1.6]))} ${P2(add(C, [Rh * 1.05, -Rh * 0.2]))} Q${P2(add(C, [0, -Rh * 1.5]))} ${P2(add(C, [-Rh * 1.05, -Rh * 0.2]))}Z`, fill: grad(add(C, [0, Rh * 0.6]), [1, 0], Rh, hb.cor) });
        if (hb.tipo === 'medio') F0.push({ d: `M${P2(add(C, [-Rh * 1.08, -Rh * 0.3]))} L${P2(add(C, [-Rh * 1.12 - sy * Rh * 0.2, Rh * 0.85]))} L${P2(add(C, [-Rh * 0.8 - sy * Rh * 0.3, Rh * 0.65]))} L${P2(add(C, [-Rh * 0.7 - sy * Rh * 0.3, Rh * 1.1]))} L${P2(add(C, [-sy * Rh * 0.6, Rh * 0.9]))} L${P2(add(C, [Rh * 0.7 - sy * Rh * 0.3, Rh * 1.1]))} L${P2(add(C, [Rh * 0.8 - sy * Rh * 0.3, Rh * 0.65]))} L${P2(add(C, [Rh * 1.12 - sy * Rh * 0.2, Rh * 0.85]))} L${P2(add(C, [Rh * 1.08, -Rh * 0.3]))} Q${P2(add(C, [0, -Rh * 1.45]))} ${P2(add(C, [-Rh * 1.08, -Rh * 0.3]))}Z`, fill: grad(C, [1, 0], Rh, hb.cor) });
        if (F0.length) o += peca(F0);
        // pescoço (depois do cabelo de trás, para não sumir atrás dele)
        o += peca([membro(add(pesc, mul(up, -10 * s)), add(pesc, mul(up, Rh * 0.5)), 12 * s * Math.min(W, 1.2), 11 * s * Math.min(W, 1.2), pele)]);
        // rosto (formato)
        const qx = look.queixo === 'quadrado' ? 0.82 : 0.95, fc = add(C, [sy * Rh * 0.06, 0]);
        const face = `M${P2(add(fc, [-Rh, -Rh * 0.1]))} Q${P2(add(fc, [-Rh, -Rh * 1.05]))} ${P2(add(fc, [0, -Rh * 1.05]))} Q${P2(add(fc, [Rh, -Rh * 1.05]))} ${P2(add(fc, [Rh, -Rh * 0.1]))} Q${P2(add(fc, [Rh * qx + (sy > 0 ? Rh * 0.12 : 0), Rh * 0.85]))} ${P2(add(fc, [sy * Rh * 0.25, Rh * 0.98]))} Q${P2(add(fc, [-Rh * qx - (sy < 0 ? Rh * 0.12 : 0), Rh * 0.85]))} ${P2(add(fc, [-Rh, -Rh * 0.1]))}Z`;
        F.push({ d: face, fill: grad(C, nrm([Ld[0] * 0.5, -1]), Rh * 1.1, pele, 0.9) });
        if (look.barba) F.push({ d: `M${P2(add(fc, [-Rh * 0.92, Rh * 0.25]))} Q${P2(add(fc, [-Rh * 0.8, Rh * 0.92]))} ${P2(add(fc, [sy * Rh * 0.25, Rh * 0.98]))} Q${P2(add(fc, [Rh * 0.8, Rh * 0.92]))} ${P2(add(fc, [Rh * 0.92, Rh * 0.25]))} Q${P2(add(fc, [0, Rh * 0.55]))} ${P2(add(fc, [-Rh * 0.92, Rh * 0.25]))}Z`, fill: look.barba, extra: ' opacity=".38"' });
        o += peca(F);
        if (costas) { o += cabeloFrente(C, Rh, sy, true); return o; }
        // olhos, sobrancelhas, nariz, boca
        const fx = yaw * Rh * 0.42, ey = C[1] - Rh * 0.08, big = look.olhos === 'grande' ? 1.25 : 1, er = [Rh * 0.2 * big, Rh * 0.25 * big];
        const tampa = { pesado: 0.42, grande: 0.05, normal: 0.15, zumbi: 0.2 }[look.olhos] + ({ serio: 0.12, desconfiado: 0.3, cansado: 0.3, medo: -0.25, espanto: -0.3, susto: -0.3, gritando: -0.1, chorando: 0.1, triste: 0.1, feliz: 0.05 }[ex] || 0);
        const sob = { serio: -16, bravo: -26, determinado: -20, desconfiado: -10, medo: 18, triste: 20, chorando: 22, espanto: 10, preocupado: 16, gritando: -8 }[ex] || 0;
        const olhar = E.cabeca.olhar || [0, 0];
        const olho = (side, k = 1) => { const ox = C[0] + fx + side * Rh * 0.4 * (1 - ay * 0.35), c = [ox, ey], rx = er[0] * k, ry = er[1] * k, pis = (b._t * 0.37 % 4) > 3.86;
          let h = `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(rx)}" ry="${f(ry)}" fill="#FFFFFF" stroke="${L}" stroke-width="${f(4 * s)}"/>`;
          if (look.olhos === 'zumbi') { h = `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(rx)}" ry="${f(ry * 0.85)}" fill="${look.sombraTotal ? '#C8D0C0' : '#EEF2E6'}" stroke="${L}" stroke-width="${f(4 * s)}"/><path d="M${f(c[0] - rx * 0.8)} ${f(c[1])} l${f(rx * 0.35)} ${f(-ry * 0.12)} M${f(c[0] + rx * 0.8)} ${f(c[1] + ry * 0.1)} l${f(-rx * 0.3)} ${f(-ry * 0.15)}" stroke="#B8484A" stroke-width="${f(2 * s)}" opacity=".7"/><path d="M${f(c[0] - rx * 1.05)} ${f(c[1] - ry * 0.55)} Q${f(c[0])} ${f(c[1] - ry * 0.85)} ${f(c[0] + rx * 1.05)} ${f(c[1] - ry * 0.55)}" stroke="${L}" stroke-width="${f(6 * s)}" fill="none" stroke-linecap="round"/>`; return h; }
          const pr = rx * (look.olhos === 'grande' ? 0.6 : 0.5) * (ex === 'medo' || ex === 'espanto' ? 0.6 : 1), px = c[0] + yaw * rx * 0.35 + olhar[0] * rx * 0.3, py = c[1] + ry * 0.1;
          h += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(pr)}" fill="#1A1420"/><circle cx="${f(px - pr * 0.35)}" cy="${f(py - pr * 0.4)}" r="${f(pr * 0.32)}" fill="#FFFFFF"/>`;
          const tp = pis ? 1 : Math.max(0, tampa), ly = c[1] - ry + ry * 2 * tp;
          if (tp > 0.02) h += `<path d="M${f(c[0] - rx - 2)} ${f(c[1] - ry - 3)} H${f(c[0] + rx + 2)} V${f(ly)} H${f(c[0] - rx - 2)}Z" fill="${mix(pele, sombra, 0.18)}"/>`;
          h += `<path d="M${f(c[0] - rx * 1.05)} ${f(ly + ry * 0.15)} Q${f(c[0])} ${f(ly - ry * 0.25)} ${f(c[0] + rx * 1.05)} ${f(ly + ry * 0.15)}" stroke="${L}" stroke-width="${f(6 * s)}" fill="none" stroke-linecap="round"/>`;
          if (look.cilios) h += `<path d="M${f(c[0] + side * rx * 0.95)} ${f(ly + ry * 0.1)} l${f(side * 9 * s)} ${f(-6 * s)} M${f(c[0] + side * rx * 0.7)} ${f(ly - ry * 0.05)} l${f(side * 7 * s)} ${f(-8 * s)}" stroke="${L}" stroke-width="${f(4 * s)}" stroke-linecap="round"/>`;
          const by = c[1] - ry - Rh * 0.16, inn = c[0] - side * rx * 0.9, out = c[0] + side * rx * 1.1, a = sob * Math.PI / 180;
          sobSvg += `<path d="M${f(inn)} ${f(by - sob * 1.3 * s - (sob > 0 ? sob * 0.5 * s : 0))} Q${f(c[0])} ${f(by - Rh * 0.1 - (sob > 0 ? sob * 0.9 * s : 0))} ${f(out)} ${f(by + sob * 0.15 * s - (sob > 0 ? sob * 0.3 * s : 0))}" stroke="${look.cabelo.cor}" stroke-width="${f(Rh * 0.11)}" fill="none" stroke-linecap="round"/>`;
          return h; };
        let fcSvg = ''; sobSvg = '';
        if (ay < 0.55) fcSvg += olho(-1) + olho(1); else fcSvg += olho(sy, 1);
        // nariz
        const nx = C[0] + fx * 1.25 + sy * Rh * 0.15, ny = C[1] + Rh * 0.22;
        fcSvg += ay < 0.55 ? `<path d="M${f(nx - 4 * s)} ${f(ny - 8 * s)} q${f(8 * s)} ${f(10 * s)} ${f(0)} ${f(12 * s)}" stroke="${mix(pele, sombra, 0.5)}" stroke-width="${f(4 * s)}" fill="none" stroke-linecap="round"/>`
          : `<path d="M${f(C[0] + sy * Rh * 0.92)} ${f(ny - 14 * s)} l${f(sy * 12 * s)} ${f(14 * s)} l${f(-sy * 10 * s)} ${f(4 * s)}" stroke="${L}" stroke-width="${f(4 * s)}" fill="${pele}" stroke-linejoin="round"/>`;
        // boca: fonema do lip-sync ou a expressão
        const bf = b.boca ? b.boca(t) : 'smile', mx = C[0] + fx * 1.15 + sy * Rh * 0.2, my = C[1] + Rh * 0.55, mw = Rh * (ay < 0.55 ? 0.34 : 0.22);
        const ab = { '0': 0, '1': 0.12, '2': 0.24, '3': 0.36 }[bf];
        if (ab != null && ab > 0) fcSvg += `<path d="M${f(mx - mw)} ${f(my)} Q${f(mx)} ${f(my - Rh * 0.05)} ${f(mx + mw)} ${f(my)} Q${f(mx)} ${f(my + Rh * ab * 1.6)} ${f(mx - mw)} ${f(my)}Z" fill="#4A1420" stroke="${L}" stroke-width="${f(4 * s)}" stroke-linejoin="round"/><path d="M${f(mx - mw * 0.5)} ${f(my + Rh * ab * 0.9)} Q${f(mx)} ${f(my + Rh * ab * 0.5)} ${f(mx + mw * 0.5)} ${f(my + Rh * ab * 0.9)}" stroke="#E86A7A" stroke-width="${f(5 * s)}" fill="none"/>`;
        else if (look.olhos === 'zumbi') fcSvg += `<path d="M${f(mx - mw * 0.9)} ${f(my - 2 * s)} Q${f(mx)} ${f(my - 8 * s)} ${f(mx + mw * 0.9)} ${f(my)} Q${f(mx + mw * 0.2)} ${f(my + Rh * 0.42)} ${f(mx - mw * 0.9)} ${f(my - 2 * s)}Z" fill="#1A0A0C" stroke="${L}" stroke-width="${f(4 * s)}"/><path d="M${f(mx - mw * 0.6)} ${f(my - 4 * s)} v${f(7 * s)} M${f(mx - mw * 0.1)} ${f(my - 5 * s)} v${f(8 * s)} M${f(mx + mw * 0.45)} ${f(my - 3 * s)} v${f(7 * s)}" stroke="#D8D0B0" stroke-width="${f(5 * s)}"/>`;
        else if (ex === 'medo' || ex === 'espanto' || ex === 'gritando') fcSvg += `<path d="M${f(mx - mw)} ${f(my + 4 * s)} q${f(mw * 0.33)} ${f(-8 * s)} ${f(mw * 0.66)} 0 t${f(mw * 0.66)} 0 t${f(mw * 0.66)} 0" stroke="${L}" stroke-width="${f(5 * s)}" fill="none" stroke-linecap="round"/>`;
        else if (ex === 'triste' || ex === 'chorando') fcSvg += `<path d="M${f(mx - mw * 0.8)} ${f(my + 8 * s)} Q${f(mx)} ${f(my - 6 * s)} ${f(mx + mw * 0.8)} ${f(my + 8 * s)}" stroke="${L}" stroke-width="${f(5 * s)}" fill="none" stroke-linecap="round"/>`;
        else fcSvg += `<path d="M${f(mx - mw * 0.8)} ${f(my)} Q${f(mx + mw * 0.1)} ${f(my + 10 * s)} ${f(mx + mw * 0.9)} ${f(my - 8 * s)}" stroke="${L}" stroke-width="${f(5 * s)}" fill="none" stroke-linecap="round"/>`;   // meio sorriso de canto
        if (ex === 'chorando') fcSvg += `<path d="M${f(C[0] + fx - Rh * 0.4)} ${f(ey + er[1])} q${f(-4 * s)} ${f(20 * s)} 0 ${f(30 * s)}" stroke="#8AD0F2" stroke-width="${f(7 * s)}" fill="none" stroke-linecap="round"/>`;
        // bochecha rosada (luz quente)
        fcSvg += `<ellipse cx="${f(C[0] + fx - Rh * 0.55)}" cy="${f(C[1] + Rh * 0.32)}" rx="${f(Rh * 0.16)}" ry="${f(Rh * 0.09)}" fill="#F27A8A" opacity="${look.olhos === 'grande' ? 0.45 : 0.18}"/>`;
        return o + fcSvg + cabeloFrente(C, Rh, sy, false) + sobSvg; };
      const cabeloFrente = (C, Rh, sy, deCostas) => { const hb = look.cabelo; let F = [];
        if (look.chapeu) { F.push({ d: `M${P2(add(C, [-Rh * 1.55, -Rh * 0.45]))} Q${P2(add(C, [0, -Rh * 0.2]))} ${P2(add(C, [Rh * 1.55, -Rh * 0.45]))} Q${P2(add(C, [0, -Rh * 0.85]))} ${P2(add(C, [-Rh * 1.55, -Rh * 0.45]))}Z`, fill: grad(C, [0, 1], Rh, look.chapeu) });
          F.push({ d: `M${P2(add(C, [-Rh * 0.8, -Rh * 0.6]))} Q${P2(add(C, [-Rh * 0.8, -Rh * 1.6]))} ${P2(add(C, [0, -Rh * 1.55]))} Q${P2(add(C, [Rh * 0.8, -Rh * 1.6]))} ${P2(add(C, [Rh * 0.8, -Rh * 0.6]))}Z`, fill: grad(C, [1, 0], Rh, look.chapeu) });
          return peca(F); }
        if (deCostas) { F.push({ d: `M${P2(add(C, [-Rh * 1.05, Rh * 0.6]))} Q${P2(add(C, [-Rh * 1.2, -Rh * 1.3]))} ${P2(add(C, [0, -Rh * 1.2]))} Q${P2(add(C, [Rh * 1.2, -Rh * 1.3]))} ${P2(add(C, [Rh * 1.05, Rh * 0.6]))}Z`, fill: grad(C, [1, 0], Rh, hb.cor) }); return peca(F); }
        if (hb.tipo === 'medio') F.push({ d: `M${P2(add(C, [-Rh * 1.12, Rh * 0.15]))} Q${P2(add(C, [-Rh * 1.25, -Rh * 1.25]))} ${P2(add(C, [Rh * 0.1, -Rh * 1.22]))} Q${P2(add(C, [Rh * 1.3, -Rh * 1.15]))} ${P2(add(C, [Rh * 1.12, Rh * 0.15]))} L${P2(add(C, [Rh * 0.92, -Rh * 0.35]))} L${P2(add(C, [Rh * 0.55 + sy * Rh * 0.2, -Rh * 0.2]))} L${P2(add(C, [Rh * 0.42 + sy * Rh * 0.2, -Rh * 0.55]))} L${P2(add(C, [Rh * 0.05 + sy * Rh * 0.2, -Rh * 0.3]))} L${P2(add(C, [-Rh * 0.15 + sy * Rh * 0.2, -Rh * 0.62]))} L${P2(add(C, [-Rh * 0.5 + sy * Rh * 0.2, -Rh * 0.28]))} L${P2(add(C, [-Rh * 0.7 + sy * Rh * 0.2, -Rh * 0.55]))} L${P2(add(C, [-Rh * 0.92, -Rh * 0.2]))}Z`, fill: grad(C, [1, 0], Rh, hb.cor) });
        if (hb.tipo === 'longo') F.push({ d: `M${P2(add(C, [-Rh * 1.08, Rh * 0.35]))} Q${P2(add(C, [-Rh * 1.2, -Rh * 1.25]))} ${P2(add(C, [0, -Rh * 1.18]))} Q${P2(add(C, [Rh * 1.2, -Rh * 1.25]))} ${P2(add(C, [Rh * 1.08, Rh * 0.35]))} Q${P2(add(C, [Rh * 0.85, -Rh * 0.35]))} ${P2(add(C, [Rh * 0.5, -Rh * 0.5]))} Q${P2(add(C, [0, -Rh * 0.72]))} ${P2(add(C, [-Rh * 0.5, -Rh * 0.5]))} Q${P2(add(C, [-Rh * 0.85, -Rh * 0.35]))} ${P2(add(C, [-Rh * 1.08, Rh * 0.35]))}Z`, fill: grad(C, [1, 0], Rh, hb.cor) });
        if (hb.tipo === 'curto') F.push({ d: `M${P2(add(C, [-Rh * 1.02, -Rh * 0.1]))} Q${P2(add(C, [-Rh * 1.05, -Rh * 1.15]))} ${P2(add(C, [0, -Rh * 1.12]))} Q${P2(add(C, [Rh * 1.05, -Rh * 1.15]))} ${P2(add(C, [Rh * 1.02, -Rh * 0.1]))} Q${P2(add(C, [0, -Rh * 0.75]))} ${P2(add(C, [-Rh * 1.02, -Rh * 0.1]))}Z`, fill: grad(C, [1, 0], Rh, hb.cor) });
        let o = peca(F);
        // mecha de brilho no cabelo
        o += `<path d="M${P2(add(C, [-Rh * 0.6, -Rh * 0.95]))} Q${P2(add(C, [-Rh * 0.1, -Rh * 1.12]))} ${P2(add(C, [Rh * 0.35, -Rh * 0.98]))}" stroke="${hb.brilho}" stroke-width="${f(Rh * 0.09)}" fill="none" stroke-linecap="round" opacity=".8"/>`;
        if (hb.tiara) o += `<path d="M${P2(add(C, [-Rh * 0.98, -Rh * 0.5]))} Q${P2(add(C, [0, -Rh * 1.35]))} ${P2(add(C, [Rh * 0.98, -Rh * 0.5]))}" stroke="${L}" stroke-width="${f(Rh * 0.2)}" fill="none" stroke-linecap="round"/><path d="M${P2(add(C, [-Rh * 0.98, -Rh * 0.5]))} Q${P2(add(C, [0, -Rh * 1.35]))} ${P2(add(C, [Rh * 0.98, -Rh * 0.5]))}" stroke="${hb.tiara}" stroke-width="${f(Rh * 0.12)}" fill="none" stroke-linecap="round"/>`;
        return o; };
      // ----- ordem de desenho (longe → perto) -----
      let o = '';
      if (vista !== 'frente') o = braco(longe.braco) + perna(longe.perna) + tronco() + perna(perto.perna) + cabeca() + braco(perto.braco);
      if (vista === 'frente') { o = perna(0) + perna(1) + tronco() + braco('e') + braco('d') + cabeca(); }
      return `<defs>${defs}</defs>` + o;
    } };
  }
  Volume.LOOK = LOOK;
  global.Volume = Volume;
})(typeof window !== 'undefined' ? window : globalThis);
