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
    const casaRoca = (x, base, w, h, { acesa = false, festa = false, cor = '#6A5A44', telha = '#5A2E22' } = {}) => {   // casa de roça: alvenaria caiada, telhado de telha, varanda
      let s = `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h)}" fill="${cor}" stroke="${L}" stroke-width="5"/>`;
      s += `<path d="M${f(x - 30)} ${f(base - h)} L${f(x + w / 2)} ${f(base - h - h * 0.45)} L${f(x + w + 30)} ${f(base - h)}Z" fill="${telha}" stroke="${L}" stroke-width="5"/>`;
      for (let k = 0; k < 6; k++) s += `<path d="M${f(x - 30 + k * (w + 60) / 6)} ${f(base - h + 2)} L${f(x + w / 2)} ${f(base - h - h * 0.45 + 4)}" stroke="${tom(telha, -0.3)}" stroke-width="2" opacity=".6"/>`;
      const jl = acesa ? (festa ? '#FFE6A0' : '#FFC870') : '#141820';
      [[0.12, 0.3], [0.62, 0.3]].forEach(([u, v]) => { s += `<rect x="${f(x + w * u)}" y="${f(base - h * (1 - v))}" width="${f(w * 0.24)}" height="${f(h * 0.32)}" fill="${jl}" stroke="${L}" stroke-width="4"/><path d="M${f(x + w * u + w * 0.12)} ${f(base - h * (1 - v))} v${f(h * 0.32)}" stroke="${L}" stroke-width="3"/>`; if (acesa) s += brilho(x + w * (u + 0.12), base - h * (1 - v) + h * 0.16, w * 0.5, jl, 0.5); });
      s += `<rect x="${f(x + w * 0.42)}" y="${f(base - h * 0.62)}" width="${f(w * 0.16)}" height="${f(h * 0.62)}" fill="${acesa ? '#3A2A1A' : '#1A1410'}" stroke="${L}" stroke-width="4"/>`;
      return s; };

    // ================= CENAS =================
    // ---------- COZINHA do Tião: tábuas, fogão a lenha com chaleira e fumaça, mesa com rádio + lampião + xícara + coador,
    // janela (aberta para a noite ou coberta com cobertor), relógio, calendário, espingarda, chapéu no prego, prateleira com potes ----------
    S.cozinha = ({ x = 0, y = 0, w = 1080, h = 1920, chao = y + h * 0.66, lampiao = true, coberta = false, radio = true, lampX = 640, mesaY = chao + 80, janelaY = 0.2 } = {}) => {
      let s = defs() + tabuas(x, y, w, chao - y, '#4A3A2A', true, 90);
      s += `<rect x="${x}" y="${y}" width="${w}" height="70" fill="#2A2018"/><path d="M${x} ${y + 70} H${x + w}" stroke="${L}" stroke-width="6"/>` + [0.2, 0.55, 0.85].map(u => `<rect x="${f(x + w * u - 20)}" y="${y}" width="40" height="90" fill="#3A2A1C" stroke="${L}" stroke-width="4"/>`).join('');
      // janela (com a noite lá fora) — ou coberta com um cobertor xadrez preso com pregos
      const jx = x + w * 0.56, jy = y + (chao - y) * janelaY, jw = 300, jh = 260;
      s += `<rect x="${f(jx - 16)}" y="${f(jy - 16)}" width="${jw + 32}" height="${jh + 32}" fill="#3A2A1C" stroke="${L}" stroke-width="5"/><rect x="${f(jx)}" y="${f(jy)}" width="${jw}" height="${jh}" fill="#0E1424"/>` + estrelas(jx, jy, jw, jh * 0.6, 14) + `<path d="M${f(jx)} ${f(jy + jh * 0.75)} Q${f(jx + jw * 0.3)} ${f(jy + jh * 0.55)} ${f(jx + jw * 0.6)} ${f(jy + jh * 0.7)} T${f(jx + jw)} ${f(jy + jh * 0.62)} V${f(jy + jh)} H${f(jx)}Z" fill="#141C18"/><path d="M${f(jx + jw / 2)} ${f(jy)} V${f(jy + jh)} M${f(jx)} ${f(jy + jh / 2)} H${f(jx + jw)}" stroke="#3A2A1C" stroke-width="10"/>`;
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
      s += `<g transform="translate(${f(mx - 190)} ${f(mt)})"><path d="M-22 0 L-26 -44 H26 L22 0Z" fill="#E8E2D0" stroke="${L}" stroke-width="3"/><path d="M26 -34 q20 0 18 16 q-2 12 -20 10" stroke="#E8E2D0" stroke-width="7" fill="none"/><ellipse cx="0" cy="-44" rx="26" ry="6" fill="#3A2214"/><path d="M-6 -56 q-8 -16 4 -30 M8 -58 q-8 -16 4 -30" stroke="#C8C8C8" stroke-width="3" fill="none" opacity=".5"/></g>`;
      s += `<g transform="translate(${f(mx - 80)} ${f(mt)})"><path d="M-30 0 H30 L20 -18 H-20Z" fill="#B8B0A0" stroke="${L}" stroke-width="3"/><path d="M-26 -18 Q0 -70 26 -18" fill="#E8E2D0" stroke="${L}" stroke-width="3"/><path d="M0 -60 V-100" stroke="#6A4A2A" stroke-width="6"/></g>`;
      s += `<g id="lampiaoMesa" data-x="${f(lampX)}" data-y="${f(mt)}"></g>`;
      // cadeira de palhinha (para sentar perto da mesa)
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
      s += `<ellipse cx="${f(casaX)}" cy="${f(cb + 10)}" rx="${cw * 0.6}" ry="24" fill="#000" opacity=".4"/>` + casaRoca(cx0, cb, cw, ch, { acesa: janelaAcesa, cor: '#5A5244', telha: '#4A2A22' });
      s += `<rect x="${f(cx0 + cw - 90)}" y="${f(cb - ch - 170)}" width="40" height="110" fill="#3A2A22" stroke="${L}" stroke-width="4"/>`;
      s += `<path d="M${f(cx0 - 40)} ${f(cb - ch * 0.55)} H${f(cx0 + cw + 40)} L${f(cx0 + cw + 70)} ${f(cb - ch * 0.42)} H${f(cx0 - 70)}Z" fill="#3A2A1E" stroke="${L}" stroke-width="4"/>` + [0, 0.33, 0.66, 1].map(u => `<rect x="${f(cx0 - 50 + u * (cw + 100))}" y="${f(cb - ch * 0.42)}" width="16" height="${f(ch * 0.42)}" fill="#3A2A1E" stroke="${L}" stroke-width="3"/>`).join('');
      s += `<rect x="${f(cx0 - 60)}" y="${f(cb)}" width="${cw + 120}" height="16" fill="#3A3430" stroke="${L}" stroke-width="3"/>`;
      // cerca de madeira e porteira à esquerda, galinheiro à direita
      for (let k = 0; k < 8; k++) { const px = x + 20 + k * 70; s += `<rect x="${f(px)}" y="${f(chao + 20 - 120)}" width="14" height="140" fill="#2A2018" stroke="${L}" stroke-width="3"/>`; }
      s += `<path d="M${x} ${f(chao - 60)} H${f(x + 520)} M${x} ${f(chao - 20)} H${f(x + 520)}" stroke="#3A2E22" stroke-width="10"/>`;
      s += `<g transform="translate(${f(x + w - 200)} ${f(chao + 30)})"><rect x="-80" y="-120" width="180" height="120" fill="#2E2A22" stroke="${L}" stroke-width="4"/><path d="M-96 -120 L10 -170 L116 -120Z" fill="#3A2A22" stroke="${L}" stroke-width="4"/>${[...Array(6)].map((_, i) => `<path d="M${-70 + i * 30} -110 V0" stroke="#1E1A14" stroke-width="4"/>`).join('')}</g>`;
      return clip(x, y, w, h, s + acabamento(0.3));
    };

    // ---------- VALE (visão do morro): pasto escuro descendo em perspectiva, estrada de terra serpenteando, árvores,
    // e lá embaixo a casa do seu Zé BRILHANDO com luzinhas e música; neblina no fundo do vale ----------
    S.vale = ({ x = 0, y = 0, w = 1080, h = 1920, festa = true, horizonte = y + h * 0.38, casa = [x + w * 0.62, y + h * 0.56] } = {}) => {
      const [gid, gdef] = grad(['#0A0E1E', '#1A2238', '#2E3650']);
      let s = defs() + gdef + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid})"/>` + estrelas(x, y, w, horizonte - y, 70);
      s += serra(x, w, horizonte + 40, 220, '#1A2236', 0.95) + serra(x, w, horizonte + 120, 160, '#141C24', 1);
      // fundo do vale (mais escuro) + pasto em primeiro plano descendo
      s += `<path d="M${x} ${f(horizonte + 100)} H${x + w} V${y + h} H${x}Z" fill="#141E18"/>`;
      s += `<path d="M${x} ${f(y + h * 0.78)} Q${f(x + w * 0.4)} ${f(y + h * 0.7)} ${x + w} ${f(y + h * 0.82)} V${y + h} H${x}Z" fill="#1E2A1C"/>`;
      // estrada de terra serpenteando até a casa
      s += `<path d="M${f(x - 40)} ${f(y + h * 0.6)} Q${f(x + w * 0.3)} ${f(y + h * 0.58)} ${f(casa[0] - 80)} ${f(casa[1] + 20)}" stroke="#4A4032" stroke-width="26" fill="none" opacity=".9"/><path d="M${f(casa[0] + 60)} ${f(casa[1] + 22)} Q${f(x + w * 0.9)} ${f(casa[1] + 40)} ${f(x + w + 40)} ${f(casa[1] + 30)}" stroke="#4A4032" stroke-width="22" fill="none" opacity=".9"/>`;
      // cercas em perspectiva no pasto
      for (let k = 0; k < 10; k++) { const u = k / 10, px = lerp(x + w * 0.15, x + w * 0.55, u), py = lerp(y + h * 0.95, y + h * 0.62, u), hh = lerp(110, 16, u); s += `<path d="M${f(px)} ${f(py)} v${f(-hh)}" stroke="#2A2218" stroke-width="${f(lerp(10, 2, u))}"/>`; }
      s += `<path d="M${f(x + w * 0.15)} ${f(y + h * 0.95 - 80)} L${f(x + w * 0.55)} ${f(y + h * 0.62 - 12)}" stroke="#3A3026" stroke-width="3"/>`;
      // árvores e araucárias nas encostas
      for (let i = 0; i < 9; i++) s += araucaria(x + rnd(0, w), horizonte + 120 + rnd(0, 80), rnd(60, 130), '#0C120E');
      // a casa do seu Zé (pequena, longe) com festa
      const [hx, hy] = casa;
      s += casaRoca(hx - 70, hy, 140, 90, { acesa: true, festa, cor: '#7A6E5A', telha: '#5A2E22' });
      if (festa) s += brilho(hx, hy - 40, 260, '#FFD27A', 0.5) + lampadas(hx - 110, hy - 70, hx + 110, hy - 70, 9, 10) + `<g class="notas">${['♪', '♫', '♪'].map((n, i) => `<text x="${f(hx - 60 + i * 60)}" y="${f(hy - 140 - i * 16)}" font-size="${40 - i * 4}" fill="#FFE08A" font-family="'DejaVu Sans', sans-serif">${n}</text>`).join('')}</g>`;
      s += neblina(x, horizonte + 90, w, 140, 0.18);
      return clip(x, y, w, h, s + acabamento(0.3));
    };

    // ---------- FESTA na casa do seu Zé (de perto): varanda iluminada, bandeirinhas, varal de lâmpadas, balões,
    // mesa com bolo e refrigerante, caixa de som, carro estacionado; noite em volta ----------
    S.festa = ({ x = 0, y = 0, w = 1080, h = 1920, chao = y + h * 0.66 } = {}) => {
      const [gid, gdef] = grad(['#0A0E1E', '#1A2238', '#2A2E48']);
      let s = defs() + gdef + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid})"/>` + estrelas(x, y, w, (chao - y) * 0.4, 50);
      s += serra(x, w, chao - 420, 160, '#141C24', 1);
      s += casaRoca(x + 90, chao, w - 180, 560, { acesa: true, festa: true, cor: '#8A7E66', telha: '#5A2E22' });
      s += brilho(x + w / 2, chao - 220, 700, '#FFD27A', 0.45);
      s += bandeirinhas(x + 40, chao - 600, x + w - 40, chao - 600, 16, 60) + lampadas(x + 60, chao - 520, x + w - 60, chao - 520, 14, 50);
      [[x + 120, chao - 380, '#E84A5A'], [x + 170, chao - 420, '#F2C23A'], [x + w - 150, chao - 400, '#4AA0E8'], [x + w - 200, chao - 360, '#C84AFF']].forEach(([bx, by, c]) => { s += `<path d="M${f(bx)} ${f(by + 50)} q-10 60 6 120" stroke="#E8E2D0" stroke-width="2" fill="none"/><ellipse cx="${f(bx)}" cy="${f(by)}" rx="34" ry="44" fill="${c}" stroke="${L}" stroke-width="3"/><ellipse cx="${f(bx - 10)}" cy="${f(by - 14)}" rx="8" ry="12" fill="#fff" opacity=".4"/>`; });
      s += `<rect x="${x}" y="${f(chao)}" width="${w}" height="${f(y + h - chao)}" fill="#2A2420"/><rect x="${x}" y="${f(chao)}" width="${w}" height="${f(y + h - chao)}" fill="#FFD27A" opacity=".08"/>`;
      // mesa do bolo
      const mx = x + w * 0.3, mt = chao + 40;
      s += `<rect x="${f(mx - 150)}" y="${f(mt - 140)}" width="300" height="18" fill="#E8E2D0" stroke="${L}" stroke-width="4"/><path d="M${f(mx - 150)} ${f(mt - 122)} H${f(mx + 150)} L${f(mx + 140)} ${f(mt)} H${f(mx - 140)}Z" fill="#E8E2D0" opacity=".9" stroke="${L}" stroke-width="3"/>`;
      s += `<g transform="translate(${f(mx)} ${f(mt - 140)})"><rect x="-70" y="-90" width="140" height="90" rx="10" fill="#F2B8C8" stroke="${L}" stroke-width="4"/><path d="M-70 -60 q20 14 35 0 q18 14 35 0 q18 14 35 0 q18 14 35 0" stroke="#fff" stroke-width="6" fill="none"/><rect x="-6" y="-130" width="12" height="40" fill="#F2E26A" stroke="${L}" stroke-width="2"/><path d="M0 -136 q-8 -12 0 -24 q8 12 0 24" fill="#FF9A2A"/></g>`;
      s += `<rect x="${f(mx + 80)}" y="${f(mt - 220)}" width="34" height="80" rx="8" fill="#5A2214" opacity=".9" stroke="${L}" stroke-width="3"/><rect x="${f(mx - 120)}" y="${f(mt - 186)}" width="26" height="46" fill="#E84A5A" stroke="${L}" stroke-width="2"/>`;
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
      s += casaRoca(luz[0] - 120, y + h * 0.345, 110, 60, { acesa: false, cor: '#1A1A18', telha: '#120E0C' });
      for (let i = 0; i < 6; i++) s += araucaria(x + rnd(0, w), y + h * rnd(0.36, 0.46), rnd(80, 150), '#080C0A');
      s += `<g class="luzLanterna">${brilho(luz[0], luz[1], 90, '#FFF2C0', 0.9)}<circle cx="${f(luz[0])}" cy="${f(luz[1])}" r="5" fill="#FFFBE6"/></g>`;
      s += neblina(x, y + h * 0.5, w, 300, 0.16);
      return clip(x, y, w, h, s + acabamento(0.32));
    };
    return S;
  }
  global.Sitio = Sitio;
})(typeof window !== 'undefined' ? window : globalThis);
