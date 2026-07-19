/* 文档数据:通用 — Button / ToggleButton / Icon */
import { useState } from 'react';
import { Button, Icon, ToggleButton } from '@fluent-react/ui';
import type { DocDef } from '../types';

const button: DocDef = {
  key: 'button',
  name: 'Button',
  cn: '按钮',
  description:
    '按钮用于触发一次即时操作。视觉与动效遵循 WinUI 3(渐变描边、按压回弹),API 遵循 antd 惯例:variant 区分层级,danger 表达危险操作,loading 内置加载圆环。',
  importCode: `import { Button } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      description: '四种变体:default 标准按钮、accent 主题色主按钮、subtle 无边框弱化按钮、link 超链接样式。一个操作区只放一个 accent 按钮。',
      demo: (
        <>
          <Button>标准按钮</Button>
          <Button variant="accent">主按钮</Button>
          <Button variant="subtle">弱化按钮</Button>
          <Button variant="link">链接按钮</Button>
        </>
      ),
      code: `
import { Button } from '@fluent-react/ui';

export function VariantsExample() {
  return (
    <>
      <Button>标准按钮</Button>
      <Button variant="accent">主按钮</Button>
      <Button variant="subtle">弱化按钮</Button>
      <Button variant="link">链接按钮</Button>
    </>
  );
}`,
    },
    {
      title: '危险按钮',
      description: 'danger 表达删除等破坏性操作:default 变体呈红字红边,accent 变体呈红底实心。',
      demo: (
        <>
          <Button danger>删除</Button>
          <Button variant="accent" danger>永久删除</Button>
        </>
      ),
      code: `
import { Button } from '@fluent-react/ui';

export function DangerExample() {
  return (
    <>
      <Button danger>删除</Button>
      <Button variant="accent" danger>永久删除</Button>
    </>
  );
}`,
    },
    {
      title: '尺寸',
      description: 'antd 三档尺寸:small 24px / middle 32px(默认)/ large 40px。',
      demo: (
        <>
          <Button size="small">小按钮</Button>
          <Button>中按钮</Button>
          <Button size="large">大按钮</Button>
        </>
      ),
      code: `
import { Button } from '@fluent-react/ui';

export function SizesExample() {
  return (
    <>
      <Button size="small">小按钮</Button>
      <Button>中按钮</Button>
      <Button size="large">大按钮</Button>
    </>
  );
}`,
    },
    {
      title: '加载与禁用',
      description: 'loading 前置加载圆环并临时禁用,适合提交类操作;disabled 为常规禁用态。',
      demo: (
        <>
          <Button loading>提交中</Button>
          <Button variant="accent" loading>保存中</Button>
          <Button disabled>不可用</Button>
        </>
      ),
      code: `
import { Button } from '@fluent-react/ui';

export function LoadingDisabledExample() {
  return (
    <>
      <Button loading>提交中</Button>
      <Button variant="accent" loading>保存中</Button>
      <Button disabled>不可用</Button>
    </>
  );
}`,
    },
    {
      title: '图标按钮',
      description: 'iconOnly 收窄为方形,仅放一枚图标;务必提供 aria-label。',
      demo: (
        <>
          <Button iconOnly aria-label="设置"><Icon name="settings" strokeWidth={1.3} /></Button>
          <Button iconOnly variant="subtle" aria-label="搜索"><Icon name="search" strokeWidth={1.3} /></Button>
          <Button><Icon name="add" size={14} />新建</Button>
        </>
      ),
      code: `
import { Button, Icon } from '@fluent-react/ui';

export function IconButtonExample() {
  return (
    <>
      {/* iconOnly 收窄为方形,务必提供 aria-label */}
      <Button iconOnly aria-label="设置"><Icon name="settings" strokeWidth={1.3} /></Button>
      <Button iconOnly variant="subtle" aria-label="搜索"><Icon name="search" strokeWidth={1.3} /></Button>
      <Button><Icon name="add" size={14} />新建</Button>
    </>
  );
}`,
    },
  ],
  props: [
    { name: 'variant', type: "'default' | 'accent' | 'subtle' | 'link'", default: "'default'", description: '按钮变体:标准 / 主题色主按钮 / 无边框 / 链接样式。' },
    { name: 'danger', type: 'boolean', default: 'false', description: '危险操作样式,与 variant 组合生效。' },
    { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '三档高度 24 / 32 / 40px。' },
    { name: 'loading', type: 'boolean', default: 'false', description: '加载中:前置圆环并禁用点击。' },
    { name: 'iconOnly', type: 'boolean', default: 'false', description: '方形纯图标按钮。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
    { name: '...rest', type: 'ButtonHTMLAttributes', description: '透传原生 button 属性(type 默认 "button")。' },
  ],
  events: [
    { name: 'onClick', type: '(e: MouseEvent) => void', description: '点击回调(原生透传)。' },
  ],
};

const togglebutton: DocDef = {
  key: 'togglebutton',
  name: 'ToggleButton',
  cn: '开关按钮',
  description:
    'WinUI ToggleButton:可按下保持的按钮,选中态为 accent 实底。用于工具条里的粗体 / 置顶 / 静音类即时开关;成组互斥选择用 Tabs 的 segmented 变体,表单里的开关用 Switch。',
  importCode: `import { ToggleButton } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      description: '非受控 defaultChecked;iconOnly 收窄为方形图标钮。',
      demo: (
        <>
          <ToggleButton defaultChecked>置顶窗口</ToggleButton>
          <ToggleButton>自动换行</ToggleButton>
          <ToggleButton iconOnly defaultChecked aria-label="收藏"><Icon name="home" strokeWidth={1.3} /></ToggleButton>
          <ToggleButton disabled>不可用</ToggleButton>
        </>
      ),
      code: `
import { Icon, ToggleButton } from '@fluent-react/ui';

export function ToggleButtonBasicExample() {
  return (
    <>
      <ToggleButton defaultChecked>置顶窗口</ToggleButton>
      <ToggleButton>自动换行</ToggleButton>
      {/* iconOnly:方形图标钮,务必提供 aria-label */}
      <ToggleButton iconOnly defaultChecked aria-label="收藏">
        <Icon name="home" strokeWidth={1.3} />
      </ToggleButton>
      <ToggleButton disabled>不可用</ToggleButton>
    </>
  );
}`,
    },
    {
      title: '受控用法',
      demo: <ToggleButtonControlled />,
      code: `
import { useState } from 'react';
import { ToggleButton } from '@fluent-react/ui';

export function ToggleButtonControlledExample() {
  const [muted, setMuted] = useState(false);
  return (
    <ToggleButton checked={muted} onChange={setMuted}>
      {muted ? '已静音' : '静音'}
    </ToggleButton>
  );
}`,
    },
  ],
  props: [
    { name: 'checked / defaultChecked', type: 'boolean', default: '— / false', description: '受控 / 非受控按下态。' },
    { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '三档高度。' },
    { name: 'iconOnly', type: 'boolean', default: 'false', description: '方形纯图标钮。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
    { name: '...rest', type: 'ButtonHTMLAttributes', description: '透传原生 button 属性(含 aria-pressed 自动设置)。' },
  ],
  events: [
    { name: 'onChange', type: '(checked: boolean) => void', description: '按下态切换。' },
    { name: 'onClick', type: '(e: MouseEvent) => void', description: '原生点击(与 onChange 同时触发)。' },
  ],
};

