/* 文档数据:展示 — Card / Expander / SettingsCard / Image / Carousel / Tag / Badge / Avatar / Divider / Empty / Skeleton */
import { useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  BentoGrid, BentoCard,
  Button,
  Calendar,
  Card, CardHeader, CardBody, CardFooter,
  Carousel,
  Divider,
  Dock, DockIcon,
  Empty,
  Expander,
  Image,
  Marquee,
  SettingsCard,
  SettingsExpander,
  Skeleton,
  Splitter,
  Tag,
  Timeline,
  Switch,
  Tree,
} from '@fluent-jade/ui';
import {
  ChatRegular,
  CheckmarkCircleRegular,
  HomeRegular,
  InfoRegular,
  PaintBrushRegular,
  SearchRegular,
  SettingsRegular,
  DocumentRegular,
  AlertRegular,
  ShareRegular,
  CalendarLtrRegular,
  GlobeRegular,
} from '@fluent-jade/icon';
import type { DocDef } from '../types';

/* 演示图:内联 SVG 渐变(无外部资源) */
const pic = (hue: number, label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue} 60% 45%)"/><stop offset="1" stop-color="hsl(${hue + 40} 60% 30%)"/>` +
    `</linearGradient></defs><rect width="400" height="240" fill="url(#g)"/>` +
    `<text x="200" y="128" font-family="Segoe UI" font-size="26" fill="#fff" text-anchor="middle">${label}</text></svg>`,
  )}`;

const card: DocDef = {
  key: 'card',
  name: 'Card',
  cn: '卡片',
	  description:
	    '基础内容容器:WinUI 卡片描边。可选 Reveal 指针跟随光斑(reveal 属性开启)。layer 变体使用层级底色(嵌在卡片或彩色区域内时保持对比)。配套 CardHeader / CardBody / CardFooter 子组件排版。',
	  importCode: `import { Card, CardHeader, CardBody, CardFooter } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div className="flex flex-wrap gap-3">
          <Card className="w-[220px]">
            <b>标准卡片</b>
            <p style={{ color: 'var(--text-2)', marginTop: 6 }}>WinUI 描边卡片,默认无光效。</p>
          </Card>
          <Card layer className="w-[220px]">
            <b>layer 卡片</b>
            <p style={{ color: 'var(--text-2)', marginTop: 6 }}>层级底色变体。</p>
          </Card>
        </div>
      ),
      code: `
import { Card } from '@fluent-jade/ui';

export function CardExample() {
  return (
    <>
      <Card className="w-[220px]">
        <b>标准卡片</b>
        <p className="mt-1.5 text-(--text-2)">WinUI 描边卡片,默认无光效。</p>
      </Card>
      <Card layer className="w-[220px]">
        <b>layer 卡片</b>
        <p className="mt-1.5 text-(--text-2)">层级底色变体。</p>
      </Card>
    </>
  );
}`,
    },
    {
      title: 'Reveal 光效',
      description: '加 reveal 属性开启指针跟随径向光斑(悬停高亮),适合需要视觉焦点的卡片。',
      demo: (
        <Card reveal className="w-[280px]">
          <b>鼠标移上来看看</b>
          <p className="mt-1.5 text-(--text-2) leading-[1.6]">
            指针移到卡片上会跟随出现高光斑点,WinUI 3 风格的 Reveal 效果。
          </p>
        </Card>
      ),
      code: `
import { Card } from '@fluent-jade/ui';

export function CardRevealExample() {
  return (
    <Card reveal className="w-[280px]">
      <b>鼠标移上来看看</b>
      <p className="mt-1.5 text-(--text-2) leading-[1.6]">
        指针移到卡片上会跟随出现高光斑点,WinUI 3 风格的 Reveal 效果。
      </p>
    </Card>
  );
}`,
    },
    {
      title: '圆角',
      description: 'radius 四档:none / sm / md / lg,重映 --r-card。',
      demo: (
        <div className="flex flex-wrap gap-3">
          <Card radius="none" className="p-3 w-[120px]">none</Card>
          <Card radius="sm" className="p-3 w-[120px]">sm</Card>
          <Card radius="md" className="p-3 w-[120px]">md</Card>
          <Card radius="lg" className="p-3 w-[120px]">lg</Card>
        </div>
      ),
      code: `
import { Card } from '@fluent-jade/ui';

export function CardRadiusExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <Card radius="none" className="p-3 w-[120px]">none</Card>
      <Card radius="sm" className="p-3 w-[120px]">sm</Card>
      <Card radius="md" className="p-3 w-[120px]">md</Card>
      <Card radius="lg" className="p-3 w-[120px]">lg</Card>
    </div>
  );
}`,
    },
    {
      title: 'CardHeader / CardBody / CardFooter',
      description: 'Header 顶边全出血(分割线标题行)、Body 自适应撑高、Footer 底部全出血(按钮右对齐)。三个子组件均可选,不传则 Card padding 内直接放内容。',
      demo: (
        <Card className="w-[320px]">
          <CardHeader>卡片标题</CardHeader>
          <CardBody>
            <p className="text-(--text-2) leading-[1.6]">这是 CardBody 区域,内容自动撑高。可用 flex 布局与相邻卡片等高。</p>
          </CardBody>
          <CardFooter>
            <Button size="small" variant="subtle">取消</Button>
            <Button size="small" variant="accent">确定</Button>
          </CardFooter>
        </Card>
      ),
      code: `
import { Card, CardHeader, CardBody, CardFooter } from '@fluent-jade/ui';
import { Button } from '@fluent-jade/ui';

export function CardStructExample() {
  return (
    <Card className="w-[320px]">
      <CardHeader>卡片标题</CardHeader>
      <CardBody>
        <p className="text-(--text-2) leading-[1.6]">
          这是 CardBody 区域,内容自动撑高。
        </p>
      </CardBody>
      <CardFooter>
        <Button size="small" variant="subtle">取消</Button>
        <Button size="small" variant="accent">确定</Button>
      </CardFooter>
    </Card>
  );
}`,
    },
  ],
  props: [
    { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: '圆角档位。' },
    { name: 'layer', type: 'boolean', default: 'false', description: '层级底色变体。' },
    { name: 'reveal', type: 'boolean', default: 'false', description: '指针跟随 Reveal 光效(悬停高亮)。' },
    { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', description: '透传 div 属性。' },
    { name: 'CardHeader', type: 'HTMLAttributes<HTMLDivElement>', description: '标题行:全出血 + 分割线 + 600 字重。' },
    { name: 'CardBody', type: 'HTMLAttributes<HTMLDivElement>', description: '内容区:flex:1 自动撑高。' },
    { name: 'CardFooter', type: 'HTMLAttributes<HTMLDivElement>', description: '操作栏:全出血 + 分割线 + 按钮右对齐。' },
  ],
};

const expander: DocDef = {
  key: 'expander',
  name: 'Expander',
  cn: '展开器',
  description:
    'WinUI Expander:摘要行 + 可折叠内容区,chevron 随开合旋转。基于原生 details/summary,无 JS 状态。',
  importCode: `import { Expander } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div className="w-full max-w-[260px]">
          <Expander summary="什么是 Mica 材质?" defaultOpen>
            <p style={{ color: 'var(--text-2)' }}>Mica 以桌面壁纸为底进行着色,仅作用于窗口背景,性能开销低于 Acrylic。</p>
          </Expander>
        </div>
      ),
      code: `
import { Expander } from '@fluent-jade/ui';

export function ExpanderExample() {
  return (
    <div className="w-[360px]">
      {/* 基于原生 details/summary,defaultOpen 控制初始展开 */}
      <Expander summary="什么是 Mica 材质?" defaultOpen>
        <p className="text-(--text-2)">
          Mica 以桌面壁纸为底进行着色,仅作用于窗口背景,性能开销低于 Acrylic。
        </p>
      </Expander>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'summary', type: 'ReactNode', description: '摘要行内容(必填)。' },
    { name: 'defaultOpen', type: 'boolean', default: 'false', description: '初始展开。' },
    { name: 'children', type: 'ReactNode', description: '折叠区内容。' },
  ],
};

