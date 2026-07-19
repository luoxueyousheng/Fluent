/* TabView — 浏览器式标签:选择 / 关闭 / 新建(受控) */
import type { ReactNode } from 'react';
import { cn } from '../cn';
import {
  AddRegular,
  DismissRegular,
} from '@fluent-jade/icon';

export interface TabViewItem { key: string; label: string; icon?: ReactNode }

export interface TabViewProps {
  items: TabViewItem[];
  value: string;
  onChange: (key: string) => void;
  onClose?: (key: string) => void;
  onAdd?: () => void;
  className?: string;
  children?: ReactNode;
}

export function TabView({ items, value, onChange, onClose, onAdd, className, children }: TabViewProps) {
  return (
    <div className={cn('tabview', className)}>
      <div className="tabstrip" role="tablist">
        {items.map((t) => (
          <button key={t.key} className="vtab" role="tab" aria-selected={t.key === value}
                  onClick={() => onChange(t.key)}>
            {t.icon}
            <span className="vtab-label">{t.label}</span>
            {onClose && (
              <span className="tab-close" role="button" aria-label={`关闭 ${t.label}`}
                    onClick={(e) => { e.stopPropagation(); onClose(t.key); }}>
                <DismissRegular size={10} />
              </span>
            )}
          </button>
        ))}
        {onAdd && (
          <button className="tab-add" aria-label="新建标签" onClick={onAdd}>
            <AddRegular size={12} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
