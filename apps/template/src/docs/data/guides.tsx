/* 文档数据:指南 — 快速上手 / 宿主接入 / 主题定制 / 基础设施(不进首页画廊) */
import { InfoBar } from '@fluent-react/ui';
import type { DocDef } from '../types';

const note = (text: string) => (
  <InfoBar level="info" title="说明">{text}</InfoBar>
);

const start: DocDef = {
  key: 'guide-start',
  name: '快速上手',
  cn: '',
  description:
    '从模板起步是最快路径:本仓库的 apps/template 即完整应用骨架(外壳 + 主题 + 宿主桥接 + mock)。也可以把 packages/ 拷进既有 monorepo,按下述步骤接线。技术栈要求:React 19 + Vite + Tailwind CSS v4。',
  importCode: `git clone https://github.com/luoxueyousheng/Fluent.git && cd Fluent && npm install && npm run dev`,
  sections: [
    {
      title: '挂载 Provider 与样式',
      description: 'theme.css 是唯一样式入口(令牌 + 工具类映射 + 组件样式);FluentProvider 提供 Toast / 确认框渲染宿主,useToast / message 等都依赖它;浏览器开发引入 mock 模拟宿主。',
      demo: note('FluentProvider 必须包在应用最外层,否则 useToast 抛错、message/notification 静默告警。'),
      code: `
// main.tsx
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluent-react/ui';
import '@fluent-react/ui/theme.css';
import '@fluent-react/bridge/mock';   // 浏览器开发:模拟宿主;真机自动让位
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
@import '@fluent-react/ui/theme.css';
@source '../node_modules/@fluent-react/ui/src';

/* vite.config.ts */
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()], base: './' });`,
    },
    {
      title: '第一个页面(AppShell)',
      demo: note('mode="multi" 即本文档站形态;单窗口小工具用 mode="single"。'),
      code: `
import { useState } from 'react';
import { AppShell, Button, Icon, useToast, type NavEntry } from '@fluent-react/ui';

const NAV: NavEntry[] = [
  { key: 'home', label: '首页', icon: <Icon name="home" /> },
  { key: 'settings', label: '设置', icon: <Icon name="settings" strokeWidth={1.3} />, bottom: true },
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
    '@fluent-react/bridge 封装 WebView 宿主交互:初始化环境、主题/材质下发、IPC 调用与事件。默认对接 JadeView(window.jade),通道名可配,浏览器自动降级 mock。窗口控制钮与拖动区的多宿主适配见 TitleBar 文档。',
  importCode: `import { init, configure, inv, useJadeEvent } from '@fluent-react/bridge';`,
  sections: [
    {
      title: '初始化与通道配置',
      description: 'IPC 通道名因宿主而异,configure/init 的 channels 覆盖默认值;onError/onLog 统一接管调用失败与日志。',
      demo: note('init 返回 { hasJade, ENV, hasBackdrop }:hasBackdrop=Windows 11 才有 Mica/Acrylic,据此决定是否 applyBackdrop。'),
      code: `
import { init, configure, applyBackdrop } from '@fluent-react/bridge';

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

const r = await init();
if (r.hasBackdrop) await applyBackdrop('mica');   // 'mica' | 'micaAlt' | 'acrylic'(驼峰,与宿主枚举对齐)`,
    },
    {
      title: '调用与事件',
      demo: note('inv 失败不抛错:返回 null 并走 onError——UI 层不必层层 try/catch。'),
      code: `
import { inv, useJadeEvent, useTheme } from '@fluent-react/bridge';

// 调用宿主(任意业务通道)
const result = await inv<{ rows: number }>('export_report', { rows: 200 });

// 订阅宿主事件(组件内)
useJadeEvent<{ task: string; percent: number }>('progress', (p) => setPct(p.percent));

// 主题状态(深浅色 / 材质)
const { dark, mode, backdrop } = useTheme();`,
    },
    {
      title: '独立预览(mock)',
      description: '浏览器里 import mock 即获得模拟宿主:响应 env/主题/材质通道、可模拟事件推送;真机存在 window.jade 时 mock 自动让位。无宿主也不引 mock 时,bridge 置 data-mock 强制纯色底(浏览器没有真实 Mica,透明底会让暗色文字隐形)。',
      demo: note('mock 只在开发入口引一次:import "@fluent-react/bridge/mock"。'),
      code: `
// 仅开发/演示入口引入;生产真机不需要条件判断,mock 检测到宿主会自动让位
import '@fluent-react/bridge/mock';`,
    },
  ],
  props: [],
  extraApis: [
    {
      title: 'bridge API',
      rows: [
        { name: 'init(options?)', type: 'Promise<{ hasJade, ENV, hasBackdrop }>', description: '初始化:拉宿主环境、应用主题、接管失焦降色;options 同 configure。' },
        { name: 'configure({ channels, onError, onLog })', type: 'void', description: '覆盖通道名与全局错误/日志回调。' },
        { name: 'inv(channel, payload?)', type: 'Promise<T | null>', description: '调用宿主;失败返回 null 并走 onError。' },
        { name: 'useJadeEvent(event, cb)', type: 'hook', description: '订阅宿主事件,卸载自动退订。' },
        { name: 'useTheme()', type: '{ dark, mode, backdrop }', description: '主题状态(随切换重渲染)。' },
        { name: 'setThemeMode(mode)', type: "Promise<void>('light'|'dark'|'system')", description: '切换深浅色并下发宿主。' },
        { name: 'applyBackdrop(type)', type: 'Promise<void>', description: "窗口材质:'mica' | 'micaAlt' | 'acrylic'(驼峰)。" },
        { name: 'hasJade / ENV', type: 'boolean / JadeEnv', description: '宿主存在性与环境信息(os / win11 / 版本)。' },
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

const infra: DocDef = {
  key: 'guide-infra',
  name: '基础设施',
  cn: '',
  description:
    '组件之下的公共层:FluentProvider(Toast / 确认框渲染宿主与命令式绑定)、浮层基建(useFlyout / useFixedPlacement / MenuList,自组下拉与菜单)、通用工具(cn / useMergedState)。',
  importCode: `import { FluentProvider, useFlyout, useFixedPlacement, MenuList, cn, useMergedState } from '@fluent-react/ui';`,
  sections: [
    {
      title: 'FluentProvider 与命令式反馈',
      demo: note('Provider 未挂载时:useToast/useConfirm 抛错;message/notification 仅 console.warn、modal.confirm 按取消处理——不会炸树。'),
      code: `
import { FluentProvider, useToast, useConfirm, message, modal } from '@fluent-react/ui';

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
import { useFlyout, useFixedPlacement, MenuList } from '@fluent-react/ui';

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
import { cn, useMergedState } from '@fluent-react/ui';

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

export const guideDocs: DocDef[] = [start, host, theme, infra];
