/* 展示类小件:Tag(可关闭标签)/ Avatar(头像)/ Divider(分割线) */
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';
import { radiusClass, type Radius } from '../modifiers';
import {
  DismissRegular,
} from '@fluent-jade/icon';
import type { ControlSize } from './Button';

export interface TagProps {
  color?: 'default' | 'accent' | 'success' | 'caution' | 'critical';
  closable?: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export function Tag({ color = 'default', closable, onClose, children, className }: TagProps) {
  return (
    <span className={cn('tag', color !== 'default' && color, className)}>
      {children}
      {closable && (
        <button type="button" className="tag-close" aria-label="移除" onClick={onClose}>
          <DismissRegular size={10} />
        </button>
      )}
    </span>
  );
}

const AVATAR_SIZE = { small: 24, middle: 32, large: 40 } as const;

export interface AvatarProps {
  src?: string;
  /** 无图时取首字母/首字生成占位 */
  name?: string;
  size?: ControlSize | number;
  /** 圆角:缺省为圆形(50%),传 radius 变为方形圆角 */
  radius?: Radius;
  className?: string;
}

function initials(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  if (/^[\x00-\x7F]/.test(t)) {
    return t.split(/\s+/).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
  }
  return t[0]!;   // CJK 取首字
}

/** 名字 → 稳定色相(PersonPicture 风格的彩底占位) */
function hueOf(name: string): number {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

export function Avatar({ src, name = '', size = 'middle', radius, className }: AvatarProps) {
  const px = typeof size === 'number' ? size : AVATAR_SIZE[size];
  return (
    <span className={cn('avatar', radiusClass(radius), className)}
          style={{
            width: px, height: px, fontSize: px * 0.4,
            ...(src ? {} : name ? { background: `hsl(${hueOf(name)} 42% 42%)`, color: '#fff' } : {}),
          }}
          role="img" aria-label={name || '头像'}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}

/* ---- AvatarGroup — 重叠头像组(源自 MagicUI) ---- */

export interface AvatarGroupItem {
  /** 头像图片 URL */
  imageUrl?: string;
  /** 无图时显示首字;也用作 alt */
  name: string;
  /** 点击跳转链接 */
  profileUrl?: string;
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 头像数据数组 */
  avatarUrls: AvatarGroupItem[];
  /** 额外人数(显示 +N 溢出标记),缺省不显示 */
  numPeople?: number;
  /** 最多显示 N 个头像,超出自动折叠为 +N(优先级低于 numPeople) */
  maxLen?: number;
  /** 头像尺寸,默认 middle(32px) */
  size?: ControlSize | number;
  /** 圆角:缺省为圆形;传 radius 变为方形圆角 */
  radius?: Radius;
  /** 间距(正数=分开,负数=重叠),默认 -16px */
  gap?: number | string;
}

const AVATAR_PX: Record<ControlSize, number> = { small: 24, middle: 32, large: 40 };

export function AvatarGroup({
  avatarUrls,
  numPeople,
  maxLen,
  size = 'middle',
  radius,
  gap: gapProp,
  className,
  style,
  ...props
}: AvatarGroupProps) {
  const px = typeof size === 'number' ? size : AVATAR_PX[size];
  const offset = gapProp ?? `calc(var(--sp-l) * -1)`;

  // 自动折叠:maxLen 截断,剩余计入溢出
  const shown = maxLen != null ? avatarUrls.slice(0, maxLen) : avatarUrls;
  const overflow = maxLen != null ? Math.max(0, avatarUrls.length - maxLen) : 0;
  const totalExtra = numPeople ?? overflow;

  return (
    <div
      className={cn('avatar-group', radiusClass(radius), className)}
      style={{ '--ag-offset': typeof offset === 'number' ? `${offset}px` : offset, ...style } as React.CSSProperties}
      {...props}
    >
      {shown.map((item, i) => {
        const inner = (
          <Avatar key={i} src={item.imageUrl} name={item.name} size={size} radius={radius} className="avatar-group-item" />
        );
        return item.profileUrl
          ? <a key={i} href={item.profileUrl} target="_blank" rel="noopener noreferrer">{inner}</a>
          : inner;
      })}
      {totalExtra > 0 && (
        <span className="avatar-group-more"
              style={{ width: px, height: px, minWidth: px, fontSize: Math.max(10, px * 0.35) }}>
          +{totalExtra}
        </span>
      )}
    </div>
  );
}

export function Divider({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn('divider', className)} role="separator">{children}</div>;
}
