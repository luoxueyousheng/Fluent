/* ============================================================================
 * core.ts — 宿主桥接核心(框架无关,仅 Windows)
 * invoke 门面(超时/日志/错误回调归一)、运行环境、主题(明暗)、材质。
 * IPC 通道名因宿主而异,configure({ channels }) 覆盖。
 * ========================================================================== */
import type { JadeEnv } from './types';

export const hasJade = typeof window !== 'undefined' && typeof window.jade !== 'undefined';

/** 运行环境:首选 PreloadJS 注入的 __JV_ENV(同步可读);拿不到经 'env' 通道兜底 */
export const ENV: JadeEnv = Object.assign(
  { os: 'windows', arch: '', win11: true },
  typeof window !== 'undefined' ? window.__JV_ENV : undefined,
);

export interface BridgeConfig {
  timeout: number;
  channels: {
    env: string;
    setTheme: string;          // { mode: 'Light'|'Dark'|'System' }
    applyTitlebar: string;     // { dark } —— title-overlay 覆盖层配色
    setBackdrop: string;       // { type, color? }
    [key: string]: string;
  };
  /** invoke 出错时回调(接 Toast);返回 true 表示已处理、不再抛出 */
  onError: ((channel: string, err: unknown) => void) | null;
  onLog: ((text: string, ok: boolean) => void) | null;
  solidColor: (dark: boolean) => string;
}

export const cfg: BridgeConfig = {
  timeout: 8000,
  channels: {
    env: 'env',
    setTheme: 'set-theme',
    applyTitlebar: 'apply-titlebar',
    setBackdrop: 'set-backdrop',
  },
  onError: null,
  onLog: null,
  solidColor: (dark) => (dark ? '#202020FF' : '#F3F3F3FF'),
};

export function configure(options: Partial<BridgeConfig>): void {
  const { channels, ...rest } = options;
  Object.assign(cfg, rest);
  if (channels) Object.assign(cfg.channels, channels);
}

/** invoke 门面:统一超时/日志;失败回调 onError 后返回 null(不抛) */
export async function inv<T = unknown>(channel: string, payload: unknown = {}): Promise<T | null> {
  if (!hasJade) {
    cfg.onError?.(channel, new Error('jade 对象不可用(不在宿主内运行)'));
    return null;
  }
  const t0 = performance.now();
  try {
    const res = await window.jade!.invoke(channel, payload, { timeout: cfg.timeout });
    cfg.onLog?.(
      `invoke('${channel}') ${Math.round(performance.now() - t0)}ms → ${typeof res === 'string' ? res : JSON.stringify(res)}`,
      true,
    );
    return res as T;
  } catch (e) {
    cfg.onLog?.(`invoke('${channel}') 失败: ${String(e)}`, false);
    cfg.onError?.(channel, e);
    return null;
  }
}

/** jade 事件 payload 可能是字符串——统一解析 */
export function parsePayload<T = unknown>(p: unknown): T {
  if (typeof p === 'string') {
    try { return JSON.parse(p) as T; } catch { return p as T; }
  }
  return p as T;
}

/* ---- 主题(明暗):data-theme 挂 <html>,CSS 令牌随之切换 ---- */
export type ThemeMode = 'light' | 'dark' | 'system';
const mqDark = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-color-scheme: dark)') : null;

let themeMode: ThemeMode = 'system';
let currentBackdrop = 'mica';
const themeListeners = new Set<() => void>();

export const getThemeMode = (): ThemeMode => themeMode;
export const getBackdrop = (): string => currentBackdrop;
export const effectiveDark = (): boolean =>
  themeMode === 'dark' || (themeMode === 'system' && !!mqDark?.matches);

export async function applyTheme(): Promise<void> {
  const dark = effectiveDark();
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeListeners.forEach((fn) => fn());
  if (!hasJade) return;
  const mode = { light: 'Light', dark: 'Dark', system: 'System' }[themeMode];
  await inv(cfg.channels.setTheme, { mode });
  if (cfg.channels.applyTitlebar) await inv(cfg.channels.applyTitlebar, { dark });
  if (currentBackdrop === 'none') await applyBackdrop('none');   // 纯色底随主题换色
}

export function setThemeMode(mode: ThemeMode): Promise<void> {
  themeMode = mode;
  return applyTheme();
}

/** 主题变化订阅(React hook 用);返回取消函数 */
export function onThemeChange(fn: () => void): () => void {
  themeListeners.add(fn);
  return () => themeListeners.delete(fn);
}

mqDark?.addEventListener('change', () => { if (themeMode === 'system') void applyTheme(); });

/* ---- 材质(Mica/Acrylic 仅 Win11;非 Win11 纯色兜底并随明暗换色) ---- */
export async function applyBackdrop(type: string): Promise<void> {
  currentBackdrop = type;
  document.documentElement.dataset.backdrop = type;
  themeListeners.forEach((fn) => fn());
  const payload: Record<string, unknown> = { type };
  if (type === 'none') payload.color = cfg.solidColor(effectiveDark());
  await inv(cfg.channels.setBackdrop, payload);
}

/* ---- 启动 ---- */
export interface InitResult { hasJade: boolean; ENV: JadeEnv; hasBackdrop: boolean }

export async function init(options: Partial<BridgeConfig> = {}): Promise<InitResult> {
  configure(options);
  // 窗口失焦态:html[data-inactive] 驱动 CSS 降色
  addEventListener('blur', () => (document.documentElement.dataset.inactive = ''));
  addEventListener('focus', () => delete document.documentElement.dataset.inactive);
  // 无宿主(纯浏览器,连 mock 都没引):同样没有真实材质,强制纯色底
  if (!hasJade) document.documentElement.dataset.mock = '';
  if (hasJade && !window.__JV_ENV && cfg.channels.env) {
    const env = await inv(cfg.channels.env);
    try { Object.assign(ENV, parsePayload(env)); } catch { /* 保持默认 */ }
  }
  const hasBackdrop = ENV.os === 'windows' && ENV.win11;
  if (!hasBackdrop) currentBackdrop = 'none';
  await applyTheme();
  return { hasJade, ENV, hasBackdrop };
}
