import type { ReactNode } from 'react';

/** 一条属性/事件说明 */
export interface ApiRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** 一个用法小节:标题 + 说明 + 活演示 + 示例代码 */
export interface DocSection {
  title: string;
  description?: string;
  demo: ReactNode;
  code: string;
}

/** 附加 API 表(复合组件:Form.Item / RadioGroup / RangeSlider …) */
export interface ApiGroup {
  title: string;
  rows: ApiRow[];
  kind?: 'props' | 'events';
}

/** 一个组件的完整文档(HeroUI 文档页结构) */
export interface DocDef {
  key: string;
  /** 英文组件名(页面主标题) */
  name: string;
  /** 中文名(导航与标题副名) */
  cn: string;
  description: string;
  importCode: string;
  sections: DocSection[];
  props: ApiRow[];
  /** 事件/回调单独列表(HeroUI 的 Events 区) */
  events?: ApiRow[];
  /** 复合组件的附加表 */
  extraApis?: ApiGroup[];
}

/** 导航分组 */
export interface DocGroup {
  title: string;
  items: DocDef[];
  /** 指南组:出现在导航,但不进首页组件画廊 */
  guide?: boolean;
}
