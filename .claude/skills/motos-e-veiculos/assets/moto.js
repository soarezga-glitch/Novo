/*
  moto.js — MOTO DE ROQUEIRO ANTIGA (estilo bobber/chopper dos anos 70) em 3 vistas, para a série (skill motos-e-veiculos;
  método da skill vehicle-design: proporção → silhueta → rodas → postura → detalhe). Escala 1 = ao lado de um boneco escala 1
  (moto ≈ 2,1 m de comprimento = 690 px; roda ≈ 0,66 m de diâmetro = 216 px; banco na altura do quadril de quem está sentado).
  Origem de TODAS as vistas = chão, no meio da moto.
    Moto.lado(k, { roda, farol, lanca })  vista de lado, frente para +x (espelhe com scale(-1,1)); roda = ângulo dos raios
    Moto.lado.pontos(k)                   { assento, pe, guidao } para o boneco 'montar' (skill fisica-de-cena)
    Moto.frente(k, { farol })             vindo na direção da câmera (farol aceso, garfo, pneu fino, guidão largo, motor em V dos dois lados)
    Moto.frente.pontos(k)                 { assento, pe: [esq, dir], guidao: [esq, dir] } para o piloto de frente
    Moto.tras(k, { freio })               indo embora (lanterna, para-lama cortado, escapamentos, pneu traseiro largo)
    Moto.tras.pontos(k)
  Peças que vendem o estilo: tanque gota com faixa, banco solo de couro com molas, motor V2 com aletas, escapamentos cromados
  duplos, guidão alto e largo, farol redondo grande, rodas raiadas com pneu gordo na frente, para-lama traseiro cortado,
  alforje de couro, a LANÇA DE VERGALHÃO presa na lateral.
*/
(function (global) {
  const L = '#0E0E14', f = v => Math.round(v * 10) / 10, CR = '#C8CED6', CR2 = '#8A929C', PRETO = '#18181C', COURO = '#3A2618';
  const Moto = {};
  const roda = (cx, cy, R, ang, gordo) => {
    let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#16161A" stroke="${L}" stroke-width="6"/><circle cx="${cx}" cy="${cy}" r="${R - (gordo ? 30 : 24)}" fill="#2A2A30" stroke="#0A0A0C" stroke-width="3"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R - (gordo ? 34 : 28)}" fill="none" stroke="${CR2}" stroke-width="7"/>`;
    s += `<g transform="rotate(${f(ang)} ${cx} ${cy})">${[...Array(18)].map((_, i) => { const a = i / 18 * Math.PI * 2, r1 = 14, r2 = R - (gordo ? 36 : 30); return `<path d="M${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)} L${f(cx + Math.cos(a + 0.3) * r2)} ${f(cy + Math.sin(a + 0.3) * r2)}" stroke="#B8BEC6" stroke-width="2.2"/>`; }).join('')}</g>`;
    s += `<circle cx="${cx}" cy="${cy}" r="16" fill="${CR}" stroke="${L}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="5" fill="${L}"/>`;
    s += [...Array(14)].map((_, i) => { const a = i / 14 * Math.PI * 2 + ang * Math.PI / 180; return `<path d="M${f(cx + Math.cos(a) * (R - 4))} ${f(cy + Math.sin(a) * (R - 4))} L${f(cx + Math.cos(a) * (R - 13))} ${f(cy + Math.sin(a) * (R - 13))}" stroke="#2E2E34" stroke-width="5"/>`; }).join('');
    return s; };
  // ---------------- DE LADO ----------------
  Moto.lado = (k = 1, { roda: ang = 0, farol = true, lanca = true } = {}) => {
    const R = 108, rx0 = -250, rx1 = 260, ry = -R;
    let s = `<g transform="scale(${k})"><ellipse cx="0" cy="6" rx="340" ry="22" fill="#000" opacity=".35"/>`;
    // para-lama traseiro cortado e alforje de couro
    s += `<path d="M${rx0 - 120} ${ry - 20} Q${rx0 - 110} ${ry - 128} ${rx0} ${ry - 130} Q${rx0 + 70} ${ry - 126} ${rx0 + 96} ${ry - 70}" stroke="${PRETO}" stroke-width="26" fill="none" stroke-linecap="round"/><path d="M${rx0 - 120} ${ry - 20} Q${rx0 - 110} ${ry - 128} ${rx0} ${ry - 130}" stroke="#4A4A54" stroke-width="6" fill="none"/>`;
    s += `<rect x="${rx0 - 104}" y="${ry - 112}" width="96" height="72" rx="14" fill="${COURO}" stroke="${L}" stroke-width="5"/><path d="M${rx0 - 96} ${ry - 92} h80" stroke="#5A3E28" stroke-width="4"/><rect x="${rx0 - 66}" y="${ry - 100}" width="14" height="22" rx="3" fill="${CR2}" stroke="${L}" stroke-width="2"/>`;
    s += `<circle cx="${rx0 - 122}" cy="${ry - 28}" r="10" fill="#D02A22" stroke="${L}" stroke-width="3"/>`;   // lanterna
    // roda traseira (pneu normal) e dianteira (pneu gordo)
    s += roda(rx0, ry, R, ang, false) + roda(rx1, ry, R, ang, true);
    // balança traseira, amortecedores
    s += `<path d="M${rx0} ${ry} L${-60} ${ry - 18}" stroke="${PRETO}" stroke-width="16" stroke-linecap="round"/><path d="M${rx0 + 10} ${ry - 8} L${rx0 + 60} ${ry - 150}" stroke="${CR}" stroke-width="12" stroke-linecap="round"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${rx0 + 22 + i * 8} ${ry - 38 - i * 22} l14 -4" stroke="${L}" stroke-width="3"/>`).join('')}`;
    // quadro (berço duplo) e motor V2 com aletas
    s += `<path d="M-60 ${ry - 18} L-120 ${ry - 150} L150 ${ry - 196} L200 ${ry - 40} L40 ${ry + 10} Z" fill="none" stroke="${PRETO}" stroke-width="14" stroke-linejoin="round"/>`;
    s += `<path d="M-40 ${ry + 6} L90 ${ry + 6} L110 ${ry - 40} L-50 ${ry - 40}Z" fill="#3A3A42" stroke="${L}" stroke-width="5"/>`;
    [[-10, -14], [60, 14]].forEach(([cx, rot]) => { s += `<g transform="rotate(${rot} ${cx} ${ry - 40})"><rect x="${cx - 28}" y="${ry - 150}" width="56" height="112" rx="6" fill="${CR2}" stroke="${L}" stroke-width="5"/>${[...Array(8)].map((_, i) => `<rect x="${cx - 36}" y="${ry - 144 + i * 13}" width="72" height="6" rx="3" fill="${CR}" stroke="${L}" stroke-width="2"/>`).join('')}<rect x="${cx - 22}" y="${ry - 164}" width="44" height="16" rx="4" fill="${CR}" stroke="${L}" stroke-width="4"/></g>`; });
    s += `<circle cx="10" cy="${ry - 18}" r="30" fill="${CR}" stroke="${L}" stroke-width="5"/><circle cx="10" cy="${ry - 18}" r="14" fill="${CR2}"/>`;   // tampa do motor
    // escapamentos cromados duplos
    s += `<path d="M70 ${ry - 60} Q120 ${ry - 10} 60 ${ry + 34} L${rx0 - 60} ${ry + 22}" stroke="${L}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M70 ${ry - 60} Q120 ${ry - 10} 60 ${ry + 34} L${rx0 - 60} ${ry + 22}" stroke="${CR}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M60 ${ry + 30} L${rx0 - 56} ${ry + 18}" stroke="#FFFFFF" stroke-width="4" opacity=".6"/>`;
    s += `<path d="M-20 ${ry - 60} Q10 ${ry + 10} -30 ${ry + 50} L${rx0 - 70} ${ry + 46}" stroke="${L}" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M-20 ${ry - 60} Q10 ${ry + 10} -30 ${ry + 50} L${rx0 - 70} ${ry + 46}" stroke="${CR}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    // tanque gota com faixa e tampa
    s += `<path d="M-50 ${ry - 196} Q20 ${ry - 268} 150 ${ry - 222} Q170 ${ry - 190} 140 ${ry - 168} Q40 ${ry - 160} -50 ${ry - 196}Z" fill="#5A1A16" stroke="${L}" stroke-width="6"/><path d="M-30 ${ry - 206} Q40 ${ry - 246} 140 ${ry - 210}" stroke="#E8D8B0" stroke-width="8" fill="none"/><path d="M0 ${ry - 236} Q60 ${ry - 256} 120 ${ry - 236}" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".35"/><ellipse cx="60" cy="${ry - 246}" rx="14" ry="6" fill="${CR}" stroke="${L}" stroke-width="3"/>`;
    // banco solo de couro com molas
    s += `<path d="M-170 ${ry - 160} Q-140 ${ry - 196} -60 ${ry - 196} Q-40 ${ry - 186} -54 ${ry - 168} Q-110 ${ry - 158} -170 ${ry - 160}Z" fill="${COURO}" stroke="${L}" stroke-width="5"/><path d="M-150 ${ry - 172} Q-110 ${ry - 186} -70 ${ry - 184}" stroke="#5A3E28" stroke-width="4" fill="none"/>`;
    s += `<path d="M-150 ${ry - 158} l-6 34 M-110 ${ry - 160} l-4 30" stroke="${CR}" stroke-width="6"/>`;
    // garfo dianteiro, mesa, farol redondo grande, guidão alto e largo, retrovisor
    s += `<path d="M${rx1} ${ry} L170 ${ry - 250}" stroke="${L}" stroke-width="20" stroke-linecap="round"/><path d="M${rx1} ${ry} L170 ${ry - 250}" stroke="${CR}" stroke-width="12" stroke-linecap="round"/>`;
    s += `<path d="M${rx1 + 64} ${ry - 40} Q${rx1 + 40} ${ry - 140} ${rx1 - 40} ${ry - 132}" stroke="${PRETO}" stroke-width="20" fill="none" stroke-linecap="round"/>`;   // para-lama dianteiro curto
    s += `<rect x="150" y="${ry - 262}" width="46" height="24" rx="6" fill="${PRETO}" stroke="${L}" stroke-width="4"/>`;
    s += `<g transform="translate(212 ${ry - 236})"><ellipse rx="30" ry="40" fill="${CR2}" stroke="${L}" stroke-width="5"/><ellipse cx="12" rx="16" ry="34" fill="${farol ? '#FFF6D0' : '#9AA0A8'}" stroke="${L}" stroke-width="3"/></g>`;
    s += `<path d="M168 ${ry - 258} Q150 ${ry - 330} 112 ${ry - 340} L84 ${ry - 340}" stroke="${L}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M168 ${ry - 258} Q150 ${ry - 330} 112 ${ry - 340} L84 ${ry - 340}" stroke="${CR}" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="74" y="${ry - 350}" width="40" height="20" rx="8" fill="${PRETO}"/>`;
    s += `<path d="M150 ${ry - 300} l-10 -60" stroke="${CR2}" stroke-width="4"/><ellipse cx="138" cy="${ry - 368}" rx="14" ry="10" fill="${CR}" stroke="${L}" stroke-width="3"/>`;
    // pedaleira
    s += `<path d="M-10 ${ry + 8} l40 0" stroke="${L}" stroke-width="12" stroke-linecap="round"/><path d="M-10 ${ry + 8} l40 0" stroke="#4A4A54" stroke-width="6" stroke-linecap="round"/>`;
    // a lança de vergalhão presa na lateral (abraçadeiras)
    if (lanca) s += `<g transform="translate(${rx0 - 40} ${ry - 20}) rotate(-62) scale(0.85)"><path d="M0 -6 L480 -6 L540 0 L480 6 L0 6Z" fill="#7A6A5E" stroke="${L}" stroke-width="4"/>${[...Array(22)].map((_, i) => `<path d="M${10 + i * 21} -6 l7 12" stroke="#4A3E36" stroke-width="2.5"/>`).join('')}<path d="M480 -6 L540 0 L480 6Z" fill="#C8CCD0"/><rect x="60" y="-12" width="16" height="24" rx="3" fill="#1A1A20"/><rect x="300" y="-12" width="16" height="24" rx="3" fill="#1A1A20"/></g>`;
    return s + '</g>'; };
  Moto.lado.pontos = (k = 1) => ({ assento: [-100 * k, -296 * k], pe: [8 * k, -96 * k], guidao: [92 * k, -448 * k] });
  // ---------------- DE FRENTE (vindo para a câmera) ----------------
  Moto.frente = (k = 1, { farol = true } = {}) => {
    let s = `<g transform="scale(${k})"><ellipse cx="0" cy="6" rx="140" ry="20" fill="#000" opacity=".35"/>`;
    s += `<path d="M-60 -110 L-118 -70 M60 -110 L118 -70" stroke="${L}" stroke-width="20" stroke-linecap="round"/><path d="M-60 -110 L-118 -70 M60 -110 L118 -70" stroke="${CR}" stroke-width="12" stroke-linecap="round"/>`;   // escapamentos saindo dos dois cilindros
    s += `<path d="M-70 -110 L-100 -200 L-60 -230 L-30 -130Z M70 -110 L100 -200 L60 -230 L30 -130Z" fill="${CR2}" stroke="${L}" stroke-width="5"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${-104 + i * 3} ${-186 + i * 12} h34 M${70 - i * 3} ${-186 + i * 12} h34" stroke="${CR}" stroke-width="5"/>`).join('')}`;   // cilindros do V2
    s += `<path d="M-46 -170 Q0 -250 46 -170 L36 -120 L-36 -120Z" fill="#5A1A16" stroke="${L}" stroke-width="5"/><path d="M0 -236 V-130" stroke="#E8D8B0" stroke-width="8"/>`;   // tanque visto de frente
    s += `<path d="M-14 -40 L-24 -250 M14 -40 L24 -250" stroke="${L}" stroke-width="18"/><path d="M-14 -40 L-24 -250 M14 -40 L24 -250" stroke="${CR}" stroke-width="11"/>`;   // garfo
    s += `<rect x="-22" y="-216" width="44" height="216" rx="20" fill="#16161A" stroke="${L}" stroke-width="5"/><path d="M-10 -200 V-16 M10 -200 V-16" stroke="#2E2E34" stroke-width="4"/>`;   // pneu gordo de frente
    s += `<path d="M-40 -232 Q0 -262 40 -232 L34 -206 Q0 -226 -34 -206Z" fill="${PRETO}" stroke="${L}" stroke-width="4"/>`;   // para-lama
    s += `<path d="M-30 -316 Q-110 -322 -150 -346 L-176 -350 M30 -316 Q110 -322 150 -346 L176 -350" stroke="${L}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M-30 -316 Q-110 -322 -150 -346 L-176 -350 M30 -316 Q110 -322 150 -346 L176 -350" stroke="${CR}" stroke-width="9" fill="none" stroke-linecap="round"/>`;   // guidão alto e largo
    s += `<path d="M-130 -340 l-20 -60 M130 -340 l20 -60" stroke="${CR2}" stroke-width="4"/><ellipse cx="-152" cy="-410" rx="16" ry="12" fill="${CR}" stroke="${L}" stroke-width="3"/><ellipse cx="152" cy="-410" rx="16" ry="12" fill="${CR}" stroke="${L}" stroke-width="3"/>`;
    s += `<circle cx="0" cy="-290" r="46" fill="${CR2}" stroke="${L}" stroke-width="6"/><circle cx="0" cy="-290" r="34" fill="${farol ? '#FFF6D0' : '#9AA0A8'}" stroke="${L}" stroke-width="3"/><circle cx="-10" cy="-300" r="10" fill="#FFFFFF" opacity=".8"/>`;   // farol
    s += `<path d="M-120 -96 h50 M70 -96 h50" stroke="${L}" stroke-width="12" stroke-linecap="round"/>`;   // pedaleiras
    return s + '</g>'; };
  Moto.frente.pontos = (k = 1) => ({ assento: [0, -300 * k], pe: [[-96 * k, -96 * k], [96 * k, -96 * k]], guidao: [[-166 * k, -350 * k], [166 * k, -350 * k]] });
  // ---------------- DE TRÁS (indo embora) ----------------
  Moto.tras = (k = 1, { freio = false } = {}) => {
    let s = `<g transform="scale(${k})"><ellipse cx="0" cy="6" rx="150" ry="20" fill="#000" opacity=".35"/>`;
    s += `<path d="M-30 -150 L-130 -60 M30 -150 L130 -60" stroke="${L}" stroke-width="24" stroke-linecap="round"/><path d="M-30 -150 L-130 -60 M30 -150 L130 -60" stroke="${CR}" stroke-width="15" stroke-linecap="round"/><circle cx="-132" cy="-58" r="12" fill="#1A1A1E" stroke="${L}" stroke-width="3"/><circle cx="132" cy="-58" r="12" fill="#1A1A1E" stroke="${L}" stroke-width="3"/>`;   // escapamentos
    s += `<rect x="-30" y="-216" width="60" height="216" rx="26" fill="#16161A" stroke="${L}" stroke-width="5"/>`;   // pneu traseiro largo
    s += `<path d="M-46 -250 Q0 -290 46 -250 L40 -170 L-40 -170Z" fill="${PRETO}" stroke="${L}" stroke-width="5"/>`;   // para-lama cortado
    s += `<rect x="-130" y="-260" width="70" height="80" rx="12" fill="${COURO}" stroke="${L}" stroke-width="4"/><rect x="60" y="-260" width="70" height="80" rx="12" fill="${COURO}" stroke="${L}" stroke-width="4"/>`;   // alforjes
    s += `<rect x="-22" y="-246" width="44" height="18" rx="6" fill="${freio ? '#FF3A2A' : '#A01A14'}" stroke="${L}" stroke-width="3"/>` + (freio ? `<circle cx="0" cy="-237" r="40" fill="#FF3A2A" opacity=".25"/>` : '');   // lanterna
    s += `<rect x="-26" y="-226" width="52" height="14" fill="#E8E2D0" stroke="${L}" stroke-width="2"/>`;   // placa
    s += `<path d="M-50 -300 Q0 -330 50 -300 L40 -270 L-40 -270Z" fill="${COURO}" stroke="${L}" stroke-width="5"/>`;   // banco visto de trás
    s += `<path d="M-30 -330 Q-110 -336 -150 -356 M30 -330 Q110 -336 150 -356" stroke="${L}" stroke-width="14" fill="none" stroke-linecap="round"/>`;   // guidão lá na frente
    return s + '</g>'; };
  Moto.tras.pontos = (k = 1) => ({ assento: [0, -300 * k], pe: [[-96 * k, -96 * k], [96 * k, -96 * k]], guidao: [[-150 * k, -356 * k], [150 * k, -356 * k]] });
  global.Moto = Moto;
})(typeof window !== 'undefined' ? window : globalThis);
