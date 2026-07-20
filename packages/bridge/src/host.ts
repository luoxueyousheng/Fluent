/* 业务调用:对齐 JadeView invoke / on 命名 */
import { cfg } from './config';
import {
  HostError, HostErrorCode,
  type HostCallOptions, type HostResponse,
} from './types';

/** 调用时判断(mock 可能在 import bridge 之后才注入 window.jade) */
export function hasJade(): boolean {
  return typeof window !== 'undefined' && typeof window.jade !== 'undefined';
}

/** jade 事件/应答 payload:字符串则尝试 JSON 解析 */
export function parsePayload<T = unknown>(p: unknown): T {
  if (typeof p === 'string') {
    try { return JSON.parse(p) as T; } catch { return p as T; }
  }
  return p as T;
}

function toHostError(channel: string, e: unknown): HostError {
  if (e instanceof HostError) return e;
  const anyE = e as { code?: string; message?: string; name?: string } | null;
  const msg = String(anyE?.message ?? e ?? '宿主调用失败');
  let code = String(anyE?.code ?? HostErrorCode.HOST_ERROR);
  if (anyE?.name === 'AbortError') code = HostErrorCode.ABORTED;
  if (/timeout|超时/i.test(msg) && code === HostErrorCode.HOST_ERROR) code = HostErrorCode.TIMEOUT;
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

async function invokeCall<T = unknown>(
  channel: string,
  payload: unknown = {},
  opts: HostCallOptions = {},
): Promise<HostResponse<T>> {
  const t0 = performance.now();
  const timeout = opts.timeout ?? cfg.timeout;
  if (!hasJade()) {
    const error = new HostError(channel, 'jade 对象不可用(不在宿主内运行)', HostErrorCode.NO_HOST);
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
      `invoke('${channel}') ${ms}ms → ${typeof data === 'string' ? data : JSON.stringify(data)}`,
      true,
    );
    return { ok: true, data, error: null, channel, ms };
  } catch (e) {
    const error = toHostError(channel, e);
    const ms = Math.round(performance.now() - t0);
    cfg.onLog?.(`invoke('${channel}') 失败 ${ms}ms: ${error.message}`, false);
    if (!opts.silent) cfg.onError?.(channel, error);
    return { ok: false, data: null, error, channel, ms };
  }
}

/** 成功返回 data;失败抛 HostError(默认 silent) */
export async function invokeJson<T = unknown>(
  channel: string,
  payload: unknown = {},
  opts: HostCallOptions = {},
): Promise<T> {
  const r = await invokeCall<T>(channel, payload, { ...opts, silent: opts.silent ?? true });
  if (!r.ok) throw r.error ?? new HostError(channel, '宿主调用失败', HostErrorCode.HOST_ERROR);
  return r.data as T;
}

/**
 * 调用宿主(对齐 jade.invoke 命名)
 * @example
 * const r = await invoke('load_users', { q });
 * if (r.ok) use(r.data);
 * const data = await invoke.json('load_users', { q });
 */
export const invoke: {
  <T = unknown>(channel: string, payload?: unknown, opts?: HostCallOptions): Promise<HostResponse<T>>;
  json: typeof invokeJson;
} = Object.assign(invokeCall, { json: invokeJson });


/**
 * 订阅宿主推送(对齐 jade.on 命名);返回退订函数
 * @example
 * const off = on('progress', (p) => setPct(p.percent));
 * off();
 */
export function on<T = unknown>(event: string, cb: (payload: T) => void): () => void {
  if (!hasJade()) return () => {};
  return window.jade!.on(event, (p) => cb(parsePayload<T>(p)));
}
