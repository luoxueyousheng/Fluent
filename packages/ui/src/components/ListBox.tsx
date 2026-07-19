/* ListBox — WinUI ListView 选中样式(左侧 Accent 药丸);单选/多选 + 键盘 */
import { useRef, useState, type ReactNode } from 'react';
import { cn } from '../cn';
import {
  CheckmarkRegular,
} from '@fluent-react/icon';
import { Empty } from './Basics';

export interface ListBoxItem { value: string; label: ReactNode; icon?: ReactNode }

interface SingleProps {
  multi?: false;
  value: string | null;
  onChange: (value: string) => void;
}
interface MultiProps {
  multi: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export type ListBoxProps = (SingleProps | MultiProps) & {
  items: ListBoxItem[];
  className?: string;
  'aria-label'?: string;
};

export function ListBox(props: ListBoxProps) {
  const { items, className } = props;
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const isSelected = (v: string) => (props.multi ? props.value.includes(v) : props.value === v);

  const pick = (v: string) => {
    if (props.multi) {
      props.onChange(props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
    } else {
      props.onChange(v);
    }
  };

  const focusIdx = (i: number) => {
    setCursor(i);
    rootRef.current?.querySelectorAll<HTMLElement>('.lb-item')[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); focusIdx(Math.min(items.length - 1, cursor + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusIdx(Math.max(0, cursor - 1)); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(items[cursor].value); }
  };

  return (
    <div ref={rootRef} className={cn('listbox', className)} role="listbox"
         aria-multiselectable={props.multi || undefined} tabIndex={0}
         onKeyDown={onKeyDown} aria-label={props['aria-label']}>
      {items.length === 0 && <Empty image="simple" />}
      {items.map((it, i) => (
        <div key={it.value} className="lb-item" role="option"
             aria-selected={isSelected(it.value)} tabIndex={i === cursor ? 0 : -1}
             onClick={() => { setCursor(i); pick(it.value); }}>
          {it.icon}
          {it.label}
          {props.multi && <CheckmarkRegular className="lb-check" />}
        </div>
      ))}
    </div>
  );
}
