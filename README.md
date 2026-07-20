# Fluent UI × JadeView

WinUI 3 / Fluent 视觉 + antd API 惯例的 React 组件库,面向 **JadeView** 等 Windows 桌面 WebView 应用(浏览器可独立预览)。

技术栈:Vite + React 19 + TypeScript + Tailwind CSS v4。

**在线文档**: <https://luoxueyousheng.github.io/fluent-jade/>

## 包结构

| 包 | 说明 |
| --- | --- |
| `@fluent-jade/ui` | 组件库(WinUI 视觉 + antd API) |
| `@fluent-jade/icon` | Fluent System Icons(`size` / `color`) |
| `@fluent-jade/bridge` | JadeView 宿主桥接(主题 / 材质 / IPC / mock) |

```
packages/ui/        @fluent-jade/ui
packages/icon/      @fluent-jade/icon
packages/bridge/    @fluent-jade/bridge
apps/template/      文档站 / 应用模板
scripts/            无头冒烟与覆盖率脚本
```

## 快速开始

```bash
git clone https://github.com/luoxueyousheng/fluent-jade.git
cd fluent-jade
npm install
npm run dev          # 浏览器 + mock 开发
npm run build        # 构建文档站 → apps/template/dist
```

```ts
import '@fluent-jade/bridge/auto';
import '@fluent-jade/ui/theme.css';
import { FluentProvider, Button } from '@fluent-jade/ui';
import { HomeRegular } from '@fluent-jade/icon';

export function App() {
  return (
    <FluentProvider>
      <Button variant="accent">
        <HomeRegular size={16} />
        开始
      </Button>
    </FluentProvider>
  );
}
```

## 在既有项目中使用

```bash
# ① 模板起步:直接基于 apps/template
# ② npm pack 后安装
npm run build:lib
npm pack -w @fluent-jade/ui -w @fluent-jade/icon -w @fluent-jade/bridge
# ③ monorepo workspaces 源码引用 packages/
```

接线要点:

1. 最外层包 `<FluentProvider>`
2. 引入 `@fluent-jade/ui/theme.css`
3. 宿主零配置:`import '@fluent-jade/bridge/auto'`(mock + init + 默认 Mica)
4. Tailwind v4 需 `@source` 扫描 ui 包源码
5. 图标从 `@fluent-jade/icon` 命名导入,禁止 emoji 当图标;入口需引一次 `import '@fluent-jade/icon/styles'`(headless 图标基础样式,已拆为独立入口以保证 tree-shaking)

## 组件总览

| 分组 | 组件 |
| --- | --- |
| 通用 | Button · ToggleButton · Icons |
| 输入 | Checkbox / Radio / Switch(+ Group · 卡片) · Slider / RangeSlider · NumberBox · Rating · ColorPicker · Upload |
| 文本 | TextBox / TextArea · PasswordBox · Field · SearchBox · AutoSuggest · Form |
| 选择 | ComboBox · MultiSelect · ListBox · Dropdown · Tree |
| 日期时间 | Calendar · DatePicker · RangePicker · TimePicker |
| 导航 | SelectorBar · Tabs · TabView · CommandBar · MenuBar · Breadcrumb · Steps · Pagination |
| 集合 | Table · DataGrid |
| 展示 | Card · Expander · Splitter · SettingsCard · Image · Carousel · Tag · Badge · Avatar · Divider · Empty · Skeleton · Timeline |
| 反馈 | Toast · Modal · Drawer · Tooltip · Popover · TeachingTip · InfoBar · Spin · Progress · Popconfirm · Result |
| 扩展 | Tour · Anchor · HotkeyInput · Cascader · Transfer · Descriptions · VirtualList |
| 外壳 | AppShell · TitleBar · NavView · FluentProvider · LogPane |

## 关键约定

- 状态只改 `<html>` 的 `data-*`(`theme` / `backdrop` / `maximized` / `inactive` / `mock`)
- 无宿主时 bridge 置 `data-mock`,强制纯色底
- 材质枚举对齐 Go 侧:`mica` / `micaAlt` / `acrylic`
- 颜色 / 缓动 / 圆角走令牌;间距 4px 网格
- 文档示例为完整可运行文件(`import` + 具名导出),样式用 Tailwind `className`

## 脚本

```bash
npm run dev          # 文档站开发
npm run build        # 构建文档站
npm run build:lib    # 构建 ui / icon / bridge 的 dist
npm run typecheck    # 类型检查
node scripts/docsmoke.mjs      # 全站冒烟
node scripts/apicoverage.mjs   # API 示例覆盖率
```

## 部署

`main` 推送后 GitHub Actions 自动构建并发布 GitHub Pages。  
产物为纯静态文件,也可直接走 JadeView japk 分发。

## 许可证

MIT
