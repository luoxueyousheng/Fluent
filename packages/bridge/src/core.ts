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

/* ---- 业务调用:fetch 风格 ----
 * host(channel, body?)     → HostResponse(不抛,看 ok / data / error)
 * host.json(channel, body?)→ 成功直接返回 data,失败抛 HostError
 * inv(...)                 → 旧软失败 API(失败 null),兼容保留
 */

export interface HostCallOptions {
  /** 单次超时毫秒;缺省用 configure.timeout(8000) */
  timeout?: number;
  /** AbortSignal:中止本次调用 */
  signal?: AbortSignal;
  /** true 时失败不回调 configure.onError(由调用方自己处理) */
  silent?: boolean;
}

export class HostError extends Error {
  readonly channel: string;
  readonly code: string;
  readonly cause: unknown;
  constructor(channel: string, message: string, code = 'HOST_ERROR', cause?: unknown) {
    super(message);
    this.name = 'HostError';
    this.channel = channel;
    this.code = code;
    this.cause = cause;
  }
}

export interface HostResponse<T = unknown> {
  ok: boolean;
  data: T | null;
  error: HostError | null;
  channel: string;
  /** 往返耗时毫秒 */
  ms: number;
}

function toHostError(channel: string, e: unknown): HostError {
  if (e instanceof HostError) return e;
  const anyE = e as { code?: string; message?: string; name?: string } | null;
  const msg = String(anyE?.message ?? e ?? '宿主调用失败');
  const code = String(anyE?.code ?? (anyE?.name === 'AbortError' ? 'ABORTED' : 'HOST_ERROR'));
  return new HostError(channel, msg, code, e);
}

function raceAbort<T>(p: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return p;
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new DOMException('Aborted', 'AbortError'));
    signal.addEventListener('abort', onAbort, { once: true });
    p.then(
      (v) => { signal.removeEventListener('abort', onAbort); resolve(v); },
      (e) => { signal.removeEventListener('abort', onAbort); reject(e); },
    );
  });
}

async function hostCall<T = unknown>(
  channel: string,
  payload: unknown = {},
  opts: HostCallOptions = {},
): Promise<HostResponse<T>> {
  const t0 = performance.now();
  const timeout = opts.timeout ?? cfg.timeout;
  if (!hasJade) {
    const error = new HostError(channel, 'jade 对象不可用(不在宿主内运行)', 'NO_HOST');
    if (!opts.silent) cfg.onError?.(channel, error);
    return { ok: false, data: null, error, channel, ms: 0 };
  }
  try {
    const raw = await raceAbort(
      window.jade!.invoke(channel, payload, { timeout }),
      opts.signal,
    );
    const data = parsePayload<T>(raw);
    const ms = Math.round(performance.now() - t0);
    cfg.onLog?.(
      `host('${channel}') ${ms}ms → ${typeof data === 'string' ? data : JSON.stringify(data)}`,
      true,
    );
    return { ok: true, data, error: null, channel, ms };
  } catch (e) {
    const error = toHostError(channel, e);
    const ms = Math.round(performance.now() - t0);
    cfg.onLog?.(`host('${channel}') 失败 ${ms}ms: ${error.message}`, false);
    if (!opts.silent) cfg.onError?.(channel, error);
    return { ok: false, data: null, error, channel, ms };
  }
}

/** 成功直接返回 data;失败抛 HostError(像 await (await fetch()).json()) */
export async function hostJson<T = unknown>(
  channel: string,
  payload: unknown = {},
  opts: HostCallOptions = {},
): Promise<T> {
  // 默认 silent:由调用方 try/catch,避免与 onError 双重处理
  const r = await hostCall<T>(channel, payload, { ...opts, silent: opts.silent ?? true });
  if (!r.ok) throw r.error ?? new HostError(channel, '宿主调用失败', 'HOST_ERROR');
  return r.data as T;
}

/** fetch 风格宿主调用:
 *   const r = await host('load_users', { q });
 *   if (r.ok) use(r.data);
 *   const data = await host.json('load_users', { q }); // 失败抛 HostError
 */
export const host: {
  <T = unknown>(channel: string, payload?: unknown, opts?: HostCallOptions): Promise<HostResponse<T>>;
  json: typeof hostJson;
} = Object.assign(hostCall, { json: hostJson });

/** invoke 门面(旧):失败回调 onError 后返回 null(不抛)。新代码优先 host / host.json */
export async function inv<T = unknown>(channel: string, payload: unknown = {}): Promise<T | null> {
  const r = await hostCall<T>(channel, payload);
  return r.ok ? (r.data as T) : null;
}

/** jade 事件 payload 可能是字符串——统一解析 */
/** @internal jade 事件 payload 解析(useJadeEvent 内部使用) */
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

/** @internal 由 setThemeMode / 系统主题变化触发,业务侧无需直接调用 */
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

export interface InitOptions extends Partial<BridgeConfig> {
  /** 支持材质时自动应用的窗口材质;false 关闭自动应用。默认 'mica' */
  backdrop?: string | false;
}

/** 底层初始化(每次执行,不带幂等);常规一律用 ready / auto 入口 */
export async function init(options: InitOptions = {}): Promise<InitResult> {
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
  // 默认行为:支持材质即自动应用(不再需要调用方手动 applyBackdrop)
  if (hasBackdrop && options.backdrop !== false) {
    await applyBackdrop(typeof options.backdrop === 'string' ? options.backdrop : 'mica');
  }
  return { hasJade, ENV, hasBackdrop };
}

/* ---- 零配置启动:ready 一个入口打通「初始化 + 取结果」 ---- */
let initPromise: Promise<InitResult> | null = null;

/** 等待初始化完成并取结果 { hasJade, ENV, hasBackdrop };幂等——
 *  首次调用以 options 启动(auto 入口即无参调它),后续复用同一结果。
 *  需要定制初始材质时首调传参:ready({ backdrop: 'micaAlt' }) / ready({ backdrop: false })。 */
export function ready(options: InitOptions = {}): Promise<InitResult> {
  return (initPromise ??= init(options));
}

/** @deprecated 已并入 ready(options),别名保留兼容 */
export const ensureInit = ready;
