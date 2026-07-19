/* 文档数据:外壳 — AppShell / TitleBar / NavView */
import { useState } from 'react';
import { AppShell, Icon, NavView, TitleBar, useToast, type NavEntry } from '@fluent-react/ui';
import type { DocDef } from '../types';

const appshell: DocDef = {
  key: 'appshell',
  name: 'AppShell',
  cn: '应用外壳',
  description:
    '标题栏 + 侧导航合并的一体化外壳,mode 控制形态:multi 多页文档(标题栏最左汉堡驱动展开/收缩(与导航图标列同 x 对齐),返回键其后)/ single 单页应用(仅标题栏 + 内容区,不渲染汉堡与侧导航)。返回键与 mode 解耦(传 onBack 即显示);TitleBar 的宿主能力(controls 三模式 / dragProps)原样透传。本文档站即 multi 形态。',
  importCode: `import { AppShell, type NavEntry } from '@fluent-react/ui';`,
  sections: [
    {
      title: '多页模式(multi)',
      description: '标题栏最左汉堡驱动收缩(与导航图标列对齐);items/value/onChange 与 NavView 同约定。',
      demo: <AppShellMultiDemo />,
      code: `
import { useState } from 'react';
import { AppShell, Icon, type NavEntry } from '@fluent-react/ui';

const ITEMS: NavEntry[] = [
  { key: 'home', label: '首页', icon: <Icon name="home" /> },
  { header: '媒体' },
  { key: 'music', label: '音乐', icon: <Icon name="file" strokeWidth={1.3} /> },
  { key: 'settings', label: '设置', icon: <Icon name="settings" strokeWidth={1.3} />, bottom: true },
];

export function MultiPageApp() {
  const [page, setPage] = useState('home');
  return (
    <AppShell mode="multi" appName="多页应用" controls="host"
              items={ITEMS} value={page} onChange={setPage}>
      <h1>{page}</h1>
    </AppShell>
  );
}`,
    },
    {
      title: '自绘窗口框(frame)',
      description: 'frame 让 Web 层画整个窗框:圆角 + 边框 + 阴影(--frame-margin/--frame-radius 可调),自绘控制钮贴右上角。前提:宿主创建「无边框 + 窗口级透明」的窗口(窗口 alpha 透明,不是网页 CSS 背景透明);该模式与 Mica/Acrylic 互斥——材质需要系统窗口参与,bridge 侧 ensureInit({ backdrop: false })。演示容器的渐变模拟透出的桌面。',
      demo: <AppShellFrameDemo />,
      code: `
// main.tsx:自绘框模式下关闭自动材质(不引 bridge/auto)
import '@fluent-react/bridge/mock';
import { ensureInit } from '@fluent-react/bridge';
void ensureInit({ backdrop: false });

// App.tsx
import { AppShell, type WindowController } from '@fluent-react/ui';

export function FramedApp({ controller }: { controller: WindowController }) {
  return (
    /* 宿主侧要求:无边框窗口 + 窗口透明(alpha);拖拽/控制走 controller 注入 */
    <AppShell mode="single" frame appName="自绘窗框应用" sub="圆角 / 边框 / 阴影由 Web 层绘制"
              controls={controller}>
      <p>圆角外的区域透出桌面(窗口级透明);关闭钮贴右上角并随圆角裁切。</p>
    </AppShell>
  );
}

/* 可调:阴影留白与圆角 */
// :root { --frame-margin: 12px; --frame-radius: 12px; }`,
    },
    {
      title: '单页模式(single)',
      description: '不渲染汉堡与侧导航,内容区直接铺满;适合登录页、小工具、单任务窗口。',
      demo: <AppShellSingleDemo />,
      code: `
import { AppShell } from '@fluent-react/ui';

export function SinglePageApp() {
  return (
    <AppShell mode="single" appName="单页工具" sub="就绪"
              controls={{ minimize: () => {}, close: () => {} }}>
      <h1>内容区铺满,无侧导航</h1>
    </AppShell>
  );
}`,
    },
  ],
  props: [
    { name: 'mode', type: "'multi' | 'single'", default: "'multi'", description: '多页(侧导航 + 汉堡)/ 单页(仅标题栏)。' },
    { name: 'frame', type: 'boolean', default: 'false', description: '自绘窗口框(圆角/边框/阴影,--frame-margin/--frame-radius 调):宿主须为无边框 + 窗口级透明,且与 Mica/Acrylic 互斥(ensureInit({ backdrop: false }))。作应用根挂载时自动置 html[data-frame] 转透明页面底。' },
    { name: 'appName / sub / logo', type: 'string / ReactNode / ReactNode', description: '标题栏内容(透传 TitleBar)。' },
    { name: 'controls / hostControlsWidth / maximized / dragProps', type: '同 TitleBar', description: '窗口控制三模式与拖动区注入,宿主不限语言。' },
    { name: 'titleBarActions', type: 'ReactNode', description: '标题栏内交互元素(自动 no-drag)。' },
    { name: 'onBack / backDisabled', type: '() => void / boolean', description: '返回键,与 mode 解耦,传入即显示。' },
    { name: 'items / value', type: 'NavEntry[] / string', description: 'multi 模式的导航条目与当前键。' },
    { name: 'navHeader', type: 'ReactNode', description: '导航列表上方固定插槽(如搜索框)。' },
    { name: 'collapsed / defaultCollapsed', type: 'boolean', default: '— / false', description: '折叠态受控 / 非受控(汉堡驱动)。' },
    { name: 'children', type: 'ReactNode', description: '内容区(自动包滚动容器)。' },
  ],
  events: [
    { name: 'onChange', type: '(key: string) => void', description: '导航切换(multi 模式)。' },
    { name: 'onCollapsedChange', type: '(collapsed: boolean) => void', description: '折叠态变化。' },
  ],
};

