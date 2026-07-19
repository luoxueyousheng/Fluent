/* SettingsCard / SettingsExpander — Windows 11 设置页形态:
 * 整行卡片,左侧图标+名称+描述,右侧操作控件;Expander 可展开子行(缩进接排)。
 * 对应 WinUI Community Toolkit 的 SettingsCard / SettingsExpander。 */
import { useState, type ReactNode } from 'react';
import { cn } from '../cn';
import {
  ChevronDownRegular,
  ChevronRightRegular,
} from '@fluent-react/icon';

export interface SettingsCardProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** 右侧操作区(Switch/ComboBox/Button…) */
  children?: ReactNode;
  /** 传入则整行可点(导航行,右侧补充 chevron) */
  onClick?: () => void;
  className?: string;
}

export function SettingsCard({ icon, title, description, children, onClick, className }: SettingsCardProps) {
  const body = (
    <>
      {icon && <span className="sc-icon">{icon}</span>}
      <span className="sc-body">
        <span className="sc-title">{title}</span>
        {description && <span className="sc-desc">{description}</span>}
      </span>
      {children && <span className="sc-control">{children}</span>}
      {onClick && <ChevronRightRegular size={12} className="sc-chevron" />}
    </>
  );
  return onClick ? (
    <button type="button" className={cn('settings-card', 'clickable', className)} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={cn('settings-card', className)}>{body}</div>
  );
}

export interface SettingsExpanderProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** 头行右侧的常驻控件(可选) */
  control?: ReactNode;
  /** 子设置行(SettingsCard) */
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function SettingsExpander({ icon, title, description, control, children, defaultOpen, className }: SettingsExpanderProps) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={cn('settings-expander', open && 'open', className)}>
      <button type="button" className="settings-card se-head" aria-expanded={open}
              onClick={() => setOpen((o) => !o)}>
        {icon && <span className="sc-icon">{icon}</span>}
        <span className="sc-body">
          <span className="sc-title">{title}</span>
          {description && <span className="sc-desc">{description}</span>}
        </span>
        {control && <span className="sc-control" onClick={(e) => e.stopPropagation()}>{control}</span>}
        <ChevronDownRegular size={12} className="se-chevron" />
      </button>
      {/* 常驻挂载 + grid 0fr→1fr 高度动画;收起时 inert 防 Tab 聚焦到隐藏控件 */}
      <div className="se-body" inert={!open || undefined}>
        <div className="se-inner">{children}</div>
      </div>
    </div>
  );
}
