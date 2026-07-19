/* 第一梯队验证:MultiSelect / Splitter / CommandBar / MenuBar / Spin / RangePicker */
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---- MultiSelect ---- */
await nav('MultiSelect');
await page.evaluate(() => document.querySelector('.ms-trigger').scrollIntoView({ block: 'center' }));
const tags0 = await page.$$eval('.multiselect .ms-tag', (els) => els.length);
await page.click('.ms-trigger');
await sleep(300);
const msPop = await page.evaluate(() => {
  const p = document.querySelector('.ms-pop');
  if (!p) return null;
  return { portaled: p.parentElement === document.body, checks: p.querySelectorAll('.ms-check.on').length };
});
ok('multiselect 打开(portal + 2 项已勾)', msPop && msPop.portaled && msPop.checks === 2);
await page.evaluate(() => [...document.querySelectorAll('.ms-option')].find((o) => o.textContent.includes('广州'))?.click());
await sleep(250);
const msAfter = await page.evaluate(() => ({
  stillOpen: !!document.querySelector('.ms-pop'),
  checks: document.querySelectorAll('.ms-check.on').length,
  tags: document.querySelectorAll('.multiselect .ms-tag').length,
}));
ok(`multiselect 勾选不关闭浮层(勾 ${msAfter.checks},tag ${tags0}→${msAfter.tags})`, msAfter.stillOpen && msAfter.checks === 3 && msAfter.tags === tags0 + 1);
await page.evaluate(() => document.querySelector('.multiselect .ms-tag .ms-tag-x')?.click());
await sleep(250);
const msRemoved = await page.$$eval('.multiselect .ms-tag', (els) => els.length);
ok(`multiselect Tag 摘除(${msAfter.tags}→${msRemoved})`, msRemoved === msAfter.tags - 1);
await page.click('.doc-title');
await sleep(300);
const msMore = await page.evaluate(() => {
  const demos = [...document.querySelectorAll('.doc-demo')];
  const d = demos.find((x) => x.querySelector('.ms-more'));
  return d?.querySelector('.ms-more')?.textContent;
});
ok(`multiselect maxTagCount 收纳(${msMore})`, msMore === '+2');

/* ---- Splitter ---- */
await nav('分栏 Splitter');
await page.evaluate(() => document.querySelector('.splitter').scrollIntoView({ block: 'center' }));
const g = await page.evaluate(() => {
  const gut = document.querySelector('.split-gutter');
  const r = gut.getBoundingClientRect();
  return { x: r.left + 3, y: r.top + r.height / 2, pane: document.querySelector('.split-pane').getBoundingClientRect().width };
});
await page.mouse.move(g.x, g.y);
await page.mouse.down();
await page.mouse.move(g.x + 80, g.y, { steps: 5 });
await page.mouse.up();
await sleep(200);
const paneAfter = await page.evaluate(() => document.querySelector('.split-pane').getBoundingClientRect().width);
ok(`splitter 拖动(${g.pane}→${paneAfter})`, Math.abs(paneAfter - (g.pane + 80)) <= 2);
await page.evaluate(() => { const gut = document.querySelector('.split-gutter'); gut.focus(); });
await page.keyboard.press('ArrowLeft');
await sleep(150);
const paneKb = await page.evaluate(() => document.querySelector('.split-pane').getBoundingClientRect().width);
ok(`splitter 键盘 ±16(${paneAfter}→${paneKb})`, Math.abs(paneKb - (paneAfter - 16)) <= 2);
await page.evaluate(() => {
  const gut = document.querySelector('.split-gutter');
  gut.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
});
await sleep(200);
const paneReset = await page.evaluate(() => document.querySelector('.split-pane').getBoundingClientRect().width);
ok(`splitter 双击回默认(${paneReset})`, Math.abs(paneReset - 200) <= 2);

/* ---- CommandBar ---- */
await nav('命令栏 CommandBar');
await page.evaluate(() => document.querySelector('.commandbar').scrollIntoView({ block: 'center' }));
await page.evaluate(() => [...document.querySelectorAll('.cmd-btn')].find((b) => b.textContent.includes('新建'))?.click());
await sleep(300);
const cmdToast = await page.evaluate(() => [...document.querySelectorAll('.toast')].some((t) => t.textContent.includes('add')));
ok('commandbar 主命令触发', cmdToast);
await page.click('.cmd-more');
await sleep(300);
const cmdMenu = await page.evaluate(() => {
  const m = document.querySelector('.menu-pop');
  return m && m.parentElement === document.body && [...m.querySelectorAll('.menu-item')].some((i) => i.textContent.includes('导出为'));
});
ok('commandbar 溢出菜单(portal + 次命令)', !!cmdMenu);
await page.evaluate(() => [...document.querySelectorAll('.menu-item')].find((i) => i.textContent.includes('选项'))?.click());
await sleep(300);
const cmdPick = await page.evaluate(() => [...document.querySelectorAll('.toast')].some((t) => t.textContent.includes('settings')));
ok('commandbar 次命令触发 + 菜单关闭', cmdPick && !(await page.$('.menu-pop')));

