/* Drawer(新增件)— 四方位滑出面板(设置/详情),smoke 遮罩 + Esc/外点关闭 + 焦点陷阱 */
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { useFocusTrap } from '../focusTrap';
import {
  DismissRegular,
} from '@fluent-jade/icon';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** 滑出方位(antd 惯例),默认右侧 */
  placement?: 'left' | 'right' | 'top' | 'bottom';
  /** 面板尺寸:left/right 为宽、top/bottom 为高;'default' = 378,'large' = 736 */
  size?: number | 'default' | 'large';
  /** @deprecated 用 size;仅 left/right 生效,保留兼容旧用法 */
  width?: number;
  children: ReactNode;
  className?: string;
}

export function Drawer({ open, onClose, title, placement = 'right', size, width, children, className }: DrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  useFocusTrap(panelRef, open);   // Tab 圈在面板内,关闭还焦
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* 关闭期间冻结方位:调用方若在收起时改 placement(如用同一状态编码开合与方位),
     收起动画仍在原侧播放,不会闪到新方位 */
  const lastPlacement = useRef(placement);
  if (open) lastPlacement.current = placement;
  const pl = open ? placement : lastPlacement.current;

  const horizontal = pl === 'left' || pl === 'right';
  const px = size === 'large' ? 736 : size === 'default' ? 378
    : typeof size === 'number' ? size : width ?? (horizontal ? 360 : 320);

  return createPortal(
    <div className={cn('smoke drawer-smoke', open && 'open')}
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside ref={panelRef} tabIndex={-1} className={cn('drawer', className)}
             data-placement={pl}
             style={horizontal ? { width: px } : { height: px }}
             role="dialog" aria-modal="true" aria-label={title}>
        <header className="drawer-head">
          <h3 className="t-subtitle">{title}</h3>
          <button className="btn subtle icon-only" aria-label="关闭" onClick={onClose}>
            <DismissRegular size={12} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
