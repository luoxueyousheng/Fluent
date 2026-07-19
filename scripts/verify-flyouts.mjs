/* 下拉族 + 右键菜单 portal 迁移验证:
 * ComboBox(WinUI 对位保持)/ AutoSuggest / DatePicker / TimePicker / DropDownButton / ContextMenu */
import puppeteer from 'puppeteer-core';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 600));

const nav = async (label) => {
  await page.evaluate((l) => {
    const el = [...document.querySelectorAll('.nav-item')].find((e) => e.textContent.includes(l));
    el.scrollIntoView({ block: 'nearest' });
    el.click();
  }, label);
  await new Promise((r) => setTimeout(r, 400));
};
const popInfo = (sel) => page.evaluate((s) => {
  const pop = document.querySelector(s);
  if (!pop) return null;
  const st = getComputedStyle(pop);
  return { portaled: pop.parentElement === document.body, position: st.position, z: st.zIndex };
}, sel);
const ok = (name, cond) => console.log(`${cond ? 'OK ' : 'BAD'} ${name}`);

/* ---- ComboBox:portal + WinUI 对位(选中项与触发器中线对齐) ---- */
await nav('组合框');
await page.evaluate(() => document.querySelector('.combobox .combo-trigger').scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 200));
await page.click('.combobox .combo-trigger');
await new Promise((r) => setTimeout(r, 300));
const cb = await popInfo('.combo-pop');
ok('combo portal/fixed/z850', cb && cb.portaled && cb.position === 'fixed' && cb.z === '850');
const align = await page.evaluate(() => {
  const t = document.querySelector('.combobox .combo-trigger').getBoundingClientRect();
  const pop = document.querySelector('.combo-pop');
  const sel = pop.querySelector('.combo-option[aria-selected="true"]').getBoundingClientRect();
  return { dMid: Math.abs((t.top + t.height / 2) - (sel.top + sel.height / 2)), dW: Math.abs(t.width - pop.getBoundingClientRect().width) };
});
ok(`combo WinUI 对位(中线差 ${align.dMid.toFixed(1)}px, 宽差 ${align.dW.toFixed(1)}px)`, align.dMid <= 1.5 && align.dW <= 1);
await page.evaluate(() => [...document.querySelectorAll('.combo-option')].find((o) => o.textContent === '成都')?.click());
await new Promise((r) => setTimeout(r, 250));
const picked = await page.$eval('.combobox .combo-value', (el) => el.textContent);
ok(`combo 选中提交(${picked})`, picked === '成都' && !(await page.$('.combo-pop')));

/* ---- AutoSuggest:portal + 随输入框宽 + 候选点击 ---- */
await nav('AutoSuggest');
await page.evaluate(() => document.querySelector('.combobox.suggest input').scrollIntoView({ block: 'center' }));
await page.click('.combobox.suggest input');
await page.type('.combobox.suggest input', 'ap');
await new Promise((r) => setTimeout(r, 350));
const as = await popInfo('.combo-pop');
ok('suggest portal/fixed/z850', as && as.portaled && as.position === 'fixed' && as.z === '850');
const asw = await page.evaluate(() => {
  const i = document.querySelector('.combobox.suggest input').getBoundingClientRect();
  const p = document.querySelector('.combo-pop').getBoundingClientRect();
  return { dW: Math.abs(i.width - p.width), below: p.top >= i.bottom };
});
ok(`suggest 随宽(差 ${asw.dW.toFixed(1)}px)+ 在输入框下方`, asw.dW <= 1 && asw.below);
await page.evaluate(() => {
  const opt = [...document.querySelectorAll('.combo-option')][0];
  opt.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 250));
const asv = await page.$eval('.combobox.suggest input', (el) => el.value);
ok(`suggest 候选选中(${asv})`, asv.toLowerCase().startsWith('ap') && asv.length > 2);

