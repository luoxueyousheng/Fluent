/* fluent-jade 模板冒烟:Edge 无头加载 preview 页,遍历导航页,收集控制台错误,截图 */
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://127.0.0.1:4173/';
const SHOT = process.argv[3] || 'shot';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-first-run', '--disable-extensions'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 840 });

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise((r) => setTimeout(r, 800));

// 首页应有标题栏与导航
const appName = await page.$eval('.title-bar .app-name', (el) => el.textContent).catch(() => null);
const navCount = await page.$$eval('.nav-item[role="tab"]', (els) => els.length);
console.log('app-name =', appName, '; nav items =', navCount);

// 遍历四个页面并截图最后一页前先回控件页操作几下
const pages = ['首页', '控件', '反馈', '设置'];
for (const label of pages) {
  const [btn] = await page.$$(`xpath/.//button[contains(@class,'nav-item')][.//span[text()='${label}']]`);
  if (!btn) { errors.push('导航项缺失: ' + label); continue; }
  await btn.click();
  await new Promise((r) => setTimeout(r, 400));
  const h1 = await page.$eval('.page.active h1', (el) => el.textContent).catch(() => 'N/A');
  console.log(`导航[${label}] → h1 = ${h1}`);
}

// 控件页交互:开 ComboBox、点 Tab、开 DropDown
const [ctl] = await page.$$(`xpath/.//button[contains(@class,'nav-item')][.//span[text()='控件']]`);
await ctl.click();
await new Promise((r) => setTimeout(r, 300));
await page.click('.combo-trigger');
await new Promise((r) => setTimeout(r, 250));
const comboOpen = await page.$$eval('.combo-pop .combo-option', (els) => els.length);
console.log('combo options =', comboOpen);
if (comboOpen > 0) await page.click('.combo-pop .combo-option');
await new Promise((r) => setTimeout(r, 250));

// Toast 验证(反馈页点 info)
const [fb] = await page.$$(`xpath/.//button[contains(@class,'nav-item')][.//span[text()='反馈']]`);
await fb.click();
await new Promise((r) => setTimeout(r, 300));
const [infoBtn] = await page.$$(`xpath/.//section[contains(@class,'active')]//button[text()='info']`);
if (infoBtn) await infoBtn.click();
await new Promise((r) => setTimeout(r, 400));
const toasts = await page.$$eval('.toast-host .toast', (els) => els.length);
console.log('toasts on screen =', toasts);

await page.screenshot({ path: SHOT + '-feedback.png' });

// 切暗色主题截图
const [st] = await page.$$(`xpath/.//button[contains(@class,'nav-item')][.//span[text()='设置']]`);
await st.click();
await new Promise((r) => setTimeout(r, 300));
const [darkBtn] = await page.$$(`xpath/.//section[contains(@class,'active')]//button[@role='tab'][text()='深色']`);
if (darkBtn) await darkBtn.click();
await new Promise((r) => setTimeout(r, 400));
const theme = await page.$eval('html', (el) => el.dataset.theme);
console.log('data-theme =', theme);
await page.screenshot({ path: SHOT + '-settings-dark.png' });

console.log(errors.length ? '控制台错误:\n' + errors.join('\n') : '控制台无错误');
await browser.close();
process.exit(errors.length ? 1 : 0);
