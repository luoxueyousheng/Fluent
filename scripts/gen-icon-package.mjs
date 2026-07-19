/* 从清单生成 packages/icon/src/icons.tsx + catalog.ts */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'packages/icon/src');

/** [group, module-kebab, exportNames...] */
const GROUPS = [
  ['导航 / 外壳', 'home', ['HomeRegular', 'HomeFilled']],
  ['导航 / 外壳', 'settings', ['SettingsRegular', 'SettingsFilled']],
  ['导航 / 外壳', 'navigation', ['NavigationRegular', 'NavigationFilled']],
  ['导航 / 外壳', 'panel-left', ['PanelLeftRegular', 'PanelLeftFilled']],
  ['导航 / 外壳', 'apps', ['AppsRegular', 'AppsFilled']],
  ['导航 / 外壳', 'window', ['WindowRegular', 'WindowFilled']],
  ['导航 / 外壳', 'full-screen-maximize', ['FullScreenMaximizeRegular']],
  ['导航 / 外壳', 'full-screen-minimize', ['FullScreenMinimizeRegular']],

  ['动作', 'add', ['AddRegular', 'AddFilled']],
  ['动作', 'subtract', ['SubtractRegular', 'SubtractFilled']],
  ['动作', 'dismiss', ['DismissRegular', 'DismissFilled']],
  ['动作', 'checkmark', ['CheckmarkRegular', 'CheckmarkFilled']],
  ['动作', 'search', ['SearchRegular', 'SearchFilled']],
  ['动作', 'edit', ['EditRegular', 'EditFilled']],
  ['动作', 'delete', ['DeleteRegular', 'DeleteFilled']],
  ['动作', 'save', ['SaveRegular', 'SaveFilled']],
  ['动作', 'copy', ['CopyRegular', 'CopyFilled']],
  ['动作', 'cut', ['CutRegular', 'CutFilled']],
  ['动作', 'clipboard', ['ClipboardRegular', 'ClipboardFilled']],
  ['动作', 'share', ['ShareRegular', 'ShareFilled']],
  ['动作', 'filter', ['FilterRegular', 'FilterFilled']],
  ['动作', 'print', ['PrintRegular', 'PrintFilled']],
  ['动作', 'pin', ['PinRegular', 'PinFilled']],
  ['动作', 'link', ['LinkRegular', 'LinkFilled']],

  ['箭头 / 排序', 'chevron-down', ['ChevronDownRegular', 'ChevronDownFilled']],
  ['箭头 / 排序', 'chevron-up', ['ChevronUpRegular', 'ChevronUpFilled']],
  ['箭头 / 排序', 'chevron-left', ['ChevronLeftRegular', 'ChevronLeftFilled']],
  ['箭头 / 排序', 'chevron-right', ['ChevronRightRegular', 'ChevronRightFilled']],
  ['箭头 / 排序', 'arrow-left', ['ArrowLeftRegular', 'ArrowLeftFilled']],
  ['箭头 / 排序', 'arrow-up', ['ArrowUpRegular', 'ArrowUpFilled']],
  ['箭头 / 排序', 'arrow-down', ['ArrowDownRegular', 'ArrowDownFilled']],
  ['箭头 / 排序', 'arrow-sort', ['ArrowSortRegular', 'ArrowSortFilled']],
  ['箭头 / 排序', 'arrow-upload', ['ArrowUploadRegular', 'ArrowUploadFilled']],
  ['箭头 / 排序', 'arrow-download', ['ArrowDownloadRegular', 'ArrowDownloadFilled']],
  ['箭头 / 排序', 'arrow-sync', ['ArrowSyncRegular', 'ArrowSyncFilled']],
  ['箭头 / 排序', 'arrow-clockwise', ['ArrowClockwiseRegular', 'ArrowClockwiseFilled']],

  ['状态', 'info', ['InfoRegular', 'InfoFilled']],
  ['状态', 'checkmark-circle', ['CheckmarkCircleRegular', 'CheckmarkCircleFilled']],
  ['状态', 'warning', ['WarningRegular', 'WarningFilled']],
  ['状态', 'error-circle', ['ErrorCircleRegular', 'ErrorCircleFilled']],
  ['状态', 'question-circle', ['QuestionCircleRegular', 'QuestionCircleFilled']],
  ['状态', 'alert', ['AlertRegular', 'AlertFilled']],

  ['媒体 / 文件', 'image', ['ImageRegular', 'ImageFilled']],
  ['媒体 / 文件', 'document', ['DocumentRegular', 'DocumentFilled']],
  ['媒体 / 文件', 'folder', ['FolderRegular', 'FolderFilled']],
  ['媒体 / 文件', 'folder-open', ['FolderOpenRegular', 'FolderOpenFilled']],
  ['媒体 / 文件', 'eye', ['EyeRegular', 'EyeFilled']],
  ['媒体 / 文件', 'eye-off', ['EyeOffRegular', 'EyeOffFilled']],
  ['媒体 / 文件', 'zoom-in', ['ZoomInRegular', 'ZoomInFilled']],
  ['媒体 / 文件', 'zoom-out', ['ZoomOutRegular', 'ZoomOutFilled']],
  ['媒体 / 文件', 'play', ['PlayRegular', 'PlayFilled']],
  ['媒体 / 文件', 'pause', ['PauseRegular', 'PauseFilled']],

  ['界面', 'more-horizontal', ['MoreHorizontalRegular', 'MoreHorizontalFilled']],
  ['界面', 'options', ['OptionsRegular', 'OptionsFilled']],
  ['界面', 'calendar-ltr', ['CalendarLtrRegular', 'CalendarLtrFilled']],
  ['界面', 'grid', ['GridRegular', 'GridFilled']],
  ['界面', 'list', ['ListRegular', 'ListFilled']],
  ['界面', 'table', ['TableRegular', 'TableFilled']],
  ['界面', 'chat', ['ChatRegular', 'ChatFilled']],
  ['界面', 'mail', ['MailRegular', 'MailFilled']],
  ['界面', 'person', ['PersonRegular', 'PersonFilled']],
  ['界面', 'tag', ['TagRegular', 'TagFilled']],
  ['界面', 'bookmark', ['BookmarkRegular', 'BookmarkFilled']],
  ['界面', 'flag', ['FlagRegular', 'FlagFilled']],
  ['界面', 'star', ['StarRegular', 'StarFilled']],
  ['界面', 'heart', ['HeartRegular', 'HeartFilled']],
  ['界面', 'lock-closed', ['LockClosedRegular', 'LockClosedFilled']],
  ['界面', 'color', ['ColorRegular', 'ColorFilled']],
  ['界面', 'paint-brush', ['PaintBrushRegular', 'PaintBrushFilled']],
  ['界面', 'text-font', ['TextFontRegular', 'TextFontFilled']],
  ['界面', 'keyboard', ['KeyboardRegular', 'KeyboardFilled']],
  ['界面', 'code', ['CodeRegular', 'CodeFilled']],
  ['界面', 'stack', ['StackRegular', 'StackFilled']],
  ['界面', 'compass-northwest', ['CompassNorthwestRegular', 'CompassNorthwestFilled']],
  ['界面', 'maximize', ['MaximizeRegular', 'MaximizeFilled']],
  ['界面', 'square-multiple', ['SquareMultipleRegular', 'SquareMultipleFilled']],
  ['界面', 'clock', ['ClockRegular', 'ClockFilled']],
  ['界面', 'history', ['HistoryRegular', 'HistoryFilled']],
  ['界面', 'globe', ['GlobeRegular', 'GlobeFilled']],
  ['界面', 'cloud', ['CloudRegular', 'CloudFilled']],
  ['界面', 'phone', ['PhoneRegular', 'PhoneFilled']],
  ['界面', 'desktop', ['DesktopRegular', 'DesktopFilled']],
  ['界面', 'weather-moon', ['WeatherMoonRegular', 'WeatherMoonFilled']],
  ['界面', 'weather-sunny', ['WeatherSunnyRegular', 'WeatherSunnyFilled']],
];

