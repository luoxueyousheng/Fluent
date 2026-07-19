/* 文档数据:通用 — Button / ToggleButton / Icons */
import { useMemo, useState } from 'react';
import { Button, SearchBox, ToggleButton, ToggleButtonGroup, useToast } from '@fluent-jade/ui';
import {
  AddRegular,
  CalendarLtrRegular,
  CheckmarkCircleRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  DismissRegular,
  ErrorCircleRegular,
  HomeFilled,
  HomeRegular,
  InfoRegular,
  SearchRegular,
  SettingsFilled,
  SettingsRegular,
  StarFilled,
  StarRegular,
  TextFontRegular,
  WarningRegular,
  iconCatalog,
  iconGroups,
} from '@fluent-jade/icon';

import type { DocDef } from '../types';

const button: DocDef = {
  key: 'button',
  name: 'Button',
  cn: '按钮',
  description:
    '按钮用于触发一次即时操作。视觉与动效遵循 WinUI 3(渐变描边、按压回弹),API 遵循 antd 惯例:variant 区分层级,danger 表达危险操作,loading 内置加载圆环。',
  importCode: `import { Button } from '@fluent-jade/ui';`,
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
import { Button } from '@fluent-jade/ui';

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
import { Button } from '@fluent-jade/ui';

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
import { Button } from '@fluent-jade/ui';

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
import { Button } from '@fluent-jade/ui';

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
          <Button iconOnly aria-label="设置"><SettingsRegular /></Button>
          <Button iconOnly variant="subtle" aria-label="搜索"><SearchRegular /></Button>
          <Button><AddRegular size={14} />新建</Button>
        </>
      ),
      code: `
import { Button } from '@fluent-jade/ui';

export function IconButtonExample() {
  return (
    <>
      {/* iconOnly 收窄为方形,务必提供 aria-label */}
      <Button iconOnly aria-label="设置"><SettingsRegular /></Button>
      <Button iconOnly variant="subtle" aria-label="搜索"><SearchRegular /></Button>
      <Button><AddRegular size={14} />新建</Button>
    </>
  );
}`,
    },
    {
      title: '点击事件',
      description: 'onClick 为原生透传回调;loading / disabled 期间不会触发。',
      demo: <ButtonClickDemo />,
      code: `
import { useState } from 'react';
import { Button } from '@fluent-jade/ui';

export function ClickEventExample() {
  const [count, setCount] = useState(0);
  return (
    <Button variant="accent" onClick={() => setCount(count + 1)}>
      已点击 {count} 次
    </Button>
  );
}`,
    },

    {
      title: '着色与圆角',
      description: 'color 语义五色:default 变体=文字+描边 tint,accent 变体=实色底;radius 四档 none/sm/md/lg。',
      demo: (
        <div className="flex flex-col gap-3 items-start">
          <div className="flex flex-wrap gap-2">
            <Button color="primary">Primary</Button>
            <Button color="secondary">Secondary</Button>
            <Button color="success">Success</Button>
            <Button color="warning">Warning</Button>
            <Button color="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="accent" color="success">实色成功</Button>
            <Button variant="accent" color="warning">实色警告</Button>
            <Button variant="accent" color="danger">实色危险</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button radius="none">none</Button>
            <Button radius="sm">sm</Button>
            <Button radius="md">md</Button>
            <Button radius="lg">lg</Button>
          </div>
        </div>
      ),
      code: `
import { Button } from '@fluent-jade/ui';

export function ButtonColorRadiusExample() {
  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="flex flex-wrap gap-2">
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="success">Success</Button>
        <Button color="warning">Warning</Button>
        <Button color="danger">Danger</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="accent" color="success">实色成功</Button>
        <Button variant="accent" color="warning">实色警告</Button>
        <Button variant="accent" color="danger">实色危险</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button radius="none">none</Button>
        <Button radius="sm">sm</Button>
        <Button radius="md">md</Button>
        <Button radius="lg">lg</Button>
      </div>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'variant', type: "'default' | 'accent' | 'subtle' | 'link'", default: "'default'", description: '按钮变体:标准 / 主题色主按钮 / 无边框 / 链接样式。' },
    { name: 'danger', type: 'boolean', default: 'false', description: '危险操作样式,与 variant 组合生效。' },
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:default 变体=文字+描边 tint,accent 变体=实色底。' },
    { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: '圆角档位。' },
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

function ButtonClickDemo() {
  const [count, setCount] = useState(0);
  return (
    <Button variant="accent" onClick={() => setCount(count + 1)}>
      已点击 {count} 次
    </Button>
  );
}

const togglebutton: DocDef = {
  key: 'togglebutton',
  name: 'ToggleButton',
  cn: '开关按钮',
  description:
    'WinUI ToggleButton:可按下保持的按钮,选中态为 accent 实底。用于工具条里的粗体 / 置顶 / 静音类即时开关;ToggleButtonGroup 成组(默认合并一体,可分离,单选或多选);表单里的开关用 Switch,页签式导航用 Tabs。',
  importCode: `import { ToggleButton, ToggleButtonGroup } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: '非受控 defaultChecked;iconOnly 收窄为方形图标钮。',
      demo: (
        <>
          <ToggleButton defaultChecked>置顶窗口</ToggleButton>
          <ToggleButton>自动换行</ToggleButton>
          <ToggleButton iconOnly defaultChecked aria-label="收藏"><HomeRegular /></ToggleButton>
          <ToggleButton disabled>不可用</ToggleButton>
        </>
      ),
      code: `
import { ToggleButton } from '@fluent-jade/ui';

export function ToggleButtonBasicExample() {
  return (
    <>
      <ToggleButton defaultChecked>置顶窗口</ToggleButton>
      <ToggleButton>自动换行</ToggleButton>
      {/* iconOnly:方形图标钮,务必提供 aria-label */}
      <ToggleButton iconOnly defaultChecked aria-label="收藏">
        <HomeRegular />
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
import { ToggleButton } from '@fluent-jade/ui';

export function ToggleButtonControlledExample() {
  const [muted, setMuted] = useState(false);
  return (
    <ToggleButton checked={muted} onChange={setMuted}>
      {muted ? '已静音' : '静音'}
    </ToggleButton>
  );
}`,
    },
    {
      title: '尺寸与原生点击',
      description: 'size 与 Button 同款三档(small 24 / middle 32 / large 40px);onClick 为原生透传,与 onChange 同时触发。',
      demo: <ToggleButtonSizesDemo />,
      code: `
import { useState } from 'react';
import { ToggleButton } from '@fluent-jade/ui';

export function ToggleButtonSizesExample() {
  const [clicks, setClicks] = useState(0);
  return (
    <>
      <ToggleButton size="small" defaultChecked>小尺寸</ToggleButton>
      <ToggleButton>中尺寸(默认)</ToggleButton>
      <ToggleButton size="large" onClick={() => setClicks(clicks + 1)}>
        大尺寸 · 点击 {clicks} 次
      </ToggleButton>
    </>
  );
}`,
    },
    {
      title: '按钮组(合并 / 分离,单选 / 多选)',
      description:
        'ToggleButtonGroup 默认合并为一体(分段形态)且单选——再点已选项可取消(回调 \'\');multiple 改多选,separated 改留缝分离。options 项支持 icon 与按项 disabled,size 与 Button 同款三档。',
      demo: <ToggleGroupDemo />,
      code: `
import { useState } from 'react';
import { ToggleButtonGroup } from '@fluent-jade/ui';

export function ToggleButtonGroupExample() {
  // 合并 + 单选(受控):对齐方式,再点已选项可取消
  const [align, setAlign] = useState<string | string[]>('left');
  // 分离 + 多选(非受控 defaultValue):文字格式
  return (
    <div className="flex flex-col gap-3 items-start">
      <ToggleButtonGroup aria-label="对齐方式"
        value={align} onChange={setAlign}
        options={[
          { value: 'left', label: '左对齐' },
          { value: 'center', label: '居中' },
          { value: 'right', label: '右对齐' },
          { value: 'justify', label: '两端', disabled: true },
        ]} />
      <ToggleButtonGroup multiple separated size="small" aria-label="文字格式"
        defaultValue={['bold']}
        options={[
          { value: 'bold', label: '粗体', icon: <TextFontRegular size={14} /> },
          { value: 'italic', label: '斜体' },
          { value: 'underline', label: '下划线' },
        ]}
        onChange={(v) => console.log('格式:', v)} />
    </div>
  );
}`,
    },

    {
      title: '着色与圆角',
      description: 'ToggleButton 的 color 作用于按下态实色;radius 四档。ToggleButtonGroup 可整组着色/圆角(合并形态作用于首末端)。',
      demo: (
        <div className="flex flex-col gap-3 items-start">
          <div className="flex flex-wrap gap-2">
            <ToggleButton defaultChecked color="success">成功</ToggleButton>
            <ToggleButton defaultChecked color="warning">警告</ToggleButton>
            <ToggleButton defaultChecked color="danger">危险</ToggleButton>
            <ToggleButton radius="lg">大圆角</ToggleButton>
          </div>
          <ToggleButtonGroup color="success" radius="lg" defaultValue="left"
            options={[
              { value: 'left', label: '左' },
              { value: 'center', label: '中' },
              { value: 'right', label: '右' },
            ]} />
        </div>
      ),
      code: `
import { ToggleButton, ToggleButtonGroup } from '@fluent-jade/ui';

export function ToggleButtonColorRadiusExample() {
  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="flex flex-wrap gap-2">
        <ToggleButton defaultChecked color="success">成功</ToggleButton>
        <ToggleButton defaultChecked color="warning">警告</ToggleButton>
        <ToggleButton defaultChecked color="danger">危险</ToggleButton>
        <ToggleButton radius="lg">大圆角</ToggleButton>
      </div>
      <ToggleButtonGroup color="success" radius="lg" defaultValue="left"
        options={[
          { value: 'left', label: '左' },
          { value: 'center', label: '中' },
          { value: 'right', label: '右' },
        ]} />
    </div>
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
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:按下态实色随之变化。' },
    { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: '圆角档位。' },
    { name: 'onChange', type: '(checked: boolean) => void', description: '按下态切换。' },
    { name: 'onClick', type: '(e: MouseEvent) => void', description: '原生点击(与 onChange 同时触发)。' },
  ],
  extraApis: [
    {
      title: 'ToggleButtonGroup',
      rows: [
        { name: 'options', type: '{ value, label?, icon?, disabled? }[]', description: '按钮项(必填);label 缺省显示 value,支持按项禁用。' },
        { name: 'multiple', type: 'boolean', default: 'false', description: '多选;缺省单选(再点已选项 = 取消)。' },
        { name: 'separated', type: 'boolean', default: 'false', description: '分离形态(留缝);缺省合并为一体。' },
        { name: 'value / defaultValue', type: 'string | string[]', description: '受控 / 非受控值:单选 string,多选 string[]。' },
        { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '整组三档高度。' },
        { name: 'disabled', type: 'boolean', default: 'false', description: '整组禁用。' },
        { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '整组语义着色(按下态实色)。' },
        { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: '整组圆角;合并形态作用于首末端。' },
        { name: 'onChange', type: '(value: string | string[]) => void', description: '选中变化;单选取消时回调空串。' },
      ],
    },
  ],
};

function ToggleGroupDemo() {
  const [align, setAlign] = useState<string | string[]>('left');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <ToggleButtonGroup aria-label="对齐方式"
        value={align} onChange={setAlign}
        options={[
          { value: 'left', label: '左对齐' },
          { value: 'center', label: '居中' },
          { value: 'right', label: '右对齐' },
          { value: 'justify', label: '两端', disabled: true },
        ]} />
      <ToggleButtonGroup multiple separated size="small" aria-label="文字格式"
        defaultValue={['bold']}
        options={[
          { value: 'bold', label: '粗体', icon: <TextFontRegular size={14} /> },
          { value: 'italic', label: '斜体' },
          { value: 'underline', label: '下划线' },
        ]} />
    </div>
  );
}

function ToggleButtonControlled() {
  const [muted, setMuted] = useState(false);
  return <ToggleButton checked={muted} onChange={setMuted}>{muted ? '已静音' : '静音'}</ToggleButton>;
}

function ToggleButtonSizesDemo() {
  const [clicks, setClicks] = useState(0);
  return (
    <>
      <ToggleButton size="small" defaultChecked>小尺寸</ToggleButton>
      <ToggleButton>中尺寸(默认)</ToggleButton>
      <ToggleButton size="large" onClick={() => setClicks(clicks + 1)}>
        大尺寸 · 点击 {clicks} 次
      </ToggleButton>
    </>
  );
}

const icon: DocDef = {
  key: 'icon',
  name: 'Icons',
  cn: '图标',
  description:
    'Fluent System Icons 独立包 `@fluent-jade/icon`(与 `@fluent-jade/ui` 组件库分离)。命名导入 *Regular / *Filled,用 `size` 控制尺寸,用 `color` 控制填充色(默认 currentColor)。**禁止 emoji 当图标**。未收录图标可直连 `@fluentui/react-icons/headless/svg/<name>`。',
  importCode: `import { HomeRegular, SearchRegular, SettingsRegular } from '@fluent-jade/icon';`,
  sections: [
    {
      title: '命名导入',
      description: '每个图标是独立组件。从 `@fluent-jade/icon` 导入,不要再从 ui 包取图标。',
      demo: (
        <div className="flex flex-wrap gap-3 items-center text-(--text-1)">
          <HomeRegular size={20} />
          <SettingsRegular size={20} />
          <SearchRegular size={20} />
          <CalendarLtrRegular size={20} />
          <InfoRegular size={20} />
          <CheckmarkCircleRegular size={20} />
          <WarningRegular size={20} />
          <ErrorCircleRegular size={20} />
          <ChevronLeftRegular size={20} />
          <ChevronRightRegular size={20} />
          <AddRegular size={20} />
          <DismissRegular size={20} />
        </div>
      ),
      code: `
import {
  AddRegular, CalendarLtrRegular, CheckmarkCircleRegular, ChevronLeftRegular, ChevronRightRegular,
  DismissRegular, ErrorCircleRegular, HomeRegular, InfoRegular, SearchRegular, SettingsRegular, WarningRegular,
} from '@fluent-jade/icon';

export function NamedIconsExample() {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <HomeRegular size={20} />
      <SettingsRegular size={20} />
      <SearchRegular size={20} />
      <CalendarLtrRegular size={20} />
      <InfoRegular size={20} />
      <CheckmarkCircleRegular size={20} />
      <WarningRegular size={20} />
      <ErrorCircleRegular size={20} />
      <ChevronLeftRegular size={20} />
      <ChevronRightRegular size={20} />
      <AddRegular size={20} />
      <DismissRegular size={20} />
    </div>
  );
}`,
    },
    {
      title: '尺寸 size',
      description: '统一用 size(默认 16)。',
      demo: (
        <div className="flex flex-wrap gap-4 items-end text-(--text-1)">
          <HomeRegular size={12} />
          <HomeRegular size={16} />
          <HomeRegular size={20} />
          <HomeRegular size={24} />
          <HomeRegular size={32} />
        </div>
      ),
      code: `
