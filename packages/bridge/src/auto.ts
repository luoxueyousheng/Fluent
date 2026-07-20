/* 零配置入口:import '@fluent-jade/bridge/auto'
 * mock(真机让位) + ready() 初始化 + 默认 Mica */
import './mock';
import { ready } from './lifecycle';

void ready().catch((e) => console.error('[jade] 初始化失败', e));
