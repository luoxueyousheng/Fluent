/* Result — 结果页(antd API):操作成功/失败/警告等结果反馈。
 * icon + title + subTitle + extra(操作按钮区);5 种预设 status。 */
import { type ReactNode } from 'react';
import { cn } from '../cn';
import {
  CheckmarkCircleRegular,
  ErrorCircleRegular,
  InfoRegular,
  ListRegular,
  WarningRegular,
  type FluentIcon,
} from '@fluent-jade/icon';

export interface ResultProps {
  /** 结果状态 */
  status?: 'success' | 'error' | 'warning' | 'info' | 'empty';
  /** 标题 */
  title: ReactNode;
  /** 副标题 */
  subTitle?: ReactNode;
  /** 自定义图标(覆盖 status 默认图标) */
  icon?: ReactNode;
  /** 操作区 */
  extra?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const STATUS_ICON: Record<string, { Cmp: FluentIcon; cls: string }> = {
  success: { Cmp: CheckmarkCircleRegular, cls: 'result-success' },
  error: { Cmp: ErrorCircleRegular, cls: 'result-error' },
  warning: { Cmp: WarningRegular, cls: 'result-warning' },
  info: { Cmp: InfoRegular, cls: 'result-info' },
  empty: { Cmp: ListRegular, cls: 'result-empty' },
};

export function Result({ status = 'info', title, subTitle, icon, extra, children, className }: ResultProps) {
  const s = STATUS_ICON[status] ?? STATUS_ICON.info;
  const StatusIcon = s.Cmp;
  return (
    <div className={cn('result', s.cls, className)} role="status">
      <div className="result-icon">
        {icon ?? <StatusIcon size={48} />}
      </div>
      <div className="result-title">{title}</div>
      {subTitle != null && <div className="result-sub">{subTitle}</div>}
      {extra != null && <div className="result-extra">{extra}</div>}
      {children != null && <div className="result-content">{children}</div>}
    </div>
  );
}
