/* ListBox — WinUI ListView 选中样式(左侧 Accent 药丸);单选/多选 + 键盘 */
import { useRef, useState, type ReactNode } from 'react';
import { cn } from '../cn';
import {
  CheckmarkRegular,
} from '@fluent-jade/icon';
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
  // items 动态收缩后 cursor 可能越界,渲染期钳回 [0, items.length-1]
  const cur = items.length > 0 ? Math.min(cursor, items.length - 1) : 0;

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
    if (items.length === 0) return;            // 空列表:无项可导航/选中
    if (e.key === 'ArrowDown') { e.preventDefault(); focusIdx(Math.min(items.length - 1, cur + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusIdx(Math.max(0, cur - 1)); }
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const v = items[cur]?.value;             // items 可能为空/收缩越界,防御
      if (v != null) pick(v);
    }
  };

  return (
    <div ref={rootRef} className={cn('listbox', className)} role="listbox"
         aria-multiselectable={props.multi || undefined} tabIndex={0}
         onKeyDown={onKeyDown} aria-label={props['aria-label']}>
      {items.length === 0 && <Empty image="simple" />}
      {items.map((it, i) => (
        <div key={it.value} className="lb-item" role="option"
             aria-selected={isSelected(it.value)} tabIndex={i === cur ? 0 : -1}
             onClick={() => { setCursor(i); pick(it.value); }}>
          {it.icon}
          {it.label}
          {props.multi && <CheckmarkRegular className="lb-check" />}
        </div>
      ))}
    </div>
  );
}
