/*
  sitio.js — roça do sul de Minas À NOITE, para a série "Apocalipse Zumbi" (skill "cenario-ilustrado").
  Estilo da série: SOMBRIO (verde-musgo, cinza, azul-noite, marrom de terra) e a ÚNICA luz quente é a do lampião,
  da lanterna ou da festa — ela guia o olhar. Cenas cheias de objetos com sentido (skill objetos-de-cena).
  Depende de cenario.js (C.tom, C.rnd, C.pick, C.defs, C.atmosfera).

  const Si = Sitio(Cenario({ seed: 3, luz: -1, hora: 'noite', prefixo: 's3' }));
  s += Si.cozinha({ chao: 1300, lampiao: true, coberta: false, radio: true })   // cozinha do Tião
  s += Si.sitio({ chao: 1250, janelaAcesa: true })      // casa no alto do morro, araucárias, cerca, serra ao fundo
  s += Si.vale({ festa: true })                         // visão do morro: pasto escuro descendo, estrada, casa do seu Zé brilhando
  s += Si.festa({ chao: 1300 })                         // casa do seu Zé de perto: varanda, bandeirinhas, balões, bolo, caixa de som
  s += Si.estrada({ chao: 1200 })                       // estrada de terra ao luar, cerca de arame, neblina baixa
  s += Si.morro({ })                                    // visto de baixo: o morro escuro e uma luzinha lá em cima
  objetos: Si.radio(x, y, k, { ligado }) · Si.lampiao(x, y, k, { aceso }) · Si.lanterna(x, y, k, { acesa, ang }) · Si.caixaSom(x, y, k)
  classes animáveis: .chama (lampião), .notas (música), .estatica (rádio), .neblina, .vagalume, .ponteiro
*/
(function (global) {
  function Sitio(C) {
    const tom = C.tom, rnd = C.rnd, pick = C.pick;
    const L = '#0E0E14', f = v => Math.round(v * 10) / 10, lerp = (a, b, u) => a + (b - a) * u;
    const S = {};
    const uid = p => `${p}${Math.floor(rnd(1e5, 1e6))}`;
    const clip = (x, y, w, h, corpo) => { const id = uid('cs'); return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${corpo}</g>`; };
    const defs = () => `<defs>${C.defs()}</defs>`;
    const acabamento = (grao = 0.28) => C.atmosfera({ grao, vinheta: false });
    const grad = (cores, vert = true) => { const id = uid('g'); return [id, `<defs><linearGradient id="${id}" x1="0" y1="0" x2="${vert ? 0 : 1}" y2="${vert ? 1 : 0}">${cores.map((c, i) => `<stop offset="${(i / (cores.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`]; };
    const brilho = (x, y, r, cor = '#FFC870', op = 0.55) => { const id = uid('b'); return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${cor}" stop-opacity="${op}"/><stop offset=".45" stop-color="${cor}" stop-opacity="${op * 0.35}"/><stop offset="1" stop-color="${cor}" stop-opacity="0"/></radialGradient></defs><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})" style="mix-blend-mode:screen"/>`; };
    const texto = (t, cx, cy, larg, alt, cor = '#E8E2D0') => { const fs = Math.min(alt, larg / Math.max(1, t.length * 0.5)); return `<text x="${f(cx)}" y="${f(cy)}" font-family="'Anton', 'DejaVu Sans Condensed', sans-serif" font-size="${f(fs)}" fill="${cor}" text-anchor="middle" dominant-baseline="central" data-caber="${f(larg)}">${t}</text>`; };
    const tabuas = (x, y, w, h, cor, vertical = true, larg = 70) => { let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${cor}"/>`;
      if (vertical) for (let xx = x; xx < x + w; xx += larg) { s += `<rect x="${f(xx)}" y="${f(y)}" width="${larg - 4}" height="${f(h)}" fill="${tom(cor, rnd(-0.12, 0.06))}"/><path d="M${f(xx + larg - 4)} ${f(y)} V${f(y + h)}" stroke="${tom(cor, -0.45)}" stroke-width="4"/>`; for (let n = 0; n < 2; n++) s += `<ellipse cx="${f(xx + rnd(15, larg - 20))}" cy="${f(y + rnd(20, h - 20))}" rx="5" ry="9" fill="${tom(cor, -0.3)}"/>`; }
      else for (let yy = y; yy < y + h; yy += larg) s += `<rect x="${f(x)}" y="${f(yy)}" width="${f(w)}" height="${larg - 4}" fill="${tom(cor, rnd(-0.12, 0.06))}"/><path d="M${f(x)} ${f(yy + larg - 4)} H${f(x + w)}" stroke="${tom(cor, -0.45)}" stroke-width="4"/>`;
      return s; };
    const estrelas = (x, y, w, h, n = 80) => [...Array(n)].map(() => `<circle cx="${f(x + rnd(0, w))}" cy="${f(y + rnd(0, h))}" r="${f(rnd(0.8, 2.4))}" fill="#DDE6FF" opacity="${f(rnd(0.25, 0.9))}"/>`).join('');
    const neblina = (x, y, w, h, op = 0.18) => `<g class="neblina">${[...Array(5)].map((_, i) => `<ellipse cx="${f(x + rnd(0, w))}" cy="${f(y + rnd(0, h))}" rx="${f(rnd(220, 420))}" ry="${f(rnd(26, 60))}" fill="#8A98A8" opacity="${f(op * rnd(0.6, 1.2))}"/>`).join('')}</g>`;
    const araucaria = (x, base, h, cor = '#121A16') => { let s = `<path d="M${f(x - 5)} ${f(base)} L${f(x - 3)} ${f(base - h)} H${f(x + 3)} L${f(x + 5)} ${f(base)}Z" fill="${cor}"/>`;
      for (let k = 0; k < 5; k++) { const yy = base - h * (0.55 + k * 0.1), w = h * (0.32 - k * 0.04); s += `<path d="M${f(x - w)} ${f(yy + 10)} Q${f(x)} ${f(yy - 22)} ${f(x + w)} ${f(yy + 10)} Q${f(x)} ${f(yy - 4)} ${f(x - w)} ${f(yy + 10)}Z" fill="${cor}"/>`; }
      return s; };
    const serra = (x, w, base, alt, cor, op = 1) => { let d = `M${x} ${base}`; for (let k = 0; k <= 10; k++) d += ` L${f(x + w * k / 10)} ${f(base - alt * (0.45 + 0.55 * Math.abs(Math.sin(k * 1.3 + rnd(0, 0.6)))))}`; return `<path d="${d} L${x + w} ${base}Z" fill="${cor}" opacity="${op}"/>`; };

    // ================= OBJETOS =================
    // rádio antigo de madeira (válvula): dial iluminado, alto-falante de tecido, botões, antena
    S.radio = (x, y, k = 1, { ligado = true } = {}) => `<g transform="translate(${f(x)} ${f(y)}) scale(${k})"><ellipse cx="0" cy="4" rx="130" ry="12" fill="#000" opacity=".35"/>
      <path d="M-20 -150 L-70 -260 M20 -150 L40 -280" stroke="#9AA0A8" stroke-width="5" stroke-linecap="round"/>
      <path d="M-120 0 V-120 Q-120 -160 -80 -160 H80 Q120 -160 120 -120 V0Z" fill="#5A3A22" stroke="${L}" stroke-width="6"/><path d="M-110 -10 V-118 Q-110 -150 -78 -150 H-60" stroke="#7A5232" stroke-width="6" fill="none"/>
      <rect x="-96" y="-130" width="110" height="110" rx="10" fill="#C9B48A" stroke="${L}" stroke-width="4"/>${[...Array(6)].map((_, i) => `<path d="M-90 ${-120 + i * 18} H8" stroke="#8A7650" stroke-width="3"/>`).join('')}
      <rect x="26" y="-132" width="80" height="44" rx="6" fill="${ligado ? '#FFD27A' : '#4A4232'}" stroke="${L}" stroke-width="4"/>${ligado ? `<rect x="30" y="-128" width="72" height="36" fill="#FFF2B0" opacity=".5" class="estatica"/>` : ''}<path d="M40 -110 H92 M66 -126 V-96" stroke="#5A3A1A" stroke-width="2"/><path d="M58 -124 L62 -98" stroke="#D7263D" stroke-width="3"/>
      <circle cx="46" cy="-50" r="18" fill="#2A1E14" stroke="${L}" stroke-width="3"/><circle cx="90" cy="-50" r="18" fill="#2A1E14" stroke="${L}" stroke-width="3"/><path d="M46 -64 v10 M90 -64 v10" stroke="#C9B48A" stroke-width="3"/>
      ${ligado ? brilho(66, -110, 160, '#FFD27A', 0.45) : ''}</g>`;
    // lampião de querosene: base de lata, vidro, chama (classe "chama"), alça
    S.lampiao = (x, y, k = 1, { aceso = true } = {}) => `<g transform="translate(${f(x)} ${f(y)}) scale(${k})"><ellipse cx="0" cy="3" rx="60" ry="8" fill="#000" opacity=".35"/>
      ${aceso ? brilho(0, -90, 420, '#FFB85A', 0.6) : ''}
      <path d="M-46 0 Q-50 -40 -20 -46 H20 Q50 -40 46 0Z" fill="#7A6A4A" stroke="${L}" stroke-width="4"/><rect x="-30" y="-56" width="60" height="12" fill="#5A4A32" stroke="${L}" stroke-width="3"/>
      <path d="M-28 -56 Q-40 -110 -18 -150 H18 Q40 -110 28 -56Z" fill="${aceso ? '#FFE6A8' : '#9AA4AA'}" fill-opacity="${aceso ? 0.55 : 0.35}" stroke="${L}" stroke-width="4"/>
      ${aceso ? `<g class="chama" data-cx="0" data-cy="-70"><path d="M0 -66 Q-12 -84 0 -112 Q12 -84 0 -66Z" fill="#FF9A2A"/><path d="M0 -70 Q-5 -82 0 -96 Q5 -82 0 -70Z" fill="#FFF2B0"/></g>` : `<path d="M-2 -70 q-6 -20 4 -40 q-10 18 -4 40" stroke="#8A8A90" stroke-width="3" fill="none" opacity=".6"/>`}
      <rect x="-22" y="-162" width="44" height="14" rx="4" fill="#5A4A32" stroke="${L}" stroke-width="3"/><path d="M-30 -158 Q0 -220 30 -158" stroke="#3A3A3A" stroke-width="5" fill="none"/></g>`;
    // lanterna de mão (de pilha): corpo, lente; o facho de luz é desenhado à parte (S.facho)
    S.lanterna = (x, y, k = 1, { acesa = true, ang = 0 } = {}) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${ang}) scale(${k})"><rect x="-10" y="-14" width="70" height="28" rx="8" fill="#2A3A2A" stroke="${L}" stroke-width="4"/><path d="M60 -20 L84 -26 V26 L60 20Z" fill="#4A5A4A" stroke="${L}" stroke-width="4"/><ellipse cx="84" cy="0" rx="6" ry="26" fill="${acesa ? '#FFF6D0' : '#8A9AA0'}" stroke="${L}" stroke-width="3"/><rect x="18" y="-20" width="14" height="8" rx="2" fill="#D7263D" stroke="${L}" stroke-width="2"/>${[0, 1, 2].map(i => `<path d="M${2 + i * 12} -10 v20" stroke="#1A2A1A" stroke-width="3"/>`).join('')}</g>`;
    // facho de luz em cone (da lanterna): origem, ângulo (graus), comprimento, abertura
    S.facho = (x, y, ang, comp = 900, abre = 22, op = 0.42) => { const id = uid('fc'); const a1 = (ang - abre) * Math.PI / 180, a2 = (ang + abre) * Math.PI / 180;
      return `<defs><radialGradient id="${id}" cx="${f(x)}" cy="${f(y)}" r="${f(comp)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF4C8" stop-opacity="${op}"/><stop offset=".6" stop-color="#FFE8A0" stop-opacity="${op * 0.35}"/><stop offset="1" stop-color="#FFE8A0" stop-opacity="0"/></radialGradient></defs><path d="M${f(x)} ${f(y)} L${f(x + Math.cos(a1) * comp)} ${f(y + Math.sin(a1) * comp)} A${comp} ${comp} 0 0 1 ${f(x + Math.cos(a2) * comp)} ${f(y + Math.sin(a2) * comp)}Z" fill="url(#${id})" style="mix-blend-mode:screen"/>`; };
    // caixa de som de festa (grande, com luzes)
    S.caixaSom = (x, y, k = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${k})"><ellipse cx="0" cy="4" rx="90" ry="12" fill="#000" opacity=".4"/><rect x="-80" y="-260" width="160" height="260" rx="10" fill="#1E1E24" stroke="${L}" stroke-width="5"/><circle cx="0" cy="-80" r="56" fill="#2A2A32" stroke="#5A5A66" stroke-width="6"/><circle cx="0" cy="-80" r="20" fill="#3A3A44"/><circle cx="0" cy="-200" r="32" fill="#2A2A32" stroke="#5A5A66" stroke-width="5"/>${[...Array(5)].map((_, i) => `<circle cx="${-56 + i * 28}" cy="-150" r="5" fill="${['#FF4A6A', '#4AE0FF', '#FFE24A', '#6AFF7A', '#C84AFF'][i]}"/>`).join('')}</g>`;
    const bandeirinhas = (x0, y0, x1, y1, n = 14, flex = 40) => { let s = `<path d="M${f(x0)} ${f(y0)} Q${f((x0 + x1) / 2)} ${f((y0 + y1) / 2 + flex)} ${f(x1)} ${f(y1)}" stroke="#2A2A2A" stroke-width="2" fill="none"/>`;
      for (let i = 1; i < n; i++) { const u = i / n, px = lerp(x0, x1, u), py = lerp(y0, y1, u) + flex * 4 * u * (1 - u); s += `<path d="M${f(px - 12)} ${f(py)} H${f(px + 12)} L${f(px)} ${f(py + 26)}Z" fill="${['#E84A5A', '#F2C23A', '#4AA0E8', '#5AC86A', '#E87A2A'][i % 5]}" opacity=".95"/>`; } return s; };
    const lampadas = (x0, y0, x1, y1, n = 12, flex = 30) => { let s = `<path d="M${f(x0)} ${f(y0)} Q${f((x0 + x1) / 2)} ${f((y0 + y1) / 2 + flex)} ${f(x1)} ${f(y1)}" stroke="#2A2A2A" stroke-width="2" fill="none"/>`;
      for (let i = 1; i < n; i++) { const u = i / n, px = lerp(x0, x1, u), py = lerp(y0, y1, u) + flex * 4 * u * (1 - u), c = ['#FFE08A', '#FF9AB0', '#9AE0FF'][i % 3]; s += `<g class="vagalume" data-fase="${(i * 0.6).toFixed(1)}"><circle cx="${f(px)}" cy="${f(py + 8)}" r="18" fill="${c}" opacity=".35"/><circle cx="${f(px)}" cy="${f(py + 8)}" r="6" fill="${c}"/></g>`; } return s; };
    // casa de roça em CARTOON CAPRICHADO (volume, textura, luz): fachada + parede lateral em fuga, telhado de telha colonial
    // com espessura e beiral, reboco caiado gasto com tijolo aparecendo, barra pintada, janelas de madeira com folhas abertas,
    // porta de tábua, degrau, varanda com esteios, chaminé de tijolo; à noite: luar frio na borda do telhado e luz quente
    // vazando das janelas para o chão. Detalhe diminui sozinho quando a casa é pequena (longe).
    const casaRoca = (x, base, w, h, { acesa = false, festa = false, cor = '#7A6E5A', telha = '#5A2E22', barra = '#3E5A6E', varanda = false, chamine = true, lado = 0.22, fumaca = acesa, portaAberta = false } = {}) => {
      const k = w / 500, det = w >= 220, sw = Math.max(1.5, 4 * k);
      const lw = w * lado, topo = base - h, cume = topo - h * 0.42;
      const jl = acesa ? (festa ? '#FFE6A0' : '#FFC870') : '#10141C';
      let s = '';
      // sombra de contato no chão (AO)
      s += `<ellipse cx="${f(x + (w + lw) / 2)}" cy="${f(base + 6 * k)}" rx="${f((w + lw) * 0.62)}" ry="${f(26 * k)}" fill="#000" opacity=".45"/>`;
      // parede lateral em perspectiva (mais escura), com empena
      const sx0 = x + w, sx1 = x + w + lw, rec = h * 0.12;
      s += `<path d="M${f(sx0)} ${f(topo)} L${f(sx1)} ${f(topo - rec)} L${f(sx1)} ${f(base - rec * 0.6)} L${f(sx0)} ${f(base)}Z" fill="${tom(cor, -0.42)}" stroke="${L}" stroke-width="${f(sw)}"/>`;
      if (det) for (let i = 0; i < 4; i++) s += `<path d="M${f(sx0 + lw * (i + 1) / 5)} ${f(topo - rec * (i + 1) / 5 + 10 * k)} V${f(base - rec * 0.6 * (i + 1) / 5 - 6 * k)}" stroke="${tom(cor, -0.52)}" stroke-width="${f(2 * k)}" opacity=".5"/>`;
      // fachada com reboco caiado: manchas, tijolo aparecendo, rachadura, sujeira subindo, barra pintada
      s += `<rect x="${f(x)}" y="${f(topo)}" width="${f(w)}" height="${f(h)}" fill="${cor}" stroke="${L}" stroke-width="${f(sw)}"/>`;
      s += `<rect x="${f(x)}" y="${f(topo)}" width="${f(w * 0.08)}" height="${f(h)}" fill="${tom(cor, 0.12)}" opacity=".6"/>`;   // canto que pega luz
      if (det) {
        for (let i = 0; i < 8; i++) s += `<ellipse cx="${f(x + rnd(0.05, 0.95) * w)}" cy="${f(topo + rnd(0.1, 0.8) * h)}" rx="${f(rnd(30, 70) * k)}" ry="${f(rnd(14, 34) * k)}" fill="${tom(cor, rnd(-0.14, 0.06))}" opacity=".55"/>`;
        [[0.08, 0.22], [0.78, 0.6]].forEach(([u, v]) => { const bx = x + w * u, by = topo + h * v; s += `<path d="M${f(bx)} ${f(by)} q${f(40 * k)} ${f(-26 * k)} ${f(90 * k)} ${f(-6 * k)} q${f(20 * k)} ${f(34 * k)} ${f(-14 * k)} ${f(56 * k)} q${f(-60 * k)} ${f(10 * k)} ${f(-76 * k)} ${f(-50 * k)}Z" fill="#9A5A3E"/>`; for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) s += `<rect x="${f(bx + (8 + q * 26 + (r % 2) * 12) * k)}" y="${f(by - 10 * k + r * 17 * k)}" width="${f(23 * k)}" height="${f(14 * k)}" fill="#8A4A32" stroke="#5A2E1E" stroke-width="${f(1.5 * k)}"/>`; });
        s += `<path d="M${f(x + w * 0.3)} ${f(topo + 8 * k)} l${f(-10 * k)} ${f(40 * k)} l${f(14 * k)} ${f(30 * k)} l${f(-8 * k)} ${f(46 * k)}" stroke="${tom(cor, -0.4)}" stroke-width="${f(2 * k)}" fill="none"/>`;
      }
      s += `<rect x="${f(x)}" y="${f(base - h * 0.18)}" width="${f(w)}" height="${f(h * 0.18)}" fill="${barra}" stroke="${L}" stroke-width="${f(sw * 0.7)}"/><rect x="${f(x)}" y="${f(base - h * 0.18)}" width="${f(w)}" height="${f(4 * k)}" fill="${tom(barra, 0.3)}"/>`;
      s += `<rect x="${f(sx0)}" y="${f(base - h * 0.18)}" width="${f(lw)}" height="${f(h * 0.18)}" fill="${tom(barra, -0.4)}" transform="skewY(${f(-Math.atan(rec * 0.6 / lw) * 57.3)})" transform-origin="${f(sx0)} ${f(base)}"/>`;
      s += `<rect x="${f(x)}" y="${f(base - 30 * k)}" width="${f(w)}" height="${f(30 * k)}" fill="#2A2018" opacity=".35"/>`;   // sujeira subindo do chão
      // sombra do beiral na parede
      s += `<rect x="${f(x)}" y="${f(topo)}" width="${f(w)}" height="${f(h * 0.1)}" fill="#000" opacity=".35"/>`;
      // janelas de madeira com folhas abertas, moldura funda, peitoril, cortina, luz vazando
      const jan = (u) => { const jx = x + w * u, jy = topo + h * 0.28, jw = w * 0.2, jh = h * 0.36;
        let j = `<rect x="${f(jx - 6 * k)}" y="${f(jy - 6 * k)}" width="${f(jw + 12 * k)}" height="${f(jh + 12 * k)}" fill="#3A2A1C" stroke="${L}" stroke-width="${f(sw * 0.8)}"/><rect x="${f(jx)}" y="${f(jy)}" width="${f(jw)}" height="${f(jh)}" fill="${jl}"/>`;
        if (det) j += `<rect x="${f(jx)}" y="${f(jy)}" width="${f(jw)}" height="${f(jh * 0.12)}" fill="#000" opacity=".3"/>` + (acesa ? `<path d="M${f(jx)} ${f(jy)} q${f(jw * 0.18)} ${f(jh * 0.5)} ${f(jw * 0.06)} ${f(jh)} H${f(jx)}Z" fill="${festa ? '#E84A5A' : '#C9A26A'}" opacity=".85"/><path d="M${f(jx + jw)} ${f(jy)} q${f(-jw * 0.18)} ${f(jh * 0.5)} ${f(-jw * 0.06)} ${f(jh)} H${f(jx + jw)}Z" fill="${festa ? '#E84A5A' : '#C9A26A'}" opacity=".85"/>` : '');
        j += `<path d="M${f(jx + jw / 2)} ${f(jy)} V${f(jy + jh)}" stroke="#3A2A1C" stroke-width="${f(3 * k)}"/>`;
        // folhas de madeira abertas para fora (em perspectiva), com tábuas
        [[-1, jx], [1, jx + jw]].forEach(([sd, ex]) => { const fw = jw * 0.48; j += `<path d="M${f(ex)} ${f(jy)} L${f(ex + sd * fw)} ${f(jy - 8 * k)} L${f(ex + sd * fw)} ${f(jy + jh + 8 * k)} L${f(ex)} ${f(jy + jh)}Z" fill="#4A6A5A" stroke="${L}" stroke-width="${f(sw * 0.7)}"/>`; if (det) for (let q = 1; q < 3; q++) j += `<path d="M${f(ex + sd * fw * q / 3)} ${f(jy - 4 * k)} V${f(jy + jh + 4 * k)}" stroke="#3A5A4A" stroke-width="${f(2 * k)}"/>`; });
        j += `<rect x="${f(jx - 12 * k)}" y="${f(jy + jh + 6 * k)}" width="${f(jw + 24 * k)}" height="${f(10 * k)}" fill="#CFC6B0" stroke="${L}" stroke-width="${f(sw * 0.6)}"/><rect x="${f(jx - 8 * k)}" y="${f(jy + jh + 16 * k)}" width="${f(jw + 16 * k)}" height="${f(8 * k)}" fill="#000" opacity=".3"/>`;
        if (acesa) j += brilho(jx + jw / 2, jy + jh / 2, jw * 1.6, jl, 0.45) + `<path d="M${f(jx)} ${f(jy + jh)} L${f(jx + jw)} ${f(jy + jh)} L${f(jx + jw * 1.6)} ${f(base + 40 * k)} L${f(jx - jw * 0.6)} ${f(base + 40 * k)}Z" fill="${jl}" opacity=".12" style="mix-blend-mode:screen"/>`;
        return j; };
      s += jan(0.1) + jan(0.7);
      // porta de tábuas com moldura, maçaneta e degrau
      const px = x + w * 0.41, pw = w * 0.18, ph = h * 0.66;
      s += `<rect x="${f(px - 6 * k)}" y="${f(base - ph - 6 * k)}" width="${f(pw + 12 * k)}" height="${f(ph + 6 * k)}" fill="#2A1E14" stroke="${L}" stroke-width="${f(sw * 0.8)}"/><rect x="${f(px)}" y="${f(base - ph)}" width="${f(pw)}" height="${f(ph)}" fill="${acesa ? '#5A3E26' : '#2A1E16'}"/>`;
      if (det) { for (let q = 1; q < 4; q++) s += `<path d="M${f(px + pw * q / 4)} ${f(base - ph)} V${f(base)}" stroke="#3A2A1A" stroke-width="${f(2.5 * k)}"/>`; s += `<path d="M${f(px)} ${f(base - ph * 0.7)} L${f(px + pw)} ${f(base - ph * 0.3)}" stroke="#3A2A1A" stroke-width="${f(5 * k)}"/><circle cx="${f(px + pw * 0.82)}" cy="${f(base - ph * 0.48)}" r="${f(5 * k)}" fill="#C9A24A"/>`; }
      if (portaAberta) s += `<rect x="${f(px)}" y="${f(base - ph)}" width="${f(pw)}" height="${f(ph)}" fill="#07080A"/><path d="M${f(px)} ${f(base - ph)} L${f(px - pw * 0.35)} ${f(base - ph - 10 * k)} L${f(px - pw * 0.35)} ${f(base + 10 * k)} L${f(px)} ${f(base)}Z" fill="#3A2A1A" stroke="${L}" stroke-width="${f(sw * 0.7)}"/>`;
      s += `<rect x="${f(px - 18 * k)}" y="${f(base)}" width="${f(pw + 36 * k)}" height="${f(16 * k)}" fill="#8A8478" stroke="${L}" stroke-width="${f(sw * 0.6)}"/>`;
      // telhado: empena lateral, espessura do beiral, fileiras de telha capa-canal, cumeeira, luar frio na borda
      const ov = 30 * k, esp = 14 * k;
      s += `<path d="M${f(sx0 + ov * 0.2)} ${f(topo - 2)} L${f(x + w / 2)} ${f(cume)} L${f(x + w / 2 + lw)} ${f(cume - rec)} L${f(sx1 + ov)} ${f(topo - rec)}Z" fill="${tom(telha, -0.35)}" stroke="${L}" stroke-width="${f(sw)}"/>`;
      s += `<path d="M${f(x - ov)} ${f(topo + esp)} L${f(x + w / 2)} ${f(cume + esp)} L${f(x + w + ov)} ${f(topo + esp)} L${f(x + w + ov)} ${f(topo)} L${f(x + w / 2)} ${f(cume)} L${f(x - ov)} ${f(topo)}Z" fill="${tom(telha, -0.5)}" stroke="${L}" stroke-width="${f(sw)}"/>`;
      s += `<path d="M${f(x - ov)} ${f(topo)} L${f(x + w / 2)} ${f(cume)} L${f(x + w + ov)} ${f(topo)}Z" fill="${telha}" stroke="${L}" stroke-width="${f(sw)}"/>`;
      const fil = det ? 7 : 4;
      for (let r = 1; r < fil; r++) { const v = r / fil; s += `<path d="M${f(lerp(x + w / 2, x - ov, v))} ${f(lerp(cume, topo, v))} L${f(lerp(x + w / 2, x + w + ov, v))} ${f(lerp(cume, topo, v))}" stroke="${tom(telha, -0.3)}" stroke-width="${f(2.5 * k)}"/>`;
        if (det) { const yy = lerp(cume, topo, v), xa = lerp(x + w / 2, x - ov, v), xb = lerp(x + w / 2, x + w + ov, v), tw = 26 * k, rh = (topo - cume) / fil;
          // bocas das telhas (meia-lua escura) + canal entre telhas + brilho no lombo de cada uma
          for (let xx = xa + 4 * k; xx + tw < xb - 2 * k; xx += tw) {
            s += `<path d="M${f(xx)} ${f(yy)} a${f(tw / 2)} ${f(tw * 0.32)} 0 0 1 ${f(tw)} 0Z" fill="${tom(telha, -0.45)}" opacity=".75"/>`;
            s += `<path d="M${f(xx + tw * 0.3)} ${f(yy - rh * 0.85)} V${f(yy - tw * 0.3)}" stroke="${tom(telha, 0.25)}" stroke-width="${f(3 * k)}" stroke-linecap="round" opacity=".45"/>`;
            s += `<path d="M${f(xx + tw)} ${f(yy - rh * 0.9)} V${f(yy)}" stroke="${tom(telha, -0.35)}" stroke-width="${f(1.6 * k)}" opacity=".6"/>`;
          } } }
      s += `<path d="M${f(x - ov)} ${f(topo)} L${f(x + w / 2)} ${f(cume)} L${f(x + w + ov)} ${f(topo)}" stroke="#AFC0E0" stroke-width="${f(3 * k)}" fill="none" opacity=".45"/>`;   // luar na borda
      // chaminé de tijolo com fumaça
      if (chamine) { const cx = x + w * 0.72, cy = lerp(cume, topo, 0.45) + 6 * k; s += `<rect x="${f(cx)}" y="${f(cy - 110 * k)}" width="${f(42 * k)}" height="${f(110 * k)}" fill="#8A4A32" stroke="${L}" stroke-width="${f(sw)}"/><rect x="${f(cx - 6 * k)}" y="${f(cy - 120 * k)}" width="${f(54 * k)}" height="${f(14 * k)}" fill="#6A3A26" stroke="${L}" stroke-width="${f(sw * 0.8)}"/>`;
        if (det) for (let r = 0; r < 5; r++) s += `<path d="M${f(cx)} ${f(cy - 100 * k + r * 20 * k)} h${f(42 * k)}" stroke="#5A2E1E" stroke-width="${f(1.5 * k)}"/>`;
        if (fumaca) s += `<g class="fumaca">${[0, 1, 2].map(i => `<circle cx="${f(cx + 20 * k + i * 16 * k)}" cy="${f(cy - 150 * k - i * 46 * k)}" r="${f((16 + i * 10) * k)}" fill="#8A8A90" opacity="${(0.28 - i * 0.07).toFixed(2)}"/>`).join('')}</g>`; }
      // varanda: telhadinho, esteios em 3 tons, cadeira, samambaia, filtro de barro
      if (varanda) { const vy = topo + h * 0.3, vb = base;
        s += `<path d="M${f(x - 50 * k)} ${f(vy)} H${f(x + w + 50 * k)} L${f(x + w + 80 * k)} ${f(vy + 50 * k)} H${f(x - 80 * k)}Z" fill="${tom(telha, -0.15)}" stroke="${L}" stroke-width="${f(sw)}"/><path d="M${f(x - 80 * k)} ${f(vy + 50 * k)} H${f(x + w + 80 * k)}" stroke="#2A1E14" stroke-width="${f(8 * k)}"/>`;
        [0, 0.34, 0.66, 1].forEach(u => { const ex = x - 60 * k + u * (w + 120 * k); s += `<rect x="${f(ex)}" y="${f(vy + 50 * k)}" width="${f(18 * k)}" height="${f(vb - vy - 50 * k)}" fill="#5A3E26" stroke="${L}" stroke-width="${f(sw * 0.7)}"/><rect x="${f(ex + 2 * k)}" y="${f(vy + 52 * k)}" width="${f(5 * k)}" height="${f(vb - vy - 54 * k)}" fill="#7A5A3A"/>`; });
        if (det) { s += `<g transform="translate(${f(x + w * 0.85)} ${f(vb)}) scale(${f(k)})"><rect x="-26" y="-60" width="52" height="60" rx="8" fill="#9A5A3A" stroke="${L}" stroke-width="3"/><ellipse cx="0" cy="-70" rx="22" ry="14" fill="#B86A42" stroke="${L}" stroke-width="3"/><circle cx="0" cy="-90" r="10" fill="#9A5A3A" stroke="${L}" stroke-width="3"/></g>`;
          s += `<g transform="translate(${f(x + w * 0.05)} ${f(vy + 50 * k)}) scale(${f(k)})"><path d="M0 0 v24" stroke="#2A2A2A" stroke-width="2"/><path d="M-20 24 h40 l-6 30 h-28Z" fill="#7A4A2A" stroke="${L}" stroke-width="3"/>${[-40, -20, 0, 20, 40].map(a => `<path d="M0 30 q${a} 20 ${a * 1.4} 70" stroke="#3E6A3A" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
          s += `<g transform="translate(${f(x + w * 0.24)} ${f(vb)}) scale(${f(k * 0.9)})"><path d="M-40 0 V-150 M30 0 V-80 M-40 -80 H30" stroke="#5A3E26" stroke-width="8"/><rect x="-44" y="-86" width="78" height="12" fill="#C9A86A" stroke="${L}" stroke-width="3"/></g>`; } }
      // mato e pedras no pé da casa
      if (det) for (let i = 0; i < 10; i++) { const gx = x + rnd(-0.1, 1.1) * w, gy = base + rnd(2, 16) * k; s += `<path d="M${f(gx)} ${f(gy)} l${f(-6 * k)} ${f(-18 * k)} M${f(gx)} ${f(gy)} l${f(2 * k)} ${f(-22 * k)} M${f(gx)} ${f(gy)} l${f(9 * k)} ${f(-15 * k)}" stroke="#2E3E24" stroke-width="${f(3 * k)}"/>`; }
      return s; };

    const ceu = (x, y, w, h, horizonte, amanhecer, lua = [x + w * 0.8, y + 330]) => {
      if (!amanhecer) { const [gid, gdef] = grad(['#0A0E1E', '#1E2840', '#3A4458']); return gdef + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid})"/>` + estrelas(x, y, w, horizonte - y, 80) + `<circle cx="${f(lua[0])}" cy="${f(lua[1])}" r="50" fill="#D8DCE6"/>` + brilho(lua[0], lua[1], 240, '#9AB0D8', 0.3); }
      const [gid, gdef] = grad(['#1E2440', '#4A3E5E', '#A8687A', '#E89A6E', '#F6C48A']);
      return gdef + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid})"/>` + estrelas(x, y, w, (horizonte - y) * 0.25, 18) + brilho(x + w * 0.72, horizonte, 520, '#FFB874', 0.55) +
        `<path d="M${f(x + w * 0.1)} ${f(y + 420)} q90 -36 200 -6 q70 -30 150 4 q30 26 -30 30 h-290 q-50 -8 -30 -28Z" fill="#8A5A6A" opacity=".6"/><path d="M${f(x + w * 0.55)} ${f(y + 560)} q70 -30 160 -4 q60 -24 120 6 q20 20 -30 22 h-230 q-40 -6 -20 -24Z" fill="#C87A6A" opacity=".5"/>`;
    };
    // capim alto na frente dos personagens (esconde quem se joga no chão); segue o chão (função x → y)
    S.capim = (x0, x1, chaoFn, alt = 90, cor = '#1E2C1A', passo = 14) => { let s = '';
      for (let gx = x0; gx < x1; gx += passo * rnd(0.6, 1.2)) { const gy = chaoFn(gx) + rnd(4, 26), hh = alt * rnd(0.55, 1.15), cc = tom(cor, rnd(-0.12, 0.1));
        s += `<path d="M${f(gx - 5)} ${f(gy)} Q${f(gx - 4)} ${f(gy - hh * 0.6)} ${f(gx + rnd(-26, 26))} ${f(gy - hh)} Q${f(gx + 2)} ${f(gy - hh * 0.5)} ${f(gx + 6)} ${f(gy)}Z" fill="${cc}"/>`; }
      return s; };

    // ================= CENAS =================
    // ---------- ENCOSTA do morro de lado: o topo plano à esquerda (onde o Tião fica) e o pasto descendo para a direita,
    // lá embaixo o vale com a estrada e a casa do seu Zé; noite ou amanhecer. S.encosta.chao(x) = y do chão ----------
    const chaoEnc = gx => { const u = Math.min(1, Math.max(0, (gx - 360) / 760)), e = u * u * (3 - 2 * u); return 1180 + 560 * e; };
    S.encosta = ({ x = 0, y = 0, w = 1080, h = 1920, amanhecer = false } = {}) => {
      const hz = 930;
      let s = defs() + ceu(x, y, w, h, hz, amanhecer, [x + w * 0.2, y + 300]);
      s += serra(x, w, hz, 300, amanhecer ? '#4A3E58' : '#1A2236', 0.95) + serra(x, w, hz + 60, 200, amanhecer ? '#2E3440' : '#141C24', 1);
      // vale lá embaixo: pasto, estrada e a casa do seu Zé (apagada)
      s += `<rect x="${x}" y="${hz + 40}" width="${w}" height="${h - hz}" fill="${amanhecer ? '#2E3A2A' : '#121A14'}"/>`;
      s += `<path d="M${f(x + w * 0.35)} ${f(hz + 160)} Q${f(x + w * 0.6)} ${f(hz + 120)} ${f(x + w + 20)} ${f(hz + 150)}" stroke="${amanhecer ? '#7A6A52' : '#3A3428'}" stroke-width="12" fill="none"/>`;
      s += casaRoca(x + w * 0.66, hz + 128, 80, 52, { acesa: false, cor: amanhecer ? '#9A8E74' : '#3A3830', telha: amanhecer ? '#6A3424' : '#2A1A16', chamine: false, portaAberta: amanhecer });
      for (let i = 0; i < 8; i++) s += araucaria(x + rnd(0.3, 1) * w, hz + rnd(60, 140), rnd(40, 90), amanhecer ? '#1E2A22' : '#0C120E');
      s += neblina(x, hz + 60, w, 160, amanhecer ? 0.3 : 0.16);
      // o morro (perfil): topo plano e descida em curva, com textura de pasto
      const cor = amanhecer ? '#3A4A2C' : '#18221A';
      let d = `M${x - 10} ${f(chaoEnc(x))}`; for (let gx = x; gx <= x + w + 20; gx += 20) d += ` L${f(gx)} ${f(chaoEnc(gx))}`;
      s += `<path d="${d} L${x + w + 20} ${y + h} H${x - 10}Z" fill="${cor}"/><path d="${d}" stroke="${tom(cor, 0.25)}" stroke-width="5" fill="none"/>`;
      for (let i = 0; i < 70; i++) { const gx = rnd(x, x + w), gy = chaoEnc(gx) + rnd(10, 600); if (gy > y + h) continue; s += `<path d="M${f(gx)} ${f(gy)} l-6 -14 M${f(gx)} ${f(gy)} l2 -18 M${f(gx)} ${f(gy)} l8 -12" stroke="${tom(cor, rnd(0.05, 0.2))}" stroke-width="3"/>`; }
      // araucária e cerca no topo, cupinzeiro e pedras na descida
      s += araucaria(x + 90, chaoEnc(x + 90) + 6, 420, amanhecer ? '#1A2418' : '#0A100C');
      for (let k = 0; k < 4; k++) { const px = x + 170 + k * 60; s += `<rect x="${f(px)}" y="${f(chaoEnc(px) - 110)}" width="12" height="116" fill="#2A2018" stroke="${L}" stroke-width="3"/>`; }
      s += `<path d="M${x + 150} ${f(chaoEnc(150) - 90)} H${x + 370} M${x + 150} ${f(chaoEnc(150) - 50)} H${x + 370}" stroke="#4A4A48" stroke-width="2"/>`;
      const cx = x + 700; s += `<path d="M${f(cx - 60)} ${f(chaoEnc(cx - 60) + 6)} Q${f(cx - 40)} ${f(chaoEnc(cx) - 110)} ${f(cx)} ${f(chaoEnc(cx) - 120)} Q${f(cx + 46)} ${f(chaoEnc(cx) - 100)} ${f(cx + 60)} ${f(chaoEnc(cx + 60) + 6)}Z" fill="${amanhecer ? '#8A6A4A' : '#3A2E22'}" stroke="${L}" stroke-width="4"/><path d="M${f(cx - 20)} ${f(chaoEnc(cx) - 70)} q10 -10 22 0" stroke="${L}" stroke-width="3" fill="none"/>`;
      [[520, 30], [880, 40], [980, 26]].forEach(([px, r]) => { s += `<ellipse cx="${f(x + px)}" cy="${f(chaoEnc(x + px) + 4)}" rx="${r}" ry="${f(r * 0.55)}" fill="${amanhecer ? '#7A7468' : '#2E2E30'}" stroke="${L}" stroke-width="3"/>`; });
      return clip(x, y, w, h, s + acabamento(0.3));
    };
    S.encosta.chao = chaoEnc;

    // ---------- PORTEIRA do sítio (amanhecer): cerca de madeira atravessando a cena, porteira de 5 tábuas com mão-francesa
    // (aberta = virada para quem olha), caminho de terra até a casa do Tião ao fundo ----------
    S.porteira = ({ x = 0, y = 0, w = 1080, h = 1920, chao = 1440, aberta = true, amanhecer = true } = {}) => {
      const hz = 980;
      let s = defs() + ceu(x, y, w, h, hz, amanhecer);
      s += serra(x, w, hz, 260, amanhecer ? '#4A3E58' : '#1A2236', 0.95) + `<rect x="${x}" y="${hz - 10}" width="${w}" height="${h - hz}" fill="${amanhecer ? '#3A4A2C' : '#18221A'}"/>`;
      for (let i = 0; i < 5; i++) s += araucaria(x + rnd(0, w), hz + rnd(0, 30), rnd(120, 220), amanhecer ? '#1E2A22' : '#0C120E');
      s += casaRoca(x + 330, hz + 150, 400, 230, { acesa: false, cor: '#8A7E66', telha: '#6A3424', varanda: true, fumaca: false });
      s += neblina(x, hz + 60, w, 200, 0.22);
      // caminho de terra até a casa
      s += `<path d="M${f(x + 470)} ${f(hz + 170)} H${f(x + 590)} L${f(x + 760)} ${y + h} H${f(x + 240)}Z" fill="${amanhecer ? '#7A6A52' : '#3A3428'}"/>`;
      for (let i = 0; i < 30; i++) { const yy = rnd(hz + 200, y + h), u = (yy - hz) / (y + h - hz); s += `<ellipse cx="${f(lerp(x + 520, x + 500, u) + rnd(-1, 1) * lerp(50, 240, u))}" cy="${f(yy)}" rx="${f(3 + u * 12)}" ry="${f(2 + u * 4)}" fill="#5A4A3A"/>`; }
      for (let i = 0; i < 50; i++) { const gx = rnd(x, x + w), gy = rnd(hz + 120, y + h); s += `<path d="M${f(gx)} ${f(gy)} l-6 -16 M${f(gx)} ${f(gy)} l2 -20 M${f(gx)} ${f(gy)} l8 -14" stroke="#4A5A3A" stroke-width="3"/>`; }
      // cerca: mourões e 3 travessas, com vão para a porteira entre x 360 e 640
      const cor = '#5A4430', topo = chao - 230;
      const mourao = px => `<rect x="${f(px - 14)}" y="${f(topo - 20)}" width="28" height="${f(chao - topo + 24)}" fill="${cor}" stroke="${L}" stroke-width="4"/><rect x="${f(px - 10)}" y="${f(topo - 16)}" width="8" height="${f(chao - topo + 16)}" fill="#7A6040"/>`;
      [x - 20, x + 120, x + 250, x + 360, x + 640, x + 770, x + 900, x + 1040].forEach(px => { s += mourao(px); });
      [0.2, 0.5, 0.8].forEach(v => { const yy = topo + (chao - topo) * v; s += `<rect x="${x - 20}" y="${f(yy - 9)}" width="${f(380)}" height="18" fill="${cor}" stroke="${L}" stroke-width="3"/><rect x="${x + 640}" y="${f(yy - 9)}" width="${f(w - 620)}" height="18" fill="${cor}" stroke="${L}" stroke-width="3"/>`; });
      // porteira: 5 tábuas + mão-francesa; aberta = gira na dobradiça (x 360) vindo para a frente (fica maior na ponta solta)
      const g0 = [x + 360, topo + 10], g1 = [x + 360, chao - 10];
      const p0 = aberta ? [x + 120, topo - 30] : [x + 640, topo + 10], p1 = aberta ? [x + 120, chao + 60] : [x + 640, chao - 10];
      const P = (u, v) => [lerp(lerp(g0[0], p0[0], u), lerp(g1[0], p1[0], u), v), lerp(lerp(g0[1], p0[1], u), lerp(g1[1], p1[1], u), v)];
      const tab = v => `<path d="M${f(P(0, v - 0.05)[0])} ${f(P(0, v - 0.05)[1])} L${f(P(1, v - 0.07)[0])} ${f(P(1, v - 0.07)[1])} L${f(P(1, v + 0.07)[0])} ${f(P(1, v + 0.07)[1])} L${f(P(0, v + 0.05)[0])} ${f(P(0, v + 0.05)[1])}Z" fill="#7A5A3A" stroke="${L}" stroke-width="4"/>`;
      s += [0.1, 0.3, 0.5, 0.7, 0.9].map(tab).join('');
      s += `<path d="M${f(P(0.04, 0.9)[0])} ${f(P(0.04, 0.9)[1])} L${f(P(0.96, 0.1)[0])} ${f(P(0.96, 0.1)[1])}" stroke="#6A4A2E" stroke-width="22" stroke-linecap="round"/><path d="M${f(P(0, 0)[0])} ${f(P(0, 0)[1])} L${f(P(0, 1)[0])} ${f(P(0, 1)[1])} M${f(P(1, 0)[0])} ${f(P(1, 0)[1])} L${f(P(1, 1)[0])} ${f(P(1, 1)[1])}" stroke="#5A4028" stroke-width="20"/>`;
      s += `<rect x="${f(x + 350)}" y="${f(topo + 30)}" width="20" height="14" fill="#5A5A5E"/><rect x="${f(x + 350)}" y="${f(chao - 50)}" width="20" height="14" fill="#5A5A5E"/>`;   // dobradiças
      s += `<path d="M${f(x + 628)} ${f(topo + 100)} q-20 10 -16 34" stroke="#8A8A90" stroke-width="5" fill="none"/>`;   // corrente solta no mourão
      return clip(x, y, w, h, s + acabamento(0.28));
    };

    // ---------- PAREDE DA COZINHA por fora (de perto): reboco gasto, janela de madeira, o cobertor ARRANCADO (pendurado
    // num prego só, rasgado), lá dentro escuro com a luzinha do rádio; lenha, enxada, balde, mato no pé da parede ----------
    S.paredeJanela = ({ x = 0, y = 0, w = 1080, h = 1920, chao = 1440, amanhecer = true } = {}) => {
      const cor = '#8A7E66';
      let s = defs() + `<rect x="${x}" y="${y}" width="${w}" height="${chao}" fill="${cor}"/>`;
      for (let i = 0; i < 26; i++) s += `<ellipse cx="${f(x + rnd(0, w))}" cy="${f(y + rnd(0, chao))}" rx="${f(rnd(40, 120))}" ry="${f(rnd(20, 60))}" fill="${tom(cor, rnd(-0.16, 0.08))}" opacity=".55"/>`;
      [[120, 300], [860, 1140], [200, 1000]].forEach(([bx, by]) => { s += `<path d="M${bx} ${by} q60 -40 150 -10 q30 50 -20 90 q-100 16 -130 -80Z" fill="#9A5A3E"/>`; for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) s += `<rect x="${bx + 10 + q * 34 + (r % 2) * 16}" y="${by - 16 + r * 24}" width="30" height="20" fill="#8A4A32" stroke="#5A2E1E" stroke-width="2"/>`; });
      s += `<path d="M${x + 300} ${y} l-20 120 l30 90 l-14 130" stroke="${tom(cor, -0.4)}" stroke-width="4" fill="none"/>`;
      s += `<rect x="${x}" y="${y}" width="${w}" height="140" fill="#000" opacity=".35"/>`;   // sombra do beiral
      s += `<rect x="${x}" y="${chao - 240}" width="${w}" height="240" fill="#3E5A6E" stroke="${L}" stroke-width="5"/><rect x="${x}" y="${chao - 240}" width="${w}" height="8" fill="#6A8A9E"/><rect x="${x}" y="${chao - 50}" width="${w}" height="50" fill="#2A2018" opacity=".4"/>`;
      // janela: moldura funda, lá dentro escuro, o mostrador do rádio aceso; folhas de madeira abertas
      const jx = x + 500, jy = y + 560, jw = 400, jh = 420;
      s += `<rect x="${jx - 24}" y="${jy - 24}" width="${jw + 48}" height="${jh + 48}" fill="#3A2A1C" stroke="${L}" stroke-width="6"/><rect x="${jx}" y="${jy}" width="${jw}" height="${jh}" fill="#0A0C10"/>`;
      s += `<rect x="${jx + 40}" y="${jy + 300}" width="320" height="18" fill="#1A1410"/><rect x="${jx + 200}" y="${jy + 240}" width="110" height="62" rx="8" fill="#16120E"/><rect x="${jx + 214}" y="${jy + 254}" width="44" height="20" fill="#E8B23A" opacity=".8"/>` + brilho(jx + 236, jy + 264, 90, '#E8B23A', 0.4);
      if (amanhecer) s += `<path d="M${jx} ${jy} L${jx + jw * 0.45} ${jy} L${jx + jw * 0.2} ${jy + jh} H${jx}Z" fill="#F6C48A" opacity=".08"/>`;
      s += `<path d="M${jx + jw / 2} ${jy} V${jy + jh}" stroke="#3A2A1C" stroke-width="12"/>`;
      [[-1, jx - 24], [1, jx + jw + 24]].forEach(([sd, ex]) => { s += `<path d="M${ex} ${jy - 24} L${ex + sd * 150} ${jy - 44} L${ex + sd * 150} ${jy + jh + 44} L${ex} ${jy + jh + 24}Z" fill="#4A6A5A" stroke="${L}" stroke-width="5"/>`; for (let q = 1; q < 4; q++) s += `<path d="M${ex + sd * 150 * q / 4} ${jy - 28 - q * 4} V${jy + jh + 28 + q * 4}" stroke="#3A5A4A" stroke-width="4"/>`; });
      s += `<rect x="${jx - 40}" y="${jy + jh + 24}" width="${jw + 80}" height="22" fill="#CFC6B0" stroke="${L}" stroke-width="4"/>`;
      // cobertor arrancado: preso só no prego da direita, caído e rasgado; um pedaço ficou no prego da esquerda
      s += `<circle cx="${jx - 4}" cy="${jy - 8}" r="8" fill="#9AA0A8"/><path d="M${jx - 4} ${jy - 8} l-14 30 l12 -6 l6 26 l10 -40Z" fill="#5A2E2A" stroke="${L}" stroke-width="3"/>`;
      s += `<g class="cobertorPend"><path d="M${jx + jw + 4} ${jy - 8} Q${jx + jw - 60} ${jy + 160} ${jx + jw - 30} ${jy + 380} L${jx + jw - 70} ${jy + 430} L${jx + jw - 40} ${jy + 470} L${jx + jw + 10} ${jy + 450} L${jx + jw + 40} ${jy + 500} L${jx + jw + 60} ${jy + 360} Q${jx + jw + 50} ${jy + 120} ${jx + jw + 4} ${jy - 8}Z" fill="#5A2E2A" stroke="${L}" stroke-width="5"/>${[0, 1, 2].map(i => `<path d="M${jx + jw - 30 + i * 30} ${jy + 40 + i * 10} Q${jx + jw - 40 + i * 30} ${jy + 260} ${jx + jw - 30 + i * 32} ${jy + 440}" stroke="#3E1E1A" stroke-width="9" fill="none" opacity=".7"/>`).join('')}${[0, 1, 2, 3].map(i => `<path d="M${jx + jw - 40 + i * 4} ${jy + 80 + i * 100} H${jx + jw + 50 - i * 2}" stroke="#7A4A3A" stroke-width="7" opacity=".55"/>`).join('')}<circle cx="${jx + jw + 4}" cy="${jy - 8}" r="8" fill="#9AA0A8"/></g>`;
      s += `<path d="M${jx + 60} ${jy + jh + 28} l30 -6 l-10 12 l26 -4" stroke="#2A1810" stroke-width="5" fill="none"/>`;   // arranhões no peitoril
      // chão de terra, lenha empilhada, enxada encostada, balde
      s += `<rect x="${x}" y="${chao}" width="${w}" height="${y + h - chao}" fill="${amanhecer ? '#5A4A38' : '#2A2018'}"/>`;
      for (let i = 0; i < 40; i++) s += `<ellipse cx="${f(x + rnd(0, w))}" cy="${f(chao + rnd(10, h - chao))}" rx="${f(rnd(4, 14))}" ry="${f(rnd(2, 5))}" fill="#3A2E22"/>`;
      for (let i = 0; i < 9; i++) s += `<g transform="translate(${x + 40 + (i % 3) * 70} ${chao - 30 - Math.floor(i / 3) * 56})"><rect x="0" y="0" width="150" height="54" rx="26" fill="${tom('#6A4A2A', rnd(-0.12, 0.1))}" stroke="${L}" stroke-width="4"/><circle cx="18" cy="27" r="20" fill="#B8925A" stroke="${L}" stroke-width="3"/><circle cx="18" cy="27" r="8" fill="none" stroke="#7A5A32" stroke-width="2"/></g>`;
      s += `<path d="M${x + 980} ${chao + 6} L${x + 900} ${chao - 620}" stroke="#7A5A3A" stroke-width="16" stroke-linecap="round"/><path d="M${x + 880} ${chao - 640} l60 -20 l14 40 l-56 10Z" fill="#6A6A70" stroke="${L}" stroke-width="4"/>`;
      s += `<g transform="translate(${x + 420} ${chao + 10})"><path d="M-60 0 L-70 -120 H70 L60 0Z" fill="#8A9098" stroke="${L}" stroke-width="5"/><path d="M-70 -120 Q0 -200 70 -120" stroke="#5A5A60" stroke-width="5" fill="none"/><ellipse cx="0" cy="-120" rx="70" ry="12" fill="#5A6068" stroke="${L}" stroke-width="4"/></g>`;
      for (let i = 0; i < 24; i++) { const gx = rnd(x, x + w), gy = chao + rnd(0, 20); s += `<path d="M${f(gx)} ${f(gy)} l-8 -26 M${f(gx)} ${f(gy)} l2 -32 M${f(gx)} ${f(gy)} l10 -22" stroke="#3E5A2E" stroke-width="4"/>`; }
      if (amanhecer) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F6B07A" opacity=".08" style="mix-blend-mode:screen"/>`;
      return clip(x, y, w, h, s + acabamento(0.28));
    };

    // ---------- XÍCARA DE ÁGATA de perto (café ainda quente): pires, borda azul lascada, café, vapor subindo (.vapor) ----------
    S.xicara = (x, y, k = 1) => `<g transform="translate(${f(x)} ${f(y)}) scale(${k})"><ellipse cx="0" cy="6" rx="150" ry="26" fill="#000" opacity=".35"/>
      <ellipse cx="0" cy="0" rx="140" ry="26" fill="#E8E4DA" stroke="${L}" stroke-width="5"/><ellipse cx="0" cy="-4" rx="100" ry="16" fill="#D2CCBE"/><path d="M-140 0 q140 40 280 0" stroke="#2E5A9A" stroke-width="6" fill="none"/>
      <path d="M78 -110 q66 -6 62 44 q-4 44 -66 46" stroke="${L}" stroke-width="30" fill="none"/><path d="M78 -110 q66 -6 62 44 q-4 44 -66 46" stroke="#F2EEE4" stroke-width="20" fill="none"/>
      <path d="M-86 -150 L-74 -12 Q0 6 74 -12 L86 -150Z" fill="#F2EEE4" stroke="${L}" stroke-width="6"/><path d="M-80 -150 L-70 -16" stroke="#FFFFFF" stroke-width="14" opacity=".7"/><path d="M60 -140 L52 -20" stroke="#C8C2B4" stroke-width="16" opacity=".6"/>
      <path d="M-30 -60 l8 -14 l10 10 l6 -8" stroke="#1E2A3A" stroke-width="3" fill="none"/><circle cx="-26" cy="-58" r="10" fill="#1E2A3A" opacity=".75"/>
      <ellipse cx="0" cy="-150" rx="86" ry="18" fill="#2E5A9A" stroke="${L}" stroke-width="5"/><ellipse cx="0" cy="-148" rx="74" ry="13" fill="#3A1E10"/><ellipse cx="-20" cy="-150" rx="28" ry="4" fill="#7A4A2A" opacity=".7"/><path d="M40 -162 l14 -2 l-6 10Z" fill="#1E2A3A"/>
      <g class="vapor">${[[-40, 0], [0, 1.4], [38, 2.6]].map(([vx, ph]) => `<path data-ph="${ph}" d="M${vx} -170 q-26 -50 0 -100 q26 -50 0 -110" stroke="#F2EEE4" stroke-width="14" stroke-linecap="round" fill="none" opacity=".35"/>`).join('')}</g></g>`;
    // a mesa da cozinha de perto, de manhã: toalha de chita, a xícara no meio, coador de pano, pão, o rádio desfocado atrás
    S.mesaClose = ({ x = 0, y = 0, w = 1080, h = 1920, mesa = 1240 } = {}) => {
      let s = defs() + tabuas(x, y, w, mesa, '#3A2C20', true, 120) + `<rect x="${x}" y="${y}" width="${w}" height="${mesa}" fill="#000" opacity=".35"/>`;
      s += `<path d="M${x} ${y + 200} L${x + 520} ${y + 200} L${x + 900} ${mesa} H${x}Z" fill="#F6C48A" opacity=".1" style="mix-blend-mode:screen"/>`;   // luz da manhã entrando
      s += `<g opacity=".55">${S.radio(x + 800, mesa - 10, 2.2, { ligado: true })}</g><rect x="${x + 560}" y="${mesa - 340}" width="520" height="340" fill="#1A1410" opacity=".35"/>`;
      s += `<rect x="${x}" y="${mesa}" width="${w}" height="${h - mesa}" fill="#7A2E3A"/>${[...Array(40)].map(() => `<circle cx="${f(x + rnd(0, w))}" cy="${f(mesa + rnd(10, h - mesa))}" r="${f(rnd(10, 26))}" fill="${pick(['#E8C24A', '#4A9A6A', '#E8E2D0'])}" opacity=".8"/>`).join('')}<path d="M${x} ${mesa} H${x + w}" stroke="${L}" stroke-width="6"/>`;
      s += `<g transform="translate(${x + 150} ${mesa + 80})"><path d="M-60 0 v-180 M60 0 v-180 M-60 -180 H60" stroke="#6A4A2A" stroke-width="10"/><path d="M-46 -176 Q0 -60 46 -176" fill="#E8E2D0" stroke="${L}" stroke-width="4"/><ellipse cx="0" cy="6" rx="80" ry="14" fill="#B8B0A0" stroke="${L}" stroke-width="4"/></g>`;
      s += `<g transform="translate(${x + 900} ${mesa + 260})"><ellipse cx="0" cy="0" rx="130" ry="30" fill="#E8E4DA" stroke="${L}" stroke-width="5"/><path d="M-80 -10 q0 -60 80 -64 q80 4 80 64Z" fill="#D89A4A" stroke="${L}" stroke-width="5"/><path d="M-40 -40 q40 -20 80 0" stroke="#A86A2A" stroke-width="6" fill="none"/>${[...Array(8)].map(() => `<circle cx="${f(rnd(-110, 110))}" cy="${f(rnd(-6, 14))}" r="4" fill="#C88A4A"/>`).join('')}</g>`;
      s += S.xicara(x + w / 2, mesa + 220, 2.0);
      return clip(x, y, w, h, s + acabamento(0.24));
    };
    // ---------- COZINHA do Tião: tábuas, fogão a lenha com chaleira e fumaça, mesa com rádio + lampião + xícara + coador,
    // janela (aberta para a noite ou coberta com cobertor), relógio, calendário, espingarda, chapéu no prego, prateleira com potes ----------
    S.cozinha = ({ x = 0, y = 0, w = 1080, h = 1920, chao = y + h * 0.66, lampiao = true, coberta = false, radio = true, lampX = 640, mesaY = chao + 80, janelaY = 0.2, amanhecer = false, cobertorChao = false } = {}) => {
      let s = defs() + tabuas(x, y, w, chao - y, '#4A3A2A', true, 90);
      s += `<rect x="${x}" y="${y}" width="${w}" height="70" fill="#2A2018"/><path d="M${x} ${y + 70} H${x + w}" stroke="${L}" stroke-width="6"/>` + [0.2, 0.55, 0.85].map(u => `<rect x="${f(x + w * u - 20)}" y="${y}" width="40" height="90" fill="#3A2A1C" stroke="${L}" stroke-width="4"/>`).join('');
      // janela (com a noite lá fora) — ou coberta com um cobertor xadrez preso com pregos
      const jx = x + w * 0.56, jy = y + (chao - y) * janelaY, jw = 300, jh = 260;
      s += `<rect x="${f(jx - 16)}" y="${f(jy - 16)}" width="${jw + 32}" height="${jh + 32}" fill="#3A2A1C" stroke="${L}" stroke-width="5"/><rect x="${f(jx)}" y="${f(jy)}" width="${jw}" height="${jh}" fill="${amanhecer ? '#D8987A' : '#0E1424'}"/>` + (amanhecer ? '' : estrelas(jx, jy, jw, jh * 0.6, 14)) + `<path d="M${f(jx)} ${f(jy + jh * 0.75)} Q${f(jx + jw * 0.3)} ${f(jy + jh * 0.55)} ${f(jx + jw * 0.6)} ${f(jy + jh * 0.7)} T${f(jx + jw)} ${f(jy + jh * 0.62)} V${f(jy + jh)} H${f(jx)}Z" fill="#141C18"/><path d="M${f(jx + jw / 2)} ${f(jy)} V${f(jy + jh)} M${f(jx)} ${f(jy + jh / 2)} H${f(jx + jw)}" stroke="#3A2A1C" stroke-width="10"/>`;
      s += `<g class="cobertor" data-x="${f(jx)}" data-y="${f(jy)}" style="display:${coberta ? '' : 'none'}"><path d="M${f(jx - 30)} ${f(jy - 26)} H${f(jx + jw + 30)} L${f(jx + jw + 40)} ${f(jy + jh + 40)} Q${f(jx + jw / 2)} ${f(jy + jh + 10)} ${f(jx - 40)} ${f(jy + jh + 44)}Z" fill="#5A2E2A" stroke="${L}" stroke-width="5"/>${[...Array(6)].map((_, i) => `<path d="M${f(jx - 30 + i * 62)} ${f(jy - 26)} V${f(jy + jh + 30)}" stroke="#3E1E1A" stroke-width="10" opacity=".7"/><path d="M${f(jx - 34)} ${f(jy + i * 52)} H${f(jx + jw + 36)}" stroke="#7A4A3A" stroke-width="8" opacity=".55"/>`).join('')}<circle cx="${f(jx - 20)}" cy="${f(jy - 16)}" r="6" fill="#9AA0A8"/><circle cx="${f(jx + jw + 20)}" cy="${f(jy - 16)}" r="6" fill="#9AA0A8"/></g>`;
      // relógio de parede (19:00) e calendário de banco
      const rx = x + w * 0.88, ry = y + 230;
      s += `<circle cx="${f(rx)}" cy="${f(ry)}" r="56" fill="#E8DCC0" stroke="#3A2A1C" stroke-width="10"/>${[...Array(12)].map((_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M${f(rx + Math.cos(a) * 40)} ${f(ry + Math.sin(a) * 40)} L${f(rx + Math.cos(a) * 48)} ${f(ry + Math.sin(a) * 48)}" stroke="${L}" stroke-width="3"/>`; }).join('')}<path d="M${f(rx)} ${f(ry)} L${f(rx - 20)} ${f(ry + 22)}" stroke="${L}" stroke-width="6" stroke-linecap="round"/><g class="ponteiro" data-cx="${f(rx)}" data-cy="${f(ry)}"><path d="M${f(rx)} ${f(ry)} V${f(ry - 40)}" stroke="${L}" stroke-width="4" stroke-linecap="round"/></g><circle cx="${f(rx)}" cy="${f(ry)}" r="5" fill="${L}"/>`;
      s += `<g transform="rotate(2 ${f(x + w * 0.3)} ${f(y + 300)})"><rect x="${f(x + w * 0.22)}" y="${f(y + 200)}" width="170" height="220" fill="#E8DCC0" stroke="${L}" stroke-width="4"/><rect x="${f(x + w * 0.22)}" y="${f(y + 200)}" width="170" height="70" fill="#8A3A2A"/>${texto('OUTUBRO', x + w * 0.22 + 85, y + 235, 140, 34)}${[...Array(20)].map((_, i) => `<rect x="${f(x + w * 0.22 + 14 + (i % 5) * 30)}" y="${f(y + 286 + Math.floor(i / 5) * 30)}" width="22" height="20" fill="${i === 13 ? '#C94A3A' : '#C9BCA0'}"/>`).join('')}</g>`;
      // espingarda e chapéu pendurados
      s += `<g transform="translate(${f(x + 70)} ${f(y + 520)}) rotate(-8)"><path d="M0 0 H330" stroke="#3A2A1C" stroke-width="22" stroke-linecap="round"/><path d="M230 0 H380" stroke="#4A4A50" stroke-width="12"/><path d="M0 -6 L-60 18 L-50 34 L10 14Z" fill="#5A3A22" stroke="${L}" stroke-width="3"/></g><circle cx="${f(x + 60)}" cy="${f(y + 510)}" r="5" fill="#9AA0A8"/><circle cx="${f(x + 330)}" cy="${f(y + 480)}" r="5" fill="#9AA0A8"/>`;
      // prateleira com potes, garrafa, a lanterna (pega depois), panela
      const px = x + 40, py = y + 760;
      s += `<rect x="${f(px)}" y="${f(py)}" width="420" height="20" fill="#3A2A1C" stroke="${L}" stroke-width="4"/>` + [['#C9A26A', 60], ['#8A6A3A', 70], ['#5A7A6A', 55], ['#B8B0A0', 66]].map(([c, hh], i) => `<rect x="${f(px + 20 + i * 70)}" y="${f(py - hh)}" width="50" height="${hh}" rx="8" fill="${c}" stroke="${L}" stroke-width="3"/><rect x="${f(px + 20 + i * 70)}" y="${f(py - hh)}" width="50" height="12" fill="#3A3A3A"/>`).join('') + `<path d="M${f(px + 330)} ${f(py)} v-90 q0 -16 14 -16 h0 q14 0 14 16 v90Z" fill="#3A6A4A" opacity=".85" stroke="${L}" stroke-width="3"/>`;
      // fogão a lenha (à esquerda, embaixo): ferro com chapa, porta da fornalha com brasa, chaleira e fumaça, lenha empilhada
      const fx = x + 30, fb = chao + 40;
      s += `<rect x="${f(fx)}" y="${f(fb - 260)}" width="380" height="260" fill="#2A2422" stroke="${L}" stroke-width="5"/><rect x="${f(fx - 10)}" y="${f(fb - 280)}" width="400" height="26" fill="#3A3432" stroke="${L}" stroke-width="5"/><circle cx="${f(fx + 100)}" cy="${f(fb - 280)}" r="40" fill="none" stroke="#5A5452" stroke-width="5"/><circle cx="${f(fx + 260)}" cy="${f(fb - 280)}" r="40" fill="none" stroke="#5A5452" stroke-width="5"/>`;
      s += `<rect x="${f(fx + 40)}" y="${f(fb - 200)}" width="130" height="90" rx="6" fill="#1A1412" stroke="#5A5452" stroke-width="5"/><rect x="${f(fx + 52)}" y="${f(fb - 188)}" width="106" height="66" fill="#C94A1A" opacity=".85"/>` + brilho(fx + 105, fb - 155, 200, '#FF7A2A', 0.4);
      s += `<path d="M${f(fx + 220)} ${f(fb - 280)} q0 -70 50 -70 q50 0 50 70Z" fill="#5A5A5E" stroke="${L}" stroke-width="4"/><path d="M${f(fx + 320)} ${f(fb - 320)} l30 -16" stroke="#5A5A5E" stroke-width="10" stroke-linecap="round"/><path d="M${f(fx + 250)} ${f(fb - 352)} q20 -18 40 0" stroke="${L}" stroke-width="5" fill="none"/>`;
      s += `<path d="M${f(fx + 300)} ${f(fb - 420)} V${f(y)}" stroke="#2A2422" stroke-width="40"/><g class="fumaca">${[0, 1, 2].map(i => `<circle cx="${f(fx + 360 + i * 20)}" cy="${f(fb - 380 - i * 50)}" r="${16 + i * 8}" fill="#B8B8B8" opacity=".25"/>`).join('')}</g>`;
      for (let i = 0; i < 6; i++) s += `<rect x="${f(fx + 400 + (i % 3) * 30)}" y="${f(fb - 30 - Math.floor(i / 3) * 30)}" width="120" height="28" rx="12" fill="${tom('#6A4A2A', rnd(-0.1, 0.1))}" stroke="${L}" stroke-width="3" transform="rotate(${f(rnd(-4, 4))} ${f(fx + 460)} ${f(fb - 20)})"/>`;
      // piso de tábua corrida em perspectiva
      s += `<rect x="${x}" y="${f(chao)}" width="${w}" height="${f(y + h - chao)}" fill="#3A2A1E"/>`;
      for (let k = 1; k < 9; k++) { const u = Math.pow(k / 9, 1.7), yy = lerp(chao, y + h, u); s += `<path d="M${x} ${f(yy)} H${x + w}" stroke="#2A1E14" stroke-width="${f(2 + u * 3)}"/>`; }
      for (let i = -6; i <= 6; i++) s += `<path d="M${f(x + w / 2 + i * 80)} ${f(chao)} L${f(x + w / 2 + i * 260)} ${f(y + h)}" stroke="#2A1E14" stroke-width="3" opacity=".7"/>`;
      // mesa com toalha de chita, rádio, lampião, xícara de café, coador de pano
      const mx = x + w * 0.62, mt = mesaY - 230;
      s += `<rect x="${f(mx - 260)}" y="${f(mt)}" width="520" height="30" fill="#5A3A22" stroke="${L}" stroke-width="5"/><path d="M${f(mx - 270)} ${f(mt - 4)} H${f(mx + 270)} L${f(mx + 250)} ${f(mt + 90)} Q${f(mx)} ${f(mt + 70)} ${f(mx - 250)} ${f(mt + 90)}Z" fill="#7A2E3A" stroke="${L}" stroke-width="4"/>${[...Array(10)].map(() => `<circle cx="${f(mx + rnd(-240, 240))}" cy="${f(mt + rnd(10, 70))}" r="${f(rnd(6, 12))}" fill="${pick(['#E8C24A', '#4A9A6A', '#E8E2D0'])}" opacity=".8"/>`).join('')}<rect x="${f(mx - 240)}" y="${f(mt + 90)}" width="26" height="${f(mesaY - mt - 90)}" fill="#4A2E1A" stroke="${L}" stroke-width="4"/><rect x="${f(mx + 214)}" y="${f(mt + 90)}" width="26" height="${f(mesaY - mt - 90)}" fill="#4A2E1A" stroke="${L}" stroke-width="4"/>`;
      if (radio) s += `<g id="radioMesa">${S.radio(mx + 100, mt, 0.9, { ligado: true })}</g>`;
      s += `<g transform="translate(${f(mx - 190)} ${f(mt)})"><path d="M-22 0 L-26 -44 H26 L22 0Z" fill="#E8E2D0" stroke="${L}" stroke-width="3"/><path d="M26 -34 q20 0 18 16 q-2 12 -20 10" stroke="#E8E2D0" stroke-width="7" fill="none"/><ellipse cx="0" cy="-44" rx="26" ry="6" fill="#3A2214"/><g class="vapor"><path data-ph="0" d="M-6 -56 q-8 -16 4 -30" stroke="#C8C8C8" stroke-width="3" fill="none" opacity=".5"/><path data-ph="1.5" d="M8 -58 q-8 -16 4 -30" stroke="#C8C8C8" stroke-width="3" fill="none" opacity=".5"/></g></g>`;
      s += `<g transform="translate(${f(mx - 80)} ${f(mt)})"><path d="M-30 0 H30 L20 -18 H-20Z" fill="#B8B0A0" stroke="${L}" stroke-width="3"/><path d="M-26 -18 Q0 -70 26 -18" fill="#E8E2D0" stroke="${L}" stroke-width="3"/><path d="M0 -60 V-100" stroke="#6A4A2A" stroke-width="6"/></g>`;
      s += `<g id="lampiaoMesa" data-x="${f(lampX)}" data-y="${f(mt)}"></g>`;
      if (amanhecer) s += `<path d="M${f(jx)} ${f(jy)} L${f(jx + jw)} ${f(jy)} L${f(jx + jw + 260)} ${f(chao + 200)} L${f(jx - 160)} ${f(chao + 200)}Z" fill="#F6C48A" opacity=".1" style="mix-blend-mode:screen"/>`;
      if (cobertorChao) s += `<g transform="translate(${f(jx + jw / 2)} ${f(chao + 60)})"><path d="M-200 30 Q-160 -50 -60 -30 Q20 -70 90 -24 Q190 -40 210 30 Q100 60 -200 30Z" fill="#5A2E2A" stroke="${L}" stroke-width="5"/>${[-120, -40, 40, 120].map(dx => `<path d="M${dx} -40 q10 30 -4 66" stroke="#3E1E1A" stroke-width="9" fill="none" opacity=".7"/>`).join('')}<path d="M-180 10 Q0 -10 190 14" stroke="#7A4A3A" stroke-width="7" fill="none" opacity=".55"/></g>`;
      return clip(x, y, w, h, s + neblina(x, y, w, chao - y, 0.03) + acabamento(0.26));
    };
    S.cadeira = (x, yPiso, k = 1) => `<g transform="translate(${f(x)} ${f(yPiso)}) scale(${k})"><ellipse cx="0" cy="4" rx="90" ry="10" fill="#000" opacity=".35"/><rect x="-70" y="-300" width="16" height="300" fill="#4A2E1A" stroke="${L}" stroke-width="4"/><rect x="54" y="-130" width="16" height="130" fill="#4A2E1A" stroke="${L}" stroke-width="4"/><rect x="-70" y="-140" width="140" height="22" fill="#C9A86A" stroke="${L}" stroke-width="4"/>${[...Array(6)].map((_, i) => `<path d="M${-64 + i * 24} -140 v22" stroke="#8A6A3A" stroke-width="2"/>`).join('')}<path d="M-70 -280 H-54 M-70 -220 H-54" stroke="#6A4A2A" stroke-width="6"/></g>`;
    S.cadeira.assento = 128;

    // ---------- SÍTIO no alto do morro à noite: serra em camadas, lua atrás de nuvens, araucárias, casa de roça com varanda,
    // cerca de madeira, porteira, curral, pasto descendo; a janela pode estar acesa ou apagada ----------
    S.sitio = ({ x = 0, y = 0, w = 1080, h = 1920, chao = y + h * 0.66, janelaAcesa = true, casaX = x + w * 0.5 } = {}) => {
      const [gid, gdef] = grad(['#0A0E1E', '#1E2840', '#3A4458']);
      let s = defs() + gdef + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid})"/>` + estrelas(x, y, w, (chao - y) * 0.6, 90);
      s += `<circle cx="${f(x + w * 0.8)}" cy="${f(y + 330)}" r="60" fill="#D8DCE6"/>` + brilho(x + w * 0.8, y + 330, 260, '#9AB0D8', 0.35) + `<path d="M${f(x + w * 0.55)} ${f(y + 360)} q80 -40 160 -6 q60 -40 140 10 q40 30 -20 40 h-260 q-40 -10 -20 -44Z" fill="#2A3248" opacity=".9"/>`;
      s += serra(x, w, chao - 180, 360, '#1E2638', 0.95) + serra(x, w, chao - 100, 240, '#182018', 1) + neblina(x, chao - 260, w, 160, 0.12);
      for (let i = 0; i < 6; i++) s += araucaria(x + rnd(0, w), chao - 60 - rnd(0, 60), rnd(160, 280), '#0E1410');
      // pasto do morro
      s += `<path d="M${x} ${f(chao - 30)} Q${f(x + w * 0.5)} ${f(chao - 80)} ${x + w} ${f(chao - 20)} V${y + h} H${x}Z" fill="#1E2A1C"/>`;
      for (let i = 0; i < 40; i++) { const gx = rnd(x, x + w), gy = rnd(chao, y + h); s += `<path d="M${f(gx)} ${f(gy)} l-6 -${f(10 + (gy - chao) / 40)} M${f(gx)} ${f(gy)} l3 -${f(12 + (gy - chao) / 30)} M${f(gx)} ${f(gy)} l8 -${f(9 + (gy - chao) / 40)}" stroke="#2E3E28" stroke-width="3"/>`; }
      // casa do Tião com varanda (pilares de madeira), telhado de telha, chaminé
      const cb = chao - 10, cw = 520, ch = 300, cx0 = casaX - cw / 2;
      s += `<ellipse cx="${f(casaX)}" cy="${f(cb + 10)}" rx="${cw * 0.6}" ry="24" fill="#000" opacity=".4"/>` + casaRoca(cx0, cb, cw, ch, { acesa: janelaAcesa, cor: '#8A7E66', telha: '#6A3424', varanda: true });
      // cerca de madeira e porteira à esquerda, galinheiro à direita
      for (let k = 0; k < 8; k++) { const px = x + 20 + k * 70; s += `<rect x="${f(px)}" y="${f(chao + 20 - 120)}" width="14" height="140" fill="#2A2018" stroke="${L}" stroke-width="3"/>`; }
      s += `<path d="M${x} ${f(chao - 60)} H${f(x + 520)} M${x} ${f(chao - 20)} H${f(x + 520)}" stroke="#3A2E22" stroke-width="10"/>`;
      s += `<g transform="translate(${f(x + w - 200)} ${f(chao + 30)})"><rect x="-80" y="-120" width="180" height="120" fill="#2E2A22" stroke="${L}" stroke-width="4"/><path d="M-96 -120 L10 -170 L116 -120Z" fill="#3A2A22" stroke="${L}" stroke-width="4"/>${[...Array(6)].map((_, i) => `<path d="M${-70 + i * 30} -110 V0" stroke="#1E1A14" stroke-width="4"/>`).join('')}</g>`;
      return clip(x, y, w, h, s + acabamento(0.3));
    };

    // ---------- VALE (visão do morro): pasto escuro descendo em perspectiva, estrada de terra serpenteando, árvores,
    // e lá embaixo a casa do seu Zé BRILHANDO com luzinhas e música; neblina no fundo do vale ----------
    S.vale = ({ x = 0, y = 0, w = 1080, h = 1920, festa = true, horizonte = y + h * 0.38, casa = [x + w * 0.62, y + h * 0.56], amanhecer = false } = {}) => {
      let s = defs();
      if (amanhecer) s += ceu(x, y, w, h, horizonte + 60, true);
      else { const [gid, gdef] = grad(['#0A0E1E', '#1A2238', '#2E3650']); s += gdef + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid})"/>` + estrelas(x, y, w, horizonte - y, 70); }
      s += serra(x, w, horizonte + 40, 220, amanhecer ? '#4A3E58' : '#1A2236', 0.95) + serra(x, w, horizonte + 120, 160, amanhecer ? '#2E3440' : '#141C24', 1);
      // fundo do vale (mais escuro) + pasto em primeiro plano descendo
      s += `<path d="M${x} ${f(horizonte + 100)} H${x + w} V${y + h} H${x}Z" fill="${amanhecer ? '#34422C' : '#141E18'}"/>`;
      s += `<path d="M${x} ${f(y + h * 0.78)} Q${f(x + w * 0.4)} ${f(y + h * 0.7)} ${x + w} ${f(y + h * 0.82)} V${y + h} H${x}Z" fill="${amanhecer ? '#3E4E30' : '#1E2A1C'}"/>`;
      // estrada de terra serpenteando até a casa
      s += `<path d="M${f(x - 40)} ${f(y + h * 0.6)} Q${f(x + w * 0.3)} ${f(y + h * 0.58)} ${f(casa[0] - 80)} ${f(casa[1] + 20)}" stroke="#4A4032" stroke-width="26" fill="none" opacity=".9"/><path d="M${f(casa[0] + 60)} ${f(casa[1] + 22)} Q${f(x + w * 0.9)} ${f(casa[1] + 40)} ${f(x + w + 40)} ${f(casa[1] + 30)}" stroke="#4A4032" stroke-width="22" fill="none" opacity=".9"/>`;
      // cercas em perspectiva no pasto
      for (let k = 0; k < 10; k++) { const u = k / 10, px = lerp(x + w * 0.15, x + w * 0.55, u), py = lerp(y + h * 0.95, y + h * 0.62, u), hh = lerp(110, 16, u); s += `<path d="M${f(px)} ${f(py)} v${f(-hh)}" stroke="#2A2218" stroke-width="${f(lerp(10, 2, u))}"/>`; }
      s += `<path d="M${f(x + w * 0.15)} ${f(y + h * 0.95 - 80)} L${f(x + w * 0.55)} ${f(y + h * 0.62 - 12)}" stroke="#3A3026" stroke-width="3"/>`;
      // árvores e araucárias nas encostas
      for (let i = 0; i < 9; i++) s += araucaria(x + rnd(0, w), horizonte + 120 + rnd(0, 80), rnd(60, 130), '#0C120E');
      // a casa do seu Zé (pequena, longe) com festa
      const [hx, hy] = casa;
      s += casaRoca(hx - 70, hy, 140, 90, { acesa: festa, festa, cor: '#9A8E74', telha: '#6A3424', fumaca: festa, portaAberta: amanhecer });
      if (festa) s += brilho(hx, hy - 40, 260, '#FFD27A', 0.5) + lampadas(hx - 110, hy - 70, hx + 110, hy - 70, 9, 10) + `<g class="notas">${['♪', '♫', '♪'].map((n, i) => `<text x="${f(hx - 60 + i * 60)}" y="${f(hy - 140 - i * 16)}" font-size="${40 - i * 4}" fill="#FFE08A" font-family="'DejaVu Sans', sans-serif">${n}</text>`).join('')}</g>`;
      s += neblina(x, horizonte + 90, w, amanhecer ? 300 : 140, amanhecer ? 0.32 : 0.18);
      return clip(x, y, w, h, s + acabamento(0.3));
    };

    // ---------- FESTA na casa do seu Zé (de perto): varanda iluminada, bandeirinhas, varal de lâmpadas, balões,
    // mesa com bolo e refrigerante, caixa de som, carro estacionado; noite em volta ----------
    S.festa = ({ x = 0, y = 0, w = 1080, h = 1920, chao = y + h * 0.66, abandonada = false } = {}) => {
      let s = defs();
      if (abandonada) s += ceu(x, y, w, h, chao - 300, true);
      else { const [gid, gdef] = grad(['#0A0E1E', '#1A2238', '#2A2E48']); s += gdef + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid})"/>` + estrelas(x, y, w, (chao - y) * 0.4, 50); }
      s += serra(x, w, chao - 420, 160, abandonada ? '#3A3448' : '#141C24', 1);
      s += casaRoca(x + 60, chao, w - 260, 560, { acesa: !abandonada, festa: !abandonada, cor: '#B8AE94', telha: '#7A3A26', barra: '#5A3A6A', varanda: false, fumaca: !abandonada, portaAberta: abandonada });
      if (!abandonada) s += brilho(x + w / 2, chao - 220, 700, '#FFD27A', 0.45);
      if (abandonada) {   // de manhã: bandeirinha arrebentada pendurada, lâmpadas apagadas, balões murchos no chão
        s += bandeirinhas(x + 40, chao - 600, x + w * 0.5, chao - 380, 8, 40) + bandeirinhas(x + w - 40, chao - 600, x + w * 0.62, chao - 300, 6, 20);
        s += `<path d="M${x + 60} ${f(chao - 520)} Q${f(x + w / 2)} ${f(chao - 420)} ${x + w - 60} ${f(chao - 520)}" stroke="#2A2A2A" stroke-width="2" fill="none"/>` + [...Array(12)].map((_, i) => { const u = (i + 1) / 13, px = lerp(x + 60, x + w - 60, u), py = chao - 520 + 100 * 4 * u * (1 - u); return `<circle cx="${f(px)}" cy="${f(py + 8)}" r="6" fill="#6A6A60"/>`; }).join('');
        [[x + 150, chao + 70, '#E84A5A'], [x + w - 240, chao + 110, '#4AA0E8']].forEach(([bx, by, c]) => { s += `<path d="M${f(bx - 30)} ${f(by)} q10 -34 34 -26 q24 4 26 26Z" fill="${c}" stroke="${L}" stroke-width="3" opacity=".9"/>`; });
      } else {
        s += bandeirinhas(x + 40, chao - 600, x + w - 40, chao - 600, 16, 60) + lampadas(x + 60, chao - 520, x + w - 60, chao - 520, 14, 50);
        [[x + 120, chao - 380, '#E84A5A'], [x + 170, chao - 420, '#F2C23A'], [x + w - 150, chao - 400, '#4AA0E8'], [x + w - 200, chao - 360, '#C84AFF']].forEach(([bx, by, c]) => { s += `<path d="M${f(bx)} ${f(by + 50)} q-10 60 6 120" stroke="#E8E2D0" stroke-width="2" fill="none"/><ellipse cx="${f(bx)}" cy="${f(by)}" rx="34" ry="44" fill="${c}" stroke="${L}" stroke-width="3"/><ellipse cx="${f(bx - 10)}" cy="${f(by - 14)}" rx="8" ry="12" fill="#fff" opacity=".4"/>`; });
      }
      s += `<rect x="${x}" y="${f(chao)}" width="${w}" height="${f(y + h - chao)}" fill="${abandonada ? '#4A3E32' : '#2A2420'}"/><rect x="${x}" y="${f(chao)}" width="${w}" height="${f(y + h - chao)}" fill="#FFD27A" opacity=".08"/>`;
      // mesa do bolo
      const mx = x + w * 0.3, mt = chao + 40;
      s += `<rect x="${f(mx - 150)}" y="${f(mt - 140)}" width="300" height="18" fill="#E8E2D0" stroke="${L}" stroke-width="4"/><path d="M${f(mx - 150)} ${f(mt - 122)} H${f(mx + 150)} L${f(mx + 140)} ${f(mt)} H${f(mx - 140)}Z" fill="#E8E2D0" opacity=".9" stroke="${L}" stroke-width="3"/>`;
      s += `<g transform="translate(${f(mx)} ${f(mt - 140)})"><rect x="-70" y="-90" width="140" height="90" rx="10" fill="#F2B8C8" stroke="${L}" stroke-width="4"/><path d="M-70 -60 q20 14 35 0 q18 14 35 0 q18 14 35 0 q18 14 35 0" stroke="#fff" stroke-width="6" fill="none"/><rect x="-6" y="-130" width="12" height="40" fill="#F2E26A" stroke="${L}" stroke-width="2"/><path d="M0 -136 q-8 -12 0 -24 q8 12 0 24" fill="#FF9A2A"/></g>`;
      s += `<rect x="${f(mx + 80)}" y="${f(mt - 220)}" width="34" height="80" rx="8" fill="#5A2214" opacity=".9" stroke="${L}" stroke-width="3"/><rect x="${f(mx - 120)}" y="${f(mt - 186)}" width="26" height="46" fill="#E84A5A" stroke="${L}" stroke-width="2"/>`;
      if (abandonada) {   // bolo pisado, copos e cadeiras caídas, a caixa de som tombada e muda, pegadas de lama
        s += `<g transform="translate(${f(x + w * 0.78)} ${f(chao + 60)}) rotate(-90)">${S.caixaSom(0, 0, 0.9)}</g>`;
        s += `<g transform="translate(${f(x + w * 0.55)} ${f(chao + 150)}) rotate(78)">${S.cadeira(0, 0, 0.8)}</g><g transform="translate(${f(x + w * 0.12)} ${f(chao + 230)}) rotate(-84)">${S.cadeira(0, 0, 0.8)}</g>`;
        [[0.4, 120], [0.47, 190], [0.36, 260], [0.62, 230], [0.7, 300]].forEach(([u, dy]) => { s += `<ellipse cx="${f(x + w * u)}" cy="${f(chao + dy)}" rx="22" ry="9" fill="#2A1E14" opacity=".75"/>`; });
        [[0.24, 200], [0.86, 250]].forEach(([u, dy]) => { s += `<path d="M${f(x + w * u - 14)} ${f(chao + dy)} l28 -6 l-4 -24 l-20 4Z" fill="#E8E2D0" stroke="${L}" stroke-width="3"/>`; });
        return clip(x, y, w, h, s + neblina(x, chao - 200, w, 300, 0.22) + acabamento(0.26));
      }
      s += S.caixaSom(x + w * 0.78, chao + 30, 0.9) + `<g class="notas">${['♪', '♫', '♪', '♫'].map((n, i) => `<text x="${f(x + w * 0.72 + i * 40)}" y="${f(chao - 260 - i * 30)}" font-size="${54 - i * 4}" fill="#FFE08A" font-family="'DejaVu Sans', sans-serif">${n}</text>`).join('')}</g>`;
      return clip(x, y, w, h, s + acabamento(0.26));
    };

    // ---------- ESTRADA de terra ao luar: barrancos, cerca de arame farpado com mourões, capim alto, neblina baixa ----------
    S.estrada = ({ x = 0, y = 0, w = 1080, h = 1920, chao = y + h * 0.62, fuga = [x + w * 0.5, y + h * 0.5] } = {}) => {
      const [gid, gdef] = grad(['#0A0E1E', '#1A2238', '#2A3248']);
      let s = defs() + gdef + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid})"/>` + estrelas(x, y, w, fuga[1] - y - 100, 60);
      s += `<circle cx="${f(x + w * 0.22)}" cy="${f(y + 300)}" r="50" fill="#D8DCE6"/>` + brilho(x + w * 0.22, y + 300, 240, '#9AB0D8', 0.3);
      s += serra(x, w, fuga[1] + 10, 200, '#161E2C', 1);
      s += `<path d="M${x} ${f(fuga[1])} H${x + w} V${y + h} H${x}Z" fill="#18221A"/>`;
      s += `<path d="M${f(fuga[0] - 30)} ${f(fuga[1])} H${f(fuga[0] + 30)} L${f(x + w * 0.9)} ${y + h} H${f(x + w * 0.1)}Z" fill="#3A3428"/>`;
      for (let i = 0; i < 40; i++) { const yy = rnd(fuga[1], y + h), u = (yy - fuga[1]) / (y + h - fuga[1]); s += `<ellipse cx="${f(lerp(fuga[0] - 30, x + w * 0.1, u) + rnd(0, lerp(60, w * 0.8, u)))}" cy="${f(yy)}" rx="${f(4 + u * 14)}" ry="${f(2 + u * 4)}" fill="${pick(['#2A2620', '#4A4234'])}"/>`; }
      s += `<path d="M${f(fuga[0])} ${f(fuga[1])} L${f(fuga[0] - 40)} ${y + h}" stroke="#4A4234" stroke-width="30" opacity=".4"/>`;
      for (let k = 0; k < 9; k++) { const u = Math.pow(k / 9, 1.6); [-1, 1].forEach(sd => { const px = lerp(x + w / 2 + sd * w * 0.62, fuga[0] + sd * 50, u), pb = lerp(y + h * 0.98, fuga[1], u), hh = lerp(220, 14, u); s += `<path d="M${f(px)} ${f(pb)} v${f(-hh)}" stroke="#2A2218" stroke-width="${f(lerp(14, 2, u))}"/>`; }); }
      [-1, 1].forEach(sd => { [0.45, 0.75].forEach(v => { s += `<path d="M${f(x + w / 2 + sd * w * 0.62)} ${f(y + h * 0.98 - 220 * v)} L${f(fuga[0] + sd * 50)} ${f(fuga[1] - 14 * v)}" stroke="#5A5A5A" stroke-width="2" opacity=".7"/>`; }); });
      for (let i = 0; i < 50; i++) { const gx = rnd(x, x + w), gy = rnd(fuga[1] + 40, y + h); if (Math.abs(gx - (x + w / 2)) < (gy - fuga[1]) * 0.5) continue; s += `<path d="M${f(gx)} ${f(gy)} q-4 -${f(20 + (gy - fuga[1]) / 20)} -10 -${f(30 + (gy - fuga[1]) / 14)} M${f(gx)} ${f(gy)} q4 -${f(20 + (gy - fuga[1]) / 20)} 8 -${f(26 + (gy - fuga[1]) / 14)}" stroke="#24321E" stroke-width="3" fill="none"/>`; }
      s += neblina(x, fuga[1] + 20, w, 260, 0.2);
      return clip(x, y, w, h, s + acabamento(0.3));
    };

    // ---------- MORRO visto de baixo (do vale): encosta escura, a casa apagada lá em cima e UMA luzinha (a lanterna) ----------
    S.morro = ({ x = 0, y = 0, w = 1080, h = 1920, luz = [x + w * 0.6, y + h * 0.36] } = {}) => {
      const [gid, gdef] = grad(['#080B16', '#141A2E', '#1E2438']);
      let s = defs() + gdef + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid})"/>` + estrelas(x, y, w, h * 0.3, 80);
      s += `<path d="M${x} ${f(y + h * 0.5)} Q${f(x + w * 0.3)} ${f(y + h * 0.36)} ${f(x + w * 0.62)} ${f(y + h * 0.34)} Q${f(x + w * 0.85)} ${f(y + h * 0.35)} ${x + w} ${f(y + h * 0.42)} V${y + h} H${x}Z" fill="#0E1410"/>`;
      s += casaRoca(luz[0] - 120, y + h * 0.345, 110, 60, { acesa: false, cor: '#1A1A18', telha: '#120E0C', barra: '#101014', chamine: false });
      for (let i = 0; i < 6; i++) s += araucaria(x + rnd(0, w), y + h * rnd(0.36, 0.46), rnd(80, 150), '#080C0A');
      s += `<g class="luzLanterna">${brilho(luz[0], luz[1], 90, '#FFF2C0', 0.9)}<circle cx="${f(luz[0])}" cy="${f(luz[1])}" r="5" fill="#FFFBE6"/></g>`;
      s += neblina(x, y + h * 0.5, w, 300, 0.16);
      return clip(x, y, w, h, s + acabamento(0.32));
    };
    return S;
  }
  global.Sitio = Sitio;
})(typeof window !== 'undefined' ? window : globalThis);
