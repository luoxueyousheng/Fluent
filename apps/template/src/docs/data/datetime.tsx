/* 文档数据:日期时间 — Calendar / DatePicker / TimePicker */
import { useState } from 'react';
import { Calendar, DatePicker, RangePicker, TimePicker, formatDate } from '@fluent-react/ui';
import type { DocDef } from '../types';

const calendar: DocDef = {
  key: 'calendar',
  name: 'Calendar',
  cn: '日历',
  description:
    'WinUI CalendarView:日 / 月 / 年三级缩放视图——点标题上钻、点格子下钻;周一起始,今日 accent 描边、选中 accent 实底。原生 Date,无第三方日期库。',
  importCode: `import { Calendar } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <CalendarDemo />,
      code: `import { useState } from 'react';
import { Calendar, formatDate } from '@fluent-react/ui';

export function CalendarBasicExample() {
  // 受控用法:value + onChange
  const [d, setD] = useState<Date | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <Calendar value={d} onChange={setD} />
      <span className="text-(--text-2) text-[12.5px]">
        已选:{d ? formatDate(d) : '(未选择)'}
      </span>
    </div>
  );
}`,
    },
    {
      title: '禁用日期',
      description: 'disabledDate 按日回调,返回 true 即不可选(示例禁用周末)。',
      demo: <Calendar disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6} />,
      code: `import { Calendar } from '@fluent-react/ui';

export function CalendarDisabledDateExample() {
  // disabledDate 按日回调,返回 true 即不可选(此处禁用周末)
  return <Calendar disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6} />;
}`,
    },
  ],
  props: [
    { name: 'value / defaultValue', type: 'Date | null', default: 'null', description: '受控 / 非受控选中日期。' },
    { name: 'disabledDate', type: '(date: Date) => boolean', description: '返回 true 的日期不可选。' },
  ],
  events: [
    { name: 'onChange', type: '(date: Date) => void', description: '点选日期回调。' },
  ],
};

function CalendarDemo() {
  const [d, setD] = useState<Date | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Calendar value={d} onChange={setD} />
      <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>
        已选:{d ? formatDate(d) : '(未选择)'}
      </span>
    </div>
  );
}

const datepicker: DocDef = {
  key: 'datepicker',
  name: 'DatePicker',
  cn: '日期选择器',
  description:
    '触发器 + Calendar 浮层;有值时尾部图标切换为清除键(allowClear)。浮层自适应方向:下方放不下自动上翻。format 控制显示格式。',
  importCode: `import { DatePicker } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <DatePicker aria-label="选择日期" />
          <DatePicker defaultValue={new Date()} format="YYYY年MM月DD日" aria-label="中文格式" />
        </>
      ),
      code: `import { DatePicker } from '@fluent-react/ui';

export function DatePickerBasicExample() {
  return (
    <>
      <DatePicker aria-label="选择日期" />
      {/* format 控制显示格式(YYYY / MM / DD / HH / mm) */}
      <DatePicker defaultValue={new Date()} format="YYYY年MM月DD日" aria-label="中文格式" />
    </>
  );
}`,
    },
    {
      title: '禁用日期与不可清除',
      demo: (
        <DatePicker allowClear={false} defaultValue={new Date()}
                    disabledDate={(d) => d.getTime() > Date.now()} aria-label="仅限过去" />
      ),
      code: `import { DatePicker } from '@fluent-react/ui';

export function DatePickerDisabledExample() {
  // allowClear={false} 不显示清除键;disabledDate 禁掉未来日期
  return (
    <DatePicker
      allowClear={false}
      defaultValue={new Date()}
      disabledDate={(d) => d.getTime() > Date.now()}
      aria-label="仅限过去"
    />
  );
}`,
    },
  ],
  props: [
    { name: 'value / defaultValue', type: 'Date | null', default: 'null', description: '受控 / 非受控值。' },
    { name: 'format', type: 'string', default: "'YYYY-MM-DD'", description: '显示格式(YYYY / MM / DD / HH / mm)。' },
    { name: 'placeholder', type: 'string', default: "'选择日期'", description: '空值占位。' },
    { name: 'disabledDate', type: '(date: Date) => boolean', description: '不可选日期。' },
    { name: 'allowClear', type: 'boolean', default: 'true', description: '有值时显示清除键。' },
  ],
  events: [
    { name: 'onChange', type: '(date: Date | null) => void', description: '选中或清除时回调。' },
  ],
};

