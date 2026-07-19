/* Carousel — antd API 规范(autoplay/autoplaySpeed/dots/arrows/afterChange),
 * WinUI 形态:轨道平移 + Fluent 缓动;圆点用 WinUI PipsPager 样式
 *(活动点拉长为 accent 药丸);箭头悬停浮现。hover 暂停自动播放。 */
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../cn';
import { Icon } from './Icon';

export interface CarouselProps {
  autoplay?: boolean;
  autoplaySpeed?: number;
  dots?: boolean;
  arrows?: boolean;
  initialSlide?: number;
  afterChange?: (current: number) => void;
  children: ReactNode;
  className?: string;
}

export function Carousel({
  autoplay, autoplaySpeed = 3000, dots = true, arrows,
  initialSlide = 0, afterChange, children, className,
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const [index, setIndex] = useState(Math.min(initialSlide, Math.max(0, count - 1)));
  const [hover, setHover] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(index);

  const goTo = useCallback((i: number) => {
    setIndex(((i % count) + count) % count);
  }, [count]);

  /* 可见性感知:切走页面(display:none)/滚出视口/后台标签页时不轮播,
     省掉隐藏状态下每周期的状态更新与 afterChange 副作用 */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* 自动播放(hover / 不可见时暂停) */
  useEffect(() => {
    if (!autoplay || hover || !inView || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), autoplaySpeed);
    return () => clearInterval(t);
  }, [autoplay, autoplaySpeed, hover, inView, count]);

  /* 前值比较防护:比 firstRef 布尔标记更稳——StrictMode 双跑效应下
     firstRef 会在第二跑失守、挂载即误报 afterChange(踩过白屏链) */
  useEffect(() => {
    if (prevIndexRef.current !== index) {
      prevIndexRef.current = index;
      afterChange?.(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div ref={rootRef} className={cn('carousel', className)} role="region" aria-roledescription="轮播"
         onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="car-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div key={i} className="car-slide" aria-hidden={i !== index}>{s}</div>
        ))}
      </div>
      {arrows && count > 1 && (
        <>
          <button className="car-arrow prev" aria-label="上一张" onClick={() => goTo(index - 1)}>
            <Icon name="chevronRight" size={12} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button className="car-arrow next" aria-label="下一张" onClick={() => goTo(index + 1)}>
            <Icon name="chevronRight" size={12} />
          </button>
        </>
      )}
      {dots && count > 1 && (
        <div className="car-dots" role="tablist" aria-label="选择幻灯片">
          {slides.map((_, i) => (
            <button key={i} className={cn('car-dot', i === index && 'active')}
                    role="tab" aria-selected={i === index} aria-label={`第 ${i + 1} 张`}
                    onClick={() => goTo(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
