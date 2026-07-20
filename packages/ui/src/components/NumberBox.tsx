/* NumberBox — 数字输入 + WinUI 3 内联 SpinButton:
 * 两个全高方按钮横排在输入框右端内侧 [∧][∨],按住 400ms 后自动连发(RepeatButton),
 * 聚焦时滚轮微调;范围钳制,失焦/回车提交文本。 */
import { useEffect, useRef, useState } from 'react';
import { cn } from '../cn';
import { ChevronDownRegular, ChevronUpRegular } from '@fluent-jade/icon';
import { useMergedState } from '../useMergedState';
import { sizeClass, type ControlSize } from './Button';
import { statusClass, type ControlStatus } from './Field';
import { colorClass, radiusClass, type Radius, type SemanticColor } from '../modifiers';

export interface NumberBoxProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** 固定小数位(antd 惯例):调节与文本提交都舍入到该位数;
   *  不传则按「当前值与 step 的小数位取大」自动消除浮点误差 */
  precision?: number;
  size?: ControlSize;
  status?: ControlStatus;
  /** 语义着色:聚焦下划线随之变色 */
  color?: SemanticColor;
  /** 圆角:none / sm / md(默认) / lg */
  radius?: Radius;
  className?: string;
  'aria-label'?: string;
}

/* 小数位数(1e-7 类科学计数法兜底为 10 位) */
const decimalsOf = (n: number): number => {
  const s = String(n);
  if (s.includes('e') || s.includes('E')) return 10;
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
};

export function NumberBox({
  value: valueProp, defaultValue = 0, onChange,
  min = -Infinity, max = Infinity, step = 1, precision, size, status,
  color, radius, className, ...aria
}: NumberBoxProps) {
  const [value, setValue] = useMergedState(defaultValue, valueProp, onChange);
  const [text, setText] = useState<string | null>(null);   // 编辑中的临时文本
  const inputRef = useRef<HTMLInputElement>(null);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  // 连发期间跨渲染累加:valueRef 即时更新,不等 React 重渲染
  const valueRef = useRef(value);
  valueRef.current = value;
  const nudge = (d: number) => {
    const base = valueRef.current;
    // 小数步进的浮点误差(0.5+0.1=0.6000…01):按当前值与 step 的小数位取大舍入;
    // precision 显式给定时恒用之
    const p = precision ?? Math.max(decimalsOf(base), decimalsOf(step));
    const nv = clamp(Number((base + d * step).toFixed(Math.min(p, 20))));
    valueRef.current = nv;
    setValue(nv);
    setText(null);
  };

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    // 手输值仅在显式 precision 下舍入(默认保留用户输入,只钳制范围)
    if (!Number.isNaN(n)) setValue(clamp(precision != null ? Number(n.toFixed(precision)) : n));
    setText(null);
  };

  /* RepeatButton:按下立即 ±1,长按 400ms 后每 70ms 连发 */
  const hold = useRef<{ delay: number; repeat: number } | null>(null);
  const stopHold = () => {
    if (!hold.current) return;
    clearTimeout(hold.current.delay);
    clearInterval(hold.current.repeat);
    hold.current = null;
  };
  const startHold = (d: number) => {
    stopHold();
    nudge(d);
    const delay = window.setTimeout(() => {
      hold.current = { delay: 0, repeat: window.setInterval(() => nudge(d), 70) };
    }, 400);
    hold.current = { delay, repeat: 0 };
  };
  useEffect(() => stopHold, []);

  // 滚轮监听只挂载一次:经 ref 始终调最新 nudge,避免闭包捕获首渲染的 step/min/max
  const nudgeRef = useRef(nudge);
  nudgeRef.current = nudge;

  /* 聚焦时滚轮微调(原生监听,passive:false 才能拦住页面滚动) */
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (document.activeElement !== el) return;
      e.preventDefault();
      nudgeRef.current(e.deltaY < 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spinBtn = (d: 1 | -1, disabled: boolean) => (
    <button type="button" tabIndex={-1} disabled={disabled}
            aria-label={d > 0 ? '增加' : '减少'}
            onPointerDown={(e) => { e.preventDefault(); startHold(d); }}
            onPointerUp={stopHold} onPointerLeave={stopHold} onPointerCancel={stopHold}>
      {d > 0 ? <ChevronUpRegular size={12} /> : <ChevronDownRegular size={12} />}
    </button>
  );

  return (
    <div className={cn('numberbox', colorClass(color), radiusClass(radius), className)}>
      <input ref={inputRef} className={cn('input', sizeClass(size), statusClass(status))}
             inputMode="decimal" value={text ?? String(value)}
             aria-label={aria['aria-label']}
             onChange={(e) => setText(e.target.value)}
             onBlur={(e) => commit(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
               else if (e.key === 'ArrowUp') { e.preventDefault(); nudge(1); }
               else if (e.key === 'ArrowDown') { e.preventDefault(); nudge(-1); }
             }} />
      <span className="nb-spin">
        {spinBtn(1, value >= max)}
        {spinBtn(-1, value <= min)}
      </span>
    </div>
  );
}
