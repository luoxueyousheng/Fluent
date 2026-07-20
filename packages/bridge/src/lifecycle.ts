/* 启动:configure / ready / ENV */
import { cfg, configure } from './config';
import { hasJade, invokeJson, parsePayload } from './host';
import { applyBackdrop, applyTheme, setBackdropState } from './theme';
import type { InitOptions, InitResult, JadeEnv } from './types';

export { hasJade } from './host';
export { configure } from './config';

/** 运行环境:优先 Preload `__JV_ENV`,否则 env 通道 */
export const ENV: JadeEnv = Object.assign(
  { os: 'windows', arch: '', win11: true },
  typeof window !== 'undefined' ? window.__JV_ENV : undefined,
);

async function init(options: InitOptions = {}): Promise<InitResult> {
  configure(options);
  addEventListener('blur', () => { document.documentElement.dataset.inactive = ''; });
  addEventListener('focus', () => { delete document.documentElement.dataset.inactive; });
  const jade = hasJade();
  if (!jade) document.documentElement.dataset.mock = '';

  if (jade && !window.__JV_ENV && cfg.channels.env) {
    try {
      const env = await invokeJson(cfg.channels.env);
      Object.assign(ENV, parsePayload(env));
    } catch { /* env 通道失败不阻断初始化,用默认 ENV */ }
  }

  const hasBackdrop = ENV.os === 'windows' && ENV.win11;
  if (!hasBackdrop) setBackdropState('none');
  await applyTheme();
  if (hasBackdrop && options.backdrop !== false) {
    const type = typeof options.backdrop === 'string' ? options.backdrop : 'mica';
    try { await applyBackdrop(type); } catch { /* 材质下发失败不阻断 */ }
  }
  return { hasJade: jade, ENV, hasBackdrop };
}

let initPromise: Promise<InitResult> | null = null;

/** 幂等初始化并返回 { hasJade, ENV, hasBackdrop }。auto 入口无参调用;定制材质请首调传参。 */
export function ready(options: InitOptions = {}): Promise<InitResult> {
  return (initPromise ??= init(options));
}

