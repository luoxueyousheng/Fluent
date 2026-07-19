/* 展示类小件:Tag(可关闭标签)/ Avatar(头像)/ Divider(分割线) */
import type { ReactNode } from 'react';
import { cn } from '../cn';
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

export function Avatar({ src, name = '', size = 'middle', className }: AvatarProps) {
  const px = typeof size === 'number' ? size : AVATAR_SIZE[size];
  return (
    <span className={cn('avatar', className)}
          style={{
            width: px, height: px, fontSize: px * 0.4,
            ...(src ? {} : name ? { background: `hsl(${hueOf(name)} 42% 42%)`, color: '#fff' } : {}),
          }}
          role="img" aria-label={name || '头像'}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}

export function Divider({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn('divider', className)} role="separator">{children}</div>;
}
