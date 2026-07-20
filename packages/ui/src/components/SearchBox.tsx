/* SearchBox(新增件)— 放大镜 + 清除键;可配 AutoSuggest 的候选(suggestions) */
import { cn } from '../cn';
import {
  DismissRegular,
  SearchRegular,
} from '@fluent-jade/icon';
import { AutoSuggest } from './AutoSuggest';
import { useMergedState } from '../useMergedState';
import { sizeClass, type ControlSize } from './Button';
import { colorClass, radiusClass, type Radius, type SemanticColor } from '../modifiers';

export interface SearchBoxProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  suggestions?: string[];
  size?: ControlSize;
  /** 语义着色:聚焦下划线随之变色 */
  color?: SemanticColor;
  /** 圆角:none / sm / md(默认) / lg */
  radius?: Radius;
  placeholder?: string;
  className?: string;
}

export function SearchBox({
  value: valueProp, defaultValue = '', onChange, onSubmit, suggestions, size,
  color, radius, placeholder = '搜索', className,
}: SearchBoxProps) {
  const [value, setValue] = useMergedState(defaultValue, valueProp, onChange);
  // 有 suggestions 时 Enter 冒泡到此外层提交;AutoSuggest 选中候选的 Enter 已
  // preventDefault,不会误触(保持 AutoSuggest 单独使用行为不变)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.defaultPrevented) onSubmit?.(value);
  };
  return (
    <div className={cn('searchbox', colorClass(color), radiusClass(radius), className)}
         onKeyDown={onKeyDown}>
      <SearchRegular size={14} className="sb-icon" />
      {suggestions ? (
        <AutoSuggest options={suggestions} value={value} onChange={setValue}
                     size={size} color={color} radius={radius}
                     placeholder={placeholder} aria-label={placeholder} />
      ) : (
        <input className={cn('input', sizeClass(size))} value={value} placeholder={placeholder} aria-label={placeholder}
               onChange={(e) => setValue(e.target.value)} />
      )}
      {value && (
        <button type="button" className="sb-clear" aria-label="清除" onClick={() => setValue('')}>
          <DismissRegular size={11} />
        </button>
      )}
    </div>
  );
}
