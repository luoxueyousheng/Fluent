/* Splitter — 可拖分栏(WinUI 工具窗骨架件):两个面板 + 6px 拖柄,
 * 首面板像素定宽(受控/非受控),min/max 钳制;拖柄键盘可达(方向键 ±16,
 * Home/End 到极值),双击回默认值。 */
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { cn } from '../cn';
import { useMergedState } from '../useMergedState';

export interface SplitterProps {
  /** true = 上下分栏(拖柄横放);默认左右 */
  vertical?: boolean;
  /** 首面板尺寸(px):受控 size / 非受控 defaultSize */
  size?: number;
  defaultSize?: number;
  min?: number;
  max?: number;
  onResize?: (size: number) => void;
  /** 恰好两个面板 */
  children: [ReactNode, ReactNode];
  className?: string;
}

export function Splitter({
  vertical, size: sizeProp, defaultSize = 240, min = 120, max = 600,
  onResize, children, className,
}: SplitterProps) {
  const [size, setSize] = useMergedState(defaultSize, sizeProp, onResize);
  const rootRef = useRef<HTMLDivElement>(null);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const onDown = (e: ReactPointerEvent) => {
    const gutter = e.currentTarget as HTMLElement;
    gutter.setPointerCapture(e.pointerId);
    // 增量拖动:保留按下点在拖柄内的偏移,面板不会在按下瞬间跳变
    const startPos = vertical ? e.clientY : e.clientX;
    const startSize = size;
    const move = (ev: globalThis.PointerEvent) =>
      setSize(clamp(startSize + ((vertical ? ev.clientY : ev.clientX) - startPos)));
    const up = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const dec = vertical ? 'ArrowUp' : 'ArrowLeft';
    const inc = vertical ? 'ArrowDown' : 'ArrowRight';
    if (e.key === dec) { e.preventDefault(); setSize(clamp(size - 16)); }
    else if (e.key === inc) { e.preventDefault(); setSize(clamp(size + 16)); }
    else if (e.key === 'Home') { e.preventDefault(); setSize(min); }
    else if (e.key === 'End') { e.preventDefault(); setSize(max); }
  };

  return (
    <div ref={rootRef} className={cn('splitter', vertical && 'vertical', className)}
         style={vertical
           ? { gridTemplateRows: `${size}px 6px minmax(0, 1fr)` }
           : { gridTemplateColumns: `${size}px 6px minmax(0, 1fr)` }}>
      <div className="split-pane">{children[0]}</div>
      <div className="split-gutter" role="separator" tabIndex={0}
           aria-orientation={vertical ? 'horizontal' : 'vertical'}
           aria-valuenow={size} aria-valuemin={min} aria-valuemax={max}
           onPointerDown={onDown} onKeyDown={onKey}
           onDoubleClick={() => setSize(clamp(defaultSize))}>
        <i />
      </div>
      <div className="split-pane">{children[1]}</div>
    </div>
  );
}
