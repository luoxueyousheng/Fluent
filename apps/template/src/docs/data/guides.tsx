/* 文档数据:指南 — 快速上手 / 宿主接入 / 主题定制 / 样式定制 / 基础设施(不进首页画廊) */
import { useEffect, useState } from 'react';
import { Button, InfoBar, TextArea } from '@fluent-jade/ui';
import { HomeRegular, SettingsRegular } from '@fluent-jade/icon';
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
      description: 'theme.css 是唯一样式入口;FluentProvider 提供 Toast / 确认框渲染宿主;bridge/auto 一行完成宿主接入默认行为——浏览器 mock(真机自动让位)+ 初始化(环境 / 主题 / 支持材质时自动 Mica)。不需要再手写 configure / init / applyBackdrop。',
      demo: note('FluentProvider 必须包在应用最外层;bridge/auto 引一次即可,需要初始化结果时调 ready()。'),
      code: `
// main.tsx —— 全部接线就这三行 import
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluent-jade/ui';
import '@fluent-jade/ui/theme.css';
import '@fluent-jade/bridge/auto';   // 零配置:mock + init + 默认 Mica
import { App } from './App';

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
  name: '宿主接入(bridge)',
  cn: '',
  description:
    '@fluent-jade/bridge 封装 WebView 宿主交互:初始化环境、主题/材质下发、IPC 调用与事件。**默认行为零配置**:入口引一行 bridge/auto 即完成 mock(真机自动让位)+ 初始化 + 自动 Mica;只有通道名或回调需要定制时才写 configure。默认对接 JadeView(window.jade);窗口控制钮与拖动区的多宿主适配见 TitleBar 文档。',
  importCode: `import '@fluent-jade/bridge/auto';   // 默认行为一行接完`,
  sections: [
    {
      title: '默认行为(推荐)',
      description: 'auto 入口做三件事:装浏览器 mock(检测到真机 window.jade 自动让位)、幂等 init(环境/主题/失焦降色)、支持材质时自动应用 Mica。业务侧需要初始化结果(是否宿主内 / 是否支持材质)时调 ready()。',
      demo: note('本文档站就是这个形态:main.tsx 一行 auto,App 里 ready() 取结果。'),
      code: `
// main.tsx
import '@fluent-jade/bridge/auto';

// App.tsx —— 需要结果时
import { ready } from '@fluent-jade/bridge';

const r = await ready();   // { hasJade, ENV, hasBackdrop },幂等复用同一次初始化
console.log(r.hasJade ? '宿主内' : '独立预览(mock)');`,
    },
    {
      title: '自定义(通道名 / 回调 / 材质)',
      description: '通道名因宿主而异时用 configure 覆盖(任意时机,下一次调用生效);想改初始材质或关闭自动应用,不引 auto、首调 ready(options) 自启即可。',
      demo: note('configure 与 auto 不冲突:auto 先跑默认初始化,configure 随后改通道/回调即可;只有 backdrop 初始值需要提前定,才自己首调 ready(options)。'),
      code: `
import { configure, ready } from '@fluent-jade/bridge';
// 也可以不引 auto,自己掌控初始化:
import '@fluent-jade/bridge/mock';   // 需要浏览器预览时

configure({
  channels: {            // 按宿主实际通道名覆盖(缺省为 JadeView 约定)
    env: 'env',
    setTheme: 'set-theme',
    applyTitlebar: 'apply-titlebar',
    setBackdrop: 'set-backdrop',
  },
  onError: (channel, err) => console.error(channel, err),
  onLog: (text, ok) => console.log(ok ? 'OK' : 'ERR', text),
});

await ready({ backdrop: 'micaAlt' });   // 或 backdrop: false 关闭自动材质`,
    },
    {
      title: '调用与事件(fetch 风格)',
      description: '业务调用像 fetch:host 返回 { ok, data, error };host.json 成功直接给 data、失败抛 HostError。旧 inv 仍可用(失败 null)。',
      demo: note('推荐 host.json 写业务;需要分支看 ok 时用 host。全局 onError 适合兜底 Toast,业务 try/catch 时对 host.json 默认 silent。'),
      code: `
import { host, HostError, useJadeEvent, useTheme } from '@fluent-jade/bridge';

// ① 最像 fetch:成功拿 data,失败 throw
try {
  const data = await host.json<{ users: { id: number; name: string }[] }>(
    'load_users',
    { query: '管理员' },
  );
  console.log(data.users);
} catch (e) {
  if (e instanceof HostError) console.error(e.channel, e.code, e.message);
}

// ② 不抛错,自己判断
const r = await host<{ rows: number }>('export_report', { rows: 200 });
if (r.ok) console.log(r.data, r.ms + 'ms');
else console.warn(r.error?.message);

// ③ 超时 / 中止(同 fetch)
const ac = new AbortController();
const p = host.json('long_task', {}, { timeout: 3000, signal: ac.signal });
// ac.abort();

// 订阅宿主事件(组件内)
useJadeEvent<{ task: string; percent: number }>('progress', (p) => setPct(p.percent));

// 主题状态
const { dark, mode, backdrop } = useTheme();`,
    },
    {
      title: '协议详解:前端会发什么(内置通道)',
      description:
        '初始化时序:env(仅当 PreloadJS 未注入 __JV_ENV)→ set-theme → apply-titlebar →(支持材质时)set-backdrop。之后每次切主题重发 set-theme + apply-titlebar,切材质重发 set-backdrop。通道名可经 configure.channels 改,发送结构不变。',
      demo: note('宿主只需处理这四个通道就能吃下全部默认行为;业务通道(inv 自定义名)结构完全由你自定。'),
      code: `
// ① env —— 前端发:{}(空对象)
//    期望应答:JadeEnv(对象或 JSON 字符串都行,前端自动解析)
{ "os": "windows", "arch": "amd64", "win11": true }

// ② set-theme —— 前端发(注意首字母大写):
{ "mode": "Light" }        // 'Light' | 'Dark' | 'System'
//    应答内容前端不读,建议回执:{ "theme": "Light", "effective": "Light" }
//    宿主职责:切窗口主题;System 时跟随系统并在变化时推 theme-changed 事件

// ③ apply-titlebar —— 每次主题生效后前端发:
{ "dark": true }
//    宿主职责:改标题栏覆盖层配色;应答前端不读

// ④ set-backdrop —— 前端发:
{ "type": "mica" }                          // 'mica' | 'micaAlt' | 'acrylic'
{ "type": "none", "color": "#202020FF" }    // 不支持材质时:纯色底,#RRGGBBAA 随深浅色
//    宿主职责:设置窗口材质或纯色背景;应答前端不读`,
    },
    {
      title: '协议详解:宿主要实现什么(window.jade)',
      description:
        '宿主注入两件必须品:invoke(命令调用)与 on(事件订阅,返回退订函数);推荐再同步注入 window.__JV_ENV 省一次 env 调用。invoke 成功 resolve 业务数据(建议直接回对象);失败 reject 一个带 code + message 的错误——前端 inv 不抛错,返回 null 并把错误交给 configure.onError。',
      demo: note('mock.ts 就是一份可运行的宿主参考实现:每个 handler 的入参/返回/抛错结构与真机契约一致。'),
      code: `
// 宿主注入面(必须两个,其余可选)
window.jade = {
  // 命令调用:成功 resolve 业务数据;失败 reject { code, message }
  invoke(channel, payload, opts /* { timeout } */) { ... },
  // 事件订阅:返回退订函数(useJadeEvent 卸载时会调用)
  on(event, callback) { ...; return unsubscribe; },
};
window.__JV_ENV = { os: 'windows', arch: 'amd64', win11: true };  // 推荐:同步注入省一次 env

// 业务调用示例:前端发什么、期望收什么完全由你的通道自定
// 前端:const data = await host.json('load_users', { query: '管理员' });
// 或:const r = await host('load_users', { query: '管理员' }); if (r.ok) ...
// 宿主应答(resolve):
{ "users": [{ "id": 1, "name": "林婉清", "role": "管理员", "online": true }], "total": 1 }

// 错误应答(reject):带 code 便于前端分支;inv 不抛错 → onError(channel, err)
{ "code": "VALIDATION", "message": "姓名不能为空" }
{ "code": "TIMEOUT",    "message": "命令超时" }     // 前端默认 8000ms,configure.timeout 可改`,
    },
    {
      title: '协议详解:宿主能推什么(事件)',
      description:
        '事件 payload 可以是对象或 JSON 字符串(前端自动兜底解析)。toast 是已接好渲染的约定事件——宿主推一条就能弹轻提示;theme-changed / progress 是约定示例,业务事件名与结构自定,前端用 useJadeEvent 订阅。',
      demo: note('长任务的正确姿势:invoke 立即返回受理,进度走事件推送,完成再推一条 toast。'),
      code: `
// toast —— 宿主主动弹轻提示(UI 层已接好渲染,推了就弹)
{ "level": "success", "title": "导出完成", "message": "report.csv(200 行)已保存。",
  "id": "export",                                   // 可选:同 id 覆盖旧条(去重)
  "action": { "label": "打开", "command": "open_file" } }  // 可选:动作钮,点击回发该命令

// theme-changed —— 宿主侧主题实际生效值变化
{ "theme": "Dark" }        // 'Light' | 'Dark'

// progress —— 长任务进度(示例约定,结构可自定)
{ "task": "export", "percent": 65 }

// 前端订阅:
useJadeEvent<{ task: string; percent: number }>('progress', (p) => setPct(p.percent));`,
    },
    {
      title: '独立预览(mock)',
      description: '浏览器里 import mock 即获得模拟宿主:响应 env/主题/材质通道、可模拟事件推送;真机存在 window.jade 时 mock 自动让位。无宿主也不引 mock 时,bridge 置 data-mock 强制纯色底(浏览器没有真实 Mica,透明底会让暗色文字隐形)。',
      demo: note('mock 只在开发入口引一次:import "@fluent-jade/bridge/mock"。'),
      code: `
// 仅开发/演示入口引入;生产真机不需要条件判断,mock 检测到宿主会自动让位
import '@fluent-jade/bridge/mock';`,
    },
  ],
  props: [],
  extraApis: [
    {
      title: '① 接入必须(只有这一行)',
      rows: [
        { name: "import '@fluent-jade/bridge/auto'", type: 'side-effect', description: '默认行为一行接完:浏览器 mock(真机自动让位)+ 幂等初始化 + 支持材质时自动 Mica。' },
      ],
    },
    {
      title: '② 业务通信(要和宿主收发数据才用)',
      rows: [
        { name: 'host(channel, body?, opts?)', type: 'Promise<HostResponse<T>>', description: 'fetch 风格:永不抛错,看 ok/data/error/ms;opts 支持 timeout/signal/silent。' },
        { name: 'host.json(channel, body?, opts?)', type: 'Promise<T>', description: '成功返回 data;失败抛 HostError(默认 silent,由调用方 try/catch)。' },
        { name: 'inv(channel, payload?)', type: 'Promise<T | null>', description: '旧软失败 API:失败返回 null 并走 onError;新代码优先 host。' },
        { name: 'useJadeEvent(event, cb)', type: 'hook', description: '订阅宿主推送事件,卸载自动退订;payload 字符串自动 JSON 解析。' },
        { name: 'useHost()', type: 'typeof host', description: '组件内稳定引用的 host(依赖数组友好)。' },
      ],
    },
    {
      title: '③ 进阶可选(各有明确的「只有…才需要」)',
      rows: [
        { name: 'ready(options?)', type: 'Promise<InitResult>', description: '只有需要初始化结果(是否宿主内 / 是否支持材质)才调;幂等,首调可带 backdrop。' },
        { name: 'configure({ ... })', type: 'void', description: '只有通道名和 JadeView 约定不一样、或要接全局错误/日志回调才配。' },
        { name: 'useTheme()', type: '{ dark, mode, backdrop }', description: '只有做主题相关 UI(如设置页)才用;随切换自动重渲染。' },
        { name: 'setThemeMode(mode)', type: "('light'|'dark'|'system') => Promise", description: '只有提供深浅色切换入口才用;改完自动下发宿主。' },
        { name: 'applyBackdrop(type)', type: '(type: string) => Promise', description: "只有提供材质切换入口才用:'mica' | 'micaAlt' | 'acrylic' | 'none'。" },
        { name: 'hasJade / ENV', type: 'boolean / JadeEnv', description: '只有做环境分支(宿主内 / 浏览器、Win11 与否)才读。' },
      ],
    },
    {
      title: '内置通道协议:前端 → 宿主(名称可经 configure.channels 改)',
      rows: [
        { name: 'env', type: '发 {}', description: '期望应答 JadeEnv:{ os, arch, win11 }(对象或 JSON 字符串均可)。仅当 PreloadJS 未注入 window.__JV_ENV 时才会调用。' },
        { name: 'set-theme', type: "发 { mode: 'Light' | 'Dark' | 'System' }", description: '宿主据此切窗口主题;应答内容前端不读(建议回 { theme, effective })。' },
        { name: 'apply-titlebar', type: '发 { dark: boolean }', description: '每次主题生效后调用,宿主据此改标题栏覆盖层配色;应答前端不读。' },
        { name: 'set-backdrop', type: "发 { type, color? }", description: "type: 'mica' | 'micaAlt' | 'acrylic' | 'none';type='none' 时附 color(#RRGGBBAA 纯色,随深浅色变化);应答前端不读。" },
      ],
    },
    {
      title: '事件协议:宿主 → 前端(window.jade 触发,useJadeEvent 订阅)',
      kind: 'events',
      rows: [
        { name: 'toast', type: 'ToastPayload', description: '宿主主动弹轻提示:{ level?, title?, message, duration?, id?, action?: { label, command } };UI 层已接好渲染。' },
        { name: 'theme-changed', type: "{ theme: 'Light' | 'Dark' }", description: '宿主侧主题实际生效值变化时推送(约定事件,业务可选订阅)。' },
        { name: 'progress', type: '{ task: string, percent: number }', description: '长任务进度推送(示例约定;业务事件名与结构可自定)。' },
      ],
    },
    {
      title: '数据结构',
      rows: [
        { name: 'HostResponse<T>', type: '{ ok, data, error, channel, ms }', description: 'host() 返回;ok 为 false 时 error 为 HostError。' },
        { name: 'HostError', type: 'Error & { channel, code, cause }', description: 'host.json 失败抛出;code 常见 NO_HOST / ABORTED / HOST_ERROR 或宿主自定义。' },
        { name: 'InitResult', type: '{ hasJade, ENV, hasBackdrop }', description: 'ready() 的返回:是否宿主内 / 环境信息 / 是否支持真实材质(Win11)。' },
        { name: 'JadeEnv', type: '{ os: string, arch: string, win11: boolean }', description: '运行环境;优先取 PreloadJS 注入的 window.__JV_ENV,否则经 env 通道兜底。' },
        { name: 'BridgeConfig', type: '{ timeout, channels, onError, onLog, solidColor }', description: 'configure 可覆盖项:超时(默认 8000ms)/ 四个内置通道名 / 全局错误与日志回调 / 纯色底取色函数。' },
        { name: '错误对象', type: '{ code: string, message: string }', description: '宿主 reject 时应携带 code + message;inv 不抛错,原样交给 onError(channel, err)。' },
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
