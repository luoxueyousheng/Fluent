/* @fluent-react/icon — Fluent System Icons
 * 与 @fluent-react/ui 组件库分离:
 *   import { HomeRegular, SearchRegular } from '@fluent-react/icon';
 *   <HomeRegular size={20} color="currentColor" />
 * 硬性约定:禁止 emoji 当图标。完整目录见 iconCatalog / 官方 Icons Catalog。
 */
export type { IconProps, FluentIcon } from './wrap';
export { wrapIcon } from './wrap';
export * from './icons';
export { iconCatalog, iconGroups, type IconCatalogItem, type IconExportName } from './catalog';
