/* CommandBar / MenuBar — 桌面壳层命令件。
 * CommandBar = WinUI 规范:主命令平铺(图标+文字的 subtle 钮、竖分隔线),
 * 次命令常驻收进「…」溢出菜单(Primary/Secondary Commands,不做自动测宽)。
 * MenuBar = 应用菜单栏(文件/编辑/查看):点击展开,展开态下悬停其他标签即切换,
 * 菜单 portal + fixed(z-850),滚动时立即收起。 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import {
  MoreHorizontalRegular,
} from '@fluent-react/icon';
import { MenuList, useFixedPlacement, useFlyout, type MenuItemDef } from './Flyout';

/* ==================== CommandBar ==================== */

export interface CommandItemDef {
  key: string;
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  /** 渲染为竖分隔线(忽略其余字段) */
  divider?: boolean;
}

export interface CommandBarProps {
  items: CommandItemDef[];
  /** 次命令:常驻收进「…」溢出菜单 */
  secondaryItems?: MenuItemDef[];
  onAction: (key: string) => void;
  className?: string;
  'aria-label'?: string;
}

export function CommandBar({ items, secondaryItems, onAction, className, ...aria }: CommandBarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const fly = useFlyout(rootRef, popRef);
  const placement = useFixedPlacement(moreRef, popRef, fly.isOpen);

  return (
    <div ref={rootRef} className={cn('commandbar', className)} role="toolbar" aria-label={aria['aria-label']}>
      {items.map((it, i) =>
        it.divider ? (
          <i key={it.key || `d-${i}`} className="cmd-divider" role="separator" />
        ) : (
          <button key={it.key} className={cn('cmd-btn', it.danger && 'danger')}
                  disabled={it.disabled} onClick={() => onAction(it.key)}>
            {it.icon}
            {it.label && <span className="cmd-label">{it.label}</span>}
          </button>
        ),
      )}
      {secondaryItems && secondaryItems.length > 0 && (
        <>
          <button ref={moreRef} className="cmd-btn cmd-more" aria-haspopup="menu" aria-expanded={fly.isOpen}
                  aria-label="更多命令" onClick={fly.toggle}>
            <MoreHorizontalRegular size={16} />
          </button>
          {fly.isOpen && createPortal(
            <MenuList ref={popRef} items={secondaryItems} closing={fly.closing}
                      className={placement.cls} style={placement.style}
                      onPick={(k) => { fly.close(); onAction(k); }} />,
            document.body,
          )}
        </>
      )}
    </div>
  );
}

/* ==================== MenuBar ==================== */

export interface MenuBarMenu {
  key: string;
  label: string;
  items: MenuItemDef[];
}

export interface MenuBarProps {
  menus: MenuBarMenu[];
  /** itemKey = 菜单项键;menuKey = 所属顶级菜单键 */
  onAction: (itemKey: string, menuKey: string) => void;
  className?: string;
}

export function MenuBar({ menus, onAction, className }: MenuBarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fly = useFlyout(rootRef, menuRef);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  const openAt = (key: string, btn: HTMLElement) => {
    const r = btn.getBoundingClientRect();
    setPos({ left: Math.max(8, Math.min(r.left, innerWidth - 168)), top: r.bottom + 2 });
    setOpenKey(key);
    fly.open();
  };

  /* 滚动即收(经典菜单行为);Esc 由 useFlyout 外点机制之外单独处理 */
  useEffect(() => {
    if (!fly.isOpen) return;
    const close = () => fly.close(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') fly.close(); };
    addEventListener('scroll', close, true);
    addEventListener('keydown', onKey);
    return () => { removeEventListener('scroll', close, true); removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fly.isOpen]);

  const current = menus.find((m) => m.key === openKey);
  const active = fly.isOpen && current;

  return (
    <div ref={rootRef} className={cn('menubar', className)} role="menubar">
      {menus.map((m) => (
        <button key={m.key} role="menuitem"
                className={cn('mb-item', active && openKey === m.key && 'open')}
                aria-haspopup="menu" aria-expanded={active && openKey === m.key}
                onClick={(e) => {
                  if (fly.isOpen && openKey === m.key) fly.close();
                  else openAt(m.key, e.currentTarget);
                }}
                onMouseEnter={(e) => { if (fly.isOpen && openKey !== m.key) openAt(m.key, e.currentTarget); }}>
          {m.label}
        </button>
      ))}
      {active && createPortal(
        <MenuList ref={menuRef} items={current.items} closing={fly.closing}
                  style={{ position: 'fixed', left: pos.left, top: pos.top, zIndex: 850 }}
                  onPick={(k) => { fly.close(); onAction(k, current.key); }} />,
        document.body,
      )}
    </div>
  );
}
