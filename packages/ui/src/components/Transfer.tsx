/* Transfer — 穿梭框(antd API):双列表左右移动数据。
 * dataSource 全量数据、targetKeys 目标列键集、render 定义行内容。
 * 支持搜索、全选、自定义操作按钮;onChange(targetKeys,direction,moveKeys)。 */
import { useCallback, useMemo, useState } from 'react';
import { cn } from '../cn';
import { Button } from './Button';
import {
  ChevronLeftRegular,
  ChevronRightRegular,
} from '@fluent-react/icon';

export interface TransferItem {
  key: string;
  title: string;
  disabled?: boolean;
  [k: string]: unknown;
}

export interface TransferProps {
  dataSource: TransferItem[];
  targetKeys: string[];
  onChange: (targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
  /** 自定义行渲染 */
  render?: (item: TransferItem) => React.ReactNode;
  /** 左侧标题 */
  titles?: [string, string];
  /** 搜索占位 */
  locale?: { searchPlaceholder?: string; itemUnit?: string; itemsUnit?: string; notFoundContent?: React.ReactNode };
  /** 显示搜索框 */
  showSearch?: boolean;
  /** 左侧操作区 */
  operations?: [React.ReactNode?, React.ReactNode?];
  /** 每列高度 */
  listStyle?: React.CSSProperties;
  disabled?: boolean;
  className?: string;
}

export function Transfer({
  dataSource, targetKeys, onChange, render, titles = ['源列表', '目标列表'], showSearch,
  locale, operations, listStyle, disabled, className,
}: TransferProps) {
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');
  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());

  const unit = locale?.itemUnit ?? '项';
  const units = locale?.itemsUnit ?? '项';
  const notFound = locale?.notFoundContent ?? '无数据';
  const searchPH = locale?.searchPlaceholder ?? '搜索';

  const leftItems = useMemo(() => {
    const items = dataSource.filter((d) => !targetKeys.includes(d.key));
    if (!leftSearch) return items;
    const q = leftSearch.toLowerCase();
    return items.filter((d) => d.title.toLowerCase().includes(q));
  }, [dataSource, targetKeys, leftSearch]);

  const rightItems = useMemo(() => {
    const items = dataSource.filter((d) => targetKeys.includes(d.key));
    if (!rightSearch) return items;
    const q = rightSearch.toLowerCase();
    return items.filter((d) => d.title.toLowerCase().includes(q));
  }, [dataSource, targetKeys, rightSearch]);

  const moveToRight = useCallback(() => {
    const keys = [...leftChecked];
    if (keys.length === 0) return;
    onChange(targetKeys.concat(keys), 'right', keys);
    setLeftChecked(new Set());
  }, [leftChecked, targetKeys, onChange]);

  const moveToLeft = useCallback(() => {
    const keys = [...rightChecked];
    if (keys.length === 0) return;
    onChange(targetKeys.filter((k) => !keys.includes(k)), 'left', keys);
    setRightChecked(new Set());
  }, [rightChecked, targetKeys, onChange]);

  const toggleAll = (side: 'left' | 'right') => {
    const items = side === 'left' ? leftItems : rightItems;
    const checked = side === 'left' ? leftChecked : rightChecked;
    const setChecked = side === 'left' ? setLeftChecked : setRightChecked;
    const enabled = items.filter((i) => !i.disabled);
    if (enabled.every((i) => checked.has(i.key))) {
      setChecked(new Set());
    } else {
      setChecked(new Set(enabled.map((i) => i.key)));
    }
  };

  const toggleItem = (key: string, side: 'left' | 'right') => {
    const checked = side === 'left' ? leftChecked : rightChecked;
    const setChecked = side === 'left' ? setLeftChecked : setRightChecked;
    const next = new Set(checked);
    if (next.has(key)) next.delete(key); else next.add(key);
    setChecked(next);
  };

  const renderList = (items: TransferItem[], side: 'left' | 'right', title: string) => {
    const checked = side === 'left' ? leftChecked : rightChecked;
    return (
      <div className="transfer-list" style={listStyle}>
        <div className="transfer-list-head">
          <label className="transfer-check-all">
            <input type="checkbox" checked={items.length > 0 && items.filter((i) => !i.disabled).every((i) => checked.has(i.key))}
                   onChange={() => toggleAll(side)} />
            <span className="transfer-title">{title}</span>
            <span className="transfer-count">{checked.size}/{items.length} {items.length > 1 ? units : unit}</span>
          </label>
        </div>
        {showSearch && (
          <div className="transfer-search">
            <input
              className="input sm"
              value={side === 'left' ? leftSearch : rightSearch}
              placeholder={searchPH}
              disabled={disabled}
              onChange={(e) => (side === 'left' ? setLeftSearch : setRightSearch)(e.target.value)}
            />
          </div>
        )}
        <div className="transfer-list-body">
          {items.length === 0 ? (
            <div className="transfer-empty">{notFound}</div>
          ) : items.map((item) => (
            <label key={item.key} className={cn('transfer-item', item.disabled && 'disabled')}>
              <input type="checkbox" checked={checked.has(item.key)}
                     disabled={item.disabled || disabled}
                     onChange={() => toggleItem(item.key, side)} />
              <span>{render ? render(item) : item.title}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('transfer', className)}>
      {renderList(leftItems, 'left', titles[0])}
      <div className="transfer-operation">
        {operations?.[0] ?? (
          <Button size="small" iconOnly disabled={leftChecked.size === 0 || disabled} onClick={moveToRight}
                  aria-label="移到右侧">
            <ChevronRightRegular size={12} />
          </Button>
        )}
        {operations?.[1] ?? (
          <Button size="small" iconOnly disabled={rightChecked.size === 0 || disabled} onClick={moveToLeft}
                  aria-label="移到左侧">
            <ChevronLeftRegular size={12} />
          </Button>
        )}
      </div>
      {renderList(rightItems, 'right', titles[1])}
    </div>
  );
}
