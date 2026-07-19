/* Spin — 加载容器(antd API):包住任意区域,spinning 时蒙半透明遮罩 +
 * 居中 ProgressRing + tip;delay 毫秒内结束的加载不闪遮罩。无 children 时
 * 为独立居中加载指示。 */
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../cn';
import { ProgressRing } from './Basics';
import { colorClass, type SemanticColor } from '../modifiers';

export interface SpinProps {
  spinning?: boolean;
  /** 加载文案(圆环下方) */
  tip?: string;
  /** 圆环直径 */
  size?: number;
  /** 延迟显示毫秒:短加载不闪遮罩 */
  delay?: number;
  /** 语义着色:圆环随之变色 */
  color?: SemanticColor;
  children?: ReactNode;
  className?: string;
}

export function Spin({ spinning = true, tip, size = 28, delay = 0, color, children, className }: SpinProps) {
  const [shown, setShown] = useState(delay <= 0 ? spinning : false);
  useEffect(() => {
    if (!spinning) { setShown(false); return; }
    if (delay <= 0) { setShown(true); return; }
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [spinning, delay]);

  const indicator = (
    <span className="spin-body" role="status" aria-live="polite">
      <ProgressRing size={size} color={color} />
      {tip && <span className="spin-tip">{tip}</span>}
    </span>
  );

  if (children == null) return shown ? <span className={cn('spin-solo', colorClass(color), className)}>{indicator}</span> : null;

  return (
    <div className={cn('spin-wrap', colorClass(color), className)} aria-busy={shown}>
      <div className={cn('spin-content', shown && 'blur')} {...(shown ? { inert: true } : {})}>
        {children}
      </div>
      {shown && <div className="spin-mask">{indicator}</div>}
    </div>
  );
}
