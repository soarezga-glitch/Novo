// Renderiza a camada de animação (cena.html) quadro a quadro, com fundo transparente,
// e manda os PNGs direto para o ffmpeg (sem encher o disco).
// Uso: node render.js [saida.mov] [--teste t1,t2,...]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const FPS = 30, DUR = 36.466;
const args = process.argv.slice(2);
const teste = args.includes('--teste') ? args[args.indexOf('--teste') + 1].split(',').map(Number) : null;
const saida = args[0] && !args[0].startsWith('--') ? args[0] : path.join(DIR, 'camada.mov');

const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(req.url.split('?')[0].split('#')[0]));
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('ERRO NA PÁGINA:', e.message));
  await page.goto(`http://127.0.0.1:${port}/cena.html`);
  await page.evaluate(() => window.__ready);

  if (teste) {
    for (const t of teste) {
      await page.evaluate(t => window.__seek(t), t);
      await page.screenshot({ path: path.join(process.env.TESTE_DIR || DIR, `teste-${t}.png`), omitBackground: true });
    }
  } else {
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'qtrle', '-pix_fmt', 'argb', saida], { stdio: ['pipe', 'inherit', 'inherit'] });
    const total = Math.round(DUR * FPS);
    for (let i = 0; i < total; i++) {
      await page.evaluate(t => window.__seek(t), i / FPS);
      const png = await page.screenshot({ omitBackground: true });
      if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`quadro ${i}/${total}`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
  server.close();
})();
