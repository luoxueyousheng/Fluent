/* 文档数据:导航 — SelectorBar / Tabs / TabView / Breadcrumb / Steps / Pagination */
import { useState } from 'react';
import {
  Breadcrumb, Button, CommandBar, Icon, MenuBar, Pagination, SelectorBar, Steps, TabPanel, Tabs, TabView,
  useToast,
} from '@fluent-react/ui';
import type { DocDef } from '../types';

const selectorbar: DocDef = {
  key: 'selectorbar',
  name: 'SelectorBar',
  cn: '选择栏',
  description:
    'WinUI 3 SelectorBar:一组 40px 平铺项(图标 + 文字),底部 3px 圆角指示条按 Point 缓动滑向选中项(宽度 = 项宽 − 24)。用于页面级少量视图切换;项多或需承载内容面板时用 Tabs。',
  importCode: `import { SelectorBar, type SelectorBarItemDef } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <SelectorBarDemo />,
      code: `
import { useState } from 'react';
import { SelectorBar, Icon } from '@fluent-react/ui';

export function SelectorBarExample() {
  const [v, setV] = useState('recent');
  return (
    <SelectorBar value={v} onChange={setV} aria-label="视图"
      items={[
        { key: 'recent', label: '最近', icon: <Icon name="calendar" size={14} strokeWidth={1.3} /> },
        { key: 'shared', label: '共享', icon: <Icon name="layers" size={14} strokeWidth={1.3} /> },
        { key: 'fav', label: '收藏', icon: <Icon name="home" size={14} strokeWidth={1.3} /> },
      ]} />
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: 'SelectorBarItemDef[]', description: '选择项:{ key, label?, icon?, disabled? }。' },
    { name: 'value', type: 'string', description: '受控选中键(必填)。' },
    { name: 'aria-label', type: 'string', description: '无障碍名称。' },
  ],
  events: [
    { name: 'onChange', type: '(key: string) => void', description: '选中变化;方向键 / Home / End 也会触发(自动跳过禁用项)。' },
  ],
};

function SelectorBarDemo() {
  const [v, setV] = useState('recent');
  return (
    <SelectorBar value={v} onChange={setV} aria-label="视图"
      items={[
        { key: 'recent', label: '最近', icon: <Icon name="calendar" size={14} strokeWidth={1.3} /> },
        { key: 'shared', label: '共享', icon: <Icon name="layers" size={14} strokeWidth={1.3} /> },
        { key: 'fav', label: '收藏', icon: <Icon name="home" size={14} strokeWidth={1.3} /> },
      ]} />
  );
}

const tabs: DocDef = {
  key: 'tabs',
  name: 'Tabs',
  cn: '标签页',
  description:
    '内容区视图切换。underline 变体为 WinUI 3 SelectorBar 风格(短横杠指示条只覆盖内容宽度);underline-compact 适合卡片内分区;segmented / segmented-accent 为分段控件形态。配合 TabPanel 承载面板(切换带滑入动效)。',
  importCode: `import { Tabs, TabPanel } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <TabsDemo />,
      code: `
import { useState } from 'react';
import { Tabs, TabPanel } from '@fluent-react/ui';

export function TabsExample() {
  const [v, setV] = useState('a');
  return (
    <>
      <Tabs value={v} onChange={setV} aria-label="示例标签"
            items={[{ key: 'a', label: '概览' }, { key: 'b', label: '详情' }, { key: 'c', label: '设置', disabled: true }]} />
      <TabPanel active={v === 'a'}>概览内容:项目运行正常。</TabPanel>
      <TabPanel active={v === 'b'}>详情内容:32 个组件,11 个分类。</TabPanel>
    </>
  );
}`,
    },
    {
      title: '分段控件形态',
      description: 'segmented 灰底药丸;segmented-accent 选中为主题色实底。',
      demo: <TabsSegmented />,
      code: `
import { useState } from 'react';
import { Tabs } from '@fluent-react/ui';

export function TabsSegmentedExample() {
  const [v, setV] = useState('day');
  const [v2, setV2] = useState('day');
  const items = [{ key: 'day', label: '日' }, { key: 'week', label: '周' }, { key: 'month', label: '月' }];
  return (
    <>
      <Tabs variant="segmented" value={v} onChange={setV} items={items} aria-label="分段" />
      <Tabs variant="segmented-accent" value={v2} onChange={setV2} items={items} aria-label="分段主题色" />
    </>
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: '{ key: string; label: ReactNode; disabled?: boolean }[]', description: '标签项(必填)。' },
    { name: 'value', type: 'string', description: '受控选中键(必填)。' },
    { name: 'variant', type: "'underline' | 'underline-compact' | 'segmented' | 'segmented-accent'", default: "'underline'", description: '形态变体。' },
  ],
  events: [
    { name: 'onChange', type: '(key: string) => void', description: '切换回调。' },
  ],
  extraApis: [
    {
      title: 'TabPanel Props',
      rows: [
        { name: 'active', type: 'boolean', description: '是否为当前面板(激活时重放滑入动效)。' },
        { name: 'children', type: 'ReactNode', description: '面板内容。' },
      ],
    },
  ],
};

