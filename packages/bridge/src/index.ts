/* @fluent-jade/bridge 公共 API — 对齐 JadeView 原生命名
 *
 * 接入:
 *   import '@fluent-jade/bridge/auto'
 *   const { hasJade } = await ready()
 *
 * 业务:
 *   const data = await invoke.json('channel', body)
 *   const off = on('progress', handler)          // 或 useOn(...)
 */

// —— 类型 / 常量 ——
export type {
  JadeEnv,
  JadeHost,
  JadeDialogAPI,
  ToastPayload,
  BridgeConfig,
  BridgeChannelKey,
  BackdropType,
  ThemeMode,
  InitOptions,
  InitResult,
  HostCallOptions,
  HostResponse,
  HostErrorCodeName,
} from './types';
export { BridgeChannels, HostErrorCode, HostError } from './types';

// —— 生命周期 ——
export { hasJade, ENV, configure, ready } from './lifecycle';

// —— 业务调用(对齐 JadeView:invoke / on) ——
export { invoke, invokeJson, on } from './host';

// —— 主题 / 材质 ——
export { setThemeMode, applyBackdrop, getThemeMode, getBackdrop, effectiveDark } from './theme';

// —— React hooks ——
export {
  useOn,
  useTheme, useInvoke,
} from './hooks';
