/* Table — antd API 规范(columns/dataSource/rowKey/pagination/onRow/rowSelection/
 * loading),WinUI DataGrid 形态(复用 dg-* 类):layer 表头、灰 hover、
 * 排序循环 升→降→无;striped 斑马纹、size=small 紧凑密度、loading 套 Spin、
 * maxHeight 控表体滚动高(表头本就吸顶)。 */
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '../cn';
import { Icon } from './Icon';
import { Checkbox, Empty } from './Basics';
import { Pagination } from './Pagination';
import { Spin } from './Spin';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ColumnType<T> {
  title: ReactNode;
  dataIndex?: keyof T & string;
  key?: string;
  render?: (value: any, record: T, index: number) => ReactNode;
  sorter?: (a: T, b: T) => number;
  align?: 'left' | 'right';
  width?: string;               // grid 轨道,如 '2fr' / '120px';缺省 1fr
}

export interface TableRowSelection<T> {
  /** checkbox 多选(默认)/ radio 单选 */
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: string[];
  defaultSelectedRowKeys?: string[];
  onChange?: (keys: string[], rows: T[]) => void;
  /** 按行禁用选择 */
  getCheckboxProps?: (record: T) => { disabled?: boolean };
}

export interface TableProps<T> {
  columns: ColumnType<T>[];
  dataSource: T[];
  rowKey?: (keyof T & string) | ((record: T) => string);
  pagination?: false | { pageSize?: number };
  onRow?: (record: T) => { onClick?: () => void };
  /** 行选择:表头全选(带半选态),radio 为单选 */
  rowSelection?: TableRowSelection<T>;
  /** 加载态:套 Spin 遮罩 */
  loading?: boolean;
  /** 斑马纹 */
  striped?: boolean;
  /** small = 紧凑密度(行高 32) */
  size?: 'small' | 'middle';
  /** 无数据占位,缺省 <Empty image="simple" /> */
  empty?: ReactNode;
  /** 表体滚动高度上限(px),缺省 320 */
  maxHeight?: number;
  className?: string;
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null;

let tblSeq = 0;

export function Table<T extends object>({
  columns, dataSource, rowKey = 'key' as keyof T & string,
  pagination = { pageSize: 10 }, onRow, rowSelection,
  loading, striped, size, empty, maxHeight, className,
}: TableProps<T>) {
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const pageSize = pagination === false ? dataSource.length : (pagination.pageSize ?? 10);
  const nameRef = useRef('');
  if (!nameRef.current) nameRef.current = `tbl-${++tblSeq}`;

  /* 行选择(受控/非受控) */
  const selType = rowSelection?.type ?? 'checkbox';
  const [innerKeys, setInnerKeys] = useState<string[]>(rowSelection?.defaultSelectedRowKeys ?? []);
  const selKeys = rowSelection?.selectedRowKeys ?? innerKeys;
  const commitKeys = (keys: string[]) => {
    if (rowSelection?.selectedRowKeys == null) setInnerKeys(keys);
    rowSelection?.onChange?.(keys, dataSource.filter((r, i) => keys.includes(keyOf(r, i))));
  };

  const keyOf = (r: T, i: number): string =>
    typeof rowKey === 'function' ? rowKey(r) : String((r as any)[rowKey] ?? i);
  const colKey = (c: ColumnType<T>, i: number) => c.key ?? c.dataIndex ?? String(i);
  const rowDisabled = (r: T) => !!rowSelection?.getCheckboxProps?.(r).disabled;

  const sorted = useMemo(() => {
    if (!sort) return dataSource;
    const col = columns.find((c, i) => colKey(c, i) === sort.key);
    if (!col?.sorter) return dataSource;
    const s = sort.dir === 'asc' ? 1 : -1;
    return [...dataSource].sort((a, b) => col.sorter!(a, b) * s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, sort, columns]);

  const paged = pagination === false ? sorted
    : sorted.slice((page - 1) * pageSize, page * pageSize);

  /* antd 排序循环:无 → 升 → 降 → 无 */
  const cycleSort = (key: string) => {
    setSort((cur) => (cur?.key !== key ? { key, dir: 'asc' }
      : cur.dir === 'asc' ? { key, dir: 'desc' } : null));
    setPage(1);
  };

  /* 表头全选:作用于当前页可选行(antd 行为);先取键再过滤,免得索引回退错位 */
  const pageKeys = paged.map((r, i) => ({ r, k: keyOf(r, i) }))
    .filter(({ r }) => !rowDisabled(r)).map(({ k }) => k);
  const pageSelected = pageKeys.filter((k) => selKeys.includes(k));
  const allChecked = pageKeys.length > 0 && pageSelected.length === pageKeys.length;
  const someChecked = pageSelected.length > 0 && !allChecked;
  const toggleAll = () => {
    if (allChecked) commitKeys(selKeys.filter((k) => !pageKeys.includes(k)));
    else commitKeys([...new Set([...selKeys, ...pageKeys])]);
  };
  const toggleRow = (k: string) => {
    if (selType === 'radio') { commitKeys([k]); return; }
    commitKeys(selKeys.includes(k) ? selKeys.filter((x) => x !== k) : [...selKeys, k]);
  };

  const gridCols = {
    gridTemplateColumns: (rowSelection ? ['44px'] : [])
      .concat(columns.map((c) => c.width ?? '1fr')).join(' '),
  };

  const body = (
    <div className={className}>
      <div className={cn('datagrid', striped && 'striped', size === 'small' && 'compact')} role="grid">
        <div className="dg-row dg-head" style={gridCols} role="row">
          {rowSelection && (
            <div className="dg-cell dg-sel" role="columnheader">
              {selType === 'checkbox' && (
                <Checkbox aria-label="全选本页" checked={allChecked} indeterminate={someChecked}
                          onChange={toggleAll} />
              )}
            </div>
          )}
          {columns.map((c, i) => {
            const k = colKey(c, i);
            return (
              <div key={k}
                   className={cn('dg-cell', c.sorter && 'sortable', c.align === 'right' && 'num')}
                   data-sort={sort?.key === k ? sort.dir : undefined}
                   role="columnheader"
                   aria-sort={sort?.key === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                   onClick={() => c.sorter && cycleSort(k)}>
                {c.title}
                {c.sorter && <Icon name="sort" size={12} className="sort-ind" strokeWidth={1.3} />}
              </div>
            );
          })}
        </div>
        {/* key 随页码/排序变化:表体整体做一次轻微淡入(dg-refresh),
            行不做逐行错峰飞入——数据表格逐行动画在翻页/排序时过于喧闹 */}
        <div className="dg-body dg-refresh" key={`${page}|${sort?.key ?? ''}|${sort?.dir ?? ''}`}
             style={maxHeight != null ? { maxHeight } : undefined}>
          {paged.length === 0 && (empty ?? <Empty image="simple" />)}
          {paged.map((r, ri) => {
            const extra = onRow?.(r);
            const k = keyOf(r, ri);
            const selected = !!rowSelection && selKeys.includes(k);
            const dis = !!rowSelection && rowDisabled(r);
            return (
              <div key={k} className="dg-row" role="row" tabIndex={0}
                   aria-selected={rowSelection ? selected : undefined}
                   style={gridCols} onClick={extra?.onClick}
                   onKeyDown={(e) => { if (e.key === 'Enter') extra?.onClick?.(); }}>
                {rowSelection && (
                  <div className="dg-cell dg-sel" onClick={(e) => e.stopPropagation()}>
                    {selType === 'checkbox' ? (
                      <Checkbox aria-label={`选择行 ${k}`} checked={selected} disabled={dis}
                                onChange={() => toggleRow(k)} />
                    ) : (
                      <label className="check radio">
                        <input type="radio" name={nameRef.current} aria-label={`选择行 ${k}`}
                               checked={selected} disabled={dis} onChange={() => toggleRow(k)} />
                        <span className="box" />
                      </label>
                    )}
                  </div>
                )}
                {columns.map((c, ci) => {
                  const raw = c.dataIndex ? (r as any)[c.dataIndex] : undefined;
                  return (
                    <div key={colKey(c, ci)} className={cn('dg-cell', c.align === 'right' && 'num')}>
                      {c.render ? c.render(raw, r, ri) : String(raw ?? '')}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {pagination !== false && sorted.length > pageSize && (
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <Pagination current={page} total={sorted.length} pageSize={pageSize}
                      onChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );

  /* loading 未传时不包 Spin,DOM 结构对旧用法零变化 */
  return loading == null ? body : <Spin spinning={loading} delay={150}>{body}</Spin>;
}
