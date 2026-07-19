/* 文档数据:输入 — Checkbox / Radio / Switch / Slider / NumberBox / Rating / ColorPicker / Upload */
import { useState } from 'react';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  ColorPicker,
  NumberBox,
  Radio,
  RadioGroup,
  RangeSlider,
  Rating,
  Slider,
  Switch,
  SwitchGroup,
  Upload,
  type UploadFile,
  type UploadRequestOptions,
} from '@fluent-jade/ui';
import type { DocDef } from '../types';

/* ---- 有状态演示 ---- */

function SliderBasic() {
  const [v, setV] = useState(40);
  return <div style={{ width: 280 }}><Slider header="音量" showValue value={v} onChange={setV} /></div>;
}
function SliderEnd() {
  const [v, setV] = useState(30);
  const [committed, setCommitted] = useState(30);
  return (
    <div style={{ width: 280 }}>
      <Slider header="音量" showValue value={v} onChange={setV} onChangeEnd={setCommitted} />
      <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>
        拖动中:{v} · 提交值:{committed}
      </span>
    </div>
  );
}
function SliderTicks() {
  const [v, setV] = useState(50);
  return (
    <div style={{ width: 280 }}>
      <Slider value={v} onChange={setV} step={5} ticks={5} majorTicks={25}
              marks={[[0, '静音'], [100, '最大']]} aria-label="带刻度" />
    </div>
  );
}
function SliderBalance() {
  const [v, setV] = useState(20);
  return (
    <div style={{ width: 280 }}>
      <Slider header="声道平衡" showValue value={v} onChange={setV}
              min={-50} max={50} fillFrom={0} format={(n) => (n > 0 ? `右 ${n}` : n < 0 ? `左 ${-n}` : '居中')} />
    </div>
  );
}
function SliderRange() {
  const [v, setV] = useState<[number, number]>([200, 600]);
  const [committed, setCommitted] = useState<[number, number]>([200, 600]);
  return (
    <div style={{ width: 280 }}>
      <RangeSlider value={v} onChange={setV} onChangeEnd={setCommitted}
                   min={0} max={1000} step={50} aria-label="价格区间" />
      <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>
        拖动中:{v[0]}~{v[1]} · 提交:{committed[0]}~{committed[1]}
      </span>
    </div>
  );
}
function SliderVerticalDisabled() {
  const [v, setV] = useState(60);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
      <Slider vertical header="亮度" showValue value={v} onChange={setV} />
      <div style={{ width: 220 }}>
        <Slider header="禁用" showValue value={30} onChange={() => {}} disabled />
      </div>
    </div>
  );
}

const fakeRequest = ({ onProgress, onSuccess }: UploadRequestOptions) => {
  let p = 0;
  const t = setInterval(() => {
    p += 20;
    if (p >= 100) { clearInterval(t); onSuccess(); } else onProgress(p);
  }, 180);
};

/* ---- 文档定义 ---- */

const checkbox: DocDef = {
  key: 'checkbox',
  name: 'Checkbox',
  cn: '检查框',
  description:
    '检查框用于在一组互不排斥的选项中做多项开关。薄封装原生 input[type=checkbox],受控/非受控直接走原生 checked / defaultChecked。',
  importCode: `import { Checkbox } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <Checkbox defaultChecked>已选中</Checkbox>
          <Checkbox>未选中</Checkbox>
          <Checkbox disabled>禁用</Checkbox>
          <Checkbox defaultChecked disabled>选中禁用</Checkbox>
        </>
      ),
      code: `
import { Checkbox } from '@fluent-jade/ui';

export function BasicExample() {
  return (
    <>
      <Checkbox defaultChecked>已选中</Checkbox>
      <Checkbox>未选中</Checkbox>
      <Checkbox disabled>禁用</Checkbox>
      <Checkbox defaultChecked disabled>选中禁用</Checkbox>
    </>
  );
}`,
    },
    {
      title: '受控用法',
      description: '与原生 input 一致:checked + onChange 组成受控;只给 defaultChecked 则为非受控。',
      demo: <CheckboxControlled />,
      code: `
import { useState } from 'react';
import { Checkbox } from '@fluent-jade/ui';

export function ControlledExample() {
  const [on, setOn] = useState(true);
  return (
    <Checkbox checked={on} onChange={(e) => setOn(e.target.checked)}>
      接收通知({on ? '开' : '关'})
    </Checkbox>
  );
}`,
    },
    {
      title: 'CheckboxGroup 选项组',
      description: '声明式选项数组 + string[] 值(antd 惯例),与 RadioGroup 同构;vertical 纵向。',
      demo: <CheckboxGroupDemo />,
      code: `
import { useState } from 'react';
import { CheckboxGroup } from '@fluent-jade/ui';

export function GroupExample() {
  const [v, setV] = useState(['win']);
  return (
    <CheckboxGroup
      value={v}
      onChange={setV}
      options={[
        { value: 'win', label: 'Windows' },
        { value: 'mac', label: 'macOS' },
        { value: 'linux', label: 'Linux', disabled: true },
      ]}
    />
  );
}`,
    },
    {
      title: '半选(indeterminate)',
      description: '全选父项的三态联动:子项部分勾选时父项呈横杠半选。indeterminate 只是视觉,不影响 checked 值。',
      demo: <CheckboxIndeterminate />,
      code: `
import { useState } from 'react';
import { Checkbox, CheckboxGroup } from '@fluent-jade/ui';

const OS_LIST = ['win', 'mac', 'linux'];

export function IndeterminateExample() {
  const [v, setV] = useState(['win']);
  const all = OS_LIST.every((x) => v.includes(x));
  const some = v.length > 0 && !all;
  return (
    <div className="flex flex-col gap-2">
      <Checkbox
        checked={all}
        indeterminate={some}
        onChange={() => setV(all ? [] : [...OS_LIST])}
      >
        全选平台
      </Checkbox>
      <CheckboxGroup
        value={v}
        onChange={setV}
        options={OS_LIST.map((x) => ({ value: x, label: x }))}
      />
    </div>
  );
}`,
    },
    {
      title: '卡片形态',
      description: 'card 把单个检查框升级为可点整卡(标题 + description 描述行),选中呈 accent 描边 + 浅充;CheckboxGroup 传 card 即整组卡片化(options.description 作为描述)。',
      demo: <CheckboxCardDemo />,
      code: `
import { useState } from 'react';
import { Checkbox, CheckboxGroup } from '@fluent-jade/ui';

export function CheckboxCardExample() {
  const [features, setFeatures] = useState(['autosave']);
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 单个卡片检查框 */}
      <Checkbox card defaultChecked description="崩溃时自动上传诊断日志,不含个人数据。">
        错误报告
      </Checkbox>
      {/* 整组卡片化:options.description 作为描述行 */}
      <CheckboxGroup card value={features} onChange={setFeatures}
        options={[
          { value: 'autosave', label: '自动保存', description: '编辑内容每 30 秒写入本地。' },
          { value: 'sync', label: '云同步', description: '配置跨设备同步(需登录)。' },
          { value: 'beta', label: '抢先体验', description: '接收测试版更新。', disabled: true },
        ]} />
    </div>
  );
}`,
    },
    {
      title: '纵向与整组禁用',
      description: 'vertical 纵向排列;disabled 整组禁用;只给 defaultValue 即非受控,组内自维护选中集。',
      demo: (
        <div style={{ display: 'flex', gap: 32 }}>
          <CheckboxGroup vertical defaultValue={['crash']}
            options={[
              { value: 'crash', label: '崩溃报告' },
              { value: 'usage', label: '使用统计' },
              { value: 'news', label: '产品资讯' },
            ]} />
          <CheckboxGroup disabled defaultValue={['sync']}
            options={[
              { value: 'sync', label: '云同步' },
              { value: 'beta', label: '抢先体验' },
            ]} />
        </div>
      ),
      code: `
