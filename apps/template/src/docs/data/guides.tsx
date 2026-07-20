/* 文档数据:指南 — 快速上手 / 宿主接入 / 主题定制 / 样式定制 / 基础设施(不进首页画廊) */
import { useEffect, useState } from 'react';
import { Button, InfoBar, NumberBox, TextArea } from '@fluent-jade/ui';
import { HomeRegular, SettingsRegular } from '@fluent-jade/icon';
import { invoke } from '@fluent-jade/bridge';
import type { DocDef } from '../types';

/* ---- 运行时提取默认令牌(从编译后样式表读,永远与当前版本一致) ---- */
function collectTokens(dark: boolean): string {
  const seen = new Map<string, string>();
  const walk = (rules: CSSRuleList) => {
    for (const r of Array.from(rules)) {
      const anyR = r as CSSRule & { cssRules?: CSSRuleList; selectorText?: string; style?: CSSStyleDeclaration };
      if (anyR.cssRules && !(r instanceof CSSStyleRule)) { walk(anyR.cssRules); continue; }
      if (!(r instanceof CSSStyleRule)) continue;
      const sel = r.selectorText ?? '';
      if (!sel.includes(':root')) continue;
      const isDark = sel.includes('data-theme');
      if (isDark !== dark) continue;
      if (dark && !/data-theme=(\"|')?dark/.test(sel)) continue;
      for (const name of Array.from(r.style)) {
        if (name.startsWith('--')) seen.set(name, r.style.getPropertyValue(name).trim());
      }
    }
  };
  for (const ss of Array.from(document.styleSheets)) {
    try { walk(ss.cssRules); } catch { /* 跨域样式表跳过 */ }
  }
  const body = [...seen].map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return dark ? `:root[data-theme="dark"] {\n${body}\n}` : `:root {\n${body}\n}`;
}

function TokenDump() {
  const [light, setLight] = useState('');
  const [dark, setDark] = useState('');
  const [copied, setCopied] = useState('');
  useEffect(() => { setLight(collectTokens(false)); setDark(collectTokens(true)); }, []);
  const copy = (label: string, text: string) => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 1500);
    });
  };
  const area = (label: string, text: string) => (
    <div className="flex min-w-[320px] flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <b className="text-[13px]">{label}</b>
        <span className="text-(--text-3) text-[12px]">{text.split('\n').length - 2} 项</span>
        <Button size="small" variant="subtle" onClick={() => copy(label, text)}>
          {copied === label ? '已复制' : '复制'}
        </Button>
      </div>
      <TextArea readOnly value={text} rows={14} spellCheck={false}
                aria-label={`${label}默认令牌`}
                style={{ font: '12px/1.6 Consolas, "Cascadia Code", monospace', width: '100%' }} />
    </div>
  );
  return (
    <div className="flex w-full flex-wrap gap-4">
      {area('亮色(:root)', light)}
      {area('暗色([data-theme="dark"])', dark)}
    </div>
  );
}

const note = (text: string) => (
  <InfoBar level="info" title="说明">{text}</InfoBar>
);

