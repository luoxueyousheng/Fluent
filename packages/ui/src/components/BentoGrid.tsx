/* BentoGrid + BentoCard — 杂志风格栅格卡片。
 * 源自 MagicUI,结构与动效对齐官方实现;图标/令牌走 Fluent。
 *
 * BentoGrid: 三列 auto-rows-[22rem] gap-4
 * BentoCard: 背景 + 内容区(悬停上移) + CTA(悬停滑入) + 遮罩
 */
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { ChevronRightRegular } from '@fluent-jade/icon';
import type { FluentIcon } from '@fluent-jade/icon';
import { cn } from '../cn';

export interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

export interface BentoCardProps extends ComponentPropsWithoutRef<'div'> {
  name: string;
  className: string;
  /** 卡片背景内容(插画 / Marquee / Calendar 等) */
  background: ReactNode;
  /** Fluent 图标组件引用(非实例) */
  Icon: FluentIcon;
  description: string;
  href: string;
  cta: string;
}

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div className={cn('bento-grid', className)} {...props}>
      {children}
    </div>
  );
}

export function BentoCard({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) {
  return (
    <div className={cn('bento-card', className)} {...props}>
      <div className="bento-bg">{background}</div>

      <div className="bento-content">
        <Icon size={48} className="bento-icon" />
        <h3 className="bento-title">{name}</h3>
        <p className="bento-desc">{description}</p>
      </div>

      <div className="bento-cta">
        <a href={href} className="bento-cta-link">
          {cta}
          <ChevronRightRegular size={16} />
        </a>
      </div>

      <div className="bento-overlay" />
    </div>
  );
}
