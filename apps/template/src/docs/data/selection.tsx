/* 文档数据:选择 — ComboBox / ListBox / Dropdown / Tree */
import { useState } from 'react';
import {
  Button, ComboBox, ContextMenuArea, DropDownButton, Icon, ListBox, MultiSelect, Tree,
  useToast, type MenuItemDef, type TreeDataNode,
} from '@fluent-react/ui';
import type { DocDef } from '../types';

const CITY = [
  { value: 'bj', label: '北京' }, { value: 'sh', label: '上海' },
  { value: 'gz', label: '广州' }, { value: 'sz', label: '深圳' }, { value: 'cd', label: '成都' },
];

const MENU: MenuItemDef[] = [
  { key: 'open', label: '打开', icon: <Icon name="file" size={14} strokeWidth={1.3} /> },
  { key: 'copy', label: '复制', icon: <Icon name="copy" size={14} strokeWidth={1.3} /> },
  { key: 'd1', divider: true },
  { key: 'del', label: '删除', danger: true, icon: <Icon name="close" size={14} strokeWidth={1.3} /> },
];

const TREE: TreeDataNode[] = [
  {
    key: 'src', title: 'src',
    children: [
      { key: 'components', title: 'components', children: [{ key: 'button', title: 'Button.tsx' }, { key: 'combo', title: 'ComboBox.tsx' }] },
      { key: 'styles', title: 'styles', children: [{ key: 'theme', title: 'theme.css' }] },
      { key: 'index', title: 'index.ts' },
    ],
  },
  { key: 'pkg', title: 'package.json' },
];

const combobox: DocDef = {
  key: 'combobox',
  name: 'ComboBox',
  cn: '组合框',
  description:
    '组合框在候选列表中单选一项。打开定位复刻 WinUI 3:浮层上移覆盖触发器、选中项与控件原位中线对齐、长列表先滚中、视口 8px 钳制;选项行为 JadeDemo 风格(选中项左缘 accent 竖杠)。仅从候选中取值,自由输入用 AutoSuggest。',
  importCode: `import { ComboBox } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <ComboBox options={CITY} defaultValue="sh" aria-label="城市" />
          <ComboBox options={CITY} placeholder="请选择城市" aria-label="城市空值" />
        </>
      ),
      code: `
import { ComboBox } from '@fluent-react/ui';

const options = [
  { value: 'bj', label: '北京' },
  { value: 'sh', label: '上海' },
  { value: 'gz', label: '广州' },
  { value: 'sz', label: '深圳' },
];

export function ComboBoxBasicExample() {
  return (
    <>
      <ComboBox options={options} defaultValue="sh" aria-label="城市" />
      <ComboBox options={options} placeholder="请选择城市" aria-label="城市空值" />
    </>
  );
}`,
    },
    {
      title: '受控与状态',
      demo: <ComboControlled />,
      code: `
import { useState } from 'react';
import { ComboBox } from '@fluent-react/ui';

const options = [
  { value: 'bj', label: '北京' },
  { value: 'sh', label: '上海' },
  { value: 'gz', label: '广州' },
  { value: 'sz', label: '深圳' },
];

export function ComboBoxControlledExample() {
  const [value, setValue] = useState<string | null>(null);
  // 空值时给 warning 描边提示,选中后恢复
  return (
    <ComboBox
      options={options}
      value={value}
      onChange={setValue}
      status={value ? undefined : 'warning'}
      aria-label="受控城市"
    />
  );
}`,
    },
  ],
  props: [
    { name: 'options', type: '{ value: string; label: ReactNode }[]', description: '候选项(必填)。' },
    { name: 'value / defaultValue', type: 'string | null', default: 'null', description: '受控 / 非受控选中值。' },
    { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '三档高度。' },
    { name: 'status', type: "'error' | 'warning'", description: '校验状态描边。' },
    { name: 'placeholder', type: 'string', default: "'请选择'", description: '空值占位。' },
  ],
  events: [
    { name: 'onChange', type: '(value: string) => void', description: '选中变化回调。' },
  ],
};

function ComboControlled() {
  const [v, setV] = useState<string | null>(null);
  return <ComboBox options={CITY} value={v} onChange={setV} status={v ? undefined : 'warning'} aria-label="受控城市" />;
}

const multiselect: DocDef = {
  key: 'multiselect',
  name: 'MultiSelect',
  cn: '多选组合框',
  description:
    '在候选中勾选多项(antd Select mode="multiple" 规范):触发器内平铺已选 Tag(可单独摘除,maxTagCount 收纳为 +N),下拉为勾选行、点选不关闭浮层;浮层 portal 到 body 随触发器宽。单选场景用 ComboBox。',
  importCode: `import { MultiSelect } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <MultiSelectDemo />,
      code: `
import { useState } from 'react';
import { MultiSelect } from '@fluent-react/ui';

const options = [
  { value: 'bj', label: '北京' },
  { value: 'sh', label: '上海' },
  { value: 'gz', label: '广州' },
  { value: 'sz', label: '深圳' },
];

export function MultiSelectBasicExample() {
  const [values, setValues] = useState<string[]>(['bj', 'sh']);
  return (
    <MultiSelect
      options={options}
      value={values}
      onChange={setValues}
      placeholder="选择城市"
      aria-label="城市多选"
    />
  );
}`,
    },
    {
      title: 'Tag 收纳',
      description: 'maxTagCount 控制平铺上限,超出折叠为 +N。',
      demo: <MultiSelect options={CITY} defaultValue={['bj', 'sh', 'gz', 'sz']} maxTagCount={2} aria-label="收纳示例" />,
      code: `
import { MultiSelect } from '@fluent-react/ui';

const options = [
  { value: 'bj', label: '北京' },
  { value: 'sh', label: '上海' },
  { value: 'gz', label: '广州' },
  { value: 'sz', label: '深圳' },
];

export function MultiSelectMaxTagExample() {
  // 平铺 Tag 上限为 2,其余收纳为 +N
  return (
    <MultiSelect
      options={options}
      defaultValue={['bj', 'sh', 'gz', 'sz']}
      maxTagCount={2}
      aria-label="收纳示例"
    />
  );
}`,
    },
  ],
  props: [
    { name: 'options', type: '{ value: string; label: ReactNode }[]', description: '候选项(必填)。' },
    { name: 'value / defaultValue', type: 'string[]', default: '[]', description: '受控 / 非受控选中集。' },
    { name: 'maxTagCount', type: 'number', description: '触发器内平铺 Tag 上限,超出收纳为 +N。' },
    { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '三档最小高度(Tag 多时自动换行长高)。' },
    { name: 'status', type: "'error' | 'warning'", description: '校验状态描边。' },
    { name: 'placeholder', type: 'string', default: "'请选择'", description: '空集占位。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
  ],
  events: [
    { name: 'onChange', type: '(values: string[]) => void', description: '勾选/摘除任一项时回调完整选中集。' },
  ],
};

