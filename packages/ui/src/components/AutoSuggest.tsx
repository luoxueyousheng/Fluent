/* AutoSuggest — 可输入组合框(来自 JadeDemo):自由输入 + 过滤候选浮层 + 键盘导航 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { useFixedPlacement, useFlyout } from './Flyout';
import { useMergedState } from '../useMergedState';
import { sizeClass, type ControlSize } from './Button';
import { statusClass, type ControlStatus } from './Field';
import { colorClass, radiusClass, type Radius, type SemanticColor } from '../modifiers';

export interface AutoSuggestProps {
  options: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: ControlSize;
  status?: ControlStatus;
  /** 语义着色:聚焦下划线随之变色 */
  color?: SemanticColor;
  /** 圆角:none / sm / md(默认) / lg */
  radius?: Radius;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export function AutoSuggest({
  options, value: valueProp, defaultValue = '', onChange, size, status,
  color, radius, placeholder, className, ...aria
}: AutoSuggestProps) {
  const [value, onChangeMerged] = useMergedState(defaultValue, valueProp, onChange);
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  // portal + fixed(随输入框宽):祖先 overflow 裁不到
  const fly = useFlyout(rootRef, popRef);
  const [activeIdx, setActiveIdx] = useState(-1);

  const filter = (v: string) => {
    const q = v.trim().toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  };
  const hits = useMemo(() => filter(value), [options, value]);

  // open 须与实际挂载条件一致(hits>0),否则弹层晚挂载时测不到、永远 hidden;
  // dep=hits.length:过滤中高度变化时重测(up 翻转/钳制才不漂)
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen && hits.length > 0, { matchWidth: true, dep: hits.length });

  const pick = (v: string) => { onChangeMerged(v); fly.close(); setActiveIdx(-1); };
  // show 内现算 hits:onChange 后的 rAF 回调里 value/hits 闭包是旧渲染的,
  // 退格回有候选时按旧 hits 判空会漏开浮层;显式传入最新值规避
  const show = (v: string = value) => {
    if (filter(v).length) { setActiveIdx(-1); fly.open(); } else fly.close();
  };
  const rafRef = useRef(0);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);   // 卸载时取消未决 rAF

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { fly.close(); return; }
    if (!fly.isOpen) {
      if (e.key === 'ArrowDown' && hits.length) { e.preventDefault(); fly.open(); setActiveIdx(0); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(hits.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(-1, i - 1)); }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); pick(hits[activeIdx]); }
  };

  return (
    <div ref={rootRef} className={cn('combobox suggest', colorClass(color), radiusClass(radius), className)}>
      <input className={cn('input', sizeClass(size), statusClass(status))} value={value} placeholder={placeholder}
             aria-label={aria['aria-label']} aria-expanded={fly.isOpen} role="combobox"
             onFocus={() => show()}
             onChange={(e) => {
               const v = e.target.value;
               onChangeMerged(v);
               cancelAnimationFrame(rafRef.current);
               rafRef.current = requestAnimationFrame(() => show(v));
             }}
             onKeyDown={onKeyDown} />
      {fly.isOpen && hits.length > 0 && createPortal(
        <div ref={popRef} className={cn('combo-pop', placement.cls, fly.closing && 'closing')}
             style={placement.style} role="listbox">
          {hits.map((v, i) => (
            <div key={v} role="option"
                 className={cn('combo-option', i === activeIdx && 'active')}
                 aria-selected={v === value}
                 onPointerDown={(e) => { e.preventDefault(); pick(v); }}>
              {v}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
