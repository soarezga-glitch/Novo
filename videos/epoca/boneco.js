/*
  boneco.js — stickman com articulações humanas e cinemática inversa (IK) 2D.
  Skill "movimento-humano". Sem dependências; determinístico (mesmo t → mesmo desenho).

  Uso básico:
    const b = new Boneco(svgGroup, { escala: 0.9, roupa: '#C8553D' });
    b.base(0, 3, 'andar', { de: [100, 1700], ate: [700, 1700] });   // pernas/tronco
    b.base(3, 6, 'parado', { x: 700, y: 1700, vista: 'frente' });
    b.braco('d', 3.5, 5, 'acenar');                                  // braço por cima da base
    b.expressao(4, 6, 'feliz');
    // a cada quadro:  b.desenhar(t)   (chame dentro de window.__seek)

  Convenções:
    - Coordenadas de mundo (as do SVG). y cresce para baixo. Comprimentos já multiplicados pela escala.
    - Ângulos em graus, medidos a partir da vertical para baixo.
      Perfil: positivo = para frente (direção em que ele olha, dir = 1 direita / -1 esquerda).
      Frente: positivo = para fora (para o lado do próprio membro).
    - Joelho só dobra para trás e cotovelo só dobra para frente: o IK sempre escolhe
      a solução anatômica (joelho apontando para a frente do corpo).
*/
(function (global) {
  const RAD = Math.PI / 180;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = u => u * u * (3 - 2 * u);
  const frac = v => v - Math.floor(v);
  const norm = a => ((a + 540) % 360) - 180;   // ângulo em (-180, 180]
  const NS = 'http://www.w3.org/2000/svg';

  // Medidas do corpo em unidades locais (altura total ≈ 560 com escala 1)
  const M = {
    coxa: 118, canela: 112, pe: 44, tornozelo: 10,
    tronco: 190, pescoco: 18, cabeca: 62,
    braco: 96, antebraco: 90,
    quadrilFrente: 14, ombroFrente: 32,
    alturaQuadril: 238
  };

  // Ciclos de locomoção (unidades locais; ver references/biomecanica.md)
  const GAIT = {
    andar:  { passo: 120, apoio: 0.62, quadril: 228, balanco: 5, elevar: 34, bracos: 22, cotovelo: 14, inclina: 3, calcanhar: true },
    correr: { passo: 175, apoio: 0.38, quadril: 218, balanco: 9, elevar: 70, bracos: 38, cotovelo: 88, inclina: 11, calcanhar: false, chute: 70 },
    subir:  { passo: 120, apoio: 0.62, quadril: 226, balanco: 4, elevar: 42, bracos: 16, cotovelo: 20, inclina: 9, calcanhar: false }
  };

  function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // vetor de comprimento L num ângulo a (graus, a partir de "para baixo"), sx = sinal horizontal
  const vec = (a, L, sx) => [sx * Math.sin(a * RAD) * L, Math.cos(a * RAD) * L];
  const add = (p, v) => [p[0] + v[0], p[1] + v[1]];
  // ângulo de um vetor medido a partir de "para baixo", positivo para sx
  const angOf = (v, sx) => Math.atan2(sx * v[0], v[1]) / RAD;

  /* IK de 2 ossos. P = raiz (quadril/ombro), A = alvo (tornozelo/mão).
     sx = lado para onde a articulação do meio aponta (joelho: frente; cotovelo: trás... ver 'dobra').
     dobra = +1 → articulação do meio fica do lado sx (joelho para frente);
             -1 → do lado oposto (cotovelo para trás). */
  function ik2(P, A, L1, L2, sx, dobra) {
    const v = [A[0] - P[0], A[1] - P[1]];
    const d = clamp(Math.hypot(v[0], v[1]), Math.abs(L1 - L2) + 0.5, L1 + L2 - 0.05);
    const base = angOf(v, sx);
    const a1 = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)) / RAD;
    const a1s = base + dobra * a1;                       // ângulo do osso de cima
    const meio = add(P, vec(a1s, L1, sx));
    const fim = add(P, vec(base, d, sx));
    const a2s = angOf([fim[0] - meio[0], fim[1] - meio[1]], sx); // ângulo do osso de baixo
    return { a1: a1s, a2: a2s, meio, fim };
  }

  class Boneco {
    constructor(parent, opts = {}) {
      this.s = opts.escala ?? 1;
      this.cor = opts.cor ?? '#FFFFFF';
      this.corLonge = opts.corLonge ?? '#D9D9E3';
      this.tinta = opts.tinta ?? '#1D1D2B';
      this.roupa = opts.roupa ?? null;          // cor da túnica/camisa, ou null
      this.cinto = opts.cinto ?? '#7A2E1F';
      this.bochecha = opts.bochecha ?? '#FF6B5B';
      this.acoes = [];      // base: pernas + tronco
      this.bracos = { e: [], d: [] };
      this.cabecas = [];
      this.expr = [];
      this.sujo = [];
      this.boca = opts.boca || null;            // fn(t) → '0'..'4' | 'smile'
      const rnd = mulberry32(opts.seed ?? 3);
      this.piscadas = []; for (let t = 0.8 + rnd() * 1.5; t < 3600; t += 2.2 + rnd() * 2.2) this.piscadas.push(t);
      this.build(parent, opts.contorno !== false);
    }

    // ---------- API de animação ----------
    base(t0, t1, tipo, p = {}) { this.acoes.push({ t0, t1, tipo, p }); this.acoes.sort((a, b) => a.t0 - b.t0); return this; }
    braco(lado, t0, t1, gesto, p = {}) { (lado === 'ambos' ? ['e', 'd'] : [lado]).forEach(l => this.bracos[l].push({ t0, t1, gesto, p })); return this; }
    cabeca(t0, t1, p) { this.cabecas.push({ t0, t1, p }); return this; }
    expressao(t0, t1, nome) { this.expr.push({ t0, t1, nome }); return this; }
    sujeira(t0, t1) { this.sujo.push({ t0, t1 }); return this; }
    mao(lado) { return this._maos ? this._maos[lado] : [0, 0]; }

    // ---------- construção do SVG ----------
    build(parent, contorno) {
      const g = this.g = document.createElementNS(NS, 'g');
      if (contorno) g.setAttribute('filter', 'url(#outline)');
      parent.appendChild(g);
      const mk = (tag, attrs, pai = g) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); pai.appendChild(e); return e; };
      const sw = 16 * this.s;
      const linha = c => ({ fill: 'none', stroke: c, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      this.el = {};
      this.el.bracoLonge = mk('path', linha(this.corLonge));
      this.el.maoLonge = mk('circle', { r: 11 * this.s, fill: this.corLonge });
      this.el.pernaLonge = mk('path', linha(this.corLonge));
      this.el.tronco = mk('path', linha(this.cor));
      if (this.roupa) {
        this.el.roupa = mk('path', { fill: this.roupa });
        this.el.cinto = mk('path', { fill: 'none', stroke: this.cinto, 'stroke-width': 10 * this.s, 'stroke-linecap': 'round' });
      }
      this.el.pernaPerto = mk('path', linha(this.cor));
      // cabeça
      const h = this.el.cab = mk('g', {});
      this.el.cranio = mk('circle', { r: M.cabeca * this.s, fill: this.cor }, h);
      this.el.rosto = mk('g', {}, h);
      this.el.manchas = [[-26, -30, 18, 11], [30, 30, 15, 8], [6, -48, 10, 6]].map(([x, y, rx, ry]) => mk('ellipse', { rx: rx * this.s, ry: ry * this.s, fill: '#3A3A3A', opacity: 0.55, 'data-x': x, 'data-y': y }, this.el.rosto));
      this.el.bochechas = [0, 1].map(() => mk('circle', { r: 10 * this.s, fill: this.bochecha, opacity: 0.45 }, this.el.rosto));
      this.el.olhos = [0, 1].map(() => mk('ellipse', { rx: 7.5 * this.s, ry: 11 * this.s, fill: this.tinta }, this.el.rosto));
      this.el.sobrancelhas = [0, 1].map(() => mk('path', { fill: 'none', stroke: this.tinta, 'stroke-width': 6 * this.s, 'stroke-linecap': 'round' }, this.el.rosto));
      this.el.boca = mk('path', { fill: this.tinta, stroke: this.tinta, 'stroke-width': 6 * this.s, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, this.el.rosto);
      this.el.bracoPerto = mk('path', linha(this.cor));
      this.el.maoPerto = mk('circle', { r: 11 * this.s, fill: this.cor });
    }

    // ---------- poses base ----------
    // Retorna pose "corporal": R (raiz no chão), quadril, inclina, vista, dir, giro, pés {tornozelo, inclinacao, chao}, braços padrão
    poseBase(a, t) {
      const s = this.s, p = a.p;
      const vista = p.vista ?? (['andar', 'correr', 'subir', 'sentar', 'deitado'].includes(a.tipo) ? 'perfil' : 'frente');
      const dir = p.dir ?? (a.tipo === 'andar' || a.tipo === 'correr' || a.tipo === 'subir' ? Math.sign((p.ate[0] - p.de[0]) || 1) : 1);
      const respira = Math.sin(t * 2 * Math.PI / 3.2) * 2.2 * s;
      if (a.tipo === 'parado' || a.tipo === 'deitado' || a.tipo === 'agachar') {
        const x = p.x, y = p.y, chao = y;
        const agacha = a.tipo === 'agachar' ? (p.quanto ?? 60) * s : 0;
        const hq = M.alturaQuadril * s - agacha + respira * 0.3;
        if (vista === 'frente') {
          const abre = (p.abertura ?? 30) * s;
          return { vista, dir, R: [x, y], giro: a.tipo === 'deitado' ? (p.giro ?? -90) : 0, inclina: 0, quadril: [x, y - hq], respira,
            pes: [{ tz: [x - abre, chao - M.tornozelo * s], inc: 0 }, { tz: [x + abre, chao - M.tornozelo * s], inc: 0 }],
            bracos: { e: { o: 10, c: 10 }, d: { o: 10, c: 10 } } };
        }
        const pass = (p.passada ?? 14) * s;
        return { vista, dir, R: [x, y], giro: a.tipo === 'deitado' ? (p.giro ?? -90) : 0, inclina: a.tipo === 'agachar' ? 14 : 1, quadril: [x - dir * 4 * s, y - hq], respira,
          pes: [{ tz: [x + dir * pass, chao - M.tornozelo * s], inc: 0 }, { tz: [x - dir * pass, chao - M.tornozelo * s], inc: 0 }],
          bracos: { e: { o: 4, c: 12 }, d: { o: -4, c: 12 } } };
      }
      if (a.tipo === 'sentar') {
        // p.x,p.y = ponto do assento (onde fica o quadril), p.chao = y do chão
        const chao = p.chao ?? (p.y + 120 * s);
        const hx = p.x, hy = p.y - 6 * s + respira * 0.3;
        const fx = hx + dir * (M.coxa * 0.92 * s), sep = 6 * s;
        return { vista: 'perfil', dir, R: [hx, chao], giro: 0, inclina: p.inclina ?? 4, quadril: [hx, hy], respira,
          pes: [{ tz: [fx + dir * sep, chao - M.tornozelo * s], inc: 0 }, { tz: [fx - dir * sep, chao - M.tornozelo * s], inc: 0 }],
          bracos: { e: { o: 18, c: 40 }, d: { o: 14, c: 40 } } };
      }
      if (a.tipo === 'pular') {
        // pulo no lugar (frente ou perfil): agacha → sobe → cai → amortece
        const u = clamp((t - a.t0) / Math.max(0.01, a.t1 - a.t0), 0, 1);
        const alt = (p.altura ?? 70) * s;
        let dy = 0, ag = 0;
        if (u < 0.25) ag = Math.sin(u / 0.25 * Math.PI / 2) * 40 * s;
        else if (u < 0.8) { const k = (u - 0.25) / 0.55; dy = Math.sin(k * Math.PI) * alt; ag = (1 - Math.min(1, k * 4)) * 40 * s; }
        else ag = Math.sin((u - 0.8) / 0.2 * Math.PI) * 30 * s;
        const pose = this.poseBase({ tipo: 'parado', p: { ...p, vista } }, t);
        pose.quadril[1] += ag - dy;
        pose.pes.forEach(f => { f.tz[1] -= dy; });
        pose.inclina += ag / s * 0.15;
        if (vista === 'frente') { pose.bracos.e = { o: 20 + dy / s * 1.6, c: 20 }; pose.bracos.d = { o: 20 + dy / s * 1.6, c: 20 }; }
        return pose;
      }
      // locomoção: andar / correr / subir (escada) — pés plantados via IK
      const G = { ...GAIT[a.tipo], ...(p.gait || {}) };
      const chaoF = p.chao || (() => p.de[1]);
      const dx = p.ate[0] - p.de[0];
      const dist = Math.abs(dx);
      const passo = p.passo ?? (dist > 1 ? dist / Math.max(1, Math.round(dist / (G.passo * s))) : G.passo * s);
      const u = clamp((t - a.t0) / Math.max(0.01, a.t1 - a.t0), 0, 1);
      const D = u * dist;                       // distância percorrida pelo quadril
      const fase = D / (2 * passo);
      const pes = [], qs = [];
      for (let i = 0; i < 2; i++) {
        const off = i * 0.5, q = frac(fase + off);
        qs.push(q);
        const k = Math.floor(fase + off);
        const Dk = (k - off) * 2 * passo;                       // distância do quadril no contato desta passada
        const Xf = p.de[0] + dir * (Dk + 0.55 * passo);          // onde o pé pisou
        const Xn = Xf + dir * 2 * passo;                         // próxima pisada
        const gF = chaoF(Xf), gN = chaoF(Xn);
        const tz = M.tornozelo * s, L = M.pe * s;
        let pos, inc;
        if (q < G.apoio) {
          const w = q / G.apoio;
          if (G.calcanhar && w < 0.12) { inc = lerp(18, 0, w / 0.12); pos = [Xf, gF - tz]; }      // calcanhar toca
          else if (w < 0.68) { inc = 0; pos = [Xf, gF - tz]; }                                    // pé chato, apoio
          else {                                                                                  // calcanhar sobe, gira na ponta
            inc = lerp(0, -38, (w - 0.68) / 0.32);
            const ponta = [Xf + dir * L, gF - tz];
            pos = [ponta[0] - dir * L * Math.cos(inc * RAD), ponta[1] - L * Math.sin(-inc * RAD)];
          }
          if (!G.calcanhar && w < 0.12) inc = lerp(6, 0, w / 0.12);
        } else {
          const w = (q - G.apoio) / (1 - G.apoio), e = smooth(w);
          const L0 = L, incIni = -38;
          const xIni = Xf + dir * L0 - dir * L0 * Math.cos(incIni * RAD), yIni = gF - tz - L0 * Math.sin(-incIni * RAD);
          const xFim = Xn, yFim = gN - tz;
          const subida = Math.max(0, gF - gN);
          pos = [lerp(xIni, xFim, e) - dir * Math.sin(w * Math.PI) * (G.chute || 0) * s * (1 - w),
                 lerp(yIni, yFim, e) - Math.sin(w * Math.PI) * (G.elevar * s + subida * 0.6)];
          inc = w < 0.3 ? lerp(-38, -8, w / 0.3) : lerp(-8, G.calcanhar ? 18 : 6, (w - 0.3) / 0.7);
        }
        pes.push({ tz: pos, inc, chao: q < G.apoio ? gF : null });
      }
      const hx = p.de[0] + dir * D;
      const apoioY = pes.map((f, i) => qs[i] < G.apoio ? f.tz[1] + M.tornozelo * s : null).filter(v => v != null);
      const gy = apoioY.length ? apoioY.reduce((a2, b2) => a2 + b2) / apoioY.length : chaoF(hx);
      const bal = Math.cos(2 * Math.PI * (2 * fase - 0.7)) * G.balanco * s;
      const voo = a.tipo === 'correr' ? Math.max(0, Math.sin(2 * Math.PI * (2 * fase - 0.25))) * 18 * s : 0;
      const quadril = [hx, Math.min(gy, chaoF(hx) + 20 * s) - G.quadril * s - bal - voo];
      // braços em oposição às pernas: braço esquerdo acompanha a perna direita
      const bracos = {};
      ['e', 'd'].forEach((l, i) => {
        const qOposta = qs[1 - i];
        const o = G.bracos * Math.cos(2 * Math.PI * qOposta);   // perna oposta à frente → braço à frente
        bracos[l] = { o, c: G.cotovelo + Math.max(0, o) * 0.8 };
      });
      return { vista: 'perfil', dir, R: [hx, chaoF(hx)], giro: 0, inclina: G.inclina, quadril, pes, bracos, respira: 0 };
    }

    // ---------- gestos de braço (sobrepõem a pose base) ----------
    gesto(g, t, lado, ctx) {
      const { vista, dir, ombro, cabeca, s } = ctx;
      const tt = t - g.t0, p = g.p;
      const sx = vista === 'frente' ? (lado === 'e' ? -1 : 1) : dir;
      switch (g.gesto) {
        case 'acenar': return { o: 145, c: 18 + Math.sin(tt * 2 * Math.PI * 2.6) * 26 };
        case 'cima': return { o: 165 + Math.sin(tt * 2 * Math.PI * 1.5) * 4, c: 6 };
        case 'desespero': return { o: 150 + Math.sin(tt * 2 * Math.PI * 3) * 14, c: 20 + Math.sin(tt * 2 * Math.PI * 3 + 1) * 15 };
        case 'encolher': return { o: 38, c: 72 };
        case 'abanar': return { o: 118, c: 52 + Math.sin(tt * 2 * Math.PI * 3) * 28 };
        case 'apontar': return vista === 'frente' ? { o: 120, c: -8 } : { o: 82, c: 2 };
        case 'estender': return vista === 'frente' ? { o: 55, c: 8 } : { o: 68, c: 14 };
        case 'segurar': return vista === 'frente' ? { o: 18, c: 80 } : { o: 12, c: 88 };
        case 'cintura': return vista === 'frente' ? { o: 38, c: -95 } : { o: -20, c: 100 };
        case 'pose': return { o: p.o, c: p.c };
        case 'comer': case 'queixo': case 'nariz': case 'alcancar': {
          // mão até um alvo do rosto (ou p.alvo em mundo) via IK; cotovelo para baixo
          let alvo;
          if (g.gesto === 'alcancar') alvo = p.alvo;
          else if (vista === 'frente') alvo = add(cabeca, g.gesto === 'comer' ? [sx * 6 * s, 34 * s] : g.gesto === 'nariz' ? [sx * 4 * s, 8 * s] : [sx * 10 * s, 60 * s]);
          else alvo = add(cabeca, g.gesto === 'comer' ? [dir * 48 * s, 30 * s] : g.gesto === 'nariz' ? [dir * 58 * s, 4 * s] : [dir * 34 * s, 58 * s]);
          if (g.gesto === 'comer') alvo[1] += Math.sin(tt * 2 * Math.PI * 1.6) * 8 * s;
          const r = ik2(ombro, alvo, M.braco * s, M.antebraco * s, sx, vista === 'frente' ? 1 : -1);
          return { o: r.a1, c: norm(r.a2 - r.a1) };
        }
      }
      return null;
    }

    // ---------- avaliação no tempo t ----------
    acaoEm(lista, t) {
      let atual = null, anterior = null;
      for (const a of lista) { if (a.t0 <= t) { anterior = atual; atual = a; } }
      if (atual && t > atual.t1 && lista !== this.acoes) return { atual: null, anterior: atual };
      return { atual, anterior };
    }

    pose(t) {
      const s = this.s;
      const { atual, anterior } = this.acaoEm(this.acoes, t);
      if (!atual) return null;
      let P = this.poseBase(atual, Math.min(t, atual.t1));
      // transição suave a partir do fim da ação anterior (mesma vista)
      const tr = atual.p.transicao ?? 0.3;
      if (anterior && t - atual.t0 < tr) {
        const Q = this.poseBase(anterior, anterior.t1);
        const u = smooth((t - atual.t0) / tr);
        if (Q.vista === P.vista && Q.dir === P.dir) P = misturar(Q, P, u);
        else if (u < 0.5) P = Q;
      }
      return P;
    }

    desenhar(t) {
      const s = this.s;
      const P = this.pose(t);
      if (!P) { this.g.style.display = 'none'; return; }
      this.g.style.display = '';
      const { vista, dir } = P;
      // tronco
      const inc = P.inclina;
      const H = P.quadril;
      const top = add(H, [dir * Math.sin(inc * RAD) * M.tronco * s * (vista === 'perfil' ? 1 : 0), -Math.cos(inc * RAD) * M.tronco * s - (P.respira || 0)]);
      // cabeça (orientação própria)
      const hc = this.acaoEm(this.cabecas, t).atual;
      const vistaCab = hc?.p.vista ?? vista;
      const inclCab = (hc?.p.inclinar ?? 0) + (vista === 'perfil' ? inc * 0.5 : 0);
      const pescoco = add(top, [0, -M.pescoco * s]);
      const cab = add(pescoco, vec(180 + inclCab, M.cabeca * s, vista === 'perfil' ? dir : 1));
      // pernas via IK
      const quadris = vista === 'frente'
        ? [add(H, [-M.quadrilFrente * s, 0]), add(H, [M.quadrilFrente * s, 0])]
        : [H, H];
      const pernas = P.pes.map((f, i) => {
        const sx = vista === 'frente' ? (i === 0 ? -1 : 1) : dir;
        const r = ik2(quadris[i], f.tz, M.coxa * s, M.canela * s, sx, 1);
        const L = M.pe * s;
        let ponta;
        if (vista === 'frente') ponta = add(r.fim, [sx * L * 0.55, 4 * s]);
        else ponta = add(r.fim, [dir * L * Math.cos(f.inc * RAD), -L * Math.sin(f.inc * RAD)]);
        const calc = vista === 'frente' ? add(r.fim, [-sx * 4 * s, 4 * s]) : add(r.fim, [-dir * 9 * s * Math.cos(f.inc * RAD), 9 * s * Math.sin(f.inc * RAD)]);
        return { q: quadris[i], j: r.meio, tz: r.fim, ponta, calc };
      });
      // braços: base + gestos (com entrada/saída suaves)
      const ombros = vista === 'frente'
        ? { e: add(top, [-M.ombroFrente * s, 16 * s]), d: add(top, [M.ombroFrente * s, 16 * s]) }
        : { e: add(top, [0, 16 * s]), d: add(top, [0, 16 * s]) };
      const ctx = { vista, dir, cabeca: cab, s };
      const maos = {}, bracos = {};
      ['e', 'd'].forEach(l => {
        let ang = { ...P.bracos[l] };
        const lista = this.bracos[l];
        for (const g of lista) {
          if (t < g.t0 - 0.0001 || t > g.t1 + 0.3) continue;
          const alvo = this.gesto(g, Math.min(t, g.t1), l, { ...ctx, ombro: ombros[l] });
          if (!alvo) continue;
          const ent = g.p.entrada ?? 0.25, sai = g.p.saida ?? 0.3;
          let w = 1;
          if (t < g.t0 + ent) w = smooth((t - g.t0) / ent);
          if (t > g.t1) w = 1 - smooth((t - g.t1) / sai);
          ang = { o: lerp(ang.o, alvo.o, w), c: lerp(ang.c, alvo.c, w) };
        }
        const sx = vista === 'frente' ? (l === 'e' ? -1 : 1) : dir;
        const o = vista === 'perfil' ? ang.o + inc : ang.o;
        const c = vista === 'perfil' ? clamp(ang.c, -5, 150) : ang.c;
        const cot = add(ombros[l], vec(o, M.braco * s, sx));
        const mao = add(cot, vec(o + c, M.antebraco * s, sx));
        bracos[l] = { o: ombros[l], c: cot, m: mao }; maos[l] = mao;
      });
      // giro do corpo todo (deitado) em torno da raiz
      const giro = P.giro || 0;
      const R = P.R;
      const rot = giro ? (pt => { const c = Math.cos(giro * RAD), sn = Math.sin(giro * RAD), x = pt[0] - R[0], y = pt[1] - R[1]; return [R[0] + x * c - y * sn, R[1] + x * sn + y * c]; }) : (pt => pt);
      const f = pt => { const q = rot(pt); return q[0].toFixed(1) + ' ' + q[1].toFixed(1); };
      const legPath = L => `M${f(L.q)} L${f(L.j)} L${f(L.tz)} M${f(L.calc)} L${f(L.ponta)}`;
      const armPath = B => `M${f(B.o)} L${f(B.c)} L${f(B.m)}`;
      // quem fica na frente: no perfil, o lado "perto" é o esquerdo do corpo quando dir=1? escolhemos fixo: perna 0 / braço 'e' perto
      const perto = vista === 'frente' ? { perna: 1, braco: 'd' } : { perna: 0, braco: dir > 0 ? 'e' : 'd' };
      const longe = { perna: 1 - perto.perna, braco: perto.braco === 'e' ? 'd' : 'e' };
      if (vista === 'frente') {
        // de frente as duas pernas e braços aparecem iguais
        this.el.pernaLonge.setAttribute('stroke', this.cor); this.el.bracoLonge.setAttribute('stroke', this.cor); this.el.maoLonge.setAttribute('fill', this.cor);
      } else {
        this.el.pernaLonge.setAttribute('stroke', this.corLonge); this.el.bracoLonge.setAttribute('stroke', this.corLonge); this.el.maoLonge.setAttribute('fill', this.corLonge);
      }
      this.el.pernaLonge.setAttribute('d', legPath(pernas[longe.perna]));
      this.el.pernaPerto.setAttribute('d', legPath(pernas[perto.perna]));
      this.el.bracoLonge.setAttribute('d', armPath(bracos[longe.braco]));
      this.el.bracoPerto.setAttribute('d', armPath(bracos[perto.braco]));
      const mL = rot(maos[longe.braco]), mP = rot(maos[perto.braco]);
      this.el.maoLonge.setAttribute('cx', mL[0]); this.el.maoLonge.setAttribute('cy', mL[1]);
      this.el.maoPerto.setAttribute('cx', mP[0]); this.el.maoPerto.setAttribute('cy', mP[1]);
      this.el.tronco.setAttribute('d', `M${f(H)} L${f(pescoco)}`);
      // roupa (túnica): trapézio do ombro até um pouco abaixo do quadril
      if (this.el.roupa) {
        const up = [Math.sin(inc * RAD) * (vista === 'perfil' ? dir : 0), -Math.cos(inc * RAD)];
        const lat = [-up[1], up[0]];
        const wO = (vista === 'frente' ? 34 : 20) * s, wB = (vista === 'frente' ? 58 : 44) * s, desce = 46 * s;
        const o0 = add(top, [lat[0] * -wO, lat[1] * -wO]), o1 = add(top, [lat[0] * wO, lat[1] * wO]);
        const bc = add(H, [-up[0] * desce, -up[1] * desce]);
        // no perfil/sentado a barra segue a coxa da frente
        const b0 = add(bc, [lat[0] * -wB, lat[1] * -wB]), b1 = add(bc, [lat[0] * wB, lat[1] * wB]);
        this.el.roupa.setAttribute('d', `M${f(o0)} L${f(o1)} L${f(b1)} L${f(b0)} Z`);
        const c0 = add(H, [up[0] * 60 * s + lat[0] * -wB * 0.82, up[1] * 60 * s + lat[1] * -wB * 0.82]);
        const c1 = add(H, [up[0] * 60 * s + lat[0] * wB * 0.82, up[1] * 60 * s + lat[1] * wB * 0.82]);
        this.el.cinto.setAttribute('d', `M${f(c0)} L${f(c1)}`);
      }
      this._maos = { e: rot(maos.e), d: rot(maos.d) };
      // cabeça e rosto
      const C = rot(cab);
      this.el.cranio.setAttribute('cx', C[0]); this.el.cranio.setAttribute('cy', C[1]);
      this.desenharRosto(t, C, vistaCab, P, giro);
    }

    desenharRosto(t, C, vista, P, giro) {
      const s = this.s, dir = P.dir;
      const ex = this.acaoEm(this.expr, t).atual;
      const nome = ex && t <= ex.t1 ? ex.nome : 'normal';
      const sujo = this.sujo.some(q => t >= q.t0 && t <= q.t1);
      this.el.manchas.forEach(m => { m.style.display = sujo ? '' : 'none'; m.setAttribute('cx', C[0] + m.dataset.x * s * (vista === 'frente' ? 1 : dir)); m.setAttribute('cy', C[1] + m.dataset.y * s); });
      const pisca = this.piscadas.some(p => t >= p && t < p + 0.12) || nome === 'dormindo';
      const k = vista === 'frente' ? 1 : 0;
      const pos = vista === 'frente'
        ? { olhos: [[-22, -16], [22, -16]], boca: [0, 26], bochechas: [[-40, 12], [40, 12]], sob: [[-22, -36], [22, -36]] }
        : { olhos: [[dir * 26, -16], [dir * 26, -16]], boca: [dir * 40, 26], bochechas: [[dir * 22, 12], [dir * 22, 12]], sob: [[dir * 26, -36], [dir * 26, -36]] };
      const ry = nome === 'susto' ? 15 : nome === 'feliz' ? 6 : 11;
      this.el.olhos.forEach((o, i) => {
        o.setAttribute('cx', C[0] + pos.olhos[i][0] * s); o.setAttribute('cy', C[1] + pos.olhos[i][1] * s);
        o.setAttribute('ry', (pisca ? 1.5 : ry) * s);
        o.style.display = (k || i === 0) ? '' : 'none';
      });
      this.el.bochechas.forEach((b, i) => {
        b.setAttribute('cx', C[0] + pos.bochechas[i][0] * s); b.setAttribute('cy', C[1] + pos.bochechas[i][1] * s);
        b.setAttribute('fill', nome === 'nojo' ? '#6DBE45' : this.bochecha);
        b.setAttribute('opacity', nome === 'nojo' ? 0.85 : 0.45);
        b.style.display = (k || i === 0) ? '' : 'none';
      });
      this.el.sobrancelhas.forEach((sb, i) => {
        const [bx, by] = pos.sob[i];
        const x = C[0] + bx * s, y = C[1] + by * s;
        const lado = vista === 'frente' ? (i === 0 ? -1 : 1) : dir;
        let dy = 0, ang = 0;
        if (nome === 'susto') dy = -10; if (nome === 'nojo' || nome === 'bravo') ang = 14; if (nome === 'triste') ang = -14;
        if (nome === 'pensando' && i === 0) dy = -8;
        const a = ang * RAD * lado;
        const w = 13 * s, yy = y + dy * s;
        sb.setAttribute('d', `M${x - w} ${yy - Math.tan(-a) * w * -1} Q${x} ${yy - 7 * s} ${x + w} ${yy + Math.tan(-a) * w * -1}`);
        sb.style.display = (k || i === 0) ? '' : 'none';
      });
      // boca: lipsync quando falando; senão expressão
      let forma = this.boca ? this.boca(t) : 'smile';
      if (forma === 'smile' && nome === 'nojo') forma = 'nojo';
      if (forma === 'smile' && nome === 'susto') forma = '4';
      if (forma === 'smile' && (nome === 'triste' || nome === 'pensando')) forma = '0';
      const bx = C[0] + pos.boca[0] * s, by = C[1] + pos.boca[1] * s, w = (vista === 'frente' ? 18 : 13) * s;
      const B = this.el.boca;
      const aberto = { '1': 4, '2': 9, '3': 14, '4': 12 }[forma];
      if (forma === 'smile') { B.setAttribute('d', `M${bx - w} ${by - 4 * s} Q${bx} ${by + 14 * s} ${bx + w} ${by - 4 * s}`); B.setAttribute('fill', 'none'); }
      else if (forma === 'nojo') { B.setAttribute('d', `M${bx - w} ${by + 4 * s} Q${bx - w / 2} ${by - 6 * s} ${bx} ${by + 2 * s} Q${bx + w / 2} ${by + 8 * s} ${bx + w} ${by - 2 * s}`); B.setAttribute('fill', 'none'); }
      else if (forma === '0' || aberto == null) { B.setAttribute('d', `M${bx - w * 0.8} ${by} L${bx + w * 0.8} ${by}`); B.setAttribute('fill', 'none'); }
      else {
        const rx = (forma === '4' ? w * 0.55 : w * 0.8), ryb = aberto * s;
        B.setAttribute('d', `M${bx - rx} ${by} A${rx} ${ryb} 0 1 0 ${bx + rx} ${by} A${rx} ${ryb} 0 1 0 ${bx - rx} ${by} Z`);
        B.setAttribute('fill', this.tinta);
      }
    }
  }

  function misturar(A, B, u) {
    const L = (a, b) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
    return {
      ...B,
      R: L(A.R, B.R), quadril: L(A.quadril, B.quadril), inclina: lerp(A.inclina, B.inclina, u), giro: lerp(A.giro || 0, B.giro || 0, u),
      pes: B.pes.map((f, i) => ({ ...f, tz: L(A.pes[i].tz, f.tz), inc: lerp(A.pes[i].inc, f.inc, u) })),
      bracos: { e: { o: lerp(A.bracos.e.o, B.bracos.e.o, u), c: lerp(A.bracos.e.c, B.bracos.e.c, u) }, d: { o: lerp(A.bracos.d.o, B.bracos.d.o, u), c: lerp(A.bracos.d.c, B.bracos.d.c, u) } }
    };
  }

  // Chão em degraus: escada(x0, y0, largura, altura, n, sobe=+1 para direita)
  Boneco.escada = (x0, y0, larg, alt, n) => x => {
    const k = clamp(Math.floor((x - x0) / larg), 0, n - 1);
    return y0 - k * alt;
  };
  Boneco.medidas = M; Boneco.gait = GAIT; Boneco.ik2 = ik2;
  global.Boneco = Boneco;
})(window);
