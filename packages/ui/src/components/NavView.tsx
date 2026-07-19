/* NavigationView — 火山 Demo 风格外观 + JadeView 示例打磨过的指示条逻辑:
 * 指示条 getBoundingClientRect 相对 nav 定位(色条高 = 项高-16,中线对齐);
 * 折叠动画 transitionend 后重定位;ResizeObserver 兜底;受控 value。 */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { cn } from '../cn';
import {
  NavigationRegular,
} from '@fluent-jade/icon';

export interface NavItemDef {
  key: string;
  label: string;
  icon?: ReactNode;
  /** true 时排到底部区(nav-bottom) */
  bottom?: boolean;
}

/** 分组标题行(不可交互;折叠时淡出) */
export interface NavHeaderDef { header: string }
export type NavEntry = NavItemDef | NavHeaderDef;

const isHeader = (e: NavEntry): e is NavHeaderDef => 'header' in e;

export interface NavViewProps {
  items: NavEntry[];
  value: string;
  onChange: (key: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** 汉堡下方、列表上方的固定插槽(如搜索框);折叠时隐藏 */
  header?: ReactNode;
  className?: string;
}

export function NavView({ items, value, onChange, collapsed, onCollapsedChange, header, className }: NavViewProps) {
  const navRef = useRef<HTMLElement>(null);
  const indRef = useRef<HTMLDivElement>(null);

  /** animate=false:滚动跟随等被动重定位须瞬时贴住(禁掉过渡),
   *  Point 缓动只用于「切换选中项」的滑动——否则滚动时指示条被 250ms
   *  过渡拖着走,像反应迟钝的漂移 */
  const move = (animate: unknown = true) => {
    const nav = navRef.current, ind = indRef.current;
    if (!nav || !ind) return;
    if (!animate) ind.style.transition = 'none';
    const item = nav.querySelector<HTMLElement>('.nav-item.active');
    if (!item) { ind.style.opacity = '0'; return; }   // 搜索过滤掉激活项时藏指示条
    const navRect = nav.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    // 指示条不受 nav-top 裁剪:激活项滚出可视区时隐藏,免得画到钉住的汉堡/底部区上
    const scroller = item.closest('.nav-top');
    if (scroller) {
      const s = scroller.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      ind.style.opacity = mid < s.top || mid > s.bottom ? '0' : '';
    } else {
      ind.style.opacity = '';
    }
    const barH = Math.max(12, r.height - 16);
    ind.style.height = `${barH}px`;
    ind.style.transform = `translateY(${r.top - navRect.top + (r.height - barH) / 2}px)`;
    if (!animate) {
      // 强制回流让「无过渡 + 新位置」先落地,再同步恢复过渡——
      // 用 rAF 恢复会在同帧样式重算前生效,新 transform 仍带缓动提交(踩过)
      void ind.offsetHeight;
      ind.style.transition = '';
    }
  };

  useLayoutEffect(move, [value, collapsed, items]);   // items 含分组标题行
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(move);
    ro.observe(nav);
    const onEnd = (e: TransitionEvent) => { if (e.propertyName === 'width') move(); };
    nav.addEventListener('transitionend', onEnd);
    // 组件级导航条目多时 nav-top 可滚动,指示条须瞬时跟随滚动位置(capture 收 nav-top 的 scroll)
    const onScroll = () => move(false);
    nav.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      ro.disconnect();
      nav.removeEventListener('transitionend', onEnd);
      nav.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, []);

  const renderEntry = (it: NavEntry, i: number) =>
    isHeader(it) ? (
      <div key={`h-${i}`} className="nav-header">{it.header}</div>
    ) : (
      <button key={it.key}
              className={cn('nav-item', it.key === value && 'active')}
              role="tab" aria-selected={it.key === value} title={it.label}
              onClick={() => { if (it.key !== value) onChange(it.key); }}>
        {it.icon}
        <span className="label">{it.label}</span>
      </button>
    );

  return (
    <nav ref={navRef} className={cn('nav', className)} role="tablist" aria-orientation="vertical"
         {...(collapsed ? { 'data-collapsed': '' } : {})}>
      <div ref={indRef} className="nav-indicator" />
      {onCollapsedChange && (
        <button className="nav-item nav-hamburger" title="展开/收缩导航" aria-label="展开或收缩导航"
                onClick={() => onCollapsedChange(!collapsed)}>
          <NavigationRegular />
          <span className="label">导航</span>
        </button>
      )}
      {header != null && <div className="nav-slot">{header}</div>}
      <div className="nav-top">
        {items.filter((i) => isHeader(i) || !i.bottom).map(renderEntry)}
      </div>
      <div className="nav-bottom">{items.filter((i) => !isHeader(i) && i.bottom).map(renderEntry)}</div>
    </nav>
  );
}
