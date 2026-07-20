/* Modal — 声明式模态框(antd API,WinUI ContentDialog 形态)。
 * 命令式确认走 useConfirm / modal.confirm;这里承载任意内容:
 * 受控 open、标题/内容/页脚三段、右上角关闭钮、遮罩点击与 Esc 关闭可配、
 * 长内容体内滚动(不撑破视口)、onOk 返回 Promise 时确定钮自动 loading。
 * 遮罩复用 .smoke:从标题栏下方开始,窗口拖动/控制钮始终可用。 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { useFocusTrap } from '../focusTrap';
import { Button } from './Button';
import {
  DismissRegular,
} from '@fluent-jade/icon';

export interface ModalProps {
  open: boolean;
  title?: ReactNode;
  children?: ReactNode;
  /** 确定钮;返回 Promise 时按钮自动 loading 直到 settle(是否关闭由调用方决定) */
  onOk?: () => void | Promise<unknown>;
  /** 请求关闭:遮罩点击 / Esc / 关闭钮 / 取消钮 */
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  /** 确定钮红色(破坏性操作) */
  okDanger?: boolean;
  /** 受控 loading;不传则由 onOk 的 Promise 自动驱动 */
  confirmLoading?: boolean;
  /** 自定义页脚;null 隐藏页脚区 */
  footer?: ReactNode | null;
  width?: number;
  /** 右上角关闭钮 */
  closable?: boolean;
  /** 点遮罩关闭 */
  maskClosable?: boolean;
  /** Esc 关闭 */
  keyboard?: boolean;
  /** 关闭后卸载内容(重开时重置内部状态) */
  destroyOnClose?: boolean;
  className?: string;
}

export function Modal({
  open, title, children, onOk, onCancel, okText = '确定', cancelText = '取消',
  okDanger, confirmLoading, footer, width = 420,
  closable = true, maskClosable = true, keyboard = true, destroyOnClose, className,
}: ModalProps) {
  const [innerLoading, setInnerLoading] = useState(false);
  const loading = confirmLoading ?? innerLoading;
  const dlgRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dlgRef, open);   // Tab 圈在对话框内,关闭还焦

  /* destroyOnClose:退场动画(250ms)结束后再卸载内容,不然内容闪消 */
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(false), 250);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || !keyboard) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel?.(); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, keyboard, onCancel]);

  const handleOk = () => {
    const r = onOk?.();
    if (r && typeof (r as Promise<unknown>).then === 'function') {
      setInnerLoading(true);
      /* then 双参:reject 也要收掉(unhandled rejection),且 antd 惯例 reject 即阻止关闭 */
      void (r as Promise<unknown>).then(
        () => setInnerLoading(false),
        () => setInnerLoading(false),
      );
    }
  };

  const body = destroyOnClose && !mounted ? null : children;

  return createPortal(
    <div className={cn('smoke', open && 'open')}
         onMouseDown={(e) => { if (maskClosable && e.target === e.currentTarget) onCancel?.(); }}>
      <div ref={dlgRef} tabIndex={-1} className={cn('dialog', 'modal', className)} role="dialog" aria-modal="true"
           aria-label={typeof title === 'string' ? title : undefined}
           style={{ '--modal-w': `${width}px` } as CSSProperties}>
        {(title != null || closable) && (
          <header className="modal-head">
            {title != null && <h3 className="t-subtitle">{title}</h3>}
            {closable && (
              <button className="modal-close" aria-label="关闭" onClick={() => onCancel?.()}>
                <DismissRegular size={12} />
              </button>
            )}
          </header>
        )}
        <div className="modal-body">{body}</div>
        {footer !== null && (
          <div className="actions">
            {footer !== undefined ? footer : (
              <>
                {/* WinUI ContentDialog 键序:主按钮在前 */}
                <Button variant="accent" danger={okDanger} loading={loading} onClick={handleOk}>{okText}</Button>
                <Button onClick={() => onCancel?.()}>{cancelText}</Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
