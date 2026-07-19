/* CheckboxGroup — antd 惯例的多选组容器(options + value/defaultValue/onChange),
 * 与 RadioGroup 同构,值为 string[]。 */
import type { ReactNode } from 'react';
import { cn } from '../cn';
import { Checkbox } from './Basics';
import { useMergedState } from '../useMergedState';
import { colorClass, type SemanticColor } from '../modifiers';

export interface CheckboxGroupProps {
  options: Array<{ value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }>;
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  /** 排列方向,默认横向 */
  vertical?: boolean;
  /** 卡片形态(options.description 作为卡片描述行) */
  card?: boolean;
  /** 整组禁用 */
  disabled?: boolean;
  /** 语义着色:整组选中态随之变色 */
  color?: SemanticColor;
  className?: string;
}

export function CheckboxGroup({
  options, value, defaultValue = [], onChange, vertical, card, disabled, color, className,
}: CheckboxGroupProps) {
  const [values, setValues] = useMergedState<string[]>(defaultValue, value, onChange);
  const toggle = (v: string) =>
    setValues(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <div className={cn('check-group', vertical && 'vertical', card && 'cards', colorClass(color), className)} role="group">
      {options.map((o) => (
        <Checkbox key={o.value} disabled={disabled || o.disabled}
                  checked={values.includes(o.value)}
                  card={card} description={card ? o.description : undefined}
                  color={color}
                  onChange={() => toggle(o.value)}>
          {o.label}
        </Checkbox>
      ))}
    </div>
  );
}
