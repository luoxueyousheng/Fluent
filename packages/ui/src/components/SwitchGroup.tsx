/* SwitchGroup — 开关组容器,与 CheckboxGroup 同构(options + value string[]):
 * 值为「已开启项」的键集。语义区别:开关是立即生效的独立设置项,
 * 组只是聚合布局与取值;配 card 即一组设置行卡。 */
import type { ReactNode } from 'react';
import { cn } from '../cn';
import { Switch } from './Basics';
import { useMergedState } from '../useMergedState';
import { colorClass, type SemanticColor } from '../modifiers';

export interface SwitchGroupProps {
  options: Array<{ value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }>;
  /** 已开启项的键集 */
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  /** 排列方向,默认横向 */
  vertical?: boolean;
  /** 卡片形态(options.description 作为描述行) */
  card?: boolean;
  /** 整组禁用 */
  disabled?: boolean;
  /** 语义着色:整组开启态随之变色 */
  color?: SemanticColor;
  className?: string;
}

export function SwitchGroup({
  options, value, defaultValue = [], onChange, vertical, card, disabled, color, className,
}: SwitchGroupProps) {
  const [values, setValues] = useMergedState<string[]>(defaultValue, value, onChange);
  const toggle = (v: string) =>
    setValues(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <div className={cn('switch-group', vertical && 'vertical', card && 'cards', colorClass(color), className)} role="group">
      {options.map((o) => (
        <Switch key={o.value} disabled={disabled || o.disabled}
                card={card} description={card ? o.description : undefined}
                color={color}
                checked={values.includes(o.value)}
                onChange={() => toggle(o.value)}>
          {o.label}
        </Switch>
      ))}
    </div>
  );
}
