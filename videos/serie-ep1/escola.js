/*
  escola.js — cenários de ESCOLA de hoje para a série "O garoto do tênis laranja" (skill "cenario-ilustrado").
  Depende de cenario.js. Pensado para o ENQUADRAMENTO GRANDE (personagem grande, chão alto, legenda embaixo):
  `chao` = onde a parede do fundo encontra o piso; os pés de quem está na frente ficam mais embaixo (≈ 1380).

  const E = Escola(Cenario({ seed: 3, luz: -1, hora: 'dia' }));
  s += E.fachada({ chao: 1250 })        // portão, muro, prédio com placa ESCOLA ESTADUAL, árvores, calçada
  s += E.corredor({ chao: 1160 })       // armários de metal, mural de recados, janelas, piso de granilite
  s += E.refeitorio({ chao: 1150 })     // azulejo, balcão de comida com cubas, cardápio, mesas e bancos ao fundo
  s += E.quarto({ chao: 1200, noite: true })   // cama, janela com lua, mesa, pôster, abajur
  s += E.mesa(x, yPiso, k) · E.banco(x, yPiso, k)   // móveis soltos (para pôr na ordem de profundidade)
  s += E.bandeja(x, y, k, { suco: true })           // bandeja com prato de arroz e feijão + copo de suco
  s += E.telaCelular(x, y, w, h, { views: '2 MIL', usuario: '@duda' })   // tela de vídeo (tipo TikTok) com o vídeo postado
  Textos em português; letreiros em fonte Anton (cabem no lugar: data-caber, skill fisica-de-cena).
*/
(function (global) {
  function Escola(C) {
    const tom = C.tom, rnd = C.rnd, pick = C.pick;
    const L = '#1D1D2B', f = v => Math.round(v * 10) / 10;
    const E = {};
    const clip = (x, y, w, h, corpo) => { const id = `ce${Math.floor(rnd(1e5, 1e6))}`; return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${corpo}</g>`; };
    const texto = (t, cx, cy, larg, alt, cor = '#fff', fonte = 'Anton') => { const fs = Math.min(alt, larg / Math.max(1, t.length * 0.5)); return `<text x="${f(cx)}" y="${f(cy)}" font-family="'${fonte}', 'DejaVu Sans Condensed', sans-serif" font-size="${f(fs)}" fill="${cor}" text-anchor="middle" dominant-baseline="central" data-caber="${f(larg)}">${t}</text>`; };
    const parede = (x, y, w, h, cor) => { let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cor}"/>`; for (let i = 0; i < 7; i++) s += `<ellipse cx="${f(rnd(x, x + w))}" cy="${f(rnd(y, y + h))}" rx="${f(rnd(80, 200))}" ry="${f(rnd(50, 120))}" fill="${tom(cor, rnd(-0.07, 0.04))}" opacity=".45"/>`; return s; };
    // piso em perspectiva: linhas horizontais cada vez mais espaçadas para baixo + juntas fugindo para o centro
    const piso = (x, y, w, h, cor, { juntas = true, granilite = false } = {}) => {
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cor}"/>`;
      for (let k = 1, yy = y; yy < y + h; k++) { yy = y + h * Math.pow(k / 9, 1.7); s += `<path d="M${x} ${f(yy)} H${x + w}" stroke="${tom(cor, -0.14)}" stroke-width="${f(1.5 + k * 0.5)}"/>`; }
      if (juntas) for (let i = -6; i <= 6; i++) s += `<path d="M${f(x + w / 2 + i * 70)} ${y} L${f(x + w / 2 + i * 260)} ${y + h}" stroke="${tom(cor, -0.12)}" stroke-width="3"/>`;
      if (granilite) for (let i = 0; i < 160; i++) { const yy = y + rnd(0, h), sz = 1 + (yy - y) / h * 3; s += `<circle cx="${f(rnd(x, x + w))}" cy="${f(yy)}" r="${f(sz)}" fill="${pick(['#8A8A88', '#F2F2EE', '#6A6A6C'])}" opacity=".5"/>`; }
      return s;
    };
    const rodape = (x, y, w, cor) => `<rect x="${x}" y="${f(y - 34)}" width="${w}" height="34" fill="${cor}"/><path d="M${x} ${f(y - 34)} H${x + w}" stroke="${tom(cor, -0.25)}" stroke-width="4"/>`;
    const janela = (x, y, w, h, ceu = '#9ED3F0', noite = false) => {
      let s = `<rect x="${f(x - 10)}" y="${f(y - 10)}" width="${f(w + 20)}" height="${f(h + 20)}" rx="6" fill="#E9ECEF" stroke="${L}" stroke-width="5"/><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${noite ? '#14183A' : ceu}"/>`;
      if (!noite) s += `<path d="M${f(x + w * 0.1)} ${f(y + h * 0.85)} L${f(x + w * 0.5)} ${f(y + h * 0.1)}" stroke="#fff" stroke-width="10" opacity=".35"/>`;
      return s + `<path d="M${f(x + w / 2)} ${f(y)} V${f(y + h)} M${f(x)} ${f(y + h / 2)} H${f(x + w)}" stroke="#E9ECEF" stroke-width="8"/>`;
    };

    // ---------- fachada: céu, prédio da escola com placa, portão aberto, muro, árvores, calçada ----------
    E.fachada = ({ x = 0, y = 0, w = 1080, h = 1920, chao = y + h * 0.65, nome = 'ESCOLA ESTADUAL' } = {}) => {
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#BFE3F7"/><rect x="${x}" y="${f(y + (chao - y) * 0.45)}" width="${w}" height="${f((chao - y) * 0.55)}" fill="#DDF0FA"/>`;
      s += [[0.15, 0.12], [0.62, 0.08]].map(([u, v]) => `<g opacity=".9"><ellipse cx="${f(x + w * u)}" cy="${f(y + (chao - y) * v + 120)}" rx="90" ry="34" fill="#fff"/><ellipse cx="${f(x + w * u + 60)}" cy="${f(y + (chao - y) * v + 100)}" rx="70" ry="40" fill="#fff"/></g>`).join('');
      const py = y + (chao - y) * 0.3;
      s += `<rect x="${f(x + 40)}" y="${f(py)}" width="${f(w - 80)}" height="${f(chao - py)}" fill="#F2E3C4" stroke="${L}" stroke-width="6"/><rect x="${f(x + 40)}" y="${f(chao - 160)}" width="${f(w - 80)}" height="160" fill="#E2A65A"/>`;
      s += `<rect x="${f(x + 30)}" y="${f(py - 30)}" width="${f(w - 60)}" height="40" fill="#C9603A" stroke="${L}" stroke-width="5"/>`;
      for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) s += janela(x + 90 + k * 235, py + 70 + r * 210, 150, 130);
      s += `<rect x="${f(x + w / 2 - 260)}" y="${f(py - 130)}" width="520" height="96" rx="12" fill="#2E5E9E" stroke="${L}" stroke-width="6"/>` + texto(nome, x + w / 2, py - 82, 470, 64);
      // muro baixo com portão aberto
      s += `<rect x="${x}" y="${f(chao - 120)}" width="${f(w * 0.3)}" height="120" fill="#D9D2C4" stroke="${L}" stroke-width="5"/><rect x="${f(x + w * 0.7)}" y="${f(chao - 120)}" width="${f(w * 0.3)}" height="120" fill="#D9D2C4" stroke="${L}" stroke-width="5"/>`;
      for (let k = 0; k < 7; k++) s += `<path d="M${f(x + w * 0.3 + k * 18)} ${f(chao - 200)} V${f(chao)}" stroke="#3A4A5A" stroke-width="7"/>`;
      s += `<path d="M${f(x + w * 0.3)} ${f(chao - 200)} H${f(x + w * 0.3 + 108)}" stroke="#3A4A5A" stroke-width="9"/>`;
      // árvores nas pontas
      [[x + 20, 1], [x + w - 20, -1]].forEach(([tx]) => { s += `<rect x="${f(tx - 14)}" y="${f(chao - 330)}" width="28" height="330" fill="#7A5432" stroke="${L}" stroke-width="5"/><circle cx="${f(tx)}" cy="${f(chao - 380)}" r="120" fill="#4E9A4A" stroke="${L}" stroke-width="6"/><circle cx="${f(tx - 50)}" cy="${f(chao - 420)}" r="60" fill="#5FB25A"/>`; });
      // calçada (onde ficam os pés) e meio-fio
      s += piso(x, chao, w, y + h - chao, '#C9C4B8');
      s += `<rect x="${x}" y="${f(y + h - 110)}" width="${w}" height="110" fill="#5A5A62"/><rect x="${x}" y="${f(y + h - 120)}" width="${w}" height="14" fill="#E2DED4"/>`;
      return clip(x, y, w, h, s);
    };

    // ---------- corredor: armários de metal, mural, porta de sala, janela alta, piso de granilite ----------
    E.corredor = ({ x = 0, y = 0, w = 1080, h = 1920, chao = y + h * 0.6 } = {}) => {
      let s = parede(x, y, w, chao - y, '#E8E2D2') + `<rect x="${x}" y="${f(y + (chao - y) * 0.55)}" width="${w}" height="${f((chao - y) * 0.45)}" fill="#7FA8C9"/><path d="M${x} ${f(y + (chao - y) * 0.55)} H${x + w}" stroke="${L}" stroke-width="5"/>`;
      s += janela(x + w * 0.62, y + (chao - y) * 0.12, 300, 220);
      // mural de recados com papéis
      const mx = x + 60, my = y + (chao - y) * 0.12;
      s += `<rect x="${f(mx)}" y="${f(my)}" width="380" height="250" fill="#B5814A" stroke="${L}" stroke-width="6"/><rect x="${f(mx + 12)}" y="${f(my + 12)}" width="356" height="226" fill="#C99A62"/>`;
      [['#FFF4A8', -4], ['#FFFFFF', 3], ['#A8E0FF', -2], ['#FFC9D6', 5]].forEach(([c, r], i) => { s += `<rect x="${f(mx + 30 + i * 85)}" y="${f(my + 40 + (i % 2) * 70)}" width="70" height="90" fill="${c}" stroke="${L}" stroke-width="3" transform="rotate(${r} ${f(mx + 65 + i * 85)} ${f(my + 85)})"/><circle cx="${f(mx + 65 + i * 85)}" cy="${f(my + 48 + (i % 2) * 70)}" r="6" fill="#D7263D"/>`; });
      // fileira de armários
      const ay = chao - (chao - y) * 0.42, aw = 120;
      for (let k = 0; k * aw < w; k++) { const ax = x + k * aw, c = k % 3 === 1 ? '#3E6E9E' : '#4A7FB0';
        s += `<rect x="${f(ax)}" y="${f(ay)}" width="${aw}" height="${f(chao - ay)}" fill="${c}" stroke="${L}" stroke-width="5"/>` + [0, 1, 2].map(i => `<path d="M${f(ax + 30)} ${f(ay + 30 + i * 14)} h60" stroke="${tom(c, -0.3)}" stroke-width="5"/>`).join('') + `<rect x="${f(ax + aw - 30)}" y="${f(ay + (chao - ay) * 0.45)}" width="12" height="40" rx="4" fill="#D9DEE4" stroke="${L}" stroke-width="3"/>`; }
      s += rodape(x, chao, w, '#5A6A7A');
      s += piso(x, chao, w, y + h - chao, '#D6D2C8', { granilite: true });
      return clip(x, y, w, h, s);
    };

    // ---------- refeitório: azulejo, balcão de comida com cubas e vidro, cardápio, mesas ao fundo ----------
    E.refeitorio = ({ x = 0, y = 0, w = 1080, h = 1920, chao = y + h * 0.6, balcao = true, mesasFundo = true } = {}) => {
      let s = parede(x, y, w, chao - y, '#F1EEE6');
      const az = y + (chao - y) * 0.5;
      s += `<rect x="${x}" y="${f(az)}" width="${w}" height="${f(chao - az)}" fill="#CFE8E2"/>`;
      for (let yy = az; yy < chao; yy += 40) for (let xx = x; xx < x + w; xx += 40) s += `<rect x="${xx + 2}" y="${f(yy + 2)}" width="36" height="36" fill="${tom('#D9EEE9', rnd(-0.04, 0.03))}"/>`;
      s += `<path d="M${x} ${f(az)} H${x + w}" stroke="#7FB3A8" stroke-width="8"/>`;
      // janelas altas e luminárias
      for (let k = 0; k < 2; k++) s += janela(x + 120 + k * 560, y + (chao - y) * 0.1, 260, 180);
      [0.25, 0.75].forEach(u => { s += `<path d="M${f(x + w * u)} ${y} v40" stroke="#5A5A62" stroke-width="5"/><rect x="${f(x + w * u - 110)}" y="${y + 40}" width="220" height="22" rx="8" fill="#F2F2EE" stroke="${L}" stroke-width="4"/><path d="M${f(x + w * u - 100)} ${y + 62} L${f(x + w * u - 160)} ${y + 230} H${f(x + w * u + 160)} L${f(x + w * u + 100)} ${y + 62}Z" fill="#FFF8D8" opacity=".25"/>`; });
      // cardápio
      const cx = x + w * 0.5 - 170, cy = y + (chao - y) * 0.13;
      s += `<rect x="${f(cx)}" y="${f(cy)}" width="340" height="200" rx="10" fill="#2E4A3A" stroke="#8A5A34" stroke-width="12"/>` + texto('CARDÁPIO DO DIA', cx + 170, cy + 42, 290, 40, '#FFFFFF') + texto('ARROZ • FEIJÃO • FRANGO', cx + 170, cy + 100, 300, 30, '#F2E9A0') + texto('SUCO DE LARANJA', cx + 170, cy + 148, 300, 30, '#F2E9A0');
      if (balcao) {   // balcão de comida (inox) com cubas e vidro protetor
        const by = chao - 190;
        s += `<rect x="${x}" y="${f(by)}" width="${w}" height="190" fill="#B9BEC6" stroke="${L}" stroke-width="6"/><rect x="${x}" y="${f(by)}" width="${w}" height="26" fill="#D9DEE4" stroke="${L}" stroke-width="4"/>`;
        for (let k = 0; k < 5; k++) { const cx2 = x + 70 + k * 200; s += `<rect x="${f(cx2)}" y="${f(by - 14)}" width="150" height="30" rx="6" fill="#8A9098" stroke="${L}" stroke-width="4"/><ellipse cx="${f(cx2 + 75)}" cy="${f(by - 14)}" rx="66" ry="12" fill="${['#F4F1E8', '#6A3A22', '#E8B04A', '#7AB04A', '#F4F1E8'][k]}"/>`; }
        s += `<path d="M${x} ${f(by - 120)} H${x + w}" stroke="#BFE6F2" stroke-width="10" opacity=".7"/><path d="M${x} ${f(by - 120)} L${x} ${f(by)} M${x + w} ${f(by - 120)} V${f(by)}" stroke="#8AA" stroke-width="4"/>`;
        for (let k = 0; k < 6; k++) s += `<path d="M${f(x + 30 + k * 190)} ${f(by + 60)} h120" stroke="#9AA0A8" stroke-width="4"/>`;
      }
      s += rodape(x, chao, w, '#7FB3A8');
      s += piso(x, chao, w, y + h - chao, '#E2D8C4');
      if (mesasFundo) s += E.mesa(x + w * 0.2, chao + 40, 0.55) + E.mesa(x + w * 0.8, chao + 40, 0.55);
      return clip(x, y, w, h, s);
    };

    // ---------- móveis do refeitório (pés no piso yPiso; k = escala pela distância) ----------
    E.mesa = (x, yPiso, k = 1, { cor = '#E9E4D8' } = {}) => {
      const W = 420 * k, H = 150 * k, t = 22 * k;
      return `<g><ellipse cx="${f(x)}" cy="${f(yPiso + 2)}" rx="${f(W * 0.55)}" ry="${f(12 * k)}" fill="#000" opacity=".18"/><rect x="${f(x - W / 2 + 20 * k)}" y="${f(yPiso - H)}" width="${f(14 * k)}" height="${f(H)}" fill="#8A9098" stroke="${L}" stroke-width="${f(4 * k + 1)}"/><rect x="${f(x + W / 2 - 34 * k)}" y="${f(yPiso - H)}" width="${f(14 * k)}" height="${f(H)}" fill="#8A9098" stroke="${L}" stroke-width="${f(4 * k + 1)}"/><rect x="${f(x - W / 2)}" y="${f(yPiso - H - t)}" width="${f(W)}" height="${f(t)}" rx="${f(6 * k)}" fill="${cor}" stroke="${L}" stroke-width="${f(5 * k + 1)}"/></g>`;
    };
    E.banco = (x, yPiso, k = 1, { largura = 420 } = {}) => {
      const W = largura * k, H = 84 * k, t = 18 * k;
      return `<g><rect x="${f(x - W / 2 + 16 * k)}" y="${f(yPiso - H)}" width="${f(12 * k)}" height="${f(H)}" fill="#8A9098" stroke="${L}" stroke-width="${f(4 * k + 1)}"/><rect x="${f(x + W / 2 - 28 * k)}" y="${f(yPiso - H)}" width="${f(12 * k)}" height="${f(H)}" fill="#8A9098" stroke="${L}" stroke-width="${f(4 * k + 1)}"/><rect x="${f(x - W / 2)}" y="${f(yPiso - H - t)}" width="${f(W)}" height="${f(t)}" rx="${f(5 * k)}" fill="#C9A26A" stroke="${L}" stroke-width="${f(5 * k + 1)}"/></g>`;
    };
    E.banco.altura = 102;   // topo do assento acima do piso (× k)

    // ---------- bandeja do refeitório: prato com arroz/feijão/frango + copo de suco de laranja ----------
    E.bandeja = (x, y, k = 1, { suco = true, prato = true } = {}) => {
      let s = `<g transform="translate(${f(x)} ${f(y)}) scale(${k})">`;
      s += `<rect x="-90" y="-8" width="180" height="16" rx="5" fill="#C9603A" stroke="${L}" stroke-width="4"/>`;
      if (prato) s += `<ellipse cx="-20" cy="-12" rx="56" ry="12" fill="#F4F6F8" stroke="${L}" stroke-width="3"/><ellipse cx="-38" cy="-18" rx="22" ry="8" fill="#FBF8EE"/><ellipse cx="-4" cy="-17" rx="16" ry="6" fill="#5A2E1A"/><ellipse cx="14" cy="-18" rx="12" ry="6" fill="#E0A04A"/>`;
      if (suco) s += `<path d="M48 -10 L44 -58 H76 L72 -10Z" fill="#FF9A3C" fill-opacity=".85" stroke="${L}" stroke-width="3"/><path d="M44 -58 H76" stroke="#fff" stroke-width="3"/>`;
      return s + `</g>`;
    };
    E.arrozNoChao = (x, y, k = 1) => { let s = `<g transform="translate(${f(x)} ${f(y)}) scale(${k})"><ellipse cx="0" cy="0" rx="120" ry="20" fill="#FBF8EE" opacity=".9"/>`; for (let i = 0; i < 40; i++) s += `<ellipse cx="${f(rnd(-150, 150))}" cy="${f(rnd(-18, 22))}" rx="4" ry="2" fill="#FFFFFF" stroke="#CFC8B8" stroke-width="1"/>`; return s + `<ellipse cx="60" cy="8" rx="50" ry="12" fill="#5A2E1A" opacity=".85"/><path d="M-200 30 Q-120 10 -60 26 Q20 40 120 28" stroke="#FF9A3C" stroke-width="16" fill="none" opacity=".7" stroke-linecap="round"/></g>`; };

    // ---------- quarto à noite: parede azul escura, janela com lua, cama, mesa com abajur, pôster ----------
    E.quarto = ({ x = 0, y = 0, w = 1080, h = 1920, chao = y + h * 0.62, noite = true } = {}) => {
      const pc = noite ? '#2E3A66' : '#8FB0D9';
      let s = parede(x, y, w, chao - y, pc);
      s += janela(x + w * 0.58, y + (chao - y) * 0.18, 300, 260, '#9ED3F0', noite);
      if (noite) s += `<circle cx="${f(x + w * 0.58 + 220)}" cy="${f(y + (chao - y) * 0.18 + 70)}" r="34" fill="#F4EFD6"/><circle cx="${f(x + w * 0.58 + 234)}" cy="${f(y + (chao - y) * 0.18 + 62)}" r="30" fill="#14183A"/>` + [...Array(10)].map(() => `<circle cx="${f(x + w * 0.58 + rnd(10, 290))}" cy="${f(y + (chao - y) * 0.18 + rnd(10, 250))}" r="2" fill="#fff"/>`).join('');
      s += `<rect x="${f(x + 80)}" y="${f(y + (chao - y) * 0.2)}" width="200" height="270" fill="${noite ? '#5A3A6A' : '#9A5ABA'}" stroke="${L}" stroke-width="5" transform="rotate(-3 ${f(x + 180)} ${f(y + (chao - y) * 0.33)})"/><circle cx="${f(x + 180)}" cy="${f(y + (chao - y) * 0.3)}" r="50" fill="${noite ? '#B8742A' : '#FF9A3C'}"/>`;
      // luz do abajur
      if (noite) s += `<circle cx="${f(x + w * 0.88)}" cy="${f(chao - 330)}" r="300" fill="#FFD27A" opacity=".12"/>`;
      s += `<rect x="${x}" y="${f(chao)}" width="${w}" height="${f(y + h - chao)}" fill="${noite ? '#4A3A32' : '#A8835A'}"/>`;
      for (let k = 1, yy = chao; yy < y + h; k++) { yy = chao + (y + h - chao) * Math.pow(k / 8, 1.6); s += `<path d="M${x} ${f(yy)} H${x + w}" stroke="${noite ? '#3A2A24' : '#8A6A44'}" stroke-width="3"/>`; }
      // mesa com abajur (direita, encostada na parede)
      const mx = x + w * 0.88;
      s += `<rect x="${f(mx - 120)}" y="${f(chao - 200)}" width="240" height="20" fill="#8A5A34" stroke="${L}" stroke-width="5"/><rect x="${f(mx - 110)}" y="${f(chao - 180)}" width="16" height="180" fill="#6A4428"/><rect x="${f(mx + 94)}" y="${f(chao - 180)}" width="16" height="180" fill="#6A4428"/>`;
      s += `<path d="M${f(mx)} ${f(chao - 200)} v-80" stroke="${L}" stroke-width="6"/><path d="M${f(mx - 50)} ${f(chao - 280)} L${f(mx - 34)} ${f(chao - 340)} H${f(mx + 34)} L${f(mx + 50)} ${f(chao - 280)}Z" fill="#FFE08A" stroke="${L}" stroke-width="5"/>`;
      return clip(x, y, w, h, s);
    };
    // cama (de lado): cabeceira à esquerda; assento/colchão em yPiso - 150*k
    E.cama = (x, yPiso, k = 1, { noite = true } = {}) => {
      const W = 620 * k;
      return `<g><ellipse cx="${f(x)}" cy="${f(yPiso + 2)}" rx="${f(W * 0.55)}" ry="${f(14 * k)}" fill="#000" opacity=".25"/><rect x="${f(x - W / 2)}" y="${f(yPiso - 300 * k)}" width="${f(30 * k)}" height="${f(300 * k)}" fill="#7A4E2C" stroke="${L}" stroke-width="5"/><rect x="${f(x - W / 2)}" y="${f(yPiso - 110 * k)}" width="${f(W)}" height="${f(110 * k)}" fill="#8A5A34" stroke="${L}" stroke-width="5"/><rect x="${f(x - W / 2 + 20 * k)}" y="${f(yPiso - 160 * k)}" width="${f(W - 30 * k)}" height="${f(60 * k)}" rx="${f(18 * k)}" fill="${noite ? '#C9C2DA' : '#F2EEF8'}" stroke="${L}" stroke-width="5"/><rect x="${f(x - W / 2 + 40 * k)}" y="${f(yPiso - 196 * k)}" width="${f(150 * k)}" height="${f(46 * k)}" rx="${f(20 * k)}" fill="#F4F6F8" stroke="${L}" stroke-width="4"/><path d="M${f(x - W / 2 + 230 * k)} ${f(yPiso - 158 * k)} Q${f(x + 80 * k)} ${f(yPiso - 176 * k)} ${f(x + W / 2 - 10 * k)} ${f(yPiso - 156 * k)} V${f(yPiso - 100 * k)} H${f(x - W / 2 + 230 * k)}Z" fill="${noite ? '#3E6E9E' : '#5A8EC9'}" stroke="${L}" stroke-width="4"/></g>`;
    };
    E.cama.assento = 150;

    // ---------- tela de celular em close: vídeo postado (tipo rede social), visualizações, curtidas ----------
    E.telaCelular = (x, y, w, h, { views = '2 MIL', usuario = '@duda', legenda = 'KKKKK O CENOURINHA', conteudo = '' } = {}) => {
      let s = `<rect x="${f(x - 26)}" y="${f(y - 60)}" width="${f(w + 52)}" height="${f(h + 120)}" rx="60" fill="#1A1C22" stroke="${L}" stroke-width="8"/><rect x="${f(x + w / 2 - 70)}" y="${f(y - 40)}" width="140" height="22" rx="11" fill="#0A0A0E"/>`;
      s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="20" fill="#000"/>`;
      s += `<g>${conteudo}</g>`;
      s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h * 0.12)}" fill="#000" opacity=".35"/>` + texto('PARA VOCÊ', x + w / 2, y + h * 0.06, w * 0.4, h * 0.035, '#FFFFFF');
      // lateral: curtir, comentar, compartilhar
      const icones = [
        (cx, cy) => `<path d="M${f(cx)} ${f(cy + 16)} C${f(cx - 34)} ${f(cy - 6)} ${f(cx - 22)} ${f(cy - 30)} ${f(cx)} ${f(cy - 14)} C${f(cx + 22)} ${f(cy - 30)} ${f(cx + 34)} ${f(cy - 6)} ${f(cx)} ${f(cy + 16)}Z" fill="#FF3B5C"/>`,
        (cx, cy) => `<path d="M${f(cx - 22)} ${f(cy - 16)} H${f(cx + 22)} Q${f(cx + 28)} ${f(cy - 16)} ${f(cx + 28)} ${f(cy - 8)} V${f(cy + 8)} Q${f(cx + 28)} ${f(cy + 14)} ${f(cx + 22)} ${f(cy + 14)} H${f(cx - 6)} L${f(cx - 16)} ${f(cy + 24)} V${f(cy + 14)} H${f(cx - 22)} Q${f(cx - 28)} ${f(cy + 14)} ${f(cx - 28)} ${f(cy + 8)} V${f(cy - 8)} Q${f(cx - 28)} ${f(cy - 16)} ${f(cx - 22)} ${f(cy - 16)}Z" fill="#FFFFFF"/>`,
        (cx, cy) => `<path d="M${f(cx - 20)} ${f(cy + 14)} Q${f(cx - 16)} ${f(cy - 10)} ${f(cx + 6)} ${f(cy - 10)} V${f(cy - 22)} L${f(cx + 26)} ${f(cy - 2)} L${f(cx + 6)} ${f(cy + 18)} V${f(cy + 6)} Q${f(cx - 10)} ${f(cy + 4)} ${f(cx - 20)} ${f(cy + 14)}Z" fill="#FFFFFF"/>`];
      [['1,2 MIL'], ['348'], ['210']].forEach(([n], i) => { const cy = y + h * (0.5 + i * 0.12); s += `<circle cx="${f(x + w - 60)}" cy="${f(cy)}" r="38" fill="#000" opacity=".35"/>` + icones[i](x + w - 60, cy) + texto(n, x + w - 60, cy + 58, 100, 24); });
      s += texto(usuario, x + w * 0.3, y + h * 0.84, w * 0.5, h * 0.035, '#FFFFFF') + texto(legenda, x + w * 0.42, y + h * 0.9, w * 0.78, h * 0.03, '#EEEEEE');
      s += `<g class="views"><rect x="${f(x + 24)}" y="${f(y + h * 0.31)}" width="${f(w * 0.56)}" height="${f(h * 0.065)}" rx="${f(h * 0.032)}" fill="#000" opacity=".8"/><text class="views-num" x="${f(x + 24 + w * 0.28)}" y="${f(y + h * 0.3425)}" font-family="'Anton', sans-serif" font-size="${f(h * 0.035)}" fill="#fff" text-anchor="middle" dominant-baseline="central" data-caber="${f(w * 0.5)}">${views} VISUALIZAÇÕES</text></g>`;
      return s;
    };
    return E;
  }
  global.Escola = Escola;
})(typeof window !== 'undefined' ? window : globalThis);
