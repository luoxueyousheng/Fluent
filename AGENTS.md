# Fluent UI × JadeView — Agent / 贡献约定

面向在本仓库改代码的人与编码助手。写 UI 时优先对齐现有组件风格,不要另起一套视觉语言。

## 图标(硬性)

**永远不要使用 emoji 当作 UI 图标。**

- 原因:在 WinUI / Fluent 桌面语境里,emoji 会显得廉价、字号/基线不可控、各平台字形不一致,也破坏线稿图标体系。
- **唯一图标来源**:独立包 **`@fluent-jade/icon`**(Fluent System Icons headless),**不要**从 `@fluent-jade/ui` 导入图标。
- 用法:

  ```tsx
  import { HomeRegular, DismissRegular } from '@fluent-jade/icon';
  <HomeRegular size={16} />
  // 未 re-export 的图标:
  import { AirplaneRegular } from '@fluentui/react-icons/headless/svg/airplane';
  ```

- API:`size`(默认 16);`color`(默认 `currentColor`)。
- 样式:应用入口引一次 `import '@fluent-jade/icon/styles'`(headless reset / HCM / RTL;已拆独立入口以保证 tree-shaking)。
- 目录:文档 Icons 页底部完整列表,或 `iconCatalog` / `iconGroups`。
- 禁止:
  - emoji 当 `icon` 插槽、菜单前缀、状态徽标
  - `import { Icon } from ...` 旧 API(已废除)
  - 文档示例示范 emoji 图标
- 状态色走组件 API / 令牌,不要靠表情区分成功/失败。

## 视觉与 API

- 视觉/动效:WinUI 3;组件 API 惯例:antd 风格(`value/defaultValue`、`size` 三档等)。
- 宽度契约:默认宽度写在挂 className 的根元素上,内层控件 `width:100%; min-width:0` 跟随,绝对定位附件(调节钮/显隐钮/图标)贴外层右缘——保证用户 className(w-20/w-full 等)改宽时整体生效。
- 文档示例:完整可复制文件格式(`import` + 具名 `export function`),布局用 `className`(Tailwind v4),不要在 code 块里写内联 `style`。
- 改完先 `tsc` + build(+ 相关无头脚本)再汇报;未经用户确认不要 commit/push。
