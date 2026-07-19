/* 主题 / 材质 */
import { cfg } from './config';
import { hasJade, invokeJson } from './host';
import type { BackdropType, ThemeMode } from './types';

const mqDark = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-color-scheme: dark)') : null;

let themeMode: ThemeMode = 'system';
let currentBackdrop: BackdropType = 'mica';
const themeListeners = new Set<() => void>();

export const getThemeMode = (): ThemeMode => themeMode;
export const getBackdrop = (): string => currentBackdrop;
export const effectiveDark = (): boolean =>
  themeMode === 'dark' || (themeMode === 'system' && !!mqDark?.matches);

function notifyTheme(): void {
  themeListeners.forEach((fn) => fn());
}

/** @internal 应用当前主题到 DOM + 下发宿主 */
export async function applyTheme(): Promise<void> {
  const dark = effectiveDark();
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  notifyTheme();
  if (!hasJade) return;
  const mode = { light: 'Light', dark: 'Dark', system: 'System' }[themeMode];
  await invokeJson(cfg.channels.setTheme, { mode });
  if (cfg.channels.applyTitlebar) await invokeJson(cfg.channels.applyTitlebar, { dark });
  if (currentBackdrop === 'none') await applyBackdrop('none');
}

export function setThemeMode(mode: ThemeMode): Promise<void> {
  themeMode = mode;
  return applyTheme();
}

export function onThemeChange(fn: () => void): () => void {
  themeListeners.add(fn);
  return () => { themeListeners.delete(fn); };
}

mqDark?.addEventListener('change', () => {
  if (themeMode === 'system') void applyTheme();
});

export async function applyBackdrop(type: BackdropType): Promise<void> {
  currentBackdrop = type;
  document.documentElement.dataset.backdrop = type;
  notifyTheme();
  const payload: Record<string, unknown> = { type };
  if (type === 'none') payload.color = cfg.solidColor(effectiveDark());
  await invokeJson(cfg.channels.setBackdrop, payload);
}

/** 供 init 写初始材质状态(无宿主调用) */
export function setBackdropState(type: BackdropType): void {
  currentBackdrop = type;
}
