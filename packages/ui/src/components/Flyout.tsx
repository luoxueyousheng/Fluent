/* Flyout 基础设施(新增件)— 通用浮层锚定 + MenuFlyout 菜单。
 * ComboBox/DropDownButton/右键菜单共用:Acrylic 浮层、flyout-in/out 动画、
 * 外点关闭、Esc 关闭。全局同时只开一个(openFlyoutCloser)。 */
import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
  type CSSProperties, type ReactNode, type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import {
  ChevronDownRegular,
} from '@fluent-jade/icon';

let openFlyoutCloser: (() => void) | null = null;

/** 浮层开合状态机:open()/close(immediate?) + 关闭动画期 closing。
 * immediate=true 立即卸载不播退出动画——用于「选中提交」:淡出期间选中高亮
 * 从旧项迁到新项会闪一下(踩过),提交关闭必须干脆。 */
export function useFlyout(rootRef: RefObject<HTMLElement | null>, portalRef?: RefObject<HTMLElement | null>) {
  const [state, setState] = useState<'closed' | 'open' | 'closing'>('closed');
  /* 关闭动画定时器句柄:open()/immediate close/卸载都要清,
   * 否则 150ms 内重开会被旧定时器强杀(竞态踩过) */
  const closeTimer = useRef<number | undefined>(undefined);

  const close = useCallback((immediate = false) => {
    window.clearTimeout(closeTimer.current);
    if (immediate) {
      setState('closed');
    } else {
      setState((s) => (s === 'open' ? 'closing' : s));
      closeTimer.current = window.setTimeout(() => setState('closed'), 150);
    }
    if (openFlyoutCloser === close) openFlyoutCloser = null;
  }, []);

  const open = useCallback(() => {
    if (openFlyoutCloser && openFlyoutCloser !== close) openFlyoutCloser();
    openFlyoutCloser = close;
    window.clearTimeout(closeTimer.current);
    setState('open');
  }, [close]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (state !== 'open') return;
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      // portal 到 body 的浮层不在 rootRef 树内,需单独判包含,否则点浮层内部就关
      if (rootRef.current && !rootRef.current.contains(t) && !portalRef?.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const t = window.setTimeout(() => addEventListener('pointerdown', outside, true));
    addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      removeEventListener('pointerdown', outside, true);
      removeEventListener('keydown', onKey);
    };
  }, [state, close, rootRef, portalRef]);

  return { isOpen: state !== 'closed', closing: state === 'closing', open, close, toggle: () => (state === 'open' ? close() : open()) };
}

/** 浮层自适应方向:下方空间不足且上方放得下 → 上翻;右缘越界 → 右对齐。
 * 打开后测一次(useLayoutEffect),返回挂到浮层的 className 片段。 */
export function useAdaptivePlacement(
  rootRef: RefObject<HTMLElement | null>,
  popRef: RefObject<HTMLElement | null>,
  open: boolean,
): string {
  const [cls, setCls] = useState('');
  useLayoutEffect(() => {
    if (!open) { setCls(''); return; }
    const root = rootRef.current, pop = popRef.current;
    if (!root || !pop) return;
    const tr = root.getBoundingClientRect();
    const ph = pop.offsetHeight, pw = pop.offsetWidth;
    const below = innerHeight - tr.bottom - 8;
    const above = tr.top - 48;                       // 标题栏下留 8
    const up = ph > below && above >= ph;
    const right = tr.left + pw > innerWidth - 8;
    setCls(cn(up && 'up', right && 'align-right'));
  }, [open, rootRef, popRef]);
  return cls;
}

/** portal 到 body 的 fixed 定位:锚点下方 4px 起,下方放不下且上方够则上翻,
 * 水平 8px 钳制;滚动(capture)/缩放实时跟随锚点。z-850:盖过 smoke(800)
 * 使抽屉/模态内也可用,仍在标题栏(900)之下。传 fly.isOpen(closing 期为 true),
 * 关闭动画中继续跟随、不闪跳。 */
export function useFixedPlacement(
  anchorRef: RefObject<HTMLElement | null>,
  popRef: RefObject<HTMLElement | null>,
  open: boolean,
  opts?: { matchWidth?: boolean; dep?: unknown },
): { style: CSSProperties; cls: string } {
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean; width?: number } | null>(null);
  const matchWidth = opts?.matchWidth;
  const dep = opts?.dep;                             // 浮层内容尺寸的外部依赖(如候选数)变化时重测

  const measure = useCallback(() => {
    const a = anchorRef.current, p = popRef.current;
    if (!a || !p) return;
    const r = a.getBoundingClientRect();
    const pw = matchWidth ? r.width : p.offsetWidth, ph = p.offsetHeight;
    const below = innerHeight - r.bottom - 8;
    const above = r.top - 48;                        // 标题栏下留 8
    const up = ph > below && above >= ph;
    setPos({
      top: up ? r.top - 4 - ph : r.bottom + 4,
      left: Math.max(8, Math.min(r.left, innerWidth - pw - 8)),
      up,
      width: matchWidth ? r.width : undefined,
    });
  }, [anchorRef, popRef, matchWidth]);

  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    measure();
    addEventListener('scroll', measure, true);
    addEventListener('resize', measure);
    return () => { removeEventListener('scroll', measure, true); removeEventListener('resize', measure); };
  }, [open, measure, dep]);

  return {
    style: pos
      ? { position: 'fixed', top: pos.top, left: pos.left, right: 'auto', bottom: 'auto', zIndex: 850,
          ...(pos.width != null ? { width: pos.width, minWidth: 0 } : {}) }
      : { position: 'fixed', top: 0, left: 0, visibility: 'hidden', zIndex: 850 },   // 首帧未测完先藏
    cls: pos?.up ? 'up' : '',
  };
}

