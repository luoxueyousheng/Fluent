/* 文档数据:文本与表单 — TextBox / Field / SearchBox / AutoSuggest / Form */
import { useState } from 'react';
import {
  AutoSuggest,
  Button,
  Field,
  Form,
  PasswordBox,
  SearchBox,
  Switch,
  TextArea,
  TextBox,
  useToast,
} from '@fluent-jade/ui';
import type { DocDef } from '../types';

const FRUITS = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Mango', 'Peach'];

const textbox: DocDef = {
  key: 'textbox',
  name: 'TextBox',
  cn: '编辑框',
  description:
    '单行文本输入,WinUI 3 形态:聚焦时底边线加粗为 accent。原生 input 薄封装,附加 antd 风 size 三档与 status 校验描边;多行用 TextArea。',
  importCode: `import { TextBox, TextArea } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <TextBox placeholder="请输入内容" aria-label="示例输入" />
          <TextBox defaultValue="不可编辑" disabled aria-label="禁用输入" />
        </>
      ),
      code: `
import { TextBox } from '@fluent-jade/ui';

export function TextBoxBasicExample() {
  return (
    <>
      <TextBox placeholder="请输入内容" />
      <TextBox defaultValue="不可编辑" disabled />
    </>
  );
}`,
    },
    {
      title: '尺寸与校验状态',
      description: 'size 三档 24/32/40;status 呈现 error / warning 描边。',
      demo: (
        <>
          <TextBox size="small" placeholder="小" aria-label="小输入框" />
          <TextBox placeholder="中(默认)" aria-label="中输入框" />
          <TextBox size="large" placeholder="大" aria-label="大输入框" />
          <TextBox status="error" defaultValue="校验失败" aria-label="错误输入框" />
          <TextBox status="warning" defaultValue="需要注意" aria-label="警告输入框" />
        </>
      ),
      code: `
import { TextBox } from '@fluent-jade/ui';

export function TextBoxSizeStatusExample() {
  return (
    <>
      {/* size 三档:small 24 / middle 32 / large 40 */}
      <TextBox size="small" placeholder="小" />
      <TextBox placeholder="中(默认)" />
      <TextBox size="large" placeholder="大" />
      {/* status 呈现校验状态描边 */}
      <TextBox status="error" defaultValue="校验失败" />
      <TextBox status="warning" defaultValue="需要注意" />
    </>
  );
}`,
    },
    {
      title: '原生属性透传',
      description: '除 size / status 外的属性原样透传给原生 input:minLength / maxLength / onChange…。',
      demo: <TextBoxNativeDemo />,
      code: `
import { useState } from 'react';
import { TextBox } from '@fluent-jade/ui';

export function TextBoxNativeExample() {
  const [v, setV] = useState('');
  // minLength / maxLength 等原生属性直接透传;onChange 为原生事件签名
  return (
    <>
      <TextBox
        minLength={4}
        maxLength={12}
        placeholder="4~12 个字符"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <span className="text-(--text-2)">已输入 {v.length} 字</span>
    </>
  );
}`,
    },
    {
      title: 'TextArea 多行文本',
      description: 'status 校验描边同样适用于 TextArea。',
      demo: (
        <>
          <TextArea rows={3} placeholder="多行内容…" style={{ width: 320 }} aria-label="多行输入" />
          <TextArea rows={3} status="error" defaultValue="内容不符合要求" style={{ width: 320 }} aria-label="多行错误" />
        </>
      ),
      code: `
import { TextArea } from '@fluent-jade/ui';

export function TextAreaExample() {
  return (
    <>
      <TextArea rows={3} placeholder="多行内容…" className="w-[320px]" />
      {/* status 校验状态描边同样适用 */}
      <TextArea rows={3} status="error" defaultValue="内容不符合要求" className="w-[320px]" />
    </>
  );
}`,
    },
    {
      title: '着色与圆角',
      description: 'color 作用于聚焦下划线;radius 四档。TextBox / TextArea 同契约。',
      demo: (
        <div className="flex flex-col gap-3 w-[280px]">
          <TextBox placeholder="success 聚焦" color="success" />
          <TextBox placeholder="danger 聚焦" color="danger" />
          <TextBox placeholder="radius none" radius="none" />
          <TextBox placeholder="radius lg" radius="lg" />
          <TextArea placeholder="大圆角多行" radius="lg" color="success" rows={3} />
        </div>
      ),
      code: `
import { TextArea, TextBox } from '@fluent-jade/ui';

export function TextBoxColorRadiusExample() {
  return (
    <div className="flex flex-col gap-3 w-[280px]">
      <TextBox placeholder="success 聚焦" color="success" />
      <TextBox placeholder="danger 聚焦" color="danger" />
      <TextBox placeholder="radius none" radius="none" />
      <TextBox placeholder="radius lg" radius="lg" />
      <TextArea placeholder="大圆角多行" radius="lg" color="success" rows={3} />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:聚焦下划线随之变色。' },
    { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: '圆角档位。' },
    { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '三档高度。' },
    { name: 'status', type: "'error' | 'warning'", description: '校验状态描边。' },
    { name: '...rest', type: 'InputHTMLAttributes', description: '透传原生 input 属性(value / placeholder / disabled / onChange…)。' },
  ],
  extraApis: [
    {
      title: 'TextArea Props',
      rows: [
        { name: 'status', type: "'error' | 'warning'", description: '校验状态描边。' },
        { name: '...rest', type: 'TextareaHTMLAttributes', description: '透传原生 textarea 属性(rows / value / onChange…)。' },
      ],
    },
  ],
};

function TextBoxNativeDemo() {
  const [v, setV] = useState('');
  return (
    <>
      <TextBox minLength={4} maxLength={12} placeholder="4~12 个字符" value={v}
               onChange={(e) => setV(e.target.value)} aria-label="透传示例" />
      <span style={{ color: 'var(--text-2)', fontSize: 12 }}>已输入 {v.length} 字</span>
    </>
  );
}

const passwordbox: DocDef = {
  key: 'passwordbox',
  name: 'PasswordBox',
  cn: '密码框',
  description:
    '密码输入(WinUI PasswordBox 形态):有内容时尾部浮现显隐钮。默认 reveal="press" 为 WinUI 原生行为——按住窥视、抬手即遮;reveal="toggle" 为 antd 行为——点击切换并换 eye/eyeOff 图标;false 关闭显隐钮。其余属性与 TextBox 一致透传原生 input。',
  importCode: `import { PasswordBox } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法(按住窥视)',
      description: '输入内容后出现眼睛;按住可见,抬手 / 移出立即遮蔽。',
      demo: (
        <>
          <PasswordBox placeholder="输入密码" aria-label="密码" />
          <PasswordBox defaultValue="secret-token" aria-label="已有密码" />
        </>
      ),
      code: `
import { PasswordBox } from '@fluent-jade/ui';

export function PasswordBoxBasicExample() {
  return (
    <>
      <PasswordBox placeholder="输入密码" />
      {/* 有内容时才出现眼睛;按住窥视,抬手即遮 */}
      <PasswordBox defaultValue="secret-token" />
    </>
  );
}`,
    },
    {
      title: 'toggle 切换与校验状态',
      description: 'reveal="toggle" 点击切换显隐(图标随之切换);reveal={false} 不渲染显隐钮;size / status 与 TextBox 同款。',
      demo: (
        <>
          <PasswordBox reveal="toggle" defaultValue="api-key-123" aria-label="切换显隐" />
          <PasswordBox reveal={false} defaultValue="never-shown" aria-label="无显隐钮" />
          <PasswordBox status="error" defaultValue="weak" aria-label="校验失败" />
          <PasswordBox size="small" placeholder="小尺寸" aria-label="小尺寸密码" />
        </>
      ),
      code: `
import { PasswordBox } from '@fluent-jade/ui';

export function PasswordBoxToggleExample() {
  return (
    <>
      {/* 点击眼睛切换显隐,图标 eye / eyeOff 随之切换 */}
      <PasswordBox reveal="toggle" defaultValue="api-key-123" />
      {/* reveal={false} 彻底关闭显隐钮 */}
      <PasswordBox reveal={false} defaultValue="never-shown" />
      <PasswordBox status="error" defaultValue="weak" />
      <PasswordBox size="small" placeholder="小尺寸" />
    </>
  );
}`,
    },
    {
      title: '着色与圆角',
      description: 'color 作用于聚焦下划线;radius 四档。',
      demo: (
        <div className="flex flex-col gap-3 w-[240px]">
          <PasswordBox defaultValue="secret" color="success" />
          <PasswordBox defaultValue="secret" color="danger" radius="lg" />
        </div>
      ),
      code: `
import { PasswordBox } from '@fluent-jade/ui';

export function PasswordBoxColorRadiusExample() {
  return (
    <div className="flex flex-col gap-3 w-[240px]">
      <PasswordBox defaultValue="secret" color="success" />
      <PasswordBox defaultValue="secret" color="danger" radius="lg" />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:聚焦下划线随之变色。' },
    { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: '圆角档位。' },
    { name: 'reveal', type: "'press' | 'toggle' | false", default: "'press'", description: '显隐钮行为:按住窥视 / 点击切换 / 不渲染。' },
    { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '三档高度。' },
    { name: 'status', type: "'error' | 'warning'", description: '校验状态描边。' },
    { name: '...rest', type: 'InputHTMLAttributes(type 除外)', description: '透传原生 input 属性(value / onChange / maxLength…)。' },
  ],
};

const field: DocDef = {
  key: 'field',
  name: 'Field',
  cn: '表单字段',
  description:
    '字段容器:标签 + 任意控件 + 底部提示行。validation 显示校验结果(error 红 / success 绿,带图标),hint 显示常规说明;Form.Item 内部即由 Field 渲染。',
  importCode: `import { Field, TextBox } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Field label="用户名" hint="3~16 个字符">
            <TextBox placeholder="输入用户名" aria-label="用户名" />
          </Field>
          <Field label="邮箱" validation={{ state: 'error', message: '邮箱格式不正确' }}>
            <TextBox status="error" defaultValue="not-an-email" aria-label="邮箱" />
          </Field>
          <Field label="昵称" validation={{ state: 'success', message: '可以使用' }}>
            <TextBox defaultValue="fluent" aria-label="昵称" />
          </Field>
        </div>
      ),
      code: `
import { Field, TextBox } from '@fluent-jade/ui';

export function FieldBasicExample() {
  return (
    <div className="flex flex-wrap gap-4">
      {/* hint:常规说明文本 */}
      <Field label="用户名" hint="3~16 个字符">
        <TextBox placeholder="输入用户名" />
      </Field>
      {/* validation:校验结果(error 红,带图标) */}
      <Field label="邮箱" validation={{ state: 'error', message: '邮箱格式不正确' }}>
        <TextBox status="error" defaultValue="not-an-email" />
      </Field>
      {/* validation:校验结果(success 绿,带图标) */}
      <Field label="昵称" validation={{ state: 'success', message: '可以使用' }}>
        <TextBox defaultValue="fluent" />
      </Field>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'label', type: 'string', description: '字段标签。' },
    { name: 'validation', type: "{ state: 'error' | 'success'; message?: string } | null", description: '校验结果;不传为正常态。' },
    { name: 'hint', type: 'string', description: '常规说明(validation 存在时被覆盖)。' },
    { name: 'children', type: 'ReactNode', description: '内嵌控件。' },
  ],
};

const searchbox: DocDef = {
  key: 'searchbox',
  name: 'SearchBox',
  cn: '搜索框',
  description:
    '搜索框:前置放大镜、输入后浮现清除键;传入 suggestions 即升级为带候选浮层的 AutoSuggest 形态,回车经 onSubmit 提交。',
  importCode: `import { SearchBox } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <SearchBoxDemo />,
      code: `
import { SearchBox, useToast } from '@fluent-jade/ui';

export function SearchBoxBasicExample() {
  const toast = useToast();
  // 回车经 onSubmit 提交
  return (
    <SearchBox
      placeholder="搜索组件"
      onSubmit={(v) => toast({ level: 'info', title: '搜索', message: v || '(空)' })}
    />
  );
}`,
    },
    {
      title: '带候选',
      description: 'suggestions 提供候选池,输入时实时过滤。',
      demo: <SearchBox suggestions={FRUITS} placeholder="搜索水果" />,
      code: `
import { SearchBox } from '@fluent-jade/ui';

// 候选池:输入时实时过滤
const FRUITS = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Mango', 'Peach'];

export function SearchBoxSuggestionsExample() {
  return <SearchBox suggestions={FRUITS} placeholder="搜索水果" />;
}`,
    },
    {
      title: '受控与尺寸',
      description: 'value + onChange 受控;defaultValue 仅设非受控初值;size 三档高度。',
      demo: <SearchBoxControlled />,
      code: `
import { useState } from 'react';
import { SearchBox } from '@fluent-jade/ui';

export function SearchBoxControlledExample() {
  const [kw, setKw] = useState('');
  return (
    <>
      {/* 受控:value + onChange */}
      <SearchBox value={kw} onChange={setKw} placeholder="受控搜索" />
      {/* defaultValue 非受控初值;size 三档高度 */}
      <SearchBox size="small" defaultValue="fluent" placeholder="小尺寸" />
      <span className="text-(--text-2)">当前关键词:{kw || '(空)'}</span>
    </>
  );
}`,
    },
    {
      title: '着色与圆角',
      description: 'color 作用于聚焦下划线;radius 四档。',
      demo: (
        <div className="flex flex-col gap-3 w-[260px]">
          <SearchBox placeholder="success" color="success" />
          <SearchBox placeholder="radius lg" radius="lg" color="danger" />
        </div>
      ),
      code: `
import { SearchBox } from '@fluent-jade/ui';

export function SearchBoxColorRadiusExample() {
  return (
    <div className="flex flex-col gap-3 w-[260px]">
      <SearchBox placeholder="success" color="success" />
      <SearchBox placeholder="radius lg" radius="lg" color="danger" />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:聚焦下划线随之变色。' },
    { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: '圆角档位。' },
    { name: 'value / defaultValue', type: 'string', default: "''", description: '受控 / 非受控输入值。' },
    { name: 'suggestions', type: 'string[]', description: '候选池;提供后内部改用 AutoSuggest。' },
    { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '三档高度。' },
    { name: 'placeholder', type: 'string', default: "'搜索'", description: '占位文本。' },
  ],
  events: [
    { name: 'onChange', type: '(value: string) => void', description: '输入变化。' },
    { name: 'onSubmit', type: '(value: string) => void', description: '回车提交(无候选形态)。' },
  ],
};

function SearchBoxDemo() {
  const toast = useToast();
  return <SearchBox placeholder="搜索组件" onSubmit={(v) => toast({ level: 'info', title: '搜索', message: v || '(空)' })} />;
}

function SearchBoxControlled() {
  const [kw, setKw] = useState('');
  return (
    <>
      <SearchBox value={kw} onChange={setKw} placeholder="受控搜索" />
      <SearchBox size="small" defaultValue="fluent" placeholder="小尺寸" />
      <span style={{ color: 'var(--text-2)', fontSize: 12 }}>当前关键词:{kw || '(空)'}</span>
    </>
  );
}

const autosuggest: DocDef = {
  key: 'autosuggest',
  name: 'AutoSuggest',
  cn: '自动建议框',
  description:
    '可输入组合框(WinUI AutoSuggestBox):自由输入 + 实时过滤候选浮层,方向键导航、回车选中、Esc 关闭。与 ComboBox 的区别:值可以是候选之外的任意文本。',
  importCode: `import { AutoSuggest } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: 'defaultValue 设非受控初值;size 三档高度。',
      demo: (
        <>
          <AutoSuggest options={FRUITS} placeholder="输入水果名" aria-label="水果" />
          <AutoSuggest options={FRUITS} defaultValue="Mango" size="small" aria-label="初值水果" />
        </>
      ),
      code: `
import { AutoSuggest } from '@fluent-jade/ui';

// 候选池:按包含匹配过滤
const FRUITS = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Mango', 'Peach'];

export function AutoSuggestBasicExample() {
  return (
    <>
      <AutoSuggest options={FRUITS} placeholder="输入水果名" />
      {/* defaultValue 非受控初值;size 三档高度 */}
      <AutoSuggest options={FRUITS} defaultValue="Mango" size="small" />
    </>
  );
}`,
    },
    {
      title: '受控与状态',
      demo: <AutoSuggestControlled />,
      code: `
import { useState } from 'react';
import { AutoSuggest } from '@fluent-jade/ui';

const FRUITS = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Mango', 'Peach'];

export function AutoSuggestControlledExample() {
  const [v, setV] = useState('');
  // 值在候选之外时呈现 warning 描边
  return (
    <AutoSuggest
      options={FRUITS}
      value={v}
      onChange={setV}
      placeholder="受控输入"
      status={v && !FRUITS.includes(v) ? 'warning' : undefined}
    />
  );
}`,
    },
    {
      title: '着色与圆角',
      description: 'color 作用于聚焦下划线;radius 四档。',
      demo: (
        <div className="flex flex-col gap-3 w-[260px]">
          <AutoSuggest options={['苹果', '香蕉', '橙子']} placeholder="success" color="success" />
          <AutoSuggest options={['苹果', '香蕉', '橙子']} placeholder="radius lg" radius="lg" color="warning" />
        </div>
      ),
      code: `
import { AutoSuggest } from '@fluent-jade/ui';

export function AutoSuggestColorRadiusExample() {
  return (
    <div className="flex flex-col gap-3 w-[260px]">
      <AutoSuggest options={['苹果', '香蕉', '橙子']} placeholder="success" color="success" />
      <AutoSuggest options={['苹果', '香蕉', '橙子']} placeholder="radius lg" radius="lg" color="warning" />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:聚焦下划线随之变色。' },
    { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: '圆角档位。' },
    { name: 'options', type: 'string[]', description: '候选池(必填),按包含匹配过滤。' },
    { name: 'value / defaultValue', type: 'string', default: "''", description: '受控 / 非受控输入值。' },
    { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '三档高度。' },
    { name: 'status', type: "'error' | 'warning'", description: '校验状态描边。' },
    { name: 'placeholder', type: 'string', description: '占位文本。' },
  ],
  events: [
    { name: 'onChange', type: '(value: string) => void', description: '输入或选中候选时回调。' },
  ],
};

function AutoSuggestControlled() {
  const [v, setV] = useState('');
  return (
    <AutoSuggest options={FRUITS} value={v} onChange={setV} placeholder="受控输入"
                 status={v && !FRUITS.includes(v) ? 'warning' : undefined} aria-label="受控水果" />
  );
}

const form: DocDef = {
  key: 'form',
  name: 'Form',
  cn: '表单',
  description:
    'antd 形态的轻量表单体系:Form 持有值与校验状态,Form.Item 按 name 自动向唯一子控件注入 value / onChange,rules 声明校验(required / min / max / pattern / validator),提交时全量校验后回调 onFinish。',
  importCode: `import { Form, Button, TextBox } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: '失焦即校验单字段;点击提交触发全量校验,全部通过走 onFinish,否则走 onFinishFailed。',
      demo: <FormDemo />,
      code: `
import { Button, Form, TextBox, useToast } from '@fluent-jade/ui';

export function FormBasicExample() {
  const toast = useToast();
  return (
    <Form
      initialValues={{ user: '' }}
      // 全部校验通过走 onFinish
      onFinish={(values) => toast({ level: 'success', title: '提交成功', message: JSON.stringify(values) })}
      // 存在校验错误走 onFinishFailed
      onFinishFailed={() => toast({ level: 'error', title: '校验未通过', message: '请检查表单字段。' })}
    >
      <Form.Item name="user" label="用户名" rules={[{ required: true }, { min: 3, message: '至少 3 个字符' }]}>
        <TextBox placeholder="输入用户名" />
      </Form.Item>
      <Form.Item name="mail" label="邮箱" rules={[{ pattern: /^\\S+@\\S+$/, message: '邮箱格式不正确' }]}>
        <TextBox placeholder="you@example.com" />
      </Form.Item>
      <Button variant="accent" type="submit">提交</Button>
    </Form>
  );
}`,
    },
    {
      title: '值适配与自定义校验',
      description:
        'valuePropName 适配 checked 类控件(如 Switch);getValueFromEvent 自定义取值;Item 的 hint 显示说明;Rule 的 max / validator 声明上限与自定义校验。',
      demo: <FormAdaptDemo />,
      code: `
import {
  Button,
  Form,
  Switch,
  TextBox,
  useToast,
} from '@fluent-jade/ui';

export function FormValueAdaptExample() {
  const toast = useToast();
  return (
    <Form
      initialValues={{ code: '', agree: false }}
      onFinish={(values) => toast({ level: 'success', title: '提交成功', message: JSON.stringify(values) })}
      onFinishFailed={() => toast({ level: 'error', title: '校验未通过', message: '请检查表单字段。' })}
    >
      <Form.Item
        name="code"
        label="邀请码"
        hint="输入自动转为大写"
        // getValueFromEvent:从 onChange 参数自定义提取值(此处顺手转大写)
        getValueFromEvent={(e) => e.target.value.toUpperCase()}
        rules={[
          { max: 6, message: '最多 6 位' }, // max:字符串按长度上限校验
          // validator:自定义校验,返回错误文本即失败
          { validator: (v) => (!v || v === 'FLUENT' ? undefined : '邀请码无效,试试 FLUENT') },
        ]}
      >
        <TextBox placeholder="FLUENT" />
      </Form.Item>
      {/* valuePropName="checked":向 Switch 注入 checked 而非 value */}
      <Form.Item
        name="agree"
        label="协议"
        valuePropName="checked"
        rules={[{ validator: (v) => (v ? undefined : '需先同意协议') }]}
      >
        <Switch>同意用户协议</Switch>
      </Form.Item>
      <Button variant="accent" type="submit">提交</Button>
    </Form>
  );
}`,
    },
  ],
  props: [
    { name: 'initialValues', type: 'Record<string, any>', default: '{}', description: '各字段初始值(按 Item 的 name 取)。' },
    { name: 'onFinish', type: '(values) => void', description: '校验全部通过后的提交回调。' },
    { name: 'onFinishFailed', type: '(errors) => void', description: '存在校验错误时回调(name → 错误信息)。' },
  ],
  extraApis: [
    {
      title: 'Form.Item Props',
      rows: [
        { name: 'name', type: 'string', description: '字段名(必填)。' },
        { name: 'label', type: 'string', description: '字段标签。' },
        { name: 'rules', type: 'Rule[]', default: '[]', description: '校验规则,按序执行、首错即停。' },
        { name: 'hint', type: 'string', description: '无错误时的说明文本。' },
        { name: 'valuePropName', type: 'string', default: "'value'", description: '注入子控件的值属性名(如 Switch 用 checked)。' },
        { name: 'getValueFromEvent', type: '(...args) => any', description: '从子控件 onChange 参数提取值;默认智能取 target.value / checked。' },
        { name: 'children', type: 'ReactElement', description: '唯一子控件。' },
      ],
    },
    {
      title: 'Rule',
      rows: [
        { name: 'required', type: 'boolean', description: '必填(空字符串 / null / 空数组视为空)。' },
        { name: 'min / max', type: 'number', description: '字符串按长度、数字按数值比较。' },
        { name: 'pattern', type: 'RegExp', description: '正则校验(仅字符串)。' },
        { name: 'validator', type: '(value) => string | undefined | Promise<...>', description: '自定义校验,返回错误文本即失败。' },
        { name: 'message', type: 'string', description: '覆盖默认错误文案。' },
      ],
    },
  ],
};

function FormDemo() {
  const toast = useToast();
  return (
    <Form initialValues={{ user: '' }} className="doc-form"
          onFinish={(v) => toast({ level: 'success', title: '提交成功', message: JSON.stringify(v) })}
          onFinishFailed={() => toast({ level: 'error', title: '校验未通过', message: '请检查表单字段。' })}>
      <Form.Item name="user" label="用户名" rules={[{ required: true }, { min: 3, message: '至少 3 个字符' }]}>
        <TextBox placeholder="输入用户名" aria-label="用户名" />
      </Form.Item>
      <Form.Item name="mail" label="邮箱" rules={[{ pattern: /^\S+@\S+$/, message: '邮箱格式不正确' }]}>
        <TextBox placeholder="you@example.com" aria-label="邮箱" />
      </Form.Item>
      <Button variant="accent" type="submit">提交</Button>
    </Form>
  );
}

function FormAdaptDemo() {
  const toast = useToast();
  return (
    <Form initialValues={{ code: '', agree: false }} className="doc-form"
          onFinish={(v) => toast({ level: 'success', title: '提交成功', message: JSON.stringify(v) })}
          onFinishFailed={() => toast({ level: 'error', title: '校验未通过', message: '请检查表单字段。' })}>
      <Form.Item name="code" label="邀请码" hint="输入自动转为大写"
                 getValueFromEvent={(e) => e.target.value.toUpperCase()}
                 rules={[
                   { max: 6, message: '最多 6 位' },
                   { validator: (v) => (!v || v === 'FLUENT' ? undefined : '邀请码无效,试试 FLUENT') },
                 ]}>
        <TextBox placeholder="FLUENT" aria-label="邀请码" />
      </Form.Item>
      <Form.Item name="agree" label="协议" valuePropName="checked"
                 rules={[{ validator: (v) => (v ? undefined : '需先同意协议') }]}>
        <Switch>同意用户协议</Switch>
      </Form.Item>
      <Button variant="accent" type="submit">提交</Button>
    </Form>
  );
}

export const textDocs: DocDef[] = [textbox, passwordbox, field, searchbox, autosuggest, form];