const splitter: DocDef = {
  key: 'splitter',
  name: 'Splitter',
  cn: '分栏',
  description:
    '可拖分栏(工具窗骨架件):两个面板夹一条 6px 拖柄,首面板像素定宽、min/max 钳制;拖柄键盘可达(方向键 ±16px、Home/End 到极值),双击回默认宽。左树右详情、上编辑下日志类界面的骨架。',
  importCode: `import { Splitter } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '左右分栏',
      description: '默认横向:首面板(左)定宽,右侧自适应。拖动中间拖柄调整。',
      demo: (
        <div style={{ width: '100%', height: 220, border: '1px solid var(--card-border)', borderRadius: 8, overflow: 'hidden' }}>
          <Splitter defaultSize={200} min={140} max={360}>
            <div style={{ padding: 10, height: '100%', background: 'var(--layer)' }}>
              <Tree defaultExpandAll treeData={[
                { key: 's', title: 'src', children: [{ key: 'c', title: 'components' }, { key: 'i', title: 'index.ts' }] },
              ]} />
            </div>
            <div style={{ padding: 14, color: 'var(--text-2)' }}>右侧详情区:随窗口伸缩。</div>
          </Splitter>
        </div>
      ),
      code: `
import { Splitter, Tree } from '@fluent-jade/ui';

export function SplitterHorizontalExample() {
  // Splitter 需要一个有确定高度的容器,面板才能撑满
  return (
    <div className="w-full h-[220px] overflow-hidden rounded-lg border border-(--card-border)">
      <Splitter defaultSize={200} min={140} max={360} onResize={(w) => console.log('侧栏宽度', w)}>
        <div className="h-full p-2.5 bg-(--layer)">
          <Tree
            defaultExpandAll
            treeData={[
              { key: 's', title: 'src', children: [{ key: 'c', title: 'components' }, { key: 'i', title: 'index.ts' }] },
            ]}
          />
        </div>
        <div className="p-3.5 text-(--text-2)">右侧详情区:随窗口伸缩。</div>
      </Splitter>
    </div>
  );
}`,
    },
    {
      title: '上下分栏',
      demo: (
        <div style={{ width: '100%', height: 220, border: '1px solid var(--card-border)', borderRadius: 8, overflow: 'hidden' }}>
          <Splitter vertical defaultSize={120} min={64} max={170}>
            <div style={{ padding: 14, color: 'var(--text-2)' }}>编辑区</div>
            <div style={{ padding: 14, background: 'var(--layer)', color: 'var(--text-2)', height: '100%' }}>日志输出区</div>
          </Splitter>
        </div>
      ),
      code: `
import { Splitter } from '@fluent-jade/ui';

export function SplitterVerticalExample() {
  // 同样需要外层容器给出高度,vertical 模式下首面板(上)按 defaultSize 定高
  return (
    <div className="w-full h-[220px] overflow-hidden rounded-lg border border-(--card-border)">
      <Splitter vertical defaultSize={120} min={64} max={170}>
        <div className="p-3.5 text-(--text-2)">编辑区</div>
        <div className="h-full p-3.5 bg-(--layer) text-(--text-2)">日志输出区</div>
      </Splitter>
    </div>
  );
}`,
    },
    {
      title: '受控尺寸',
      description: 'size + onResize 受控:拖动经 onResize 回写状态,外部按钮也可直接设宽。',
      demo: <SplitterControlled />,
      code: `
import { useState } from 'react';
import { Button, Splitter } from '@fluent-jade/ui';

export function SplitterControlledExample() {
  const [size, setSize] = useState(200);
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex items-center gap-2">
        <Button size="small" onClick={() => setSize(160)}>窄</Button>
        <Button size="small" onClick={() => setSize(280)}>宽</Button>
        <span className="text-(--text-2)">当前 {size}px</span>
      </div>
      <div className="w-full h-[180px] overflow-hidden rounded-lg border border-(--card-border)">
        {/* size 受控:拖动经 onResize 回写,状态是唯一数据源 */}
        <Splitter size={size} min={120} max={360} onResize={setSize}>
          <div className="h-full p-3 bg-(--layer) text-(--text-2)">左侧面板</div>
          <div className="p-3 text-(--text-2)">右侧面板</div>
        </Splitter>
      </div>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'children', type: '[ReactNode, ReactNode]', description: '恰好两个面板(必填)。' },
    { name: 'vertical', type: 'boolean', default: 'false', description: '上下分栏。' },
    { name: 'size / defaultSize', type: 'number', default: '— / 240', description: '首面板受控 / 非受控尺寸(px)。' },
    { name: 'min / max', type: 'number', default: '120 / 600', description: '首面板尺寸钳制。' },
  ],
  events: [
    { name: 'onResize', type: '(size: number) => void', description: '拖动 / 键盘调整时连续回调。' },
  ],
};

const settingscard: DocDef = {
  key: 'settingscard',
  name: 'SettingsCard',
  cn: '设置卡片',
  description:
    'Windows 11 设置页行卡:图标 + 标题/描述 + 右侧控件;传 onClick 则整行可点(导航行,自动补 chevron)。SettingsExpander 在头行下挂一组子设置行。',
  importCode: `import { SettingsCard, SettingsExpander } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingsCard icon={<PaintBrushRegular />} title="主题" description="深浅色随宿主切换">
            <Switch defaultChecked aria-label="跟随系统" />
          </SettingsCard>
          <SettingsCard icon={<InfoRegular />} title="关于" description="版本与许可信息"
                        onClick={() => {}} />
        </div>
      ),
      code: `
import { SettingsCard, Switch } from '@fluent-jade/ui';

export function SettingsCardExample() {
  return (
    <div className="flex flex-col w-full gap-2">
      {/* children 作为右侧控件区 */}
      <SettingsCard icon={<PaintBrushRegular />} title="主题" description="深浅色随宿主切换">
        <Switch defaultChecked aria-label="跟随系统" />
      </SettingsCard>
      {/* 传 onClick 即为可点导航行,自动补 chevron */}
      <SettingsCard
        icon={<InfoRegular />}
        title="关于"
        description="版本与许可信息"
        onClick={() => console.log('导航到关于页')}
      />
    </div>
  );
}`,
    },
    {
      title: 'SettingsExpander 设置组',
      demo: (
        <div style={{ width: '100%' }}>
          <SettingsExpander icon={<ChatRegular />} title="通知" description="应用通知总开关与细项"
                            control={<Switch defaultChecked aria-label="通知总开关" />} defaultOpen>
            <SettingsCard title="横幅提醒" description="右下角弹出通知横幅"><Switch defaultChecked aria-label="横幅" /></SettingsCard>
            <SettingsCard title="声音" description="收到通知时播放提示音"><Switch aria-label="声音" /></SettingsCard>
          </SettingsExpander>
        </div>
      ),
      code: `
import { SettingsCard, SettingsExpander, Switch } from '@fluent-jade/ui';

export function SettingsExpanderExample() {
  return (
    <div className="w-full">
      {/* control 为头行右侧常驻控件;children 为折叠的子设置行 */}
      <SettingsExpander
        icon={<ChatRegular />}
        title="通知"
        description="应用通知总开关与细项"
        control={<Switch defaultChecked aria-label="通知总开关" />}
        defaultOpen
      >
        <SettingsCard title="横幅提醒" description="右下角弹出通知横幅">
          <Switch defaultChecked aria-label="横幅" />
        </SettingsCard>
        <SettingsCard title="声音" description="收到通知时播放提示音">
          <Switch aria-label="声音" />
        </SettingsCard>
      </SettingsExpander>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'icon', type: 'ReactNode', description: '前置图标。' },
    { name: 'title', type: 'ReactNode', description: '标题(必填)。' },
    { name: 'description', type: 'ReactNode', description: '副标题描述。' },
    { name: 'children', type: 'ReactNode', description: '右侧操作区(Switch / ComboBox / Button…)。' },
    { name: 'onClick', type: '() => void', description: '传入即为可点导航行,自动补 chevron。' },
  ],
  extraApis: [
    {
      title: 'SettingsExpander Props',
      rows: [
        { name: 'icon / title / description', type: 'ReactNode', description: '头行内容。' },
        { name: 'control', type: 'ReactNode', description: '头行右侧常驻控件。' },
        { name: 'children', type: 'ReactNode', description: '子设置行(SettingsCard)。' },
        { name: 'defaultOpen', type: 'boolean', default: 'false', description: '初始展开。' },
      ],
    },
  ],
};

