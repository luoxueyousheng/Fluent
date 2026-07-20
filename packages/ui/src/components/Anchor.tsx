/* Anchor — 锚点导航(antd API):固定侧边栏,滚动时高亮当前区块。
 * items[{key,href,title,children}] 渲染嵌套链接;点击平滑滚动到目标;
 * 监听滚动自动激活;affix 固定在视口。 */
import { useEffect, useState, type ReactNode } from 'react';
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

/* querySelector(href) 对含特殊字符(如 id 里的冒号/点)的 href 会抛 SyntaxError,
   锚点本质是 id 引用,用 getElementById 规避选择器转义问题 */
function findAnchorTarget(href: string): HTMLElement | null {
  return document.getElementById(href.replace(/^#/, ''));
}

export function Anchor({
  items, activeKey: activeProp, onChange, affix = true, offsetTop = 0, getContainer, className,
}: AnchorProps) {
  const [active, setActive] = useState(activeProp ?? items[0]?.key ?? '');
  const currentActive = activeProp ?? active;

  /* 滚动监听激活(effect 内取容器,getContainer 变化时重挂监听) */
  useEffect(() => {
    const el = getContainer?.() ?? window;
    const links = flattenLinks(items);
    const onScroll = () => {
      /* getBoundingClientRect 相对滚动容器计算:offsetTop 相对的是
         offsetParent 而非滚动容器,容器内有偏移祖先时会判错 */
      const containerTop = el === window ? 0 : (el as HTMLElement).getBoundingClientRect().top;
      for (let i = links.length - 1; i >= 0; i--) {
        const target = findAnchorTarget(links[i].href);
        if (target && target.getBoundingClientRect().top - containerTop - offsetTop <= 4) {
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
  }, [items, offsetTop, onChange, getContainer]);

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const target = findAnchorTarget(href);
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
