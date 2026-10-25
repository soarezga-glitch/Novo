/*
  cidade-zumbi.js — a CIDADE do apocalipse com cara de mundo real em desenho (skill cenario-ilustrado): nada de "casinha de papel".
  Prédios do centro de cidade brasileira com reboco gasto, janelas variadas (quebradas, tapadas com tábua, com cortina, com ar-
  condicionado), sacadas com grade, térreo com lojas de porta de enrolar e letreiros, caixa d'água azul no telhado, antenas,
  fios emaranhados nos postes, pichação, marcas de fogo, lixo e papel na rua, carros batidos e ônibus.
    const CZ = CidadeZumbi(Cenario({...}));
    CZ.avenida({ hz, fuga })          vista EM PERSPECTIVA (ponto de fuga no meio): para a moto vir de frente / ir embora
    CZ.avenidaLado({ chao })          vista DE LADO (fachadas no fundo, calçada, asfalto): para a moto passar de lado
    CZ.predio(x, base, w, h, opts)    um prédio detalhado (de frente)
    CZ.onibus(x, base, k, { dir, quebrado })   ônibus urbano de lado
    CZ.carroFrente(x, base, k, opts)  carro visto de frente/de trás (para a avenida em perspectiva)
    CZ.ponte({ })                     a ponte de saída da cidade, tomada (os vultos vão por cima, como atores)
*/
(function (global) {
  function CidadeZumbi(C) {
    const tom = C.tom, rnd = C.rnd, pick = C.pick;
    const L = '#0E0E14', f = v => Math.round(v * 10) / 10, lerp = (a, b, u) => a + (b - a) * u;
    const uid = p => `${p}${Math.floor(rnd(1e5, 1e6))}`;
    const clip = (x, y, w, h, corpo) => { const id = uid('cz'); return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${corpo}</g>`; };
    const grad = cores => { const id = uid('g'); return [id, `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${cores.map((c, i) => `<stop offset="${(i / (cores.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`]; };
    const ceu = (x, y, w, h) => { const [id, d] = grad(['#2A2A44', '#7A5A6A', '#D88A62', '#E8A878']); return d + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`; };
    const fumaca = (x, y, k = 1) => `<g class="fumacaCidade" data-x="${f(x)}" data-y="${f(y)}">${[0, 1, 2, 3, 4].map(i => `<circle cx="${f(x + Math.sin(i * 1.7) * 30 * k)}" cy="${f(y - i * 70 * k)}" r="${f((30 + i * 22) * k)}" fill="#2A2628" opacity="${(0.55 - i * 0.09).toFixed(2)}"/>`).join('')}</g>`;
    const LETREIROS = ['FARMÁCIA', 'PADARIA', 'BAR DO ZÉ', 'LOJAS BRASIL', 'ÓTICA', 'SAPATARIA', 'AÇOUGUE', 'LOTÉRICA', 'MERCADINHO', 'CELULARES'];
    const PICHO = ['FIM', 'SOS', 'FUJAM', 'NÃO ENTRE', '3 VIVOS'];

    // ---------- PRÉDIO detalhado (de frente) ----------
    let CZ_ruinas, CZ_rodovia, CZ_predio, CZ_onibus, CZ_carroFrente, CZ_carroLado, CZ_avenida, CZ_avenidaLado, CZ_ponte, CZ_ponteFrente, CZ_proj;
    CZ_predio = (x, base, w, h, { cor = pick(['#B8A88A', '#9AA4A8', '#C8B898', '#A88A7A', '#8A9A88']), andares = Math.max(2, Math.round(h / 150)), loja = true, letreiro = pick(LETREIROS), picho = rnd(0, 1) < 0.5, sombra = 0 } = {}) => {
      const top = base - h, hand = (h - (loja ? 170 : 0)) / andares;
      let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" fill="${cor}" stroke="${L}" stroke-width="4"/>`;
      for (let i = 0; i < 10; i++) s += `<ellipse cx="${f(x + rnd(0, w))}" cy="${f(top + rnd(0, h))}" rx="${f(rnd(20, 60))}" ry="${f(rnd(10, 40))}" fill="${tom(cor, rnd(-0.18, 0.06))}" opacity=".55"/>`;
      s += `<path d="M${f(x + rnd(0.2, 0.8) * w)} ${f(top + 10)} l-8 40 l12 30 l-6 50" stroke="${tom(cor, -0.4)}" stroke-width="2.5" fill="none"/>`;
      // platibanda, caixa d'água azul e antena
      s += `<rect x="${f(x - 6)}" y="${f(top - 16)}" width="${f(w + 12)}" height="20" fill="${tom(cor, -0.12)}" stroke="${L}" stroke-width="4"/>`;
      if (w > 140) s += `<path d="M${f(x + w * 0.62)} ${f(top - 16)} l10 -46 h50 l10 46Z" fill="#3A6AA8" stroke="${L}" stroke-width="4"/><ellipse cx="${f(x + w * 0.62 + 35)}" cy="${f(top - 62)}" rx="25" ry="7" fill="#2E5A98" stroke="${L}" stroke-width="3"/>`;
      s += `<path d="M${f(x + w * 0.22)} ${f(top - 16)} V${f(top - 90)} M${f(x + w * 0.22 - 22)} ${f(top - 76)} h44 M${f(x + w * 0.22 - 14)} ${f(top - 62)} h28" stroke="#3A3A40" stroke-width="3"/>`;
      // andares: janelas variadas, sacada com grade, ar-condicionado, varal
      const nj = Math.max(2, Math.round(w / 110));
      for (let a = 0; a < andares; a++) {
        const yy = top + 20 + a * hand, jh = hand * 0.55, jw = (w - 30) / nj - 22;
        for (let j = 0; j < nj; j++) { const jx = x + 22 + j * ((w - 30) / nj), tipo = rnd(0, 1);
          s += `<rect x="${f(jx - 5)}" y="${f(yy - 5)}" width="${f(jw + 10)}" height="${f(jh + 10)}" fill="${tom(cor, -0.25)}"/>`;
          if (tipo < 0.25) s += `<rect x="${f(jx)}" y="${f(yy)}" width="${f(jw)}" height="${f(jh)}" fill="#141418"/><path d="M${f(jx + 4)} ${f(yy + 4)} l${f(jw * 0.4)} ${f(jh * 0.35)} l${f(-jw * 0.1)} ${f(jh * 0.3)} M${f(jx + jw - 4)} ${f(yy + 6)} l${f(-jw * 0.3)} ${f(jh * 0.4)}" stroke="#7A8A9A" stroke-width="3"/>`;   // quebrada
          else if (tipo < 0.4) s += `<rect x="${f(jx)}" y="${f(yy)}" width="${f(jw)}" height="${f(jh)}" fill="#1A1A1E"/>${[0.2, 0.5, 0.8].map(u => `<rect x="${f(jx - 4)}" y="${f(yy + jh * u - 8)}" width="${f(jw + 8)}" height="16" fill="#8A6A44" stroke="${L}" stroke-width="2" transform="rotate(${f(rnd(-6, 6))} ${f(jx + jw / 2)} ${f(yy + jh * u)})"/>`).join('')}`;   // tapada com tábua
          else { s += `<rect x="${f(jx)}" y="${f(yy)}" width="${f(jw)}" height="${f(jh)}" fill="${pick(['#2A3240', '#3A4250', '#1E2430'])}"/><path d="M${f(jx + jw / 2)} ${f(yy)} V${f(yy + jh)} M${f(jx)} ${f(yy + jh * 0.45)} H${f(jx + jw)}" stroke="${tom(cor, -0.3)}" stroke-width="4"/><path d="M${f(jx + 4)} ${f(yy + 4)} l${f(jw * 0.3)} 0" stroke="#AABBCC" stroke-width="3" opacity=".5"/>`;
            if (rnd(0, 1) < 0.4) s += `<path d="M${f(jx)} ${f(yy)} q${f(jw * 0.3)} ${f(jh * 0.5)} 0 ${f(jh)} Z" fill="${pick(['#8A3A3A', '#C8A84A', '#5A7A9A'])}"/>`; }
          if (rnd(0, 1) < 0.25) s += `<rect x="${f(jx + jw * 0.2)}" y="${f(yy + jh + 8)}" width="${f(jw * 0.6)}" height="26" fill="#C8C8C0" stroke="${L}" stroke-width="3"/><path d="M${f(jx + jw * 0.25)} ${f(yy + jh + 16)} h${f(jw * 0.5)} M${f(jx + jw * 0.25)} ${f(yy + jh + 24)} h${f(jw * 0.5)}" stroke="#8A8A84" stroke-width="2"/>`;   // ar-condicionado
        }
        if (a % 2 === 1 && w > 200) s += `<rect x="${f(x + 10)}" y="${f(yy + jh + 4)}" width="${f(w - 20)}" height="10" fill="${tom(cor, -0.3)}" stroke="${L}" stroke-width="3"/>${[...Array(Math.floor((w - 20) / 16))].map((_, i) => `<path d="M${f(x + 14 + i * 16)} ${f(yy + jh + 4)} v-34" stroke="#2A2A30" stroke-width="3"/>`).join('')}<path d="M${f(x + 10)} ${f(yy + jh - 30)} H${f(x + w - 10)}" stroke="#2A2A30" stroke-width="4"/>`;   // sacada com grade
      }
      // térreo: loja com porta de enrolar meio aberta, letreiro, toldo rasgado
      if (loja) { const ly = base - 170;
        s += `<rect x="${f(x)}" y="${f(ly)}" width="${f(w)}" height="170" fill="${tom(cor, -0.15)}" stroke="${L}" stroke-width="4"/>`;
        s += `<rect x="${f(x + 10)}" y="${f(ly - 4)}" width="${f(w - 20)}" height="46" rx="4" fill="${pick(['#C83A2A', '#2A6AA8', '#E8B23A', '#2A8A4A', '#E8E2D0'])}" stroke="${L}" stroke-width="4"/><text x="${f(x + w / 2)}" y="${f(ly + 30)}" font-family="'Anton', sans-serif" font-size="${f(Math.min(32, (w - 30) / letreiro.length * 1.6))}" text-anchor="middle" fill="#16120A">${letreiro}</text>`;
        const pw = w - 40, alt = rnd(0.35, 0.8);
        s += `<rect x="${f(x + 20)}" y="${f(ly + 50)}" width="${f(pw)}" height="120" fill="#0E0E12"/><rect x="${f(x + 20)}" y="${f(ly + 50)}" width="${f(pw)}" height="${f(120 * alt)}" fill="#7A7E84" stroke="${L}" stroke-width="3"/>${[...Array(Math.floor(120 * alt / 9))].map((_, i) => `<path d="M${f(x + 20)} ${f(ly + 56 + i * 9)} h${f(pw)}" stroke="#5A5E64" stroke-width="2"/>`).join('')}`;
        s += `<path d="M${f(x + 20)} ${f(ly + 50 + 120 * alt)} l${f(pw * 0.3)} 10 l${f(pw * 0.2)} -8" stroke="${L}" stroke-width="3" fill="none"/>`;   // porta amassada
      }
      if (picho) s += `<text x="${f(x + w * 0.5)}" y="${f(base - 190)}" font-family="'Luckiest Guy', sans-serif" font-size="${f(Math.min(54, w / 5))}" text-anchor="middle" fill="${pick(['#C8342A', '#1A1A1A', '#E8E2D0'])}" opacity=".85" transform="rotate(${f(rnd(-8, 8))} ${f(x + w * 0.5)} ${f(base - 190)})">${pick(PICHO)}</text>`;
      if (rnd(0, 1) < 0.35) s += `<path d="M${f(x + w * 0.3)} ${f(top + h * 0.3)} q30 -60 70 -20 q20 40 -10 90 q-50 10 -60 -70Z" fill="#1A1414" opacity=".55"/>`;   // marca de fogo
      if (sombra) s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" fill="#000" opacity="${sombra}"/>`;
      return s; };

    // ---------- ÔNIBUS urbano de lado (batido, vidros quebrados) ----------
    CZ_onibus = (x, base, k = 1, { dir = 1, quebrado = true, linha = '102 CENTRO' } = {}) => {
      let s = `<g transform="translate(${f(x)} ${f(base)}) scale(${f(k * dir)} ${f(k)})"><ellipse cx="0" cy="6" rx="560" ry="26" fill="#000" opacity=".4"/>`;
      s += `<path d="M-540 -40 L-540 -330 Q-540 -360 -510 -360 L520 -360 Q556 -360 556 -320 L556 -40Z" fill="#E8E2D0" stroke="${L}" stroke-width="6"/>`;
      s += `<rect x="-540" y="-150" width="1096" height="40" fill="#2A6AA8"/><rect x="-540" y="-104" width="1096" height="14" fill="#E8B23A"/>`;
      for (let i = 0; i < 8; i++) { const wx = -520 + i * 118; s += `<rect x="${wx}" y="-330" width="104" height="120" rx="8" fill="${quebrado && i % 3 === 1 ? '#141418' : '#3A4A5A'}" stroke="${L}" stroke-width="4"/>${quebrado && i % 3 === 1 ? `<path d="M${wx + 10} -320 l40 50 l-20 40 M${wx + 90} -326 l-30 60" stroke="#7A8A9A" stroke-width="3"/>` : `<path d="M${wx + 10} -320 l30 0" stroke="#AABBCC" stroke-width="4" opacity=".6"/>`}`; }
      s += `<rect x="440" y="-330" width="96" height="290" fill="#2A3440" stroke="${L}" stroke-width="5"/><path d="M488 -330 V-40" stroke="${L}" stroke-width="4"/>`;   // porta da frente
      s += `<rect x="-200" y="-200" width="90" height="160" fill="#2A3440" stroke="${L}" stroke-width="4"/>`;
      s += `<rect x="-420" y="-388" width="300" height="34" rx="6" fill="#1A1A1E" stroke="${L}" stroke-width="4"/><text x="-270" y="-363" font-family="'Anton', sans-serif" font-size="24" text-anchor="middle" fill="#F2B23A">${linha}</text>`;
      [[-360, 0], [380, 0]].forEach(([wx]) => { s += `<circle cx="${wx}" cy="-40" r="58" fill="#16161A" stroke="${L}" stroke-width="6"/><circle cx="${wx}" cy="-40" r="26" fill="#8A929C" stroke="${L}" stroke-width="4"/>`; });
      if (quebrado) s += `<path d="M556 -200 q-30 30 -10 70 q-30 -10 -40 30" stroke="${L}" stroke-width="5" fill="#B8B2A0"/><circle cx="560" cy="-80" r="14" fill="#E8C24A" stroke="${L}" stroke-width="3"/>`;
      return s + '</g>'; };

    // ---------- CARRO de frente / de trás (para a avenida em perspectiva) ----------
    CZ_carroFrente = (x, base, k = 1, { cor = pick(['#8A2A2A', '#2A4A6A', '#6A6A6A', '#C8C0A8', '#2A5A3A']), costas = false, batido = rnd(0, 1) < 0.6, rot = 0 } = {}) => {
      let s = `<g transform="translate(${f(x)} ${f(base)}) rotate(${f(rot)}) scale(${f(k)})"><ellipse cx="0" cy="4" rx="200" ry="20" fill="#000" opacity=".4"/>`;
      s += `<path d="M-170 -40 L-170 -150 Q-160 -170 -130 -176 L-100 -250 Q-90 -270 -60 -270 L60 -270 Q90 -270 100 -250 L130 -176 Q160 -170 170 -150 L170 -40Z" fill="${cor}" stroke="${L}" stroke-width="6"/>`;
      s += `<path d="M-92 -246 L92 -246 L116 -180 L-116 -180Z" fill="${batido ? '#1A1E24' : '#4A5A6A'}" stroke="${L}" stroke-width="4"/>` + (batido ? `<path d="M-60 -240 l30 30 l-10 24 M40 -244 l-20 40" stroke="#8A9AAA" stroke-width="3"/>` : '');
      s += costas ? `<rect x="-160" y="-140" width="60" height="30" rx="6" fill="#A01A14" stroke="${L}" stroke-width="3"/><rect x="100" y="-140" width="60" height="30" rx="6" fill="#A01A14" stroke="${L}" stroke-width="3"/><rect x="-50" y="-104" width="100" height="30" fill="#E8E2D0" stroke="${L}" stroke-width="3"/>`
                  : `<circle cx="-118" cy="-120" r="24" fill="#E8E2D0" stroke="${L}" stroke-width="4"/><circle cx="118" cy="-120" r="24" fill="#E8E2D0" stroke="${L}" stroke-width="4"/><rect x="-60" y="-130" width="120" height="34" rx="6" fill="#2A2A30" stroke="${L}" stroke-width="3"/>`;
      s += `<rect x="-180" y="-70" width="360" height="30" rx="8" fill="#3A3A40" stroke="${L}" stroke-width="4"/><rect x="-176" y="-44" width="54" height="44" rx="10" fill="#16161A"/><rect x="122" y="-44" width="54" height="44" rx="10" fill="#16161A"/>`;
      if (batido) s += `<path d="M-170 -150 q30 20 10 50 q20 10 -10 30" stroke="${L}" stroke-width="4" fill="${tom(cor, -0.3)}"/>`;
      return s + '</g>'; };

    // ---------- AVENIDA EM PERSPECTIVA DE VERDADE (ponto de fuga; paredes laterais em fuga) ----------
    // mundo: X = lateral (0 = meio da rua), z = profundidade (1 = pé da tela), Y = altura. tela: x = fx + X/z, y = hz + G/z - Y/z
    CZ_proj = ({ hz = 860, fx = 540, h = 1920, y = 0 } = {}) => { const G = y + h - hz; return (X, z, Y = 0) => [fx + X / z, hz + (G - Y) / z]; };
    CZ_avenida = ({ x = 0, y = 0, w = 1080, h = 1920, hz = 860, fx = 540, carros = true } = {}) => {
      const P = CZ_proj({ hz, fx, h, y }), pt = (X, z, Y) => P(X, z, Y).map(f).join(' ');
      const quad = (a, b, c, d, fill, extra = '') => `<path d="M${a} L${b} L${c} L${d}Z" fill="${fill}" ${extra}/>`;
      const RUA = 520, CALC = 800, ZMAX = 40;
      let s = ceu(x, y, w, hz + 60);
      // silhueta da cidade lá no fundo (prédios altos, alguns com fogo)
      for (let i = 0; i < 26; i++) { const bx = x + i * (w / 24) - 30 + rnd(-10, 10), bw = rnd(30, 70), bh = rnd(40, 190); s += `<rect x="${f(bx)}" y="${f(hz + 10 - bh)}" width="${f(bw)}" height="${f(bh + 20)}" fill="#3A3040" opacity=".75"/>`; if (rnd(0, 1) < 0.3) s += `<rect x="${f(bx + bw * 0.3)}" y="${f(hz - bh * 0.6)}" width="6" height="8" fill="#E8A040" opacity=".7"/>`; }
      s += fumaca(fx - 120, hz - 60, 0.8) + fumaca(fx + 160, hz - 120, 0.6);   // fumaça lá no fundo da cidade
      // chão: asfalto, guias, calçadas
      s += quad(pt(-RUA, ZMAX), pt(RUA, ZMAX), pt(RUA, 0.6), pt(-RUA, 0.6), '#34343A');
      [-1, 1].forEach(sd => { s += quad(pt(sd * RUA, ZMAX), pt(sd * CALC, ZMAX), pt(sd * CALC, 0.5), pt(sd * RUA, 0.5), '#8A8478'); s += quad(pt(sd * RUA, ZMAX, 0), pt(sd * RUA, ZMAX, 24), pt(sd * RUA, 0.5, 24), pt(sd * RUA, 0.5, 0), '#6A6458');
        for (let z = 1; z < ZMAX; z *= 1.18) s += `<path d="M${pt(sd * RUA, z, 24)} L${pt(sd * CALC, z)}" stroke="#6E685E" stroke-width="${f(3 / Math.sqrt(z))}"/>`; });   // juntas da calçada
      for (let z = 0.8; z < ZMAX; z += 2.6) s += quad(pt(-12, z + 1.2), pt(12, z + 1.2), pt(12, z), pt(-12, z), '#D8C060', 'opacity=".75"');   // faixa amarela
      for (let i = 0; i < 7; i++) s += quad(pt(-RUA + 40 + i * 140, 1.75), pt(-RUA + 110 + i * 140, 1.75), pt(-RUA + 110 + i * 140, 1.45), pt(-RUA + 40 + i * 140, 1.45), '#D8D2C0', 'opacity=".55"');   // faixa de pedestre gasta
      for (let i = 0; i < 6; i++) { const z = rnd(1.2, 12), X = rnd(-RUA + 60, RUA - 60), [cx, cy] = P(X, z); s += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(90 / z)}" ry="${f(22 / z)}" fill="#24242A"/><ellipse cx="${f(cx)}" cy="${f(cy - 3 / z)}" rx="${f(70 / z)}" ry="${f(12 / z)}" fill="#2E2E34"/>`; }   // buracos
      for (let i = 0; i < 4; i++) { const z = rnd(1.4, 10), X = rnd(-RUA, RUA), [cx, cy] = P(X, z); s += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(120 / z)}" ry="${f(26 / z)}" fill="#3A0A0A" opacity=".55"/>`; }   // manchas de sangue seco
      // prédios dos dois lados, do fundo para a frente
      const cores = ['#B8A88A', '#9AA4A8', '#C8B898', '#A88A7A', '#8A9A88', '#B89A84', '#7E8C94'];
      const placas = [...LETREIROS];
      [-1, 1].forEach(sd => {
        const bl = []; let z = 1.05; while (z < ZMAX) { const dz = z * rnd(0.22, 0.4); bl.push({ z0: z, z1: z + dz, H: rnd(1400, 3600), cor: pick(cores), D: rnd(500, 900) }); z += dz * (rnd(0, 1) < 0.12 ? 1.25 : 1); }
        bl.reverse().forEach((b, bi) => {
          const X = sd * CALC, cor = tom(b.cor, -Math.min(0.35, b.z0 / 40)), lat = tom(cor, sd < 0 ? -0.08 : -0.22);
          // face da frente (de quina para a câmera), aparece acima dos prédios mais perto
          s += quad(pt(X, b.z0), pt(X + sd * b.D, b.z0), pt(X + sd * b.D, b.z0, b.H), pt(X, b.z0, b.H), tom(cor, 0.06), `stroke="${L}" stroke-width="${f(Math.max(1, 5 / b.z0))}"`);
          for (let a = 1; a * 300 < b.H - 100; a++) for (let c = 0; c < Math.floor(b.D / 220); c++) { const X0 = X + sd * (90 + c * 220), X1 = X0 + sd * 120, Y0 = a * 300 + 60, Y1 = Y0 + 160, sh = rnd(0, 1); s += quad(pt(X0, b.z0, Y0), pt(X1, b.z0, Y0), pt(X1, b.z0, Y1), pt(X0, b.z0, Y1), sh < 0.2 ? '#8A6A44' : sh < 0.45 ? '#121218' : '#2A3440'); }
          // parede lateral (em fuga, de frente para a rua)
          s += quad(pt(X, b.z0), pt(X, b.z1), pt(X, b.z1, b.H), pt(X, b.z0, b.H), lat, `stroke="${L}" stroke-width="${f(Math.max(1, 5 / b.z0))}"`);
          // reboco gasto: manchas e tijolo aparecendo
          for (let m = 0; m < 3; m++) { const zz = lerp(b.z0, b.z1, rnd(0.1, 0.8)), YY = rnd(300, b.H - 200); s += quad(pt(X, zz, YY), pt(X, zz * 1.04, YY), pt(X, zz * 1.04, YY - 140), pt(X, zz, YY - 140), '#8A4A34', 'opacity=".45"'); }
          // térreo: portas de enrolar e vitrine
          const nP = Math.max(1, Math.round((b.z1 - b.z0) / b.z0 * 4));
          for (let p = 0; p < nP; p++) { const za = lerp(b.z0, b.z1, (p + 0.12) / nP), zb = lerp(b.z0, b.z1, (p + 0.88) / nP), aberta = rnd(0, 1) < 0.35;
            s += quad(pt(X, za, 0), pt(X, zb, 0), pt(X, zb, 240), pt(X, za, 240), aberta ? '#0C0C10' : '#6A6E74', `stroke="${L}" stroke-width="${f(Math.max(0.8, 3 / za))}"`);
            if (!aberta) for (let r = 30; r < 240; r += 30) s += `<path d="M${pt(X, za, r)} L${pt(X, zb, r)}" stroke="#4A4E54" stroke-width="${f(Math.max(0.6, 3 / za))}"/>`;
            else s += quad(pt(X, za, 190), pt(X, zb, 190), pt(X, zb, 240), pt(X, za, 240), '#6A6E74'); }
          // andares: janelas em fuga (algumas quebradas, tábuas, cortina, ar-condicionado) + marquise
          s += quad(pt(X, b.z0, 250), pt(X, b.z1, 250), pt(X + sd * -60, b.z1, 270), pt(X + sd * -60, b.z0, 270), tom(cor, -0.3));
          const nJ = Math.max(1, Math.round((b.z1 - b.z0) / b.z0 * 5));
          for (let a = 1; a * 300 + 260 < b.H; a++) for (let j = 0; j < nJ; j++) { const za = lerp(b.z0, b.z1, (j + 0.2) / nJ), zb = lerp(b.z0, b.z1, (j + 0.8) / nJ), Y0 = a * 300 + 40, Y1 = Y0 + 170, t = rnd(0, 1);
            s += quad(pt(X, za, Y0), pt(X, zb, Y0), pt(X, zb, Y1), pt(X, za, Y1), t < 0.18 ? '#0A0A0E' : '#26303A', `stroke="${tom(cor, -0.35)}" stroke-width="${f(Math.max(0.6, 3 / za))}"`);
            if (t < 0.18) s += `<path d="M${pt(X, za, Y1 - 10)} L${pt(X, lerp(za, zb, 0.4), Y0 + 60)} L${pt(X, lerp(za, zb, 0.2), Y0 + 20)}" stroke="#7A8A9A" stroke-width="${f(Math.max(0.6, 2 / za))}" fill="none"/>`;
            else if (t < 0.32) [0.25, 0.55, 0.85].forEach(q => { s += quad(pt(X, za, lerp(Y0, Y1, q) - 18), pt(X, zb, lerp(Y0, Y1, q) - 26), pt(X, zb, lerp(Y0, Y1, q) + 10), pt(X, za, lerp(Y0, Y1, q) + 18), '#8A6A44', `stroke="${L}" stroke-width="${f(Math.max(0.5, 2 / za))}"`); });
            else if (t < 0.45) s += quad(pt(X, za, Y0), pt(X, lerp(za, zb, 0.45), Y0), pt(X, lerp(za, zb, 0.3), Y1), pt(X, za, Y1), pick(['#A84A3A', '#C8A040', '#4A6A8A']), 'opacity=".85"');
            else if (t < 0.55) s += quad(pt(X - sd * 0, za, Y0 - 50), pt(X - sd * 60, za, Y0 - 50), pt(X - sd * 60, zb, Y0 - 10), pt(X, zb, Y0 - 10), '#D8D4C8', `stroke="${L}" stroke-width="${f(Math.max(0.5, 2 / za))}"`);   // ar-condicionado
            else s += `<path d="M${pt(X, za, Y0 + 14)} L${pt(X, lerp(za, zb, 0.6), Y0 + 14)}" stroke="#8AA0B4" stroke-width="${f(Math.max(0.6, 4 / za))}" opacity=".5"/>`; }
          // platibanda + caixa d'água azul + antena (no canto da frente)
          s += quad(pt(X, b.z0, b.H), pt(X, b.z1, b.H), pt(X, b.z1, b.H + 60), pt(X, b.z0, b.H + 60), tom(cor, -0.15), `stroke="${L}" stroke-width="${f(Math.max(0.8, 4 / b.z0))}"`);
          if (rnd(0, 1) < 0.6) { const [cx, cy] = P(X + sd * 250, b.z0 * 1.05, b.H + 60), k = 1 / b.z0; s += `<path d="M${f(cx - 70 * k)} ${f(cy)} L${f(cx - 55 * k)} ${f(cy - 120 * k)} L${f(cx + 55 * k)} ${f(cy - 120 * k)} L${f(cx + 70 * k)} ${f(cy)}Z" fill="#2E5A8A" stroke="${L}" stroke-width="${f(Math.max(0.6, 4 * k))}"/><ellipse cx="${f(cx)}" cy="${f(cy - 120 * k)}" rx="${f(55 * k)}" ry="${f(14 * k)}" fill="#3A6A9A" stroke="${L}" stroke-width="${f(Math.max(0.6, 3 * k))}"/>`; }
          if (rnd(0, 1) < 0.5) { const [cx, cy] = P(X + sd * 120, b.z0 * 1.1, b.H + 60), k = 1 / b.z0; s += `<path d="M${f(cx)} ${f(cy)} V${f(cy - 300 * k)} M${f(cx - 50 * k)} ${f(cy - 260 * k)} h${f(100 * k)} M${f(cx - 35 * k)} ${f(cy - 210 * k)} h${f(70 * k)}" stroke="#2A2A30" stroke-width="${f(Math.max(0.6, 5 * k))}"/>`; }
          // placa de loja "bandeira" (perpendicular à parede, de frente para a câmera) com nome
          if (rnd(0, 1) < 0.55 && b.z0 < 14) { const k = 1 / b.z0, [cx, cy] = P(X - sd * 30, b.z0 * 1.08, 420), txt = placas.splice(Math.floor(rnd(0, placas.length)), 1)[0] || 'BAR', wP = Math.max(180, txt.length * 34), c2 = pick(['#2A6A3A', '#A82A22', '#D8A030', '#2A4A8A']);
            s += `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(k)})"><path d="M${-sd * 0} -60 H${-sd * wP}" stroke="#2A2A30" stroke-width="8"/><rect x="${sd < 0 ? 0 : -wP}" y="-50" width="${wP}" height="110" rx="10" fill="${c2}" stroke="${L}" stroke-width="7" transform="rotate(${sd * 4})"/><text x="${-sd * wP / 2}" y="22" font-family="'Anton', sans-serif" font-size="56" text-anchor="middle" fill="#F2EAD8" transform="rotate(${sd * 4})">${txt}</text></g>`; }
        });
      });
      // névoa de profundidade sobre o fundo
      const [nid, nd] = grad(['#6A4A5A00', '#8A5A5A88', '#6A4A5A00']); s += nd + `<rect x="${x}" y="${hz - 420}" width="${w}" height="520" fill="url(#${nid})"/>`;
      // postes de concreto com transformador, fios emaranhados
      const topos = { '-1': [], '1': [] };
      [-1, 1].forEach(sd => { for (let z = 1.3; z < 30; z *= 1.45) { const X = sd * (RUA + 60), [bx, by] = P(X, z), [tx, ty] = P(X, z, 1500), k = 1 / z; topos[sd].push([tx, ty + 30 * k, k]);
        s += `<path d="M${f(bx)} ${f(by)} L${f(tx)} ${f(ty)}" stroke="#6A6A70" stroke-width="${f(Math.max(1.5, 34 * k))}"/><path d="M${f(tx - 110 * k)} ${f(ty + 30 * k)} h${f(220 * k)}" stroke="#4A4A50" stroke-width="${f(Math.max(1, 12 * k))}"/>`;
        if (z < 4) s += `<rect x="${f(tx - sd * 60 * k - 26 * k)}" y="${f(ty + 80 * k)}" width="${f(52 * k)}" height="${f(90 * k)}" rx="${f(8 * k)}" fill="#5A6066" stroke="${L}" stroke-width="${f(3 * k)}"/>`; } });
      [-1, 1].forEach(sd => { const t = topos[sd]; for (let q = 0; q < 3; q++) s += `<path d="M${t.map(([tx, ty, k], i) => `${i ? (i % 1 === 0 ? 'Q' + f((t[i - 1][0] + tx) / 2) + ' ' + f((t[i - 1][1] + ty) / 2 + 60 * k + q * 10 * k) + ' ' : '') : ''}${f(tx + (q - 1) * 70 * k)} ${f(ty + q * 6 * k)}`).join(' ')}" stroke="#141418" stroke-width="${f(2.2)}" fill="none"/>`; });
      { const a = topos['-1'][1], b = topos['1'][1]; s += `<path d="M${f(a[0])} ${f(a[1])} Q${fx} ${f(a[1] + 240)} ${f(b[0])} ${f(b[1])}" stroke="#141418" stroke-width="2.5" fill="none"/>`;
        s += `<g transform="translate(${f(fx + 60)} ${f(a[1] + 180)}) rotate(16) scale(${f(a[2] * 1.4)})"><path d="M0 -70 V0" stroke="#141418" stroke-width="4"/><rect x="-26" y="0" width="52" height="140" rx="10" fill="#2A2A30" stroke="${L}" stroke-width="5"/><circle cx="0" cy="28" r="14" fill="#4A1A14"/><circle cx="0" cy="70" r="14" fill="#5A4A1A"/><circle cx="0" cy="112" r="14" fill="#1A3A1A"/></g>`; }   // semáforo pendurado, apagado
      // carros largados (os do fundo primeiro), lixo, papel, pneu
      if (carros) [[-300, 9, -12, 0], [260, 6.5, 20, 1], [-140, 3.8, -8, 1], [380, 2.6, 14, 0]].forEach(([X, z, r, c]) => { const [cx, cy] = P(X, z); s += CZ_carroFrente(cx, cy, 2.2 / z, { rot: r, costas: !!c }); });
      for (let i = 0; i < 70; i++) { const z = 1 + rnd(0, 1) ** 1.6 * 14, X = rnd(-CALC, CALC), [cx, cy] = P(X, z), k = 1 / z; s += `<path d="M${f(cx)} ${f(cy)} l${f(30 * k)} ${f(-6 * k)} l${f(10 * k)} ${f(12 * k)} l${f(-28 * k)} ${f(4 * k)}Z" fill="${pick(['#E8E2D0', '#C8C0A8', '#9A9488', '#5A7A9A'])}" opacity=".8"/>`; }
      for (let i = 0; i < 5; i++) { const z = rnd(1.3, 6), X = pick([-1, 1]) * rnd(RUA + 40, CALC - 60), [cx, cy] = P(X, z), k = 1 / z; s += `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(k)})"><path d="M-70 0 Q-80 -110 0 -120 Q80 -110 70 0Z" fill="#1E1E22" stroke="${L}" stroke-width="5"/><path d="M-20 -118 q20 -30 40 0" stroke="#1E1E22" stroke-width="8" fill="none"/></g>`; }   // sacos de lixo
      return clip(x, y, w, h, s + C.atmosfera({ grao: 0.28, vinheta: false }));
    };
    // ---------- AVENIDA DE LADO (fachadas no fundo, calçada, asfalto) ----------
    CZ_avenidaLado = ({ x = 0, y = 0, w = 1080, h = 1920, chao = 1500, largura = w } = {}) => {
      let s = ceu(x, y, largura, chao);
      let px = x - 40; while (px < x + largura) { const pw = rnd(220, 380), ph = rnd(700, 1250); s += CZ_predio(px, chao - 130, pw, ph); px += pw - 2; }
      s += `<rect x="${x}" y="${chao - 130}" width="${largura}" height="70" fill="#8A8478" stroke="${L}" stroke-width="3"/><rect x="${x}" y="${chao - 66}" width="${largura}" height="12" fill="#6A6458"/>`;
      s += `<rect x="${x}" y="${chao - 54}" width="${largura}" height="${h - chao + 54}" fill="#3A3A40"/>`;
      for (let i = 0; i < largura / 160; i++) s += `<rect x="${x + i * 160}" y="${chao + 120}" width="90" height="12" fill="#E8D070" opacity=".75"/>`;
      for (let i = 0; i < largura / 300; i++) { const lx = x + 120 + i * 300; s += `<path d="M${lx} ${chao - 130} V${chao - 1000}" stroke="#4A4A50" stroke-width="16"/><path d="M${lx - 50} ${chao - 990} h100" stroke="#4A4A50" stroke-width="8"/>`; }
      s += `<path d="M${x} ${chao - 960} ${[...Array(Math.ceil(largura / 300))].map((_, i) => `Q${x + i * 300 + 150} ${chao - 900} ${x + (i + 1) * 300} ${chao - 960}`).join(' ')}" stroke="#1A1A1E" stroke-width="3" fill="none"/>`;
      for (let i = 0; i < largura / 40; i++) { const lx = x + rnd(0, largura), ly = chao + rnd(-40, 280); s += `<path d="M${f(lx)} ${f(ly)} l${f(rnd(10, 26))} -4 l6 10Z" fill="${pick(['#E8E2D0', '#C8C0A8'])}" opacity=".7"/>`; }
      s += fumaca(x + largura * 0.3, chao - 900, 1.1) + fumaca(x + largura * 0.8, chao - 1000, 0.9);
      return clip(x, y, w, h, s + C.atmosfera({ grao: 0.28, vinheta: false }));
    };
    // ---------- CARRO DE LADO (largado na ponte / na rua) ----------
    CZ_carroLado = (x, base, k = 1, { cor = pick(['#8A2A2A', '#2A4A6A', '#6A6A6A', '#C8C0A8', '#2A5A3A']), dir = 1, batido = rnd(0, 1) < 0.6, rot = 0 } = {}) => {
      let s = `<g transform="translate(${f(x)} ${f(base)}) rotate(${f(rot)}) scale(${f(k * dir)} ${f(k)})"><ellipse cx="0" cy="4" rx="330" ry="20" fill="#000" opacity=".4"/>`;
      s += `<path d="M-320 -50 L-320 -130 Q-316 -160 -280 -166 L-170 -176 L-100 -250 Q-86 -262 -60 -262 L120 -262 Q146 -262 160 -246 L220 -176 L290 -166 Q326 -156 326 -120 L326 -50Z" fill="${cor}" stroke="${L}" stroke-width="7"/>`;
      s += `<path d="M-150 -180 L-92 -242 L20 -242 L20 -180Z M40 -180 L40 -242 L130 -242 Q144 -242 152 -232 L196 -180Z" fill="${batido ? '#16181E' : '#3A4A5A'}" stroke="${L}" stroke-width="5"/>`;
      if (batido) s += `<path d="M-120 -186 l30 -30 l10 20 l26 -34 M70 -236 l20 34" stroke="#8A9AAA" stroke-width="3" fill="none"/><path d="M290 -166 q-30 30 -10 60 q-20 6 -14 56" stroke="${L}" stroke-width="5" fill="${tom(cor, -0.3)}"/>`;
      s += `<path d="M20 -176 V-56 M-170 -176 V-56" stroke="${tom(cor, -0.35)}" stroke-width="4"/><rect x="-40" y="-150" width="34" height="10" rx="4" fill="${tom(cor, -0.4)}"/><rect x="290" y="-140" width="34" height="26" rx="6" fill="#E8E2D0" stroke="${L}" stroke-width="3"/><rect x="-326" y="-140" width="20" height="26" rx="4" fill="#A01A14" stroke="${L}" stroke-width="3"/>`;
      s += `<path d="M-326 -70 H330" stroke="#3A3A40" stroke-width="16"/>`;
      [-210, 210].forEach(wx => { s += `<circle cx="${wx}" cy="-50" r="62" fill="#141418" stroke="${L}" stroke-width="6"/><circle cx="${wx}" cy="-50" r="30" fill="#7A828C" stroke="${L}" stroke-width="4"/>`; });
      return s + '</g>'; };
    // ---------- PONTE tomada (de lado, com o rio embaixo e a cidade atrás) ----------
    // o tabuleiro fica em y = deck (o chão onde os vultos andam: devolvido em CZ.ponte.deck)
    CZ_ponte = ({ x = 0, y = 0, w = 1080, h = 1920, hz = 900, deck = 1180, carros = true } = {}) => {
      let s = ceu(x, y, w, hz + 80);
      // skyline queimando do outro lado do rio
      for (let i = 0; i < 18; i++) { const bx = x - 20 + i * (w / 16) + rnd(-10, 10), bw = rnd(50, 110), bh = rnd(120, 420); s += `<rect x="${f(bx)}" y="${f(hz - bh)}" width="${f(bw)}" height="${f(bh + 20)}" fill="#3A3040" opacity=".85"/>`;
        for (let r = 0; r < bh / 40 - 1; r++) for (let c = 0; c < bw / 24 - 1; c++) if (rnd(0, 1) < 0.12) s += `<rect x="${f(bx + 8 + c * 24)}" y="${f(hz - bh + 14 + r * 40)}" width="9" height="13" fill="${rnd(0, 1) < 0.5 ? '#E8A040' : '#1A1620'}" opacity=".8"/>`; }
      s += fumaca(x + w * 0.25, hz - 300, 1.6) + fumaca(x + w * 0.72, hz - 220, 1.2) + `<ellipse cx="${x + w * 0.25}" cy="${hz - 40}" rx="140" ry="60" fill="#E86A2A" opacity=".25"/>`;
      // rio: margem do fundo, água com reflexo do céu e ondinhas
      s += `<path d="M${x} ${hz + 10} Q${x + w * 0.5} ${hz - 10} ${x + w} ${hz + 14} V${hz + 60} H${x}Z" fill="#4A4038"/>`;
      const [rid, rd] = grad(['#6A4A50', '#3A3A48', '#1E2630']); s += rd + `<rect x="${x}" y="${hz + 50}" width="${w}" height="${y + h - hz}" fill="url(#${rid})"/>`;
      for (let i = 0; i < 40; i++) { const yy = hz + 70 + rnd(0, 1) ** 1.5 * (y + h - hz - 80), k = lerp(0.4, 1.4, (yy - hz) / (h - hz)); s += `<path d="M${f(x + rnd(0, w))} ${f(yy)} q${f(30 * k)} ${f(-8 * k)} ${f(60 * k)} 0" stroke="#8AA0B0" stroke-width="${f(3 * k)}" fill="none" opacity=".45"/>`; }
      // arcos e pilares de concreto (atrás do tabuleiro), com reflexo na água
      const vao = 360;
      for (let i = -1; i * vao < w + vao; i++) { const px = x + i * vao, pw = 70;
        s += `<rect x="${f(px - pw / 2)}" y="${deck + 70}" width="${pw}" height="${f(y + h - deck)}" fill="#6E685E" stroke="${L}" stroke-width="5"/><rect x="${f(px - pw / 2)}" y="${deck + 70}" width="22" height="${f(y + h - deck)}" fill="#827C70"/>`;
        s += `<path d="M${f(px + pw / 2)} ${deck + 260} Q${f(px + vao / 2)} ${deck + 90} ${f(px + vao - pw / 2)} ${deck + 260}" stroke="#6E685E" stroke-width="34" fill="none"/><path d="M${f(px + pw / 2)} ${deck + 260} Q${f(px + vao / 2)} ${deck + 90} ${f(px + vao - pw / 2)} ${deck + 260}" stroke="${L}" stroke-width="4" fill="none" transform="translate(0 17)"/>`;
        s += `<rect x="${f(px - pw / 2)}" y="${f(y + h - 240)}" width="${pw}" height="240" fill="#2A3038" opacity=".55"/><path d="M${f(px - pw / 2 - 20)} ${f(y + h - 250)} h${pw + 40}" stroke="#8AA0B0" stroke-width="4" opacity=".5"/>`;   // linha d'água + reflexo
        if (rnd(0, 1) < 0.5) s += `<path d="M${f(px - 20)} ${deck + 100} q-6 120 4 260" stroke="#3A342E" stroke-width="3" fill="none"/>`;   // rachadura
        s += `<path d="M${f(px - pw / 2)} ${deck + 300} q${pw / 2} 30 ${pw} 0 v40 q-${pw / 2} 30 -${pw} 0Z" fill="#3A4A34" opacity=".6"/>`; }   // limo
      // guarda-corpo de trás
      s += `<rect x="${x - 20}" y="${deck - 70}" width="${w + 40}" height="12" fill="#5A5A60"/>` + [...Array(Math.ceil(w / 40) + 1)].map((_, i) => `<rect x="${x + i * 40}" y="${deck - 60}" width="7" height="56" fill="#5A5A60"/>`).join('');
      // tabuleiro: pista com faixa, guia, lateral de concreto grossa com pingadeira e manchas
      s += `<rect x="${x - 20}" y="${deck - 6}" width="${w + 40}" height="26" fill="#4A4A50"/>`;
      for (let i = 0; i < w / 150 + 1; i++) s += `<rect x="${x + i * 150 + 20}" y="${deck + 4}" width="80" height="6" fill="#D8C060" opacity=".7"/>`;
      s += `<rect x="${x - 20}" y="${deck + 20}" width="${w + 40}" height="56" fill="#8A8478" stroke="${L}" stroke-width="5"/><rect x="${x - 20}" y="${deck + 70}" width="${w + 40}" height="14" fill="#5E584E" stroke="${L}" stroke-width="4"/>`;
      for (let i = 0; i < 14; i++) { const mx = x + rnd(0, w); s += `<path d="M${f(mx)} ${deck + 84} q4 ${f(rnd(30, 120))} -2 ${f(rnd(60, 180))}" stroke="#4A443C" stroke-width="${f(rnd(4, 10))}" opacity=".5" fill="none"/>`; }   // escorrido de ferrugem
      // carros largados em cima (atrás dos vultos)
      if (carros) s += CZ_carroLado(x + 230, deck + 4, 0.46, { dir: 1, rot: -3, cor: '#2A5A3A' }) + CZ_carroLado(x + 840, deck + 4, 0.44, { dir: -1, rot: 4, cor: '#6A6A6A' });
      // poste de luz da ponte, torto
      [x + 520, x + 1000].forEach((lx, i) => { s += `<path d="M${lx} ${deck - 4} V${deck - 420} q0 -40 ${i ? -60 : 60} -40" stroke="#4A4A50" stroke-width="12" fill="none" transform="rotate(${i ? -6 : 3} ${lx} ${deck})"/>`; });
      return clip(x, y, w, h, s + C.atmosfera({ grao: 0.28, vinheta: false }));
    };
    // guarda-corpo da FRENTE: desenhe DEPOIS dos vultos para eles ficarem "dentro" da ponte
    CZ_ponteFrente = ({ x = 0, w = 1080, deck = 1180 } = {}) => `<rect x="${x - 20}" y="${deck - 120}" width="${w + 40}" height="16" fill="#6A6A70" stroke="${L}" stroke-width="4"/>` + [...Array(Math.ceil(w / 60) + 1)].map((_, i) => `<rect x="${x + i * 60}" y="${deck - 106}" width="10" height="${i % 7 === 3 ? 60 : 110}" fill="#6A6A70" stroke="${L}" stroke-width="3" transform="rotate(${i % 7 === 3 ? 25 : 0} ${x + i * 60} ${deck})"/>`).join('');
    // ---------- RUÍNAS: prédio partido ao meio, outro inclinado, laje pendurada com ferragem, entulho, carro queimado, fogo ----------
    CZ_ruinas = ({ x = 0, y = 0, w = 1080, h = 1920, chao = 1520 } = {}) => {
      const [gid, gd] = grad(['#1A1420', '#4A2A30', '#A8482A', '#D87A3A']);
      let s = gd + `<rect x="${x}" y="${y}" width="${w}" height="${chao}" fill="url(#${gid})"/>`;
      s += `<ellipse cx="${x + w * 0.6}" cy="${chao - 300}" rx="520" ry="240" fill="#FF7A2A" opacity=".25"/>`;   // clarão de incêndio
      for (let i = 0; i < 14; i++) { const bx = x + i * 80 - 20, bh = rnd(200, 520); s += `<path d="M${f(bx)} ${chao - 240} V${f(chao - 240 - bh)} l${f(rnd(10, 30))} ${f(rnd(-30, 20))} l${f(rnd(10, 30))} ${f(rnd(10, 60))} V${chao - 240}Z" fill="#2A2028" opacity=".9"/>`; }   // silhueta quebrada no fundo
      s += fumaca(x + w * 0.2, chao - 760, 2.0) + fumaca(x + w * 0.75, chao - 620, 1.6);
      // prédio da esquerda: partido, sem o canto de cima (laje pendurada e ferragem aparente)
      const pA = CZ_predio(x - 60, chao - 80, 420, 1150, { cor: '#9AA4A8', loja: true, letreiro: 'FARMÁCIA' }), cid = uid('cr');
      s += `<clipPath id="${cid}"><path d="M${x - 60} ${chao} V${chao - 1230} L${x + 80} ${chao - 1180} L${x + 140} ${chao - 960} L${x + 230} ${chao - 900} L${x + 270} ${chao - 640} L${x + 360} ${chao - 600} V${chao}Z"/></clipPath><g clip-path="url(#${cid})">${pA}</g>`;
      [[x + 140, chao - 960, -18], [x + 230, chao - 900, 22], [x + 270, chao - 640, 34]].forEach(([lx, ly, r]) => { s += `<g transform="translate(${lx} ${ly}) rotate(${r})"><rect x="-10" y="-14" width="190" height="28" fill="#8A8A88" stroke="${L}" stroke-width="5"/>${[0, 1, 2, 3, 4].map(k => `<path d="M${20 + k * 34} 14 q${f(rnd(-10, 10))} 40 ${f(rnd(-20, 20))} ${f(rnd(40, 90))}" stroke="#6A3A2A" stroke-width="4" fill="none"/>`).join('')}</g>`; });
      for (let k = 0; k < 6; k++) s += `<path d="M${x + 230 + k * 8} ${chao - 900} l${f(rnd(-30, 40))} ${f(rnd(-90, -40))}" stroke="#6A3A2A" stroke-width="5"/>`;   // ferragem saindo
      // prédio do meio: inclinado, encostado no outro, janelas com fogo
      s += `<g transform="rotate(7 ${x + 560} ${chao - 80})">${CZ_predio(x + 420, chao - 80, 300, 1300, { cor: '#C8B898', loja: true, letreiro: 'BAR DO ZÉ' })}</g>`;
      [[x + 520, chao - 820], [x + 600, chao - 1060], [x + 480, chao - 560]].forEach(([fx, fy]) => { s += `<path d="M${fx} ${fy} q-20 -40 0 -80 q10 30 24 10 q14 -40 4 -70 q40 40 30 110 q-4 30 -58 30Z" fill="#FFB03A" stroke="#E84A1A" stroke-width="5"/><ellipse cx="${fx + 10}" cy="${fy - 40}" rx="90" ry="70" fill="#FF8A2A" opacity=".3"/>`; });
      // prédio da direita: só o esqueleto (pilares e lajes)
      for (let a = 0; a < 7; a++) s += `<rect x="${x + 780}" y="${chao - 140 - a * 160}" width="${300 - (a > 4 ? (a - 4) * 90 : 0)}" height="26" fill="#8A8A88" stroke="${L}" stroke-width="5"/>`;
      [800, 900, 1000].forEach((px, i) => { s += `<rect x="${x + px}" y="${chao - 140 - (i === 2 ? 640 : 1100)}" width="30" height="${i === 2 ? 640 : 1100}" fill="#7A7A78" stroke="${L}" stroke-width="5"/>`; });
      // rua com entulho, poste caído, carro queimado
      s += `<rect x="${x}" y="${chao - 80}" width="${w}" height="${y + h - chao + 80}" fill="#34343A"/><rect x="${x}" y="${chao - 80}" width="${w}" height="40" fill="#6A6458"/>`;
      s += `<path d="M${x - 40} ${chao + 60} Q${x + 120} ${chao - 220} ${x + 340} ${chao - 60} Q${x + 420} ${chao + 20} ${x + 520} ${chao + 80}Z" fill="#7A7468" stroke="${L}" stroke-width="5"/>`;   // monte de entulho
      for (let i = 0; i < 28; i++) { const ex = x + rnd(-20, 540), ey = chao + rnd(-140, 70), r = rnd(14, 46); s += `<path d="M${f(ex)} ${f(ey)} l${f(r)} ${f(-r * 0.4)} l${f(r * 0.3)} ${f(r * 0.7)} l${f(-r)} ${f(r * 0.3)}Z" fill="${pick(['#8A847A', '#9A948A', '#6A645A', '#A8483A'])}" stroke="${L}" stroke-width="3"/>`; }
      s += `<g transform="translate(${x + 520} ${chao + 70}) rotate(-58)"><rect x="-10" y="-900" width="22" height="900" fill="#5A5A60" stroke="${L}" stroke-width="4"/><path d="M-60 -880 h130" stroke="#4A4A50" stroke-width="10"/></g><path d="M${x + 500} ${chao - 640} Q${x + 700} ${chao - 200} ${x + 1100} ${chao - 500}" stroke="#141418" stroke-width="3" fill="none"/>`;
      s += `<g opacity=".95">${CZ_carroLado(x + 820, chao + 160, 0.75, { cor: '#2A2224', dir: -1, batido: true, rot: 4 })}</g><path d="M${x + 640} ${chao + 40} Q${x + 820} ${chao - 60} ${x + 1000} ${chao + 40}" fill="#000" opacity=".25"/>`;
      s += fumaca(x + 820, chao - 60, 1.0);
      for (let i = 0; i < 50; i++) { const lx = x + rnd(0, w), ly = chao + rnd(-40, y + h - chao); s += `<path d="M${f(lx)} ${f(ly)} l${f(rnd(10, 26))} -4 l6 10Z" fill="${pick(['#E8E2D0', '#8A847A'])}" opacity=".7"/>`; }
      return clip(x, y, w, h, s + C.atmosfera({ grao: 0.3, vinheta: false }));
    };
    // ---------- RODOVIA ENGARRAFADA: todo mundo tentou fugir; carros largados nas duas pistas, portas abertas, malas no asfalto ----------
    CZ_rodovia = ({ x = 0, y = 0, w = 1080, h = 1920, hz = 820, fx = 540 } = {}) => {
      const P = CZ_proj({ hz, fx, h, y }), pt = (X, z, Y) => P(X, z, Y).map(f).join(' ');
      const quad = (a, b, c, d, fill, extra = '') => `<path d="M${a} L${b} L${c} L${d}Z" fill="${fill}" ${extra}/>`;
      let s = ceu(x, y, w, hz + 40);
      s += fumaca(fx - 260, hz - 40, 1.6) + fumaca(fx + 300, hz - 90, 1.2) + `<ellipse cx="${fx - 260}" cy="${hz}" rx="160" ry="40" fill="#FF7A2A" opacity=".35"/>`;
      for (let i = 0; i < 18; i++) { const bx = x + i * 64, bh = rnd(30, 120); s += `<rect x="${f(bx)}" y="${f(hz + 6 - bh)}" width="${f(rnd(30, 60))}" height="${f(bh)}" fill="#3A3040" opacity=".7"/>`; }   // cidade lá longe
      s += `<rect x="${x}" y="${hz}" width="${w}" height="${y + h - hz}" fill="#3A4A2A"/>`;
      s += quad(pt(-1300, 40), pt(1300, 40), pt(1300, 0.6), pt(-1300, 0.6), '#34343A');
      s += quad(pt(-60, 40), pt(60, 40), pt(60, 0.6), pt(-60, 0.6), '#4A5A34');   // canteiro do meio
      [-1300, 1300].forEach(X => { s += `<path d="M${pt(X, 40, 40)} L${pt(X, 0.6, 40)}" stroke="#A8A8A0" stroke-width="10"/>`; for (let z = 0.8; z < 30; z *= 1.3) s += `<path d="M${pt(X, z)} L${pt(X, z, 40)}" stroke="#7A7A78" stroke-width="${f(Math.max(1, 6 / z))}"/>`; });   // guard-rail
      [-700, 700].forEach(X => { for (let z = 0.8; z < 40; z += 2.2) s += quad(pt(X - 8, z + 1), pt(X + 8, z + 1), pt(X + 8, z), pt(X - 8, z), '#D8D2C0', 'opacity=".6"'); });
      // placa verde da rodovia
      { const [ax, ay] = P(-900, 7, 0), [bx, by] = P(-900, 7, 900), k = 1 / 7; s += `<path d="M${f(ax)} ${f(ay)} V${f(by)}" stroke="#6A6A70" stroke-width="${f(30 * k)}"/><g transform="translate(${f(bx)} ${f(by)}) scale(${f(k)})"><rect x="-20" y="-300" width="900" height="300" rx="20" fill="#1E6A3A" stroke="#F2F2F2" stroke-width="14"/><text x="430" y="-170" font-family="'Anton', sans-serif" font-size="110" text-anchor="middle" fill="#F2F2F2">SAÍDA</text><text x="430" y="-50" font-family="'Anton', sans-serif" font-size="90" text-anchor="middle" fill="#F2F2F2">INTERIOR  120 km</text></g>`; }
      // os carros: do fundo para a frente, as duas pistas cheias (indo embora = de costas)
      const carros = [];
      for (let z = 22; z > 1.7; z /= 1.22) [-1100, -760, -420, 420, 760, 1100].forEach(X => { if (rnd(0, 1) < 0.72) carros.push([X + rnd(-60, 60), z * rnd(0.94, 1.06), X > 0]); });
      carros.sort((a, b) => b[1] - a[1]).forEach(([X, z, contra]) => { const [cx, cy] = P(X, z); s += CZ_carroFrente(cx, cy, 2.4 / z, { costas: !contra, rot: rnd(-10, 10) });
        if (rnd(0, 1) < 0.25 && z < 8) s += `<g transform="translate(${f(cx + 130 / z)} ${f(cy - 20 / z)}) scale(${f(2 / z)})"><rect x="0" y="-60" width="70" height="60" rx="8" fill="${pick(['#4A3A6A', '#8A2A2A', '#2A4A6A'])}" stroke="${L}" stroke-width="5"/><path d="M20 -60 v-14 h30 v14" stroke="${L}" stroke-width="5" fill="none"/></g>`; });   // malas largadas
      for (let i = 0; i < 40; i++) { const z = 1 + rnd(0, 1) ** 1.5 * 12, X = rnd(-1200, 1200), [cx, cy] = P(X, z); s += `<path d="M${f(cx)} ${f(cy)} l${f(30 / z)} ${f(-6 / z)} l${f(10 / z)} ${f(12 / z)}Z" fill="${pick(['#E8E2D0', '#C8C0A8'])}" opacity=".8"/>`; }
      return clip(x, y, w, h, s + C.atmosfera({ grao: 0.3, vinheta: false }));
    };
    return { get predio() { return CZ_predio; }, get onibus() { return CZ_onibus; }, get carroFrente() { return CZ_carroFrente; }, get avenida() { return CZ_avenida; }, get avenidaLado() { return CZ_avenidaLado; }, get ponte() { return CZ_ponte; }, get ponteFrente() { return CZ_ponteFrente; }, get carroLado() { return CZ_carroLado; }, get proj() { return CZ_proj; }, get ruinas() { return CZ_ruinas; }, get rodovia() { return CZ_rodovia; } };
  }
  global.CidadeZumbi = CidadeZumbi;
})(typeof window !== 'undefined' ? window : globalThis);
