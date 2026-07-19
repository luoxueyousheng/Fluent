/* CSS 驱动的简单件:Checkbox / Radio / Switch / Progress / Ring / InfoBar /
 * Card / Expander / Badge / Skeleton / Empty。薄封装,类契约与 fluent-kit 一致。 */
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';
import { Icon } from './Icon';

type InputBase = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'>;

export interface CheckboxProps extends InputBase {
  children?: ReactNode;
  /** 半选态(视觉为横杠;不影响 checked 值,antd 惯例) */
  indeterminate?: boolean;
  /** 卡片形态:整卡可点,选中 accent 描边 + 浅充;children 为标题 */
  card?: boolean;
  /** 卡片形态的描述行(标题下方,弱化字色) */
  description?: ReactNode;
}

export function Checkbox({ children, className, indeterminate, card, description, ...rest }: CheckboxProps) {
  return (
    <label className={cn('check', card && 'check-card', className)}>
      <input type="checkbox"
             ref={(el) => { if (el) el.indeterminate = !!indeterminate; }}
             {...rest} />
      <span className="box"><Icon name={indeterminate ? 'minus' : 'check'} size={14} strokeWidth={2} /></span>
      {card ? (
        <span className="cc-body">
          <span className="cc-title">{children}</span>
          {description != null && <span className="cc-desc">{description}</span>}
        </span>
      ) : children}
    </label>
  );
}

export interface RadioProps extends InputBase {
  children?: ReactNode;
  /** 卡片形态:整卡可点,选中 accent 描边 + 浅充;children 为标题 */
  card?: boolean;
  /** 卡片形态的描述行 */
  description?: ReactNode;
}

export function Radio({ children, className, card, description, ...rest }: RadioProps) {
  return (
    <label className={cn('check radio', card && 'check-card', className)}>
      <input type="radio" {...rest} />
      <span className="box" />
      {card ? (
        <span className="cc-body">
          <span className="cc-title">{children}</span>
          {description != null && <span className="cc-desc">{description}</span>}
        </span>
      ) : children}
    </label>
  );
}

export interface SwitchProps extends InputBase {
  children?: ReactNode;
  /** 卡片形态:标题/描述在左、轨道钉右,选中 accent 描边 + 浅充 */
  card?: boolean;
  /** 卡片形态的描述行 */
  description?: ReactNode;
}

export function Switch({ children, className, card, description, ...rest }: SwitchProps) {
  return (
    <label className={cn('switch', card && 'check-card switch-card', className)}>
      <input type="checkbox" {...rest} />
      {/* track 必须紧跟 input(input:checked + .track 相邻选择器);卡片布局用 flex order 调 */}
      <span className="track" />
      {card ? (
        <span className="cc-body">
          <span className="cc-title">{children}</span>
          {description != null && <span className="cc-desc">{description}</span>}
        </span>
      ) : children}
    </label>
  );
}

/** @deprecated 已改名 Switch(antd 惯例;且易与 ToggleButton 混淆),别名保留兼容旧代码 */
export const Toggle = Switch;

export interface ProgressBarProps {
  value?: number;
  indeterminate?: boolean;
  /** 右侧显示进度文字(antd showInfo 惯例) */
  showInfo?: boolean;
  format?: (value: number) => string;
  className?: string;
}

export function ProgressBar({ value, indeterminate, showInfo, format, className }: ProgressBarProps) {
  const v = Math.min(100, Math.max(0, value ?? 0));
  const bar = (
    <div className={cn('progress', indeterminate && 'indeterminate', !showInfo && className)}
         role="progressbar" aria-valuenow={indeterminate ? undefined : v} aria-valuemin={0} aria-valuemax={100}>
      <i style={indeterminate ? undefined : { width: `${v}%` }} />
    </div>
  );
  if (!showInfo) return bar;
  return (
    <div className={cn('progress-line', className)}>
      {bar}
      <span className="progress-info">{indeterminate ? '' : format ? format(v) : `${Math.round(v)}%`}</span>
    </div>
  );
}

