import { useState, type ButtonHTMLAttributes } from 'react';
import { cn } from '../cn';

export type ControlSize = 'small' | 'middle' | 'large';
export const sizeClass = (s?: ControlSize) => (s === 'small' ? 'sm' : s === 'large' ? 'lg' : undefined);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** accent=主按钮;subtle=无边框;link=超链接样式;默认标准按钮 */
  variant?: 'default' | 'accent' | 'subtle' | 'link';
  /** antd 惯例:危险操作。default 变体=红字红边;accent 变体=红底实心 */
  danger?: boolean;
  /** 24 / 32 / 40(antd 三档,视觉仍是 WinUI) */
  size?: ControlSize;
  /** 加载中:前置小圆环并禁用 */
  loading?: boolean;
  iconOnly?: boolean;
}

export function Button({
  variant = 'default', danger, size, loading, iconOnly,
  className, type = 'button', disabled, children, ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn('btn', variant !== 'default' && variant, danger && 'danger',
                    sizeClass(size), loading && 'loading', iconOnly && 'icon-only', className)}
      {...rest}
    >
      {loading && (
        <svg className="btn-spin" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
        </svg>
      )}
      {children}
    </button>
  );
}

/* ToggleButton — WinUI ToggleButton:可按下保持的按钮,选中态为 accent 实底。
 * 工具条里的粗体/置顶/静音类开关;成组互斥用 Tabs segmented。 */
export interface ToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: ControlSize;
  iconOnly?: boolean;
}

export function ToggleButton({
  checked: checkedProp, defaultChecked = false, onChange,
  size, iconOnly, className, type = 'button', onClick, children, ...rest
}: ToggleButtonProps) {
  const [inner, setInner] = useState(defaultChecked);
  const checked = checkedProp ?? inner;
  return (
    <button
      type={type}
      aria-pressed={checked}
      className={cn('btn', 'toggle-btn', checked && 'accent', sizeClass(size), iconOnly && 'icon-only', className)}
      onClick={(e) => {
        if (checkedProp == null) setInner(!checked);
        onChange?.(!checked);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