const importLines = [];
const wrapLines = [];
const catalogItems = [];
const seen = new Set();

for (const [group, mod, names] of GROUPS) {
  const aliases = names.map((n) => `${n} as ${n}Base`).join(', ');
  importLines.push(
    `import { ${aliases} } from '@fluentui/react-icons/headless/svg/${mod}';`,
  );
  for (const n of names) {
    if (seen.has(n)) throw new Error(`dup ${n}`);
    seen.add(n);
    wrapLines.push(`export const ${n} = wrapIcon(${n}Base, '${n}');`);
    catalogItems.push(`  { name: '${n}', group: '${group}', Component: ${n} },`);
  }
}

const iconsTsx = `/* 自动生成:node scripts/gen-icon-package.mjs —— 勿手改 */
import '@fluentui/react-icons/headless/styles.css';
import { wrapIcon } from './wrap';
${importLines.join('\n')}

${wrapLines.join('\n')}
`;

const catalogTs = `/* 自动生成:node scripts/gen-icon-package.mjs —— 勿手改 */
import type { FluentIcon } from './wrap';
${Array.from(seen).map((n) => `import { ${n} } from './icons';`).join('\n')}

export interface IconCatalogItem {
  name: string;
  group: string;
  Component: FluentIcon;
}

/** 本包 re-export 的全部图标(文档目录 / 复制名称用) */
export const iconCatalog: readonly IconCatalogItem[] = [
${catalogItems.join('\n')}
] as const;

export const iconGroups: readonly string[] = [
  ...new Set(iconCatalog.map((i) => i.group)),
];

export type IconExportName = (typeof iconCatalog)[number]['name'];
`;

const indexTs = `/* @fluent-jade/icon — Fluent System Icons
 * 与 @fluent-jade/ui 组件库分离:
 *   import { HomeRegular, SearchRegular } from '@fluent-jade/icon';
 *   <HomeRegular size={20} />
 * 硬性约定:禁止 emoji 当图标。完整目录见 iconCatalog / 官方 Icons Catalog。
 */
export type { IconProps, FluentIcon } from './wrap';
export { wrapIcon } from './wrap';
export * from './icons';
export { iconCatalog, iconGroups, type IconCatalogItem, type IconExportName } from './catalog';
`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'icons.tsx'), iconsTsx);
fs.writeFileSync(path.join(OUT, 'catalog.ts'), catalogTs);
fs.writeFileSync(path.join(OUT, 'index.ts'), indexTs);
console.log(`generated ${seen.size} icons`);
