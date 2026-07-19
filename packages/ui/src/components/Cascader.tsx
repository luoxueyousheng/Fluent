/* Cascader — 级联选择(antd API):树形数据逐级展开选择。
 * options[{value,label,children?}] 多级嵌套;点击展开子级,最终叶节点提交。
 * 支持受控 value/onChange、placeholder、changeOnSelect(任意级可选)、
 * disabled/size/status;portal 浮层 z-850。 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { useMergedState } from '../useMergedState';
import { useFixedPlacement, useFlyout } from './Flyout';
import {
  ChevronDownRegular,
  ChevronRightRegular,
} from '@fluent-jade/icon';

export interface CascaderOption {
  value: string;
  label: ReactNode;
  children?: CascaderOption[];
  disabled?: boolean;
}

export interface CascaderProps {
  options: CascaderOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[], selectedOptions: CascaderOption[]) => void;
  placeholder?: string;
  /** 任意级可选(非仅叶节点) */
  changeOnSelect?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  status?: 'error' | 'warning';
  /** 展开全部父级 */
  expandTrigger?: 'click' | 'hover';
  className?: string;
}

function findOptionByValue(options: CascaderOption[], value: string): CascaderOption | undefined {
  for (const opt of options) {
    if (opt.value === value) return opt;
    if (opt.children) {
      const found = findOptionByValue(opt.children, value);
      if (found) return found;
    }
  }
  return undefined;
}

function getLabelsByPath(options: CascaderOption[], path: string[]): ReactNode[] {
  const labels: ReactNode[] = [];
  let opts = options;
  for (const v of path) {
    const opt = opts.find((o) => o.value === v);
    if (!opt) break;
    labels.push(opt.label);
    opts = opt.children ?? [];
  }
  return labels;
}

export function Cascader({
  options, value: valueProp, defaultValue, onChange, placeholder = '请选择', changeOnSelect,
  disabled, size, status, className,
}: CascaderProps) {
  const [value, setValue] = useMergedState<string[]>(defaultValue ?? [], valueProp);
  const [openLevel, setOpenLevel] = useState(0); // 当前展开层级(0=根)
  const [activePath, setActivePath] = useState<string[]>([]); // 当前悬停/点击路径
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const fly = useFlyout(rootRef, popRef);
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen);

  const displayLabels = value.length > 0 ? getLabelsByPath(options, value) : [];

  const selectOption = useCallback((opt: CascaderOption, level: number) => {
    const newPath = activePath.slice(0, level).concat(opt.value);
    setActivePath(newPath);

    if (!opt.children || opt.children.length === 0 || changeOnSelect) {
      const finalPath = opt.children && opt.children.length > 0 && !changeOnSelect ? newPath : newPath;
      setValue(finalPath);
      onChange?.(finalPath, finalPath.map((v, i) => {
        let opts = options;
        let found: CascaderOption | undefined;
        for (let j = i; j < finalPath.length; j++) {
          found = opts.find((o) => o.value === finalPath[j]);
          if (found) opts = found.children ?? [];
        }
        return found!;
      }));
      if (!opt.children || opt.children.length === 0) fly.close();
    }
  }, [activePath, changeOnSelect, options, setValue, onChange, fly]);

  const handleHover = useCallback((opt: CascaderOption, level: number) => {
    if (opt.disabled) return;
    const newPath = activePath.slice(0, level).concat(opt.value);
    setActivePath(newPath);
    setOpenLevel(opt.children && opt.children.length > 0 ? level + 1 : level);
  }, [activePath]);

  /* 重新从 value 恢复 activePath */
  useEffect(() => {
    if (fly.isOpen && value.length > 0) {
      setActivePath(value);
      setOpenLevel(value.length - 1);
    }
  }, [fly.isOpen, value]);

  const renderLevel = (opts: CascaderOption[], level: number) => (
    <div key={level} className="cascader-menu">
      {opts.map((opt) => {
        const isActive = activePath[level] === opt.value;
        const hasChildren = opt.children && opt.children.length > 0;
        return (
          <div
            key={opt.value}
            className={cn('cascader-item', isActive && 'cascader-item-active', opt.disabled && 'disabled')}
            onClick={() => !opt.disabled && selectOption(opt, level)}
            onMouseEnter={() => handleHover(opt, level)}
          >
            <span className="cascader-label">{opt.label}</span>
            {hasChildren && <ChevronRightRegular size={12} className="cascader-arrow" />}
          </div>
        );
      })}
    </div>
  );

  /* 逐级渲染展开的菜单 */
  const menus: ReactNode[] = [];
  let currentOpts = options;
  for (let i = 0; i <= openLevel; i++) {
    menus.push(renderLevel(currentOpts, i));
    const pv = activePath[i];
    const parent = currentOpts.find((o) => o.value === pv);
    currentOpts = parent?.children ?? [];
    if (currentOpts.length === 0) break;
  }

  return (
    <>
      <div
        ref={rootRef}
        className={cn('cascader', fly.isOpen && 'open', size === 'small' && 'cascader-sm', size === 'large' && 'cascader-lg', status && `status-${status}`, disabled && 'disabled', className)}
        onClick={() => !disabled && fly.toggle()}
      >
        <span className={cn('cascader-display', displayLabels.length === 0 && 'cascader-placeholder')}>
          {displayLabels.length > 0 ? displayLabels.join(' / ') : placeholder}
        </span>
        <ChevronDownRegular size={12} className="cascader-suffix" />
      </div>
      {fly.isOpen && createPortal(
        <div ref={popRef} className={cn('cascader-pop', placement.cls, fly.closing && 'closing')} style={placement.style}>
          <div className="cascader-menus">{menus}</div>
        </div>,
        document.body,
      )}
    </>
  );
}
