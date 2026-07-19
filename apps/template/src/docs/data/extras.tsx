/* 文档数据:补齐组件 — Popconfirm / Descriptions / Result / Tour / Anchor / HotkeyInput / Cascader / Transfer / VirtualList */
import { useState } from 'react';
import {
  Button,
  Popconfirm,
  Descriptions,
  Result,
  Tour,
  Anchor,
  HotkeyInput,
  Cascader,
  Transfer,
  VirtualList,
  message,
} from '@fluent-react/ui';
import { CheckmarkCircleRegular } from '@fluent-react/icon';
import type { DocDef } from '../types';

/* ---- Popconfirm ---- */
const popconfirm: DocDef = {
  key: 'popconfirm',
  name: 'Popconfirm',
  cn: '气泡确认',
  description: '轻量气泡确认(基于 Popover):锚点旁弹出,比 Modal.confirm 更轻,适合单条删除、状态切换等低风险确认。',
  importCode: `import { Popconfirm } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <Popconfirm title="确定删除?" onConfirm={() => message.success('已删除')}>
          <Button danger>删除</Button>
        </Popconfirm>
      ),
      code: `
import { Button, Popconfirm, message } from '@fluent-react/ui';

export function PopconfirmExample() {
  return (
    <Popconfirm title="确定删除?" onConfirm={() => message.success('已删除')}>
      <Button danger>删除</Button>
    </Popconfirm>
  );
}`,
    },
    {
      title: '带描述与定制按钮',
      description: 'description 补充说明;okText/cancelText 自定义文案;okDanger 标红确定钮。',
      demo: (
        <Popconfirm title="永久注销?" description="注销后所有数据将被删除且无法恢复。"
          okText="注销" cancelText="再想想" okDanger onConfirm={() => message.success('已注销')}>
          <Button danger>注销账户</Button>
        </Popconfirm>
      ),
      code: `
import { Button, Popconfirm, message } from '@fluent-react/ui';

export function PopconfirmDangerExample() {
  return (
    <Popconfirm title="永久注销?" description="注销后所有数据将被删除且无法恢复。"
      okText="注销" cancelText="再想想" okDanger onConfirm={() => message.success('已注销')}>
      <Button danger>注销账户</Button>
    </Popconfirm>
  );
}`,
    },
    {
      title: '受控开合',
      description: 'open/onOpenChange 受控;defaultOpen 挂载即展开。',
      demo: <PopconfirmControlled />,
      code: `
import { useState } from 'react';
import { Button, Popconfirm, message } from '@fluent-react/ui';

export function PopconfirmControlledExample() {
  const [open, setOpen] = useState(false);
  return (
    <Popconfirm open={open} onOpenChange={setOpen} title="确认操作?"
      onCancel={() => message.info('已取消')} onConfirm={() => message.success('已确认')}>
      <Button onClick={() => setOpen(true)}>程序触发</Button>
    </Popconfirm>
  );
}`,
    },
  ],
  props: [
    { name: 'title', type: 'ReactNode', description: '确认标题(必填)。' },
    { name: 'description', type: 'ReactNode', description: '辅助说明。' },
    { name: 'okText / cancelText', type: 'string', default: "'确定' / '取消'", description: '按钮文案。' },
    { name: 'okDanger', type: 'boolean', default: 'false', description: '确定钮红色。' },
    { name: 'icon', type: 'ReactNode | false', description: '自定义图标;false 隐藏。' },
    { name: 'open / defaultOpen', type: 'boolean', description: '受控 / 非受控开合。' },
    { name: 'children', type: 'ReactNode', description: '锚点元素。' },
  ],
  events: [
    { name: 'onConfirm', type: '() => void', description: '确定回调。' },
    { name: 'onCancel', type: '() => void', description: '取消回调(含 Esc/外点)。' },
    { name: 'onOpenChange', type: '(open: boolean) => void', description: '开合变化。' },
  ],
};

function PopconfirmControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Popconfirm open={open} onOpenChange={setOpen} title="确认操作?" onConfirm={() => message.success('已确认')}>
      <Button onClick={() => setOpen(true)}>程序触发</Button>
    </Popconfirm>
  );
}

/* ---- Descriptions ---- */
const descriptions: DocDef = {
  key: 'descriptions',
  name: 'Descriptions',
  cn: '描述列表',
  description: '键值对展示(antd API):适合详情页;bordered 加分割线,column 控制列数,size 三档。',
  importCode: `import { Descriptions } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <Descriptions size="middle" title="用户信息" items={[
          { label: '用户名', children: '张三' },
          { label: '手机号', children: '138****8888' },
          { label: '邮箱', children: 'zhangsan@example.com' },
          { label: '地址', children: '北京市海淀区' },
          { label: '注册时间', children: '2026-01-15' },
          { label: '状态', children: '已认证' },
        ]} />
      ),
      code: `
import { Descriptions } from '@fluent-react/ui';

export function DescriptionsExample() {
  return (
    <Descriptions size="middle" title="用户信息" items={[
      { label: '用户名', children: '张三' },
      { label: '手机号', children: '138****8888' },
      { label: '邮箱', children: 'zhangsan@example.com' },
      { label: '地址', children: '北京市海淀区' },
      { label: '注册时间', children: '2026-01-15' },
      { label: '状态', children: '已认证' },
    ]} />
  );
}`,
    },
    {
      title: '带边框与跨列',
      demo: (
        <Descriptions bordered column={2} title="产品信息" items={[
          { label: '产品名称', children: 'Fluent React', span: 2 },
          { label: '版本', children: 'v0.1.0' },
          { label: '许可证', children: 'MIT' },
        ]} />
      ),
      code: `
import { Descriptions } from '@fluent-react/ui';

export function DescriptionsBorderedExample() {
  return (
    <Descriptions bordered column={2} title="产品信息" items={[
      { label: '产品名称', children: 'Fluent React', span: 2 },
      { label: '版本', children: 'v0.1.0' },
      { label: '许可证', children: 'MIT' },
    ]} />
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: 'DescriptionsItem[]', description: '描述项数组(必填)。' },
    { name: 'column', type: 'number', default: '3', description: '每行列数。' },
    { name: 'title', type: 'ReactNode', description: '标题。' },
    { name: 'bordered', type: 'boolean', default: 'false', description: '带边框分割线。' },
    { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '尺寸。' },
  ],
  extraApis: [
    {
      title: 'DescriptionsItem',
      rows: [
        { name: 'label', type: 'ReactNode', description: '标签(必填)。' },
        { name: 'children', type: 'ReactNode', description: '内容(必填)。' },
        { name: 'span', type: 'number', default: '1', description: '跨列数。' },
      ],
    },
  ],
};

/* ---- Result ---- */
const result: DocDef = {
  key: 'result',
  name: 'Result',
  cn: '结果页',
  description: '操作结果反馈(antd API):5 种预设状态、icon + title + subTitle + extra。',
  importCode: `import { Result } from '@fluent-react/ui';`,
  sections: [
    {
      title: '各状态',
      demo: (
        <div className="flex flex-col gap-4">
          <Result status="success" title="提交成功" subTitle="你的操作已成功完成。" />
          <Result status="error" title="提交失败" subTitle="网络连接超时,请稍后重试。" extra={<Button size="small">重试</Button>} />
          <Result status="warning" title="警告" subTitle="磁盘空间不足 10%。" />
          <Result status="info" title="提示" subTitle="系统将于今晚 22:00 维护。" />
        </div>
      ),
      code: `
import { Button, Result } from '@fluent-react/ui';

export function ResultExample() {
  return (
    <div className="flex flex-col gap-4">
      <Result status="success" title="提交成功" subTitle="你的操作已成功完成。" />
      <Result status="error" title="提交失败" subTitle="网络连接超时,请稍后重试。"
              extra={<Button size="small">重试</Button>} />
      <Result status="warning" title="警告" subTitle="磁盘空间不足 10%。" />
      <Result icon={<CheckmarkCircleRegular size={48} />} status="info" title="自定义图标" subTitle="使用自定义图标。" />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'status', type: "'success' | 'error' | 'warning' | 'info' | 'empty'", default: "'info'", description: '结果状态。' },
    { name: 'title', type: 'ReactNode', description: '标题(必填)。' },
    { name: 'subTitle', type: 'ReactNode', description: '副标题。' },
    { name: 'icon', type: 'ReactNode', description: '自定义图标(覆盖 status 默认)。' },
    { name: 'extra', type: 'ReactNode', description: '操作按钮区。' },
  ],
};

