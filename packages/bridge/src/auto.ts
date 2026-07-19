/* 零配置入口 — import '@fluent-jade/bridge/auto' 一行完成:
 *   ① 浏览器 mock 宿主(真机存在 window.jade 时自动让位);
 *   ② 幂等初始化(环境 / 主题 / 失焦降色 / 支持材质时自动 Mica)。
 * 需要拿初始化结果时用 ready();需要自定义通道或回调时,
 * 在业务代码里 configure({...}) 即可(任何时机,下一次调用生效)。 */
import './mock';
import { ready } from './core';

void ready();
