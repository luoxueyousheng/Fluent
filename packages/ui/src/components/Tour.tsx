/* Tour — 引导式漫游(antd API):逐步高亮页面元素并展示说明。
 * steps[{target,title,content,placement}] 驱动;当前步骤高亮锚点 + 浮层说明,
 * 遮罩镂空;支持键盘 Esc 退出、next/prev/goto 导航、onFinish/onClose 回调。
 * portal 到 body(z-950),遮罩层固定全屏。 */
import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { Button } from './Button';
import {
  DismissRegular,
} from '@fluent-react/icon';

export interface TourStep {
  /** 目标元素选择器或 HTMLElement */
  target: string | HTMLElement | null;
  /** 标题 */
  title: ReactNode;
  /** 说明 */
  content?: ReactNode;
  /** 浮层方位 */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface TourProps {
  /** 引导步骤 */
  steps: TourStep[];
  /** 是否打开 */
  open: boolean;
  /** 当前步骤(受控,0-based) */
  current?: number;
  /** 关闭回调 */
  onClose?: () => void;
  /** 完成回调(走完最后一步) */
  onFinish?: () => void;
  /** 步骤切换回调 */
  onChange?: (current: number) => void;
  /** 下一步按钮文案 */
  nextText?: string;
  /** 上一步按钮文案 */
  prevText?: string;
  /** 完成按钮文案 */
  finishText?: string;
  className?: string;
}

function getRect(target: string | HTMLElement | null): DOMRect | null {
  if (!target) return null;
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el || !(el instanceof HTMLElement)) return null;
  return el.getBoundingClientRect();
}

function getPlacement(step: TourStep, targetRect: DOMRect): TourStep['placement'] {
  if (step.placement) return step.placement;
  if (targetRect.top > window.innerHeight / 2) return 'top';
  return 'bottom';
}

function getPopPosition(placement: TourStep['placement'], rect: DOMRect) {
  switch (placement) {
    case 'top': return { top: rect.top - 12, left: rect.left + rect.width / 2, transform: 'translate(-50%, -100%)' };
    case 'bottom': return { top: rect.bottom + 12, left: rect.left + rect.width / 2, transform: 'translate(-50%, 0)' };
    case 'left': return { top: rect.top + rect.height / 2, left: rect.left - 12, transform: 'translate(-100%, -50%)' };
    case 'right': return { top: rect.top + rect.height / 2, left: rect.right + 12, transform: 'translate(0, -50%)' };
  }
}

export function Tour({
  steps, open, current: currentProp, onClose, onFinish, onChange,
  nextText = '下一步', prevText = '上一步', finishText = '完成', className,
}: TourProps) {
  const [innerCurrent, setInnerCurrent] = useState(0);
  const current = currentProp ?? innerCurrent;
  const step = steps[current];

  const setStep = useCallback((n: number) => {
    if (currentProp == null) setInnerCurrent(n);
    onChange?.(n);
  }, [currentProp, onChange]);

  const goNext = useCallback(() => {
    if (current < steps.length - 1) setStep(current + 1);
    else { onFinish?.(); onClose?.(); }
  }, [current, steps.length, setStep, onFinish, onClose]);

  const goPrev = useCallback(() => {
    if (current > 0) setStep(current - 1);
  }, [current, setStep]);

  /* Esc 退出 */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, goNext, goPrev, onClose]);

  if (!open || !step) return null;

  const targetRect = getRect(step.target);
  const placement = getPlacement(step, targetRect!);
  const pos = targetRect ? getPopPosition(placement, targetRect) : { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };

  return createPortal(
    <div className="tour-mask">
      {/* 镂空高亮 */}
      {targetRect && (
        <div className="tour-highlight" style={{ top: targetRect.top - 4, left: targetRect.left - 4, width: targetRect.width + 8, height: targetRect.height + 8 }} />
      )}
      {/* 浮层 */}
      <div className={cn('tour-pop', className)} style={{ position: 'fixed', zIndex: 951, ...pos as React.CSSProperties }}>
        <div className="tour-head">
          <span className="tour-step-ind">{current + 1}/{steps.length}</span>
          <button className="tour-close" aria-label="关闭" onClick={onClose}><DismissRegular size={12} /></button>
        </div>
        {step.title != null && <div className="tour-title">{step.title}</div>}
        {step.content != null && <div className="tour-content">{step.content}</div>}
        <div className="tour-actions">
          {current > 0 && <Button size="small" onClick={goPrev}>{prevText}</Button>}
          <Button size="small" variant="accent" onClick={goNext}>
            {current < steps.length - 1 ? nextText : finishText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
