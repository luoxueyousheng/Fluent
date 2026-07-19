/* Field — 表单字段容器:label + 控件 + 校验态(error/success)提示;
 * TextBox/TextArea 支持 antd 风 size 三档与 status(error/warning)。 */
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cn } from '../cn';
import { CheckmarkCircleRegular, ErrorCircleRegular } from '@fluent-react/icon';
import { sizeClass, type ControlSize } from './Button';
import { colorClass, radiusClass, type Radius, type SemanticColor } from '../modifiers';

export type ControlStatus = 'error' | 'warning';
export const statusClass = (s?: ControlStatus) => (s ? `status-${s}` : undefined);

export interface FieldProps {
  label?: string;
  /** 校验信息:error 红、success 绿;不传则正常态 */
  validation?: { state: 'error' | 'success'; message?: string } | null;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, validation, hint, children, className }: FieldProps) {
  return (
    <div className={cn('field', validation && `field-${validation.state}`, className)}>
      {label && <label>{label}</label>}
      {children}
      {validation?.message ? (
        <span className={cn('field-msg', validation.state)} role={validation.state === 'error' ? 'alert' : undefined}>
          {validation.state === 'error'
            ? <ErrorCircleRegular size={12} />
            : <CheckmarkCircleRegular size={12} />}
          {validation.message}
        </span>
      ) : hint ? (
        <span className="field-msg muted">{hint}</span>
      ) : null}
    </div>
  );
}

export interface TextBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'> {
  size?: ControlSize;
  status?: ControlStatus;
  /** 语义着色:聚焦下划线随之变色 */
  color?: SemanticColor;
  /** 圆角:none / sm / md(默认) / lg */
  radius?: Radius;
}

export function TextBox({ size, status, color, radius, className, ...rest }: TextBoxProps) {
  return <input className={cn('input', sizeClass(size), statusClass(status), colorClass(color), radiusClass(radius), className)} {...rest} />;
}

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'color'> {
  status?: ControlStatus;
  /** 语义着色:聚焦下划线随之变色 */
  color?: SemanticColor;
  /** 圆角:none / sm / md(默认) / lg */
  radius?: Radius;
}

export function TextArea({ status, color, radius, className, ...rest }: TextAreaProps) {
  return <textarea className={cn('textarea', statusClass(status), colorClass(color), radiusClass(radius), className)} {...rest} />;
}
