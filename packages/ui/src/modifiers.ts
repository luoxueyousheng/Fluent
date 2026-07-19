/* 通用修饰 props:圆角与语义着色(实现层见 theme.css §53)
 * radius → .r-* 重映 --r-control/--r-card;color → .c-* 重映 accent 三连 */

export type Radius = 'none' | 'sm' | 'md' | 'lg';
export type SemanticColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export const radiusClass = (r?: Radius): string | undefined => (r ? `r-${r}` : undefined);
export const colorClass = (c?: SemanticColor): string | undefined =>
  (c && c !== 'default' ? `c-${c}` : undefined);
