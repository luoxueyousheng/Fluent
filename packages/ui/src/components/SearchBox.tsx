/* SearchBox(新增件)— 放大镜 + 清除键;可配 AutoSuggest 的候选(suggestions) */
import { cn } from '../cn';
import { Icon } from './Icon';
import { AutoSuggest } from './AutoSuggest';
import { useMergedState } from '../useMergedState';
import { sizeClass, type ControlSize } from './Button';

export interface SearchBoxProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  suggestions?: string[];
  size?: ControlSize;
  placeholder?: string;
  className?: string;
}

export function SearchBox({
  value: valueProp, defaultValue = '', onChange, onSubmit, suggestions, size, placeholder = '搜索', className,
}: SearchBoxProps) {
  const [value, setValue] = useMergedState(defaultValue, valueProp, onChange);
  return (
    <div className={cn('searchbox', className)}>
      <Icon name="search" size={14} className="sb-icon" />
      {suggestions ? (
        <AutoSuggest options={suggestions} value={value} onChange={setValue}
                     size={size} placeholder={placeholder} aria-label={placeholder} />
      ) : (
        <input className={cn('input', sizeClass(size))} value={value} placeholder={placeholder} aria-label={placeholder}
               onChange={(e) => setValue(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter') onSubmit?.(value); }} />
      )}
      {value && (
        <button className="sb-clear" aria-label="清除" onClick={() => setValue('')}>
          <Icon name="close" size={11} strokeWidth={1.3} />
        </button>
      )}
    </div>
  );
}