import { CheckboxGroup } from '@fluent-jade/ui';

export function VerticalDisabledExample() {
  return (
    <div className="flex gap-8">
      {/* vertical 纵向 + defaultValue 非受控 */}
      <CheckboxGroup vertical defaultValue={['crash']}
        options={[
          { value: 'crash', label: '崩溃报告' },
          { value: 'usage', label: '使用统计' },
          { value: 'news', label: '产品资讯' },
        ]} />
      {/* disabled 整组禁用 */}
      <CheckboxGroup disabled defaultValue={['sync']}
        options={[
          { value: 'sync', label: '云同步' },
          { value: 'beta', label: '抢先体验' },
        ]} />
    </div>
  );
}`,
    },
    {
      title: '着色',
      description: 'color 语义五色作用于选中态(勾选框/卡片描边)。组组件 CheckboxGroup 同样支持整组 color。',
      demo: (
        <div className="flex flex-col gap-3 items-start">
          <div className="flex flex-wrap gap-3">
            <Checkbox defaultChecked color="success">成功</Checkbox>
            <Checkbox defaultChecked color="warning">警告</Checkbox>
            <Checkbox defaultChecked color="danger">危险</Checkbox>
          </div>
          <CheckboxGroup color="success" defaultValue={['a']}
            options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }]} />
        </div>
      ),
      code: `
import { Checkbox, CheckboxGroup } from '@fluent-jade/ui';

export function CheckboxColorExample() {
  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="flex flex-wrap gap-3">
        <Checkbox defaultChecked color="success">成功</Checkbox>
        <Checkbox defaultChecked color="warning">警告</Checkbox>
        <Checkbox defaultChecked color="danger">危险</Checkbox>
      </div>
      <CheckboxGroup color="success" defaultValue={['a']}
        options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }]} />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:选中态随之变色。' },
    { name: 'checked', type: 'boolean', description: '受控选中态。' },
    { name: 'defaultChecked', type: 'boolean', default: 'false', description: '非受控初始选中态。' },
    { name: 'indeterminate', type: 'boolean', default: 'false', description: '半选态(横杠视觉,不影响 checked)。' },
    { name: 'card', type: 'boolean', default: 'false', description: '卡片形态:整卡可点,选中 accent 描边 + 浅充。' },
    { name: 'description', type: 'ReactNode', description: '卡片形态的描述行(标题下方,弱化字色)。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
    { name: 'children', type: 'ReactNode', description: '标签文本(卡片形态下为标题)。' },
    { name: '...rest', type: 'InputHTMLAttributes', description: '透传原生 input 属性。' },
  ],
  events: [
    { name: 'onChange', type: '(e: ChangeEvent<HTMLInputElement>) => void', description: '选中状态变化(读 e.target.checked)。' },
  ],
  extraApis: [
    {
      title: 'CheckboxGroup Props',
      rows: [
        { name: 'options', type: '{ value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }[]', description: '选项数组(description 仅卡片形态显示)。' },
        { name: 'value / defaultValue', type: 'string[]', default: '[]', description: '受控 / 非受控选中集。' },
        { name: 'onChange', type: '(values: string[]) => void', description: '选中集变化。' },
        { name: 'vertical', type: 'boolean', default: 'false', description: '纵向排列。' },
        { name: 'card', type: 'boolean', default: 'false', description: '整组卡片形态。' },
        { name: 'disabled', type: 'boolean', default: 'false', description: '整组禁用。' },
      ],
    },
  ],
};

const OS_LIST = ['win', 'mac', 'linux'];

function CheckboxGroupDemo() {
  const [v, setV] = useState(['win']);
  return (
    <CheckboxGroup value={v} onChange={setV}
                   options={[
                     { value: 'win', label: 'Windows' },
                     { value: 'mac', label: 'macOS' },
                     { value: 'linux', label: 'Linux', disabled: true },
                   ]} />
  );
}

function CheckboxCardDemo() {
  const [features, setFeatures] = useState(['autosave']);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <Checkbox card defaultChecked description="崩溃时自动上传诊断日志,不含个人数据。">
        错误报告
      </Checkbox>
      <CheckboxGroup card value={features} onChange={setFeatures}
        options={[
          { value: 'autosave', label: '自动保存', description: '编辑内容每 30 秒写入本地。' },
          { value: 'sync', label: '云同步', description: '配置跨设备同步(需登录)。' },
          { value: 'beta', label: '抢先体验', description: '接收测试版更新。', disabled: true },
        ]} />
    </div>
  );
}

function CheckboxIndeterminate() {
  const [v, setV] = useState(['win']);
  const all = OS_LIST.every((x) => v.includes(x));
  const some = v.length > 0 && !all;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Checkbox checked={all} indeterminate={some} onChange={() => setV(all ? [] : [...OS_LIST])}>
        全选平台
      </Checkbox>
      <div style={{ paddingLeft: 26 }}>
        <CheckboxGroup value={v} onChange={setV}
                       options={OS_LIST.map((x) => ({ value: x, label: x }))} />
      </div>
    </div>
  );
}

function CheckboxControlled() {
  const [on, setOn] = useState(true);
  return <Checkbox checked={on} onChange={(e) => setOn(e.target.checked)}>接收通知({on ? '开' : '关'})</Checkbox>;
}

