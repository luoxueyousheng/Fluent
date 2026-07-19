/* Tabs — 下划线 Pivot(underline)/ 分段 SelectorBar(segmented[.accent])。
 * ARIA + roving tabindex + 方向键;指示条随选中项滑动;
 * 隐藏容器变可见后自动重定位(ResizeObserver 覆盖 offsetWidth 0→N 的变化)。 */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { cn } from '../cn';

export interface TabDef { key: string; label: ReactNode; disabled?: boolean }

export interface TabsProps {
  items: TabDef[];
  value: string;
  onChange: (key: string) => void;
  variant?: 'underline' | 'underline-compact' | 'segmented' | 'segmented-accent';
  className?: string;
  'aria-label'?: string;
}

export function Tabs({ items, value, onChange, variant = 'underline', className, ...aria }: TabsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const seg = variant.startsWith('segmented');

  const move = () => {
    const root = rootRef.current, ind = indRef.current;
    if (!root || !ind || root.offsetWidth === 0) return;
    const t = root.querySelector<HTMLElement>('.tab[aria-selected="true"]');
    if (!t) return;
    // WinUI 3 SelectorBar:下划线短横杠只覆盖内容宽度(按变体内缩水平 padding)
    const inset = variant === 'underline' ? 12 : variant === 'underline-compact' ? 10 : 0;
    ind.style.width = `${t.offsetWidth - inset * 2}px`;
    ind.style.transform = `translateX(${t.offsetLeft + inset - root.scrollLeft}px)`;
  };

  useLayoutEffect(move, [value, items, variant]);
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
    while (items[i].disabled && guard++ < items.length) i = (i + 1) % items.length;
    onChange(items[i].key);
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>('.tab[aria-selected="true"]')?.focus());
  };

  // 内部类名 pivot(≠ Tailwind 工具类 underline);对外 variant 值保持不变
  const cls = {
    underline: 'tabs pivot',
    'underline-compact': 'tabs pivot compact',
    segmented: 'tabs segmented',
    'segmented-accent': 'tabs segmented accent',
  }[variant];

  return (
    <div ref={rootRef} className={cn(cls, className)} role="tablist" onKeyDown={onKeyDown} {...aria}>
      <span ref={indRef} className={seg ? 'seg-ind' : 'tab-ind'} />
      {items.map((t) => (
        <button key={t.key} className="tab" role="tab" disabled={t.disabled}
                aria-selected={t.key === value} tabIndex={t.key === value ? 0 : -1}
                onClick={() => !t.disabled && onChange(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** 选项卡内容面板:active 时渲染并做滑入转场 */
export function TabPanel({ active, children, className }: { active: boolean; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (active && el) { el.classList.remove('slide-in'); void el.offsetWidth; el.classList.add('slide-in'); }
  }, [active]);
  return <div ref={ref} className={cn('tab-panel', active && 'active', className)}>{children}</div>;
}
