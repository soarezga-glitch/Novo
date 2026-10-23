/*
  armas.js — armas de sobrevivência desenhadas "como peça de jogo" (skill armas-e-golpes; método da skill create-game-assets):
  silhueta que se lê de longe, peças reais (lâmina, fio, contrafio, cabo, rebite, empunhadura enrolada), 3 tons + brilho no fio,
  contorno escuro do estilo da série. Toda arma tem a ORIGEM NA MÃO (onde a mão fecha) e aponta para +x: para segurar, faça
  translate(mão) rotate(ângulo do antebraço).
    Armas.facao(k)            facão de cana: lâmina larga, levemente curva, ponta reta, cabo de madeira com 3 rebites
    Armas.machadinha(k)       machadinha: cabo de madeira curvo, cabeça de aço com fio afiado e olho do cabo
    Armas.vergalhao(k)        lança de vergalhão: barra de ferro com nervuras, ponta esmerilhada, punho de fita isolante
    Armas.faca(k)             faca de caça
    Armas.respingo(x, y, k)   respingo escuro do golpe na cabeça (classe .respingo; animar escala/opacidade)
    Armas.estrela(x, y, k)    clarão do impacto (classe .clarao)
    Armas.rastro(cx, cy, r, a0, a1)   rastro curvo do golpe (o "arco" que mostra o caminho da lâmina)
*/
(function (global) {
  const L = '#0E0E14', f = v => Math.round(v * 10) / 10;
  const Armas = {};
  const madeira = (x, y, w, h, rx = 8) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#6A4426" stroke="${L}" stroke-width="5"/><rect x="${x + 4}" y="${y + 3}" width="${w - 8}" height="${h * 0.3}" rx="${rx / 2}" fill="#8A5C34" opacity=".8"/>` +
    [0.2, 0.5, 0.8].map(u => `<path d="M${x + w * u} ${y + 4} q6 ${h / 2 - 4} 0 ${h - 8}" stroke="#4A2E18" stroke-width="2" fill="none" opacity=".7"/>`).join('');
  Armas.facao = (k = 1) => `<g transform="scale(${k})">
    ${madeira(-46, -13, 96, 26)}${[-26, 4, 34].map(x => `<circle cx="${x}" cy="0" r="4.5" fill="#C8C8CC" stroke="${L}" stroke-width="2"/>`).join('')}
    <path d="M50 -15 L58 -15 L58 15 L50 15Z" fill="#5A5A60" stroke="${L}" stroke-width="4"/>
    <path d="M58 -14 L330 -26 Q372 -26 378 -6 L380 22 Q300 30 58 16Z" fill="#9AA0A8" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M60 10 L378 16 L380 22 Q300 30 58 16Z" fill="#D8DDE2"/><path d="M80 -8 L320 -18" stroke="#6A7078" stroke-width="3" opacity=".7"/>
    <path d="M120 -6 L300 -14" stroke="#FFFFFF" stroke-width="3" opacity=".5" stroke-linecap="round"/><path d="M200 2 l20 -2 M240 6 l14 0" stroke="#7A5A3A" stroke-width="3" opacity=".6"/></g>`;
  Armas.machadinha = (k = 1) => `<g transform="scale(${k})">
    <path d="M-40 -10 Q60 -20 170 -8 L172 10 Q60 0 -40 12Z" fill="#6A4426" stroke="${L}" stroke-width="5"/><path d="M-30 -5 Q60 -14 160 -4" stroke="#8A5C34" stroke-width="5" fill="none" opacity=".8"/>
    <path d="M-40 -10 L-20 -12 L-18 12 L-40 12Z" fill="#2A2A30"/><path d="M-30 -10 v22 M-24 -11 v23" stroke="#4A4A50" stroke-width="2"/>
    <path d="M140 -34 L196 -30 L194 -12 Q222 -16 236 -60 Q262 0 236 62 Q222 18 194 16 L196 34 L140 30Z" fill="#8A9098" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M236 -60 Q262 0 236 62 Q248 0 236 -60Z" fill="#E2E6EA"/><path d="M150 -24 L188 -22" stroke="#C8CCD2" stroke-width="4" opacity=".7"/><rect x="152" y="-12" width="30" height="24" rx="4" fill="#5A5E66"/></g>`;
  Armas.vergalhao = (k = 1) => `<g transform="scale(${k})">
    <path d="M-120 -7 L440 -7 L520 0 L440 7 L-120 7Z" fill="#7A6A5E" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>
    ${[...Array(26)].map((_, i) => `<path d="M${-100 + i * 21} -7 l8 14" stroke="#4A3E36" stroke-width="3"/>`).join('')}
    <path d="M-120 -3 L430 -3" stroke="#A8968A" stroke-width="2" opacity=".6"/><path d="M440 -7 L520 0 L440 7Z" fill="#C8CCD0" stroke="${L}" stroke-width="3"/>
    <rect x="-40" y="-11" width="110" height="22" rx="6" fill="#1A1A20" stroke="${L}" stroke-width="4"/>${[0, 1, 2, 3].map(i => `<path d="M${-34 + i * 26} -11 l10 22" stroke="#3A3A44" stroke-width="3"/>`).join('')}
    <path d="M-120 -7 Q-136 0 -120 7" fill="#5A4A3E" stroke="${L}" stroke-width="4"/></g>`;
  Armas.faca = (k = 1) => `<g transform="scale(${k})">${madeira(-40, -11, 80, 22, 10)}<path d="M40 -16 L48 -16 L48 16 L40 16Z" fill="#5A5A60" stroke="${L}" stroke-width="3"/>
    <path d="M48 -10 L170 -8 Q196 -4 204 8 L48 10Z" fill="#A8AEB4" stroke="${L}" stroke-width="4"/><path d="M60 6 L200 6" stroke="#E2E6EA" stroke-width="4"/></g>`;
  Armas.respingo = (x, y, k = 1) => `<g class="respingo" transform="translate(${f(x)} ${f(y)}) scale(${k})">${[[0, 0, 26], [34, -18, 12], [-30, -24, 10], [44, 14, 9], [-40, 10, 8], [10, -40, 9], [56, -36, 6], [-58, -30, 5]].map(([dx, dy, r]) => `<circle cx="${dx}" cy="${dy}" r="${r}" fill="#2A1012"/>`).join('')}
    <path d="M-10 -6 L-70 -40 M12 -8 L70 -50 M18 8 L80 20 M-14 10 L-76 26" stroke="#2A1012" stroke-width="6" stroke-linecap="round"/></g>`;
  Armas.estrela = (x, y, k = 1) => `<g class="clarao" transform="translate(${f(x)} ${f(y)}) scale(${k})"><path d="M0 -70 L14 -16 L70 -20 L22 8 L44 60 L0 26 L-44 60 L-22 8 L-70 -20 L-14 -16Z" fill="#FFF4C8" stroke="${L}" stroke-width="5" stroke-linejoin="round"/><circle r="16" fill="#FFFFFF"/></g>`;
  Armas.rastro = (cx, cy, r, a0, a1) => { const R = a => [cx + Math.cos(a * Math.PI / 180) * r, cy + Math.sin(a * Math.PI / 180) * r], p0 = R(a0), p1 = R(a1), big = Math.abs(a1 - a0) > 180 ? 1 : 0, sw = a1 > a0 ? 1 : 0;
    return `<path class="rastro" d="M${f(p0[0])} ${f(p0[1])} A${r} ${r} 0 ${big} ${sw} ${f(p1[0])} ${f(p1[1])}" stroke="#FFFFFF" stroke-width="22" fill="none" stroke-linecap="round" opacity=".55"/><path d="M${f(p0[0])} ${f(p0[1])} A${r} ${r} 0 ${big} ${sw} ${f(p1[0])} ${f(p1[1])}" stroke="#DDE6F2" stroke-width="8" fill="none" stroke-linecap="round" opacity=".9"/>`; };
  global.Armas = Armas;
})(typeof window !== 'undefined' ? window : globalThis);
