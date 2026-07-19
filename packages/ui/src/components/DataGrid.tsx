/* DataGrid — 列标题(可排序)+ 行选择。grid-template-columns 由 columns 定义。
 * 按下态整行背景加深(CSS),不动子元素透明度。 */
import type { ReactNode } from 'react';
import { cn } from '../cn';
import { Icon } from './Icon';
import { Empty } from './Basics';

export interface DataGridColumn<Row> {
  key: string;
  title: ReactNode;
  width: string;                       // grid 轨道,如 '2fr' / '100px'
  sortable?: boolean;
  align?: 'left' | 'right';
  render?: (row: Row) => ReactNode;
}

export interface DataGridProps<Row extends { id: string }> {
  columns: DataGridColumn<Row>[];
  rows: Row[];
  selected?: string | null;
  onSelect?: (id: string, row: Row) => void;
  sort?: { key: string; dir: 'asc' | 'desc' } | null;
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  className?: string;
}

export function DataGrid<Row extends { id: string }>({
  columns, rows, selected, onSelect, sort, onSort, className,
}: DataGridProps<Row>) {
  const gridCols = { gridTemplateColumns: columns.map((c) => c.width).join(' ') };

  return (
    <div className={cn('datagrid', className)} role="grid">
      <div className="dg-row dg-head" style={gridCols} role="row">
        {columns.map((c) => (
          <div key={c.key}
               className={cn('dg-cell', c.sortable && 'sortable', c.align === 'right' && 'num')}
               data-sort={sort?.key === c.key ? sort.dir : undefined}
               role="columnheader"
               aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
               onClick={() => {
                 if (!c.sortable || !onSort) return;
                 onSort(c.key, sort?.key === c.key && sort.dir === 'asc' ? 'desc' : 'asc');
               }}>
            {c.title}
            {c.sortable && <Icon name="sort" size={12} className="sort-ind" strokeWidth={1.3} />}
          </div>
        ))}
      </div>
      <div className="dg-body">
        {rows.length === 0 && <Empty image="simple" />}
        {rows.map((row) => (
          <div key={row.id} className="dg-row" role="row" tabIndex={0}
               aria-selected={selected === row.id} style={gridCols}
               onClick={() => onSelect?.(row.id, row)}
               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(row.id, row); } }}>
            {columns.map((c) => (
              <div key={c.key} className={cn('dg-cell', c.align === 'right' && 'num')}>
                {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