const radio: DocDef = {
  key: 'radio',
  name: 'Radio',
  cn: '单选框',
  description:
    '单选框用于在互斥选项中选择一项。单个 Radio 是原生 input[type=radio] 的薄封装;成组使用推荐 RadioGroup(antd 惯例的 options + value/onChange)。',
  importCode: `import { Radio, RadioGroup } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <Radio name="doc-radio" defaultChecked>选项一</Radio>
          <Radio name="doc-radio">选项二</Radio>
          <Radio name="doc-radio" disabled>禁用项</Radio>
        </>
      ),
      code: `
import { Radio } from '@fluent-jade/ui';

export function BasicExample() {
  return (
    <>
      <Radio name="g" defaultChecked>选项一</Radio>
      <Radio name="g">选项二</Radio>
      <Radio name="g" disabled>禁用项</Radio>
    </>
  );
}`,
    },
    {
      title: 'RadioGroup 选项组',
      description: '声明式选项数组 + 受控/非受控值;vertical 纵向排列。',
      demo: <RadioGroupDemo />,
      code: `
import { useState } from 'react';
import { RadioGroup } from '@fluent-jade/ui';

export function GroupExample() {
  const [v, setV] = useState('mica');
  return (
    <RadioGroup
      value={v}
      onChange={setV}
      options={[
        { value: 'mica', label: 'Mica' },
        { value: 'acrylic', label: 'Acrylic' },
        { value: 'none', label: '纯色', disabled: true },
      ]}
    />
  );
}`,
    },
    {
      title: '卡片形态',
      description: 'RadioGroup 传 card 即整组卡片化(options.description 作为描述行),选中卡呈 accent 描边 + 浅充——「选择方案」类 UI 的标准形态。',
      demo: <RadioCardDemo />,
      code: `
import { useState } from 'react';
import { RadioGroup } from '@fluent-jade/ui';

export function RadioCardExample() {
  const [plan, setPlan] = useState('mica');
  return (
    <RadioGroup card value={plan} onChange={setPlan}
      options={[
        { value: 'mica', label: 'Mica', description: '桌面壁纸取色,性能开销最低。' },
        { value: 'acrylic', label: 'Acrylic', description: '实时磨砂,层次感最强。' },
        { value: 'none', label: '纯色', description: '不启用透明材质。', disabled: true },
      ]} />
  );
}`,
    },
    {
      title: '受控与单项卡片',
      description: '不走 RadioGroup 时,单个 Radio 也可用 checked + onChange 受控互斥;card + description 让单项直接卡片化。',
      demo: <RadioControlledCard />,
      code: `
import { useState } from 'react';
import { Radio } from '@fluent-jade/ui';

export function ControlledCardExample() {
  const [net, setNet] = useState('auto');
  return (
    <div className="flex gap-2">
      <Radio card checked={net === 'auto'} onChange={() => setNet('auto')}
             description="根据网络状况自动选择线路。">
        自动
      </Radio>
      <Radio card checked={net === 'direct'} onChange={() => setNet('direct')}
             description="始终直连,不走中转。">
        直连
      </Radio>
    </div>
  );
}`,
    },
    {
      title: '纵向与非受控',
      description: 'vertical 纵向排列;只给 defaultValue 即非受控;name 指定组名(表单提交 / 多组共存时显式声明,缺省自动生成)。',
      demo: (
        <RadioGroup vertical name="doc-appearance" defaultValue="acrylic"
          options={[
            { value: 'mica', label: 'Mica' },
            { value: 'acrylic', label: 'Acrylic' },
            { value: 'none', label: '纯色' },
          ]} />
      ),
      code: `
import { RadioGroup } from '@fluent-jade/ui';

export function VerticalUncontrolledExample() {
  return (
    <RadioGroup vertical name="appearance" defaultValue="acrylic"
      options={[
        { value: 'mica', label: 'Mica' },
        { value: 'acrylic', label: 'Acrylic' },
        { value: 'none', label: '纯色' },
      ]} />
  );
}`,
    },
    {
      title: '着色',
      description: 'color 作用于选中圆点与卡片描边;RadioGroup 可整组着色。',
      demo: (
        <div className="flex flex-col gap-3 items-start">
          <div className="flex flex-wrap gap-3">
            <Radio name="rc" defaultChecked color="success">成功</Radio>
            <Radio name="rc" color="warning">警告</Radio>
            <Radio name="rc" color="danger">危险</Radio>
          </div>
          <RadioGroup color="danger" defaultValue="a"
            options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />
        </div>
      ),
      code: `
import { Radio, RadioGroup } from '@fluent-jade/ui';

export function RadioColorExample() {
  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="flex flex-wrap gap-3">
        <Radio name="rc" defaultChecked color="success">成功</Radio>
        <Radio name="rc" color="warning">警告</Radio>
        <Radio name="rc" color="danger">危险</Radio>
      </div>
      <RadioGroup color="danger" defaultValue="a"
        options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:选中态随之变色。' },
    { name: 'checked / defaultChecked', type: 'boolean', description: '受控 / 非受控选中态(原生)。' },
    { name: 'name', type: 'string', description: '同组 Radio 须同 name 才互斥。' },
    { name: 'card', type: 'boolean', default: 'false', description: '卡片形态:整卡可点,选中 accent 描边 + 浅充。' },
    { name: 'description', type: 'ReactNode', description: '卡片形态的描述行。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
    { name: 'children', type: 'ReactNode', description: '标签文本(卡片形态下为标题)。' },
  ],
  extraApis: [
    {
      title: 'RadioGroup Props',
      rows: [
        { name: 'options', type: '{ value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }[]', description: '选项数组(description 仅卡片形态显示)。' },
        { name: 'value', type: 'string | null', description: '受控当前值。' },
        { name: 'defaultValue', type: 'string | null', default: 'null', description: '非受控初始值。' },
        { name: 'onChange', type: '(value: string) => void', description: '选中变化回调。' },
        { name: 'vertical', type: 'boolean', default: 'false', description: '纵向排列。' },
        { name: 'card', type: 'boolean', default: 'false', description: '整组卡片形态。' },
        { name: 'name', type: 'string', description: '组名,缺省自动生成。' },
      ],
    },
  ],
};

function RadioCardDemo() {
  const [plan, setPlan] = useState('mica');
  return (
    <RadioGroup card value={plan} onChange={setPlan}
      options={[
        { value: 'mica', label: 'Mica', description: '桌面壁纸取色,性能开销最低。' },
        { value: 'acrylic', label: 'Acrylic', description: '实时磨砂,层次感最强。' },
        { value: 'none', label: '纯色', description: '不启用透明材质。', disabled: true },
      ]} />
  );
}

function RadioControlledCard() {
  const [net, setNet] = useState('auto');
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Radio card checked={net === 'auto'} onChange={() => setNet('auto')}
             description="根据网络状况自动选择线路。">
        自动
      </Radio>
      <Radio card checked={net === 'direct'} onChange={() => setNet('direct')}
             description="始终直连,不走中转。">
        直连
      </Radio>
    </div>
  );
}

function RadioGroupDemo() {
  const [v, setV] = useState('mica');
  return (
    <RadioGroup value={v} onChange={setV}
                options={[
                  { value: 'mica', label: 'Mica' },
                  { value: 'acrylic', label: 'Acrylic' },
                  { value: 'none', label: '纯色', disabled: true },
                ]} />
  );
}