function ToggleButtonControlled() {
  const [muted, setMuted] = useState(false);
  return <ToggleButton checked={muted} onChange={setMuted}>{muted ? '已静音' : '静音'}</ToggleButton>;
}

const icon: DocDef = {
  key: 'icon',
  name: 'Icon',
  cn: '图标',
  description:
    'Fluent 风格线性图标:16 网格、1.3~1.5 描边、currentColor 随文字着色(全库禁用 Emoji)。path 数据内置于组件,按需在 PATHS 中增补。',
  importCode: `import { Icon } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      description: '通过 name 指定图标;颜色继承当前文字色。',
      demo: (
        <>
          {(['home', 'settings', 'search', 'calendar', 'info', 'success', 'warning', 'error'] as const).map((n) => (
            <Icon key={n} name={n} strokeWidth={1.3} />
          ))}
        </>
      ),
      code: `
import { Icon } from '@fluent-react/ui';

export function BasicUsageExample() {
  // 颜色继承当前文字色(currentColor)
  const names = ['home', 'settings', 'search', 'calendar', 'info', 'success', 'warning', 'error'] as const;
  return (
    <>
      {names.map((n) => (
        <Icon key={n} name={n} strokeWidth={1.3} />
      ))}
    </>
  );
}`,
    },
    {
      title: '尺寸与描边',
      description: 'size 以内联样式钉定宽高(不会被样式表覆盖);strokeWidth 控制线条粗细。',
      demo: (
        <>
          <Icon name="image" size={16} strokeWidth={1.3} />
          <Icon name="image" size={24} strokeWidth={1.3} />
          <Icon name="image" size={32} strokeWidth={1.1} />
        </>
      ),
      code: `
import { Icon } from '@fluent-react/ui';

export function SizesStrokeExample() {
  return (
    <>
      {/* size 以内联样式钉定宽高;strokeWidth 控制线条粗细 */}
      <Icon name="image" size={16} strokeWidth={1.3} />
      <Icon name="image" size={24} strokeWidth={1.3} />
      <Icon name="image" size={32} strokeWidth={1.1} />
    </>
  );
}`,
    },
  ],
  props: [
    { name: 'name', type: 'IconName', description: '图标名(内置 sprite 键,如 home / settings / search)。' },
    { name: 'size', type: 'number', default: '16', description: '宽高像素,内联钉定。' },
    { name: 'strokeWidth', type: 'number', default: '1.5', description: '描边粗细。' },
    { name: '...rest', type: 'SVGProps<SVGSVGElement>', description: '透传原生 SVG 属性(className / style / aria-*)。' },
  ],
};

export const generalDocs: DocDef[] = [button, togglebutton, icon];
