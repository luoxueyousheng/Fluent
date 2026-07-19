import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../cn';
import { colorClass, radiusClass, type Radius, type SemanticColor } from '../modifiers';

export type ControlSize = 'small' | 'middle' | 'large';
export const sizeClass = (s?: ControlSize) => (s === 'small' ? 'sm' : s === 'large' ? 'lg' : undefined);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** accent=主按钮;subtle=无边框;link=超链接样式;默认标准按钮 */
  variant?: 'default' | 'accent' | 'subtle' | 'link';
  /** antd 惯例:危险操作。default 变体=红字红边;accent 变体=红底实心 */
  danger?: boolean;
  /** 语义着色:default 变体 = 文字+描边 tint,accent 变体 = 实色底 */
  color?: SemanticColor;
  /** 圆角:none / sm / md(默认) / lg */
  radius?: Radius;
  /** 24 / 32 / 40(antd 三档,视觉仍是 WinUI) */
  size?: ControlSize;
  /** 加载中:前置小圆环并禁用 */
  loading?: boolean;
  iconOnly?: boolean;
}

export function Button({
  variant = 'default', danger, color, radius, size, loading, iconOnly,
  className, type = 'button', disabled, children, ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn('btn', variant !== 'default' && variant, danger && 'danger',
                    colorClass(color), colorClass(color) && 'colored', radiusClass(radius),
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
export interface ToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'color'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** 语义着色:按下态实色随之变化 */
  color?: SemanticColor;
  /** 圆角:none / sm / md(默认) / lg */
  radius?: Radius;
  size?: ControlSize;
  iconOnly?: boolean;
}

export function ToggleButton({
  checked: checkedProp, defaultChecked = false, onChange, color, radius,
  size, iconOnly, className, type = 'button', onClick, children, ...rest
}: ToggleButtonProps) {
  const [inner, setInner] = useState(defaultChecked);
  const checked = checkedProp ?? inner;
  return (
    <button
      type={type}
      aria-pressed={checked}
      className={cn('btn', 'toggle-btn', checked && 'accent', colorClass(color), radiusClass(radius),
                    sizeClass(size), iconOnly && 'icon-only', className)}
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

/* ToggleButtonGroup — 开关按钮组:默认合并为一体(WinUI 分段形态),
 * separated 改为留缝分离;单选(可再点取消)或 multiple 多选。 */
export interface ToggleButtonGroupOption {
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ToggleButtonGroupProps {
  options: ToggleButtonGroupOption[];
  /** 多选(默认单选;单选再点已选项 = 取消,回调 '') */
  multiple?: boolean;
  /** 分离形态:按钮间留缝(默认合并一体) */
  separated?: boolean;
  /** 受控值:单选 string,多选 string[] */
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  /** 语义着色(整组,按下态实色) */
  color?: SemanticColor;
  /** 圆角(整组;合并形态作用于首末端) */
  radius?: Radius;
  size?: ControlSize;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function ToggleButtonGroup({
  options, multiple, separated, value: valueProp, defaultValue,
  onChange, color, radius, size, disabled, className, ...rest
}: ToggleButtonGroupProps) {
  const norm = (v?: string | string[]): string[] =>
    v == null || v === '' ? [] : Array.isArray(v) ? v : [v];
  const [inner, setInner] = useState<string[]>(() => norm(defaultValue));
  const selected = valueProp !== undefined ? norm(valueProp) : inner;

  const toggle = (v: string) => {
    const has = selected.includes(v);
    const next = multiple
      ? (has ? selected.filter((x) => x !== v) : [...selected, v])
      : (has ? [] : [v]);
    if (valueProp === undefined) setInner(next);
    onChange?.(multiple ? next : (next[0] ?? ''));
  };

  return (
    <div role="group"
         className={cn('tbtn-group', separated && 'separated', colorClass(color), radiusClass(radius), className)}
         {...rest}>
      {options.map((o) => (
        <ToggleButton key={o.value} checked={selected.includes(o.value)}
                      disabled={disabled || o.disabled} size={size}
                      onChange={() => toggle(o.value)}>
          {o.icon}
          {o.label ?? o.value}
        </ToggleButton>
      ))}
    </div>
  );
}
