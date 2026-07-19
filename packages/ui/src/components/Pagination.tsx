/* Pagination — antd API 规范(current/total/pageSize/onChange/showSizeChanger),
 * WinUI 形态:透明页码钮 + 灰底加粗活动项(非 antd 主色描边空心项) */
import { cn } from '../cn';
import { Icon } from './Icon';
import { ComboBox } from './ComboBox';
import { useMergedState } from '../useMergedState';

export interface PaginationProps {
  current?: number;
  defaultCurrent?: number;
  total: number;
  pageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

/** antd 同款省略算法:最多 7 个页码钮,当前页两侧各留 2 */
function pageItems(current: number, pages: number): Array<number | 'prev-5' | 'next-5'> {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const items: Array<number | 'prev-5' | 'next-5'> = [1];
  const lo = Math.max(2, current - 2);
  const hi = Math.min(pages - 1, current + 2);
  if (lo > 2) items.push('prev-5');
  for (let i = lo; i <= hi; i++) items.push(i);
  if (hi < pages - 1) items.push('next-5');
  items.push(pages);
  return items;
}

export function Pagination({
  current: currentProp, defaultCurrent = 1, total,
  pageSize: pageSizeProp, onChange, showSizeChanger, pageSizeOptions = [10, 20, 50], className,
}: PaginationProps) {
  const [size, setSize] = useMergedState(pageSizeOptions[0] ?? 10, pageSizeProp, undefined);
  const pages = Math.max(1, Math.ceil(total / size));
  const [current, setCurrent] = useMergedState(defaultCurrent, currentProp, undefined);

  const go = (p: number) => {
    const next = Math.min(pages, Math.max(1, p));
    setCurrent(next);
    onChange?.(next, size);
  };

  return (
    <div className={cn('pager', className)} role="navigation" aria-label="分页">
      <button className="pager-item" disabled={current <= 1} aria-label="上一页" onClick={() => go(current - 1)}>
        <Icon name="chevronRight" size={12} style={{ transform: 'rotate(180deg)' }} />
      </button>
      {pageItems(current, pages).map((it, i) =>
        typeof it === 'number' ? (
          <button key={it} className={cn('pager-item', it === current && 'active')}
                  aria-current={it === current ? 'page' : undefined}
                  onClick={() => go(it)}>{it}</button>
        ) : (
          <button key={`${it}-${i}`} className="pager-item pager-jump"
                  aria-label={it === 'prev-5' ? '向前 5 页' : '向后 5 页'}
                  onClick={() => go(it === 'prev-5' ? current - 5 : current + 5)}>···</button>
        ),
      )}
      <button className="pager-item" disabled={current >= pages} aria-label="下一页" onClick={() => go(current + 1)}>
        <Icon name="chevronRight" size={12} />
      </button>
      {showSizeChanger && (
        <ComboBox aria-label="每页条数" className="pager-size"
                  options={pageSizeOptions.map((n) => ({ value: String(n), label: `${n} 条/页` }))}
                  value={String(size)}
                  onChange={(v) => { setSize(+v); go(1); onChange?.(1, +v); }} />
      )}
    </div>
  );
}
