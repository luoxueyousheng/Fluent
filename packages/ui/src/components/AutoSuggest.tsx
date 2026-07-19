/* AutoSuggest — 可输入组合框(来自 JadeDemo):自由输入 + 过滤候选浮层 + 键盘导航 */
import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { useFixedPlacement, useFlyout } from './Flyout';
import { useMergedState } from '../useMergedState';
import { sizeClass, type ControlSize } from './Button';
import { statusClass, type ControlStatus } from './Field';

export interface AutoSuggestProps {
  options: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: ControlSize;
  status?: ControlStatus;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export function AutoSuggest({
  options, value: valueProp, defaultValue = '', onChange, size, status, placeholder, className, ...aria
}: AutoSuggestProps) {
  const [value, onChangeMerged] = useMergedState(defaultValue, valueProp, onChange);
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  // portal + fixed(随输入框宽):祖先 overflow 裁不到
  const fly = useFlyout(rootRef, popRef);
  const [activeIdx, setActiveIdx] = useState(-1);

  const hits = useMemo(() => {
    const q = value.trim().toLowerCase();
    return options.filter((v) => v.toLowerCase().includes(q));
  }, [options, value]);

  // open 须与实际挂载条件一致(hits>0),否则弹层晚挂载时测不到、永远 hidden;
  // dep=hits.length:过滤中高度变化时重测(up 翻转/钳制才不漂)
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen && hits.length > 0, { matchWidth: true, dep: hits.length });

  const pick = (v: string) => { onChangeMerged(v); fly.close(); setActiveIdx(-1); };
  const show = () => { if (hits.length) { setActiveIdx(-1); fly.open(); } else fly.close(); };

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
    <div ref={rootRef} className={cn('combobox suggest', className)}>
      <input className={cn('input', sizeClass(size), statusClass(status))} value={value} placeholder={placeholder}
             aria-label={aria['aria-label']} aria-expanded={fly.isOpen} role="combobox"
             onFocus={show}
             onChange={(e) => { onChangeMerged(e.target.value); requestAnimationFrame(show); }}
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