const rangepicker: DocDef = {
  key: 'rangepicker',
  name: 'RangePicker',
  cn: '日期范围',
  description:
    '单面板两次点击取一段日期:先点起点、悬停实时预览区间着色、再点终点即提交并关闭(顺序颠倒自动排序)。常配 Table 做日志 / 记录筛选。',
  importCode: `import { RangePicker } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <RangePickerDemo />,
      code: `import { useState } from 'react';
import { RangePicker, formatDate } from '@fluent-react/ui';

export function RangePickerBasicExample() {
  // 受控用法:onChange 在选完终点时提交(起止已排序)
  const [r, setR] = useState<[Date, Date] | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <RangePicker value={r} onChange={setR} aria-label="日期范围" />
      <span className="text-(--text-2) text-[12.5px]">
        已选:{r ? \`\${formatDate(r[0])} ~ \${formatDate(r[1])}\` : '(未选择)'}
      </span>
    </div>
  );
}`,
    },
    {
      title: '限制与格式',
      demo: (
        <RangePicker format="MM月DD日" placeholder={['起', '止']}
                     disabledDate={(d) => d.getTime() > Date.now()} aria-label="仅限过去" />
      ),
      code: `import { RangePicker } from '@fluent-react/ui';

export function RangePickerFormatExample() {
  // format 控制显示格式;disabledDate 禁掉未来日期
  return (
    <RangePicker
      format="MM月DD日"
      placeholder={['起', '止']}
      disabledDate={(d) => d.getTime() > Date.now()}
      aria-label="仅限过去"
    />
  );
}`,
    },
  ],
  props: [
    { name: 'value / defaultValue', type: '[Date, Date] | null', default: 'null', description: '受控 / 非受控区间。' },
    { name: 'format', type: 'string', default: "'YYYY-MM-DD'", description: '显示格式。' },
    { name: 'placeholder', type: '[string, string]', default: "['开始日期', '结束日期']", description: '两端占位。' },
    { name: 'disabledDate', type: '(date: Date) => boolean', description: '不可选日期。' },
    { name: 'allowClear', type: 'boolean', default: 'true', description: '有值时显示清除键。' },
  ],
  events: [
    { name: 'onChange', type: '(range: [Date, Date] | null) => void', description: '选完终点提交或清除时回调(已排序)。' },
  ],
};

function RangePickerDemo() {
  const [r, setR] = useState<[Date, Date] | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <RangePicker value={r} onChange={setR} aria-label="日期范围" />
      <span style={{ color: 'var(--text-2)', fontSize: 12.5 }}>
        已选:{r ? `${formatDate(r[0])} ~ ${formatDate(r[1])}` : '(未选择)'}
      </span>
    </div>
  );
}

const timepicker: DocDef = {
  key: 'timepicker',
  name: 'TimePicker',
  cn: '时间选择器',
  description:
    '时 / 分双列浮层:先点时、再点分即提交并立即关闭(避免淡出期选中着色迁移)。minuteStep 控制分钟档位。',
  importCode: `import { TimePicker } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <TimePicker aria-label="选择时间" />
          <TimePicker minuteStep={15} placeholder="一刻钟档位" aria-label="15 分钟步进" />
        </>
      ),
      code: `import { TimePicker } from '@fluent-react/ui';

export function TimePickerBasicExample() {
  return (
    <>
      <TimePicker aria-label="选择时间" />
      {/* minuteStep 控制分钟列间隔 */}
      <TimePicker minuteStep={15} placeholder="一刻钟档位" aria-label="15 分钟步进" />
    </>
  );
}`,
    },
  ],
  props: [
    { name: 'value / defaultValue', type: 'Date | null', default: 'null', description: '受控 / 非受控值(取其时分)。' },
    { name: 'minuteStep', type: 'number', default: '1', description: '分钟列间隔。' },
    { name: 'placeholder', type: 'string', default: "'选择时间'", description: '空值占位。' },
  ],
  events: [
    { name: 'onChange', type: '(date: Date | null) => void', description: '选完分钟提交时回调。' },
  ],
};

export const datetimeDocs: DocDef[] = [calendar, datepicker, rangepicker, timepicker];
