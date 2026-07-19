/* Marquee — 无限滚动走马灯(纯 CSS 动画,零 JS 运行时)。
 * 水平/垂直两向,支持反向、悬停暂停、内容重复、自定义时长/间距。
 * 源自 MagicUI (https://magicui.design),适配 Fluent UI × JadeView 风格。 */
import { type HTMLAttributes } from 'react';
import { cn } from '../cn';

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  /** 反向滚动(默认 false) */
  reverse?: boolean;
  /** 悬停暂停动画(默认 false) */
  pauseOnHover?: boolean;
  /** 垂直滚动(默认 false 水平) */
  vertical?: boolean;
  /** 内容重复次数(默认 4,无缝滚动至少 2) */
  repeat?: number;
  /** 单次动画时长,默认 40s */
  duration?: number | string;
  /** 子项间距,默认 1rem */
  gap?: number | string;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  duration = 40,
  gap: gapProp,
  style,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'marquee',
        vertical && 'marquee-vertical',
        pauseOnHover && 'marquee-pause',
        className,
      )}
      style={{
        '--duration': typeof duration === 'number' ? `${duration}s` : duration,
        ...(gapProp != null ? { '--gap': typeof gapProp === 'number' ? `${gapProp}px` : gapProp } : {}),
        ...style,
      } as React.CSSProperties}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn('marquee-track', reverse && 'marquee-reverse')}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
