/* 图标包装:官方组件 + 本库 size / color API */
import type { ComponentType, CSSProperties } from 'react';
import type { FluentIconsProps } from '@fluentui/react-icons/headless';

export type IconProps = Omit<FluentIconsProps, 'fontSize' | 'primaryFill' | 'color'> & {
  /** 渲染尺寸(px 或任意 CSS 长度),默认 16 */
  size?: number | string;
  /** 填充色,默认 currentColor(跟随父级 CSS color,勿内联钉死以免盖掉主题规则) */
  color?: string;
};

export type FluentIcon = ComponentType<IconProps>;

/** 包装官方 headless 图标:统一 size / color / .icon 类 */
export function wrapIcon(Base: ComponentType<FluentIconsProps>, displayName?: string): FluentIcon {
  function Icon({
    size = 16,
    color = 'currentColor',
    className,
    style,
    ...rest
  }: IconProps) {
    // 尺寸始终内联钉死;color 仅在显式传入非 currentColor 时内联,
    // 否则交给 CSS(如 .check .box svg { color: var(--text-on-accent) })。
    const dimStyle: CSSProperties = { width: size, height: size, ...style };
    if (color !== 'currentColor') dimStyle.color = color;
    return (
      <Base
        className={className ? `icon ${className}` : 'icon'}
        fontSize={size}
        primaryFill={color}
        style={dimStyle}
        {...rest}
      />
    );
  }
  Icon.displayName = displayName ?? Base.displayName ?? Base.name ?? 'Icon';
  return Icon;
}
