/* MultiSelect — 多选组合框(antd Select mode="multiple" 规范,WinUI 形态)。
 * 触发器内平铺已选 Tag(可单独摘除,maxTagCount 收纳为 +N),下拉为勾选行、
 * 选中不关闭浮层;portal + fixed(z-850)随触发器宽。 */
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import {
  CheckmarkRegular,
  ChevronDownRegular,
  DismissRegular,
} from '@fluent-jade/icon';
import { useFixedPlacement, useFlyout } from './Flyout';
import { useMergedState } from '../useMergedState';
import { sizeClass, type ControlSize } from './Button';
import { statusClass, type ControlStatus } from './Field';
import type { ComboOption } from './ComboBox';
import { colorClass, radiusClass, type Radius, type SemanticColor } from '../modifiers';

export interface MultiSelectProps {
  options: ComboOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  /** 触发器内最多平铺的 Tag 数,超出收纳为 +N */
  maxTagCount?: number;
  size?: ControlSize;
  status?: ControlStatus;
  /** 语义着色:展开下划线随之变色 */
  color?: SemanticColor;
  /** 圆角:none / sm / md(默认) / lg */
  radius?: Radius;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function MultiSelect({
  options, value: valueProp, defaultValue = [], onChange,
  placeholder = '请选择', maxTagCount, size, status, color, radius, disabled, className, ...aria
}: MultiSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const fly = useFlyout(rootRef, popRef);
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen, { matchWidth: true });
  const [values, setValues] = useMergedState<string[]>(defaultValue, valueProp, onChange);
  const [activeIdx, setActiveIdx] = useState(-1);

  const toggleValue = (v: string) =>
    setValues(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  const shown = maxTagCount != null ? values.slice(0, maxTagCount) : values;
  const rest = values.length - shown.length;
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { fly.close(); return; }
    const n = options.length;
    if (n === 0) return;                     // 空 options:方向键取模得 NaN,Enter 开空浮层
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      if (!fly.isOpen) { setActiveIdx(-1); fly.open(); return; }
    }
    if (e.key === 'ArrowDown') setActiveIdx((i) => (i + 1) % n);
    else if (e.key === 'ArrowUp') setActiveIdx((i) => ((i <= 0 ? n : i) - 1) % n);
    else if ((e.key === 'Enter' || e.key === ' ') && activeIdx >= 0) toggleValue(options[activeIdx].value);
  };

  return (
    <div ref={rootRef} className={cn('multiselect', colorClass(color), radiusClass(radius), className)}>
      <button type="button" className={cn('combo-trigger', 'ms-trigger', sizeClass(size), statusClass(status))}
              disabled={disabled} aria-haspopup="listbox" aria-expanded={fly.isOpen}
              aria-label={aria['aria-label']}
              onClick={fly.toggle} onKeyDown={onKeyDown}>
        <span className="ms-tags">
          {values.length === 0 && <span className="combo-value placeholder">{placeholder}</span>}
          {shown.map((v) => (
            <span key={v} className="ms-tag">
              {labelOf(v)}
              <span className="ms-tag-x" role="button" aria-label={`移除 ${v}`}
                    onClick={(e) => { e.stopPropagation(); toggleValue(v); }}>
                <DismissRegular size={9} />
              </span>
            </span>
          ))}
          {rest > 0 && <span className="ms-tag ms-more">+{rest}</span>}
        </span>
        <ChevronDownRegular size={12} className="combo-chev" />
      </button>
      {fly.isOpen && createPortal(
        <div ref={popRef} className={cn('combo-pop', 'ms-pop', placement.cls, fly.closing && 'closing')}
             style={placement.style} role="listbox" aria-multiselectable="true"
             onPointerMove={(e) => { if ((e.target as HTMLElement).closest('.ms-option')) setActiveIdx(-1); }}>
          {options.map((o, i) => {
            const on = values.includes(o.value);
            return (
              <div key={o.value} role="option" aria-selected={on}
                   className={cn('combo-option', 'ms-option', i === activeIdx && 'active')}
                   onClick={() => toggleValue(o.value)}>
                <span className={cn('ms-check', on && 'on')}>
                  {on && <CheckmarkRegular size={11} />}
                </span>
                {o.label}
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
