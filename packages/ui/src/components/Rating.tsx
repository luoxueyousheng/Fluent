/* Rating — WinUI RatingControl:整星打分,hover 预览,方向键调整 */
import { useState } from 'react';
import { cn } from '../cn';
import { useMergedState } from '../useMergedState';

const STAR = 'M8 1.8 L9.9 5.8 L14.3 6.4 L11.1 9.4 L11.9 13.8 L8 11.7 L4.1 13.8 L4.9 9.4 L1.7 6.4 L6.1 5.8 Z';

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export function Rating({
  value: valueProp, defaultValue = 0, onChange, max = 5, readOnly, size = 18, className, ...aria
}: RatingProps) {
  const [value, setValue] = useMergedState(defaultValue, valueProp, onChange);
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className={cn('rating', readOnly && 'readonly', className)}
         role="slider" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}
         aria-label={aria['aria-label'] ?? '评分'}
         tabIndex={readOnly ? -1 : 0}
         onMouseLeave={() => setHover(0)}
         onKeyDown={(e) => {
           if (readOnly) return;
           if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setValue(Math.min(max, value + 1)); }
           else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setValue(Math.max(0, value - 1)); }
         }}>
      {Array.from({ length: max }, (_, i) => (
        <button key={i} type="button" tabIndex={-1} disabled={readOnly}
                className={i < shown ? 'on' : undefined}
                aria-label={`${i + 1} 星`}
                onMouseEnter={() => !readOnly && setHover(i + 1)}
                onClick={() => !readOnly && setValue(i + 1)}>
          <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true"
               fill={i < shown ? 'currentColor' : 'none'}
               stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round">
            <path d={STAR} />
          </svg>
        </button>
      ))}
    </div>
  );
}