import { HomeRegular } from '@fluent-jade/icon';

export function IconSizeExample() {
  return (
    <>
      <HomeRegular size={12} />
      <HomeRegular size={16} />
      <HomeRegular size={20} />
      <HomeRegular size={24} />
      <HomeRegular size={32} />
    </>
  );
}`,
    },
    {
      title: '颜色',
      description: '默认 currentColor(随文字色);也可用 color 指定语义色。',
      demo: (
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-(--accent) flex gap-2 items-center">
            <SearchRegular size={20} />
            <CheckmarkCircleRegular size={20} />
          </span>
          <WarningRegular size={20} color="var(--caution)" />
          <ErrorCircleRegular size={20} color="var(--critical)" />
        </div>
      ),
      code: `
import { CheckmarkCircleRegular, ErrorCircleRegular, SearchRegular, WarningRegular } from '@fluent-jade/icon';

export function IconColorExample() {
  return (
    <>
      <div className="text-(--accent)">
        <SearchRegular size={20} />
        <CheckmarkCircleRegular size={20} />
      </div>
      <WarningRegular size={20} color="var(--caution)" />
      <ErrorCircleRegular size={20} color="var(--critical)" />
    </>
  );
}`,
    },
    {
      title: 'Filled 变体',
      description: '实心版适合选中 / 强调态。',
      demo: (
        <div className="flex flex-wrap gap-4 items-center text-(--text-1)">
          <HomeRegular size={24} />
          <HomeFilled size={24} />
          <SettingsRegular size={24} />
          <SettingsFilled size={24} />
          <StarRegular size={24} />
          <StarFilled size={24} />
        </div>
      ),
      code: `
