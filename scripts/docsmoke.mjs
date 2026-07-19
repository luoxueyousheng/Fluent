/* 文档站冒烟:遍历全部导航项,断言文档页结构 + 无 JS 错误 + nav 滚动指示条。
 * CI 友好:BROWSER_PATH 指定浏览器(缺省本机 Edge)、DOCS_URL 指定站点、
 * SMOKE_SHOT_DIR 存在才截图;任何 BAD 或 JS 错误 → 退出码 1。 */
import puppeteer from 'puppeteer-core';

const BROWSER = process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL = process.env.DOCS_URL || 'http://localhost:4173/';
const SHOT_DIR = process.env.SMOKE_SHOT_DIR || '';
const NAV_SEL = '#root > .app > .shell > .nav .nav-item:not(.nav-hamburger)';

let failures = 0;
const check = (name, ok) => {
  console.log(`${ok ? 'OK ' : 'BAD'} ${name}`);
  if (!ok) failures++;
};
const shot = async (page, name) => {
  if (!SHOT_DIR) return;
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, clip: { x: 0, y: 0, width: 1280, height: 900 } });
};

const browser = await puppeteer.launch({ executablePath: BROWSER, headless: 'new', args: ['--window-size=1280,900', '--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  // 资源 404(如根域 favicon)不算应用错误,真正的 JS 异常走 pageerror
  if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`);
});

await page.goto(URL, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 600));

const count = await page.$$eval(NAV_SEL, (els) => els.length);
console.log(`nav items: ${count}`);
if (count < 60) { check(`导航项数量 ${count} >= 60`, false); }

for (let i = 0; i < count; i++) {
  const label = await page.evaluate((idx, sel) => {
    const els = document.querySelectorAll(sel);
    els[idx].scrollIntoView({ block: 'nearest' });
    els[idx].click();
    return els[idx].textContent.trim();
  }, i, NAV_SEL);
  await new Promise((r) => setTimeout(r, 300));
  const info = await page.evaluate(() => {
    const doc = document.querySelector('.doc');
    if (!doc) return { doc: false };
    return {
      doc: true,
      sections: doc.querySelectorAll('.doc-example').length,
      codeBlocks: doc.querySelectorAll('.code-block').length,
      // 指南页可以没有 API 区;有 API 标题则必须有表
      hasApiHeading: [...doc.querySelectorAll('h2')].some((h) => h.textContent.trim() === 'API'),
      apiTables: doc.querySelectorAll('.api-table').length,
    };
  });
  if (!info.doc) { console.log(`--- ${label}(非文档页)`); continue; }
  const ok = info.sections >= 1 && info.codeBlocks >= 1 && (!info.hasApiHeading || info.apiTables >= 1);
  check(`${label}: examples=${info.sections} code=${info.codeBlocks} api=${info.apiTables}`, ok);
}

/* 交互检查:Button 页 显示代码 + 复制按钮 */
await page.evaluate((sel) => {
  [...document.querySelectorAll(sel)].find((e) => e.textContent.includes('Button'))?.click();
}, NAV_SEL);
await new Promise((r) => setTimeout(r, 350));
await page.click('.doc-example .doc-codetoggle');
await new Promise((r) => setTimeout(r, 150));
check('code toggle', await page.$eval('.doc-example .code-block pre', (el) => el.textContent.length > 10));
check('copy btn', !!(await page.$('.doc-example .code-copy')));
await shot(page, 'doc-button');

/* nav 指示条跟随滚动(先滚到中部再反向滚) */
const NAVTOP = '#root > .app > .shell > .nav .nav-top';
await page.evaluate((s) => { document.querySelector(s).scrollTop = 300; }, NAVTOP);
await new Promise((r) => setTimeout(r, 300));
const indBefore = await page.$eval('#root > .app > .shell > .nav .nav-indicator', (el) => el.style.transform);
await page.evaluate((s) => { document.querySelector(s).scrollTop = 150; }, NAVTOP);
await new Promise((r) => setTimeout(r, 450));
const indAfter = await page.$eval('#root > .app > .shell > .nav .nav-indicator', (el) => el.style.transform);
check(`nav indicator follows scroll (${indBefore} -> ${indAfter})`, indBefore !== indAfter);

/* hash 路由:直达 + 刷新保持 */
await page.goto(`${URL}#/modal`, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 500));
check('hash 直达 #/modal', await page.evaluate(() => document.querySelector('.doc-title')?.textContent?.includes('Modal') ?? false));

/* 暗色抽查 */
await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
await new Promise((r) => setTimeout(r, 250));
await shot(page, 'doc-dark');

console.log(`js errors: ${errors.length}`);
errors.slice(0, 10).forEach((e) => console.log('  ' + e));
if (errors.length) failures += errors.length;
await browser.close();

if (failures > 0) {
  console.log(`FAILED: ${failures} 项`);
  process.exitCode = 1;
} else {
  console.log('ALL PASS');
}
