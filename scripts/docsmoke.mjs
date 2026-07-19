/* 文档站冒烟:遍历全部导航项,断言文档页结构 + 无 JS 错误 + nav 滚动指示条 */
import puppeteer from 'puppeteer-core';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL = 'http://localhost:4173/';
const SHOT = (n) => `C:/Users/35037/AppData/Local/Temp/claude/D--Compile-VolLibrary-Encapsulation-liunx-2-3-JadeView/b7a9e78a-6299-4428-a177-b9bcc2d97725/scratchpad/${n}.png`;

const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--window-size=1280,900'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

await page.goto(URL, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 600));

const items = await page.$$eval('.shell > .nav .nav-item:not(.nav-hamburger)', (els) =>
  els.map((el) => ({ label: el.textContent.trim() })));
console.log(`nav items: ${items.length}`);

const results = [];
const count = await page.$$eval('.shell > .nav .nav-item:not(.nav-hamburger)', (els) => els.length);
for (let i = 0; i < count; i++) {
  const label = await page.evaluate((idx) => {
    const els = document.querySelectorAll('.shell > .nav .nav-item:not(.nav-hamburger)');
    els[idx].scrollIntoView({ block: 'nearest' });
    els[idx].click();
    return els[idx].textContent.trim();
  }, i);
  await new Promise((r) => setTimeout(r, 350));
  const info = await page.evaluate(() => {
    const doc = document.querySelector('.doc');
    if (!doc) return { doc: false };
    return {
      doc: true,
      h1: document.querySelector('.doc-title')?.childNodes[0]?.textContent ?? '',
      sections: doc.querySelectorAll('.doc-example').length,
      apiTables: doc.querySelectorAll('.api-table').length,
      codeBlocks: doc.querySelectorAll('.code-block').length,
    };
  });
  results.push({ label, ...info });
}

for (const r of results) {
  if (r.doc) {
    const ok = r.sections >= 1 && r.apiTables >= 1 && r.codeBlocks >= 1;
    console.log(`${ok ? 'OK ' : 'BAD'} ${r.label} — ${r.h1}: examples=${r.sections} apiTables=${r.apiTables} code=${r.codeBlocks}`);
  } else {
    console.log(`--- ${r.label}(非文档页)`);
  }
}

/* 交互检查:Button 页 显示代码 + 复制按钮;nav 指示条随滚动移动 */
await page.evaluate(() => {
  const els = [...document.querySelectorAll('.nav-item')];
  els.find((e) => e.textContent.includes('Button'))?.click();
});
await new Promise((r) => setTimeout(r, 350));
await page.click('.doc-example .doc-codetoggle');
await new Promise((r) => setTimeout(r, 150));
const codeShown = await page.$eval('.doc-example .code-block pre', (el) => el.textContent.length > 10);
const hasCopy = !!(await page.$('.doc-example .code-copy'));
console.log(`code toggle: ${codeShown ? 'OK' : 'BAD'}, copy btn: ${hasCopy ? 'OK' : 'BAD'}`);
await page.screenshot({ path: SHOT('doc-button'), clip: { x: 0, y: 0, width: 1280, height: 900 } });

/* 先滚回中部再测跟随(循环结束时列表在最底,+=120 会是无操作) */
await page.evaluate(() => { document.querySelector('.nav-top').scrollTop = 300; });
await new Promise((r) => setTimeout(r, 300));
const indBefore = await page.$eval('.nav-indicator', (el) => el.style.transform);
await page.evaluate(() => { document.querySelector('.nav-top').scrollTop = 150; });
await new Promise((r) => setTimeout(r, 450));
const indAfter = await page.$eval('.nav-indicator', (el) => el.style.transform);
console.log(`nav indicator follows scroll: ${indBefore !== indAfter ? 'OK' : 'BAD'} (${indBefore} -> ${indAfter})`);

/* API 表截图(Slider 页,多表) */
await page.evaluate(() => {
  [...document.querySelectorAll('.nav-item')].find((e) => e.textContent.includes('Slider'))?.click();
});
await new Promise((r) => setTimeout(r, 350));
await page.evaluate(() => document.querySelector('.api-table')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 250));
await page.screenshot({ path: SHOT('doc-api'), clip: { x: 0, y: 0, width: 1280, height: 900 } });

/* 暗色抽查 */
await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
await new Promise((r) => setTimeout(r, 250));
await page.screenshot({ path: SHOT('doc-dark'), clip: { x: 0, y: 0, width: 1280, height: 900 } });

console.log(`js errors: ${errors.length}`);
errors.slice(0, 10).forEach((e) => console.log('  ' + e));
await browser.close();