import { HomeFilled, HomeRegular, SettingsFilled, SettingsRegular, StarFilled, StarRegular } from '@fluent-jade/icon';

export function IconFilledExample() {
  return (
    <>
      <HomeRegular size={24} />
      <HomeFilled size={24} />
      <SettingsRegular size={24} />
      <SettingsFilled size={24} />
      <StarRegular size={24} />
      <StarFilled size={24} />
    </>
  );
}`,
    },
    {
      title: '全部图标',
      description: '本包 re-export 的完整目录。点图标卡复制组件名;分组大卡片可折叠。支持搜索过滤。',
      demo: <IconCatalogDemo />,
      code: `
import { useMemo, useState } from 'react';
import { SearchBox, useToast } from '@fluent-jade/ui';
import { ChevronRightRegular, iconCatalog, iconGroups } from '@fluent-jade/icon';

export function IconCatalogExample() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return iconCatalog;
    return iconCatalog.filter((i) => i.name.toLowerCase().includes(s) || i.group.includes(q.trim()));
  }, [q]);
  const searching = q.trim().length > 0;
  const isOpen = (g: string) => (searching ? true : !!open[g]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <SearchBox value={q} onChange={setQ} placeholder="搜索图标名…" />
      <p className="text-(--text-2) text-sm">共 {filtered.length} / {iconCatalog.length}</p>
      {iconGroups.map((g) => {
        const items = filtered.filter((i) => i.group === g);
        if (!items.length) return null;
        const expanded = isOpen(g);
        return (
          <div key={g} className="rounded-lg border border-(--stroke) bg-(--card) overflow-hidden">
            <button type="button" className="flex items-center gap-2 w-full px-3 py-2.5 text-left"
              onClick={() => setOpen((p) => ({ ...p, [g]: !p[g] }))}>
              <ChevronRightRegular size={14} className={expanded ? 'rotate-90' : ''} />
              <span className="text-sm font-semibold flex-1">{g}</span>
              <span className="text-xs text-(--text-3)">{items.length}</span>
            </button>
            {expanded && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-1.5 px-2.5 pb-2.5">
                {items.map(({ name, Component }) => (
                  <button key={name} type="button"
                    className="flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-md border border-(--stroke) bg-(--layer) hover:bg-(--fill-subtle)"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(name);
                      toast({ level: 'success', message: '已复制 ' + name, duration: 1200 });
                    }}
                    title="复制组件名">
                    <Component size={22} />
                    <span className="text-[11px] text-(--text-2) text-center break-all leading-tight">{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}`,

    },
  ],
  props: [
    { name: 'size', type: 'number | string', default: '16', description: '渲染尺寸(推荐)。' },
    { name: 'color', type: 'string', default: 'currentColor', description: '填充色。' },
    { name: 'className / style / title / …', type: 'IconProps', description: '透传 SVG 与无障碍属性。' },
  ],
  extraApis: [
    {
      title: '包与目录',
      rows: [
        { name: '@fluent-jade/icon', type: 'package', description: '图标包(与 ui 分离)。' },
        { name: 'iconCatalog', type: 'IconCatalogItem[]', description: '本包全部图标清单(name/group/Component)。' },
        { name: 'iconGroups', type: 'string[]', description: '分组标题列表。' },
        { name: '*Regular / *Filled', type: 'FluentIcon', description: '线框 / 实心变体。' },
      ],
    },
  ],
};

function IconCatalogDemo() {
  const toast = useToast();
  const [q, setQ] = useState('');
  // 默认全部折叠;有搜索词时自动展开命中分组
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return iconCatalog;
    return iconCatalog.filter((i) => i.name.toLowerCase().includes(s) || i.group.includes(q.trim()));
  }, [q]);

  const copy = async (name: string) => {
    await navigator.clipboard?.writeText(name);
    toast({ level: 'success', message: `已复制 ${name}`, duration: 1200 });
  };

  const searching = q.trim().length > 0;
  const isOpen = (g: string) => (searching ? true : !!open[g]);
  const toggle = (g: string) => setOpen((prev) => ({ ...prev, [g]: !prev[g] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <SearchBox value={q} onChange={setQ} placeholder="搜索图标名…" />
      <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0 }}>共 {filtered.length} / {iconCatalog.length}</p>
      {iconGroups.map((g) => {
        const items = filtered.filter((i) => i.group === g);
        if (!items.length) return null;
        const expanded = isOpen(g);
        return (
          <div key={g} style={{
            border: '1px solid var(--stroke)', borderRadius: 8, background: 'var(--card)', overflow: 'hidden',
          }}>
            <button type="button" onClick={() => toggle(g)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '10px 12px', border: 'none', background: 'transparent',
                cursor: 'pointer', color: 'var(--text-1)', font: 'inherit', textAlign: 'left',
              }}>
              <ChevronRightRegular size={14}
                style={{
                  transform: expanded ? 'rotate(90deg)' : 'none',
                  transition: 'transform 160ms ease', flex: 'none',
                }} />
              <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{g}</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{items.length}</span>
            </button>
            {expanded && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6,
                padding: '0 10px 10px',
              }}>
                {items.map(({ name, Component }) => (
                  <button key={name} type="button"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '10px 6px', border: '1px solid var(--stroke)', borderRadius: 6,
                      background: 'var(--layer)', cursor: 'pointer', color: 'var(--text-1)',
                    }}
                    onClick={() => copy(name)}
                    title="复制组件名">
                    <Component size={22} />
                    <span style={{
                      fontSize: 11, color: 'var(--text-2)', textAlign: 'center',
                      wordBreak: 'break-all', lineHeight: 1.25,
                    }}>{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const generalDocs: DocDef[] = [button, togglebutton, icon];
