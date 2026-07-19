/* 验证:① ColorPicker 浮层 portal 后不被 doc-example(overflow:hidden)裁切、
 * 外点关闭/内点不关、拖拽色相仍工作;② Slider onChangeEnd 拖拽中不发、抬手发一次、键盘也发 */
import puppeteer from 'puppeteer-core';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 600));

/* ---- ① ColorPicker ---- */
await page.evaluate(() => [...document.querySelectorAll('.nav-item')].find((e) => e.textContent.includes('ColorPicker'))?.click());
await new Promise((r) => setTimeout(r, 400));
await page.evaluate(() => document.querySelector('.cp-trigger')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 200));
await page.click('.cp-trigger');
await new Promise((r) => setTimeout(r, 350));

const cp = await page.evaluate(() => {
  const pop = document.querySelector('.cp-pop');
  if (!pop) return { open: false };
  const p = pop.getBoundingClientRect();
  const ex = pop.closest('.doc-example');            // portal 后应为 null
  const exRect = document.querySelector('.doc-example').getBoundingClientRect();
  // 浮层底部中点命中测试:被裁切时 elementFromPoint 拿不到浮层内元素
  const el = document.elementFromPoint(p.left + p.width / 2, p.bottom - 6);
  return {
    open: true,
    portaled: pop.parentElement === document.body,
    insideExample: !!ex,
    escapesExample: p.bottom > exRect.bottom || p.top < exRect.top,
    hitTest: !!el && pop.contains(el),
    zIndex: getComputedStyle(pop).zIndex,
    fixed: getComputedStyle(pop).position,
  };
});
console.log('cp-pop:', JSON.stringify(cp));
console.log(cp.open && cp.portaled && !cp.insideExample && cp.escapesExample && cp.hitTest && cp.zIndex === '850' && cp.fixed === 'fixed'
  ? 'CP-PORTAL OK' : 'CP-PORTAL BAD');

/* 拖拽色相(portal 后指针捕获仍工作)→ 触发器 hex 变化 */
const hexBefore = await page.$eval('.cp-hex', (el) => el.value);
const hue = await page.$eval('.cp-hue', (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2, w: r.width }; });
await page.mouse.move(hue.x + hue.w * 0.2, hue.y);
await page.mouse.down();
await page.mouse.move(hue.x + hue.w * 0.7, hue.y, { steps: 6 });
await page.mouse.up();
await new Promise((r) => setTimeout(r, 200));
const hexAfter = await page.$eval('.cp-hex', (el) => el.value);
console.log(`hue drag: ${hexBefore} -> ${hexAfter} ${hexBefore !== hexAfter ? 'OK' : 'BAD'}`);

/* 内点不关(点 Hex 输入),外点关 */
await page.click('.cp-hex');
await new Promise((r) => setTimeout(r, 250));
const stillOpen = !!(await page.$('.cp-pop'));
await page.click('.doc-title');
await new Promise((r) => setTimeout(r, 400));
const closed = !(await page.$('.cp-pop'));
console.log(`inside-click keeps open: ${stillOpen ? 'OK' : 'BAD'}, outside-click closes: ${closed ? 'OK' : 'BAD'}`);

/* ---- ② Slider onChangeEnd ---- */
await page.evaluate(() => [...document.querySelectorAll('.nav-item')].find((e) => e.textContent.includes('滑块条'))?.click());
await new Promise((r) => setTimeout(r, 400));
// 「结束回调」示例节:含 提交值 文本
const read = () => page.evaluate(() => {
  const span = [...document.querySelectorAll('.doc-demo span')].find((s) => s.textContent.includes('提交值'));
  const m = span.textContent.match(/拖动中:(\d+) · 提交值:(\d+)/);
  return { live: +m[1], committed: +m[2] };
});
await page.evaluate(() => {
  const span = [...document.querySelectorAll('.doc-demo span')].find((s) => s.textContent.includes('提交值'));
  span.closest('.doc-demo').scrollIntoView({ block: 'center' });
});
await new Promise((r) => setTimeout(r, 200));
const s0 = await read();
const sl = await page.evaluate(() => {
  const span = [...document.querySelectorAll('.doc-demo span')].find((s) => s.textContent.includes('提交值'));
  const input = span.closest('.doc-demo').querySelector('input[type=range]');
  const r = input.getBoundingClientRect();
  return { x: r.left, y: r.top + r.height / 2, w: r.width };
});
await page.mouse.move(sl.x + sl.w * 0.3, sl.y);
await page.mouse.down();
await page.mouse.move(sl.x + sl.w * 0.8, sl.y, { steps: 8 });
await new Promise((r) => setTimeout(r, 150));
const mid = await read();                             // 抬手前:live 变、committed 不变
await page.mouse.up();
await new Promise((r) => setTimeout(r, 200));
const end = await read();                             // 抬手后:committed == live
console.log(`slider: start=${JSON.stringify(s0)} mid=${JSON.stringify(mid)} end=${JSON.stringify(end)}`);
const dragOk = mid.live !== s0.live && mid.committed === s0.committed && end.committed === end.live && end.committed !== s0.committed;
console.log(`onChangeEnd drag semantics: ${dragOk ? 'OK' : 'BAD'}`);

/* 键盘:ArrowRight 后 committed 跟上 */
await page.keyboard.press('ArrowRight');
await new Promise((r) => setTimeout(r, 200));
const kb = await read();
console.log(`keyboard: ${JSON.stringify(kb)} ${kb.committed === kb.live && kb.live === end.live + 1 ? 'OK' : 'BAD'}`);

console.log(`js errors: ${errors.length}`);
errors.slice(0, 5).forEach((e) => console.log('  ' + e));
await browser.close();