function MultiSelectDemo() {
  const [v, setV] = useState<string[]>(['bj', 'sh']);
  return <MultiSelect options={CITY} value={v} onChange={setV} placeholder="选择城市" aria-label="城市多选" />;
}

const listbox: DocDef = {
  key: 'listbox',
  name: 'ListBox',
  cn: '列表框',
  description:
    '平铺可视的选择列表(选项常驻,不收进浮层),选中项左缘 accent 竖杠。multi 开启多选(点击切换,值为数组);方向键移动光标、空格/回车切换。',
  importCode: `import { ListBox } from '@fluent-react/ui';`,
  sections: [
    {
      title: '单选',
      demo: <ListSingle />,
      code: `
import { useState } from 'react';
import { ListBox } from '@fluent-react/ui';

const items = [
  { value: 'bj', label: '北京' },
  { value: 'sh', label: '上海' },
  { value: 'gz', label: '广州' },
  { value: 'sz', label: '深圳' },
];

export function ListBoxSingleExample() {
  const [value, setValue] = useState<string | null>('sh');
  return (
    <div className="w-[200px]">
      <ListBox items={items} value={value} onChange={setValue} />
    </div>
  );
}`,
    },
    {
      title: '多选',
      description: 'multi 下 value 为 string[],点击即切换选中。',
      demo: <ListMulti />,
      code: `
import { useState } from 'react';
import { ListBox } from '@fluent-react/ui';

const items = [
  { value: 'bj', label: '北京' },
  { value: 'sh', label: '上海' },
  { value: 'gz', label: '广州' },
  { value: 'sz', label: '深圳' },
];

export function ListBoxMultiExample() {
  // multi 模式:值与回调均为 string[]
  const [values, setValues] = useState<string[]>(['bj']);
  return (
    <div className="w-[200px]">
      <ListBox multi items={items} value={values} onChange={setValues} />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: '{ value: string; label: ReactNode; icon?: ReactNode }[]', description: '列表项(必填)。' },
    { name: 'multi', type: 'boolean', default: 'false', description: '多选模式(值与回调随之变为数组)。' },
    { name: 'value', type: 'string | null | string[]', description: '受控选中值(必填;multi 时为数组)。' },
  ],
  events: [
    { name: 'onChange', type: '(value: string | string[]) => void', description: '选中变化(签名随 multi 切换)。' },
  ],
};

function ListSingle() {
  const [v, setV] = useState<string | null>('sh');
  return <div style={{ width: 200 }}><ListBox items={CITY} value={v} onChange={setV} /></div>;
}
function ListMulti() {
  const [v, setV] = useState<string[]>(['bj']);
  return <div style={{ width: 200 }}><ListBox multi items={CITY} value={v} onChange={setV} /></div>;
}

const dropdown: DocDef = {
  key: 'dropdown',
  name: 'Dropdown',
  cn: '下拉菜单',
  description:
    '菜单族三件套:DropDownButton 按钮触发菜单(split 分裂为主操作 + 独立箭头);ContextMenuArea 包住任意区域接管右键;MenuList 为裸菜单浮层,配合 useFlyout 自组。菜单项统一用 MenuItemDef(divider 分隔、danger 红字)。',
  importCode: `import { DropDownButton, ContextMenuArea, MenuList, useFlyout } from '@fluent-react/ui';`,
  sections: [
    {
      title: 'DropDownButton',
      description: 'split 形态:左半段直接执行主操作,右侧箭头展开菜单。',
      demo: <DropdownDemo />,
      code: `
import { DropDownButton, Icon, useToast, type MenuItemDef } from '@fluent-react/ui';

const items: MenuItemDef[] = [
  { key: 'open', label: '打开', icon: <Icon name="file" size={14} strokeWidth={1.3} /> },
  { key: 'copy', label: '复制', icon: <Icon name="copy" size={14} strokeWidth={1.3} /> },
  { key: 'd1', divider: true }, // divider 渲染为分隔线
  { key: 'del', label: '删除', danger: true, icon: <Icon name="close" size={14} strokeWidth={1.3} /> },
];

export function DropDownButtonExample() {
  const toast = useToast();
  const run = (key: string) => toast({ level: 'info', title: '菜单', message: \`执行:\${key}\` });
  return (
    <>
      <DropDownButton label="操作" items={items} onPick={run} />
      {/* split 分裂按钮:左半段直接执行主操作,右侧箭头展开菜单 */}
      <DropDownButton
        split
        label="运行"
        variant="accent"
        items={items}
        onClick={() => run('default')}
        onPick={run}
      />
    </>
  );
}`,
    },
    {
      title: '右键菜单',
      description: 'ContextMenuArea 在包裹区域内接管 contextmenu,菜单在指针位置弹出。',
      demo: <CtxDemo />,
      code: `
import { ContextMenuArea, Icon, useToast, type MenuItemDef } from '@fluent-react/ui';

const items: MenuItemDef[] = [
  { key: 'open', label: '打开', icon: <Icon name="file" size={14} strokeWidth={1.3} /> },
  { key: 'copy', label: '复制', icon: <Icon name="copy" size={14} strokeWidth={1.3} /> },
  { key: 'd1', divider: true },
  { key: 'del', label: '删除', danger: true, icon: <Icon name="close" size={14} strokeWidth={1.3} /> },
];

export function ContextMenuAreaExample() {
  const toast = useToast();
  return (
    <ContextMenuArea
      items={items}
      onPick={(key) => toast({ level: 'info', title: '右键菜单', message: \`执行:\${key}\` })}
    >
      <div className="py-7 px-12 border border-dashed border-(--stroke) rounded-lg text-(--text-2)">
        在此区域右键
      </div>
    </ContextMenuArea>
  );
}`,
    },
  ],
  props: [
    { name: 'label', type: 'ReactNode', description: '按钮文本(DropDownButton)。' },
    { name: 'items', type: 'MenuItemDef[]', description: '菜单项(必填)。' },
    { name: 'variant', type: "'default' | 'accent' | 'subtle'", default: "'default'", description: '按钮变体。' },
    { name: 'split', type: 'boolean', default: 'false', description: '分裂按钮:主操作与菜单箭头分离。' },
  ],
  events: [
    { name: 'onPick', type: '(key: string) => void', description: '菜单项点击。' },
    { name: 'onClick', type: '() => void', description: 'split 形态左半段主操作。' },
  ],
  extraApis: [
    {
      title: 'MenuItemDef',
      rows: [
        { name: 'key', type: 'string', description: '唯一键(必填)。' },
        { name: 'label', type: 'ReactNode', description: '菜单文本。' },
        { name: 'icon', type: 'ReactNode', description: '前置图标。' },
        { name: 'divider', type: 'boolean', description: '渲染为分隔线(忽略其余字段)。' },
        { name: 'disabled', type: 'boolean', description: '禁用项。' },
        { name: 'danger', type: 'boolean', description: '危险项红字。' },
      ],
    },
    {
      title: 'ContextMenuArea Props',
      rows: [
        { name: 'items', type: 'MenuItemDef[]', description: '菜单项。' },
        { name: 'onPick', type: '(key: string) => void', description: '菜单项点击。', },
        { name: 'children', type: 'ReactNode', description: '接管右键的区域内容。' },
      ],
    },
  ],
};

function DropdownDemo() {
  const toast = useToast();
  const run = (k: string) => toast({ level: 'info', title: '菜单', message: `执行:${k}` });
  return (
    <>
      <DropDownButton label="操作" items={MENU} onPick={run} />
      <DropDownButton split label="运行" variant="accent" items={MENU} onClick={() => run('default')} onPick={run} />
    </>
  );
}
function CtxDemo() {
  const toast = useToast();
  return (
    <ContextMenuArea items={MENU} onPick={(k) => toast({ level: 'info', title: '右键菜单', message: `执行:${k}` })}>
      <div style={{ padding: '28px 48px', border: '1px dashed var(--stroke)', borderRadius: 8, color: 'var(--text-2)' }}>
        在此区域右键
      </div>
    </ContextMenuArea>
  );
}

const tree: DocDef = {
  key: 'tree',
  name: 'Tree',
  cn: '树形控件',
  description:
    '层级数据展示与选择,antd API(treeData / expandedKeys / selectedKeys 受控或非受控),WinUI TreeView 形态:选中行药丸底色、chevron 旋转过渡。',
  importCode: `import { Tree, type TreeDataNode } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <TreeDemo />,
      code: `
import { Tree, useToast, type TreeDataNode } from '@fluent-react/ui';

const treeData: TreeDataNode[] = [
  {
    key: 'src', title: 'src',
    children: [
      { key: 'components', title: 'components', children: [
        { key: 'button', title: 'Button.tsx' },
        { key: 'combo', title: 'ComboBox.tsx' },
      ]},
      { key: 'index', title: 'index.ts' },
    ],
  },
  { key: 'pkg', title: 'package.json' },
];

export function TreeBasicExample() {
  const toast = useToast();
  return (
    <div className="w-[260px]">
      <Tree
        treeData={treeData}
        defaultExpandAll
        onSelect={(_keys, { node }) => toast({ level: 'info', title: '选中', message: String(node.title) })}
      />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'treeData', type: 'TreeDataNode[]', description: '层级数据(必填):{ key, title, children?, disabled? }。' },
    { name: 'defaultExpandAll', type: 'boolean', default: 'false', description: '初始全部展开。' },
    { name: 'expandedKeys / defaultExpandedKeys', type: 'string[]', description: '受控 / 非受控展开集。' },
    { name: 'selectedKeys / defaultSelectedKeys', type: 'string[]', description: '受控 / 非受控选中集。' },
  ],
  events: [
    { name: 'onExpand', type: '(keys: string[]) => void', description: '展开集变化。' },
    { name: 'onSelect', type: '(keys: string[], info: { node }) => void', description: '选中变化,info.node 为命中节点。' },
  ],
};

function TreeDemo() {
  const toast = useToast();
  return (
    <div style={{ width: 260 }}>
      <Tree treeData={TREE} defaultExpandAll
            onSelect={(_k, { node }) => toast({ level: 'info', title: '选中', message: String(node.title) })} />
    </div>
  );
}

export const selectionDocs: DocDef[] = [combobox, multiselect, listbox, dropdown, tree];
