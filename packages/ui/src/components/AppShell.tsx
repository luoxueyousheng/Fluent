/* AppShell — 标题栏 + 侧导航合并的应用外壳,mode 控制形态:
 *   'multi'(默认)= 多页文档:标题栏含汉堡(展开/收缩),下方 侧导航 + 内容区;
 *   'single'      = 单页应用:仅标题栏 + 内容区,不渲染汉堡与侧导航。
 * 返回键与 mode 解耦:传 onBack 即显示。TitleBar 的宿主相关能力
 *(controls 三模式 / dragProps / maximized)原样透传,宿主不限语言。 */
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../cn';
import { useMergedState } from '../useMergedState';
import { TitleBar, type TitleBarProps } from './TitleBar';
import { NavView, type NavEntry } from './NavView';

export interface AppShellProps {
  /** 'multi' 多页(侧导航 + 汉堡)/ 'single' 单页(仅标题栏) */
  mode?: 'single' | 'multi';
  /** 自绘窗口框:圆角 + 边框 + 阴影(阴影区留白经 --frame-margin/--frame-radius 调)。
   *  前提是宿主创建「无边框 + 窗口级透明」的窗口(窗口 alpha 透明,不是网页背景透明),
   *  由 Web 层画整个窗框;该模式与 Mica/Acrylic 材质互斥(材质需要系统窗口参与),
   *  bridge 侧用 ensureInit({ backdrop: false })。挂在 #root/body 直下时自动给
   *  <html> 置 data-frame(页面背景转透明);嵌套演示不影响全局。 */
  frame?: boolean;

  /* ---- 标题栏(透传 TitleBar) ---- */
  appName: string;
  sub?: ReactNode;
  logo?: ReactNode;
  controls?: TitleBarProps['controls'];
  hostControlsWidth?: number;
  maximized?: boolean;
  dragProps?: HTMLAttributes<HTMLElement>;
  /** 标题栏内交互元素(自动 no-drag) */
  titleBarActions?: ReactNode;
  /** 返回键:传入即显示(单页/多页均可用) */
  onBack?: () => void;
  backDisabled?: boolean;

  /* ---- 侧导航(multi 模式) ---- */
  items?: NavEntry[];
  value?: string;
  onChange?: (key: string) => void;
  /** 导航列表上方固定插槽(如搜索框) */
  navHeader?: ReactNode;
  /** 折叠态:受控 collapsed / 非受控 defaultCollapsed(汉堡驱动) */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;

  /** 内容区(自动包 .content/.content-inner 滚动容器) */
  children: ReactNode;
  className?: string;
}

export function AppShell({
  mode = 'multi', frame,
  appName, sub, logo, controls, hostControlsWidth, maximized, dragProps,
  titleBarActions, onBack, backDisabled,
  items = [], value = '', onChange,
  navHeader, collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange,
  children, className,
}: AppShellProps) {
  const multi = mode !== 'single';
  const [collapsed, setCollapsed] = useMergedState(defaultCollapsed, collapsedProp, onCollapsedChange);
  const rootRef = useRef<HTMLDivElement>(null);

  /* frame 且作为应用根挂载(#root/body 直下)→ html[data-frame]:
     页面背景转透明,让透明窗口的圆角外露出桌面;嵌套(文档演示)不动全局 */
  useEffect(() => {
    const el = rootRef.current;
    const isAppRoot = !!el?.parentElement && (el.parentElement.id === 'root' || el.parentElement === document.body);
    if (!frame || !isAppRoot) return;
    document.documentElement.dataset.frame = '';
    return () => { delete document.documentElement.dataset.frame; };
  }, [frame]);

  const content = (
    <main className="content">
      <div className="content-inner">{children}</div>
    </main>
  );

  return (
    <div ref={rootRef} className={cn('app', frame && 'app-frame', className)}>
      {/* 汉堡在标题栏最左(与导航图标列同 x),返回键其后 */}
      <TitleBar appName={appName} sub={sub} logo={logo}
                controls={controls} hostControlsWidth={hostControlsWidth}
                maximized={maximized} dragProps={dragProps}
                onBack={onBack} backDisabled={backDisabled}
                onMenu={multi ? () => setCollapsed(!collapsed) : undefined}>
        {titleBarActions}
      </TitleBar>
      {multi ? (
        <div className="shell">
          <NavView items={items} value={value} onChange={onChange ?? (() => {})}
                   collapsed={collapsed} header={navHeader} />
          {content}
        </div>
      ) : content}
    </div>
  );
}
