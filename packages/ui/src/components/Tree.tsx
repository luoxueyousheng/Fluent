/* Tree — antd API 规范(treeData/expandedKeys/selectedKeys/onSelect/onExpand),
 * WinUI TreeView 形态:行 32px、chevron 旋转、选中行灰底 + 左侧 accent 药丸 */
import { useState, type ReactNode } from 'react';
import { cn } from '../cn';
import { Icon } from './Icon';

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

  const renderNodes = (nodes: TreeDataNode[], level: number): ReactNode =>
    nodes.map((n) => {
      const hasChildren = !!n.children?.length;
      const open = expanded.includes(n.key);
      return (
        <li key={n.key} role="treeitem" aria-expanded={hasChildren ? open : undefined}
            aria-selected={selected.includes(n.key)}>
          <div className={cn('tree-row', selected.includes(n.key) && 'selected', n.disabled && 'disabled')}
               style={{ paddingLeft: 8 + level * 24 }}
               onClick={() => select(n)}>
            <span className={cn('tree-chev', open && 'open', !hasChildren && 'leaf')}
                  onClick={(e) => { if (hasChildren) { e.stopPropagation(); toggle(n.key); } }}>
              {hasChildren && <Icon name="chevronRight" size={12} strokeWidth={1.3} />}
            </span>
            <span className="tree-title">{n.title}</span>
          </div>
          {hasChildren && open && <ul role="group">{renderNodes(n.children!, level + 1)}</ul>}
        </li>
      );
    });

  return (
    <ul className={cn('tree', className)} role="tree">
      {renderNodes(treeData, 0)}
    </ul>
  );
}
