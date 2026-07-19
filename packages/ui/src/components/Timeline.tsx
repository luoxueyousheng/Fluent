/* Timeline — 时间轴(antd items API):节点圆点 + 连线纵向排列,
 * 语义色圆点 / 自定义 dot;label 放时间戳;pending 在尾部挂「进行中」项
 *(ProgressRing 圆点)。适合操作历史、部署记录、日志流。 */
import type { ReactNode } from 'react';
import { cn } from '../cn';
import { ProgressRing } from './Basics';

export interface TimelineItemDef {
  key?: string;
  /** 时间戳/小标签(内容上方,弱化字色) */
  label?: ReactNode;
  content: ReactNode;
  color?: 'default' | 'accent' | 'success' | 'caution' | 'critical';
  /** 自定义圆点(如 <HomeRegular />) */
  dot?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItemDef[];
  /** 尾部「进行中」项:传文案节点;true 仅显示旋转点 */
  pending?: ReactNode | boolean;
  className?: string;
}

export function Timeline({ items, pending, className }: TimelineProps) {
  return (
    <ol className={cn('timeline', className)}>
      {items.map((it, i) => (
        <li key={it.key ?? i} className={cn('tl-item', it.color && it.color !== 'default' && `tl-${it.color}`)}>
          <span className="tl-dot">{it.dot}</span>
          <div className="tl-body">
            {it.label != null && <div className="tl-label">{it.label}</div>}
            <div className="tl-content">{it.content}</div>
          </div>
        </li>
      ))}
      {pending != null && pending !== false && (
        <li className="tl-item tl-pending">
          <span className="tl-dot"><ProgressRing size={12} /></span>
          <div className="tl-body">
            <div className="tl-content">{pending === true ? null : pending}</div>
          </div>
        </li>
      )}
    </ol>
  );
}
