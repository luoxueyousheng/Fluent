/* ComboBox — 自绘下拉浮层,键盘可达。
 * 键盘游标高亮(.active)仅在按键导航后出现;鼠标悬停交给 :hover,
 * pointermove 清掉键盘高亮避免双重着色(沿用 WinUI 版打磨过的细节)。
 * 打开定位 = WinUI 3 行为:浮层上移覆盖触发器,选中项与控件原位对齐
 *(无选中项则默认下方展开);超出视口时钳制回 8px 安全边距内。 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import {
  ChevronDownRegular,
} from '@fluent-jade/icon';
import { useFlyout } from './Flyout';
import { useMergedState } from '../useMergedState';
import { sizeClass, type ControlSize } from './Button';
import { statusClass, type ControlStatus } from './Field';
import { colorClass, radiusClass, type Radius, type SemanticColor } from '../modifiers';

export interface ComboOption { value: string; label: ReactNode }

export interface ComboBoxProps {
  options: ComboOption[];
  /** 受控值;不传则用 defaultValue 非受控(antd 惯例) */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  size?: ControlSize;
  status?: ControlStatus;
  /** 语义着色:展开下划线随之变色 */
  color?: SemanticColor;
  /** 圆角:none / sm / md(默认) / lg */
  radius?: Radius;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export function ComboBox({
  options, value, defaultValue = null, onChange, size, status,
  color, radius, placeholder = '请选择', className, ...aria
}: ComboBoxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  // portal 到 body + fixed:祖先 overflow 裁不到;popRef 参与外点判定
  const fly = useFlyout(rootRef, popRef);
  const [activeIdx, setActiveIdx] = useState(-1);   // -1 = 无键盘高亮
  const [current2, setCurrent2] = useMergedState<string | null>(defaultValue, value, onChange as (v: string | null) => void);
  const selIdx = options.findIndex((o) => o.value === current2);
  const current = selIdx >= 0 ? options[selIdx] : null;

  const openPop = () => { setActiveIdx(-1); fly.open(); };
  // 提交立即关闭(true):淡出期间选中着色迁移会闪
  const choose = (o: ComboOption) => { setCurrent2(o.value); fly.close(true); };

  /* WinUI 3 对位(portal + fixed 坐标系):浮层上移覆盖触发器,
   * 选中项中线与触发器中线重合;滚动/缩放实时跟随锚点 */
  useLayoutEffect(() => {
    if (!fly.isOpen || fly.closing) return;
    const place = () => {
      const pop = popRef.current, root = rootRef.current;
      const trigger = root?.querySelector<HTMLElement>('.combo-trigger');
      if (!pop || !trigger) return;
      const tr = trigger.getBoundingClientRect();
      pop.style.left = `${tr.left}px`;
      pop.style.width = `${tr.width}px`;             // portal 后 min-width:100% 失去参照,显式随触发器宽
      if (selIdx < 0) {                              // 无选中:默认下方展开
        pop.style.top = `${tr.bottom + 4}px`;
        pop.style.transformOrigin = 'top center';
        return;
      }
      const opt = pop.querySelectorAll<HTMLElement>('.combo-option')[selIdx];
      if (!opt) return;
      // 长列表:先把选中项滚到浮层可视区中部(手动设 scrollTop,避免连带滚动页面)
      if (pop.scrollHeight > pop.clientHeight) {
        pop.scrollTop = Math.max(0, Math.min(
          opt.offsetTop - (pop.clientHeight - opt.offsetHeight) / 2,
          pop.scrollHeight - pop.clientHeight,
        ));
      }
      let top = tr.top + (tr.height - opt.offsetHeight) / 2 - opt.offsetTop + pop.scrollTop;
      pop.style.top = `${top}px`;
      // 视口钳制(上下留 8px)
      const r = pop.getBoundingClientRect();
      const dy = r.top < 8 ? 8 - r.top : r.bottom > innerHeight - 8 ? innerHeight - 8 - r.bottom : 0;
      if (dy) { top += dy; pop.style.top = `${top}px`; }
      // 展开动画原点对准选中项
      pop.style.transformOrigin = `center ${opt.offsetTop - pop.scrollTop + opt.offsetHeight / 2}px`;
    };
    place();
    addEventListener('scroll', place, true);
    addEventListener('resize', place);
    return () => { removeEventListener('scroll', place, true); removeEventListener('resize', place); };
  }, [fly.isOpen, fly.closing, selIdx]);

  const setActive = (i: number) => {
    const n = options.length;
    const next = ((i % n) + n) % n;
    setActiveIdx(next);
    requestAnimationFrame(() =>
      popRef.current?.querySelectorAll<HTMLElement>('.combo-option')[next]?.scrollIntoView({ block: 'nearest' }));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { fly.close(); return; }
    if (options.length === 0) return;        // 空 options:方向键取模得 NaN,Enter 开空浮层
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      if (!fly.isOpen) return openPop();
    }
    if (e.key === 'ArrowDown') setActive((activeIdx < 0 ? selIdx : activeIdx) + 1);
    else if (e.key === 'ArrowUp') setActive((activeIdx < 0 ? selIdx : activeIdx) - 1);
    else if (e.key === 'Enter' || e.key === ' ') {
      if (fly.isOpen && activeIdx >= 0) choose(options[activeIdx]);
    }
  };

  return (
    <div ref={rootRef} className={cn('combobox', colorClass(color), radiusClass(radius), className)}>
      <button type="button" className={cn('combo-trigger', sizeClass(size), statusClass(status))}
              aria-haspopup="listbox" aria-expanded={fly.isOpen}
              onClick={fly.toggle} onKeyDown={onKeyDown} aria-label={aria['aria-label']}>
        <span className={cn('combo-value', !current && 'placeholder')}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDownRegular size={12} className="combo-chev" />
      </button>
      {fly.isOpen && createPortal(
        <div ref={popRef} className={cn('combo-pop', fly.closing && 'closing')} role="listbox"
             style={{ position: 'fixed', zIndex: 850, minWidth: 0 }}
             onPointerMove={(e) => {
               if ((e.target as HTMLElement).closest('.combo-option')) setActiveIdx(-1);
             }}>
          {options.map((o, i) => (
            <div key={o.value} role="option"
                 className={cn('combo-option', i === activeIdx && 'active')}
                 aria-selected={o.value === current2}
                 onClick={() => choose(o)}>
              {o.label}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
