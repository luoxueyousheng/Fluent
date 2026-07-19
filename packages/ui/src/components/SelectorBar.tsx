/* SelectorBar — WinUI 3 同名控件(独立组件,非 Tabs 变体):
 * 项 40px 高、图标+文字、hover 淡底、选中加粗 + 底部 3px 圆角指示条
 *(左右 12px 内缩,Point 缓动滑动);方向键/Home/End + roving tabindex。 */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { cn } from '../cn';

export interface SelectorBarItemDef {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SelectorBarProps {
  items: SelectorBarItemDef[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
  'aria-label'?: string;
}

const INSET = 12;   // 指示条相对项的左右内缩(WinUI SelectorBarItem 规格)

export function SelectorBar({ items, value, onChange, className, ...aria }: SelectorBarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);

  const move = () => {
    const root = rootRef.current, ind = indRef.current;
    if (!root || !ind || root.offsetWidth === 0) return;
    const t = root.querySelector<HTMLElement>('.sb-item[aria-selected="true"]');
    if (!t) { ind.style.width = '0'; return; }
    ind.style.width = `${Math.max(0, t.offsetWidth - INSET * 2)}px`;
    ind.style.transform = `translateX(${t.offsetLeft + INSET}px)`;
  };

  useLayoutEffect(move, [value, items]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(move);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = items.findIndex((t) => t.key === value);
    let i = cur;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = (cur + 1) % items.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = (cur - 1 + items.length) % items.length;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = items.length - 1;
    else return;
    e.preventDefault();
    let guard = 0;
    while (items[i]!.disabled && guard++ < items.length) i = (i + 1) % items.length;
    onChange(items[i]!.key);
    requestAnimationFrame(() =>
      rootRef.current?.querySelector<HTMLElement>('.sb-item[aria-selected="true"]')?.focus());
  };

  return (
    <div ref={rootRef} className={cn('selectorbar', className)} role="tablist"
         onKeyDown={onKeyDown} aria-label={aria['aria-label']}>
      <span ref={indRef} className="sb-ind" aria-hidden="true" />
      {items.map((it) => (
        <button key={it.key} className="sb-item" role="tab" disabled={it.disabled}
                aria-selected={it.key === value} tabIndex={it.key === value ? 0 : -1}
                onClick={() => !it.disabled && it.key !== value && onChange(it.key)}>
          {it.icon}
          {it.label && <span className="sb-label">{it.label}</span>}
        </button>
      ))}
    </div>
  );
}