const toggle: DocDef = {
  key: 'switch',
  name: 'Switch',
  cn: '开关',
  description:
    '开关(ToggleSwitch)用于立即生效的双态设置,区别于需要提交的 Checkbox。WinUI 3 形态:40×20 轨道、滑珠悬停胀大、按压拉长。2026-07 起由 Toggle 改名 Switch(antd 惯例,并与 ToggleButton 区分),旧名 Toggle 保留为废弃别名。',
  importCode: `import { Switch } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <Switch defaultChecked>已开启</Switch>
          <Switch>已关闭</Switch>
          <Switch disabled>禁用</Switch>
          <Switch defaultChecked disabled>开启禁用</Switch>
        </>
      ),
      code: `
import { Switch } from '@fluent-jade/ui';

export function BasicExample() {
  return (
    <>
      <Switch defaultChecked>已开启</Switch>
      <Switch>已关闭</Switch>
      <Switch disabled>禁用</Switch>
      <Switch defaultChecked disabled>开启禁用</Switch>
    </>
  );
}`,
    },
    {
      title: '受控用法',
      demo: <ToggleControlled />,
      code: `
import { useState } from 'react';
import { Switch } from '@fluent-jade/ui';

export function ControlledExample() {
  const [on, setOn] = useState(false);
  return (
    <Switch checked={on} onChange={(e) => setOn(e.target.checked)}>
      深色模式({on ? '开' : '关'})
    </Switch>
  );
}`,
    },
    {
      title: '卡片形态',
      description: 'card 时标题 / 描述在左、轨道钉右,整卡可点,开启呈 accent 描边 + 浅充——设置项的行卡形态(比 SettingsCard 更轻,自带选中着色)。',
      demo: <SwitchCardDemo />,
      code: `
import { Switch } from '@fluent-jade/ui';

export function SwitchCardExample() {
  return (
    <div className="flex flex-col gap-2 w-[380px]">
      <Switch card defaultChecked description="窗口失焦后继续在后台接收消息。">
        后台运行
      </Switch>
      <Switch card description="使用硬件加速渲染(需重启生效)。">
        硬件加速
      </Switch>
      <Switch card disabled description="当前宿主不支持该能力。">
        触控优化
      </Switch>
    </div>
  );
}`,
    },
    {
      title: 'SwitchGroup 开关组',
      description: '与 CheckboxGroup 同构:options + string[] 值(已开启项的键集);配 card + vertical 一句声明摆出整块设置面板。',
      demo: <SwitchGroupDemo />,
      code: `
import { useState } from 'react';
import { SwitchGroup } from '@fluent-jade/ui';

export function SwitchGroupExample() {
  const [enabled, setEnabled] = useState(['bg', 'update']);
  return (
    <div className="flex flex-col gap-3 w-[380px]">
      <SwitchGroup card vertical value={enabled} onChange={setEnabled}
        options={[
          { value: 'bg', label: '后台运行', description: '窗口失焦后继续接收消息。' },
          { value: 'gpu', label: '硬件加速', description: '需重启生效。' },
          { value: 'update', label: '自动更新', description: '启动时检查新版本。' },
        ]} />
      <span className="text-(--text-2) text-[12.5px]">已开启:{enabled.join(', ') || '(无)'}</span>
    </div>
  );
}`,
    },
    {
      title: '非受控与整组禁用',
      description: '只给 defaultValue 即非受控,组内自维护「已开启项」键集;disabled 整组禁用(比逐项 options.disabled 更省事)。',
      demo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SwitchGroup defaultValue={['sound']}
            options={[
              { value: 'sound', label: '提示音' },
              { value: 'vibrate', label: '振动' },
            ]} />
          <SwitchGroup disabled defaultValue={['sync']}
            options={[
              { value: 'sync', label: '云同步' },
              { value: 'beta', label: '测试通道' },
            ]} />
        </div>
      ),
      code: `
import { SwitchGroup } from '@fluent-jade/ui';

export function UncontrolledDisabledExample() {
  return (
    <div className="flex flex-col gap-3">
      {/* defaultValue 非受控 */}
      <SwitchGroup defaultValue={['sound']}
        options={[
          { value: 'sound', label: '提示音' },
          { value: 'vibrate', label: '振动' },
        ]} />
      {/* disabled 整组禁用 */}
      <SwitchGroup disabled defaultValue={['sync']}
        options={[
          { value: 'sync', label: '云同步' },
          { value: 'beta', label: '测试通道' },
        ]} />
    </div>
  );
}`,
    },
    {
      title: '着色',
      description: 'color 作用于开启态轨道;SwitchGroup 可整组着色。',
      demo: (
        <div className="flex flex-col gap-3 items-start">
          <div className="flex flex-wrap gap-3">
            <Switch defaultChecked color="success">成功</Switch>
            <Switch defaultChecked color="warning">警告</Switch>
            <Switch defaultChecked color="danger">危险</Switch>
          </div>
          <SwitchGroup color="success" defaultValue={['wifi']}
            options={[{ value: 'wifi', label: 'Wi-Fi' }, { value: 'bt', label: '蓝牙' }]} />
        </div>
      ),
      code: `
import { Switch, SwitchGroup } from '@fluent-jade/ui';

export function SwitchColorExample() {
  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="flex flex-wrap gap-3">
        <Switch defaultChecked color="success">成功</Switch>
        <Switch defaultChecked color="warning">警告</Switch>
        <Switch defaultChecked color="danger">危险</Switch>
      </div>
      <SwitchGroup color="success" defaultValue={['wifi']}
        options={[{ value: 'wifi', label: 'Wi-Fi' }, { value: 'bt', label: '蓝牙' }]} />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:开启态轨道随之变色。' },
    { name: 'checked / defaultChecked', type: 'boolean', description: '受控 / 非受控开关态(原生 input 语义)。' },
    { name: 'card', type: 'boolean', default: 'false', description: '卡片形态:标题/描述在左、轨道钉右,开启 accent 描边 + 浅充。' },
    { name: 'description', type: 'ReactNode', description: '卡片形态的描述行。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
    { name: 'children', type: 'ReactNode', description: '标签文本(卡片形态下为标题)。' },
    { name: '...rest', type: 'InputHTMLAttributes', description: '透传原生 input 属性。' },
  ],
  extraApis: [
    {
      title: 'SwitchGroup Props',
      rows: [
        { name: 'options', type: '{ value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }[]', description: '选项数组(description 仅卡片形态显示)。' },
        { name: 'value / defaultValue', type: 'string[]', default: '[]', description: '受控 / 非受控「已开启项」键集。' },
        { name: 'onChange', type: '(values: string[]) => void', description: '任一开关切换时回调完整键集。' },
        { name: 'vertical', type: 'boolean', default: 'false', description: '纵向排列(设置面板形态)。' },
        { name: 'card', type: 'boolean', default: 'false', description: '整组卡片形态。' },
        { name: 'disabled', type: 'boolean', default: 'false', description: '整组禁用。' },
      ],
    },
  ],
  events: [
    { name: 'onChange', type: '(e: ChangeEvent<HTMLInputElement>) => void', description: '开关变化(读 e.target.checked)。' },
  ],
};

function ToggleControlled() {
  const [on, setOn] = useState(false);
  return <Switch checked={on} onChange={(e) => setOn(e.target.checked)}>深色模式({on ? '开' : '关'})</Switch>;
}

function SwitchGroupDemo() {
  const [enabled, setEnabled] = useState(['bg', 'update']);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 380 }}>
      <SwitchGroup card vertical value={enabled} onChange={setEnabled}
        options={[
          { value: 'bg', label: '后台运行', description: '窗口失焦后继续接收消息。' },
          { value: 'gpu', label: '硬件加速', description: '需重启生效。' },
          { value: 'update', label: '自动更新', description: '启动时检查新版本。' },
        ]} />
      <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>已开启:{enabled.join(', ') || '(无)'}</span>
    </div>
  );
}

function SwitchCardDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 380 }}>
      <Switch card defaultChecked description="窗口失焦后继续在后台接收消息。">后台运行</Switch>
      <Switch card description="使用硬件加速渲染(需重启生效)。">硬件加速</Switch>
      <Switch card disabled description="当前宿主不支持该能力。">触控优化</Switch>
    </div>
  );
}

