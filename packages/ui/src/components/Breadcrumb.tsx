/* Breadcrumb — WinUI BreadcrumbBar:末项为当前页(加粗不可点),其余可点回退 */
import type { ReactNode } from 'react';
import { cn } from '../cn';
import { Icon } from './Icon';

export interface BreadcrumbItem { key: string; label: ReactNode }

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (key: string) => void;
  className?: string;
}

export function Breadcrumb({ items, onNavigate, className }: BreadcrumbProps) {
  return (
    <nav className={cn('breadcrumb', className)} aria-label="面包屑">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={it.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {i > 0 && <Icon name="chevronRight" size={12} className="bc-sep" strokeWidth={1.3} />}
            <button type="button" className={cn('bc-item', last && 'current')}
                    aria-current={last ? 'page' : undefined} disabled={last}
                    onClick={() => !last && onNavigate?.(it.key)}>
              {it.label}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