/* ---- MenuBar ---- */
await nav('菜单栏 MenuBar');
await page.evaluate(() => document.querySelector('.menubar').scrollIntoView({ block: 'center' }));
await page.evaluate(() => [...document.querySelectorAll('.mb-item')].find((b) => b.textContent === '文件')?.click());
await sleep(300);
const mb1 = await page.evaluate(() => {
  const m = document.querySelector('.menu-pop');
  const btn = [...document.querySelectorAll('.mb-item')].find((b) => b.textContent === '文件');
  if (!m || !btn) return null;
  const mr = m.getBoundingClientRect(), br = btn.getBoundingClientRect();
  return { under: Math.abs(mr.left - br.left) <= 9 && mr.top >= br.bottom, hasOpen: [...m.querySelectorAll('.menu-item')].some((i) => i.textContent.includes('打开')) };
});
ok('menubar 点击展开(锚定标签下方)', mb1 && mb1.under && mb1.hasOpen);
{
  const p = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.mb-item')].find((b) => b.textContent === '编辑');
    const r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(p.x, p.y);
}
await sleep(300);
const mb2 = await page.evaluate(() => {
  const m = document.querySelector('.menu-pop');
  return m && [...m.querySelectorAll('.menu-item')].some((i) => i.textContent.includes('撤销'));
});
ok('menubar 展开态悬停切换', !!mb2);
await page.evaluate(() => [...document.querySelectorAll('.menu-item')].find((i) => i.textContent.includes('复制'))?.click());
await sleep(300);
const mbPick = await page.evaluate(() => [...document.querySelectorAll('.toast')].some((t) => t.textContent.includes('edit') && t.textContent.includes('copy')));
ok('menubar onAction(itemKey, menuKey)', mbPick);

/* ---- Spin ---- */
await nav('加载容器 Spin');
await page.evaluate(() => document.querySelector('.spin-wrap').scrollIntoView({ block: 'center' }));
const maskBefore = !!(await page.$('.spin-mask'));
await page.evaluate(() => [...document.querySelectorAll('.doc-demo .btn')].find((b) => b.textContent.includes('模拟刷新'))?.click());
await sleep(500);
const spinMid = await page.evaluate(() => ({
  mask: !!document.querySelector('.spin-mask'),
  blurred: !!document.querySelector('.spin-content.blur'),
  ring: !!document.querySelector('.spin-mask .progress-ring'),
  tip: document.querySelector('.spin-tip')?.textContent,
}));
await sleep(1800);
const maskAfter = !!(await page.$('.spin-mask'));
ok(`spin 遮罩(前${maskBefore}/中${spinMid.mask}/后${maskAfter},tip ${spinMid.tip})`,
   !maskBefore && spinMid.mask && spinMid.blurred && spinMid.ring && spinMid.tip === '正在刷新…' && !maskAfter);

/* ---- RangePicker ---- */
await nav('日期范围');
await page.evaluate(() => document.querySelector('.rp-trigger').scrollIntoView({ block: 'center' }));
await page.click('.rp-trigger');
await sleep(300);
await page.evaluate(() => [...document.querySelectorAll('.dp-pop .cal-cell:not(.off)')].find((c) => c.textContent === '5')?.click());
await sleep(200);
// 悬停 12 号:预览着色
{
  const p = await page.evaluate(() => {
    const c = [...document.querySelectorAll('.dp-pop .cal-cell:not(.off)')].find((x) => x.textContent === '12');
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(p.x, p.y);
}
await sleep(200);
const preview = await page.evaluate(() => ({
  edges: document.querySelectorAll('.dp-pop .cal-cell.range-edge').length,
  inRange: document.querySelectorAll('.dp-pop .cal-cell.in-range').length,
}));
ok(`rangepicker 悬停预览(端点 ${preview.edges},区间 ${preview.inRange})`, preview.edges === 2 && preview.inRange === 6);
await page.evaluate(() => [...document.querySelectorAll('.dp-pop .cal-cell:not(.off)')].find((c) => c.textContent === '12')?.click());
await sleep(300);
const rpText = await page.evaluate(() => document.querySelector('.rp-trigger .combo-value').textContent);
ok(`rangepicker 提交(${rpText})`, /-05 ~ .*-12/.test(rpText) && !(await page.$('.dp-pop')));
await page.evaluate(() => document.querySelector('.rp-trigger .dp-clear')?.click());
await sleep(250);
const rpCleared = await page.evaluate(() => document.querySelector('.rp-trigger .combo-value').textContent);
ok(`rangepicker 清除(${rpCleared})`, rpCleared.includes('开始日期'));

console.log(`js errors: ${errors.length}`);
errors.slice(0, 5).forEach((e) => console.log('  ' + e));
await browser.close();
