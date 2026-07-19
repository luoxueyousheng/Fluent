/* Popconfirm — 轻量气泡确认(antd API,基于 Popover)。
 * 比 Modal.confirm 更轻:锚点旁弹出,不打断整页;适合单条删除、状态切换等低风险确认。
 * description 辅助说明、okText/cancelText 可定制、onConfirm/onCancel 回调。
 * icon 显示在标题左侧,默认问号;okButtonProps/cancelButtonProps 透传 Button。 */
import { useState, type ReactNode } from 'react';
import { Button } from './Button';
import {
  InfoRegular,
} from '@fluent-react/icon';
import { Popover, type PopoverProps } from './Popover';

export interface PopconfirmProps {
  /** 确认标题 */
  title: ReactNode;
  /** 辅助说明 */
  description?: ReactNode;
  /** 确认按钮文案 */
  okText?: string;
  /** 取消按钮文案 */
  cancelText?: string;
  /** 确认钮红色(破坏性操作) */
  okDanger?: boolean;
  /** 确认回调 */
  onConfirm?: () => void;
  /** 取消回调(含 Esc/外点) */
  onCancel?: () => void;
  /** 自定义图标;false 隐藏 */
  icon?: ReactNode | false;
  /** 开合受控 */
  open?: boolean;
  /** 非受控初始开合 */
  defaultOpen?: boolean;
  /** 开合变化 */
  onOpenChange?: (open: boolean) => void;
  /** 锚点元素 */
  children: ReactNode;
  /** popover 透传 */
  trigger?: PopoverProps['trigger'];
  className?: string;
}

export function Popconfirm({
  title, description, okText = '确定', cancelText = '取消', okDanger,
  onConfirm, onCancel, icon, open: openProp, defaultOpen, onOpenChange, children, trigger, className,
}: PopconfirmProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const controlled = openProp != null;
  const isOpen = controlled ? openProp : open;

  const close = () => {
    if (!controlled) setOpen(false);
    onOpenChange?.(false);
  };

  return (
    <Popover
      open={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={(v) => {
        if (!controlled) setOpen(v);
        onOpenChange?.(v);
      }}
      trigger={trigger}
      className={className}
      title={
        <div className="popconfirm-head">
          {icon !== false && (
            <span className="popconfirm-icon">
              {icon ?? <InfoRegular size={18} />}
            </span>
          )}
          <span className="popconfirm-title">{title}</span>
        </div>
      }
      content={
        <div className="popconfirm-body">
          {description != null && <div className="popconfirm-desc">{description}</div>}
          <div className="popconfirm-actions">
            <Button size="small" onClick={() => { onCancel?.(); close(); }}>{cancelText}</Button>
            <Button size="small" variant="accent" danger={okDanger} onClick={() => { onConfirm?.(); close(); }}>{okText}</Button>
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
}
