/* React hooks */
import { useEffect, useSyncExternalStore, useCallback } from 'react';
import { invoke, on } from './host';
import { effectiveDark, getBackdrop, getThemeMode, onThemeChange } from './theme';

/**
 * 在组件里订阅宿主事件(对齐 jade.on);卸载自动退订
 * @example
 * useOn<{ percent: number }>('progress', (p) => setPct(p.percent));
 */
export function useOn<T = unknown>(event: string, cb: (payload: T) => void): void {
  useEffect(() => on(event, cb), [event, cb]);
}

/** 明暗 / 材质(切换后自动重渲染) */
export function useTheme(): { dark: boolean; mode: string; backdrop: string } {
  const dark = useSyncExternalStore(onThemeChange, effectiveDark, () => false);
  const mode = useSyncExternalStore(onThemeChange, getThemeMode, () => 'system');
  const backdrop = useSyncExternalStore(onThemeChange, getBackdrop, () => 'mica');
  return { dark, mode, backdrop };
}

/** 组件内稳定的 invoke 引用 */
export function useInvoke(): typeof invoke {
  return useCallback(invoke, []) as typeof invoke;
}

