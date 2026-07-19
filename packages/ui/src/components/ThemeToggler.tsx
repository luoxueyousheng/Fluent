/* ThemeToggler — 带 View Transitions 动效的明暗主题切换按钮。
 * 源自 MagicUI (https://magicui.design),适配 Fluent UI × JadeView。
 *
 * 使用 View Transitions API(Chrome 111+)实现 clip-path 揭示动效。
 * 不支持时静默降级。自动使用 bridge.setThemeMode 同步到宿主,
 * bridge 不可用时直接切换 data-theme。
 *
 * 用法:
 *   <ThemeToggler />                                    // 自动管理 + 同步宿主
 *   <ThemeToggler duration={600} />
 *   <ThemeToggler fromCenter />
 *   <ThemeToggler theme={t} onThemeChange={setT} />     // 受控模式
 */
import { useCallback, useRef } from 'react';
import { WeatherSunnyRegular, WeatherMoonRegular } from '@fluent-jade/icon';
import { setThemeMode } from '@fluent-jade/bridge';
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
}

/** 无 bridge 时回退:直接写 data-theme */
function setThemeFallback(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme;
}

function doSetTheme(theme: 'light' | 'dark') {
  try {
    // setThemeMode 会同步到 DOM + 通知宿主(JadeView invoke)
    void setThemeMode(theme);
  } catch {
    setThemeFallback(theme);
  }
}

export function ThemeToggler({
  className,
  duration = 400,
  fromCenter = false,
  theme: controlledTheme,
  onThemeChange,
}: ThemeTogglerProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const isControlled = controlledTheme !== undefined;

  const toggle = useCallback(() => {
    const current = isControlled ? controlledTheme : (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';

    // 受控模式:只回调,不直接改 DOM
    if (isControlled) {
      onThemeChange?.(next);
      return;
    }

    // 不支持 View Transitions:直接切换
    if (typeof document === 'undefined' || !('startViewTransition' in document)) {
      doSetTheme(next);
      return;
    }

    // 计算展开原点
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
      doSetTheme(next);
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
  }, [isControlled, controlledTheme, duration, fromCenter, onThemeChange]);

  const dark = isControlled ? controlledTheme === 'dark' : document.documentElement.dataset.theme === 'dark';

  return (
    <button
      ref={btnRef}
      className={cn(
        'theme-toggler',
        dark && 'theme-toggler-dark',
        className,
      )}
      onClick={toggle}
      aria-label={dark ? '切换亮色主题' : '切换暗色主题'}
    >
      {dark ? <WeatherSunnyRegular size={18} /> : <WeatherMoonRegular size={18} />}
    </button>
  );
}
