/* 文档注册表:分组 → 组件文档;导航与路由共用 */
import type { DocDef, DocGroup } from './types';
import { generalDocs } from './data/general';
import { inputDocs } from './data/input';
import { textDocs } from './data/text';
import { selectionDocs } from './data/selection';
import { datetimeDocs } from './data/datetime';
import { navigationDocs } from './data/navigation';
import { collectionDocs } from './data/collections';
import { displayDocs } from './data/display';
import { feedbackDocs } from './data/feedback';
import { shellDocs } from './data/shell';
import { guideDocs } from './data/guides';

export const docGroups: DocGroup[] = [
  { title: '指南', items: guideDocs, guide: true },
  { title: '通用', items: generalDocs },
  { title: '输入', items: inputDocs },
  { title: '文本与表单', items: textDocs },
  { title: '选择', items: selectionDocs },
  { title: '日期时间', items: datetimeDocs },
  { title: '导航', items: navigationDocs },
  { title: '集合', items: collectionDocs },
  { title: '展示', items: displayDocs },
  { title: '反馈', items: feedbackDocs },
  { title: '外壳', items: shellDocs },
];

export const docByKey: ReadonlyMap<string, DocDef> = new Map(
  docGroups.flatMap((g) => g.items).map((d) => [d.key, d]),
);
