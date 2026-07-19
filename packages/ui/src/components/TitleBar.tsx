/* TitleBar — WinUI 3 规格标题栏(40px):
 * 左起 [返回键][汉堡][logo][标题],右侧窗口控制钮三模式(controls):
 *   'host'(默认)= 宿主自绘(如 JadeView title-overlay),仅预留 hostControlsWidth;
 *   'none'      = 不渲染不预留(浏览器 / 宿主自带系统标题栏);
 *   WindowController = 自绘 WinUI 控制钮,回调注入宿主 IPC——宿主可以是任意语言
 *   (JadeView / C++ WebView2 / Python pywebview / Go Wails…),库不写死任何一家。
 * 拖动区默认 jade-region-drag 属性 + CSS app-region 兜底;其他宿主经 dragProps
 * 覆盖(如 pywebview 传 className, Wails 传 --wails-draggable style)。 */
import {
  Children, cloneElement, isValidElement, useEffect, useState,
  type HTMLAttributes, type ReactElement, type ReactNode,
} from 'react';
import { cn } from '../cn';
import { Icon } from './Icon';

/** 自绘窗口控制钮的宿主回调(缺省的钮不渲染) */
export interface WindowController {
  minimize?: () => void;
  /** 最大化 / 还原切换 */
  toggleMaximize?: () => void;
  close?: () => void;
}

export interface TitleBarProps {
  appName: string;
  sub?: ReactNode;
  logo?: ReactNode;
  /** 返回键(最左,WinUI 3 位次);传入即显示 */
  onBack?: () => void;
  backDisabled?: boolean;
  /** 导航展开/收缩汉堡(返回键之后);传入即显示 */
  onMenu?: () => void;
  /** 右上角窗口控制,见文件头注释 */
  controls?: 'host' | 'none' | WindowController;
  /** 'host' 模式为宿主控制钮预留的宽度 */
  hostControlsWidth?: number;
  /** 自绘控制钮的最大化态(切换还原图标);缺省监听 html[data-maximized] */
  maximized?: boolean;
  /** 拖动区属性覆盖/追加(非 JadeView 宿主用) */
  dragProps?: HTMLAttributes<HTMLElement>;
  /** 放在标题栏里的交互元素(自动 no-drag,靠右、控制钮之前) */
  children?: ReactNode;
  className?: string;
}

const NO_DRAG = { 'jade-region-no-drag': '' } as const;

export function TitleBar({
  appName, sub, logo, onBack, backDisabled, onMenu,
  controls = 'host', hostControlsWidth = 146, maximized, dragProps,
  children, className,
}: TitleBarProps) {
  const selfDrawn = typeof controls === 'object';

  /* 自绘且未受控时跟随 html[data-maximized](bridge/宿主写入) */
  const [maxAttr, setMaxAttr] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.hasAttribute('data-maximized'));
  useEffect(() => {
    if (!selfDrawn || maximized != null) return;
    const root = document.documentElement;
    const mo = new MutationObserver(() => setMaxAttr(root.hasAttribute('data-maximized')));
    mo.observe(root, { attributes: true, attributeFilter: ['data-maximized'] });
    return () => mo.disconnect();
  }, [selfDrawn, maximized]);
  const isMax = maximized ?? maxAttr;

  const { className: dragCls, style: dragStyle, ...dragRest } = dragProps ?? {};

  return (
    <header className={cn('title-bar', dragCls, className)}
            style={{
              // host 模式预留宿主按钮区;自绘控制钮贴窗口右缘(Windows 11 关闭钮贴角)
              ...(controls === 'host' ? { paddingRight: hostControlsWidth } : selfDrawn ? { paddingRight: 0 } : {}),
              ...dragStyle,
            }}
            {...{ 'jade-region-drag': '' }} {...dragRest}>
      {/* 无返回状态:汉堡居左(图标中心 x=24,与导航图标列对齐),禁用返回不占位;
          有返回状态:返回键出现在最左,汉堡右移 */}
      {onBack && !backDisabled && (
        <button className="tb-nav-btn" aria-label="返回" onClick={onBack} {...NO_DRAG}>
          <Icon name="back" size={14} strokeWidth={1.3} />
        </button>
      )}
      {onMenu && (
        <button className="tb-nav-btn" aria-label="展开或收缩导航" onClick={onMenu} {...NO_DRAG}>
          <Icon name="menu" size={14} strokeWidth={1.3} />
        </button>
      )}
      {logo ?? <Icon name="logo" className="logo" strokeWidth={1.3} />}
      <span className="app-name">{appName}</span>
      {sub && <span className="app-sub">{sub}</span>}
      {children && <div className="tb-actions" {...NO_DRAG}>{children}</div>}
      {selfDrawn && (
        <div className="tb-caption" {...NO_DRAG}>
          {controls.minimize && (
            <button className="tb-cap" aria-label="最小化" onClick={controls.minimize}>
              <Icon name="min" size={13} strokeWidth={1.1} />
            </button>
          )}
          {controls.toggleMaximize && (
            <button className="tb-cap" aria-label={isMax ? '还原' : '最大化'} onClick={controls.toggleMaximize}>
              <Icon name={isMax ? 'restore' : 'max'} size={12} strokeWidth={1.1} />
            </button>
          )}
          {controls.close && (
            <button className="tb-cap close" aria-label="关闭" onClick={controls.close}>
              <Icon name="close" size={13} strokeWidth={1.1} />
            </button>
          )}
        </div>
      )}
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
