/* Steps — antd API 规范(items/current),WinUI 形态:
 * 完成=accent 实心勾,进行中=accent 圆环数字,等待=灰数字;连接线随状态着色 */
import type { ReactNode } from 'react';
import { cn } from '../cn';
import {
  CheckmarkRegular,
} from '@fluent-react/icon';

export interface StepItem { title: ReactNode; description?: ReactNode }

export interface StepsProps {
  current?: number;
  items: StepItem[];
  className?: string;
  style?: React.CSSProperties;
}

export function Steps({ current = 0, items, className, style }: StepsProps) {
  return (
    <ol className={cn('steps', className)} style={style}>
      {items.map((it, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'wait';
        return (
          <li key={i} className={cn('step', state)} aria-current={state === 'active' ? 'step' : undefined}>
            <span className="step-dot">
              {state === 'done' ? <CheckmarkRegular size={12} /> : i + 1}
            </span>
            <span className="step-body">
              <span className="step-title">{it.title}</span>
              {it.description && <span className="step-desc">{it.description}</span>}
            </span>
            {i < items.length - 1 && <span className="step-line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
