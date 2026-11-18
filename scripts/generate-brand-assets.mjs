/* ==========================================================================
   Генерация растровых вариантов фавикона и OG-изображения из одного источника.

   Источник — public/favicon.svg. Скрипт нужен только при изменении эмблемы:
   готовые PNG/ICO уже лежат в public и участвуют в сборке.

   Запуск (из корня проекта):
     node scripts/generate-brand-assets.mjs

   Playwright — существующая devDependency проекта (@playwright/test),
   новых зависимостей скрипт не требует.
   ========================================================================== */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');

/* Ширина и высота из корневого тега убираются: в контейнере заданного размера
   SVG масштабируется по viewBox и рендерится без полей. */
const emblemSvg = readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8')
  .replace(/\s+width="\d+"/, '')
  .replace(/\s+height="\d+"/, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .trim();

const OG_HTML = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1200px; height: 630px; overflow: hidden; }
      body {
        background: #202729;
        color: #f0ede5;
        font-family: Georgia, 'Times New Roman', serif;
        position: relative;
      }
      .frame { position: absolute; inset: 30px; border: 1px solid rgba(240, 237, 229, 0.16); }
      .tick { position: absolute; width: 16px; height: 16px; border: 0 solid #d66a42; }
      .tick--tl { top: 30px; left: 30px; border-top-width: 3px; border-left-width: 3px; }
      .tick--tr { top: 30px; right: 30px; border-top-width: 3px; border-right-width: 3px; }
      .tick--bl { bottom: 30px; left: 30px; border-bottom-width: 3px; border-left-width: 3px; }
      .tick--br { bottom: 30px; right: 30px; border-bottom-width: 3px; border-right-width: 3px; }
      .content {
        position: absolute;
        left: 88px;
        right: 88px;
        top: 84px;
        bottom: 64px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
      }
      .emblem { width: 82px; height: 82px; margin-bottom: 40px; }
      .label {
        font-family: Consolas, 'Courier New', monospace;
        font-size: 14px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #b49a70;
        margin-bottom: 16px;
      }
      h1 { font-size: 66px; font-weight: 400; line-height: 1.06; letter-spacing: -0.01em; }
      p { margin-top: 18px; font-size: 25px; line-height: 1.35; color: #d8d6cc; }
      .rule { margin-top: 34px; width: 120px; height: 3px; background: #d66a42; }
    </style>
  </head>
  <body>
    <div class="frame"></div>
    <div class="tick tick--tl"></div>
    <div class="tick tick--tr"></div>
    <div class="tick tick--bl"></div>
    <div class="tick tick--br"></div>
    <div class="content">
      ${emblemSvg.replace('<svg ', '<svg class="emblem" ')}
      <div class="label">Санкт-Петербург · инженерия · дизайн · музейная культура</div>
      <h1>Инженеры впечатлений</h1>
      <p>Проектируем опыт, собираем впечатления</p>
      <div class="rule"></div>
    </div>
  </body>
</html>`;


/* --- ICO-контейнер из PNG-кадров (PNG внутри ICO понимают все живые браузеры) -- */
const buildIco = (frames) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);

  const directory = Buffer.alloc(16 * frames.length);
  let offset = 6 + directory.length;

  frames.forEach(({ size, data }, index) => {
    const entry = index * 16;
    directory.writeUInt8(size, entry); // width
    directory.writeUInt8(size, entry + 1); // height
    directory.writeUInt8(0, entry + 2); // palette
    directory.writeUInt8(0, entry + 3); // reserved
    directory.writeUInt16LE(1, entry + 4); // color planes
    directory.writeUInt16LE(32, entry + 6); // bits per pixel
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });

  return Buffer.concat([header, directory, ...frames.map((frame) => frame.data)]);
};

const browser = await chromium.launch();
const icoFrames = [];

for (const size of [16, 32, 48]) {
  const context = await browser.newContext({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:#202729}svg{display:block;width:${size}px;height:${size}px}</style>${emblemSvg}`,
  );
  const data = await page.screenshot({ type: 'png' });
  writeFileSync(path.join(publicDir, `favicon-${size}.png`), data);
  icoFrames.push({ size, data });
  await context.close();
}

writeFileSync(path.join(publicDir, 'favicon.ico'), buildIco(icoFrames));

/* Иконка для домашнего экрана iOS: 180×180, фон во всю плитку (iOS скругляет сам) */
const touchContext = await browser.newContext({
  viewport: { width: 180, height: 180 },
  deviceScaleFactor: 1,
});
const touchPage = await touchContext.newPage();
await touchPage.setContent(
  '<style>html,body{margin:0;padding:0;background:#202729}svg{display:block;width:180px;height:180px}</style>' +
    emblemSvg,
);
writeFileSync(
  path.join(publicDir, 'apple-touch-icon.png'),
  await touchPage.screenshot({ type: 'png' }),
);
await touchContext.close();

/* OG-изображение 1200×630 для превью ссылки в соцсетях и мессенджерах */
const ogContext = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
const ogPage = await ogContext.newPage();
await ogPage.setContent(OG_HTML);
writeFileSync(path.join(publicDir, 'og-image.png'), await ogPage.screenshot({ type: 'png' }));
await ogContext.close();

await browser.close();

console.log('brand assets: favicon-16/32/48.png, favicon.ico, apple-touch-icon.png, og-image.png');
