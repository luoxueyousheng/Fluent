/* TeachingTip — WinUI 锚定引导气泡 + Tooltip 包装。
 * 气泡经 portal 渲染到 body(fixed 定位、z-index 800):
 * 内联渲染会被 .content 的 overflow 裁剪、且盖不过左侧导航(踩过)。
 * 滚动/缩放时实时跟随锚点。 */
import {
  Children, cloneElement, isValidElement, useCallback, useEffect, useLayoutEffect,
  useRef, useState, type ReactElement, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import {
  DismissRegular,
} from '@fluent-react/icon';

export interface TeachingTipProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  content?: ReactNode;
  /** 操作区(按钮) */
  actions?: ReactNode;
  placement?: 'bottom' | 'top';
  /** 锚点元素 */
  children: ReactNode;
  className?: string;
}

export function TeachingTip({ open, onClose, title, content, actions, placement = 'bottom', children, className }: TeachingTipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const measure = useCallback(() => {
    const r = anchorRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({
      x: r.left + r.width / 2,
      y: placement === 'bottom' ? r.bottom + 10 : r.top - 10,
    });
  }, [placement]);

  useLayoutEffect(() => { if (open) measure(); }, [open, measure]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    addEventListener('resize', measure);
    addEventListener('scroll', measure, true);   // capture:内容区滚动也跟随
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('resize', measure);
      removeEventListener('scroll', measure, true);
    };
  }, [open, onClose, measure]);

  return (
    <span ref={anchorRef} className="tt-anchor">
      {children}
      {open && pos && createPortal(
        <div className={cn('teaching-tip', placement, className)} role="dialog" aria-modal="false"
             style={{ left: pos.x, top: pos.y }}>
          <span className="tt-tail" aria-hidden="true" />
          <div className="tt-head">
            <b>{title}</b>
            <button type="button" className="tt-close" aria-label="关闭" onClick={onClose}>
              <DismissRegular size={11} />
            </button>
          </div>
          {content && <div className="tt-content">{content}</div>}
          {actions && <div className="tt-actions">{actions}</div>}
        </div>,
        document.body,
      )}
    </span>
  );
}

/** Tooltip — 把 [data-tip] 悬浮提示挂到唯一子元素上(纯 CSS 渲染) */
export function Tooltip({ tip, children }: { tip: string; children: ReactNode }) {
  if (isValidElement(children) && Children.count(children) === 1) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, { 'data-tip': tip });
  }
  return <span data-tip={tip}>{children}</span>;
}
