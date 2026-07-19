/* Fluent 风格线性图标:16 网格 / 1.3~1.5 描边 / currentColor(禁用 Emoji)。
 * path 数据沿用 fluent-kit 的 sprite;按需在 PATHS 增补。 */
import type { SVGProps } from 'react';

const PATHS: Record<string, string> = {
  logo: 'M3 6 L8 2 L13 6 L8 14 Z M3 6 H13 M8 14 L5.5 6 M8 14 L10.5 6',
  menu: 'M2.5 4 H13.5 M2.5 8 H13.5 M2.5 12 H13.5',
  home: 'M2 8 L8 2 L14 8 M4 7 V13 H12 V7',
  settings: 'M8 1.5 V3 M8 13 V14.5 M1.5 8 H3 M13 8 H14.5 M3.4 3.4 L4.5 4.5 M11.5 11.5 L12.6 12.6 M12.6 3.4 L11.5 4.5 M4.5 11.5 L3.4 12.6 M10.5 8 A2.5 2.5 0 1 1 5.5 8 A2.5 2.5 0 1 1 10.5 8',
  close: 'M4 4 L12 12 M12 4 L4 12',
  min: 'M3.5 8 H12.5',
  max: 'M4 4 H12 V12 H4 Z',
  restore: 'M3.5 5.5 H10.5 V12.5 H3.5 Z M5.5 5.5 V5 A1.5 1.5 0 0 1 7 3.5 H11 A1.5 1.5 0 0 1 12.5 5 V9 A1.5 1.5 0 0 1 11 10.5 H10.5',
  check: 'M3.5 8.5 L6.5 11.5 L12.5 4.5',
  chevronDown: 'M4.5 6 L8 9.5 L11.5 6',
  chevronUp: 'M4.5 10 L8 6.5 L11.5 10',
  chevronRight: 'M6 4.5 L9.5 8 L6 11.5',
  search: 'M12.5 12.5 L10.2 10.2 M11 6.75 A4.25 4.25 0 1 1 2.5 6.75 A4.25 4.25 0 1 1 11 6.75',
  add: 'M8 3 V13 M3 8 H13',
  minus: 'M3 8 H13',
  info: 'M8 7.5 V11 M8 5.2 V5.4 M14.25 8 A6.25 6.25 0 1 1 1.75 8 A6.25 6.25 0 1 1 14.25 8',
  success: 'M5 8.2 L7.2 10.4 L11 6 M14.25 8 A6.25 6.25 0 1 1 1.75 8 A6.25 6.25 0 1 1 14.25 8',
  warning: 'M8 2.5 L14.5 13.5 H1.5 Z M8 7 V10 M8 11.8 V12',
  error: 'M5.6 5.6 L10.4 10.4 M10.4 5.6 L5.6 10.4 M14.25 8 A6.25 6.25 0 1 1 1.75 8 A6.25 6.25 0 1 1 14.25 8',
  more: 'M4 8 A0.2 0.2 0 1 1 3.6 8 A0.2 0.2 0 1 1 4 8 M8.2 8 A0.2 0.2 0 1 1 7.8 8 A0.2 0.2 0 1 1 8.2 8 M12.4 8 A0.2 0.2 0 1 1 12 8 A0.2 0.2 0 1 1 12.4 8',
  sort: 'M8 3.5 V12.5 M4.5 7 L8 3.5 L11.5 7',
  chip: 'M4.5 4.5 H11.5 V11.5 H4.5 Z M6.5 4.5 V2 M9.5 4.5 V2 M6.5 14 V11.5 M9.5 14 V11.5 M4.5 6.5 H2 M4.5 9.5 H2 M14 6.5 H11.5 M14 9.5 H11.5',
  brush: 'M10.5 8 A2.5 2.5 0 1 1 5.5 8 A2.5 2.5 0 1 1 10.5 8 M8 1.5 V3 M8 13 V14.5 M1.5 8 H3 M13 8 H14.5 M3.4 3.4 L4.5 4.5 M11.5 11.5 L12.6 12.6 M12.6 3.4 L11.5 4.5 M4.5 11.5 L3.4 12.6',
  keyboard: 'M2 4.5 H14 V11.5 H2 Z M4.2 7 H4.8 M6.7 7 H7.3 M9.2 7 H9.8 M11.7 7 H12.3 M4.5 9.5 H11.5',
  text: 'M3.5 3.5 H12.5 M8 3.5 V12.5 M6 12.5 H10',
  list: 'M6 4.5 H13.5 M6 8 H13.5 M6 11.5 H13.5 M2.8 4.5 H3.2 M2.8 8 H3.2 M2.8 11.5 H3.2',
  calendar: 'M2.5 4 H13.5 V13.5 H2.5 Z M2.5 6.8 H13.5 M5.5 2.5 V4.8 M10.5 2.5 V4.8',
  layers: 'M8 2 L14 5 L8 8 L2 5 Z M3 7.8 L8 10.3 L13 7.8 M3 10.6 L8 13.1 L13 10.6',
  compass: 'M14.25 8 A6.25 6.25 0 1 1 1.75 8 A6.25 6.25 0 1 1 14.25 8 M10.4 5.6 L9 9 L5.6 10.4 L7 7 Z',
  message: 'M2.5 3.5 H13.5 V11 H8 L5.2 13.3 V11 H2.5 Z',
  grid: 'M2.5 2.5 H7 V7 H2.5 Z M9 2.5 H13.5 V7 H9 Z M2.5 9 H7 V13.5 H2.5 Z M9 9 H13.5 V13.5 H9 Z',
  upload: 'M8 10.5 V3.5 M5 6.5 L8 3.5 L11 6.5 M2.5 10.5 V13 H13.5 V10.5',
  file: 'M4 1.5 H9.5 L12 4 V14.5 H4 Z M9.5 1.5 V4 H12',
  eye: 'M1.5 8 C3.5 4.7 12.5 4.7 14.5 8 C12.5 11.3 3.5 11.3 1.5 8 Z M10 8 A2 2 0 1 1 6 8 A2 2 0 1 1 10 8',
  zoomIn: 'M12.5 12.5 L10.2 10.2 M11 6.75 A4.25 4.25 0 1 1 2.5 6.75 A4.25 4.25 0 1 1 11 6.75 M6.75 5 V8.5 M5 6.75 H8.5',
  zoomOut: 'M12.5 12.5 L10.2 10.2 M11 6.75 A4.25 4.25 0 1 1 2.5 6.75 A4.25 4.25 0 1 1 11 6.75 M5 6.75 H8.5',
  rotate: 'M13.5 8 A5.5 5.5 0 1 1 8 2.5 M11 2 L13.8 2.6 L13 5.4',
  image: 'M2.5 3 H13.5 V13 H2.5 Z M2.5 10.5 L6 7.5 L9 10 L11 8.5 L13.5 10.5 M10.5 6 A0.4 0.4 0 1 1 10.4 6 Z',
  copy: 'M5.5 5.5 H12.5 V12.5 H5.5 Z M10.5 5.5 V3.5 H3.5 V10.5 H5.5',
  eyeOff: 'M1.5 8 C3.5 4.7 12.5 4.7 14.5 8 C13.8 9.15 12.5 10 11 10.5 M1.5 8 C2.2 9.15 3.5 10 5 10.5 M8 10.8 V12.5 M4.2 10 L3.2 11.6 M11.8 10 L12.8 11.6',
  code: 'M5.5 5 L2.5 8 L5.5 11 M10.5 5 L13.5 8 L10.5 11',
  back: 'M13 8 H3.2 M7 4 L3 8 L7 12',
};

export type IconName = keyof typeof PATHS | (string & {});

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 16, strokeWidth = 1.5, className, style, ...rest }: IconProps) {
  const d = PATHS[name as string];
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size} height={size} viewBox="0 0 16 16"
      /* 内联样式钉尺寸:CSS 的 .icon{width/height:16px} 优先级高于 SVG 属性,
         否则 size≠16 的图标全被强制回 16px */
      style={{ width: size, height: size, ...style }}
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...rest}
    >
      <path d={d} />
    </svg>
  );
}
