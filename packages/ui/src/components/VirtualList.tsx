/* VirtualList — 虚拟滚动列表:大数据量只渲染可视区 DOM 节点。
 * itemHeight 固定行高;items 数据源;renderItem 渲染每行。
 * 滚动时动态计算可见范围,撑高容器保持滚动条正确。 */
import { useCallback, useRef, useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../cn';

export interface VirtualListProps<T = unknown> {
  /** 数据源 */
  items: T[];
  /** 每行高度(px) */
  itemHeight: number;
  /** 渲染每行 */
  renderItem: (item: T, index: number) => ReactNode;
  /** 行 key(缺省退回索引,索引 key 在数据增删时会导致行复用错位) */
  itemKey?: (item: T, index: number) => string | number;
  /** 容器高度(px) */
  height: number;
  /** 额外渲染的上下行数 */
  overscan?: number;
  /** 容器 className */
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualList<T>({
  items, itemHeight, renderItem, itemKey, height, overscan = 3, className, onScroll,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback(() => {
    const top = containerRef.current?.scrollTop ?? 0;
    setScrollTop(top);
    onScroll?.(top);
  }, [onScroll]);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight) + overscan);
  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div ref={containerRef} className={cn('vlist', className)} style={{ height, overflow: 'auto' }} onScroll={handleScroll}>
      <div className="vlist-spacer" style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, i) => {
          const realIndex = startIndex + i;
          return (
            <div key={itemKey ? itemKey(item, realIndex) : realIndex} className="vlist-item" style={{ position: 'absolute', top: realIndex * itemHeight, left: 0, right: 0, height: itemHeight }}>
              {renderItem(item, realIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
