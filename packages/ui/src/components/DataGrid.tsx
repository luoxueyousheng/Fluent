/* DataGrid — 列标题(可排序)+ 行选择。grid-template-columns 由 columns 定义。
 * 按下态整行背景加深(CSS),不动子元素透明度。 */
import type { ReactNode } from 'react';
import { cn } from '../cn';
import {
  ChevronDownRegular,
  ChevronUpRegular,
} from '@fluent-jade/icon';
import { Empty } from './Basics';

export interface DataGridColumn<Row> {
  key: string;
  title: ReactNode;
  width: string;                       // grid 轨道,如 '2fr' / '100px'
  sortable?: boolean;
  /** 列对齐:left 左齐 / center 居中 / right 右齐(数字列) */
  align?: 'left' | 'center' | 'right';
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

/** left / center / right → CSS 类;right 兼容旧类名 num */
export const cellAlign = (align?: 'left' | 'center' | 'right') =>
  align === 'right' ? 'num align-right'
    : align === 'center' ? 'align-center'
    : align === 'left' ? 'align-left'
    : undefined;

function SortInd({ active }: { active?: 'asc' | 'desc' }) {
  return (
    <span className="sort-ind" data-dir={active} aria-hidden>
      <ChevronUpRegular size={10} className="sort-up" />
      <ChevronDownRegular size={10} className="sort-down" />
    </span>
  );
}

export function DataGrid<Row extends { id: string }>({
  columns, rows, selected, onSelect, sort, onSort, className,
}: DataGridProps<Row>) {
  const gridCols = { gridTemplateColumns: columns.map((c) => c.width).join(' ') };

  return (
    <div className={cn('datagrid', className)} role="grid">
      <div className="dg-row dg-head" style={gridCols} role="row">
        {columns.map((c) => {
          const active = sort?.key === c.key ? sort.dir : undefined;
          return (
            <div key={c.key}
                 className={cn('dg-cell', c.sortable && 'sortable', cellAlign(c.align))}
                 data-sort={active}
                 role="columnheader"
                 aria-sort={active === 'asc' ? 'ascending' : active === 'desc' ? 'descending' : undefined}
                 onClick={() => {
                   if (!c.sortable || !onSort) return;
                   onSort(c.key, active === 'asc' ? 'desc' : 'asc');
                 }}>
              {c.title}
              {c.sortable && <SortInd active={active} />}
            </div>
          );
        })}
      </div>
      <div className="dg-body">
        {rows.length === 0 && <Empty image="simple" />}
        {rows.map((row) => (
          <div key={row.id} className="dg-row" role="row" tabIndex={0}
               aria-selected={selected === row.id} style={gridCols}
               onClick={() => onSelect?.(row.id, row)}
               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(row.id, row); } }}>
            {columns.map((c) => (
              <div key={c.key} className={cn('dg-cell', cellAlign(c.align))}>
                {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