const slider: DocDef = {
  key: 'slider',
  name: 'Slider',
  cn: '滑块条',
  description:
    '滑块条用于在连续或分档区间内取值。WinUI 3 形态:accent 填充、拖动时浮现位置气泡、可配刻度与两端标签;fillFrom 支持正负平衡形态。双端取值用 RangeSlider。始终受控(value + onChange)。',
  importCode: `import { Slider, RangeSlider } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: 'header 显示标题,showValue 在右侧实时显示当前值;拖动时滑珠上方浮现气泡。',
      demo: <SliderBasic />,
      code: `
import { useState } from 'react';
import { Slider } from '@fluent-jade/ui';

export function BasicExample() {
  const [v, setV] = useState(40);
  return (
    <div className="w-[280px]">
      <Slider header="音量" showValue value={v} onChange={setV} />
    </div>
  );
}`,
    },
    {
      title: '结束回调 onChangeEnd',
      description: 'onChange 在拖动中连续触发,适合驱动即时预览;onChangeEnd 在拖拽抬手 / 键盘松键时只触发一次,适合提交后端、写宿主配置等重操作。',
      demo: <SliderEnd />,
      code: `
import { useState } from 'react';
import { Slider } from '@fluent-jade/ui';

export function ChangeEndExample() {
  const [v, setV] = useState(30);            // 即时预览
  const [committed, setCommitted] = useState(30);
  return (
    <div className="w-[280px]">
      <Slider
        header="音量"
        showValue
        value={v}
        onChange={setV}            // 拖动中连续触发
        onChangeEnd={setCommitted} // 抬手时触发一次
      />
      <span>拖动中:{v} · 提交值:{committed}</span>
    </div>
  );
}`,
    },
    {
      title: '刻度与标签',
      description: 'ticks 按数据值间隔画小刻度,majorTicks 标主刻度;marks 在指定值下方放文本标签。',
      demo: <SliderTicks />,
      code: `
import { useState } from 'react';
import { Slider } from '@fluent-jade/ui';

export function TicksExample() {
  const [v, setV] = useState(50);
  return (
    <div className="w-[280px]">
      <Slider
        value={v}
        onChange={setV}
        step={5}
        ticks={5}
        majorTicks={25}
        marks={[[0, '静音'], [100, '最大']]}
        aria-label="带刻度"
      />
    </div>
  );
}`,
    },
    {
      title: '正负平衡形态',
      description: 'fillFrom 指定填充原点:如 min=-50 / max=50 / fillFrom=0,负值向左充、正值向右充,适合声道平衡、色温偏移类设置。',
      demo: <SliderBalance />,
      code: `
import { useState } from 'react';
import { Slider } from '@fluent-jade/ui';

export function BalanceExample() {
  const [v, setV] = useState(20);
  return (
    <div className="w-[280px]">
      <Slider
        header="声道平衡"
        showValue
        value={v}
        onChange={setV}
        min={-50}
        max={50}
        fillFrom={0}
        format={(n) => (n > 0 ? \`右 \${n}\` : n < 0 ? \`左 \${-n}\` : '居中')}
      />
    </div>
  );
}`,
    },
    {
      title: 'RangeSlider 双滑块',
      description: '两枚滑珠取一段区间,值为 [下限, 上限];交叉拖动会自动换位。min / max / step 定制取值区间与步进;onChangeEnd 在任一滑块交互结束时回调一次完整区间。',
      demo: <SliderRange />,
      code: `
import { useState } from 'react';
import { RangeSlider } from '@fluent-jade/ui';

export function RangeExample() {
  const [v, setV] = useState<[number, number]>([200, 600]);
  const [committed, setCommitted] = useState<[number, number]>([200, 600]);
  return (
    <div className="w-[280px]">
      <RangeSlider
        value={v}
        onChange={setV}
        onChangeEnd={setCommitted} // 抬手时回调一次完整区间
        min={0}
        max={1000}
        step={50}
        aria-label="价格区间"
      />
      <span>拖动中:{v[0]}~{v[1]} · 提交:{committed[0]}~{committed[1]}</span>
    </div>
  );
}`,
    },
    {
      title: '纵向与禁用',
      description: 'vertical 切换为纵向形态(轨道 200px 高,气泡移到左侧);disabled 禁用交互并降低不透明度。',
      demo: <SliderVerticalDisabled />,
      code: `
import { useState } from 'react';
import { Slider } from '@fluent-jade/ui';

export function VerticalDisabledExample() {
  const [v, setV] = useState(60);
  return (
    <div className="flex items-start gap-8">
      <Slider vertical header="亮度" showValue value={v} onChange={setV} />
      <div className="w-[220px]">
        <Slider header="禁用" showValue value={30} onChange={() => {}} disabled />
      </div>
    </div>
  );
}`,
    },
    {
      title: '着色',
      description: 'color 作用于轨道填充与拇指(含 RangeSlider)。',
      demo: <SliderColorDemo />,
      code: `
import { useState } from 'react';
import { RangeSlider, Slider } from '@fluent-jade/ui';

export function SliderColorExample() {
  const [v, setV] = useState(40);
  const [r, setR] = useState<[number, number]>([20, 70]);
  return (
    <div className="flex flex-col gap-4 w-[280px]">
      <Slider value={v} onChange={setV} color="success" header="成功" showValue />
      <Slider value={v} onChange={setV} color="warning" header="警告" showValue />
      <Slider value={v} onChange={setV} color="danger" header="危险" showValue />
      <RangeSlider value={r} onChange={setR} color="success" aria-label="区间" />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:轨道填充随之变色(RangeSlider 同)。' },
    { name: 'value', type: 'number', description: '当前值(必填,受控)。' },
    { name: 'min / max', type: 'number', default: '0 / 100', description: '取值区间。' },
    { name: 'step', type: 'number', default: '1', description: '步进。' },
    { name: 'format', type: '(v: number) => string', default: 'String', description: '气泡与 showValue 的显示格式。' },
    { name: 'ticks / majorTicks', type: 'number', description: '小刻度 / 主刻度间隔(数据值)。' },
    { name: 'marks', type: '[number, string][]', description: '指定值位置的文本标签。' },
    { name: 'fillFrom', type: 'number', description: '填充原点值;缺省从 min 端填充。' },
    { name: 'vertical', type: 'boolean', default: 'false', description: '纵向形态。' },
    { name: 'header / showValue', type: 'string / boolean', description: '标题行与实时值显示。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
  ],
  events: [
    { name: 'onChange', type: '(value: number) => void', description: '拖动/键盘调整时连续回调。' },
    { name: 'onChangeEnd', type: '(value: number) => void', description: '一次交互结束(拖拽抬手 / 键盘松键)时回调一次。' },
  ],
  extraApis: [
    {
      title: 'RangeSlider Props',
      rows: [
        { name: 'value', type: '[number, number]', description: '当前区间 [下限, 上限](必填,受控)。' },
        { name: 'onChange', type: '(value: [number, number]) => void', description: '区间变化回调。' },
        { name: 'onChangeEnd', type: '(value: [number, number]) => void', description: '任一滑块交互结束时回调一次(整个区间)。' },
        { name: 'min / max / step', type: 'number', default: '0 / 100 / 1', description: '取值区间与步进。' },
      ],
    },
  ],
};

const numberbox: DocDef = {
  key: 'numberbox',
  name: 'NumberBox',
  cn: '数值输入框',
  description:
    '数值输入框 = 文本输入 + WinUI 3 内联 SpinButton:两个全高调节钮横排在框内右端 [∧][∨],按住 400ms 后连发,聚焦时滚轮微调;失焦或回车提交文本并钳制到 min/max。',
  importCode: `import { NumberBox } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: '支持受控(value)与非受控(defaultValue);按住调节钮可连发。',
      demo: (
        <>
          <NumberBox defaultValue={8} min={0} max={100} aria-label="数量" />
          <NumberBox defaultValue={0.5} step={0.1} min={0} max={1} aria-label="不透明度" />
        </>
      ),
      code: `
import { NumberBox } from '@fluent-jade/ui';

export function BasicExample() {
  return (
    <>
      <NumberBox defaultValue={8} min={0} max={100} aria-label="数量" />
      <NumberBox defaultValue={0.5} step={0.1} min={0} max={1} aria-label="不透明度" />
    </>
  );
}`,
    },
    {
      title: '尺寸与状态',
      description: '与 Button 同款三档尺寸;status 标注校验状态。',
      demo: (
        <>
          <NumberBox size="small" defaultValue={1} aria-label="小" />
          <NumberBox defaultValue={2} aria-label="中" />
          <NumberBox size="large" defaultValue={3} aria-label="大" />
          <NumberBox status="error" defaultValue={999} aria-label="错误" />
        </>
      ),
      code: `
import { NumberBox } from '@fluent-jade/ui';

export function SizeStatusExample() {
  return (
    <>
      <NumberBox size="small" defaultValue={1} aria-label="小" />
      <NumberBox defaultValue={2} aria-label="中" />
      <NumberBox size="large" defaultValue={3} aria-label="大" />
      <NumberBox status="error" defaultValue={999} aria-label="错误" />
    </>
  );
}`,
    },
    {
      title: '受控与精度',
      description: 'value + onChange 组成受控;precision 固定小数位,调节钮与手输提交都舍入到该位数。',
      demo: <NumberBoxControlled />,
      code: `
import { useState } from 'react';
import { NumberBox } from '@fluent-jade/ui';

export function ControlledPrecisionExample() {
  const [v, setV] = useState(2.5);
  return (
    <div className="flex items-center gap-3">
      <NumberBox value={v} onChange={setV} precision={1}
                 step={0.5} min={0} max={10} aria-label="缩放倍率" />
      <span>当前:{v.toFixed(1)}x</span>
    </div>
  );
}`,
    },
    {
      title: '着色与圆角',
      description: 'color 作用于聚焦下划线;radius 四档作用于输入框圆角。',
      demo: (
        <div className="flex flex-col gap-3 items-start">
          <NumberBox defaultValue={3} color="success" />
          <NumberBox defaultValue={3} color="danger" />
          <div className="flex flex-wrap gap-2">
            <NumberBox defaultValue={1} radius="none" />
            <NumberBox defaultValue={1} radius="sm" />
            <NumberBox defaultValue={1} radius="lg" />
          </div>
        </div>
      ),
      code: `
import { NumberBox } from '@fluent-jade/ui';

export function NumberBoxColorRadiusExample() {
  return (
    <div className="flex flex-col gap-3 items-start">
      <NumberBox defaultValue={3} color="success" />
      <NumberBox defaultValue={3} color="danger" />
      <div className="flex flex-wrap gap-2">
        <NumberBox defaultValue={1} radius="none" />
        <NumberBox defaultValue={1} radius="sm" />
        <NumberBox defaultValue={1} radius="lg" />
      </div>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:聚焦下划线随之变色。' },
    { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: '圆角档位。' },
    { name: 'value', type: 'number', description: '受控值。' },
    { name: 'defaultValue', type: 'number', default: '0', description: '非受控初始值。' },
    { name: 'min / max', type: 'number', default: '±Infinity', description: '钳制区间。' },
    { name: 'step', type: 'number', default: '1', description: '调节钮与滚轮的步进;小数步进自动消除浮点误差(0.5+0.1 恒为 0.6)。' },
    { name: 'precision', type: 'number', description: '固定小数位:调节与手输提交都舍入到该位数;不传则按值与 step 的小数位自动处理。' },
    { name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '三档高度。' },
    { name: 'status', type: "'error' | 'warning'", description: '校验状态描边。' },
  ],
  events: [
    { name: 'onChange', type: '(value: number) => void', description: '值提交时回调(调节钮即时、文本失焦/回车提交)。' },
  ],
};

const rating: DocDef = {
  key: 'rating',
  name: 'Rating',
  cn: '评分',
  description:
    '评分对应 WinUI RatingControl:整星打分,悬停实时预览,聚焦后方向键调整。readOnly 用于只读展示。',
  importCode: `import { Rating } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <RatingDemo />,
      code: `
import { useState } from 'react';
import { Rating } from '@fluent-jade/ui';

export function BasicExample() {
  const [v, setV] = useState(3);
  return <Rating value={v} onChange={setV} aria-label="评分" />;
}`,
    },
    {
      title: '只读与自定义',
      description: 'max 改总星数,size 改星尺寸。',
      demo: (
        <>
          <Rating defaultValue={4} readOnly aria-label="只读评分" />
          <Rating defaultValue={6} max={10} size={14} aria-label="十星评分" />
        </>
      ),
      code: `
import { Rating } from '@fluent-jade/ui';

export function ReadOnlyExample() {
  return (
    <>
      <Rating defaultValue={4} readOnly aria-label="只读评分" />
      <Rating defaultValue={6} max={10} size={14} aria-label="十星评分" />
    </>
  );
}`,
    },
    {
      title: '着色',
      description: 'color 作用于点亮星的颜色。',
      demo: (
        <div className="flex flex-col gap-2 items-start">
          <Rating defaultValue={4} color="success" />
          <Rating defaultValue={3} color="warning" />
          <Rating defaultValue={2} color="danger" />
        </div>
      ),
      code: `
import { Rating } from '@fluent-jade/ui';

export function RatingColorExample() {
  return (
    <div className="flex flex-col gap-2 items-start">
      <Rating defaultValue={4} color="success" />
      <Rating defaultValue={3} color="warning" />
      <Rating defaultValue={2} color="danger" />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:点亮星随之变色。' },
    { name: 'value / defaultValue', type: 'number', default: '0', description: '受控 / 非受控星数。' },
    { name: 'max', type: 'number', default: '5', description: '总星数。' },
    { name: 'readOnly', type: 'boolean', default: 'false', description: '只读展示。' },
    { name: 'size', type: 'number', default: '18', description: '单星像素。' },
  ],
  events: [
    { name: 'onChange', type: '(value: number) => void', description: '打分回调。' },
  ],
};

function RatingDemo() {
  const [v, setV] = useState(3);
  return <Rating value={v} onChange={setV} aria-label="评分" />;
}

function NumberBoxControlled() {
  const [v, setV] = useState(2.5);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <NumberBox value={v} onChange={setV} precision={1} step={0.5} min={0} max={10} aria-label="缩放倍率" />
      <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>当前:{v.toFixed(1)}x</span>
    </div>
  );
}

function ColorPickerControlled() {
  const [c, setC] = useState('#4CC2FF');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <ColorPicker value={c} onChange={setC} showText />
      <span style={{ color: c, fontSize: 12.5 }}>强调色预览</span>
      <ColorPicker value={c} disabled aria-label="禁用(跟随左侧)" />
    </div>
  );
}

const colorpicker: DocDef = {
  key: 'colorpicker',
  name: 'ColorPicker',
  cn: '颜色选择器',
  description:
    '颜色选择器:触发器色块 + 浮层内 SV 面板、色相/透明度滑条、Hex 输入与预设色。内部以 HSV 保存状态(饱和度归零不丢色相);拖拽过程仅更新视觉,抬手时才发出 onChange。浮层 portal 到 body(fixed 跟随锚点),不会被父容器 overflow 裁切。输出 #RRGGBB / #RRGGBBAA。',
  importCode: `import { ColorPicker } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: 'showText 在触发器旁显示 Hex 值。',
      demo: (
        <>
          <ColorPicker defaultValue="#4CC2FF" showText />
          <ColorPicker defaultValue="#D13438" />
        </>
      ),
      code: `
import { ColorPicker } from '@fluent-jade/ui';

export function BasicExample() {
  return (
    <>
      <ColorPicker defaultValue="#4CC2FF" showText />
      <ColorPicker defaultValue="#D13438" />
    </>
  );
}`,
    },
    {
      title: '预设与禁用透明度',
      description: 'presets 在面板底部排出预设色块;disabledAlpha 隐藏透明度滑条,输出恒为 #RRGGBB。',
      demo: (
        <ColorPicker defaultValue="#0078D4" showText disabledAlpha
                     presets={['#0078D4', '#4CC2FF', '#D13438', '#107C10', '#FFB900', '#8764B8']} />
      ),
      code: `
import { ColorPicker } from '@fluent-jade/ui';

export function PresetsExample() {
  return (
    <ColorPicker
      defaultValue="#0078D4"
      showText
      disabledAlpha
      presets={['#0078D4', '#4CC2FF', '#D13438', '#107C10', '#FFB900', '#8764B8']}
    />
  );
}`,
    },
    {
      title: '受控与禁用',
      description: 'value + onChange 组成受控,可与外部预览联动;disabled 禁用触发器(仍显示当前色)。',
      demo: <ColorPickerControlled />,
      code: `
import { useState } from 'react';
import { ColorPicker } from '@fluent-jade/ui';

export function ControlledExample() {
  const [c, setC] = useState('#4CC2FF');
  return (
    <div className="flex items-center gap-3">
      <ColorPicker value={c} onChange={setC} showText />
      <span style={{ color: c }}>强调色预览</span>
      {/* 同一受控值的禁用实例:跟随左侧变色,但不可打开面板 */}
      <ColorPicker value={c} disabled aria-label="禁用(跟随左侧)" />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'value / defaultValue', type: 'string', default: "'#0078D4'", description: '受控 / 非受控 Hex 值。' },
    { name: 'showText', type: 'boolean', default: 'false', description: '触发器旁显示 Hex 文本。' },
    { name: 'presets', type: 'string[]', description: '面板底部预设色。' },
    { name: 'disabledAlpha', type: 'boolean', default: 'false', description: '禁用透明度通道。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
  ],
  events: [
    { name: 'onChange', type: '(hex: string) => void', description: '颜色确定时回调:拖拽抬手一次;Hex 输入 / 预设点击即时。' },
  ],
};

const upload: DocDef = {
  key: 'upload',
  name: 'Upload',
  cn: '上传',
  description:
    '文件上传,antd API:fileList 受控、beforeUpload 拦截、customRequest 自定义传输(不传则文件仅收集为 done——桌面应用常态)。Upload.Dragger 为整块拖放区。注意:JadeView 宿主注册 drag-drop 后会接管 DOM 拖放,此时应改走宿主 IPC,点击选择始终可用。',
  importCode: `import { Upload } from '@fluent-jade/ui';`,
  sections: [
    {
      title: '基础用法',
      description: 'children 作为触发器;customRequest 模拟了一次带进度的上传。',
      demo: (
        <Upload multiple customRequest={fakeRequest}>
          <Button>选择文件</Button>
        </Upload>
      ),
      code: `
import { Button, Upload, type UploadRequestOptions } from '@fluent-jade/ui';

// 模拟一次带进度的上传;实际使用时交给宿主/后端,进度回调驱动文件行进度条
const fakeRequest = ({ onProgress, onSuccess }: UploadRequestOptions) => {
  let p = 0;
  const t = setInterval(() => {
    p += 20;
    if (p >= 100) { clearInterval(t); onSuccess(); } else onProgress(p);
  }, 180);
};

export function BasicExample() {
  return (
    <Upload multiple customRequest={fakeRequest}>
      <Button>选择文件</Button>
    </Upload>
  );
}`,
    },
    {
      title: 'Dragger 拖放区',
      description: 'WinUI 虚线框,拖入时变为 accent 实线;maxCount 限制数量,beforeUpload 返回 false 拒收。',
      demo: (
        <div style={{ width: 360 }}>
          <Upload.Dragger maxCount={3} customRequest={fakeRequest}
                          beforeUpload={(f) => f.size < 5 * 1024 * 1024} />
        </div>
      ),
      code: `
import { Upload, type UploadRequestOptions } from '@fluent-jade/ui';

// 模拟一次带进度的上传
const fakeRequest = ({ onProgress, onSuccess }: UploadRequestOptions) => {
  let p = 0;
  const t = setInterval(() => {
    p += 20;
    if (p >= 100) { clearInterval(t); onSuccess(); } else onProgress(p);
  }, 180);
};

export function DraggerExample() {
  return (
    <div className="w-[360px]">
      <Upload.Dragger
        maxCount={3}
        beforeUpload={(f) => f.size < 5 * 1024 * 1024}
        customRequest={fakeRequest}
      />
    </div>
  );
}`,
    },
    {
      title: '成功后自动移除状态',
      description:
        'autoDismiss 让上传成功的文件行自动消失:true = 2000ms,数字为自定义毫秒数。只移除 done 项(error 保留待用户处理),移除经 onChange 通知、不触发 onRemove。适合"传完即走"的反馈场景,失败行仍会留下。',
      demo: (
        <div style={{ width: 360 }}>
          <Upload.Dragger customRequest={fakeRequest} autoDismiss={1500}
                          hint="拖入文件,成功 1.5s 后状态行自动消失" />
        </div>
      ),
      code: `
import { Upload, type UploadRequestOptions } from '@fluent-jade/ui';

// 模拟一次带进度的上传
const fakeRequest = ({ onProgress, onSuccess }: UploadRequestOptions) => {
  let p = 0;
  const t = setInterval(() => {
    p += 20;
    if (p >= 100) { clearInterval(t); onSuccess(); } else onProgress(p);
  }, 180);
};

export function AutoDismissExample() {
  return (
    <div className="w-[360px]">
      {/* 成功 1.5s 后自动移除状态行;autoDismiss 也可传 true(2000ms) */}
      <Upload.Dragger
        customRequest={fakeRequest}
        autoDismiss={1500}
        hint="拖入文件,成功 1.5s 后状态行自动消失"
      />
    </div>
  );
}`,
    },
    {
      title: '受控列表与事件',
      description:
        'fileList 完全受控:在 onChange 里把回调的 fileList 写回 state 即接受变更。UploadFile 结构 { uid, name, size, status, percent, raw }:预置行手工构造(无 raw),经 DOM 选择的行带 raw 原始 File;accept 过滤可选类型,onRemove 在移除文件行时触发。',
      demo: <UploadControlled />,
      code: `
import { useState } from 'react';
import { Button, Upload, type UploadFile, type UploadRequestOptions } from '@fluent-jade/ui';

// 模拟一次带进度的上传
const fakeRequest = ({ onProgress, onSuccess }: UploadRequestOptions) => {
  let p = 0;
  const t = setInterval(() => {
    p += 20;
    if (p >= 100) { clearInterval(t); onSuccess(); } else onProgress(p);
  }, 180);
};

export function ControlledListExample() {
  // 预置文件行:uid / name / size / status / percent 手工构造(raw 仅 DOM 选择时存在)
  const [files, setFiles] = useState<UploadFile[]>([
    { uid: 'preset-1', name: '设计稿.fig', size: 2 * 1024 * 1024, status: 'done' },
    { uid: 'preset-2', name: '截图.png', size: 640 * 1024, status: 'uploading', percent: 45 },
  ]);
  const [last, setLast] = useState('');
  return (
    <div className="w-[360px] flex flex-col gap-2">
      <Upload
        fileList={files}
        accept="image/*,.pdf"
        customRequest={fakeRequest}
        onChange={({ file, fileList }) => {
          setFiles(fileList); // 受控:写回即接受变更
          setLast(file.name + (file.raw ? '(本次选择)' : '(预置)'));
        }}
        onRemove={(f) => setLast('已移除 ' + f.name)}
      >
        <Button>选择图片或 PDF</Button>
      </Upload>
      {last && <span>最近变更:{last}</span>}
    </div>
  );
}`,
    },
    {
      title: '非受控、隐藏列表与禁用',
      description: 'defaultFileList 给非受控初始列表;showFileList={false} 关掉内置文件行(配 onChange 自绘);disabled 禁用选择与拖放。',
      demo: <UploadMiscDemo />,
      code: `
import { useState } from 'react';
import { Button, Upload } from '@fluent-jade/ui';

export function ListModesExample() {
  const [names, setNames] = useState<string[]>([]);
  return (
    <div className="w-[360px] flex flex-col gap-3">
      {/* defaultFileList:非受控初始列表,后续变更由组件内部维护 */}
      <Upload defaultFileList={[{ uid: 'preset-a', name: '预置附件.zip', size: 10 * 1024, status: 'done' }]}>
        <Button>追加文件(非受控)</Button>
      </Upload>
      {/* showFileList={false}:隐藏内置文件行,用 onChange 自绘 */}
      <Upload showFileList={false} onChange={({ fileList }) => setNames(fileList.map((f) => f.name))}>
        <Button>隐藏内置列表</Button>
      </Upload>
      {names.length > 0 && <span>自绘列表:{names.join('、')}</span>}
      {/* disabled:触发器与拖放均不可用 */}
      <Upload disabled>
        <Button disabled>已禁用</Button>
      </Upload>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'fileList / defaultFileList', type: 'UploadFile[]', description: '受控 / 非受控文件列表。' },
    { name: 'accept', type: 'string', description: '文件类型过滤(原生 accept)。' },
    { name: 'multiple', type: 'boolean', default: 'false', description: '多选。' },
    { name: 'maxCount', type: 'number', description: '数量上限,超出忽略。' },
    { name: 'beforeUpload', type: '(file: File) => boolean | Promise<boolean>', description: '返回 false / reject 拒收该文件。' },
    { name: 'customRequest', type: '(options: UploadRequestOptions) => void', description: '自定义传输:{ file, onProgress, onSuccess, onError }。' },
    { name: 'autoDismiss', type: 'boolean | number', default: 'false', description: '成功后自动移除该文件行:true = 2000ms,数字为毫秒数;error 行保留。' },
    { name: 'showFileList', type: 'boolean', default: 'true', description: '显示文件行列表。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用。' },
  ],
  events: [
    { name: 'onChange', type: '({ file, fileList }) => void', description: '列表任何变化(新增/进度/完成/失败/移除)。' },
    { name: 'onRemove', type: '(file: UploadFile) => void', description: '移除文件行。' },
  ],
  extraApis: [
    {
      title: 'UploadFile',
      rows: [
        { name: 'uid / name / size', type: 'string / string / number', description: '唯一键、文件名、字节数。' },
        { name: 'status', type: "'done' | 'uploading' | 'error'", description: '状态。' },
        { name: 'percent', type: 'number', description: '上传进度 0~100。' },
        { name: 'raw', type: 'File', description: '原始 File(经 DOM 选择/拖放时存在)。' },
      ],
    },
  ],
};

function UploadControlled() {
  const [files, setFiles] = useState<UploadFile[]>([
    { uid: 'preset-1', name: '设计稿.fig', size: 2 * 1024 * 1024, status: 'done' },
    { uid: 'preset-2', name: '截图.png', size: 640 * 1024, status: 'uploading', percent: 45 },
  ]);
  const [last, setLast] = useState('');
  return (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Upload
        fileList={files}
        accept="image/*,.pdf"
        customRequest={fakeRequest}
        onChange={({ file, fileList }) => {
          setFiles(fileList);
          setLast(file.name + (file.raw ? '(本次选择)' : '(预置)'));
        }}
        onRemove={(f) => setLast('已移除 ' + f.name)}
      >
        <Button>选择图片或 PDF</Button>
      </Upload>
      {last && <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>最近变更:{last}</span>}
    </div>
  );
}

function UploadMiscDemo() {
  const [names, setNames] = useState<string[]>([]);
  return (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Upload defaultFileList={[{ uid: 'preset-a', name: '预置附件.zip', size: 10 * 1024, status: 'done' }]}>
        <Button>追加文件(非受控)</Button>
      </Upload>
      <Upload showFileList={false} onChange={({ fileList }) => setNames(fileList.map((f) => f.name))}>
        <Button>隐藏内置列表</Button>
      </Upload>
      {names.length > 0 && (
        <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>自绘列表:{names.join('、')}</span>
      )}
      <Upload disabled>
        <Button disabled>已禁用</Button>
      </Upload>
    </div>
  );
}

export const inputDocs: DocDef[] = [checkbox, radio, toggle, slider, numberbox, rating, colorpicker, upload];

function SliderColorDemo() {
  const [v, setV] = useState(40);
  const [r, setR] = useState<[number, number]>([20, 70]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 280 }}>
      <Slider value={v} onChange={setV} color="success" header="成功" showValue />
      <Slider value={v} onChange={setV} color="warning" header="警告" showValue />
      <Slider value={v} onChange={setV} color="danger" header="危险" showValue />
      <RangeSlider value={r} onChange={setR} color="success" aria-label="区间" />
    </div>
  );
}