export interface MenuItemDef {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  divider?: boolean;
  disabled?: boolean;
  danger?: boolean;
}

/** 菜单浮层内容(配合 useFlyout 放进定位容器;React 19 ref 直传) */
export function MenuList({ items, onPick, closing, style, className, ref }: {
  items: MenuItemDef[];
  onPick: (key: string) => void;
  closing?: boolean;
  style?: React.CSSProperties;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref} className={cn('menu-pop', className, closing && 'closing')} role="menu" style={style}>
      {items.map((it) =>
        it.divider ? (
          <div key={it.key} className="menu-divider" role="separator" />
        ) : (
          <button key={it.key} type="button" className={cn('menu-item', it.danger && 'danger')} role="menuitem"
                  disabled={it.disabled} onClick={() => onPick(it.key)}>
            {it.icon}
            {it.label}
          </button>
        ),
      )}
    </div>
  );
}

/** DropDownButton / SplitButton(split 时主区与箭头分开,主区触发 onClick) */
export function DropDownButton({ label, items, onPick, onClick, variant, split, className }: {
  label: ReactNode;
  items: MenuItemDef[];
  onPick: (key: string) => void;
  onClick?: () => void;
  variant?: 'default' | 'accent' | 'subtle';
  split?: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const fly = useFlyout(rootRef, popRef);
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen);
  const pick = (k: string) => { fly.close(); onPick(k); };
  const vcls = variant && variant !== 'default' ? variant : undefined;

  return (
    <div ref={rootRef} className={cn('dropdown', className)}>
      {split ? (
        <span className="split-group">
          <button type="button" className={cn('btn', vcls, 'split-main')} onClick={onClick}>{label}</button>
          <button type="button" className={cn('btn', vcls, 'split-arrow')} aria-haspopup="menu" aria-expanded={fly.isOpen}
                  aria-label="更多选项" onClick={fly.toggle}>
            <ChevronDownRegular size={12} />
          </button>
        </span>
      ) : (
        <button type="button" className={cn('btn', vcls)} aria-haspopup="menu" aria-expanded={fly.isOpen} onClick={fly.toggle}>
          {label}
          <ChevronDownRegular size={12} className="combo-chev" />
        </button>
      )}
      {fly.isOpen && createPortal(
        <MenuList ref={popRef} items={items} onPick={pick} closing={fly.closing}
                  className={placement.cls} style={placement.style} />,
        document.body,
      )}
    </div>
  );
}

/** 右键菜单:包住目标区域,contextmenu 处按坐标弹出 */
export function ContextMenuArea({ items, onPick, children, className }: {
  items: MenuItemDef[];
  onPick: (key: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fly = useFlyout(rootRef, menuRef);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  /* portal + fixed:按视口坐标弹出,贴边时钳回 8px 安全边距(打开后测一次) */
  useLayoutEffect(() => {
    if (!fly.isOpen) return;
    const m = menuRef.current;
    if (!m) return;
    const r = m.getBoundingClientRect();
    m.style.left = `${Math.max(8, Math.min(pos.x, innerWidth - r.width - 8))}px`;
    m.style.top = `${Math.max(48, Math.min(pos.y, innerHeight - r.height - 8))}px`;
  }, [fly.isOpen, pos]);

  /* 打开期间滚动即收(capture,immediate 与 MenuBar 一致):
   * fixed 坐标只在打开时钳一次,不收的话滚动后菜单悬空 */
  useEffect(() => {
    if (!fly.isOpen) return;
    const onScroll = () => fly.close(true);
    addEventListener('scroll', onScroll, true);
    return () => removeEventListener('scroll', onScroll, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fly.isOpen]);

  return (
    <div ref={rootRef} className={cn('ctx-area', className)}
         onContextMenu={(e) => {
           e.preventDefault();
           setPos({ x: e.clientX, y: e.clientY });
           fly.open();
         }}>
      {children}
      {fly.isOpen && createPortal(
        <MenuList ref={menuRef} items={items} closing={fly.closing}
                  onPick={(k) => { fly.close(); onPick(k); }}
                  style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 850 }} />,
        document.body,
      )}
    </div>
  );
}
