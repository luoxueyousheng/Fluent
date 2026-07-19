/* RadioGroup — antd 惯例的单选组容器(options + value/defaultValue/onChange) */
import type { ReactNode } from 'react';
import { cn } from '../cn';
import { Radio } from './Basics';
import { useMergedState } from '../useMergedState';
import { colorClass, type SemanticColor } from '../modifiers';

export interface RadioGroupProps {
  options: Array<{ value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }>;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** 排列方向,默认横向 */
  vertical?: boolean;
  /** 卡片形态(options.description 作为卡片描述行) */
  card?: boolean;
  name?: string;
  /** 语义着色:整组选中态随之变色 */
  color?: SemanticColor;
  className?: string;
}

let seq = 0;

export function RadioGroup({ options, value, defaultValue = null, onChange, vertical, card, name, color, className }: RadioGroupProps) {
  const [current, setCurrent] = useMergedState<string | null>(defaultValue, value, onChange as (v: string | null) => void);
  const groupName = name ?? `rg-${++seq}`;
  return (
    <div className={cn('radio-group', vertical && 'vertical', card && 'cards', colorClass(color), className)} role="radiogroup">
      {options.map((o) => (
        <Radio key={o.value} name={groupName} disabled={o.disabled}
               card={card} description={card ? o.description : undefined}
               color={color}
               checked={current === o.value}
               onChange={() => setCurrent(o.value)}>
          {o.label}
        </Radio>
      ))}
    </div>
  );
}
