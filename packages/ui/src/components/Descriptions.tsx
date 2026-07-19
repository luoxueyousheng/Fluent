/* Descriptions — 描述列表(antd API):键值对展示,适合详情页。
 * items[{label,children,span}] 每项一行或多列;border 模式加 1px 分隔线。
 * column 控制每行列数(默认 3),size 三档(24/32/40)影响间距。 */
import { type ReactNode } from 'react';
import { cn } from '../cn';

export interface DescriptionsItem {
  label: ReactNode;
  children: ReactNode;
  /** 跨列数(默认 1) */
  span?: number;
}

export interface DescriptionsProps {
  /** 描述项 */
  items: DescriptionsItem[];
  /** 每行列数 */
  column?: number;
  /** 标题 */
  title?: ReactNode;
  /** 带边框分割线 */
  bordered?: boolean;
  /** 尺寸 */
  size?: 'small' | 'middle' | 'large';
  /** 垂直布局(标签在上,内容在下) */
  vertical?: boolean;
  className?: string;
}

export function Descriptions({
  items, column: columnProp, title, bordered, size = 'middle', vertical, className,
}: DescriptionsProps) {
  const column = columnProp ?? 3;
  const cls = cn('desc', bordered && 'desc-bordered', size === 'small' && 'desc-sm', size === 'large' && 'desc-lg', vertical && 'desc-vertical', className);

  /* 按 span 分行 */
  const rows: DescriptionsItem[][] = [];
  let row: DescriptionsItem[] = [];
  let spanSum = 0;
  for (const item of items) {
    const s = item.span ?? 1;
    if (spanSum + s > column && row.length > 0) {
      rows.push(row);
      row = [];
      spanSum = 0;
    }
    row.push(item);
    spanSum += s;
  }
  if (row.length > 0) rows.push(row);

  return (
    <div className={cls}>
      {title != null && <div className="desc-title">{title}</div>}
      <div className="desc-body">
        {rows.map((r, ri) => (
          <div key={ri} className="desc-row">
            {r.map((item, ci) => (
              <div key={ci} className="desc-item" style={{ gridColumn: `span ${item.span ?? 1}` }}>
                <div className="desc-label">{item.label}</div>
                <div className="desc-value">{item.children}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
