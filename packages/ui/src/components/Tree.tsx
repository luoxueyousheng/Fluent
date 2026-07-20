/* Tree — antd API 规范(treeData/expandedKeys/selectedKeys/onSelect/onExpand),
 * WinUI TreeView 形态:行 32px、chevron 旋转、选中行灰底 + 左侧 accent 药丸 */
import { useRef, useState, type ReactNode } from 'react';
import { cn } from '../cn';
import {
  ChevronRightRegular,
} from '@fluent-jade/icon';

export interface TreeDataNode {
  key: string;
  title: ReactNode;
  children?: TreeDataNode[];
  disabled?: boolean;
}

export interface TreeProps {
  treeData: TreeDataNode[];
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: string[];
  expandedKeys?: string[];
  onExpand?: (keys: string[]) => void;
  defaultSelectedKeys?: string[];
  selectedKeys?: string[];
  onSelect?: (keys: string[], info: { node: TreeDataNode }) => void;
  className?: string;
}

function allKeys(nodes: TreeDataNode[]): string[] {
  return nodes.flatMap((n) => [n.key, ...(n.children ? allKeys(n.children) : [])]);
}

export function Tree({
  treeData, defaultExpandAll, defaultExpandedKeys = [], expandedKeys: expandedProp, onExpand,
  defaultSelectedKeys = [], selectedKeys: selectedProp, onSelect, className,
}: TreeProps) {
  const [expandedInner, setExpandedInner] = useState<string[]>(
    () => (defaultExpandAll ? allKeys(treeData) : defaultExpandedKeys));
  const [selectedInner, setSelectedInner] = useState<string[]>(defaultSelectedKeys);
  const expanded = expandedProp ?? expandedInner;
  const selected = selectedProp ?? selectedInner;
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLUListElement>(null);

  // 展平当前可见节点(与渲染顺序一致),供键盘漫游
  const visible: TreeDataNode[] = [];
  const walk = (nodes: TreeDataNode[]) => nodes.forEach((n) => {
    visible.push(n);
    if (n.children?.length && expanded.includes(n.key)) walk(n.children);
  });
  walk(treeData);
  const idxOf = new Map(visible.map((n, i) => [n.key, i]));

  const toggle = (key: string) => {
    const next = expanded.includes(key) ? expanded.filter((k) => k !== key) : [...expanded, key];
    if (expandedProp === undefined) setExpandedInner(next);
    onExpand?.(next);
  };
  const select = (node: TreeDataNode) => {
    if (node.disabled) return;
    const next = selected.includes(node.key) ? [] : [node.key];   // antd 单选:再点取消
    if (selectedProp === undefined) setSelectedInner(next);
    onSelect?.(next, { node });
  };

  const focusIdx = (i: number) => {
    setCursor(i);
    rootRef.current?.querySelectorAll<HTMLElement>('.tree-row')[i]?.focus();
  };

  /* 键盘漫游(风格同 ListBox):上下移动、右展开/进子级、左收起、Enter 选中 */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = Math.min(cursor, visible.length - 1);
    const node = visible[cur];
    if (!node) return;
    const hasChildren = !!node.children?.length;
    const open = expanded.includes(node.key);
    if (e.key === 'ArrowDown') { e.preventDefault(); focusIdx(Math.min(visible.length - 1, cur + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusIdx(Math.max(0, cur - 1)); }
    else if (e.key === 'ArrowRight' && hasChildren) {
      e.preventDefault();
      if (!open) toggle(node.key);
      else focusIdx(cur + 1);
    } else if (e.key === 'ArrowLeft' && hasChildren && open) { e.preventDefault(); toggle(node.key); }
    else if (e.key === 'Enter') { e.preventDefault(); select(node); }
  };

  const renderNodes = (nodes: TreeDataNode[], level: number): ReactNode =>
    nodes.map((n) => {
      const hasChildren = !!n.children?.length;
      const open = expanded.includes(n.key);
      return (
        <li key={n.key} role="treeitem" aria-expanded={hasChildren ? open : undefined}
            aria-selected={selected.includes(n.key)}>
          <div className={cn('tree-row', selected.includes(n.key) && 'selected', n.disabled && 'disabled')}
               style={{ paddingLeft: 8 + level * 24 }}
               tabIndex={idxOf.get(n.key) === cursor ? 0 : -1}
               onClick={() => { setCursor(idxOf.get(n.key) ?? 0); select(n); }}>
            <span className={cn('tree-chev', open && 'open', !hasChildren && 'leaf')}
                  onClick={(e) => { if (hasChildren) { e.stopPropagation(); toggle(n.key); } }}>
              {hasChildren && <ChevronRightRegular size={12} />}
            </span>
            <span className="tree-title">{n.title}</span>
          </div>
          {hasChildren && open && <ul role="group">{renderNodes(n.children!, level + 1)}</ul>}
        </li>
      );
    });

  return (
    <ul ref={rootRef} className={cn('tree', className)} role="tree" onKeyDown={onKeyDown}>
      {renderNodes(treeData, 0)}
    </ul>
  );
}