/* ---- Tour ---- */
const tour: DocDef = {
  key: 'tour',
  name: 'Tour',
  cn: '引导游览',
  description: '逐步高亮页面元素并展示说明(antd API):steps 驱动,遮罩镂空,支持键盘 Esc/next/prev。',
  importCode: `import { Tour } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <TourDemo />,
      code: `
import { useState } from 'react';
import { Button, Tour } from '@fluent-react/ui';

export function TourExample() {
  const [open, setOpen] = useState(false);
  const steps = [
    { target: '#tour-start', title: '第一步', content: '点击这里开始操作。' },
    { target: '#tour-export', title: '第二步', content: '导出你的配置。', placement: 'bottom' },
    { target: '#tour-help', title: '第三步', content: '获取帮助文档。' },
  ];
  return (
    <>
      <div className="flex gap-2">
        <Button id="tour-start" variant="accent">开始</Button>
        <Button id="tour-export">导出</Button>
        <Button id="tour-help">帮助</Button>
      </div>
      <Button size="small" onClick={() => setOpen(true)}>启动引导</Button>
      <Tour steps={steps} open={open} onClose={() => setOpen(false)}
            onFinish={() => setOpen(false)} nextText="继续" prevText="返回" finishText="知道了" />
    </>
  );
}`,
    },
  ],
  props: [
    { name: 'steps', type: 'TourStep[]', description: '步骤数组(必填)。' },
    { name: 'open', type: 'boolean', description: '是否显示(必填)。' },
    { name: 'current', type: 'number', description: '当前步骤(受控,0-based)。' },
    { name: 'nextText / prevText / finishText', type: 'string', default: "'下一步' / '上一步' / '完成'", description: '按钮文案。' },
  ],
  extraApis: [
    {
      title: 'TourStep',
      rows: [
        { name: 'target', type: 'string | HTMLElement | null', description: '目标元素选择器或 DOM。' },
        { name: 'title', type: 'ReactNode', description: '步骤标题。' },
        { name: 'content', type: 'ReactNode', description: '说明内容。' },
        { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", description: '浮层方位。' },
      ],
    },
  ],
};

function TourDemo() {
  const [open, setOpen] = useState(false);
  const steps = [
    { target: '#tour-start', title: '第一步', content: '点击这里开始操作。' },
    { target: '#tour-export', title: '第二步', content: '导出你的配置。', placement: 'bottom' as const },
    { target: '#tour-help', title: '第三步', content: '获取帮助文档。' },
  ];
  return (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button id="tour-start" variant="accent">开始</Button>
        <Button id="tour-export">导出</Button>
        <Button id="tour-help">帮助</Button>
      </div>
      <Button size="small" style={{ marginTop: 12 }} onClick={() => setOpen(true)}>启动引导</Button>
      <Tour steps={steps} open={open} onClose={() => setOpen(false)} onFinish={() => setOpen(false)}
            nextText="继续" prevText="返回" finishText="知道了" />
    </>
  );
}

/* ---- Anchor ---- */
const anchor: DocDef = {
  key: 'anchor',
  name: 'Anchor',
  cn: '锚点导航',
  description: '固定侧边栏导航(antd API):滚动时高亮当前区块,affix 固定在视口,offsetTop 偏移。',
  importCode: `import { Anchor } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div className="flex gap-4">
          <Anchor activeKey="sec1" affix offsetTop={60} items={[
            { key: 'sec1', href: '#sec1-demo', title: '第一节' },
            { key: 'sec2', href: '#sec2-demo', title: '第二节' },
          ]} />
          <div className="flex-1" id="sec1-demo" style={{ minHeight: 120, padding: 12, background: 'var(--layer)', borderRadius: 4 }}>
            <h3>第一节</h3><p>锚点导航会高亮当前区块。</p>
          </div>
        </div>
      ),
      code: `
import { Anchor } from '@fluent-react/ui';

export function AnchorExample() {
  return (
    <Anchor activeKey="sec1" affix offsetTop={60} items={[
      { key: 'sec1', href: '#sec1', title: '第一节' },
      { key: 'sec2', href: '#sec2', title: '第二节' },
    ]} />
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: 'AnchorLink[]', description: '锚点项(必填)。' },
    { name: 'activeKey', type: 'string', description: '当前激活 key(受控)。' },
    { name: 'affix', type: 'boolean', default: 'true', description: '固定在视口。' },
    { name: 'offsetTop', type: 'number', default: '0', description: '固定时距顶部偏移。' },
  ],
  extraApis: [
    {
      title: 'AnchorLink',
      rows: [
        { name: 'key', type: 'string', description: '唯一标识(必填)。' },
        { name: 'href', type: 'string', description: '目标锚点(必填)。' },
        { name: 'title', type: 'ReactNode', description: '链接文案(必填)。' },
      ],
    },
  ],
};

/* ---- HotkeyInput ---- */
const hotkeyinput: DocDef = {
  key: 'hotkeyinput',
  name: 'HotkeyInput',
  cn: '快捷键录入',
  description: '监听键盘组合并记录:value/onChange 受控,placeholder 占位,clearable 可清除,disabled 禁用。',
  importCode: `import { HotkeyInput } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <HotkeyDemo />,
      code: `
import { useState } from 'react';
import { HotkeyInput } from '@fluent-react/ui';

export function HotkeyInputExample() {
  const [hotkey, setHotkey] = useState('Ctrl + S');
  return (
    <div className="flex flex-col gap-2">
      <HotkeyInput value={hotkey} onChange={setHotkey} />
      <HotkeyInput defaultValue="Ctrl + K" placeholder="搜索快捷键…" />
      <HotkeyInput clearable={false} defaultValue="Alt + F4" />
      <HotkeyInput disabled placeholder="不可用" />
      <span className="text-sm text-(--text-2)">当前快捷键: {hotkey || '未设置'}</span>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'value', type: 'string', description: '快捷键值(受控)。' },
    { name: 'defaultValue', type: 'string', description: '默认值。' },
    { name: 'placeholder', type: 'string', default: "'点击录入快捷键…'", description: '占位符。' },
    { name: 'clearable', type: 'boolean', default: 'true', description: '可清除。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
  ],
  events: [
    { name: 'onChange', type: '(hotkey: string) => void', description: '快捷键变化回调。' },
  ],
};

function HotkeyDemo() {
  const [hotkey, setHotkey] = useState('Ctrl + S');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <HotkeyInput value={hotkey} onChange={setHotkey} />
      <HotkeyInput defaultValue="Ctrl + K" placeholder="搜索快捷键…" onChange={() => {}} />
      <HotkeyInput clearable={false} defaultValue="Alt + F4" onChange={() => {}} />
      <HotkeyInput disabled placeholder="不可用" onChange={() => {}} />
      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>当前快捷键: {hotkey || '未设置'}</span>
    </div>
  );
}

/* ---- Cascader ---- */
const cascader: DocDef = {
  key: 'cascader',
  name: 'Cascader',
  cn: '级联选择',
  description: '树形数据逐级展开选择(antd API):changeOnSelect 任意级可选,disabled 禁用某项。',
  importCode: `import { Cascader } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <CascaderDemo />,
      code: `
import { useState } from 'react';
import { Cascader, message } from '@fluent-react/ui';

const options = [
  { value: 'zh', label: '中国', children: [
    { value: 'bj', label: '北京', children: [{ value: 'hd', label: '海淀区' }, { value: 'cy', label: '朝阳区' }] },
    { value: 'sh', label: '上海', children: [{ value: 'pd', label: '浦东新区' }, { value: 'jn', label: '静安区' }] },
  ]},
  { value: 'us', label: '美国(禁用)', disabled: true },
];

export function CascaderExample() {
  const [value, setValue] = useState([]);
  return (
    <Cascader options={options} value={value} changeOnSelect
      onChange={(v) => { setValue(v); message.info('选中: ' + v.join(' / ')); }}
      placeholder="选择地区" />
  );
}`,
    },
  ],
  props: [
    { name: 'options', type: 'CascaderOption[]', description: '选项数据(必填)。' },
    { name: 'value', type: 'string[]', description: '选中值(受控)。' },
    { name: 'onChange', type: '(value: string[], options: CascaderOption[]) => void', description: '选中变化。' },
    { name: 'changeOnSelect', type: 'boolean', default: 'false', description: '任意级可选。' },
    { name: 'placeholder', type: 'string', default: "'请选择'", description: '占位符。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
  ],
  extraApis: [
    {
      title: 'CascaderOption',
      rows: [
        { name: 'value', type: 'string', description: '选项值(必填)。' },
        { name: 'label', type: 'ReactNode', description: '选项文案(必填)。' },
        { name: 'children', type: 'CascaderOption[]', description: '子选项。' },
        { name: 'disabled', type: 'boolean', description: '禁用该项。' },
      ],
    },
  ],
};

