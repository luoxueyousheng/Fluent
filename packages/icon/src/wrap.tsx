/* 图标包装:官方组件 + 本库 size / color API */
import type { ComponentType, CSSProperties } from 'react';
import type { FluentIconsProps } from '@fluentui/react-icons/headless';

export type IconProps = Omit<FluentIconsProps, 'fontSize' | 'primaryFill' | 'color'> & {
  /** 渲染尺寸(px 或任意 CSS 长度),默认 16 */
  size?: number | string;
  /** 填充色,默认 currentColor */
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
    const dimStyle: CSSProperties = { width: size, height: size, color, ...style };
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
