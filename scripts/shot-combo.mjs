/* 打开控件页 ComboBox 并截图(验证下拉选项行样式) */
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://localhost:4173/';
const SHOT = process.argv[3] || 'combo';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 840 });
await page.goto(BASE, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 600));

const [ctl] = await page.$$(`xpath/.//button[contains(@class,'nav-item')][.//span[text()='控件']]`);
await ctl.click();
await new Promise((r) => setTimeout(r, 400));

// 先选中一项(制造 aria-selected 竖杠),再重新打开浮层截图
await page.click('.combo-trigger');
await new Promise((r) => setTimeout(r, 250));
const opts = await page.$$('.combo-pop .combo-option');
await opts[1].click();                       // 选「编辑」
await new Promise((r) => setTimeout(r, 300));
await page.click('.combo-trigger');
await new Promise((r) => setTimeout(r, 300));

const combo = await page.$('.combobox');
await combo.screenshot({ path: SHOT + '-combo.png', captureBeyondViewport: true });

// 顺带 DropDownButton 菜单
await page.keyboard.press('Escape');
await new Promise((r) => setTimeout(r, 200));
const [dd] = await page.$$(`xpath/.//button[contains(@class,'btn')][text()='新建']`);
await dd.click();
await new Promise((r) => setTimeout(r, 300));
const dropdown = await page.$('.dropdown');
await dropdown.screenshot({ path: SHOT + '-menu.png', captureBeyondViewport: true });

await browser.close();
console.log('screenshots done');
