/* Image — antd API 规范(src/fallback/placeholder/preview),WinUI 形态:
 * 加载 = 骨架屏微光;失败 = fallback 图或碎图占位;悬停遮罩「预览」;
 * 点击打开大图查看器(smoke 遮罩,不盖标题栏):滚轮/按钮缩放、旋转、
 * 拖拽平移、1:1 还原、Esc/外点关闭,Acrylic 工具条。 */
import {
  useCallback, useEffect, useRef, useState,
  type CSSProperties, type ImgHTMLAttributes, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import {
  ArrowClockwiseRegular,
  DismissRegular,
  EyeRegular,
  ImageRegular,
  ZoomInRegular,
  ZoomOutRegular,
} from '@fluent-react/icon';

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string;
  alt?: string;
  /** object-fit(默认 cover) */
  fit?: CSSProperties['objectFit'];
  rounded?: boolean;
  /** 点击打开大图预览(默认 true) */
  preview?: boolean;
  /** 加载失败时替换的图片地址;不传则显示碎图占位 */
  fallback?: string;
  /** 加载中的占位(默认骨架微光) */
  placeholder?: ReactNode;
  className?: string;
}

const SCALE_MIN = 0.25, SCALE_MAX = 4;

function PreviewOverlay({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [deg, setDeg] = useState(0);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const clampScale = (s: number) => Math.min(SCALE_MAX, Math.max(SCALE_MIN, s));
  const zoom = useCallback((f: number) => setScale((s) => clampScale(s * f)), []);
  const reset = () => { setScale(1); setDeg(0); setOff({ x: 0, y: 0 }); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);

  const tools = [
    { key: 'zoomOut', label: '缩小', Icon: ZoomOutRegular, fn: () => zoom(1 / 1.25) },
    { key: 'zoomIn', label: '放大', Icon: ZoomInRegular, fn: () => zoom(1.25) },
    { key: 'rotate', label: '旋转 90°', Icon: ArrowClockwiseRegular, fn: () => setDeg((d) => d + 90) },
  ] as const;

  return createPortal(
    <div className="smoke open img-preview"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
         onWheel={(e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1); }}>
      <img className={cn('imgp-stage', dragging && 'dragging')} src={src} alt={alt} draggable={false}
           style={{ transform: `translate(${off.x}px, ${off.y}px) scale(${scale}) rotate(${deg}deg)` }}
           onPointerDown={(e) => {
             e.preventDefault();
             (e.target as HTMLElement).setPointerCapture(e.pointerId);
             drag.current = { sx: e.clientX, sy: e.clientY, ox: off.x, oy: off.y };
             setDragging(true);
           }}
           onPointerMove={(e) => {
             if (!drag.current) return;
             setOff({ x: drag.current.ox + e.clientX - drag.current.sx, y: drag.current.oy + e.clientY - drag.current.sy });
           }}
           onPointerUp={() => { drag.current = null; setDragging(false); }}
           onDoubleClick={reset} />
      <div className="imgp-toolbar" onMouseDown={(e) => e.stopPropagation()}>
        {tools.map(({ key, label, Icon: ToolIcon, fn }) => (
          <button key={key} className="imgp-btn" aria-label={label} title={label} onClick={fn}>
            <ToolIcon size={14} />
          </button>
        ))}
        <button className="imgp-btn imgp-pct" title="还原(双击图片同效)" onClick={reset}>
          {Math.round(scale * 100)}%
        </button>
        <span className="imgp-sep" />
        <button className="imgp-btn" aria-label="关闭" title="关闭(Esc)" onClick={onClose}>
          <DismissRegular size={12} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function Image({
  src, alt, fit = 'cover', rounded = true, preview = true,
  fallback, placeholder, className, style, width, height, ...rest
}: ImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [cur, setCur] = useState(src);
  const [open, setOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => { setCur(src); setStatus('loading'); }, [src]);

  const onError = () => {
    if (fallback && cur !== fallback) { setCur(fallback); setStatus('loading'); }
    else setStatus('error');
  };

  /* data URI / 缓存图会在 React 挂上 onLoad 之前同步完成,load 事件收不到——
     挂载/换源后主动检查 complete 兜底(踩过) */
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete) {
      if (el.naturalWidth > 0) setStatus('loaded');
      else onError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  return (
    <span className={cn('img-wrap', rounded && 'rounded', className)}
          style={{ width, height, ...style }}>
      {status === 'error' ? (
        <span className="img-broken" role="img" aria-label={alt ?? '图片加载失败'}>
          <ImageRegular size={24} />
          <span>加载失败</span>
        </span>
      ) : (
        <>
          <img ref={imgRef} src={cur} alt={alt} draggable={false}
               style={{ objectFit: fit, opacity: status === 'loaded' ? 1 : 0 }}
               onLoad={() => setStatus('loaded')} onError={onError} {...rest} />
          {status === 'loading' && (placeholder ?? <span className="img-skeleton skeleton" />)}
          {preview && status === 'loaded' && (
            <span className="img-mask" role="button" tabIndex={0} aria-label="预览图片"
                  onClick={() => setOpen(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}>
              <EyeRegular size={16} />
              预览
            </span>
          )}
        </>
      )}
      {open && <PreviewOverlay src={cur} alt={alt} onClose={() => setOpen(false)} />}
    </span>
  );
}
