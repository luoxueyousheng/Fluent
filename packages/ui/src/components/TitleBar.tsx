/* TitleBar — 火山 Demo 风格标题栏(Windows title-overlay):
 * 右侧 146px 留给库内置控制按钮;拖动区 = jade-region-drag(库运行时注入);
 * jade-region-no-drag 给内部交互元素挖洞。 */
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { cn } from '../cn';
import { Icon } from './Icon';

export interface TitleBarProps {
  appName: string;
  sub?: ReactNode;
  logo?: ReactNode;
  /** 放在标题栏里的交互元素(自动 no-drag) */
  children?: ReactNode;
  className?: string;
}

export function TitleBar({ appName, sub, logo, children, className }: TitleBarProps) {
  return (
    <header className={cn('title-bar', className)} {...{ 'jade-region-drag': '' }}>
      {logo ?? <Icon name="logo" className="logo" strokeWidth={1.3} />}
      <span className="app-name">{appName}</span>
      {sub && <span className="app-sub">{sub}</span>}
      {children && <div className="tb-actions" {...{ 'jade-region-no-drag': '' }}>{children}</div>}
    </header>
  );
}

/** Reveal 高光(pointermove 写 --mx/--my,CSS 画径向光)。
 * 唯一元素子节点时直接 clone 合并类名与事件——不产生包装层:
 * 光斑必须画在带背景/圆角的元素自身上,包装层会被子元素的不透明背景
 * 挡住、只从圆角外漏光(踩过)。多子节点时才退回包装 div。 */
export function Reveal({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  const track = (el: HTMLElement, e: React.PointerEvent) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  if (isValidElement(children) && Children.count(children) === 1) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childProps = child.props as { className?: string; onPointerMove?: (e: React.PointerEvent) => void };
    return cloneElement(child, {
      className: cn('reveal', childProps.className, className),
      onPointerMove: (e: React.PointerEvent) => {
        childProps.onPointerMove?.(e);
        track(e.currentTarget as HTMLElement, e);
      },
      ...rest,
    });
  }
  return (
    <div className={cn('reveal', className)}
         onPointerMove={(e) => track(e.currentTarget, e)} {...rest}>
      {children}
    </div>
  );
}