export interface ProgressRingProps {
  /** 进度 0~100;缺省为不定态旋转圆环 */
  value?: number;
  /** 像素直径:不定态默认 24,确定态默认 64 */
  size?: number;
  /** 环心显示进度文字(仅确定态) */
  showInfo?: boolean;
  format?: (value: number) => string;
  className?: string;
}

const RING_R = 45;                                   // viewBox 100 的半径
const RING_C = 2 * Math.PI * RING_R;

export function ProgressRing({ value, size, showInfo, format, className }: ProgressRingProps) {
  // 类名 progress-ring/progress-circle:避开 Tailwind 的 ring 工具类(撞名会叠 box-shadow)
  if (value == null) {
    return (
      <svg className={cn('progress-ring', className)} viewBox="0 0 24 24" role="progressbar" aria-label="加载中"
           style={size != null ? { width: size, height: size } : undefined}>
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }
  const v = Math.min(100, Math.max(0, value));
  const px = size ?? 64;
  return (
    <span className={cn('progress-circle', className)} style={{ width: px, height: px }}
          role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <svg viewBox="0 0 100 100">
        <circle className="pc-track" cx="50" cy="50" r={RING_R} />
        <circle className="pc-fill" cx="50" cy="50" r={RING_R}
                strokeDasharray={RING_C} strokeDashoffset={RING_C * (1 - v / 100)} />
      </svg>
      {showInfo && (
        <span className="pc-text" style={{ fontSize: Math.max(11, px * 0.22) }}>
          {format ? format(v) : `${Math.round(v)}%`}
        </span>
      )}
    </span>
  );
}

const INFOBAR_ICON = { info: 'info', success: 'success', warning: 'warning', error: 'error' } as const;

export function InfoBar({ level = 'info', title, children, className }: {
  level?: keyof typeof INFOBAR_ICON; title?: string; children?: ReactNode; className?: string;
}) {
  return (
    <div className={cn('infobar', level, className)} role={level === 'error' ? 'alert' : 'status'}>
      <Icon name={INFOBAR_ICON[level]} />
      <div className="body">
        {title && <b>{title}</b>}
        <span className="msg">{children}</span>
      </div>
    </div>
  );
}

export function Card({ layer, className, ...rest }: HTMLAttributes<HTMLDivElement> & { layer?: boolean }) {
  return <div className={cn('card', layer && 'layer', className)} {...rest} />;
}

export function Expander({ summary, children, defaultOpen, className }: {
  summary: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string;
}) {
  return (
    <details className={cn('expander', className)} open={defaultOpen}>
      <summary>
        {summary}
        <Icon name="chevronRight" className="chev" />
      </summary>
      <div className="body">{children}</div>
    </details>
  );
}

export function Badge({ dot, className, style, children }: { dot?: boolean; className?: string; style?: React.CSSProperties; children?: ReactNode }) {
  return <span className={cn('badge', dot && 'dot', className)} style={style}>{children}</span>;
}

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('skeleton', className)} style={style} aria-hidden="true" />;
}

/* 默认空态插画:Fluent 线稿风(等距空箱 + 点缀),currentColor 随主题 */
function EmptyImage({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor"
         strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 20 L24 13 L40 20 L24 27 Z" />
      <path d="M8 20 V33 L24 40 L40 33 V20" />
      <path d="M24 27 V40" />
      <path d="M14 8.5 L15.5 10 M33 6 L34.5 7.5 M40.5 12 L42 13.5" opacity=".55" />
    </svg>
  );
}

export interface EmptyProps {
  /** 'simple' = 紧凑变体(列表/表格内嵌);ReactNode = 自定义插画;缺省 = 默认插画 */
  image?: ReactNode | 'simple';
  /** 描述文案(antd 惯例),默认「暂无数据」 */
  description?: ReactNode;
  /** 操作区(如「新建」按钮) */
  children?: ReactNode;
  className?: string;
}

export function Empty({ image, description = '暂无数据', children, className }: EmptyProps) {
  const simple = image === 'simple';
  return (
    <div className={cn('empty', simple && 'simple', className)}>
      <div className="empty-img">
        {image == null || simple ? <EmptyImage size={simple ? 36 : 56} /> : image}
      </div>
      <div className="empty-desc">{description}</div>
      {children && <div className="empty-act">{children}</div>}
    </div>
  );
}
