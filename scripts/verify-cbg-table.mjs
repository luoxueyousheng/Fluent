/* 验证:CheckboxGroup / Checkbox 半选 / Table 扩展(行选择/全选半选/禁用行/斑马纹/紧凑/loading) */
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

/* ---- CheckboxGroup + 半选 ---- */
await nav('检查框');
const cg = await page.evaluate(() => {
  const g = document.querySelector('.check-group');
  const checks = [...g.querySelectorAll('.check')];
  return { count: checks.length, disabled: checks.filter((c) => c.querySelector('input:disabled')).length,
           checked: checks.filter((c) => c.querySelector('input:checked')).length };
});
ok(`checkbox-group 渲染(${cg.count} 项,禁 ${cg.disabled},选 ${cg.checked})`, cg.count === 3 && cg.disabled === 1 && cg.checked === 1);
await page.evaluate(() => {
  const g = document.querySelector('.check-group');
  [...g.querySelectorAll('.check')].find((c) => c.textContent.includes('macOS'))?.click();
});
await sleep(200);
const cg2 = await page.evaluate(() => document.querySelector('.check-group').querySelectorAll('input:checked').length);
ok(`checkbox-group 勾选联动(1→${cg2})`, cg2 === 2);

/* 半选:全选父项三态 */
const ind = await page.evaluate(() => {
  const demos = [...document.querySelectorAll('.doc-demo')];
  const d = demos.find((x) => x.textContent.includes('全选平台'));
  const parent = [...d.querySelectorAll('.check')].find((c) => c.textContent.includes('全选平台'));
  return { indeterminate: parent.querySelector('input').indeterminate, checked: parent.querySelector('input').checked };
});
ok(`checkbox 半选初始(indeterminate=${ind.indeterminate})`, ind.indeterminate && !ind.checked);
await page.evaluate(() => {
  const d = [...document.querySelectorAll('.doc-demo')].find((x) => x.textContent.includes('全选平台'));
  [...d.querySelectorAll('.check')].find((c) => c.textContent.includes('全选平台'))?.click();
});
await sleep(200);
const ind2 = await page.evaluate(() => {
  const d = [...document.querySelectorAll('.doc-demo')].find((x) => x.textContent.includes('全选平台'));
  const parent = [...d.querySelectorAll('.check')].find((c) => c.textContent.includes('全选平台'));
  const group = d.querySelector('.check-group');
  return { checked: parent.querySelector('input').checked, indeterminate: parent.querySelector('input').indeterminate,
           groupChecked: group.querySelectorAll('input:checked').length };
});
ok(`checkbox 半选→全选(子项全勾 ${ind2.groupChecked}/3)`, ind2.checked && !ind2.indeterminate && ind2.groupChecked === 3);

/* ---- Table 行选择 ---- */
await nav('表格 Table');
const selDemo = () => page.evaluate(() => {
  const d = [...document.querySelectorAll('.doc-demo')].find((x) => x.textContent.includes('已选'));
  const grid = d.querySelector('.datagrid');
  const head = grid.querySelector('.dg-head .dg-sel input');
  const rows = [...grid.querySelectorAll('.dg-body .dg-row')];
  return {
    headChecked: head.checked, headInd: head.indeterminate,
    rowInputs: rows.map((r) => { const i = r.querySelector('.dg-sel input'); return { checked: i.checked, disabled: i.disabled }; }),
    selectedRows: rows.filter((r) => r.getAttribute('aria-selected') === 'true').length,
    tip: [...d.querySelectorAll('span')].find((x) => x.textContent.includes('已选'))?.textContent ?? '',
  };
});
await page.evaluate(() => [...document.querySelectorAll('.doc-demo')].find((x) => x.textContent.includes('已选'))?.scrollIntoView({ block: 'center' }));
let s = await selDemo();
ok(`table 行选择初始(半选=${s.headInd},选中行 ${s.selectedRows},禁用行 ${s.rowInputs.filter((r) => r.disabled).length})`,
   s.headInd && !s.headChecked && s.selectedRows === 1 && s.rowInputs.filter((r) => r.disabled).length === 1);
// 表头全选:选中全部可选行(6 行中 1 行禁用 → 5)
await page.evaluate(() => {
  const d = [...document.querySelectorAll('.doc-demo')].find((x) => x.textContent.includes('已选'));
  d.querySelector('.dg-head .dg-sel .check').click();
});
await sleep(250);
s = await selDemo();
ok(`table 全选(头=${s.headChecked},行选 ${s.selectedRows},${s.tip.slice(0, 8)}…)`, s.headChecked && !s.headInd && s.selectedRows === 5 && s.tip.includes('已选 5 行'));
// 再点取消全选
await page.evaluate(() => {
  const d = [...document.querySelectorAll('.doc-demo')].find((x) => x.textContent.includes('已选'));
  d.querySelector('.dg-head .dg-sel .check').click();
});
await sleep(250);
s = await selDemo();
ok(`table 取消全选(行选 ${s.selectedRows})`, s.selectedRows === 0 && !s.headChecked && !s.headInd);

/* 斑马纹 + 紧凑 */
const stripe = await page.evaluate(() => {
  const grid = document.querySelector('.datagrid.striped.compact');
  if (!grid) return null;
  const rows = [...grid.querySelectorAll('.dg-body .dg-row')];
  const bg = (el) => getComputedStyle(el).backgroundColor;
  return { differ: bg(rows[0]) !== bg(rows[1]), rowH: rows[0].getBoundingClientRect().height };
});
ok(`table 斑马纹+紧凑(奇偶异色=${stripe?.differ},行高 ${stripe?.rowH})`, stripe && stripe.differ && stripe.rowH <= 34);

/* loading */
await page.evaluate(() => [...document.querySelectorAll('.doc-demo .btn')].find((b) => b.textContent.includes('模拟加载'))?.click());
await sleep(500);
const tblLoading = await page.evaluate(() => !!document.querySelector('.spin-mask'));
await sleep(1500);
const tblLoaded = await page.evaluate(() => !document.querySelector('.spin-mask'));
ok(`table loading(中 ${tblLoading} → 后 ${tblLoaded})`, tblLoading && tblLoaded);

console.log(`js errors: ${errors.length}`);
errors.slice(0, 5).forEach((e) => console.log('  ' + e));
await browser.close();