/* ---- IPC 协议可视化:请求/应答消息卡(数据来自 bridge 源码真实契约) ---- */
interface WireRow { ch: string; req: string; res: string; note?: string; fail?: boolean }
function Wire({ rows }: { rows: WireRow[] }) {
  return (
    <div className="flex w-full flex-col gap-2">
      {rows.map((r, i) => (
        <div key={`${r.ch}-${i}`} className="rounded-md border border-(--card-border) bg-(--layer) p-3">
          <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
            <code className="text-[12.5px] font-semibold text-(--accent-text)">{r.ch}</code>
            {r.note && <span className="text-[11.5px] text-(--text-3)">{r.note}</span>}
          </div>
          <div className="grid gap-1.5 md:grid-cols-2">
            <pre className="overflow-x-auto rounded bg-(--bg) p-2 font-mono text-[11.5px] leading-relaxed text-(--text-2)">
              <span className="text-(--text-3)">→ 投递 </span>{r.req}
            </pre>
            <pre className={`overflow-x-auto rounded bg-(--bg) p-2 font-mono text-[11.5px] leading-relaxed ${r.fail ? 'text-(--critical)' : 'text-(--text-2)'}`}>
              <span className="text-(--text-3)">{r.fail ? '← reject ' : '← 应答 '}</span>{r.res}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}

/* 事件广播卡(宿主 → 前端) */
interface EvRow { ev: string; payload: string; note?: string }
function EvSpec({ rows }: { rows: EvRow[] }) {
  return (
    <div className="flex w-full flex-col gap-2">
      {rows.map((r) => (
        <div key={r.ev} className="rounded-md border border-(--card-border) bg-(--layer) p-3">
          <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
            <code className="text-[12.5px] font-semibold text-(--accent-text)">{r.ev}</code>
            {r.note && <span className="text-[11.5px] text-(--text-3)">{r.note}</span>}
          </div>
          <pre className="overflow-x-auto rounded bg-(--bg) p-2 font-mono text-[11.5px] leading-relaxed text-(--text-2)">
            <span className="text-(--text-3)">⇢ 广播 </span>{r.payload}
          </pre>
        </div>
      ))}
    </div>
  );
}

/* ---- 宿主接入页活演示:IPC 延迟测试(send_test 固定频道) ----
 * 设定次数连发:每次往返一张小卡,发送前全部重置为待机,
 * 完成后按耗时着色(快绿 / 中黄 / 慢红,失败红)并标注 ms */
interface Lap { ms: number | null; ok: boolean }

const mono = { font: '12px/1.6 Consolas, "Cascadia Code", monospace' } as const;

/** 耗时 → 卡片配色(快绿 / 中黄 / 慢红;失败红) */
const lapCls = (l: Lap) =>
  l.ms == null
    ? 'border-(--card-border) bg-(--bg) text-(--text-3)'
    : !l.ok || l.ms >= 150
      ? 'border-(--critical) text-(--critical) bg-[color-mix(in_srgb,var(--critical)_10%,transparent)]'
      : l.ms >= 60
        ? 'border-(--caution) text-(--caution) bg-[color-mix(in_srgb,var(--caution)_10%,transparent)]'
        : 'border-(--success) text-(--success) bg-[color-mix(in_srgb,var(--success)_10%,transparent)]';

function HostCommDemo() {
  const [body, setBody] = useState('{\n  "msg": "hello"\n}');
  const [times, setTimes] = useState(5);
  const [busy, setBusy] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [summary, setSummary] = useState<{ total: number; fails: number; out: string; ok: boolean } | null>(null);

  const send = async () => {
    if (busy) return;
    let payload: Record<string, unknown> = {};
    try {
      payload = body.trim() ? JSON.parse(body) : {};
    } catch (e) {
      setLaps([]);
      setSummary({ total: 0, fails: 0, ok: false, out: `本地校验失败:payload 不是合法 JSON — ${(e as Error).message}` });
      return;
    }
    const n = Math.max(1, times);
    setLaps(Array.from({ length: n }, () => ({ ms: null, ok: true })));   // 发送前重置全部小卡
    setSummary(null);
    setBusy(true);
    const t0 = performance.now();
    let fails = 0;
    let out = '';
    let ok = true;
    try {
      for (let i = 0; i < n; i++) {
        const r = await invoke('send_test', { seq: i + 1, ...payload });
        if (r.ok) out = JSON.stringify(r.data, null, 2);
        else { fails++; ok = false; out = `${r.error?.code ?? 'HOST_ERROR'}: ${r.error?.message ?? '宿主调用失败'}`; }
        const ms = r.ms;
        const passed = r.ok;
        setLaps((ls) => ls.map((l, j) => (j === i ? { ms, ok: passed } : l)));
      }
    } finally {
      setBusy(false);
    }
    setSummary({ total: Math.round(performance.now() - t0), fails, out, ok });
  };

  const done = laps.filter((l) => l.ms != null);
  return (
    <div className="flex w-full flex-col gap-3">
      {/* 控制行:固定频道 + 次数 */}
      <div className="flex flex-wrap items-center gap-3">
        <code className="rounded bg-(--layer) px-2 py-1 text-[12.5px] font-semibold text-(--accent-text)">send_test</code>
        <span className="flex items-center gap-1.5 text-[12.5px] text-(--text-2)">
          次数
          <NumberBox value={times} onChange={setTimes} min={1} max={1000} className="w-30" />
        </span>
        {summary && summary.total > 0 && (
          <span className="text-[12.5px] text-(--text-2)">
            {laps.length} 次 · 总耗时 <b>{summary.total}ms</b>
            {done.length > 0 && ` · 均 ${Math.round(done.reduce((a, l) => a + (l.ms ?? 0), 0) / done.length)}ms`}
            {summary.fails > 0 && <span className="text-(--critical)"> · 失败 {summary.fails} 次</span>}
          </span>
        )}
      </div>
      <TextArea value={body} onChange={(e) => setBody(e.target.value)} rows={2} spellCheck={false}
                aria-label="payload JSON" style={{ ...mono, width: '100%' }} />
      {/* 发送按钮独占一行 */}
      <div>
        <Button variant="accent" disabled={busy} onClick={() => void send()}>
          {busy ? '发送中…' : '发送 invoke'}
        </Button>
      </div>
      {/* 逐次耗时小卡 */}
      {laps.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {laps.map((l, i) => (
            <div key={i} className={`flex h-7 w-10 items-center justify-center rounded border text-[11px] font-semibold ${lapCls(l)}`}>
              {l.ms == null ? i + 1 : l.ok ? l.ms : 'ERR'}
            </div>
          ))}
        </div>
      )}
      {/* 末次应答 / 错误 */}
      {summary && (
        <pre className={`overflow-x-auto rounded bg-(--layer) p-2 text-[11.5px] leading-relaxed ${summary.ok ? 'text-(--text-2)' : 'text-(--critical)'}`} style={mono}>
          <span className="text-(--text-3)">{summary.ok ? '← 末次应答 ' : '← 错误 '}</span>{summary.out}
        </pre>
      )}
    </div>
  );
}

const start: DocDef = {
  key: 'guide-start',
  name: '快速上手',
  cn: '',
  description:
    '从模板起步是最快路径:本仓库的 apps/template 即完整应用骨架(外壳 + 主题 + 宿主桥接 + mock)。也可以把 packages/ 拷进既有 monorepo,按下述步骤接线。技术栈要求:React 19 + Vite + Tailwind CSS v4。',
  importCode: `git clone https://github.com/luoxueyousheng/fluent-jade.git && cd fluent-jade && npm install && npm run dev`,
  sections: [
    {
      title: '挂载 Provider 与样式(宿主接入零配置)',
      description: '`theme.css` 是唯一样式入口;`FluentProvider` 提供 Toast / 确认框渲染宿主;`bridge/auto` 一行完成宿主接入——浏览器 mock(真机自动让位)+ 初始化 + 默认 Mica 材质。不需要再手写 configure / init / applyBackdrop。',
      demo: note('FluentProvider 必须包在应用最外层;bridge/auto 引一次即可,需要初始化结果时调 ready()。'),
      code: `
// main.tsx —— 三行 import 完成全部接线
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluent-jade/ui';
import '@fluent-jade/ui/theme.css';
import '@fluent-jade/bridge/auto';   // 零配置:mock + init + 默认 Mica
import { App } from './App';

// 不需要 await —— auto 在后台自动完成
createRoot(document.getElementById('root')!).render(
  <FluentProvider>
    <App />
  </FluentProvider>,
);`,
    },
    {
      title: 'Tailwind v4 接入',
      description: '组件库自身不依赖你写 Tailwind,但模板与文档示例使用工具类;@source 让 Tailwind 扫描组件库源码。',
      demo: note('间距网格 4px(--spacing: 4px):p-1=4px、gap-3=12px;颜色一律用令牌(text-(--text-2) 等),不写裸值。'),
      code: `
/* index.css */
@import 'tailwindcss';
@import '@fluent-jade/ui/theme.css';
@source '../node_modules/@fluent-jade/ui/src';

/* vite.config.ts */
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()], base: './' });`,
    },
    {
      title: '第一个页面(AppShell)',
      demo: note('mode="multi" 即本文档站形态;单窗口小工具用 mode="single"。'),
      code: `
import { useState } from 'react';
import { AppShell, Button, useToast, type NavEntry } from '@fluent-jade/ui';

const NAV: NavEntry[] = [
  { key: 'home', label: '首页', icon: <HomeRegular /> },
  { key: 'settings', label: '设置', icon: <SettingsRegular />, bottom: true },
];

export function App() {
  const [page, setPage] = useState('home');
  const toast = useToast();
  return (
    <AppShell mode="multi" appName="我的应用" controls="host"
              items={NAV} value={page} onChange={setPage}>
      <h1 className="t-title">{page}</h1>
      <Button variant="accent" onClick={() => toast({ level: 'success', message: '就绪。' })}>
        开始
      </Button>
    </AppShell>
  );
}`,
    },
  ],
  props: [],
};

const host: DocDef = {
  key: 'guide-host',
  name: '宿主接入',
  cn: '',
  description:
    '业务侧只关心四件事:一行接入、初始化、像 fetch 一样调宿主、需要时再订制。默认对接 JadeView(`window.jade`)。',
  importCode: `import '@fluent-jade/bridge/auto';`,
  sections: [
    {
      title: '1. 一行接入(零配置)',
      description: '`bridge/auto` = 浏览器 mock(mock 后端供脱离宿主开发) + 自动初始化 + 默认 Mica 材质。引入一次即可,应用启动时自动完成全部初始化。',
      demo: note('文档站就是这个形态:main.tsx 引入 auto,不需要额外配置。'),
      code: `
// main.tsx —— 三行 import 完成所有接线
import '@fluent-jade/bridge/auto';
import { FluentProvider } from '@fluent-jade/ui';
import '@fluent-jade/ui/theme.css';

createRoot(document.getElementById('root')!).render(
  <FluentProvider>
    <App />
  </FluentProvider>,
);`,
    },
    {
      title: '2. 取初始化结果(ready)',
      description: '`ready()` 是幂等函数,返回 `{ hasJade, ENV, hasBackdrop }`。只需要在真正需要这些信息的时机调用,不需要在模块顶层 await。',
      demo: note('mock 模式下 hasJade=false,ENV 用默认值;真机下 hasJade=true,ENV 为宿主环境。'),
      code: `
import { ready } from '@fluent-jade/bridge';

async function initApp() {
  const { hasJade, ENV, hasBackdrop } = await ready();
  console.log('是否在真机:', hasJade);
  console.log('系统:', ENV.os, ENV.arch);          // "windows amd64"
  console.log('支持材质:', hasBackdrop);            // Windows 11 true
}

// 或按需加载时调用(ready 只会初始化一次)
document.querySelector('#start-btn')?.addEventListener('click', async () => {
  const { hasJade } = await ready();
  if (!hasJade) return alert('请在 JadeView 中运行');
});`,
    },
    {
      title: '3. 调用宿主(invoke / on)',
      description: '主推 Result 式:`invoke` 返回 `{ ok, data, error, ms }`,检查 `r.ok` 决定分支——比 try/catch 更简洁,天然覆盖所有路径。`invoke.json` 是快捷版:成功直接拿 data、失败抛 `HostError`。`on` / `useOn` 订阅推送。',
      demo: note('主推 invoke() 模式,代码更平,不需要在每个调用处套 try/catch。'),
      code: `
import { invoke, useOn } from '@fluent-jade/bridge';

// 主推——Result 式:检查 ok 决定分支
const r = await invoke<{ users: User[] }>('load_users', { q: '管理员' });
if (!r.ok) {
  console.error(r.error?.code, r.error?.message);
  return;
}
console.log(r.data.users);   // 类型安全

// 异步订阅推送(推荐 useOn,组件卸载自动退订)
useOn<{ percent: number }>('progress', (p) => setPct(p.percent));

// on 用于非 React 环境
const off = on('toast', (p) => console.log(p));
off(); // 退订`,
    },
    {
      title: '4. 可选订制(configure)',
      description: '只有默认通道名不同、要接错误回调、或改初始材质时才需要调用 `configure`。必须在 `ready()` 之前调用才生效。',
      demo: note('configure 可随时调,但对通道的改动只在下次 ready() 生效;改初始材质请传参给 ready()。'),
      code: `
import { configure, ready, setThemeMode, applyBackdrop, useTheme } from '@fluent-jade/bridge';

// 可选:改默认通道名、接错误回调
configure({
  onError: (ch, err) => toast({ level: 'error', message: err.message }),
  // channels: { setTheme: 'my-set-theme' },     // 通道名不同再改
});

// 可选:改初始材质(默认 mica)
await ready({ backdrop: 'micaAlt' });             // 或 backdrop: false 关闭自动材质

// 运行时切换主题/材质
await setThemeMode('dark');
await applyBackdrop('acrylic');

const { dark, mode, backdrop } = useTheme();`,
    },
    {
      title: '5. 活演示:IPC 延迟测试',
      description: '固定 `send_test` 频道的发送-应答延迟测试:设定次数后连发,每次往返一张小卡——发送前全部重置为待机(显示序号),完成后按耗时着色(快绿 / 中黄 / 慢红,失败标 ERR)并标注耗时数字,上方给出总耗时与平均值。独立预览由 mock 宿主响应(20–180ms 随机抖动),真机由 Go 侧响应,前端代码完全一致。',
      demo: <HostCommDemo />,
      code: `
import { useState } from 'react';
import { Button, NumberBox } from '@fluent-jade/ui';
import { invoke } from '@fluent-jade/bridge';

export function IpcBench() {
  const [times, setTimes] = useState(5);
  const [laps, setLaps] = useState<(number | null)[]>([]);
  const [total, setTotal] = useState(0);

  const send = async () => {
    setLaps(Array(times).fill(null));          // 发送前重置全部小卡
    const t0 = performance.now();
    for (let i = 0; i < times; i++) {
      // Result 式:{ ok, data, error, ms }
      const r = await invoke('send_test', { seq: i + 1, msg: 'hello' });
      setLaps((ls) => ls.map((v, j) => (j === i ? r.ms : v)));
    }
    setTotal(Math.round(performance.now() - t0));
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-3">
        <code>send_test</code>
        <NumberBox value={times} onChange={setTimes} min={1} max={60} className="w-20" />
        <Button variant="accent" onClick={() => void send()}>发送 invoke</Button>
        <span>总耗时 {total}ms</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {laps.map((ms, i) => (
          <div key={i} className="flex h-10 w-14 items-center justify-center rounded border">
            {ms == null ? i + 1 : ms + 'ms'}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    },
    {
      title: '6. 协议:invoke 信封(前端 → 宿主)',
      description: '一切调用只有一个出口:`window.jade.invoke(channel, payload, { timeout })`——channel 是命令名(字符串),payload 是 JSON 对象。宿主成功时 resolve 数据(对象或 JSON 字符串,前端自动 parse);失败时 reject `{ code, message }`,bridge 归一化为 `HostError`(附 channel / code / cause)。前端侧 `invoke` 把它包成 Result:`{ ok, data, error, ms }`。',
      demo: <Wire rows={[
        { ch: "invoke('load_users', payload)", req: `{\n  "query": "管理"\n}`, res: `{\n  "users": [ { "id": 1, "name": "林婉清", "role": "管理员", "online": true } ],\n  "total": 1\n}` },
        { ch: '同一命令失败时(宿主 reject)', req: '任意 payload', res: `{\n  "code": "UPLOAD_FAILED",\n  "message": "网络超时,请重试。"\n}`, fail: true },
      ]} />,
      code: `
// 宿主侧契约(Go / JadeView 实现这一对面即可)
window.jade = {
  // 成功 resolve 数据(对象或 JSON 字符串);失败 reject { code, message }
  invoke(channel, payload, opts) { /* ... */ return Promise.resolve(data); },
  // 事件广播:返回退订函数
  on(event, cb) { /* ... */ return () => {}; },
};

// 前端实际收到的(bridge 归一化后)
const r = await invoke('load_users', { query: '管理' });
// 成功:{ ok: true,  data: { users: [...], total: 1 }, error: null, channel: 'load_users', ms: 402 }
// 失败:{ ok: false, data: null, error: HostError{ code: 'UPLOAD_FAILED', ... }, channel: 'load_users', ms: 200 }`,
    },
    {
      title: '7. 初始化时序:auto / ready() 自动投递的消息',
      description: '`import \'@fluent-jade/bridge/auto\'` 或首调 `ready()` 时,bridge 按下面顺序向宿主投递;每步独立容错,任何一步失败(或宿主没实现该通道)都不阻断前端启动。通道名可经 `configure({ channels })` 覆盖。',
      demo: <Wire rows={[
        { ch: 'env', req: '{}', res: `{\n  "os": "windows",\n  "arch": "amd64",\n  "win11": true\n}`, note: '① 取运行环境;Preload 已注入 window.__JV_ENV 时跳过此调用' },
        { ch: 'set-theme', req: `{\n  "mode": "System"\n}`, res: `{\n  "theme": "System",\n  "effective": "Dark"\n}`, note: '② 同步主题模式:Light / Dark / System;运行时 setThemeMode() 也会再投此通道' },
        { ch: 'apply-titlebar', req: `{\n  "dark": true\n}`, res: '"ok"', note: '③ 标题栏跟随当前深浅色' },
        { ch: 'set-backdrop', req: `{\n  "type": "mica"\n}`, res: '"ok"', note: '④ 仅 Win11 投递;type: mica / micaAlt / acrylic / none;applyBackdrop() 运行时同通道' },
        { ch: 'set-backdrop(材质为 none 时)', req: `{\n  "type": "none",\n  "color": "#202020"\n}`, res: '"ok"', note: '附带纯色底,避免透明窗口无内容可透' },
      ]} />,
      code: `
// 宿主 Go 侧最小应答(伪码)
jade.Handle("env",            func(p) { return JSON(env) })          // { os, arch, win11 }
jade.Handle("set-theme",      func(p) { applyTheme(p.mode); return ok })
jade.Handle("apply-titlebar", func(p) { titlebarDark(p.dark); return ok })
jade.Handle("set-backdrop",   func(p) { backdrop(p.type, p.color); return ok })

// 前端期望的应答:resolve 任意可 JSON 化的数据;字符串会再尝试 parse 一次。
// 某条通道宿主没实现 → reject { code: 'NO_HANDLER', ... } 即可,前端自动降级。`,
    },
    {
      title: '8. 事件广播(宿主 → 前端)',
      description: '宿主随时可经事件通道主动推送,前端用 `on` / `useOn` 订阅;payload 同样支持对象或 JSON 字符串。以下三个事件名是 bridge / 模板约定,业务事件名与结构完全自定。',
      demo: <EvSpec rows={[
        { ev: 'toast', payload: `{\n  "level": "success",          // info / success / warning / error\n  "title": "导出完成",\n  "message": "report.csv(200 行)已保存。",\n  "duration": 5,                 // 秒,可选\n  "action": { "label": "打开", "command": "open_file" }  // 可选\n}`, note: 'UI 层已接渲染(App 里 useOn(\'toast\'));点 action 按钮把 command 作为命令回投宿主' },
        { ev: 'theme-changed', payload: `{\n  "theme": "Dark"   // Light / Dark\n}`, note: '系统或别的窗口改主题时同步(可选,前端默认只跟 prefers-color-scheme)' },
        { ev: 'progress', payload: `{\n  "task": "export",    // 任务名,自定\n  "percent": 40\n}`, note: '长任务进度推送;export_report 演示用的就是这个通道' },
      ]} />,
      code: `
// 宿主推送(Go 侧伪码)
jade.Emit("toast",    ` + '`' + `{"level":"success","title":"已保存","message":"配置已写入磁盘。"}` + '`' + `)
jade.Emit("progress", ` + '`' + `{"task":"export","percent":40}` + '`' + `)

// 前端订阅
import { on, useOn } from '@fluent-jade/bridge';
useOn('progress', (p) => setPct(p.percent));   // 组件内,卸载自动退订
const off = on('toast', (p) => console.log(p)); // 组件外,返回退订函数
off();`,
    },
    {
      title: '9. 业务命令参考(mock 内置实现)',
      description: '业务命令名与数据结构完全由应用自定。下表是模板 mock 宿主(`packages/bridge/src/mock.ts`)内置的参考实现——浏览器独立预览时,上一节「活演示」和本文档站调用的就是它们,信封契约与真机一致。',
      demo: <Wire rows={[
        { ch: 'ping', req: '{}', res: `{\n  "pong": true,\n  "at": "mock-backend"\n}` },
        { ch: 'send_test', req: `{\n  "seq": 1,\n  "msg": "hello"\n}`, res: `{\n  "pong": true,\n  "seq": 1,\n  "at": 1753000000000\n}`, note: '延迟测试专用:20–180ms 随机抖动后回显序号(上一节活演示用)' },
        { ch: 'read_config', req: `{\n  "key": "theme"   // 省略则返回全部\n}`, res: `{\n  "theme": "System"\n}` },
        { ch: 'write_config', req: `{\n  "patch": { "autosave": false }\n}`, res: `{\n  "theme": "System",\n  "accent": "#0078D4",\n  "autosave": false,\n  "zoom": 1.0\n}`, note: '写盘后广播 toast;patch 非对象时 reject BAD_REQUEST' },
        { ch: 'load_users', req: `{\n  "query": "管理"   // 可选,模糊过滤\n}`, res: `{\n  "users": [ { "id": 1, "name": "林婉清", "role": "管理员", "online": true } ],\n  "total": 1\n}` },
        { ch: 'create_user', req: `{\n  "name": "周文轩",\n  "role": "访客"\n}`, res: `{\n  "user": { "id": 12345, "name": "周文轩", "role": "访客", "online": false }\n}`, note: 'name 为空时 reject VALIDATION;成功后广播 toast' },
        { ch: 'delete_user', req: `{\n  "id": 3\n}`, res: `{\n  "deleted": 3\n}`, note: 'id 不存在时 reject NOT_FOUND' },
        { ch: 'export_report', req: `{\n  "rows": 200\n}`, res: `{\n  "file": "report.csv",\n  "rows": 200\n}`, note: '执行期间广播 progress,完成广播 toast(带 action)' },
        { ch: 'risky_op', req: '{}', res: `{\n  "code": "UPLOAD_FAILED",\n  "message": "网络超时,请重试。"\n}`, fail: true, note: '稳定失败,用于演示错误路径' },
      ]} />,
      code: `
// 前端:与真机完全同一套代码,mock 只是注入了 window.jade
const r = await invoke('create_user', { name: '周文轩', role: '访客' });
if (r.ok) console.log(r.data.user);
else console.error(r.error?.code, r.error?.message);   // VALIDATION / NOT_FOUND / ...

// mock 后端的错误写法(与真机信封一致):throw { code, message }
async create_user({ name, role }) {
  if (!name) throw { code: 'VALIDATION', message: '姓名不能为空' };
  return { user: { id: Date.now() % 100000, name, role: role || '访客', online: false } };
}`,
    },
  ],
  props: [],
  extraApis: [
    {
      title: '前端 API(常用)',
      rows: [
        { name: "import '@fluent-jade/bridge/auto'", type: 'side-effect', description: '推荐入口:mock + init + 自动 Mica。' },
        { name: 'invoke(ch, body?, opts?)', type: 'Promise<HostResponse<T>>', description: '⭐ 主推:Result 式 { ok, data, error, ms },检查 ok 决定分支。' },
        { name: 'invoke.json(ch, body?, opts?)', type: 'Promise<T>', description: '快捷版:成功 data,失败抛 HostError。' },
        { name: 'on(event, cb)', type: '() => void', description: '对齐 jade.on;返回退订函数。' },
        { name: 'useOn(event, cb)', type: 'hook', description: '组件内 on,卸载自动退订。' },
        { name: 'ready() / configure()', type: '可选', description: '取初始化结果 / 改通道与回调。' },
        { name: 'useTheme / setThemeMode / applyBackdrop', type: '可选', description: '主题与材质 UI 才用。' },
      ],
    },
    {
      title: '宿主最小实现',
      rows: [
        { name: 'window.jade.invoke', type: '(ch, body, opts) => Promise', description: '成功 resolve 数据;失败 reject { code, message }。' },
        { name: 'window.jade.on', type: '(event, cb) => unsubscribe', description: '事件订阅,返回退订函数。' },
        { name: 'window.__JV_ENV', type: '{ os, arch, win11 }', description: '推荐同步注入,省一次 env 调用。' },
        { name: '内置通道', type: 'env / set-theme / apply-titlebar / set-backdrop', description: 'auto 初始化会用到;业务通道名与结构自定。' },
        { name: '常用事件', type: 'toast / theme-changed / progress', description: 'toast 已接 UI 渲染;其余业务自定。' },
      ],
    },
  ],
};


const theme: DocDef = {
  key: 'guide-theme',
  name: '主题定制',
  cn: '',
  description:
    'theme.css 采用三层令牌:Seed 种子(品牌决策,含深色配对)→ Calibration 校准(默认主题钉 WinUI 官方精调值,换品牌删掉即回退公式)→ Map 梯度(color-mix 派生)→ Alias 别名(组件消费的稳定接口)。换主题色只改种子层;深浅色由 html[data-theme] 切换令牌,无 dark: 前缀。',
  importCode: `/* 全部定制都发生在 theme.css 顶部的令牌区,组件零改动 */`,
  sections: [
    {
      title: '换品牌色(只改种子)',
      demo: note('Calibration 层的默认值是按 WinUI 官方蓝精调的;换品牌色时删掉对应校准项,让 Map 层公式接管派生。'),
      code: `
/* theme.css 顶部:把 WinUI 蓝换成品牌紫 */
:root {
  --seed-accent: #6B4FBB;        /* 浅色主题种子 */
  --seed-accent-dark: #9A7FE8;   /* 深色主题配对 */
}
/* 若保留 WinUI 蓝的校准值会压过公式,记得删除/注释对应 --cal-* 项 */`,
    },
    {
      title: 'global.css 覆盖(推荐做法)',
      description: '在你自己的全局样式里(theme.css 之后引入)重声明令牌即可覆盖默认值——同选择器后者胜出,组件零改动。亮色改 :root,暗色改 :root[data-theme="dark"]。',
      demo: note('只覆盖你要改的项;种子层(--seed-*)改品牌,别名层(--accent / --card 等)做精准微调。'),
      code: `
/* global.css —— 在 import '@fluent-jade/ui/theme.css' 之后引入 */

/* 品牌换紫 + 卡片圆角加大 */
:root {
  --seed-accent: #6B4FBB;
  --r-window: 10px;
}
:root[data-theme="dark"] {
  --seed-accent-dark: #9A7FE8;
}

/* 精准微调:只动个别别名 */
:root {
  --card: #FCFCFD;
  --text-2: #52525B;
}`,
    },
    {
      title: '默认令牌总表(亮 / 暗,可直接复制)',
      description: '下面两个文本域实时提取自当前版本的样式表(不是手抄,永不过期):左亮色、右暗色。整段复制进 global.css,想改哪项改哪项、删掉不改的即可。',
      demo: <TokenDump />,
      code: `
/* 用法:复制文本域内容到 global.css,保留要覆盖的项,删除其余。
 * 令牌分层(从上到下按依赖顺序):
 *   --seed-*  种子:品牌决策(主题色及深色配对)
 *   --cal-*   校准:默认主题钉 WinUI 官方精调值;换品牌色时删除对应项让公式接管
 *   --m-*     梯度:color-mix 按百分比派生(一般不直接改)
 *   其余      别名:组件真正消费的稳定接口(--accent / --text-1 / --card / --fill-subtle …)
 * 非颜色令牌同样可覆盖:--r-control / --r-window 圆角,--fast/--normal/--slow 时长,
 * --fluent-* 缓动,--spacing 间距网格。 */`,
    },
    {
      title: '深浅主题与窗口材质',
      demo: note('组件与工具类都消费别名令牌,data-theme 一换全局生效;真机透明材质下浮层自动切换为不透明 --flyout 底(backdrop-filter 采不到窗外桌面)。'),
      code: `
// 深浅色:改 html 的 data-theme(bridge 的 setThemeMode 会代劳并同步宿主)
document.documentElement.dataset.theme = 'dark';

// 窗口材质(真机):bridge 下发宿主并同步 html[data-backdrop]
await applyBackdrop('micaAlt');`,
    },
  ],
  props: [],
  extraApis: [
    {
      title: '常用别名令牌',
      rows: [
        { name: '--accent / --accent-text', type: 'color', description: '主题色 / 文本用主题色(深色下提亮)。' },
        { name: '--text-1 / --text-2 / --text-3 / --text-disabled', type: 'color', description: '文字四级。' },
        { name: '--bg / --layer / --card / --flyout', type: 'color', description: '底 / 层级底 / 卡片底 / 浮层底。' },
        { name: '--stroke / --card-border / --divider', type: 'color', description: '描边三级。' },
        { name: '--fill-subtle / --fill-secondary', type: 'color', description: 'hover / 按压填充。' },
        { name: '--fluent-decelerate / --fluent-point / --fast / --normal / --slow', type: 'easing / duration', description: '动效令牌。' },
      ],
    },
  ],
};

const custom: DocDef = {
  key: 'guide-custom',
  name: '样式定制',
  cn: '',
  description:
    '组件外观有三个定制层级,从全局到单例:①令牌级——global.css 覆盖设计令牌,全库联动(见「主题定制」);②类契约级——每个组件的类名是稳定接口(下方总表),写普通 CSS 即可全局改某一类组件;③实例级——所有组件都接受 className / style(还有 Tailwind 工具类),只影响这一个实例。优先级从低到高,按需选最小作用面。',
  importCode: `/* 类契约级:global.css 里直接写组件类;实例级:className 挂任意工具类/自定义类 */`,
  sections: [
    {
      title: '类契约级:全局改某类组件',
      description: '组件类名不会在小版本里变动,视为公共 API。注意组件样式在 @layer components 内,你在 global.css 写的无层级规则天然优先——不需要 !important。',
      demo: note('浮层类(.combo-pop / .menu-pop / .toast 等)portal 在 body 下,不受父容器选择器约束,直接写类名即可命中。'),
      code: `
/* global.css —— 全局定制示例 */

/* 所有按钮更圆润 */
.btn { border-radius: 8px; }

/* Toast 更宽、标题更大 */
.toast { width: 400px; }
.toast .title { font-size: 14px; }

/* 下拉浮层限高更矮、菜单项更紧凑 */
.combo-pop { max-height: 200px; }
.menu-item { min-height: 28px; }

/* 表格表头底色跟品牌走 */
.datagrid .dg-head { background: color-mix(in srgb, var(--accent) 6%, var(--layer)); }

/* 侧导航更窄 */
.nav { width: 232px; }`,
    },
    {
      title: '实例级:className / style / Tailwind',
      description: '全部组件都透传 className(与内部类 cn 合并,不会破坏契约)和 style;文档站示例统一用 Tailwind 工具类(4px 网格,颜色走令牌)。',
      demo: note('例外:Tooltip 自身不渲染元素(克隆子元素注入 data-tip),样式类写在子元素上。'),
      code: `
import { Button, Card, Table } from '@fluent-jade/ui';

/* Tailwind 工具类(推荐:间距 4px 网格、颜色用令牌变量) */
<Button className="w-full" variant="accent">占满一行</Button>
<Card className="max-w-[480px] p-4 bg-(--layer)">窄卡片</Card>

/* style 兜底(一次性数值) */
<Table className="text-[12.5px]" maxHeight={240} ... />

/* 自定义类(配合上一节的 global.css) */
<Button className="cta-button">再叠一层自定义类</Button>`,
    },
  ],
  props: [],
  extraApis: [
    {
      title: '类契约 · 外壳与通用',
      rows: [
        { name: 'AppShell', type: '.app / .shell / .content / .content-inner', description: '外壳网格(40px 标题栏行 + 内容行)、导航列 + 滚动内容区。' },
        { name: 'TitleBar', type: '.title-bar / .tb-nav-btn / .tb-actions / .tb-caption / .tb-cap(.close)', description: '标题栏、返回/汉堡钮、动作区、自绘控制钮(关闭钮 .close 红)。' },
        { name: 'NavView', type: '.nav([data-collapsed]) / .nav-item(.active) / .nav-header / .nav-indicator / .nav-top / .nav-slot', description: '导航容器(折叠属性)、条目(激活态)、分组标题、accent 指示条、滚动列表区、搜索插槽。' },
        { name: 'Button', type: '.btn + .accent / .subtle / .link / .danger / .sm / .lg / .icon-only / .loading', description: '变体与尺寸全是修饰类,可组合。' },
        { name: 'ToggleButton', type: '.btn.toggle-btn(按下挂 .accent)', description: '复用按钮四态。' },
        { name: 'Fluent icons', type: '[data-fui-icon] / .icon', description: '官方 headless 图标;尺寸 size,颜色 color(默认 currentColor)。' },
      ],
    },
    {
      title: '类契约 · 输入',
      rows: [
        { name: 'Checkbox / Radio', type: '.check(.radio) / .box;卡片 .check-card / .cc-title / .cc-desc', description: '勾选框体 .box;卡片形态选中经 :has(input:checked) 着色。' },
        { name: 'CheckboxGroup / RadioGroup / SwitchGroup', type: '.check-group / .radio-group / .switch-group(+ .vertical / .cards)', description: '组容器与排列修饰。' },
        { name: 'Switch', type: '.switch / .track;卡片 .check-card.switch-card', description: '轨道 .track(选中 input:checked + .track)。' },
        { name: 'Slider / RangeSlider', type: '.slider-field / .slider-wrap / .slider / .slider-bubble / .slider-ticks / .slider-marks;.range-dual(.rail / .fill)', description: '标题行、气泡、刻度、标签;双滑块轨道与填充。' },
        { name: 'NumberBox', type: '.numberbox / .nb-spin', description: '内联 SpinButton 组。' },
        { name: 'Rating', type: '.rating(星钮 .on)', description: '' },
        { name: 'ColorPicker', type: '.colorpicker / .cp-trigger / .cp-pop / .cp-sv / .cp-hue / .cp-alpha / .cp-presets / .cp-preset', description: '触发器色块、浮层、SV 面板与滑条。' },
        { name: 'Upload', type: '.upload / .upload-trigger / .upload-dragger / .upload-item', description: '触发区、拖放区、文件行。' },
      ],
    },
    {
      title: '类契约 · 文本与表单',
      rows: [
        { name: 'TextBox / TextArea', type: '.input / .textarea(+ .sm / .lg / .status-error / .status-warning)', description: '尺寸与校验态修饰类。' },
        { name: 'PasswordBox', type: '.passwordbox / .pb-reveal', description: '显隐钮。' },
        { name: 'Field / Form.Item', type: '.field / .field-msg(.error / .success / .muted)', description: 'Form.Item 由 Field 渲染,同一契约。' },
        { name: 'SearchBox', type: '.searchbox / .sb-icon / .sb-clear', description: '' },
      ],
    },
    {
      title: '类契约 · 选择与浮层',
      rows: [
        { name: 'ComboBox / AutoSuggest', type: '.combobox(.suggest) / .combo-trigger / .combo-value / .combo-pop / .combo-option', description: '浮层 portal 在 body 下(z-850)。' },
        { name: 'MultiSelect', type: '.multiselect / .ms-trigger / .ms-tag(.ms-more) / .ms-pop / .ms-option / .ms-check', description: 'Tag 收纳与勾选行。' },
        { name: 'ListBox', type: '.listbox / .lb-item', description: '' },
        { name: '菜单族', type: '.dropdown / .ctx-area / .menu-pop / .menu-item(.danger) / .menu-divider', description: 'DropDownButton / 右键菜单 / MenuList 共用 menu-*。' },
        { name: 'Popover / TeachingTip', type: '.popover-pop / .popover-title / .popover-content;.teaching-tip', description: '' },
      ],
    },
    {
      title: '类契约 · 日期时间',
      rows: [
        { name: 'Calendar', type: '.calendar / .cal-head / .cal-title / .cal-grid / .cal-cell(.today / .selected / .off / .in-range / .range-edge)', description: '日格状态修饰类含区间着色。' },
        { name: 'DatePicker / RangePicker / TimePicker', type: '.datepicker / .dp-pop / .dp-clear;.rangepicker / .rp-trigger;.timepicker / .tp-pop / .tp-col / .tp-item', description: '' },
      ],
    },
    {
      title: '类契约 · 导航与集合',
      rows: [
        { name: 'SelectorBar / Tabs / TabView', type: '.selectorbar / .sb-item;.tabs(.pivot / .segmented*) / .tab / .tab-panel;.tabview / .vtab / .tab-add / .tab-close', description: '' },
        { name: 'CommandBar / MenuBar', type: '.commandbar / .cmd-btn(.danger) / .cmd-divider;.menubar / .mb-item(.open)', description: '' },
        { name: 'Breadcrumb / Steps / Pagination', type: '.breadcrumb / .bc-item(.current);.steps / .step(.done / .active / .wait);.pager / .pager-item', description: '' },
        { name: 'Table / DataGrid', type: '.datagrid(.striped / .compact) / .dg-head / .dg-body / .dg-row([aria-selected]) / .dg-cell(.num / .sortable / .dg-sel)', description: '行选中走 aria-selected 属性选择器。' },
        { name: 'Tree', type: '.tree / .tree-row / .tree-chev', description: '' },
      ],
    },
    {
      title: '类契约 · 展示与反馈',
      rows: [
        { name: 'Card / Expander / Splitter', type: '.card(.layer);.expander;.splitter(.vertical) / .split-pane / .split-gutter', description: '' },
        { name: 'SettingsCard', type: '.settings-card / .sc-icon / .sc-body / .sc-title / .sc-desc / .sc-control;.settings-expander', description: '' },
        { name: 'Image / Carousel', type: '.img-wrap / .img-mask / .img-preview / .imgp-stage;.carousel / .car-track / .car-slide / .car-dot(.active) / .car-arrow', description: '' },
        { name: 'Tag / Badge / Avatar / Divider / Empty / Skeleton / Timeline', type: '.tag(语义色类) / .badge(.dot) / .avatar / .divider / .empty(.simple) / .skeleton / .timeline / .tl-item(.tl-success 等) / .tl-dot / .tl-label', description: '' },
        { name: 'Toast', type: '.toast-host[data-placement] / .toast(等级类 .success 等) / .toast-progress', description: '六方位宿主 + 进度条。' },
        { name: 'Modal / Drawer / 确认框', type: '.smoke / .dialog(.modal) / .modal-head / .modal-body / .modal-close / .actions;.drawer / .drawer-head / .drawer-body', description: '遮罩从标题栏下方开始(inset 40px)。' },
        { name: 'InfoBar / Spin / Progress', type: '.infobar(等级类);.spin-wrap / .spin-content(.blur) / .spin-mask / .spin-tip;.progress(.indeterminate) / .progress-line / .progress-info / .progress-ring / .progress-circle(.pc-track / .pc-fill / .pc-text)', description: '' },
      ],
    },
  ],
};

const infra: DocDef = {
  key: 'guide-infra',
  name: '基础设施',
  cn: '',
  description:
    '组件之下的公共层:FluentProvider(Toast / 确认框渲染宿主与命令式绑定)、浮层基建(useFlyout / useFixedPlacement / MenuList,自组下拉与菜单)、通用工具(cn / useMergedState)。',
  importCode: `import {
  FluentProvider,
  useFlyout,
  useFixedPlacement,
  MenuList,
  cn,
  useMergedState,
} from '@fluent-jade/ui';`,
  sections: [
    {
      title: 'FluentProvider 与命令式反馈',
      demo: note('Provider 未挂载时:useToast/useConfirm 抛错;message/notification 仅 console.warn、modal.confirm 按取消处理——不会炸树。'),
      code: `
import {
  FluentProvider,
  useToast,
  useConfirm,
  message,
  modal,
} from '@fluent-jade/ui';

// 组件内
const toast = useToast();
toast({ level: 'success', title: '完成', message: '已保存。', action: { label: '撤销' }, onAction: undo });
const i = await useConfirm()({ title: '删除?', buttons: ['删除', '取消'], danger: true });

// 组件外(任意模块;duration 单位秒)
message.success('操作成功');
const ok = await modal.confirm({ title: '应用配置?', okText: '应用' });`,
    },
    {
      title: '自组浮层(useFlyout + useFixedPlacement)',
      description: '库内全部下拉/菜单都构建于这两个 hook:开合状态机(外点/Esc 关闭、全局同刻单开、closing 退场帧)+ portal fixed 定位(锚点下方、放不下上翻、滚动跟随、z-850)。',
      demo: note('portal 浮层必须渲染在锚点元素外(Fragment 兄弟),且把 popRef 传给 useFlyout 参与外点判定——两个都是踩过的坑。'),
      code: `
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFlyout, useFixedPlacement, MenuList } from '@fluent-jade/ui';

export function MyDropdown() {
  const rootRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const fly = useFlyout(rootRef, popRef);                       // popRef 参与外点判定
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen);
  return (
    <>
      <span ref={rootRef}><button onClick={fly.toggle}>操作</button></span>
      {fly.isOpen && createPortal(                              // portal 放锚点外
        <MenuList ref={popRef} closing={fly.closing}
                  className={placement.cls} style={placement.style}
                  items={[{ key: 'a', label: '动作 A' }]}
                  onPick={(k) => { fly.close(); run(k); }} />,
        document.body,
      )}
    </>
  );
}`,
    },
    {
      title: '通用工具',
      demo: note('useMergedState 是全库受控/非受控约定的实现:value 传入即受控,否则内部状态 + onChange 通知。'),
      code: `
import { cn, useMergedState } from '@fluent-jade/ui';

// 类名合并(假值剔除)
<div className={cn('card', active && 'active', className)} />

// antd 受控约定:一行实现 value/defaultValue/onChange
const [value, setValue] = useMergedState(defaultValue, valueProp, onChange);`,
    },
  ],
  props: [],
  extraApis: [
    {
      title: 'useFlyout 返回值',
      rows: [
        { name: 'isOpen / closing', type: 'boolean', description: '开合态;closing 为 150ms 退场动画期(定位 hook 应传 isOpen,关闭中不跳位)。' },
        { name: 'open() / close(immediate?) / toggle()', type: 'fn', description: 'immediate=true 立即卸载(选中提交场景防高亮迁移闪烁)。' },
      ],
    },
    {
      title: 'useFixedPlacement(anchorRef, popRef, open, opts?)',
      rows: [
        { name: 'opts.matchWidth', type: 'boolean', description: '浮层宽跟随锚点(下拉列表)。' },
        { name: 'opts.dep', type: 'unknown', description: '浮层内容尺寸的外部依赖(如候选数),变化重测。' },
        { name: '返回 { style, cls }', type: 'CSSProperties / string', description: 'style 挂浮层(fixed z-850);cls 为 .up 上翻标记(只管 transform-origin)。' },
      ],
    },
  ],
};

export const guideDocs: DocDef[] = [start, host, theme, custom, infra];
