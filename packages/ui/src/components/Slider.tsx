/* Slider — 填充 + 位置气泡 + 刻度 + 范围标签,横/纵通用;RangeSlider 双滑块。
 * 几何铁律:thumb 圆心只在 [10px, 长度-10px] 移动,填充/刻度/气泡按 10px 内缩对齐;
 * --p 为 0~1 归一化值,驱动 CSS 填充止点。 */
import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { cn } from '../cn';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  /** 一次交互结束时回调一次:拖拽抬手 / 键盘调整松键(onChange 仍连续) */
  onChangeEnd?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
  /** 刻度间隔(数据值);majorTicks 为主刻度间隔 */
  ticks?: number;
  majorTicks?: number;
  /** 两端/自定义位置标签:[值, 文本] */
  marks?: Array<[number, string]>;
  /** 填充原点值(默认 min=从左端充)。正负形态:min=-50 max=50 fillFrom=0,
      负值向左充、正值向右充 */
  fillFrom?: number;
  vertical?: boolean;
  header?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

const INSET = 10;   // thumb 半径

const END_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];

export function Slider({
  value, onChange, onChangeEnd, min = 0, max = 100, step = 1,
  format = String, ticks, majorTicks, marks, fillFrom, vertical, header, showValue, disabled, className,
}: SliderProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const p = (value - min) / (max - min);
  const po = fillFrom != null ? Math.min(1, Math.max(0, (fillFrom - min) / (max - min))) : null;

  const tickEls = useMemo(() => {
    if (!ticks || ticks <= 0) return null;
    const els = [];
    for (let v = min; v <= max; v += ticks) {
      const pct = ((v - min) / (max - min)) * 100;
      const isMajor = !!majorTicks && Math.round((v - min) % majorTicks) === 0;
      els.push(<i key={v} className={isMajor ? 'major' : ''}
                  style={vertical ? { bottom: `${pct}%` } : { left: `${pct}%` }} />);
    }
    return els;
  }, [min, max, ticks, majorTicks, vertical]);

  // 气泡与 thumb 圆心同几何:inset + (可动长度) * p
  const bubblePos: CSSProperties = vertical
    ? { bottom: `calc(${INSET}px + (100% - ${INSET * 2}px) * ${p})` }
    : { left: `calc(${INSET}px + (100% - ${INSET * 2}px) * ${p})` };

  return (
    <div className={cn('slider-field', vertical && 'vertical', className)}>
      {(header || showValue) && (
        <div className="sld-head">
          {header && <span>{header}</span>}
          {showValue && <span className="sld-val">{format(value)}</span>}
        </div>
      )}
      <div ref={wrapRef} className={cn('slider-wrap', vertical && 'vertical', dragging && 'show-bubble')}>
        <input type="range" className={cn('slider', vertical && 'vertical', po != null && 'from-origin')}
               min={min} max={max} step={step} value={value} disabled={disabled}
               style={{ '--p': p, ...(po != null ? { '--po': po } : {}) } as CSSProperties}
               aria-label={header}
               onChange={(e) => onChange(+e.target.value)}
               onPointerDown={() => setDragging(true)}
               /* 结束值读 DOM(currentTarget.value):抬手瞬间父级 state 可能尚未回灌,闭包 value 会旧一拍 */
               onPointerUp={(e) => { setDragging(false); onChangeEnd?.(+e.currentTarget.value); }}
               onKeyUp={(e) => { if (END_KEYS.includes(e.key)) onChangeEnd?.(+e.currentTarget.value); }}
               onBlur={() => setDragging(false)} />
        {ticks && <div className="slider-ticks">{tickEls}</div>}
        <div className="slider-bubble" style={bubblePos}>{format(value)}</div>
      </div>
      {marks && (
        <div className="slider-marks">
          {marks.map(([v, label]) => (
            <span key={v} style={{ left: `${((v - min) / (max - min)) * 100}%` }}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export interface RangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  /** 任一滑块交互结束时回调一次(整个区间) */
  onChangeEnd?: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  'aria-label'?: string;
}

export function RangeSlider({ value, onChange, onChangeEnd, min = 0, max = 100, step = 1, className, ...aria }: RangeSliderProps) {
  const [lo, hi] = value;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const set = (a: number, b: number) => onChange(a <= b ? [a, b] : [b, a]);
  // 结束值同样读 DOM,并与另一端排序(拖拽中可能交叉换位)
  const end = (raw: number, other: number) => {
    const v = raw <= other ? [raw, other] : [other, raw];
    onChangeEnd?.(v as [number, number]);
  };

  return (
    <div className={cn('range-dual', className)}
         style={{ '--lo': `${pct(lo)}%`, '--hi': `${pct(hi)}%` } as CSSProperties}>
      <div className="rail"><div className="fill" /></div>
      <input type="range" min={min} max={max} step={step} value={lo}
             aria-label={`${aria['aria-label'] ?? '范围'}下限`}
             onChange={(e) => set(+e.target.value, hi)}
             onPointerUp={(e) => end(+e.currentTarget.value, hi)}
             onKeyUp={(e) => { if (END_KEYS.includes(e.key)) end(+e.currentTarget.value, hi); }} />
      <input type="range" min={min} max={max} step={step} value={hi}
             aria-label={`${aria['aria-label'] ?? '范围'}上限`}
             onChange={(e) => set(lo, +e.target.value)}
             onPointerUp={(e) => end(+e.currentTarget.value, lo)}
             onKeyUp={(e) => { if (END_KEYS.includes(e.key)) end(+e.currentTarget.value, lo); }} />
    </div>
  );
}
