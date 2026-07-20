/* ThemeToggler — 带 View Transitions 动效的明暗主题切换按钮。
 * 源自 MagicUI (https://magicui.design),适配 Fluent UI × JadeView。
 *
 * 使用 View Transitions API(Chrome 111+)实现 clip-path 揭示动效。
 * 不支持时静默降级。默认只切 data-theme;setTheme 可注入 bridge.setThemeMode 同步宿主。
 *
 * 用法:
 *   <ThemeToggler />
 *   <ThemeToggler duration={600} />
 *   <ThemeToggler fromCenter />
 *   <ThemeToggler setTheme={(t) => setThemeMode(t)} />   // 同步宿主
 *   <ThemeToggler theme={t} onThemeChange={setT} />       // 受控
 */
import { useCallback, useRef, useState } from 'react';
import { WeatherSunnyRegular, WeatherMoonRegular } from '@fluent-jade/icon';
import { cn } from '../cn';

export interface ThemeTogglerProps {
  className?: string;
  /** 过渡时长(毫秒),默认 400 */
  duration?: number;
  /** 从视口中心展开(默认从按钮位置) */
  fromCenter?: boolean;
  /** 受控主题值;缺省则内部自动管理 */
  theme?: 'light' | 'dark';
  /** 主题切换回调(受控模式必传) */
  onThemeChange?: (theme: 'light' | 'dark') => void;
  /** 自定义主题写入(如 bridge.setThemeMode);缺省只切 data-theme */
  setTheme?: (theme: 'light' | 'dark') => void | Promise<void>;
}

/** 缺省:只切 DOM,不通知宿主 */
function setThemeFallback(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggler({
  className,
  duration = 400,
  fromCenter = false,
  theme: controlledTheme,
  onThemeChange,
  setTheme,
}: ThemeTogglerProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const isControlled = controlledTheme !== undefined;
  const applyTheme = setTheme ?? setThemeFallback;

  /* 非受控:本地 state 驱动图标/aria-label;初值在懒初始化里读一次 dataset,
     渲染期不直接读 document(SSR 安全) */
  const [innerTheme, setInnerTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

  const toggle = useCallback(() => {
    const current = isControlled ? controlledTheme : innerTheme;
    const next = current === 'dark' ? 'light' : 'dark';

    if (isControlled) {
      onThemeChange?.(next);
      return;
    }

    setInnerTheme(next);

    if (typeof document === 'undefined' || !('startViewTransition' in document)) {
      void applyTheme(next);
      return;
    }

    let startClip: string;
    if (fromCenter) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      startClip = `circle(0% at ${cx}px ${cy}px)`;
    } else {
      const rect = btnRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        startClip = `circle(0% at ${cx}px ${cy}px)`;
      } else {
        startClip = 'circle(0% at 50% 50%)';
      }
    }

    const endClip = 'circle(100% at 50% 50%)';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transition = (document as any).startViewTransition(() => {
      void applyTheme(next);
    });

    void transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [startClip, endClip] },
        {
          duration,
          easing: 'cubic-bezier(0.8, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
  }, [isControlled, controlledTheme, innerTheme, duration, fromCenter, onThemeChange, applyTheme]);

  const dark = isControlled ? controlledTheme === 'dark' : innerTheme === 'dark';

  return (
    <button
      ref={btnRef}
      className={cn('theme-toggler', dark && 'theme-toggler-dark', className)}
      onClick={toggle}
      aria-label={dark ? '切换亮色主题' : '切换暗色主题'}
    >
      {dark ? <WeatherSunnyRegular size={18} /> : <WeatherMoonRegular size={18} />}
    </button>
  );
}
