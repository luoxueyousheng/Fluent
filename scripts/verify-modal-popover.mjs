/* 验证:声明式 Modal(遮罩/Esc/异步 loading/长内容内滚/自定义页脚)、
 * Popover(portal/click/hover/受控)、Progress(showInfo 文字 / 环形 dashoffset) */
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
const ok = (name, cond) => console.log(`${cond ? 'OK ' : 'BAD'} ${name}`);
const clickBtn = async (text) => {
  await page.evaluate((t) => {
    const b = [...document.querySelectorAll('.doc-demo .btn')].find((e) => e.textContent.includes(t));
    b.scrollIntoView({ block: 'center' });
    b.click();
  }, text);
  await new Promise((r) => setTimeout(r, 350));
};

/* ---- Modal ---- */
await nav('模态框');
await clickBtn('重命名');
let m = await page.evaluate(() => {
  const d = document.querySelector('.dialog.modal');
  if (!d) return null;
  const smoke = d.closest('.smoke');
  return {
    open: smoke.classList.contains('open'),
    smokeTop: smoke.getBoundingClientRect().top,
    hasClose: !!d.querySelector('.modal-close'),
    hasInput: !!d.querySelector('input'),
    okFirst: d.querySelector('.actions .btn')?.classList.contains('accent'),
  };
});
ok('modal 打开(遮罩不盖标题栏/有 X/内容/主按钮在前)', m && m.open && m.smokeTop === 40 && m.hasClose && m.hasInput && m.okFirst);
await page.keyboard.press('Escape');
await new Promise((r) => setTimeout(r, 350));
ok('modal Esc 关闭', await page.evaluate(() => !document.querySelector('.smoke.open .dialog.modal')));
await clickBtn('重命名');
await page.evaluate(() => {
  const smoke = document.querySelector('.dialog.modal').closest('.smoke');
  smoke.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 350));
ok('modal 遮罩点击关闭', await page.evaluate(() => !document.querySelector('.smoke.open .dialog.modal')));

/* 异步 onOk:确定钮 loading → 完成后关闭 */
await clickBtn('应用配置');
await page.evaluate(() => [...document.querySelectorAll('.dialog.modal .actions .btn')].find((b) => b.textContent.includes('应用'))?.click());
await new Promise((r) => setTimeout(r, 300));
const loadingMid = await page.evaluate(() => {
  const b = [...document.querySelectorAll('.dialog.modal .actions .btn')].find((x) => x.textContent.includes('应用'));
  return b?.classList.contains('loading') && b.disabled;
});
await new Promise((r) => setTimeout(r, 1300));
const closedAfter = await page.evaluate(() => !document.querySelector('.smoke.open .dialog.modal'));
ok('modal 异步 onOk(loading 中 → settle 后关闭)', loadingMid && closedAfter);

/* 长内容内滚 + 自定义页脚 */
await clickBtn('许可协议');
const long = await page.evaluate(() => {
  const d = document.querySelector('.smoke.open .dialog.modal');
  const body = d.querySelector('.modal-body');
  const btns = [...d.querySelectorAll('.actions .btn')];
  return {
    scrolls: body.scrollHeight > body.clientHeight + 10,
    inViewport: d.getBoundingClientRect().bottom <= innerHeight,
    customFooter: btns.length === 1 && btns[0].textContent.includes('我已阅读'),
  };
});
ok('modal 长内容体内滚 + 自定义页脚', long.scrolls && long.inViewport && long.customFooter);
await page.evaluate(() => [...document.querySelectorAll('.dialog.modal .actions .btn')].find((b) => b.textContent.includes('我已阅读'))?.click());
await new Promise((r) => setTimeout(r, 300));

/* ---- Popover ---- */
await nav('Popover');
await clickBtn('网络选项');
const po = await page.evaluate(() => {
  const p = document.querySelector('.popover-pop');
  if (!p) return null;
  const st = getComputedStyle(p);
  return { portaled: p.parentElement === document.body, position: st.position, z: st.zIndex,
           title: p.querySelector('.popover-title')?.textContent, hasToggle: !!p.querySelector('.switch') };
});
ok('popover click 打开(portal/fixed/z850/标题/富内容)', po && po.portaled && po.position === 'fixed' && po.z === '850' && po.title === '代理设置' && po.hasToggle);
await page.evaluate(() => document.querySelector('.popover-pop .switch input')?.click());
await new Promise((r) => setTimeout(r, 250));
ok('popover 内点不关', !!(await page.$('.popover-pop')));
await page.click('.doc-title');
await new Promise((r) => setTimeout(r, 350));
ok('popover 外点关闭', !(await page.$('.popover-pop')));

/* hover 触发 */
const hoverBtn = await page.evaluate(() => {
  const b = [...document.querySelectorAll('.doc-demo .btn')].find((e) => e.textContent.includes('最近构建'));
  b.scrollIntoView({ block: 'center' });
  const r = b.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
await page.mouse.move(hoverBtn.x, hoverBtn.y);
await new Promise((r) => setTimeout(r, 400));
const hoverOpen = !!(await page.$('.popover-pop'));
await page.mouse.move(hoverBtn.x, hoverBtn.y + 300);
await new Promise((r) => setTimeout(r, 500));
const hoverClosed = !(await page.$('.popover-pop'));
ok('popover hover 触发(移入开/移出收)', hoverOpen && hoverClosed);

/* 受控 */
await clickBtn('受控锚点');
const ctl1 = await page.evaluate(() => document.querySelector('.popover-pop') && [...document.querySelectorAll('.doc-demo .btn')].some((b) => b.textContent.includes('(开)')));
await page.evaluate(() => [...document.querySelectorAll('.popover-pop .btn')].find((b) => b.textContent.includes('完成并关闭'))?.click());
await new Promise((r) => setTimeout(r, 350));
const ctl2 = await page.evaluate(() => !document.querySelector('.popover-pop') && [...document.querySelectorAll('.doc-demo .btn')].some((b) => b.textContent.includes('(关)')));
ok('popover 受控开合 + onOpenChange 回灌', !!ctl1 && ctl2);

/* ---- Progress ---- */
await nav('进度 Progress');
const pg = await page.evaluate(() => {
  const infos = [...document.querySelectorAll('.progress-info')].map((s) => s.textContent);
  const circles = [...document.querySelectorAll('.progress-circle')];
  const c = circles[0];
  const fill = c?.querySelector('.pc-fill');
  const C = 2 * Math.PI * 45;
  const v = 65;
  const expect = C * (1 - v / 100);
  return {
    infos,
    circleCount: circles.length,
    text: c?.querySelector('.pc-text')?.textContent,
    offsetOk: fill && Math.abs(parseFloat(fill.getAttribute('stroke-dashoffset')) - expect) < 0.5,
    sizes: circles.map((x) => x.getBoundingClientRect().width),
  };
});
ok(`progress showInfo 文字(${pg.infos.join(' | ')})`, pg.infos.includes('42%') && pg.infos.includes('42 / 100 项'));
ok(`progress 环形(×${pg.circleCount},心字 ${pg.text},尺寸 ${pg.sizes.join('/')})`,
   pg.circleCount === 3 && pg.text === '65%' && pg.offsetOk && pg.sizes[0] === 64 && pg.sizes[1] === 48 && pg.sizes[2] === 96);

console.log(`js errors: ${errors.length}`);
errors.slice(0, 5).forEach((e) => console.log('  ' + e));
await browser.close();
