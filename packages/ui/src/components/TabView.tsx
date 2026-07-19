/* TabView — 浏览器式标签:选择 / 关闭 / 新建(受控) */
import type { ReactNode } from 'react';
import { cn } from '../cn';
import { Icon } from './Icon';

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
                <Icon name="close" size={10} strokeWidth={1.3} />
              </span>
            )}
          </button>
        ))}
        {onAdd && (
          <button className="tab-add" aria-label="新建标签" onClick={onAdd}>
            <Icon name="add" size={12} strokeWidth={1.3} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