function CascaderDemo() {
  const [value, setValue] = useState<string[]>([]);
  const options = [
    { value: 'zh', label: '中国', children: [
      { value: 'bj', label: '北京', children: [{ value: 'hd', label: '海淀区' }, { value: 'cy', label: '朝阳区' }] },
      { value: 'sh', label: '上海', children: [{ value: 'pd', label: '浦东新区' }, { value: 'jn', label: '静安区' }] },
    ]},
    { value: 'us', label: '美国(禁用)', disabled: true },
  ];
  return (
    <Cascader options={options} value={value} changeOnSelect
      onChange={(v) => { setValue(v); message.info('选中: ' + v.join(' / ')); }}
      placeholder="选择地区" />
  );
}

/* ---- Transfer ---- */
const transfer: DocDef = {
  key: 'transfer',
  name: 'Transfer',
  cn: '穿梭框',
  description: '双列表左右移动数据(antd API):render 自定义行内容,titles 两列标题,disabled 禁用。',
  importCode: `import { Transfer } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <TransferDemo />,
      code: `
import { useState } from 'react';
import { Transfer } from '@fluent-react/ui';

export function TransferExample() {
  const [targetKeys, setTargetKeys] = useState(['2', '5', '8']);
  const data = Array.from({ length: 20 }, (_, i) => ({ key: String(i), title: '项目 ' + (i + 1) }));
  return (
    <Transfer dataSource={data} targetKeys={targetKeys}
      titles={['所有项目', '已选项目']}
      disabled={false}
      onChange={(keys) => setTargetKeys(keys)} />
  );
}`,
    },
  ],
  props: [
    { name: 'dataSource', type: 'TransferItem[]', description: '数据源(必填)。' },
    { name: 'targetKeys', type: 'string[]', description: '目标列键集(必填)。' },
    { name: 'onChange', type: '(targetKeys: string[], direction: string, moveKeys: string[]) => void', description: '变化回调。' },
    { name: 'render', type: '(item: TransferItem) => ReactNode', description: '自定义行内容。' },
    { name: 'titles', type: '[string, string]', default: "['源列表', '目标列表']", description: '两列标题。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
  ],
  extraApis: [
    {
      title: 'TransferItem',
      rows: [
        { name: 'key', type: 'string', description: '唯一标识(必填)。' },
        { name: 'title', type: 'string', description: '显示文本(必填)。' },
        { name: 'disabled', type: 'boolean', description: '禁用该项。' },
      ],
    },
  ],
};

function TransferDemo() {
  const [targetKeys, setTargetKeys] = useState(['2', '5', '8']);
  const data = Array.from({ length: 20 }, (_, i) => ({ key: String(i), title: `项目 ${i + 1}` }));
  return (
    <Transfer dataSource={data} targetKeys={targetKeys}
      titles={['所有项目', '已选项目']}
      disabled={false}
      onChange={(keys) => setTargetKeys(keys)} />
  );
}

/* ---- VirtualList ---- */
const virtuallist: DocDef = {
  key: 'virtuallist',
  name: 'VirtualList',
  cn: '虚拟滚动',
  description: '大数据量只渲染可视区 DOM 节点:overscan 额外渲染上下行数。',
  importCode: `import { VirtualList } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <VirtualListDemo />,
      code: `
import { VirtualList } from '@fluent-react/ui';

const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, text: '列表项 ' + (i + 1) }));

export function VirtualListExample() {
  return (
    <VirtualList items={data} itemHeight={36} height={300} overscan={10}
      renderItem={(item) => (
        <div className="flex items-center px-3 h-full border-b border-(--stroke)">
          {item.text}
        </div>
      )} />
  );
}`,
    },
  ],
  props: [
    { name: 'items', type: 'T[]', description: '数据源(必填)。' },
    { name: 'itemHeight', type: 'number', description: '每行高度(px)(必填)。' },
    { name: 'renderItem', type: '(item: T, index: number) => ReactNode', description: '渲染每行(必填)。' },
    { name: 'height', type: 'number', description: '容器高度(px)(必填)。' },
    { name: 'overscan', type: 'number', default: '3', description: '额外渲染行数。' },
  ],
};

function VirtualListDemo() {
  const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `列表项 ${i + 1}` }));
  return (
    <VirtualList items={data} itemHeight={36} height={300} overscan={10}
      renderItem={(item) => (
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '100%', borderBottom: '1px solid var(--stroke)' }}>
          {item.text}
        </div>
      )} />
  );
}

export const extrasDocs: DocDef[] = [popconfirm, descriptions, result, tour, anchor, hotkeyinput, cascader, transfer, virtuallist];
