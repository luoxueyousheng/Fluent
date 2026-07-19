/* 令牌解析值转储:探针元素解析 var()/color-mix 为 rgb,明暗两套输出 JSON。
 * 用于令牌重构前后比对,保证视觉零漂移。用法:node scripts/token-dump.mjs <url> <out.json> */
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';

const TOKENS = [
  'accent', 'accent-hover', 'accent-press', 'accent-text', 'text-on-accent',
  'text-1', 'text-2', 'text-3', 'text-disabled',
  'fill-subtle', 'fill-secondary',
  'bg', 'layer', 'card', 'control', 'acrylic-bg',
  'stroke', 'stroke-strong', 'divider',
  'success', 'caution', 'critical', 'info',
];

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
});
const page = await browser.newPage();
await page.goto(process.argv[2], { waitUntil: 'networkidle0' });

const dump = await page.evaluate((tokens) => {
  const probe = document.createElement('div');
  document.body.appendChild(probe);
  const read = () => {
    const out = {};
    for (const t of tokens) {
      probe.style.color = `var(--${t})`;
      out[t] = getComputedStyle(probe).color;
    }
    return out;
  };
  const html = document.documentElement;
  html.dataset.theme = 'light';
  const light = read();
  html.dataset.theme = 'dark';
  const dark = read();
  probe.remove();
  return { light, dark };
}, TOKENS);

writeFileSync(process.argv[3], JSON.stringify(dump, null, 1));
console.log('dumped', Object.keys(dump.light).length, 'tokens ×2 themes →', process.argv[3]);
await browser.close();
