/*
  animal.js — animais quadrúpedes 2D em SVG com movimento de verdade (skill "animacao-animal").
  Mesmo estilo dos bonecos (contorno pelo filtro #outline, cores vivas, luz de um lado).

  const a = new Animal(svgGrupo, { especie: 'leao', escala: 0.6, seed: 3 });
  a.base(0, 4, 'parado', { x: 300, y: 1700, dir: 1 });              // respira, mexe o rabo, troca o peso
  a.base(4, 8, 'andar', { de: [300, 1700], ate: [800, 1700] });     // passo (4 tempos, um pé de cada vez)
  a.base(8, 9, 'trotar' | 'correr' | 'sentar' | 'deitado' | 'pular', {...});
  a.cabeca(2, 3.5, { rugir: true });                                // abre a boca, cabeça avança, juba balança
  a.cabeca(5, 6, { olhar: [dx, dy], baixar: 10 });                  // olhar / farejar
  a.desenhar(t);                                                    // chame a cada quadro (ex.: dentro de __seek)

  Anatomia (skill creature-artist): o "joelho" da frente é o PULSO e dobra para trás; o cotovelo
  aponta para trás; o joelho de trás (soldra) dobra para a frente e o jarrete para trás.
  Andar = sequência lateral (TE, DE, TD, DD); trote = pares diagonais; galope = com fase no ar.
  Vida (skill naturalistic-motion): nunca parado de verdade — respiração, rabo e juba com atraso
  (follow-through), cabeça que balança com o passo, assimetria entre lados.
*/
(function (global) {
  const NS = 'http://www.w3.org/2000/svg';
  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const suave = u => u * u * (3 - 2 * u);
  const f = v => Math.round(v * 10) / 10;
  const P = (p) => `${f(p[0])} ${f(p[1])}`;
  // IK de 2 ossos: escolhe a dobra para a frente (+1) ou para trás (-1) em relação à direção do animal
  function ik2(a, alvo, l1, l2, lado, dir) {
    let dx = alvo[0] - a[0], dy = alvo[1] - a[1]; let d = Math.hypot(dx, dy);
    const dm = Math.min(d, (l1 + l2) * 0.999); if (d < 1e-6) d = 1e-6;
    const ux = dx / d, uy = dy / d;
    const cosA = clamp((l1 * l1 + dm * dm - l2 * l2) / (2 * l1 * dm), -1, 1), A = Math.acos(cosA);
    const c1 = [a[0] + l1 * (ux * Math.cos(A) - uy * Math.sin(A)), a[1] + l1 * (ux * Math.sin(A) + uy * Math.cos(A))];
    const c2 = [a[0] + l1 * (ux * Math.cos(-A) - uy * Math.sin(-A)), a[1] + l1 * (ux * Math.sin(-A) + uy * Math.cos(-A))];
    return (c1[0] - c2[0]) * dir * lado > 0 ? c1 : c2;
  }
  function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------- espécies (unidades com escala 1; o leão tem ~1,2 m de altura na cernelha) ----------
  const ESPECIES = {
    leao:     { cor: '#D9A048', longe: '#B4802E', barriga: '#EBC27A', comp: 300, ombro: 230, quadril: 235, frente: [118, 112], tras: [115, 92, 58], peito: [92, 86], anca: [84, 80], pescoco: [70, -38], cabeca: 56, focinho: [46, 30], orelha: 'redonda', cauda: { n: 9, seg: 25, w: 10, tufo: '#6E3418', sobe: 0.25 }, juba: '#8A4520', jubaLonge: '#6E3418', passo: 210, pata: 22 },
    urso:     { cor: '#6E4A2E', longe: '#553822', barriga: '#8A6040', comp: 290, ombro: 215, quadril: 200, frente: [104, 102], tras: [100, 84, 52], peito: [100, 92], anca: [92, 88], pescoco: [60, -26], cabeca: 54, focinho: [46, 28], orelha: 'redonda', corcova: true, focinhoCor: '#C9A882', cauda: { n: 2, seg: 16, w: 14, sobe: 0.3 }, passo: 180, pata: 28, garras: true },
    cachorro: { cor: '#C98A4A', longe: '#A86E36', barriga: '#E8C08A', comp: 220, ombro: 175, quadril: 175, frente: [88, 84], tras: [86, 70, 44], peito: [66, 62], anca: [58, 56], pescoco: [56, -46], cabeca: 44, focinho: [40, 22], orelha: 'caida', cauda: { n: 6, seg: 20, w: 8, sobe: 1.0 }, passo: 160, pata: 16, focinhoCor: '#E8C08A' },
    gato:     { cor: '#8A8A92', longe: '#6E6E76', barriga: '#C9C9CF', comp: 170, ombro: 120, quadril: 125, frente: [62, 60], tras: [62, 50, 34], peito: [46, 44], anca: [42, 42], pescoco: [40, -36], cabeca: 34, focinho: [18, 13], orelha: 'pontuda', cauda: { n: 10, seg: 18, w: 6, sobe: 0.8 }, passo: 110, pata: 11, listras: true },
    cavalo:   { cor: '#8A5A3A', longe: '#6E4428', barriga: '#A87850', comp: 330, ombro: 330, quadril: 325, frente: [165, 160], tras: [150, 130, 75], peito: [92, 84], anca: [90, 84], pescoco: [120, -110], cabeca: 44, focinho: [74, 30], orelha: 'pontuda', cauda: { n: 7, seg: 24, w: 12, crina: true, sobe: -0.6 }, crina: '#2A1A12', passo: 260, pata: 18, casco: '#2A2A30' }
  };

  class Animal {
    constructor(parent, opts = {}) {
      this.E = { ...(ESPECIES[opts.especie] || ESPECIES.leao), ...(opts.cores || {}) };
      this.especie = opts.especie || 'leao';
      this.s = opts.escala ?? 1;
      this.acoes = []; this.cabecas = [];
      const rnd = mulberry32(opts.seed ?? 5);
      this.piscadas = []; for (let t = 0.6 + rnd() * 2; t < 3600; t += 2.5 + rnd() * 3) this.piscadas.push(t);
      this.fase0 = rnd();
      this.g = document.createElementNS(NS, 'g'); parent.appendChild(this.g);
      this.corpo = document.createElementNS(NS, 'g'); this.corpo.setAttribute('filter', 'url(#outline)'); this.g.appendChild(this.corpo);
      this.det = document.createElementNS(NS, 'g'); this.g.appendChild(this.det);
    }
    base(t0, t1, tipo, p = {}) { this.acoes.push({ t0, t1, tipo, p }); this.acoes.sort((a, b) => a.t0 - b.t0); return this; }
    cabeca(t0, t1, p) { this.cabecas.push({ t0, t1, p }); return this; }

    // ---------- pose do corpo num instante (sem transição) ----------
    poseDe(a, t) {
      const E = this.E, s = this.s, p = a.p;
      const dur = Math.max(0.001, a.t1 - a.t0), u = clamp((t - a.t0) / dur, 0, 1);
      let x, y, dir = p.dir ?? 1, mov = 0, tipo = a.tipo;
      if (p.de) { x = lerp(p.de[0], p.ate[0], u); y = lerp(p.de[1], p.ate[1], u); dir = p.dir ?? Math.sign((p.ate[0] - p.de[0]) || 1); mov = Math.abs(p.ate[0] - p.de[0]) * u; }
      else { x = p.x ?? 0; y = p.y ?? 0; }
      const G = { andar: { duty: 0.62, off: [0, 0.5, 0.25, 0.75], bob: 5, alt: 26 }, trotar: { duty: 0.5, off: [0, 0.5, 0.5, 0], bob: 8, alt: 40 }, correr: { duty: 0.36, off: [0, 0.08, 0.5, 0.6], bob: 22, alt: 60 } }[tipo];
      // pés (ordem: tras-perto, tras-longe, frente-perto, frente-longe) relativos ao centro do corpo
      const meio = E.comp / 2;
      const base = [[-meio + 6, 0], [-meio + 22, 0], [meio - 6, 0], [meio + 10, 0]].map(([fx, fy]) => [fx * s, fy]);
      const pose = { x, y, dir, tipo, inclina: 0, sobe: 0, pes: base.map(b => [b[0], 0]), fase: 0, corre: 0, abaixa: 0, cauda: 0.3, respira: Math.sin(t * 2 * Math.PI / 3.2) };
      if (G) {
        const passo = (p.passo ?? E.passo) * s * (tipo === 'correr' ? 1.9 : tipo === 'trotar' ? 1.25 : 1);
        const ciclo = passo / G.duty;
        const fase = ((mov / ciclo) + this.fase0) % 1;
        pose.fase = fase; pose.corre = tipo === 'correr' ? 1 : tipo === 'trotar' ? 0.5 : 0.2;
        pose.pes = base.map((b, i) => {
          const ph = (fase + G.off[i] + (i % 2 ? 0.02 : 0)) % 1;
          let rx, ry = 0;
          if (ph < G.duty) { const k = ph / G.duty; rx = b[0] + passo * (0.5 - k); }
          else { const k = (ph - G.duty) / (1 - G.duty); rx = b[0] + passo * (-0.5 + suave(k)); ry = -G.alt * s * Math.sin(Math.PI * k); }
          return [rx, ry];
        });
        pose.sobe = -G.bob * s * Math.abs(Math.sin(2 * Math.PI * fase)) * (tipo === 'andar' ? 0.5 : 1);
        if (tipo === 'correr') { pose.inclina = Math.sin(2 * Math.PI * fase) * 6; pose.estica = Math.sin(2 * Math.PI * fase); }
        pose.cauda = tipo === 'correr' ? 0.9 : 0.5;
      } else if (tipo === 'sentar') {
        pose.inclina = -32; pose.sentado = 1;
      } else if (tipo === 'deitado') {
        pose.deitado = 1; pose.cauda = 0.15;
      } else if (tipo === 'pular') {
        // agacha (antecipação) → salto em arco com as patas da frente esticadas → aterrissa
        const alvoX = p.ate ? p.ate[0] : x;
        const k = u;
        if (k < 0.25) { pose.abaixa = suave(k / 0.25) * 50 * s; pose.inclina = 4 * suave(k / 0.25); pose.x = p.de ? p.de[0] : x; }
        else if (k < 0.85) { const v = (k - 0.25) / 0.6; pose.x = lerp(p.de ? p.de[0] : x, alvoX, suave(v)); pose.sobe = -Math.sin(Math.PI * v) * (p.altura ?? 160) * s; pose.inclina = lerp(-14, 12, v); pose.voo = 1; }
        else { const v = (k - 0.85) / 0.15; pose.x = alvoX; pose.abaixa = (1 - v) * 40 * s; }
      } else {
        // parado: troca o peso devagar
        pose.peso = Math.sin(t * 2 * Math.PI / 5.5) * 3 * s;
      }
      return pose;
    }
    pose(t) {
      const lista = this.acoes; if (!lista.length) return null;
      let i = lista.findIndex(a => t >= a.t0 && t < a.t1); if (i < 0) i = t < lista[0].t0 ? 0 : lista.length - 1;
      const a = lista[i], P1 = this.poseDe(a, t), trans = a.p.transicao ?? 0.3;
      if (i > 0 && t - a.t0 < trans) {
        const P0 = this.poseDe(lista[i - 1], a.t0), u = suave((t - a.t0) / trans);
        const mix = (k) => lerp(P0[k] ?? 0, P1[k] ?? 0, u);
        const r = { ...P1 };
        ['x', 'y', 'inclina', 'sobe', 'abaixa', 'sentado', 'deitado', 'cauda'].forEach(k => { r[k] = mix(k); });
        r.pes = P1.pes.map((pp, j) => [lerp(P0.pes[j][0], pp[0], u), lerp(P0.pes[j][1], pp[1], u)]);
        return r;
      }
      return P1;
    }
    cabecaEm(t) {
      let r = { olhar: [0, 0], baixar: 0, rugir: 0 };
      for (const c of this.cabecas) {
        if (t < c.t0 - 0.25 || t > c.t1 + 0.35) continue;
        const ent = clamp((t - c.t0 + 0.25) / 0.25, 0, 1), sai = clamp((c.t1 + 0.35 - t) / 0.35, 0, 1), w = suave(Math.min(ent, sai));
        if (c.p.olhar) r.olhar = [lerp(r.olhar[0], c.p.olhar[0], w), lerp(r.olhar[1], c.p.olhar[1], w)];
        if (c.p.baixar != null) r.baixar = lerp(r.baixar, c.p.baixar, w);
        if (c.p.rugir) { const k = clamp((t - c.t0) / Math.max(0.2, c.t1 - c.t0), 0, 1); r.rugir = Math.max(r.rugir, w * (0.75 + 0.25 * Math.sin(k * Math.PI * 6))); r.rugindo = w; }
      }
      return r;
    }

    // ---------- desenho ----------
    desenhar(t) {
      const Q = this.pose(t); if (!Q) return;
      const E = this.E, s = this.s, dir = Q.dir, X = v => Q.x + v * dir;   // coordenada local → mundo (local +x = para a frente)
      const C = this.cabecaEm(t);
      const chao = Q.y;
      const respira = (Q.respira || 0) * 2.5 * s;
      // espinha: anca (H) e ombro (S)
      let hY = chao - E.quadril * s - (Q.sobe || 0) * -1, sY = chao - E.ombro * s;
      hY = chao - E.quadril * s + (Q.sobe || 0) + (Q.abaixa || 0) * 0.9; sY = chao - E.ombro * s + (Q.sobe || 0) + (Q.abaixa || 0);
      const meio = E.comp / 2 * s;
      let H = [-meio, hY], S = [meio, sY];
      if (Q.sentado) { H = [lerp(-meio, -meio + 20 * s, Q.sentado), lerp(hY, chao - E.anca[1] * s * 0.9, Q.sentado)]; S = [lerp(meio, meio - 40 * s, Q.sentado), lerp(sY, sY - 40 * s, Q.sentado)]; }
      if (Q.deitado) { H = [H[0], lerp(H[1], chao - E.anca[1] * s * 0.95, Q.deitado)]; S = [S[0], lerp(S[1], chao - E.peito[1] * s * 0.95, Q.deitado)]; }
      const inc = (Q.inclina || 0) * Math.PI / 180;
      const rot = (p, c) => { const dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(inc) - dy * Math.sin(inc) * -1, c[1] + dx * Math.sin(-inc) + dy * Math.cos(inc)]; };
      const meioC = [(H[0] + S[0]) / 2, (H[1] + S[1]) / 2];
      if (inc) { H = rot(H, meioC); S = rot(S, meioC); }
      if (Q.peso) { H[1] += Q.peso * 0.3; S[1] -= Q.peso * 0.3; }
      const W = p => [X(p[0]), p[1]];   // local → mundo
      // pés no mundo
      const pes = Q.pes.map(([px, py]) => [px, chao + py]);
      if (Q.sentado) { pes[0] = [lerp(pes[0][0], -meio + 70 * s, Q.sentado), chao]; pes[1] = [lerp(pes[1][0], -meio + 90 * s, Q.sentado), chao]; }
      if (Q.deitado) { pes[2] = [lerp(pes[2][0], meio + 90 * s, Q.deitado), chao]; pes[3] = [lerp(pes[3][0], meio + 110 * s, Q.deitado), chao]; pes[0] = [lerp(pes[0][0], -meio + 60 * s, Q.deitado), chao]; pes[1] = [lerp(pes[1][0], -meio + 80 * s, Q.deitado), chao]; }
      if (Q.voo) { pes[2] = [meio + 120 * s, sY + 40 * s]; pes[3] = [meio + 135 * s, sY + 30 * s]; pes[0] = [-meio - 90 * s, hY + 70 * s]; pes[1] = [-meio - 70 * s, hY + 80 * s]; }
      // pernas: frente (ombro→cotovelo para trás→pata), trás (quadril→soldra para frente→jarrete→pata)
      const [fa, fb] = E.frente.map(v => v * s), [ta, tb, tc] = E.tras.map(v => v * s);
      const perna = (i) => {
        const tras = i < 2, raiz = tras ? [H[0] + (i ? 10 * s : 0), H[1] + 16 * s] : [S[0] + (i === 3 ? 10 * s : 0), S[1] + 22 * s];
        const pe = pes[i];
        if (tras) {
          const levantado = pe[1] < chao - 1;
          const jarrete = [pe[0] - tc * 0.32 + (levantado ? -tc * 0.25 : 0), pe[1] - tc * 0.94 + (levantado ? tc * 0.2 : 0)];
          const joelho = ik2(raiz, jarrete, ta, tb, 1, 1);
          return { pts: [raiz, joelho, jarrete, pe], larg: [E.anca[0] * 0.55 * s, 20 * s, 14 * s] };
        }
        const levantado = pe[1] < chao - 1;
        const pulso = [pe[0] - (levantado ? 22 * s : 4 * s), pe[1] - E.pata * s * 1.3 + (levantado ? 6 * s : 0)];
        const cotovelo = ik2(raiz, pulso, fa, fb, -1, 1);
        return { pts: [raiz, cotovelo, pulso, pe], larg: [E.peito[0] * 0.42 * s, 18 * s, 14 * s] };
      };
      const L = [0, 1, 2, 3].map(perna);
      const traco = (pts, w, cor) => pts.slice(0, -1).map((p, k) => `<path d="M${P(W(p))} L${P(W(pts[k + 1]))}" stroke="${cor}" stroke-width="${f(w[Math.min(k, w.length - 1)])}" stroke-linecap="round"/>`).join('');
      const pata = (p, cor) => `<ellipse cx="${f(X(p[0] + 8 * s))}" cy="${f(p[1] - E.pata * s * 0.35)}" rx="${f(E.pata * s)}" ry="${f(E.pata * s * 0.55)}" fill="${E.casco || cor}"/>`;
      // cauda: corrente de segmentos com atraso (follow-through)
      let cauda = '', ponta;
      { let p = [H[0] - E.anca[0] * 0.6 * s, H[1] - E.anca[1] * 0.3 * s], ang = Math.PI + (E.cauda.sobe || 0) * -0.6 - (Q.sentado ? 0.6 : 0);
        const pts = [p];
        for (let k = 0; k < E.cauda.n; k++) {
          const onda = Math.sin(t * (Q.corre ? 9 : 2.4) - k * 0.55) * (0.12 + 0.2 * (Q.cauda || 0.3)) * (k / E.cauda.n + 0.3);
          ang += (E.cauda.sobe < 0 ? 0.1 : -0.12 * (E.cauda.sobe || 0.3)) + onda + (Q.deitado ? 0.05 : 0);
          p = [p[0] + Math.cos(ang) * E.cauda.seg * s, p[1] - Math.sin(ang) * E.cauda.seg * s * -1]; pts.push(p);
        }
        ponta = p;
        const d = pts.map((q, k) => (k ? 'L' : 'M') + P(W(q))).join(' ');
        cauda = E.cauda.crina ? `<path d="${d}" stroke="${E.crina}" stroke-width="${f(E.cauda.w * 2.6 * s)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : `<path d="${d}" stroke="${E.cor}" stroke-width="${f(E.cauda.w * s)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        if (E.cauda.tufo) cauda += `<ellipse cx="${f(X(p[0]))}" cy="${f(p[1])}" rx="${f(16 * s)}" ry="${f(12 * s)}" fill="${E.cauda.tufo}"/>`;
      }
      // pescoço e cabeça
      const pesc = [S[0] + E.pescoco[0] * s * 0.35, S[1] - E.peito[1] * 0.35 * s];
      const avanco = C.rugir * 26 * s, baixa = (C.baixar || 0) * s + (Q.tipo === 'andar' ? Math.sin(2 * Math.PI * Q.fase * 2) * 4 * s : 0);
      const Hc = [S[0] + E.pescoco[0] * s + avanco, S[1] + E.pescoco[1] * s - C.rugir * 10 * s + baixa + (Q.deitado ? 30 * s * Q.deitado : 0) - (Q.sentado ? 20 * s : 0)];
      const r = E.cabeca * s;
      // ---------- camada com contorno ----------
      let g = '';
      g += traco(L[1].pts, L[1].larg, E.longe) + pata(L[1].pts[3], E.longe);
      g += traco(L[3].pts, L[3].larg, E.longe) + pata(L[3].pts[3], E.longe);
      g += cauda;
      if (E.juba) g += `<ellipse cx="${f(X(Hc[0] - r * 0.4))}" cy="${f(Hc[1] + r * 0.2)}" rx="${f(r * 1.55)}" ry="${f(r * 1.6)}" fill="${E.jubaLonge}"/>`;
      // corpo: peito + anca + ligação + barriga (o filtro junta tudo num só contorno)
      const respP = 1 + 0.02 * (Q.respira || 0);
      g += `<ellipse cx="${f(X(S[0]))}" cy="${f(S[1] + 12 * s)}" rx="${f(E.peito[0] * s)}" ry="${f(E.peito[1] * s * respP)}" fill="${E.cor}" transform="rotate(${f(-(Q.inclina || 0) * dir)} ${f(X(S[0]))} ${f(S[1])})"/>`;
      g += `<ellipse cx="${f(X(H[0]))}" cy="${f(H[1] + 6 * s)}" rx="${f(E.anca[0] * s)}" ry="${f(E.anca[1] * s)}" fill="${E.cor}"/>`;
      const topo = (p, dy) => W([p[0], p[1] + dy]);
      g += `<path d="M${P(topo(H, -E.anca[1] * 0.92 * s))} Q${P(W([(H[0] + S[0]) / 2, (H[1] + S[1]) / 2 - E.peito[1] * 0.95 * s]))} ${P(topo(S, -E.peito[1] * 0.8 * s))} L${P(topo(S, E.peito[1] * 0.75 * s))} Q${P(W([(H[0] + S[0]) / 2, (H[1] + S[1]) / 2 + E.peito[1] * (0.7 + 0.03 * (Q.respira || 0)) * s]))} ${P(topo(H, E.anca[1] * 0.8 * s))}Z" fill="${E.cor}"/>`;
      if (E.corcova) g += `<ellipse cx="${f(X(S[0] - 10 * s))}" cy="${f(S[1] - E.peito[1] * 0.75 * s)}" rx="${f(60 * s)}" ry="${f(34 * s)}" fill="${E.cor}"/>`;
      g += `<path d="M${P(W(pesc))} L${P(W(Hc))}" stroke="${E.cor}" stroke-width="${f(E.peito[1] * (E.pescoco[0] > 100 ? 0.75 : 1.1) * s)}" stroke-linecap="round"/>`;
      if (E.juba) {   // juba em mechas que balançam com atraso
        for (let k = 0; k < 14; k++) { const a = -Math.PI * 0.95 + k * 0.15 * Math.PI, bal = Math.sin(t * 6 - k * 0.7) * (0.06 + 0.25 * C.rugir); const rr = r * (1.45 + 0.1 * Math.sin(k * 1.7));
          g += `<path d="M${P(W(Hc))} L${P(W([Hc[0] - r * 0.35 + Math.cos(a + bal) * rr, Hc[1] + r * 0.15 + Math.sin(a + bal) * rr]))}" stroke="${k % 2 ? E.juba : E.jubaLonge}" stroke-width="${f(r * 0.62)}" stroke-linecap="round"/>`; }
      }
      if (E.crina) g += `<path d="M${P(W([S[0] - 10 * s, S[1] - E.peito[1] * 0.7 * s]))} Q${P(W([(S[0] + Hc[0]) / 2 - 10 * s, (S[1] + Hc[1]) / 2 - 40 * s]))} ${P(W([Hc[0] - r * 0.6, Hc[1] - r * 0.9]))}" stroke="${E.crina}" stroke-width="${f(22 * s)}" fill="none" stroke-linecap="round"/>`;
      // cabeça: crânio, orelhas, focinho, mandíbula (abre ao rugir)
      const ore = E.orelha;
      const oreP = [Hc[0] - r * 0.35, Hc[1] - r * 0.85];
      if (ore === 'redonda') g += `<circle cx="${f(X(oreP[0]))}" cy="${f(oreP[1])}" r="${f(r * 0.32)}" fill="${E.cor}"/>`;
      else if (ore === 'pontuda') g += `<path d="M${P(W([oreP[0] - r * 0.3, oreP[1] + r * 0.25]))} L${P(W([oreP[0] - r * 0.05, oreP[1] - r * 0.55]))} L${P(W([oreP[0] + r * 0.3, oreP[1] + r * 0.2]))}Z" fill="${E.cor}"/>`;
      g += `<circle cx="${f(X(Hc[0]))}" cy="${f(Hc[1])}" r="${f(r)}" fill="${E.cor}"/>`;
      const fz = [Hc[0] + r * 0.75, Hc[1] + r * 0.25], [fw, fh] = E.focinho.map(v => v * s);
      const jaw = C.rugir * 0.65;   // radianos
      const pivo = [Hc[0] + r * 0.2, Hc[1] + r * 0.45];
      const jp = (dx, dy) => { const c = Math.cos(jaw), sn = Math.sin(jaw); return W([pivo[0] + dx * c - dy * sn * -1, pivo[1] + dx * sn + dy * c]); };
      if (jaw > 0.02) g += `<path d="M${P(W(pivo))} L${P(jp(fw * 1.6, -2 * s))} L${P(jp(fw * 1.5, fh * 0.55))} L${P(jp(0, fh * 0.6))}Z" fill="${E.focinhoCor || E.cor}"/>`;
      g += `<ellipse cx="${f(X(fz[0]))}" cy="${f(fz[1] - jaw * 6 * s)}" rx="${f(fw)}" ry="${f(fh)}" fill="${E.focinhoCor || E.cor}"/>`;
      if (ore === 'caida') g += `<path d="M${P(W([oreP[0] - r * 0.1, oreP[1] + r * 0.1]))} Q${P(W([oreP[0] - r * 0.6, oreP[1] + r * 0.5]))} ${P(W([oreP[0] - r * 0.35, oreP[1] + r * 1.15]))} L${P(W([oreP[0] + r * 0.15, oreP[1] + r * 0.45]))}Z" fill="${E.longe}"/>`;
      // perna de perto por cima do corpo
      g += traco(L[0].pts, L[0].larg, E.cor) + pata(L[0].pts[3], E.cor);
      g += traco(L[2].pts, L[2].larg, E.cor) + pata(L[2].pts[3], E.cor);
      this.corpo.innerHTML = g;
      // ---------- detalhes sem contorno (olho, nariz, boca, barriga, listras, garras) ----------
      const T = '#1D1D2B';
      let d = '';
      d += `<path d="M${P(topo(H, E.anca[1] * 0.55 * s))} Q${P(W([(H[0] + S[0]) / 2, (H[1] + S[1]) / 2 + E.peito[1] * 0.6 * s]))} ${P(topo(S, E.peito[1] * 0.55 * s))}" stroke="${E.barriga}" stroke-width="${f(10 * s)}" fill="none" opacity=".7" stroke-linecap="round"/>`;
      d += `<path d="M${P(topo(H, -E.anca[1] * 0.7 * s))} Q${P(W([(H[0] + S[0]) / 2, (H[1] + S[1]) / 2 - E.peito[1] * 0.75 * s]))} ${P(topo(S, -E.peito[1] * 0.6 * s))}" stroke="#FFFFFF" stroke-width="${f(6 * s)}" fill="none" opacity=".25" stroke-linecap="round"/>`;   // luz nas costas
      if (E.listras) for (let k = 0; k < 5; k++) { const u = 0.15 + k * 0.17, px = lerp(H[0], S[0], u), py = lerp(H[1], S[1], u); d += `<path d="M${P(W([px, py - E.peito[1] * 0.8 * s]))} q${f(dir * 6 * s)} ${f(14 * s)} 0 ${f(28 * s)}" stroke="${E.longe}" stroke-width="${f(6 * s)}" fill="none" stroke-linecap="round"/>`; }
      if (ore === 'redonda') d += `<circle cx="${f(X(oreP[0]))}" cy="${f(oreP[1])}" r="${f(r * 0.16)}" fill="${E.longe}"/>`;
      if (ore === 'pontuda') d += `<path d="M${P(W([oreP[0] - r * 0.15, oreP[1] + r * 0.15]))} L${P(W([oreP[0] - r * 0.03, oreP[1] - r * 0.35]))} L${P(W([oreP[0] + r * 0.15, oreP[1] + r * 0.12]))}Z" fill="#E8A0A0"/>`;
      if (jaw > 0.02) {
        d += `<path d="M${P(W([pivo[0] + 4 * s, pivo[1] - 2 * s]))} L${P(W([fz[0] + fw * 0.8, fz[1] + fh * 0.4]))} L${P(jp(fw * 1.45, -1 * s))}Z" fill="#7A1A1A"/>`;
        d += `<path d="M${P(W([fz[0] + fw * 0.7, fz[1] + fh * 0.4]))} l${f(-dir * 4 * s)} ${f(10 * s)} l${f(-dir * 4 * s)} ${f(-10 * s)} M${P(jp(fw * 1.3, -1 * s))} l${f(-dir * 4 * s)} ${f(-10 * s)} l${f(-dir * 4 * s)} ${f(10 * s)}" fill="#FFF" stroke="${T}" stroke-width="${f(1.5 * s)}"/>`;
      }
      d += `<ellipse cx="${f(X(fz[0] + fw * 0.85))}" cy="${f(fz[1] - fh * 0.55 - jaw * 6 * s)}" rx="${f(fw * 0.26)}" ry="${f(fh * 0.24)}" fill="${T}"/>`;   // nariz
      if (jaw < 0.05) d += `<path d="M${P(W([fz[0] + fw * 0.85, fz[1] - fh * 0.3]))} q${f(-dir * 4 * s)} ${f(fh * 0.6)} ${f(-dir * fw * 0.6)} ${f(fh * 0.7)}" stroke="${T}" stroke-width="${f(3 * s)}" fill="none" stroke-linecap="round"/>`;
      const pisca = this.piscadas.some(p => t >= p && t < p + 0.13);
      const olho = [Hc[0] + r * 0.35 + C.olhar[0] * 0.3 * s, Hc[1] - r * 0.22 + C.olhar[1] * 0.3 * s];
      if (pisca || C.rugir > 0.5) d += `<path d="M${P(W([olho[0] - 9 * s, olho[1]]))} q${f(dir * 9 * s)} ${f(5 * s)} ${f(dir * 18 * s)} 0" stroke="${T}" stroke-width="${f(4 * s)}" fill="none" stroke-linecap="round"/>`;
      else d += `<ellipse cx="${f(X(olho[0]))}" cy="${f(olho[1])}" rx="${f(8 * s)}" ry="${f(9 * s)}" fill="#F6E2A0" stroke="${T}" stroke-width="${f(2.5 * s)}"/><circle cx="${f(X(olho[0] + 2 * s))}" cy="${f(olho[1])}" r="${f(4.5 * s)}" fill="${T}"/><circle cx="${f(X(olho[0]))}" cy="${f(olho[1] - 2.5 * s)}" r="${f(1.8 * s)}" fill="#FFF"/>`;
      d += `<path d="M${P(W([olho[0] - 12 * s, olho[1] - 12 * s - C.rugir * 4 * s]))} L${P(W([olho[0] + 10 * s, olho[1] - 10 * s + C.rugir * 3 * s]))}" stroke="${T}" stroke-width="${f(3.5 * s)}" stroke-linecap="round"/>`;   // sobrancelha (bravo ao rugir)
      if (E.garras) [L[0], L[2]].forEach(l => { const pp = l.pts[3]; d += [0, 1, 2].map(k => `<path d="M${f(X(pp[0] + (8 + k * 8) * s))} ${f(pp[1] - 4 * s)} l${f(dir * 5 * s)} ${f(6 * s)}" stroke="#E8E2D0" stroke-width="${f(3 * s)}" stroke-linecap="round"/>`).join(''); });
      this.det.innerHTML = d;
      this._boca = W([fz[0] + fw, fz[1]]);
    }
    boca() { return this._boca || [0, 0]; }
  }
  Animal.ESPECIES = ESPECIES;
  global.Animal = Animal;
})(window);