const image: DocDef = {
  key: 'image',
  name: 'Image',
  cn: '图片',
  description:
    '增强图片:加载骨架 → 淡入;失败换 fallback 或碎图占位;preview 悬停显「预览」,点击进入查看器(滚轮缩放 0.25~4x、旋转、拖拽平移、双击还原、Esc 关闭,遮罩不盖标题栏)。',
  importCode: `import { Image } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <Image src={pic(205, 'Fluent')} alt="示例图" width={200} height={120} rounded />
          <Image src={pic(150, 'Preview')} alt="可预览" width={200} height={120} rounded />
        </>
      ),
      code: `
import { Image } from '@fluent-jade/ui';

const imageUrl = '/demo.png';       // 占位:替换为真实图片地址
const previewUrl = '/preview.png';

export function ImageExample() {
  return (
    <>
      <Image src={imageUrl} alt="示例图" width={200} height={120} rounded />
      {/* preview 默认开启:悬停显「预览」,点击进入查看器 */}
      <Image src={previewUrl} alt="可预览" width={200} height={120} rounded />
    </>
  );
}`,
    },
    {
      title: '加载失败回退',
      description: 'fallback 指定替换图;都失败则渲染内置碎图占位。',
      demo: (
        <>
          <Image src="/not-exist.png" fallback={pic(28, 'fallback')} alt="回退图" width={200} height={120} rounded />
          <Image src="/not-exist.png" alt="碎图占位" width={200} height={120} rounded preview={false} />
        </>
      ),
      code: `
import { Image } from '@fluent-jade/ui';

const fallbackUrl = '/fallback.png'; // 占位:主图失败时的替换图

export function ImageFallbackExample() {
  return (
    <>
      {/* 主图加载失败 → 换用 fallback */}
      <Image src="/not-exist.png" fallback={fallbackUrl} alt="回退图" width={200} height={120} rounded />
      {/* 未提供 fallback(或 fallback 也失败)→ 渲染内置碎图占位 */}
      <Image src="/not-exist.png" alt="碎图占位" width={200} height={120} rounded preview={false} />
    </>
  );
}`,
    },
    {
      title: '填充模式与自定义占位',
      description: 'fit 控制 object-fit(默认 cover 铺满裁切,contain 完整显示);placeholder 替换加载中的默认骨架微光。',
      demo: (
        <>
          <Image src={pic(268, 'contain')} alt="contain" width={200} height={120} fit="contain" rounded preview={false}
                 placeholder={<span style={{ fontSize: 12, color: 'var(--text-2)' }}>载入中…</span>} />
          <Image src={pic(320, 'cover')} alt="cover" width={200} height={120} fit="cover" rounded preview={false} />
        </>
      ),
      code: `
import { Image } from '@fluent-jade/ui';

const tallUrl = '/tall.png'; // 占位:替换为真实图片地址
const wideUrl = '/wide.png';

export function ImageFitExample() {
  return (
    <>
      {/* fit="contain" 完整显示不裁切;placeholder 自定义加载占位节点 */}
      <Image
        src={tallUrl}
        alt="contain"
        width={200}
        height={120}
        fit="contain"
        rounded
        preview={false}
        placeholder={<span className="text-xs text-(--text-2)">载入中…</span>}
      />
      {/* 默认 fit="cover":铺满并裁切 */}
      <Image src={wideUrl} alt="cover" width={200} height={120} fit="cover" rounded preview={false} />
    </>
  );
}`,
    },
  ],
  props: [
    { name: 'src', type: 'string', description: '图片地址(必填)。' },
    { name: 'fit', type: 'CSSProperties["objectFit"]', default: "'cover'", description: 'object-fit。' },
    { name: 'rounded', type: 'boolean', default: 'false', description: '圆角。' },
    { name: 'preview', type: 'boolean', default: 'true', description: '点击打开查看器。' },
    { name: 'fallback', type: 'string', description: '加载失败的替换图。' },
    { name: 'placeholder', type: 'ReactNode', default: '骨架微光', description: '加载中的占位。' },
    { name: '...rest', type: 'ImgHTMLAttributes', description: '透传原生 img 属性(width / height / alt…)。' },
  ],
};

const carousel: DocDef = {
  key: 'carousel',
  name: 'Carousel',
  cn: '轮播',
  description:
    '轨道平移轮播:WinUI PipsPager 圆点(活动点拉长为 accent 药丸)、悬停浮现 Acrylic 箭头;autoplay 在悬停、页面隐藏或滚出视口时自动暂停(IntersectionObserver)。',
  importCode: `import { Carousel } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div style={{ width: 400 }}>
          <Carousel autoplay arrows>
            {[pic(205, '第 1 张'), pic(150, '第 2 张'), pic(28, '第 3 张')].map((s, i) => (
              <img key={i} src={s} alt={`第 ${i + 1} 张`} style={{ width: '100%', display: 'block' }} />
            ))}
          </Carousel>
        </div>
      ),
      code: `
import { Carousel } from '@fluent-jade/ui';

const slides = ['/slide-1.png', '/slide-2.png', '/slide-3.png']; // 占位:幻灯片图地址

export function CarouselExample() {
  return (
    <div className="w-[400px]">
      {/* autoplay 在悬停、页面隐藏或滚出视口时自动暂停 */}
      <Carousel autoplay arrows afterChange={(i) => console.log('当前页', i)}>
        {slides.map((s, i) => (
          <img key={i} src={s} alt={\`第 \${i + 1} 张\`} className="block w-full" />
        ))}
      </Carousel>
    </div>
  );
}`,
    },
    {
      title: '间隔、圆点与初始页',
      description: 'autoplaySpeed 控制轮播间隔;dots={false} 隐藏圆点分页(配 arrows 保留导航);initialSlide 指定初始页。',
      demo: (
        <div style={{ width: 400 }}>
          <Carousel autoplay autoplaySpeed={1500} dots={false} arrows initialSlide={1}>
            {[pic(268, '第 1 张'), pic(320, '第 2 张'), pic(0, '第 3 张')].map((s, i) => (
              <img key={i} src={s} alt={`第 ${i + 1} 张`} style={{ width: '100%', display: 'block' }} />
            ))}
          </Carousel>
        </div>
      ),
      code: `
import { Carousel } from '@fluent-jade/ui';

const slides = ['/slide-1.png', '/slide-2.png', '/slide-3.png']; // 占位:幻灯片图地址

export function CarouselOptionsExample() {
  return (
    <div className="w-[400px]">
      {/* autoplaySpeed 加快到 1.5s;dots={false} 隐藏圆点;initialSlide 从第 2 张开始 */}
      <Carousel autoplay autoplaySpeed={1500} dots={false} arrows initialSlide={1}>
        {slides.map((s, i) => (
          <img key={i} src={s} alt={\`第 \${i + 1} 张\`} className="block w-full" />
        ))}
      </Carousel>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'autoplay', type: 'boolean', default: 'false', description: '自动轮播(悬停 / 不可见时暂停)。' },
    { name: 'autoplaySpeed', type: 'number', default: '3000', description: '轮播间隔毫秒。' },
    { name: 'dots', type: 'boolean', default: 'true', description: '显示圆点分页。' },
    { name: 'arrows', type: 'boolean', default: 'false', description: '悬停浮现左右箭头。' },
    { name: 'initialSlide', type: 'number', default: '0', description: '初始页。' },
    { name: 'children', type: 'ReactNode', description: '幻灯片(每个子元素一张)。' },
  ],
  events: [
    { name: 'afterChange', type: '(current: number) => void', description: '切换完成回调。' },
  ],
};

const tag: DocDef = {
  key: 'tag',
  name: 'Tag',
  cn: '标签',
  description: '轻量语义标记:五档语义色;closable 附关闭键,常用于筛选条件、条目属性。',
  importCode: `import { Tag } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div className="flex flex-wrap gap-3 items-center">
          <Tag>默认</Tag>
          <Tag color="accent">主题</Tag>
          <Tag color="success">成功</Tag>
          <Tag color="caution">警示</Tag>
          <Tag color="critical">危险</Tag>
        </div>
      ),
      code: `
import { Tag } from '@fluent-jade/ui';

export function TagExample() {
  return (
    <>
      <Tag>默认</Tag>
      <Tag color="accent">主题</Tag>
      <Tag color="success">成功</Tag>
      <Tag color="caution">警示</Tag>
      <Tag color="critical">危险</Tag>
    </>
  );
}`,
    },
    {
      title: '可关闭',
      demo: <TagClosable />,
      code: `
import { useState } from 'react';
import { Button, Tag } from '@fluent-jade/ui';

const initialTags = ['React 19', 'Tailwind v4', 'WinUI 3'];

export function TagClosableExample() {
  const [tags, setTags] = useState(initialTags);
  return (
    <>
      {/* onClose 只负责通知,移除由外部状态完成 */}
      {tags.map((t) => (
        <Tag key={t} closable onClose={() => setTags(tags.filter((x) => x !== t))}>{t}</Tag>
      ))}
      {/* 全部关闭后提供重置入口 */}
      {!tags.length && <Button size="small" onClick={() => setTags(initialTags)}>重置</Button>}
    </>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'accent' | 'success' | 'caution' | 'critical'", default: "'default'", description: '语义色。' },
    { name: 'closable', type: 'boolean', default: 'false', description: '显示关闭键。' },
  ],
  events: [
    { name: 'onClose', type: '() => void', description: '点击关闭键(移除由外部状态完成)。' },
  ],
};

function SplitterControlled() {
  const [size, setSize] = useState(200);
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button size="small" onClick={() => setSize(160)}>窄</Button>
        <Button size="small" onClick={() => setSize(280)}>宽</Button>
        <span style={{ color: 'var(--text-2)' }}>当前 {size}px</span>
      </div>
      <div style={{ width: '100%', height: 180, border: '1px solid var(--card-border)', borderRadius: 8, overflow: 'hidden' }}>
        <Splitter size={size} min={120} max={360} onResize={setSize}>
          <div style={{ padding: 12, height: '100%', background: 'var(--layer)', color: 'var(--text-2)' }}>左侧面板</div>
          <div style={{ padding: 12, color: 'var(--text-2)' }}>右侧面板</div>
        </Splitter>
      </div>
    </div>
  );
}

function TagClosable() {
  const [tags, setTags] = useState(['React 19', 'Tailwind v4', 'WinUI 3']);
  return (
    <>
      {tags.map((t) => (
        <Tag key={t} closable onClose={() => setTags(tags.filter((x) => x !== t))}>{t}</Tag>
      ))}
      {!tags.length && <Button size="small" onClick={() => setTags(['React 19', 'Tailwind v4', 'WinUI 3'])}>重置</Button>}
    </>
  );
}

const badge: DocDef = {
  key: 'badge',
  name: 'Badge',
  cn: '徽标',
  description: '计数 / 状态圆徽:默认红底数字,dot 缩为纯圆点。常挂在图标或按钮角上。',
  importCode: `import { Badge } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div className="flex items-center gap-3">
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <ChatRegular size={22} />
            <Badge style={{ position: 'absolute', top: -6, right: -10 }}>8</Badge>
          </span>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <SettingsRegular size={22} />
            <Badge dot style={{ position: 'absolute', top: -2, right: -2 }} />
          </span>
          <Badge>99+</Badge>
        </div>
      ),
      code: `
import { Badge } from '@fluent-jade/ui';

export function BadgeExample() {
  return (
    <>
      {/* 挂在宿主角上:宿主 relative,徽标绝对定位 */}
      <span className="relative inline-flex">
        <ChatRegular size={22} />
        <Badge className="absolute -top-1.5 -right-2.5">8</Badge>
      </span>
      {/* dot 缩为纯圆点(忽略 children) */}
      <span className="relative inline-flex">
        <SettingsRegular size={22} />
        <Badge dot className="absolute -top-0.5 -right-0.5" />
      </span>
      <Badge>99+</Badge>
    </>
  );
}`,
    },
    {
      title: '着色',
      description: '缺省为 critical 红;传 color 后以对应语义色为底。',
      demo: (
        <div className="flex flex-wrap gap-3 items-center">
          <Badge>9</Badge>
          <Badge color="primary">1</Badge>
          <Badge color="success">2</Badge>
          <Badge color="warning">3</Badge>
          <Badge color="danger">4</Badge>
          <Badge color="secondary" dot />
        </div>
      ),
      code: `
import { Badge } from '@fluent-jade/ui';

export function BadgeColorExample() {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge>9</Badge>
      <Badge color="primary">1</Badge>
      <Badge color="success">2</Badge>
      <Badge color="warning">3</Badge>
      <Badge color="danger">4</Badge>
      <Badge color="secondary" dot />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色(缺省 critical 红)。' },
    { name: 'dot', type: 'boolean', default: 'false', description: '纯圆点(忽略 children)。' },
    { name: 'children', type: 'ReactNode', description: '数字 / 文本。' },
    { name: 'style / className', type: '—', description: '定位到宿主角上时配 position。' },
  ],
};

const avatar: DocDef = {
  key: 'avatar',
  name: 'Avatar',
  cn: '头像',
  description: '头像:有图显图;无图取 name 首字(中文)或首字母(英文)生成占位,底色由 name 哈希取色保持稳定。',
  importCode: `import { Avatar, AvatarGroup } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <Avatar name="张伟" />
          <Avatar name="Fluent React" />
          <Avatar name="李雷" size="large" />
          <Avatar name="Han" size={48} />
          <Avatar src={pic(205, '')} name="图像" />
        </>
      ),
      code: `
import { Avatar } from '@fluent-jade/ui';

const avatarUrl = '/avatar.png'; // 占位:头像图地址

export function AvatarExample() {
  return (
    <>
      {/* 无图:取 name 首字(中文)或首字母(英文),底色由 name 哈希取色 */}
      <Avatar name="张伟" />
      <Avatar name="Fluent React" />
      <Avatar name="李雷" size="large" />
      <Avatar name="Han" size={48} />
      {/* 有图显图,name 仍作为加载失败兜底 */}
      <Avatar src={avatarUrl} name="图像" />
    </>
  );
}`,
    },
    {
      title: '圆角',
      description: 'radius 控制圆角:缺省为圆形(50%);传 none / sm / md / lg 变为方形圆角。',
      demo: (
        <>
          <Avatar name="张伟" />
          <Avatar name="张伟" radius="lg" />
          <Avatar name="张伟" radius="md" />
          <Avatar name="张伟" radius="sm" />
          <Avatar name="张伟" radius="none" />
        </>
      ),
      code: `
import { Avatar } from '@fluent-jade/ui';

export function AvatarRadiusExample() {
  return (
    <>
      <Avatar name="张伟" />          {/* 缺省:圆形 */}
      <Avatar name="张伟" radius="lg" />
      <Avatar name="张伟" radius="md" />
      <Avatar name="张伟" radius="sm" />
      <Avatar name="张伟" radius="none" />
    </>
  );
}`,
    },
    {
      title: '重叠组(AvatarGroup)',
      description: '重叠排列的头像组,超出时显示 +N 溢出计数。源自 MagicUI。',
      demo: (
        <div className="flex flex-col items-start gap-3">
          <AvatarGroup avatarUrls={[
            { name: '林婉清', profileUrl: '#' },
            { name: '赵子龙', profileUrl: '#' },
            { name: '周文轩', profileUrl: '#' },
          ]} />
          <AvatarGroup avatarUrls={[
            { name: '林婉清' }, { name: '赵子龙' }, { name: '周文轩' },
          ]} numPeople={99} />
        </div>
      ),
      code: `
import { AvatarGroup } from '@fluent-jade/ui';

export function AvatarGroupExample() {
  return (
    <>
      {/* 基础重叠 */}
      <AvatarGroup avatarUrls={[
        { name: '林婉清', profileUrl: '#' },
        { name: '赵子龙', profileUrl: '#' },
        { name: '周文轩', profileUrl: '#' },
      ]} />
      {/* 溢出计数 */}
      <AvatarGroup avatarUrls={[
        { name: '林婉清' }, { name: '赵子龙' }, { name: '周文轩' },
      ]} numPeople={99} />
    </>
  );
}`,
    },
    {
      title: '自动折叠',
      description: 'maxLen 限制可见数量,超出自动显示 +N 溢出计数。',
      demo: (
        <AvatarGroup avatarUrls={[
          { name: '林婉清' }, { name: '赵子龙' }, { name: '周文轩' },
          { name: '孙小美' }, { name: '李思远' },
        ]} maxLen={3} />
      ),
      code: `
import { AvatarGroup } from '@fluent-jade/ui';

export function AvatarGroupAutoFoldExample() {
  return (
    <AvatarGroup
      avatarUrls={[
        { name: '林婉清' }, { name: '赵子龙' }, { name: '周文轩' },
        { name: '孙小美' }, { name: '李思远' },
      ]}
      maxLen={3}
    />
  );
}`,
    },
    {
      title: '重叠组带头像图片',
      demo: (
        <AvatarGroup avatarUrls={[
          { imageUrl: 'https://avatar.vercel.sh/wanqing', name: '林婉清' },
          { imageUrl: 'https://avatar.vercel.sh/zilong', name: '赵子龙' },
          { imageUrl: 'https://avatar.vercel.sh/wenxuan', name: '周文轩' },
        ]} />
      ),
      code: `
import { AvatarGroup } from '@fluent-jade/ui';

export function AvatarGroupImageExample() {
  return (
    <AvatarGroup avatarUrls={[
      { imageUrl: 'https://avatar.vercel.sh/wanqing', name: '林婉清' },
      { imageUrl: 'https://avatar.vercel.sh/zilong', name: '赵子龙' },
      { imageUrl: 'https://avatar.vercel.sh/wenxuan', name: '周文轩' },
    ]} />
  );
}`,
    },
  ],
  props: [
    { name: 'src', type: 'string', description: '头像图地址。' },
    { name: 'name', type: 'string', description: '无图时生成首字占位于稳定底色。' },
    { name: 'size', type: "'small' | 'middle' | 'large' | number", default: "'middle'", description: '三档或自定义像素。' },
    { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", description: '圆角:缺省圆形;传此值变为方形圆角。' },
  ],
  extraApis: [
    {
      title: 'AvatarGroup',
      rows: [
        { name: 'avatarUrls', type: 'AvatarGroupItem[]', description: '头像数据:{ imageUrl?, name, profileUrl? }。' },
        { name: 'numPeople', type: 'number', description: '手动指定 +N 溢出数(优先级高于 maxLen)。' },
        { name: 'maxLen', type: 'number', description: '最多显示 N 个头像,超出自动折叠为 +N。' },
        { name: 'size', type: "'small' | 'middle' | 'large' | number", default: "'middle'", description: '头像尺寸。' },
        { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", description: '圆角:缺省圆形;传此值变为方形圆角。' },
        { name: 'gap', type: 'number | string', default: "'-16px'", description: '项间距(正数分开,负数重叠)。' },
      ],
    },
    {
      title: 'AvatarGroupItem',
      rows: [
        { name: 'imageUrl', type: 'string', description: '头像图片地址。' },
        { name: 'name', type: 'string', description: '无图时显示首字占位。' },
        { name: 'profileUrl', type: 'string', description: '点击跳转链接。' },
      ],
    },
  ],
};

const divider: DocDef = {
  key: 'divider',
  name: 'Divider',
  cn: '分割线',
  description: '内容分区横线;children 作为线中文本。',
  importCode: `import { Divider } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div style={{ width: 320 }}>
          <p style={{ color: 'var(--text-2)' }}>第一段内容</p>
          <Divider />
          <p style={{ color: 'var(--text-2)' }}>第二段内容</p>
          <Divider>或者</Divider>
          <p style={{ color: 'var(--text-2)' }}>第三段内容</p>
        </div>
      ),
      code: `
import { Divider } from '@fluent-jade/ui';

export function DividerExample() {
  return (
    <div className="w-[320px]">
      <p className="text-(--text-2)">第一段内容</p>
      <Divider />
      <p className="text-(--text-2)">第二段内容</p>
      {/* children 作为线中文本 */}
      <Divider>或者</Divider>
      <p className="text-(--text-2)">第三段内容</p>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'children', type: 'ReactNode', description: '线中文本(可选)。' },
  ],
};

const empty: DocDef = {
  key: 'empty',
  name: 'Empty',
  cn: '空状态',
  description:
    '无数据占位:Fluent 线稿插画 + 描述 + 可选操作区;image="simple" 为紧凑变体(列表 / 表格内嵌),也可传自定义插画节点。',
  importCode: `import { Empty } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <Empty description="暂无项目">
            <Button variant="accent" size="small">新建项目</Button>
          </Empty>
          <Empty image="simple" description="没有匹配结果" />
        </>
      ),
      code: `
import { Button, Empty } from '@fluent-jade/ui';

export function EmptyExample() {
  return (
    <>
      {/* children 作为操作区 */}
      <Empty description="暂无项目">
        <Button variant="accent" size="small">新建项目</Button>
      </Empty>
      {/* simple 紧凑变体:适合列表 / 表格内嵌 */}
      <Empty image="simple" description="没有匹配结果" />
    </>
  );
}`,
    },
    {
      title: '自定义插画',
      description: 'image 传任意节点替换内置线稿插画(品牌插画、Fluent 图标组件等)。',
      demo: (
        <Empty
          image={<img src={pic(268, '插画')} alt="" width={140} style={{ borderRadius: 8 }} />}
          description="自定义插画节点"
        >
          <Button size="small">刷新</Button>
        </Empty>
      ),
      code: `
import { Button, Empty } from '@fluent-jade/ui';

const illustrationUrl = '/empty-illustration.png'; // 占位:自定义插画地址

export function EmptyCustomImageExample() {
  // image 传任意节点替换内置插画
  return (
    <Empty
      image={<img src={illustrationUrl} alt="" width={140} className="rounded-lg" />}
      description="自定义插画节点"
    >
      <Button size="small">刷新</Button>
    </Empty>
  );
}`,
    },
  ],
  props: [
    { name: 'image', type: "ReactNode | 'simple'", default: '内置插画', description: 'simple 紧凑变体或自定义插画。' },
    { name: 'description', type: 'ReactNode', default: "'暂无数据'", description: '描述文案。' },
    { name: 'children', type: 'ReactNode', description: '操作区(如「新建」按钮)。' },
  ],
};

const skeleton: DocDef = {
  key: 'skeleton',
  name: 'Skeleton',
  cn: '骨架屏',
  description: '加载占位微光块:用 style/className 摆出目标内容的轮廓,数据就绪后整体替换。',
  importCode: `import { Skeleton } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: 320 }}>
          <Skeleton style={{ width: 40, height: 40, borderRadius: '50%' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton style={{ height: 14, width: '60%' }} />
            <Skeleton style={{ height: 12, width: '90%' }} />
          </div>
        </div>
      ),
      code: `
import { Skeleton } from '@fluent-jade/ui';

export function SkeletonExample() {
  // 用 className 摆出目标内容的轮廓:圆形头像 + 两行文本
  return (
    <div className="flex items-center w-[320px] gap-3">
      <Skeleton className="w-[40px] h-[40px] rounded-full" />
      <div className="flex flex-col flex-1 gap-2">
        <Skeleton className="h-[14px] w-[60%]" />
        <Skeleton className="h-[12px] w-[90%]" />
      </div>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'style / className', type: '—', description: '控制块的尺寸与圆角。' },
  ],
};

const timeline: DocDef = {
  key: 'timeline',
  name: 'Timeline',
  cn: '时间轴',
  description:
    '纵向事件流(antd items API):节点圆点 + 连线,label 放时间戳、color 语义色圆点、dot 自定义节点;pending 在尾部挂「进行中」项(旋转圆环)。适合操作历史、部署记录、日志流展示。',
  importCode: `import { Timeline } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: 'label 时间戳弱化显示;color 标注事件语义(成功 / 警示 / 失败)。',
      demo: (
        <div style={{ width: 360 }}>
          <Timeline items={[
            { label: '10:02', content: '构建开始', color: 'accent' },
            { label: '10:04', content: '单元测试通过(214 项)', color: 'success' },
            { label: '10:05', content: '产物体积超出预算 3%', color: 'caution' },
            { label: '10:06', content: '部署到预发环境失败:磁盘配额不足', color: 'critical' },
          ]} />
        </div>
      ),
      code: `
import { Timeline } from '@fluent-jade/ui';

export function TimelineBasicExample() {
  return (
    <Timeline
      items={[
        { label: '10:02', content: '构建开始', color: 'accent' },
        { label: '10:04', content: '单元测试通过(214 项)', color: 'success' },
        { label: '10:05', content: '产物体积超出预算 3%', color: 'caution' },
        { label: '10:06', content: '部署到预发环境失败:磁盘配额不足', color: 'critical' },
      ]}
    />
  );
}`,
    },
    {
      title: '自定义节点与进行中',
      description: 'dot 传任意节点(如 <HomeRegular />)替换默认圆点;pending 在尾部追加进行中项,传 true 则不带文案、仅显示旋转点。',
      demo: (
        <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Timeline pending="正在重新部署…"
            items={[
              { label: '昨天 18:30', content: '版本 2.3.0 发布', dot: <CheckmarkCircleRegular size={14} style={{ color: '#0F7B0F' }} /> },
              { label: '今天 09:12', content: '收到 3 份崩溃报告' },
            ]} />
          <Timeline pending={true}
            items={[
              { label: '10:20', content: '触发增量构建' },
            ]} />
        </div>
      ),
      code: `
import { Timeline } from '@fluent-jade/ui';

export function TimelinePendingExample() {
  return (
    <div className="flex flex-col gap-4">
      <Timeline
        pending="正在重新部署…"   // 尾部进行中项:旋转圆环节点 + 文案
        items={[
          {
            label: '昨天 18:30',
            content: '版本 2.3.0 发布',
            // dot:自定义节点替换默认圆点
            dot: <CheckmarkCircleRegular size={14} className="text-[#0F7B0F]" />,
          },
          { label: '今天 09:12', content: '收到 3 份崩溃报告' },
        ]}
      />
      {/* pending={true}:不带文案,仅显示旋转点 */}
      <Timeline pending={true} items={[{ label: '10:20', content: '触发增量构建' }]} />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: 'TimelineItemDef[]', description: '事件数组(必填):{ key?, label?, content, color?, dot? }。' },
    { name: 'pending', type: 'ReactNode | boolean', description: '尾部「进行中」项:传文案节点;true 仅显示旋转点。' },
  ],
  extraApis: [
    {
      title: 'TimelineItemDef',
      rows: [
        { name: 'label', type: 'ReactNode', description: '时间戳 / 小标签(内容上方,弱化字色)。' },
        { name: 'content', type: 'ReactNode', description: '事件内容(必填)。' },
        { name: 'color', type: "'default' | 'accent' | 'success' | 'caution' | 'critical'", default: "'accent'", description: '圆点语义色。' },
        { name: 'dot', type: 'ReactNode', description: '自定义圆点节点。' },
      ],
    },
  ],
};

const marquee: DocDef = {
  key: 'marquee',
  name: 'Marquee',
  cn: '走马灯',
  description:
    '无限滚动无缝轮播,纯 CSS 动画零 JS 运行时。支持水平/垂直、反向、悬停暂停、自定义时长与间距。源自 MagicUI,适配 Fluent 风格。',
  importCode: `import { Marquee, Card, Avatar } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: '纯 CSS 动画,零 JS 运行时。默认水平滚动,pauseOnHover 悬停暂停,duration 控制速度。',
      demo: (
        <div className="w-full flex items-center justify-center">
          <Marquee pauseOnHover duration={20} className="w-full max-w-[320px]">
            {['React 19', 'Tailwind v4', 'TypeScript', 'WinUI 3', 'Fluent', 'JadeView'].map((t) => (
              <span key={t}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                           bg-(--fill-subtle) text-[13px] whitespace-nowrap border border-(--stroke)">
                {t}
              </span>
            ))}
          </Marquee>
        </div>
      ),
      code: `
import { Marquee } from '@fluent-jade/ui';

const items = ['React 19', 'Tailwind v4', 'TypeScript', 'WinUI 3', 'Fluent', 'JadeView'];

export function MarqueeExample() {
  return (
    <Marquee pauseOnHover duration={20}>
      {items.map((t) => (
        <span key={t}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                     bg-(--fill-subtle) text-[13px] whitespace-nowrap
                     border border-(--stroke)">
          {t}
        </span>
      ))}
    </Marquee>
  );
}`,
    },
    {
      title: '评价卡片(水平)',
      description: '两行水平滚动,方向相反。每张卡片包含头像、名称、身份和评论文本。左右渐变遮罩淡出。',
      demo: (() => {
        const reviews = [
          { name: '林婉清', handle: '@wanqing', body: '设计风格很正,组件质量出乎意料地好。' },
          { name: '赵子龙', handle: '@zilong', body: '接入非常顺畅,几乎没有学习成本。' },
          { name: '周文轩', handle: '@wenxuan', body: 'Fluent 风格统一,团队反馈很好。' },
          { name: '孙小美', handle: '@xiaomei', body: '开箱即用,文档写得很清楚。' },
          { name: '李思远', handle: '@siyuan', body: '品质很高,细节做得很到位。' },
          { name: '王若溪', handle: '@ruoxi', body: '第一次用就被惊艳到了。' },
        ];
        const mid = Math.floor(reviews.length / 2);
        const firstRow = reviews.slice(0, mid);
        const secondRow = reviews.slice(mid);
        const ReviewCard = ({ name, handle, body }: typeof reviews[0]) => (
          <Card className="h-full w-64 cursor-pointer hover:bg-(--fill-subtle)">
            <div className="flex items-center gap-2">
              <Avatar name={name} size={32} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-(--text-3)">{handle}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-(--text-2)">{body}</p>
          </Card>
        );
        return (
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <Marquee pauseOnHover duration={20}>
              {firstRow.map((r) => <ReviewCard key={r.handle} {...r} />)}
            </Marquee>
            <Marquee reverse pauseOnHover duration={20}>
              {secondRow.map((r) => <ReviewCard key={r.handle} {...r} />)}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-(--card)" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-(--card)" />
          </div>
        );
      })(),
      code: `
import { Marquee, Card, Avatar } from '@fluent-jade/ui';

const reviews = [
  { name: '林婉清', handle: '@wanqing', body: '设计风格很正,组件质量出乎意料地好。' },
  { name: '赵子龙', handle: '@zilong', body: '接入非常顺畅,几乎没有学习成本。' },
  { name: '周文轩', handle: '@wenxuan', body: 'Fluent 风格统一,团队反馈很好。' },
  { name: '孙小美', handle: '@xiaomei', body: '开箱即用,文档写得很清楚。' },
  { name: '李思远', handle: '@siyuan', body: '品质很高,细节做得很到位。' },
  { name: '王若溪', handle: '@ruoxi', body: '第一次用就被惊艳到了。' },
];

function ReviewCard({ name, handle, body }: typeof reviews[0]) {
  return (
    <Card className="h-full w-64 cursor-pointer hover:bg-(--fill-subtle)">
      <div className="flex items-center gap-2">
        <Avatar name={name} size={32} />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-(--text-3)">{handle}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-(--text-2)">{body}</p>
    </Card>
  );
}

export function MarqueeDemo() {
  const mid = Math.floor(reviews.length / 2);
  const firstRow = reviews.slice(0, mid);
  const secondRow = reviews.slice(mid);
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover duration={20}>
        {firstRow.map((r) => <ReviewCard key={r.handle} {...r} />)}
      </Marquee>
      <Marquee reverse pauseOnHover duration={20}>
        {secondRow.map((r) => <ReviewCard key={r.handle} {...r} />)}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-(--card)" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-(--card)" />
    </div>
  );
}`,
    },
    {
      title: '垂直滚动',
      description: '两列垂直滚动,方向相反。卡片宽度更窄,上下渐变遮罩淡出。',
      demo: (() => {
        const reviews = [
          { name: '林婉清', handle: '@wanqing', body: '设计风格很正,组件质量出乎意料地好。' },
          { name: '赵子龙', handle: '@zilong', body: '接入非常顺畅,几乎没有学习成本。' },
          { name: '周文轩', handle: '@wenxuan', body: 'Fluent 风格统一,团队反馈很好。' },
        ];
        const mid = Math.floor(reviews.length / 2);
        const firstRow = reviews.slice(0, mid);
        const secondRow = reviews.slice(mid);
        const ReviewCard = ({ name, handle, body }: typeof reviews[0]) => (
          <Card className="h-full w-fit cursor-pointer hover:bg-(--fill-subtle) sm:w-36">
            <div className="flex items-center gap-2">
              <Avatar name={name} size={32} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-(--text-3)">{handle}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-(--text-2)">{body}</p>
          </Card>
        );
        return (
          <div className="relative flex h-[500px] w-full flex-row items-center justify-center overflow-hidden">
            <Marquee pauseOnHover vertical duration={20}>
              {firstRow.map((r) => <ReviewCard key={r.handle} {...r} />)}
            </Marquee>
            <Marquee reverse pauseOnHover vertical duration={20}>
              {secondRow.map((r) => <ReviewCard key={r.handle} {...r} />)}
            </Marquee>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-(--card)" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-(--card)" />
          </div>
        );
      })(),
      code: `
import { Marquee, Card, Avatar } from '@fluent-jade/ui';

const reviews = [
  { name: '林婉清', handle: '@wanqing', body: '设计风格很正,组件质量出乎意料地好。' },
  { name: '赵子龙', handle: '@zilong', body: '接入非常顺畅,几乎没有学习成本。' },
  { name: '周文轩', handle: '@wenxuan', body: 'Fluent 风格统一,团队反馈很好。' },
];

function ReviewCard({ name, handle, body }: typeof reviews[0]) {
  return (
    <Card className="h-full w-fit cursor-pointer hover:bg-(--fill-subtle) sm:w-36">
      <div className="flex items-center gap-2">
        <Avatar name={name} size={32} />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-(--text-3)">{handle}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-(--text-2)">{body}</p>
    </Card>
  );
}

export function MarqueeVerticalDemo() {
  const mid = Math.floor(reviews.length / 2);
  const firstRow = reviews.slice(0, mid);
  const secondRow = reviews.slice(mid);
  return (
    <div className="relative flex h-[500px] w-full flex-row items-center justify-center overflow-hidden">
      <Marquee pauseOnHover vertical duration={20}>
        {firstRow.map((r) => <ReviewCard key={r.handle} {...r} />)}
      </Marquee>
      <Marquee reverse pauseOnHover vertical duration={20}>
        {secondRow.map((r) => <ReviewCard key={r.handle} {...r} />)}
      </Marquee>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-(--card)" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-(--card)" />
    </div>
  );
}`,
    },
    {
      title: '3D 卡片墙',
      description: '四列垂直 Marquee 配合 CSS perspective + 3D transform 形成景深效果,适合品牌展示或评价墙。源自 MagicUI 设计。',
      demo: (() => {
        const reviews = [
          { name: '林婉清', handle: '@wanqing', body: '设计风格很正,组件质量出乎意料地好。' },
          { name: '赵子龙', handle: '@zilong', body: '接入非常顺畅,几乎没有学习成本。' },
          { name: '周文轩', handle: '@wenxuan', body: 'Fluent 风格统一,团队反馈很好。' },
        ];
        const mid = Math.floor(reviews.length / 2);
        const rows = [reviews.slice(0, mid), reviews.slice(mid), reviews.slice(0, mid), reviews.slice(mid)];
        const ReviewCard = ({ name, handle, body }: typeof reviews[0]) => (
          <Card className="h-full w-fit cursor-pointer hover:bg-(--fill-subtle) sm:w-36">
            <div className="flex items-center gap-2">
              <Avatar name={name} size={32} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-(--text-3)">{handle}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-(--text-2)">{body}</p>
          </Card>
        );
        return (
          <div className="relative flex h-96 w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px] bg-(--card)">
            <div className="flex flex-row items-center gap-4"
                 style={{ transform: 'translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)' }}>
              {rows.map((row, ri) => (
                <Marquee key={ri} vertical pauseOnHover
                         reverse={ri % 2 === 1}
                         duration={20}>
                  {row.map((r) => <ReviewCard key={r.handle} {...r} />)}
                </Marquee>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-(--card)" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-(--card)" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-(--card)" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-(--card)" />
          </div>
        );
      })(),
      code: `
import { Marquee, Card, Avatar } from '@fluent-jade/ui';

const reviews = [
  { name: '林婉清', handle: '@wanqing', body: '设计风格很正,组件质量出乎意料地好。' },
  { name: '赵子龙', handle: '@zilong', body: '接入非常顺畅,几乎没有学习成本。' },
  { name: '周文轩', handle: '@wenxuan', body: 'Fluent 风格统一,团队反馈很好。' },
];

function ReviewCard({ name, handle, body }: typeof reviews[0]) {
  return (
    <Card className="h-full w-fit cursor-pointer hover:bg-(--fill-subtle) sm:w-36">
      <div className="flex items-center gap-2">
        <Avatar name={name} size={32} />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-(--text-3)">{handle}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-(--text-2)">{body}</p>
    </Card>
  );
}

export function Marquee3DDemo() {
  const mid = Math.floor(reviews.length / 2);
  const rows = [reviews.slice(0, mid), reviews.slice(mid), reviews.slice(0, mid), reviews.slice(mid)];
  return (
    <div className="relative flex h-96 w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px] bg-(--card)">
      <div className="flex flex-row items-center gap-4"
           style={{ transform: 'translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)' }}>
        {rows.map((row, i) => (
          <Marquee key={i} vertical pauseOnHover
                   reverse={i % 2 === 1}
                   duration={20}>
            {row.map((r) => <ReviewCard key={r.handle} {...r} />)}
          </Marquee>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-(--card)" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-(--card)" />
      <div className="pointer-events-none absolute inset-x-0 left-0 w-1/4 bg-gradient-to-r from-(--card)" />
      <div className="pointer-events-none absolute inset-x-0 right-0 w-1/4 bg-gradient-to-l from-(--card)" />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'children', type: 'ReactNode', description: '滚动内容(会重复 repeat 次)。' },
    { name: 'reverse', type: 'boolean', default: 'false', description: '反向滚动。' },
    { name: 'pauseOnHover', type: 'boolean', default: 'false', description: '悬停暂停动画。' },
    { name: 'vertical', type: 'boolean', default: 'false', description: '垂直滚动。' },
    { name: 'repeat', type: 'number', default: '4', description: '内容重复次数(无缝至少 2)。' },
    { name: 'duration', type: 'number | string', default: "'40s'", description: '单次动画时长。' },
    { name: 'gap', type: 'number | string', default: "'1rem'", description: '子项间距。' },
  ],
};

const bento: DocDef = {
  key: 'bento-grid',
  name: 'BentoGrid',
  cn: '杂志栅格',
  description:
    '杂志风格栅格卡片布局:三列 auto-rows 网格,每张卡片带悬停动效——内容区上移、图标缩小、CTA 按钮从底部滑入。源自 MagicUI,适配 Fluent 设计令牌。',
  importCode: `import { BentoGrid, BentoCard } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: 'BentoGrid 默认三列,CSS Grid 自动行高 22rem。BentoCard 接收 name / description / Icon / background / href / cta 属性。',
      demo: (() => {
        const files = [
          { name: '需求文档.pdf', body: '产品需求规格说明书 v2.3,包含功能描述与验收标准。' },
          { name: '财务预算.xlsx', body: 'Q3 部门预算表,包含人力、设备、运营各项支出明细。' },
          { name: '品牌logo.svg', body: '企业 VI 标准矢量文件,包含主标识与辅助图形规范。' },
        ];
        return (
          <BentoGrid>
            <BentoCard
              name="文件管理"
              description="自动保存你的文件,支持全文搜索与版本回溯。"
              Icon={DocumentRegular}
              href="#"
              cta="了解更多"
              className="lg:col-span-1"
              background={
                <Marquee pauseOnHover className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
                         duration={20} style={{ padding: 0 }}>
                  {files.map((f) => (
                    <div key={f.name}
                      className="flex flex-col gap-1 p-3 w-28 rounded-xl border border-(--stroke)
                                 bg-(--card) blur-[1px] hover:blur-none transition-all duration-300">
                      <span className="text-xs font-medium truncate">{f.name}</span>
                      <span className="text-[11px] text-(--text-3) line-clamp-2">{f.body}</span>
                    </div>
                  ))}
                </Marquee>
              }
            />
            <BentoCard
              name="通知中心"
              description="重要事件实时推送,不错过任何关键更新。"
              Icon={AlertRegular}
              href="#"
              cta="了解更多"
              className="lg:col-span-2"
              background={
                <div className="absolute top-4 right-4 flex flex-col gap-2 w-48
                                [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
                  {[
                    { title: '新成员加入', time: '2 分钟前', color: 'accent' },
                    { title: '文件已更新', time: '15 分钟前', color: 'success' },
                    { title: '系统维护通知', time: '1 小时前', color: 'warning' },
                  ].map((n) => (
                    <div key={n.title}
                      className="flex items-center gap-2 p-2 rounded-md bg-(--card) border border-(--stroke)">
                      <span className={`w-1.5 h-1.5 rounded-full bg-(--${n.color})`} />
                      <span className="text-xs flex-1 truncate">{n.title}</span>
                      <span className="text-[11px] text-(--text-3) shrink-0">{n.time}</span>
                    </div>
                  ))}
                </div>
              }
            />
            <BentoCard
              name="日历视图"
              description="按日期筛选文件,时间线一目了然。"
              Icon={CalendarLtrRegular}
              href="#"
              cta="了解更多"
              className="lg:col-span-1"
              background={
                <Calendar className="absolute top-6 right-0 origin-top scale-75 rounded-md
                                    [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]
                                    transition-all duration-300 group-hover:scale-90" />
              }
            />
            <BentoCard
              name="集成生态"
              description="支持 100+ 第三方集成,持续扩展中。"
              Icon={GlobeRegular}
              href="#"
              cta="了解更多"
              className="lg:col-span-2"
              background={
                <div className="absolute inset-0 flex items-center justify-center opacity-20
                                [mask-image:linear-gradient(to_top,transparent_20%,#000_100%)]">
                  <div className="grid grid-cols-4 gap-4 p-8">
                    {[ChatRegular, ShareRegular, SettingsRegular, PaintBrushRegular].map((I, i) => (
                      <I key={i} size={32} />
                    ))}
                  </div>
                </div>
              }
            />
          </BentoGrid>
        );
      })(),
      code: `
import { BentoGrid, BentoCard, Calendar, Marquee } from '@fluent-jade/ui';
import { DocumentRegular, AlertRegular, CalendarLtrRegular, GlobeRegular } from '@fluent-jade/icon';

const files = [
  { name: '需求文档.pdf', body: '产品需求规格说明书 v2.3,包含功能描述与验收标准。' },
  { name: '财务预算.xlsx', body: 'Q3 部门预算表,包含人力、设备、运营各项支出明细。' },
  { name: '品牌logo.svg', body: '企业 VI 标准矢量文件,包含主标识与辅助图形规范。' },
];

export function BentoDemo() {
  const features = [
    {
      name: '文件管理', Icon: DocumentRegular,
      description: '自动保存你的文件,支持全文搜索与版本回溯。',
      href: '#', cta: '了解更多',
      className: 'lg:col-span-1',
      background: (
        <Marquee pauseOnHover className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
                 duration={20} style={{ padding: 0 }}>
          {files.map((f) => (
            <div key={f.name}
              className="flex flex-col gap-1 p-3 w-28 rounded-xl border border-(--stroke)
                         bg-(--card) blur-[1px] hover:blur-none transition-all duration-300">
              <span className="text-xs font-medium truncate">{f.name}</span>
              <span className="text-[11px] text-(--text-3) line-clamp-2">{f.body}</span>
            </div>
          ))}
        </Marquee>
      ),
    },
    {
      name: '通知中心', Icon: AlertRegular,
      description: '重要事件实时推送,不错过任何关键更新。',
      href: '#', cta: '了解更多',
      className: 'lg:col-span-2',
      background: (
        <div className="absolute top-4 right-4 flex flex-col gap-2 w-48
                        [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
          {[
            { title: '新成员加入', time: '2 分钟前' },
            { title: '文件已更新', time: '15 分钟前' },
            { title: '系统维护通知', time: '1 小时前' },
          ].map((n) => (
            <div key={n.title} className="flex items-center gap-2 p-2 rounded-md
                                          bg-(--card) border border-(--stroke)">
              <span className="w-1.5 h-1.5 rounded-full bg-(--accent)" />
              <span className="text-xs flex-1 truncate">{n.title}</span>
              <span className="text-[11px] text-(--text-3) shrink-0">{n.time}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: '日历视图', Icon: CalendarLtrRegular,
      description: '按日期筛选文件,时间线一目了然。',
      href: '#', cta: '了解更多',
      className: 'lg:col-span-1',
      background: (
        <Calendar className="absolute top-6 right-0 origin-top scale-75 rounded-md
                            [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]
                            transition-all duration-300 group-hover:scale-90" />
      ),
    },
    {
      name: '集成生态', Icon: GlobeRegular,
      description: '支持 100+ 第三方集成,持续扩展中。',
      href: '#', cta: '了解更多',
      className: 'lg:col-span-2',
      background: (
        <div className="absolute inset-0 flex items-center justify-center opacity-20
                        [mask-image:linear-gradient(to_top,transparent_20%,#000_100%)]">
          <div className="grid grid-cols-4 gap-4 p-8">
            {[ChatRegular, ShareRegular, SettingsRegular, PaintBrushRegular].map((I, i) => (
              <I key={i} size={32} />
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <BentoGrid>
      {features.map((f) => <BentoCard key={f.name} {...f} />)}
    </BentoGrid>
  );
}`,
    },
  ],
  props: [
    { name: 'BentoGrid', type: '组件', description: 'CSS Grid 容器,默认三列 auto-rows-[22rem] gap-4。' },
    { name: 'BentoCard', type: '组件', description: '特性卡片:悬停内容上移 + 图标缩小 + CTA 滑入。' },
    { name: 'name', type: 'string', description: '卡片标题 (BentoCard)。' },
    { name: 'description', type: 'string', description: '描述文案 (BentoCard)。' },
    { name: 'Icon', type: 'ComponentType<{size?}>', description: 'Fluent 图标组件引用,非实例 (BentoCard)。' },
    { name: 'background', type: 'ReactNode', description: '卡片背景内容(如图表/列表/Marquee) (BentoCard)。' },
    { name: 'href', type: 'string', description: '点击跳转链接 (BentoCard)。' },
    { name: 'cta', type: 'string', description: '按钮文案 (BentoCard)。' },
    { name: 'className', type: 'string', description: '栅格跨列控制,如 lg:col-span-1 / lg:col-span-2。' },
  ],
};

const dock: DocDef = {
  key: 'dock',
  name: 'Dock',
  cn: '停靠栏',
  description:
    'MacOS Dock 风格停靠栏。鼠标 X 位置驱动相邻图标弹簧放大(motion spring)。对齐 MagicUI API:iconSize / iconMagnification / iconDistance / direction / disableMagnification。',
  importCode: `import { Dock, DockIcon } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: '在栏上滑动鼠标,靠近的图标会放大。label 显示悬停 tip。中间可用分隔线。',
      demo: (
        <Dock>
          <DockIcon label="首页"><HomeRegular size={20} /></DockIcon>
          <DockIcon label="搜索"><SearchRegular size={20} /></DockIcon>
          <span className="dock-sep" />
          <DockIcon label="消息"><ChatRegular size={20} /></DockIcon>
          <DockIcon label="设置"><SettingsRegular size={20} /></DockIcon>
        </Dock>
      ),
      code: `
import { Dock, DockIcon } from '@fluent-jade/ui';
import { HomeRegular, SearchRegular, ChatRegular, SettingsRegular } from '@fluent-jade/icon';

export function DockExample() {
  return (
    <Dock>
      <DockIcon label="首页"><HomeRegular size={20} /></DockIcon>
      <DockIcon label="搜索"><SearchRegular size={20} /></DockIcon>
      <span className="dock-sep" />
      <DockIcon label="消息"><ChatRegular size={20} /></DockIcon>
      <DockIcon label="设置"><SettingsRegular size={20} /></DockIcon>
    </Dock>
  );
}`,
    },
    {
      title: '自定义放大',
      description: 'iconMagnification 最大尺寸;iconDistance 影响半径(越小越敏感)。',
      demo: (
        <Dock iconMagnification={60} iconDistance={100}>
          <DockIcon label="首页"><HomeRegular size={20} /></DockIcon>
          <DockIcon label="搜索"><SearchRegular size={20} /></DockIcon>
          <DockIcon label="消息"><ChatRegular size={20} /></DockIcon>
          <DockIcon label="设置"><SettingsRegular size={20} /></DockIcon>
        </Dock>
      ),
      code: `
import { Dock, DockIcon } from '@fluent-jade/ui';
import { HomeRegular, SearchRegular, ChatRegular, SettingsRegular } from '@fluent-jade/icon';

export function DockMagnifyExample() {
  return (
    <Dock iconMagnification={60} iconDistance={100}>
      <DockIcon label="首页"><HomeRegular size={20} /></DockIcon>
      <DockIcon label="搜索"><SearchRegular size={20} /></DockIcon>
      <DockIcon label="消息"><ChatRegular size={20} /></DockIcon>
      <DockIcon label="设置"><SettingsRegular size={20} /></DockIcon>
    </Dock>
  );
}`,
    },
    {
      title: '点击事件 / 链接',
      description: '推荐把 onClick 挂在 Dock 上,子项用 value 标识;也可单项 onClick。href 做跳转。',
      demo: (
        <Dock onClick={(v) => console.log('dock click', v)}>
          <DockIcon value="home" label="首页"><HomeRegular size={20} /></DockIcon>
          <DockIcon value="search" label="搜索"><SearchRegular size={20} /></DockIcon>
          <DockIcon value="settings" label="设置" href="#settings"><SettingsRegular size={20} /></DockIcon>
        </Dock>
      ),
      code: `
import { Dock, DockIcon } from '@fluent-jade/ui';
import { HomeRegular, SearchRegular, SettingsRegular } from '@fluent-jade/icon';

export function DockClickExample() {
  return (
    <Dock onClick={(value) => console.log(value)}>
      <DockIcon value="home" label="首页">
        <HomeRegular size={20} />
      </DockIcon>
      <DockIcon value="search" label="搜索">
        <SearchRegular size={20} />
      </DockIcon>
      {/* 也可单项 onClick;与 Dock.onClick 并存时先单项 */}
      <DockIcon value="settings" label="设置" href="#settings">
        <SettingsRegular size={20} />
      </DockIcon>
    </Dock>
  );
}`,
    },
  ],
  props: [
    { name: 'iconSize', type: 'number', default: '40', description: '图标默认尺寸(px)。' },
    { name: 'iconMagnification', type: 'number', default: '52', description: '鼠标靠近时最大放大尺寸(px)。' },
    { name: 'iconDistance', type: 'number', default: '140', description: '影响半径(px)。' },
    { name: 'direction', type: "'top' | 'middle' | 'bottom'", default: "'middle'", description: '图标垂直对齐。' },
    { name: 'disableMagnification', type: 'boolean', default: 'false', description: '关闭放大效果。' },
    { name: 'onClick', type: '(value, e) => void', description: '统一点击;value 取自 DockIcon.value,缺省回退 label。' },
  ],
  extraApis: [
    {
      title: 'DockIcon',
      rows: [
        { name: 'value', type: 'string', description: '业务标识,供 Dock.onClick 使用。' },
        { name: 'label', type: 'string', description: '悬停 tip(配色/层级对齐 Tooltip)。' },
        { name: 'onClick', type: '(e) => void', description: '单项点击;与 Dock.onClick 并存时先触发。' },
        { name: 'href', type: 'string', description: '点击跳转链接。' },
        { name: 'external', type: 'boolean', default: 'false', description: '新标签页打开(需 href)。' },
        { name: 'className', type: 'string', description: '自定义类名。' },
      ],
    },
  ],
};

export const displayDocs: DocDef[] = [
  card, expander, splitter, settingscard, image, carousel, tag, badge, avatar, divider, empty, skeleton, timeline, marquee, bento, dock,
];
