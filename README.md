# Fluent

WinUI 3 / Fluent 2 视觉 + antd API 惯例的 React 组件库,面向 Windows 桌面 WebView 应用(JadeView 宿主,浏览器可独立预览)。
技术栈:Vite + React 19 + TypeScript + Tailwind CSS v4(CSS-first `@theme` 令牌)。

**在线组件文档**:<https://luoxueyousheng.github.io/Fluent/> —— 60+ 组件,每个组件独立文档页(用法示例 + 可复制完整代码 + API 表),左侧导航支持组件搜索。

## 特性

- **视觉与动效 = WinUI 3**:Mica/Acrylic 材质、Fluent 缓动;标题栏与左侧导航取火山 Demo 风格(40px 标题栏、透明底导航、激活项加粗)
- **API = antd 惯例**:`value/defaultValue` 受控约定、`size` 三档(24/32/40)、`status` 校验态、`Form.Item` rules、`rowSelection`、命令式 `message / notification / modal`(duration 单位秒)
- **三层设计令牌**:Seed 种子(品牌决策)→ Calibration 校准(默认钉 WinUI 官方精调值,换品牌删掉即回退公式)→ Map 梯度(color-mix 派生)→ Alias 别名(组件 CSS 的稳定接口)。**换主题色只改种子层**
- **portal 浮层体系**:全部下拉 / 菜单 / 气泡 portal 到 body(z-850),不被父容器裁切、滚动实时跟随、放不下自动上翻
- **深浅主题**:`[data-theme]` 令牌切换,无 `dark:` 前缀;真机透明材质下浮层自动切不透明底
- **宿主桥接**:`@fluent-react/bridge` 封装 JadeView IPC(主题 / 材质 / 标题栏,`init({ channels })` 可配通道名),浏览器自动降级 mock;零第三方运行时依赖(原生 Date,无 dayjs)

## 目录结构

```
packages/ui/        @fluent-react/ui —— 组件库
  src/styles/theme.css   令牌(:root + [data-theme=dark])+ @theme 工具类映射 + @layer components
  src/components/        60+ 组件(TSX)
packages/bridge/    @fluent-react/bridge —— JadeView 宿主桥接
  src/core.ts            invoke 门面 / 主题 / 材质 / 平台
  src/hooks.ts           useJadeEvent / useTheme / useInv
  src/mock.ts            浏览器模拟宿主(真机自动让位)
apps/template/      组件文档站(即在线文档,亦是新项目起始模板)
scripts/            Edge 无头验证脚本(docsmoke.mjs 整站冒烟 + 各专项断言)
```

## 快速开始

```bash
npm install          # 装依赖(workspaces)
npm run dev          # 开发(浏览器 + mock;dev server 与 jade:// 不同源,别在真机里开)
npm run build        # 构建 → apps/template/dist(纯静态,走 japk / 协议服务 / 回环 HTTP 分发)

# 本地预览构建产物
npx vite preview --config apps/template/vite.config.ts apps/template --port 4173
# 整站冒烟(缺省本机 Edge;CI 用 BROWSER_PATH 指定 Chrome)
node scripts/docsmoke.mjs
```

## 在既有项目中使用

三种方式(在线文档「指南 → 快速上手」有完整接线步骤):

```bash
# ① 模板起步(推荐):克隆本仓库,apps/template 即完整应用骨架
git clone https://github.com/luoxueyousheng/Fluent.git

# ② npm pack:构建 dist 后打包安装到你的项目(publishConfig 自动指向 dist + d.ts)
npm run build:lib
npm pack -w @fluent-react/ui -w @fluent-react/bridge
npm i ../Fluent/fluent-react-ui-0.1.0.tgz ../Fluent/fluent-react-bridge-0.1.0.tgz

# ③ 源码引用:把 packages/ 拷进你的 monorepo workspaces(Tailwind 需 @source 扫描 ui 源码)
```

接线要点:`FluentProvider` 包应用最外层;引 `@fluent-react/ui/theme.css`;浏览器开发引 `@fluent-react/bridge/mock`;Tailwind v4 在 css 里 `@source` 指向 ui 包源码。

## 组件总览

| 分组 | 组件 |
| --- | --- |
| 通用 | Button · ToggleButton · Icon |
| 输入 | Checkbox(Group / 卡片)· Radio(Group / 卡片)· Switch(Group / 卡片)· Slider / RangeSlider · NumberBox · Rating · ColorPicker · Upload(Dragger) |
| 文本 | TextBox / TextArea · PasswordBox · Field · SearchBox · AutoSuggest · Form(Form.Item / rules) |
| 选择 | ComboBox · MultiSelect · ListBox · Dropdown(DropDownButton / ContextMenuArea / MenuList)· Tree |
| 日期时间 | Calendar · DatePicker · RangePicker · TimePicker |
| 导航 | SelectorBar · Tabs · TabView · CommandBar · MenuBar · Breadcrumb · Steps · Pagination |
| 集合 | Table(行选择 / 斑马纹 / loading / 空态)· DataGrid |
| 展示 | Card · Expander · Splitter · SettingsCard · Image · Carousel · Tag · Badge · Avatar · Divider · Empty · Skeleton · Timeline |
| 反馈 | Toast · Modal · Drawer · Tooltip · Popover · TeachingTip · InfoBar · Spin · Progress(Bar / Ring) |
| 外壳 | TitleBar · NavView · FluentProvider(useToast / useConfirm)· LogPane |

## 关键约定

- 状态切换只改 `<html>` 的 `data-*`(theme / backdrop / maximized / inactive / mock),CSS 负责表现
- mock / 无宿主时 bridge 置 `data-mock`,强制纯色底(浏览器没有真实 Mica,透明 body 会让暗色文字隐形)
- 宿主材质枚举与 Go 侧 `enums.go` 对齐(`mica` / `micaAlt` / `acrylic`,驼峰)
- 间距 4px 网格(`--spacing: 4px`);颜色 / 缓动 / 圆角一律用令牌,不写裸值
- 文档示例代码统一为完整可运行文件(import + 具名导出组件),样式用 Tailwind className

## 部署

`main` 分支推送后由 GitHub Actions 自动构建文档站并发布到 GitHub Pages(`.github/workflows/deploy-docs.yml`)。产物为纯静态文件,同样可直接走 JadeView 的 japk 打包分发。
