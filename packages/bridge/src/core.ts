/* 兼容 re-export:历史 import 路径 ./core 仍可用 */
export { configure, cfg } from './config';
export { hasJade, invoke, invokeJson, on, parsePayload } from './host';
export {
  setThemeMode, applyBackdrop, applyTheme, onThemeChange,
  getThemeMode, getBackdrop, effectiveDark,
} from './theme';
export { ready, ENV } from './lifecycle';
export type { ThemeMode, BackdropType, InitOptions, InitResult, BridgeConfig, HostCallOptions, HostResponse } from './types';
export { HostError, HostErrorCode, BridgeChannels } from './types';
