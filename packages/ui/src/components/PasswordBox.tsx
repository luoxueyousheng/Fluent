/* PasswordBox — 密码输入(WinUI PasswordBox 形态):
 * 有内容时尾部浮现显隐钮。reveal='press' 为 WinUI 原生行为(按住窥视,
 * 抬手/移出即遮);'toggle' 为 antd 行为(点击切换,图标 eye/eyeOff);false 关闭。 */
import { useState, type InputHTMLAttributes } from 'react';
import { cn } from '../cn';
import { EyeOffRegular, EyeRegular } from '@fluent-jade/icon';
import { sizeClass, type ControlSize } from './Button';
import { statusClass, type ControlStatus } from './Field';
import { colorClass, radiusClass, type Radius, type SemanticColor } from '../modifiers';

export interface PasswordBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'color'> {
  size?: ControlSize;
  status?: ControlStatus;
  /** 显隐钮行为:press 按住窥视(WinUI 默认)/ toggle 点击切换 / false 不渲染 */
  reveal?: 'press' | 'toggle' | false;
  /** 语义着色:聚焦下划线随之变色 */
  color?: SemanticColor;
  /** 圆角:none / sm / md(默认) / lg */
  radius?: Radius;
}

export function PasswordBox({
  size, status, reveal = 'press', color, radius, className, onChange, value, defaultValue, ...rest
}: PasswordBoxProps) {
  const [visible, setVisible] = useState(false);
  const [innerHas, setInnerHas] = useState(!!defaultValue);
  const hasValue = value != null ? String(value).length > 0 : innerHas;

  const btnProps = reveal === 'press'
    ? {
        onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); setVisible(true); },
        onPointerUp: () => setVisible(false),
        onPointerLeave: () => setVisible(false),
        onPointerCancel: () => setVisible(false),
      }
    : { onClick: () => setVisible((v) => !v) };

  return (
    <span className={cn('passwordbox', colorClass(color), radiusClass(radius), className)}>
      <input type={visible ? 'text' : 'password'}
             className={cn('input', sizeClass(size), statusClass(status))}
             value={value} defaultValue={defaultValue}
             onChange={(e) => { setInnerHas(e.target.value.length > 0); onChange?.(e); }}
             {...rest} />
      {reveal !== false && hasValue && (
        <button type="button" className="pb-reveal" tabIndex={-1}
                aria-label={reveal === 'toggle' ? (visible ? '隐藏密码' : '显示密码') : '按住显示密码'}
                {...btnProps}>
          {reveal === 'toggle' && visible
            ? <EyeOffRegular size={14} />
            : <EyeRegular size={14} />}
        </button>
      )}
    </span>
  );
}