function TabsDemo() {
  const [v, setV] = useState('a');
  return (
    <div style={{ width: '100%' }}>
      <Tabs value={v} onChange={setV} aria-label="示例标签"
            items={[{ key: 'a', label: '概览' }, { key: 'b', label: '详情' }, { key: 'c', label: '设置', disabled: true }]} />
      <TabPanel active={v === 'a'}><p style={{ color: 'var(--text-2)', padding: '10px 2px' }}>概览内容:项目运行正常。</p></TabPanel>
      <TabPanel active={v === 'b'}><p style={{ color: 'var(--text-2)', padding: '10px 2px' }}>详情内容:32 个组件,11 个分类。</p></TabPanel>
    </div>
  );
}
function TabsSegmented() {
  const [v, setV] = useState('day');
  const [v2, setV2] = useState('day');
  const items = [{ key: 'day', label: '日' }, { key: 'week', label: '周' }, { key: 'month', label: '月' }];
  return (
    <>
      <Tabs variant="segmented" value={v} onChange={setV} items={items} aria-label="分段" />
      <Tabs variant="segmented-accent" value={v2} onChange={setV2} items={items} aria-label="分段主题色" />
    </>
  );
}

const tabview: DocDef = {
  key: 'tabview',
  name: 'TabView',
  cn: '多文档标签',
  description:
    'WinUI TabView:浏览器式可关闭标签条 + 内容区,标签梯形隆起、悬停浮现关闭键;onAdd 提供「+」新建钮。适合多文档 / 多会话界面。',
  importCode: `import { TabView } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <TabViewDemo />,
      code: `
import { useState } from 'react';
import { TabView } from '@fluent-react/ui';

export function TabViewExample() {
  const [tabs, setTabs] = useState([
    { key: 't1', label: '文档 1' },
    { key: 't2', label: '文档 2' },
  ]);
  const [cur, setCur] = useState('t1');
  const [seq, setSeq] = useState(3); // 新建标签的自增序号

  // 关闭标签:至少保留一个;若关闭的是当前标签,切到剩余首个
  const close = (k: string) => {
    const next = tabs.filter((t) => t.key !== k);
    if (!next.length) return;
    setTabs(next);
    if (cur === k) setCur(next[0].key);
  };

  // 新建标签并立即切换过去
  const add = () => {
    setTabs([...tabs, { key: \`t\${seq}\`, label: \`文档 \${seq}\` }]);
    setCur(\`t\${seq}\`);
    setSeq(seq + 1);
  };

  return (
    <TabView items={tabs} value={cur} onChange={setCur} onClose={close} onAdd={add}>
      <p className="p-3">
        {tabs.find((t) => t.key === cur)?.label} 的内容
      </p>
    </TabView>
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: '{ key: string; label: string; icon?: ReactNode }[]', description: '标签数组(必填)。' },
    { name: 'value', type: 'string', description: '受控当前标签键(必填)。' },
    { name: 'children', type: 'ReactNode', description: '内容区(通常按 value 自行切换)。' },
  ],
  events: [
    { name: 'onChange', type: '(key: string) => void', description: '切换标签。' },
    { name: 'onClose', type: '(key: string) => void', description: '点击关闭键;不传则不渲染关闭键。' },
    { name: 'onAdd', type: '() => void', description: '点击「+」;不传则不渲染新建钮。' },
  ],
};

function TabViewDemo() {
  const [tabs, setTabs] = useState([{ key: 't1', label: '文档 1' }, { key: 't2', label: '文档 2' }]);
  const [cur, setCur] = useState('t1');
  const [seq, setSeq] = useState(3);
  const close = (k: string) => {
    const next = tabs.filter((t) => t.key !== k);
    if (!next.length) return;
    setTabs(next);
    if (cur === k) setCur(next[0].key);
  };
  return (
    <div style={{ width: '100%' }}>
      <TabView items={tabs} value={cur} onChange={setCur} onClose={close}
               onAdd={() => { setTabs([...tabs, { key: `t${seq}`, label: `文档 ${seq}` }]); setCur(`t${seq}`); setSeq(seq + 1); }}>
        <p style={{ color: 'var(--text-2)', padding: 12 }}>
          {tabs.find((t) => t.key === cur)?.label} 的内容
        </p>
      </TabView>
    </div>
  );
}

const commandbar: DocDef = {
  key: 'commandbar',
  name: 'CommandBar',
  cn: '命令栏',
  description:
    'WinUI CommandBar:主命令平铺为图标+文字的弱化按钮(可插竖分隔线),次命令经 secondaryItems 常驻收进「…」溢出菜单(Primary / Secondary Commands 语义,不做自动测宽)。工具窗顶部的操作条。',
  importCode: `import { CommandBar } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <CommandBarDemo />,
      code: `
import { CommandBar, Icon, useToast } from '@fluent-react/ui';

export function CommandBarExample() {
  const toast = useToast();
  // 主命令与溢出菜单项统一走 onAction,按 key 分发
  const run = (k: string) => toast({ level: 'info', title: '命令', message: \`执行:\${k}\` });
  return (
    <CommandBar onAction={run} aria-label="示例命令栏"
      items={[
        { key: 'add', label: '新建', icon: <Icon name="add" size={14} strokeWidth={1.6} /> },
        { key: 'upload', label: '导入', icon: <Icon name="upload" size={14} strokeWidth={1.4} /> },
        { key: 'd1', divider: true },
        { key: 'del', label: '删除', danger: true, icon: <Icon name="close" size={14} strokeWidth={1.4} /> },
      ]}
      secondaryItems={[
        { key: 'rename', label: '重命名' },
        { key: 'export', label: '导出为…' },
        { key: 'd', divider: true },
        { key: 'settings', label: '选项' },
      ]} />
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: 'CommandItemDef[]', description: '主命令:{ key, label?, icon?, disabled?, danger?, divider? }。' },
    { name: 'secondaryItems', type: 'MenuItemDef[]', description: '次命令,收进「…」菜单;不传则不渲染溢出钮。' },
  ],
  events: [
    { name: 'onAction', type: '(key: string) => void', description: '主命令点击或溢出菜单项点击。' },
  ],
};

function CommandBarDemo() {
  const toast = useToast();
  const run = (k: string) => toast({ level: 'info', title: '命令', message: `执行:${k}` });
  return (
    <CommandBar onAction={run} aria-label="示例命令栏"
      items={[
        { key: 'add', label: '新建', icon: <Icon name="add" size={14} strokeWidth={1.6} /> },
        { key: 'upload', label: '导入', icon: <Icon name="upload" size={14} strokeWidth={1.4} /> },
        { key: 'd1', divider: true },
        { key: 'del', label: '删除', danger: true, icon: <Icon name="close" size={14} strokeWidth={1.4} /> },
      ]}
      secondaryItems={[
        { key: 'rename', label: '重命名' },
        { key: 'export', label: '导出为…' },
        { key: 'd', divider: true },
        { key: 'settings', label: '选项' },
      ]} />
  );
}

const menubar: DocDef = {
  key: 'menubar',
  name: 'MenuBar',
  cn: '菜单栏',
  description:
    '应用菜单栏(文件 / 编辑 / 查看):点击展开下拉菜单,展开状态下悬停其他标签即时切换(经典桌面行为);菜单 portal 到 body(z-850),页面滚动立即收起。通常放在标题栏下方或工具区顶部。',
  importCode: `import { MenuBar } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      description: '先点开任一菜单,再横向滑过其他标签体验切换。',
      demo: <MenuBarDemo />,
      code: `
import { MenuBar, useToast } from '@fluent-react/ui';

export function MenuBarExample() {
  const toast = useToast();
  return (
    <MenuBar
      onAction={(itemKey, menuKey) => toast({ level: 'info', title: '菜单', message: \`\${menuKey} → \${itemKey}\` })}
      menus={[
        { key: 'file', label: '文件', items: [
          { key: 'open', label: '打开…' },
          { key: 'save', label: '保存' },
          { key: 'd', divider: true },
          { key: 'exit', label: '退出' },
        ]},
        { key: 'edit', label: '编辑', items: [
          { key: 'undo', label: '撤销' },
          { key: 'copy', label: '复制' },
        ]},
        { key: 'view', label: '查看', items: [
          { key: 'zoom', label: '缩放' },
          { key: 'theme', label: '切换主题' },
        ]},
      ]} />
  );
}`,
    },
  ],
  props: [
    { name: 'menus', type: '{ key, label, items: MenuItemDef[] }[]', description: '顶级菜单数组(必填)。' },
  ],
  events: [
    { name: 'onAction', type: '(itemKey: string, menuKey: string) => void', description: '菜单项点击,附所属顶级菜单键。' },
  ],
};

function MenuBarDemo() {
  const toast = useToast();
  return (
    <MenuBar onAction={(item, menu) => toast({ level: 'info', title: '菜单', message: `${menu} → ${item}` })}
      menus={[
        {
          key: 'file', label: '文件',
          items: [
            { key: 'open', label: '打开…' }, { key: 'save', label: '保存' },
            { key: 'd', divider: true }, { key: 'exit', label: '退出' },
          ],
        },
        { key: 'edit', label: '编辑', items: [{ key: 'undo', label: '撤销' }, { key: 'copy', label: '复制' }] },
        { key: 'view', label: '查看', items: [{ key: 'zoom', label: '缩放' }, { key: 'theme', label: '切换主题' }] },
      ]} />
  );
}

const breadcrumb: DocDef = {
  key: 'breadcrumb',
  name: 'Breadcrumb',
  cn: '面包屑',
  description:
    '层级路径导航:末项为当前页(加粗、不可点),其余项可点击回跳,chevron 分隔。',
  importCode: `import { Breadcrumb } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <BreadcrumbDemo />,
      code: `
import { Breadcrumb, useToast } from '@fluent-react/ui';

export function BreadcrumbExample() {
  const toast = useToast();
  return (
    <Breadcrumb
      items={[
        { key: 'home', label: '首页' },
        { key: 'docs', label: '文档' },
        { key: 'button', label: 'Button' },
      ]}
      onNavigate={(k) => toast({ level: 'info', title: '导航', message: \`跳转:\${k}\` })} />
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: '{ key: string; label: ReactNode }[]', description: '路径项,末项视为当前页。' },
  ],
  events: [
    { name: 'onNavigate', type: '(key: string) => void', description: '点击非末项时回调。' },
  ],
};

function BreadcrumbDemo() {
  const toast = useToast();
  return (
    <Breadcrumb items={[{ key: 'home', label: '首页' }, { key: 'docs', label: '文档' }, { key: 'button', label: 'Button' }]}
                onNavigate={(k) => toast({ level: 'info', title: '导航', message: `跳转:${k}` })} />
  );
}

const steps: DocDef = {
  key: 'steps',
  name: 'Steps',
  cn: '步骤条',
  description:
    '引导流程进度:已完成打勾、当前 accent 高亮、未到达灰点,antd API(current + items)。',
  importCode: `import { Steps } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <StepsDemo />,
      code: `
import { useState } from 'react';
import { Button, Steps } from '@fluent-react/ui';

export function StepsExample() {
  const [cur, setCur] = useState(1);
  return (
    <div className="flex flex-col gap-4">
      <Steps current={cur}
             items={[
               { title: '填写信息', description: '基础资料' },
               { title: '验证', description: '邮箱验证码' },
               { title: '完成' },
             ]} />
      <div className="flex gap-2">
        <Button size="small" disabled={cur === 0} onClick={() => setCur(cur - 1)}>上一步</Button>
        <Button size="small" variant="accent" disabled={cur === 2} onClick={() => setCur(cur + 1)}>下一步</Button>
      </div>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'current', type: 'number', default: '0', description: '当前步骤序号(0 起)。' },
    { name: 'items', type: '{ title: ReactNode; description?: ReactNode }[]', description: '步骤数组(必填)。' },
  ],
};

function StepsDemo() {
  const [cur, setCur] = useState(1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <Steps current={cur}
             items={[{ title: '填写信息', description: '基础资料' }, { title: '验证', description: '邮箱验证码' }, { title: '完成' }]} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="small" disabled={cur === 0} onClick={() => setCur(cur - 1)}>上一步</Button>
        <Button size="small" variant="accent" disabled={cur === 2} onClick={() => setCur(cur + 1)}>下一步</Button>
      </div>
    </div>
  );
}

const pagination: DocDef = {
  key: 'pagination',
  name: 'Pagination',
  cn: '分页',
  description:
    '长列表分页,antd 同款省略算法:最多 7 个页码钮,当前页两侧各留 2,「…」可 ±5 跳页;showSizeChanger 附带每页条数切换。',
  importCode: `import { Pagination } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <Pagination defaultCurrent={1} total={85} />,
      code: `
import { Pagination } from '@fluent-react/ui';

export function PaginationExample() {
  return (
    <Pagination defaultCurrent={1} total={85} />
  );
}`,
    },
    {
      title: '长列表与条数切换',
      demo: <Pagination defaultCurrent={6} total={500} showSizeChanger />,
      code: `
import { Pagination } from '@fluent-react/ui';

export function PaginationSizeChangerExample() {
  return (
    <Pagination defaultCurrent={6} total={500} showSizeChanger />
  );
}`,
    },
  ],
  props: [
    { name: 'current / defaultCurrent', type: 'number', default: '— / 1', description: '受控 / 非受控当前页(1 起)。' },
    { name: 'total', type: 'number', description: '总条数(必填)。' },
    { name: 'pageSize', type: 'number', default: 'pageSizeOptions[0]', description: '每页条数。' },
    { name: 'showSizeChanger', type: 'boolean', default: 'false', description: '显示每页条数下拉。' },
    { name: 'pageSizeOptions', type: 'number[]', default: '[10, 20, 50]', description: '条数候选。' },
  ],
  events: [
    { name: 'onChange', type: '(page: number, pageSize: number) => void', description: '页码或条数变化。' },
  ],
};

export const navigationDocs: DocDef[] = [selectorbar, tabs, tabview, commandbar, menubar, breadcrumb, steps, pagination];
