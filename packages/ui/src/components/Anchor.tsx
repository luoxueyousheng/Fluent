/* Anchor — 锚点导航(antd API):固定侧边栏,滚动时高亮当前区块。
 * items[{key,href,title,children}] 渲染嵌套链接;点击平滑滚动到目标;
 * 监听滚动自动激活;affix 固定在视口。 */
import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { cn } from '../cn';

export interface AnchorLink {
  key: string;
  href: string;
  title: ReactNode;
  children?: AnchorLink[];
}

export interface AnchorProps {
  /** 锚点项 */
  items: AnchorLink[];
  /** 当前激活的 key(受控) */
  activeKey?: string;
  /** 激活变化回调 */
  onChange?: (key: string) => void;
  /** 固定在视口 */
  affix?: boolean;
  /** 偏移量(固定时距顶部) */
  offsetTop?: number;
  /** 容器滚动监听目标(默认 window) */
  getContainer?: () => HTMLElement | Window;
  className?: string;
}

function flattenLinks(items: AnchorLink[]): AnchorLink[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenLinks(item.children) : [])]);
}

export function Anchor({
  items, activeKey: activeProp, onChange, affix = true, offsetTop = 0, getContainer, className,
}: AnchorProps) {
  const [active, setActive] = useState(activeProp ?? items[0]?.key ?? '');
  const currentActive = activeProp ?? active;
  const containerRef = useRef<HTMLElement | Window>(undefined);

  useEffect(() => {
    containerRef.current = getContainer?.() ?? window;
  }, [getContainer]);

  /* 滚动监听激活 */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const links = flattenLinks(items);
    const onScroll = () => {
      const scrollTop = el === window ? window.scrollY : (el as HTMLElement).scrollTop;
      for (let i = links.length - 1; i >= 0; i--) {
        const target = document.querySelector(links[i].href);
        if (target && (target as HTMLElement).offsetTop - offsetTop <= scrollTop + 4) {
          setActive(links[i].key);
          onChange?.(links[i].key);
          return;
        }
      }
      if (links.length > 0) { setActive(links[0].key); onChange?.(links[0].key); }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [items, offsetTop, onChange]);

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderLinks = (list: AnchorLink[], level = 0) => (
    <ul className="anchor-links">
      {list.map((link) => (
        <li key={link.key} className="anchor-link-item">
          <a
            href={link.href}
            className={cn('anchor-link', link.key === currentActive && 'anchor-link-active')}
            style={{ paddingLeft: 12 + level * 16 }}
            onClick={(e) => handleClick(e, link.href)}
          >
            {link.title}
          </a>
          {link.children && renderLinks(link.children, level + 1)}
        </li>
      ))}
    </ul>
  );

  const wrapCls = cn('anchor', affix && 'anchor-affix', className);

  return (
    <nav className={wrapCls} style={affix ? { position: 'sticky' as const, top: offsetTop } : undefined}>
      {renderLinks(items)}
    </nav>
  );
}
