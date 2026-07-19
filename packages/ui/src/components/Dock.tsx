/* Dock — MacOS Dock 风格停靠栏。
 * 对齐 MagicUI:motion 弹簧 + 鼠标 X 距离放大。
 * label 仅显示「当前热点」最近图标,快进快出。
 * onClick 可挂在 Dock 上统一处理(子项用 value 标识)。
 */
import {
  Children, cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useRef, useState,
  type HTMLAttributes, type MouseEvent, type ReactElement, type ReactNode,
} from 'react';
import {
  motion, useMotionValue, useSpring, useTransform,
  type MotionValue,
} from 'motion/react';
import { cn } from '../cn';

const DEFAULT_SIZE = 40;
/* 原版文档默认 60,体感偏猛;收一点更接近 demo 观感 */
const DEFAULT_MAGNIFICATION = 52;
const DEFAULT_DISTANCE = 140;

export interface DockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  children?: ReactNode;
  /** 图标默认尺寸(px),默认 40 */
  iconSize?: number;
  /** 鼠标靠近时最大放大尺寸(px),默认 52 */
  iconMagnification?: number;
  /** 影响半径(px),默认 140 */
  iconDistance?: number;
  /** 图标垂直对齐: top / middle / bottom,默认 middle */
  direction?: 'top' | 'middle' | 'bottom';
  /** 关闭放大效果 */
  disableMagnification?: boolean;
  /**
   * 统一点击回调。value 取自 DockIcon.value,缺省回退 label。
   * 子项自身 onClick 仍会先触发。
   */
  onClick?: (value: string | undefined, e: MouseEvent<HTMLElement>) => void;
}

export interface DockIconProps {
  children?: ReactNode;
  className?: string;
  /** 业务标识,供 Dock.onClick 使用 */
  value?: string;
  /** 悬停标签(仅当前热点图标显示) */
  label?: string;
  /** 点击跳转 */
  href?: string;
  /** 新标签页打开(需 href) */
  external?: boolean;
  /** 单项点击;与 Dock.onClick 并存时先触发本回调 */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** 内部:由 Dock 注入 */
  mouseX?: MotionValue<number>;
  size?: number;
  magnification?: number;
  distance?: number;
  disableMagnification?: boolean;
  /** 内部:由 Dock 注入 */
  onDockClick?: (value: string | undefined, e: MouseEvent<HTMLElement>) => void;
}

interface DockCtx {
  mouseX: MotionValue<number>;
  size: number;
  magnification: number;
  distance: number;
  disableMagnification: boolean;
  onDockClick?: (value: string | undefined, e: MouseEvent<HTMLElement>) => void;
}

const DockContext = createContext<DockCtx | null>(null);

export function Dock({
  children,
  className,
  iconSize = DEFAULT_SIZE,
  iconMagnification = DEFAULT_MAGNIFICATION,
  iconDistance = DEFAULT_DISTANCE,
  direction = 'middle',
  disableMagnification = false,
  onClick,
  ...props
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  const rendered = Children.map(children, (child) => {
    if (isValidElement(child) && (child.type as { displayName?: string }).displayName === 'DockIcon') {
      return cloneElement(child as ReactElement<DockIconProps>, {
        mouseX,
        size: iconSize,
        magnification: iconMagnification,
        distance: iconDistance,
        disableMagnification,
        onDockClick: onClick,
      });
    }
    return child;
  });

  return (
    <DockContext.Provider value={{
      mouseX,
      size: iconSize,
      magnification: iconMagnification,
      distance: iconDistance,
      disableMagnification,
      onDockClick: onClick,
    }}>
      <div
        onMouseMove={disableMagnification ? undefined : (e) => mouseX.set(e.pageX)}
        onMouseLeave={disableMagnification ? undefined : () => mouseX.set(Infinity)}
        className={cn(
          'dock',
          direction === 'top' && 'dock-top',
          direction === 'middle' && 'dock-middle',
          direction === 'bottom' && 'dock-bottom',
          className,
        )}
        {...props}
      >
        {rendered}
      </div>
    </DockContext.Provider>
  );
}
Dock.displayName = 'Dock';

export function DockIcon({
  children,
  value,
  label,
  href,
  external,
  onClick,
  className,
  mouseX: mouseXProp,
  size: sizeProp,
  magnification: magProp,
  distance: distProp,
  disableMagnification: disableProp,
  onDockClick: onDockClickProp,
}: DockIconProps) {
  const ctx = useContext(DockContext);
  const mouseX = mouseXProp ?? ctx?.mouseX;
  const size = sizeProp ?? ctx?.size ?? DEFAULT_SIZE;
  const magnification = magProp ?? ctx?.magnification ?? DEFAULT_MAGNIFICATION;
  const distance = distProp ?? ctx?.distance ?? DEFAULT_DISTANCE;
  const disableMagnification = disableProp ?? ctx?.disableMagnification ?? false;
  const onDockClick = onDockClickProp ?? ctx?.onDockClick;

  const ref = useRef<HTMLDivElement>(null);
  const padding = Math.max(4, size * 0.15);
  const fallbackX = useMotionValue(Infinity);
  const mx = mouseX ?? fallbackX;

  const distanceCalc = useTransform(mx, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [size, magnification, size],
  );

  const scaleSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [tipOn, setTipOn] = useState(false);
  useEffect(() => {
    if (!label) return;
    if (disableMagnification) return;
    const unsub = distanceCalc.on('change', (v) => {
      setTipOn(Math.abs(v) <= size * 0.55);
    });
    return unsub;
  }, [distanceCalc, size, label, disableMagnification]);

  useEffect(() => {
    if (!label || disableMagnification || !mouseX) return;
    const unsub = mouseX.on('change', (v) => {
      if (!Number.isFinite(v)) setTipOn(false);
    });
    return unsub;
  }, [mouseX, label, disableMagnification]);

  const handleClick = useCallback((e: MouseEvent<HTMLElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      onDockClick?.(value ?? label, e);
    }
  }, [onClick, onDockClick, value, label]);

  const content = href ? (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="dock-icon-inner"
      aria-label={label}
      onClick={handleClick}
    >
      {children}
    </a>
  ) : (
    <button
      type="button"
      className="dock-icon-inner"
      aria-label={label}
      onClick={handleClick}
    >
      {children}
    </button>
  );

  return (
    <motion.div
      ref={ref}
      style={disableMagnification
        ? { width: size, height: size, padding }
        : { width: scaleSize, height: scaleSize, padding }}
      className={cn(
        'dock-icon',
        disableMagnification && 'dock-icon-static',
        tipOn && 'dock-icon-tip-on',
        className,
      )}
    >
      {content}
      {label && <span className="dock-icon-tip" role="tooltip">{label}</span>}
    </motion.div>
  );
}
DockIcon.displayName = 'DockIcon';
