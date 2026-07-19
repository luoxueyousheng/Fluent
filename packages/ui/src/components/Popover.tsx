/* Popover — 富内容气泡浮层(WinUI Flyout 形态,无箭头)。
 * Tooltip 只放一句纯文本;Popover 承载标题 + 任意内容(表单/按钮/列表)。
 * portal 到 body + fixed(z-850,祖先 overflow 裁不到),锚点下方展开、
 * 放不下上翻、滚动跟随;trigger 支持 click(默认)/ hover(离开 150ms 延迟收起,
 * 移入浮层不收);open/onOpenChange 可受控。 */
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { useFixedPlacement, useFlyout } from './Flyout';

export interface PopoverProps {
  /** 浮层内容 */
  content: ReactNode;
  title?: ReactNode;
  /** 触发方式,默认 click */
  trigger?: 'click' | 'hover';
  /** 受控开合;不传则内部管理 */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 锚点元素 */
  children: ReactNode;
  className?: string;
}

export function Popover({
  content, title, trigger = 'click', open: openProp, defaultOpen, onOpenChange, children, className,
}: PopoverProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const fly = useFlyout(rootRef, popRef);
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* 通知外部(前值比较;StrictMode 双跑下布尔标记不可靠) */
  const prevOpenRef = useRef(fly.isOpen);
  useEffect(() => {
    if (prevOpenRef.current !== fly.isOpen) {
      prevOpenRef.current = fly.isOpen;
      onOpenChange?.(fly.isOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fly.isOpen]);

  /* 受控同步:open 属性驱动内部状态机 */
  useEffect(() => {
    if (openProp == null) return;
    if (openProp && !fly.isOpen) fly.open();
    else if (!openProp && fly.isOpen) fly.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openProp]);

  /* 非受控初始展开 */
  const bootRef = useRef(false);
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    if (openProp == null && defaultOpen) fly.open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hoverOpen = () => { clearTimeout(hoverTimer.current); fly.open(); };
  const hoverClose = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => fly.close(), 150);
  };
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const anchorEvents = trigger === 'hover'
    ? { onMouseEnter: hoverOpen, onMouseLeave: hoverClose }
    : { onClick: fly.toggle };

  return (
    <>
      <span ref={rootRef} className={cn('popover-anchor', className)} {...anchorEvents}>
        {children}
      </span>
      {/* portal 必须放在 anchor 外(兄弟节点):React 事件沿 React 树冒泡,
          放在 anchor 里点浮层内容会冒到 onClick=toggle,点哪都关(踩过) */}
      {fly.isOpen && createPortal(
        <div ref={popRef} className={cn('popover-pop', placement.cls, fly.closing && 'closing')}
             style={placement.style} role="dialog"
             {...(trigger === 'hover' ? { onMouseEnter: hoverOpen, onMouseLeave: hoverClose } : {})}>
          {title != null && <div className="popover-title">{title}</div>}
          <div className="popover-content">{content}</div>
        </div>,
        document.body,
      )}
    </>
  );
}
