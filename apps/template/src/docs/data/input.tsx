/* 文档数据:输入 — Checkbox / Radio / Switch / Slider / NumberBox / Rating / ColorPicker / Upload */
import { useState } from 'react';
import {
  Button, Checkbox, CheckboxGroup, ColorPicker, NumberBox, Radio, RadioGroup, RangeSlider,
  Rating, Slider, Switch, SwitchGroup, Upload, type UploadRequestOptions,
} from '@fluent-react/ui';
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
  const [v, setV] = useState<[number, number]>([20, 60]);
  return <div style={{ width: 280 }}><RangeSlider value={v} onChange={setV} aria-label="价格区间" /></div>;
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
  importCode: `import { Checkbox } from '@fluent-react/ui';`,
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
import { Checkbox } from '@fluent-react/ui';

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
import { Checkbox } from '@fluent-react/ui';

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
import { CheckboxGroup } from '@fluent-react/ui';

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
import { Checkbox, CheckboxGroup } from '@fluent-react/ui';

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
import { Checkbox, CheckboxGroup } from '@fluent-react/ui';

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
  ],
  props: [
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
  importCode: `import { Radio, RadioGroup } from '@fluent-react/ui';`,
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
import { Radio } from '@fluent-react/ui';

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
import { RadioGroup } from '@fluent-react/ui';

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
import { RadioGroup } from '@fluent-react/ui';

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
  ],
  props: [
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
  importCode: `import { Switch } from '@fluent-react/ui';`,
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
import { Switch } from '@fluent-react/ui';

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
import { Switch } from '@fluent-react/ui';

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
import { Switch } from '@fluent-react/ui';

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
import { SwitchGroup } from '@fluent-react/ui';

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
  ],
  props: [
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
  importCode: `import { Slider, RangeSlider } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      description: 'header 显示标题,showValue 在右侧实时显示当前值;拖动时滑珠上方浮现气泡。',
      demo: <SliderBasic />,
      code: `
import { useState } from 'react';
import { Slider } from '@fluent-react/ui';

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
import { Slider } from '@fluent-react/ui';

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
import { Slider } from '@fluent-react/ui';

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
import { Slider } from '@fluent-react/ui';

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
      description: '两枚滑珠取一段区间,值为 [下限, 上限];交叉拖动会自动换位。',
      demo: <SliderRange />,
      code: `
import { useState } from 'react';
import { RangeSlider } from '@fluent-react/ui';

export function RangeExample() {
  const [v, setV] = useState<[number, number]>([20, 60]);
  return (
    <div className="w-[280px]">
      <RangeSlider value={v} onChange={setV} aria-label="价格区间" />
    </div>
  );
}`,
    },
  ],
  props: [
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
  importCode: `import { NumberBox } from '@fluent-react/ui';`,
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
import { NumberBox } from '@fluent-react/ui';

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
import { NumberBox } from '@fluent-react/ui';

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
  ],
  props: [
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
  importCode: `import { Rating } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <RatingDemo />,
      code: `
import { useState } from 'react';
import { Rating } from '@fluent-react/ui';

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
import { Rating } from '@fluent-react/ui';

export function ReadOnlyExample() {
  return (
    <>
      <Rating defaultValue={4} readOnly aria-label="只读评分" />
      <Rating defaultValue={6} max={10} size={14} aria-label="十星评分" />
    </>
  );
}`,
    },
  ],
  props: [
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

const colorpicker: DocDef = {
  key: 'colorpicker',
  name: 'ColorPicker',
  cn: '颜色选择器',
  description:
    '颜色选择器:触发器色块 + 浮层内 SV 面板、色相/透明度滑条、Hex 输入与预设色。内部以 HSV 保存状态(饱和度归零不丢色相);拖拽过程仅更新视觉,抬手时才发出 onChange。浮层 portal 到 body(fixed 跟随锚点),不会被父容器 overflow 裁切。输出 #RRGGBB / #RRGGBBAA。',
  importCode: `import { ColorPicker } from '@fluent-react/ui';`,
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
import { ColorPicker } from '@fluent-react/ui';

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
import { ColorPicker } from '@fluent-react/ui';

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
  importCode: `import { Upload } from '@fluent-react/ui';`,
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
import { Button, Upload, type UploadRequestOptions } from '@fluent-react/ui';

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
import { Upload, type UploadRequestOptions } from '@fluent-react/ui';

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
  ],
  props: [
    { name: 'fileList / defaultFileList', type: 'UploadFile[]', description: '受控 / 非受控文件列表。' },
    { name: 'accept', type: 'string', description: '文件类型过滤(原生 accept)。' },
    { name: 'multiple', type: 'boolean', default: 'false', description: '多选。' },
    { name: 'maxCount', type: 'number', description: '数量上限,超出忽略。' },
    { name: 'beforeUpload', type: '(file: File) => boolean | Promise<boolean>', description: '返回 false / reject 拒收该文件。' },
    { name: 'customRequest', type: '(options: UploadRequestOptions) => void', description: '自定义传输:{ file, onProgress, onSuccess, onError }。' },
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

export const inputDocs: DocDef[] = [checkbox, radio, toggle, slider, numberbox, rating, colorpicker, upload];