function AppShellMultiDemo() {
  const [page, setPage] = useState('home');
  const items: NavEntry[] = [
    { key: 'home', label: '首页', icon: <Icon name="home" /> },
    { header: '媒体' },
    { key: 'music', label: '音乐', icon: <Icon name="file" strokeWidth={1.3} /> },
    { key: 'settings', label: '设置', icon: <Icon name="settings" strokeWidth={1.3} />, bottom: true },
  ];
  return (
    <div style={{ height: 320, width: '100%', overflow: 'hidden', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--layer)' }}>
      <AppShell mode="multi" appName="多页应用" sub="汉堡在标题栏" controls="none"
                items={items} value={page} onChange={setPage}>
        <p style={{ color: 'var(--text-2)' }}>当前页:{page}(点标题栏汉堡收缩)</p>
      </AppShell>
    </div>
  );
}

function AppShellFrameDemo() {
  const toast = useToast();
  const ctrl = {
    minimize: () => toast({ level: 'info', message: '(宿主)minimize' }),
    toggleMaximize: () => toast({ level: 'info', message: '(宿主)toggle-maximize' }),
    close: () => toast({ level: 'warning', message: '(宿主)close' }),
  };
  return (
    /* 渐变容器模拟「透明窗口后的桌面」 */
    <div style={{ height: 260, width: '100%', borderRadius: 8, overflow: 'hidden',
                  background: 'linear-gradient(135deg, #1a4a6e 0%, #4a2a6e 55%, #6e2a4a 100%)' }}>
      <AppShell mode="single" frame appName="自绘窗框应用" sub="圆角 / 边框 / 阴影由 Web 层绘制"
                controls={ctrl}>
        <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>
          圆角外的区域透出桌面(真机为窗口级透明);自绘关闭钮贴右上角、随圆角裁切。
        </p>
      </AppShell>
    </div>
  );
}

function AppShellSingleDemo() {
  const toast = useToast();
  return (
    <div style={{ height: 200, width: '100%', overflow: 'hidden', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--layer)' }}>
      <AppShell mode="single" appName="单页工具" sub="无侧导航"
                controls={{ minimize: () => toast({ level: 'info', message: '(宿主)minimize' }), close: () => toast({ level: 'warning', message: '(宿主)close' }) }}>
        <p style={{ color: 'var(--text-2)' }}>单页模式:不渲染汉堡与侧导航,内容区铺满。</p>
      </AppShell>
    </div>
  );
}

const titlebar: DocDef = {
  key: 'titlebar',
  name: 'TitleBar',
  cn: '标题栏',
  description:
    'WinUI 3 规格的 40px 标题栏:左起返回键、导航汉堡、logo、标题;右侧窗口控制钮三模式——host(宿主自绘,如 JadeView title-overlay,仅预留空位)/ none(浏览器或宿主系统标题栏,不渲染不预留)/ 传 WindowController 自绘 WinUI 控制钮并把回调注入宿主 IPC。宿主不限定语言:拖动区与窗口控制全部可注入,JadeView / C++ WebView2 / Python pywebview / Go Wails 都能接。z-900 永不被页内浮层遮挡。',
  importCode: `import { TitleBar, type WindowController } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础结构(返回 + 汉堡 + 自绘控制钮)',
      description: '演示为静态嵌入;真实应用中标题栏位于窗口顶部 40px 行。返回键 / 汉堡传入回调即显示,控制钮点击走注入的宿主回调。',
      demo: <TitleBarDemo />,
      code: `
import { useState } from 'react';
import { TitleBar, type WindowController } from '@fluent-react/ui';

export function TitleBarExample() {
  const [collapsed, setCollapsed] = useState(false);
  const [maximized, setMaximized] = useState(false);
  // 回调注入宿主 IPC:这里用本地状态模拟
  const controller: WindowController = {
    minimize: () => console.log('host: minimize'),
    toggleMaximize: () => setMaximized(!maximized),
    close: () => console.log('host: close'),
  };
  return (
    <TitleBar appName="示例应用" sub="就绪"
              onBack={() => history.back()} backDisabled={false}
              onMenu={() => setCollapsed(!collapsed)}
              controls={controller} maximized={maximized} />
  );
}`,
    },
    {
      title: '窗口控制三模式',
      description: '按宿主形态选择:title-overlay 宿主自绘选 host;网页 / 宿主保留系统标题栏选 none;无边框窗口自绘选 WindowController。',
      demo: <TitleBarModes />,
      code: `
import { TitleBar } from '@fluent-react/ui';

export function ControlModesExample() {
  return (
    <>
      {/* 宿主自绘(JadeView title-overlay):右侧预留 146px 空位 */}
      <TitleBar appName="host 模式" controls="host" />
      {/* 浏览器 / 宿主系统标题栏:不渲染不预留 */}
      <TitleBar appName="none 模式" controls="none" />
      {/* 无边框窗口:自绘 WinUI 控制钮(Windows 11 规格,关闭钮红) */}
      <TitleBar appName="自绘模式"
                controls={{ minimize: () => {}, toggleMaximize: () => {}, close: () => {} }} />
    </>
  );
}`,
    },
    {
      title: '宿主适配(不限定火山视窗)',
      description: '窗口控制与拖动区全部经 props 注入,任何语言的宿主都能接。拖动区默认输出 jade-region-drag 属性 + CSS app-region 兜底,其他宿主用 dragProps 覆盖。',
      demo: (
        <p className="text-(--text-2) leading-[1.8] m-0">
          下方示例覆盖四类宿主:JadeView(Go,title-overlay)直接 host 模式;C++ WebView2 经
          postMessage;Python pywebview 经 JS API + 专属拖动类名;Go Wails 经 runtime 函数 +
          --wails-draggable。展开代码查看。
        </p>
      ),
      code: `
import { TitleBar } from '@fluent-react/ui';

/* ① JadeView(火山视窗,Go):frame_style=title-overlay,宿主自绘控制钮 */
export function JadeViewHost() {
  return <TitleBar appName="App" controls="host" />;   // 拖动区默认 jade-region-drag
}

/* ② C++ / WebView2:无边框窗口,自绘控制钮,消息发给宿主处理 */
export function WebView2Host() {
  const post = (cmd: string) => (window as any).chrome?.webview?.postMessage({ cmd });
  return (
    <TitleBar appName="App"
              controls={{
                minimize: () => post('minimize'),
                toggleMaximize: () => post('toggle-maximize'),
                close: () => post('close'),
              }} />
  );
}

/* ③ Python / pywebview:JS API + 专属拖动区类名 */
export function PywebviewHost() {
  const api = (window as any).pywebview?.api;
  return (
    <TitleBar appName="App"
              dragProps={{ className: 'pywebview-drag-region' }}
              controls={{
                minimize: () => api?.minimize(),
                toggleMaximize: () => api?.toggle_maximize(),
                close: () => api?.close(),
              }} />
  );
}

/* ④ Go / Wails:runtime 函数 + --wails-draggable 样式 */
export function WailsHost() {
  // import { WindowMinimise, WindowToggleMaximise, Quit } from '../wailsjs/runtime/runtime';
  return (
    <TitleBar appName="App"
              dragProps={{ style: { '--wails-draggable': 'drag' } as React.CSSProperties }}
              controls={{
                minimize: () => WindowMinimise(),
                toggleMaximize: () => WindowToggleMaximise(),
                close: () => Quit(),
              }} />
  );
}`,
    },
  ],
  props: [
    { name: 'appName', type: 'string', description: '应用名(必填)。' },
    { name: 'sub', type: 'ReactNode', description: '副标题(状态文本,溢出省略)。' },
    { name: 'logo', type: 'ReactNode', description: '自定义 logo,缺省内置图标。' },
    { name: 'onBack / backDisabled', type: '() => void / boolean', description: '返回键:传 onBack 即显示(WinUI 3 最左位次)。' },
    { name: 'onMenu', type: '() => void', description: '导航汉堡:传入即显示(返回键之后),配 NavView 受控 collapsed。' },
    { name: 'controls', type: "'host' | 'none' | WindowController", default: "'host'", description: '窗口控制三模式,见上文。' },
    { name: 'hostControlsWidth', type: 'number', default: '146', description: 'host 模式右侧预留宽度。' },
    { name: 'maximized', type: 'boolean', default: '监听 html[data-maximized]', description: '自绘控制钮的最大化态(切换还原图标)。' },
    { name: 'dragProps', type: 'HTMLAttributes', description: '拖动区属性覆盖(className / style),适配非 JadeView 宿主。' },
    { name: 'children', type: 'ReactNode', description: '标题栏内交互元素(自动 no-drag,靠右、控制钮之前)。' },
  ],
  extraApis: [
    {
      title: 'WindowController',
      rows: [
        { name: 'minimize', type: '() => void', description: '最小化;缺省不渲染该钮。' },
        { name: 'toggleMaximize', type: '() => void', description: '最大化 / 还原切换;缺省不渲染。' },
        { name: 'close', type: '() => void', description: '关闭(红色悬停,Windows 11 规格);缺省不渲染。' },
      ],
    },
  ],
};

function TitleBarDemo() {
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [maximized, setMaximized] = useState(false);
  return (
    <div style={{ width: '100%', border: '1px solid var(--card-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--layer)' }}>
      <TitleBar appName="示例应用" sub={collapsed ? '导航已收缩' : '就绪'}
                onBack={() => toast({ level: 'info', message: '返回上一页' })}
                onMenu={() => { setCollapsed(!collapsed); }}
                controls={{
                  minimize: () => toast({ level: 'info', message: '(宿主 IPC)minimize' }),
                  toggleMaximize: () => { setMaximized(!maximized); toast({ level: 'info', message: `(宿主 IPC)${maximized ? 'restore' : 'maximize'}` }); },
                  close: () => toast({ level: 'warning', message: '(宿主 IPC)close' }),
                }}
                maximized={maximized} />
    </div>
  );
}

function TitleBarModes() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(['host', 'none'] as const).map((m) => (
        <div key={m} style={{ border: '1px solid var(--card-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--layer)' }}>
          <TitleBar appName={`${m} 模式`} sub={m === 'host' ? '右侧预留宿主按钮区' : '不渲染不预留'} controls={m} />
        </div>
      ))}
      <div style={{ border: '1px solid var(--card-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--layer)' }}>
        <TitleBar appName="自绘模式" sub="WinUI 控制钮"
                  controls={{ minimize: () => {}, toggleMaximize: () => {}, close: () => {} }} />
      </div>
    </div>
  );
}

const navview: DocDef = {
  key: 'navview',
  name: 'NavView',
  cn: '导航视图',
  description:
    '左侧导航(火山 Demo 外观 + WinUI NavigationView 行为):accent 指示条 Point 缓动滑动并跟随滚动、{header} 分组标题、bottom 钉底项、列表区独立滚动、折叠为 48px 窄条。展开/收缩两种形态:传 onCollapsedChange 渲染内置汉堡;或按 WinUI 3 规格把汉堡放进 TitleBar(onMenu),NavView 只受控接 collapsed——本文档站即此形态。',
  importCode: `import { NavView, type NavEntry } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法(内置汉堡)',
      description: '{header} 条目为分组标题(折叠时淡出);bottom: true 钉在底部。',
      demo: <NavViewDemo />,
      code: `
import { useState } from 'react';
import { Icon, NavView, type NavEntry } from '@fluent-react/ui';

const ITEMS: NavEntry[] = [
  { key: 'home', label: '首页', icon: <Icon name="home" /> },
  { header: '媒体' },
  { key: 'music', label: '音乐', icon: <Icon name="file" strokeWidth={1.3} /> },
  { key: 'video', label: '视频', icon: <Icon name="image" strokeWidth={1.3} /> },
  { key: 'settings', label: '设置', icon: <Icon name="settings" strokeWidth={1.3} />, bottom: true },
];

export function NavViewExample() {
  const [page, setPage] = useState('home');
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-[320px] w-full overflow-hidden rounded-lg border border-(--card-border)">
      <NavView items={ITEMS} value={page} onChange={setPage}
               collapsed={collapsed} onCollapsedChange={setCollapsed} />
      <div className="flex-1 p-4 text-(--text-2)">当前页:{page}</div>
    </div>
  );
}`,
    },
    {
      title: '标题栏汉堡形态(WinUI 3)',
      description: '不传 onCollapsedChange 则不渲染内置汉堡,collapsed 完全受控——把汉堡放进 TitleBar 的 onMenu,收缩/展开由标题栏驱动。',
      demo: <NavViewTitleBarDemo />,
      code: `
import { useState } from 'react';
import { Icon, NavView, TitleBar, type NavEntry } from '@fluent-react/ui';

export function ShellExample() {
  const [page, setPage] = useState('home');
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="grid h-full grid-rows-[40px_1fr]">
      {/* 汉堡在标题栏内(WinUI 3 位次),驱动 NavView 受控 collapsed */}
      <TitleBar appName="App" onMenu={() => setCollapsed(!collapsed)} controls="host" />
      <div className="flex min-h-0">
        <NavView items={ITEMS} value={page} onChange={setPage} collapsed={collapsed} />
        <main className="flex-1 overflow-auto">…</main>
      </div>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: 'NavEntry[]', description: '条目数组:普通项或 {header} 分组标题。' },
    { name: 'value', type: 'string', description: '受控当前项键(必填)。' },
    { name: 'collapsed', type: 'boolean', description: '受控折叠态(48px 窄条,标签淡出)。' },
    { name: 'header', type: 'ReactNode', description: '列表上方固定插槽(如搜索框),折叠时隐藏。' },
    { name: 'onCollapsedChange', type: '(collapsed: boolean) => void', description: '传入即渲染内置汉堡;汉堡放标题栏时不传。' },
  ],
  events: [
    { name: 'onChange', type: '(key: string) => void', description: '点击导航项。' },
  ],
  extraApis: [
    {
      title: 'NavEntry',
      rows: [
        { name: 'key / label / icon', type: 'string / string / ReactNode', description: '普通导航项。' },
        { name: 'bottom', type: 'boolean', description: 'true 钉到底部区(不随列表滚动)。' },
        { name: '{ header: string }', type: 'NavHeaderDef', description: '分组标题行(不可交互,折叠时淡出)。' },
      ],
    },
  ],
};

function NavViewDemo() {
  const [page, setPage] = useState('home');
  const [collapsed, setCollapsed] = useState(false);
  const items: NavEntry[] = [
    { key: 'home', label: '首页', icon: <Icon name="home" /> },
    { header: '媒体' },
    { key: 'music', label: '音乐', icon: <Icon name="file" strokeWidth={1.3} /> },
    { key: 'video', label: '视频', icon: <Icon name="image" strokeWidth={1.3} /> },
    { key: 'settings', label: '设置', icon: <Icon name="settings" strokeWidth={1.3} />, bottom: true },
  ];
  return (
    <div style={{ display: 'flex', height: 320, width: '100%', overflow: 'hidden', borderRadius: 8, border: '1px solid var(--card-border)' }}>
      <NavView items={items} value={page} onChange={setPage}
               collapsed={collapsed} onCollapsedChange={setCollapsed} />
      <div style={{ flex: 1, padding: 16, color: 'var(--text-2)', background: 'var(--layer)' }}>当前页:{page}</div>
    </div>
  );
}

function NavViewTitleBarDemo() {
  const [page, setPage] = useState('home');
  const [collapsed, setCollapsed] = useState(false);
  const items: NavEntry[] = [
    { key: 'home', label: '首页', icon: <Icon name="home" /> },
    { key: 'library', label: '库', icon: <Icon name="layers" strokeWidth={1.3} /> },
    { key: 'settings', label: '设置', icon: <Icon name="settings" strokeWidth={1.3} />, bottom: true },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateRows: '40px 1fr', height: 300, width: '100%', overflow: 'hidden', borderRadius: 8, border: '1px solid var(--card-border)' }}>
      <TitleBar appName="示例应用" onMenu={() => setCollapsed(!collapsed)} controls="none" />
      <div style={{ display: 'flex', minHeight: 0, background: 'var(--layer)' }}>
        <NavView items={items} value={page} onChange={setPage} collapsed={collapsed} />
        <div style={{ flex: 1, padding: 16, color: 'var(--text-2)' }}>当前页:{page}(点标题栏汉堡收缩)</div>
      </div>
    </div>
  );
}

export const shellDocs: DocDef[] = [appshell, titlebar, navview];