/* ---- DatePicker / TimePicker ---- */
await nav('DatePicker');
await page.evaluate(() => document.querySelector('.datepicker .combo-trigger').scrollIntoView({ block: 'center' }));
await page.click('.datepicker .combo-trigger');
await new Promise((r) => setTimeout(r, 300));
const dp = await popInfo('.dp-pop');
ok('datepicker portal/fixed/z850', dp && dp.portaled && dp.position === 'fixed' && dp.z === '850');
await page.evaluate(() => [...document.querySelectorAll('.dp-pop .cal-cell:not(.off)')].find((c) => c.textContent === '15')?.click());
await new Promise((r) => setTimeout(r, 250));
const dpv = await page.$eval('.datepicker .combo-value', (el) => el.textContent);
ok(`datepicker 选中提交(${dpv})`, /15/.test(dpv) && !(await page.$('.dp-pop')));

await nav('TimePicker');
await page.evaluate(() => document.querySelector('.timepicker .combo-trigger').scrollIntoView({ block: 'center' }));
await page.click('.timepicker .combo-trigger');
await new Promise((r) => setTimeout(r, 300));
const tp = await popInfo('.tp-pop');
ok('timepicker portal/fixed/z850', tp && tp.portaled && tp.position === 'fixed' && tp.z === '850');
await page.keyboard.press('Escape');
await new Promise((r) => setTimeout(r, 300));

/* ---- DropDownButton / 右键菜单 ---- */
await nav('Dropdown');
await page.evaluate(() => document.querySelector('.dropdown').scrollIntoView({ block: 'center' }));
await page.click('.dropdown .btn');
await new Promise((r) => setTimeout(r, 300));
const dd = await popInfo('.menu-pop');
ok('dropdown menu portal/fixed/z850', dd && dd.portaled && dd.position === 'fixed' && dd.z === '850');
const ddPos = await page.evaluate(() => {
  const b = document.querySelector('.dropdown .btn').getBoundingClientRect();
  const m = document.querySelector('.menu-pop').getBoundingClientRect();
  return m.top >= b.bottom && Math.abs(m.left - b.left) <= 9;
});
ok('dropdown menu 锚定按钮下方', ddPos);
await page.evaluate(() => [...document.querySelectorAll('.menu-item')].find((m) => m.textContent.includes('复制'))?.click());
await new Promise((r) => setTimeout(r, 350));
const toastShown = await page.evaluate(() => [...document.querySelectorAll('.toast')].some((t) => t.textContent.includes('执行')));
ok('dropdown onPick 触发', toastShown);

const ctx = await page.evaluate(() => {
  const area = [...document.querySelectorAll('.ctx-area')][0];
  const r = area.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
await page.mouse.click(ctx.x, ctx.y, { button: 'right' });
await new Promise((r) => setTimeout(r, 300));
const cm = await page.evaluate((c) => {
  const m = document.querySelector('.menu-pop');
  if (!m) return null;
  const r = m.getBoundingClientRect();
  const st = getComputedStyle(m);
  return { portaled: m.parentElement === document.body, position: st.position, z: st.zIndex,
           atPointer: Math.abs(r.left - c.x) <= 1 && Math.abs(r.top - c.y) <= 1 };
}, ctx);
ok('ctx-menu portal/fixed/z850 + 指针位', cm && cm.portaled && cm.position === 'fixed' && cm.z === '850' && cm.atPointer);
// 贴右下角:钳回安全边距
await page.evaluate(() => {
  const area = [...document.querySelectorAll('.ctx-area')][0];
  area.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 1270, clientY: 890 }));
});
await new Promise((r) => setTimeout(r, 300));
const clamp = await page.evaluate(() => {
  const m = document.querySelector('.menu-pop');
  if (!m) return null;
  const r = m.getBoundingClientRect();
  return r.right <= innerWidth - 7 && r.bottom <= innerHeight - 7;
});
ok('ctx-menu 视口钳制', clamp === true);
await page.keyboard.press('Escape');

console.log(`js errors: ${errors.length}`);
errors.slice(0, 5).forEach((e) => console.log('  ' + e));
await browser.close();
