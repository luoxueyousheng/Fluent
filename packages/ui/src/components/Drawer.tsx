/* Drawer(新增件)— 右侧滑出面板(设置/详情),smoke 遮罩 + Esc/外点关闭 */
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { Icon } from './Icon';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children: ReactNode;
  className?: string;
}

export function Drawer({ open, onClose, title, width = 360, children, className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return createPortal(
    <div className={cn('smoke drawer-smoke', open && 'open')}
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className={cn('drawer', className)} style={{ width }} role="dialog" aria-modal="true" aria-label={title}>
        <header className="drawer-head">
          <h3 className="t-subtitle">{title}</h3>
          <button className="btn subtle icon-only" aria-label="关闭" onClick={onClose}>
            <Icon name="close" size={12} strokeWidth={1.3} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
