/* 首页 = 组件画廊:全部组件的预览卡片墙(迷你实时预览 + 名称 + 一句描述),
 * 点击卡片进入对应文档页;顶部搜索框过滤卡片。宿主通信演示收进底部 Expander。 */
import { useMemo, useState } from 'react';
import {
  Button,
  Divider,
  Expander,
  LogPane,
  ProgressBar,
  SearchBox,
  useToast,
  type LogEntry,
} from '@fluent-react/ui';
import { inv, useJadeEvent } from '@fluent-react/bridge';
import { docGroups } from '../docs/registry';


export function HomePage({ entries, clearLog, onOpen }: {
  entries: LogEntry[];
  clearLog: () => void;
  /** 点击卡片打开对应组件文档页 */
  onOpen: (key: string) => void;
}) {
  const toast = useToast();
  const [exportPct, setExportPct] = useState(0);
  useJadeEvent<{ task: string; percent: number }>('progress', (p) => {
    if (p.task === 'export') setExportPct(p.percent);
  });

  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const componentGroups = useMemo(() => docGroups.filter((g) => !g.guide), []);
  const groups = useMemo(
    () => componentGroups
      .map((g) => ({
        title: g.title,
        items: q
          ? g.items.filter((d) =>
              d.name.toLowerCase().includes(q) || d.cn.includes(query.trim()) || d.key.includes(q))
          : g.items,
      }))
      .filter((g) => g.items.length > 0),
    [componentGroups, q, query],
  );
  const total = componentGroups.reduce((n, g) => n + g.items.length, 0);
  const shown = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <h1 className="t-title">Fluent 组件库</h1>
      <p className="desc muted">
        {total} 个组件 · WinUI 3 视觉与动效 · antd API 惯例 · 点击卡片查看用法与 API
      </p>
      <div className="gallery-search">
        <SearchBox value={query} onChange={setQuery} placeholder="搜索组件(名称 / 拼写)" />
        {q && <span className="gallery-count">{shown} / {total}</span>}
      </div>

      {groups.length === 0 && <p className="muted" style={{ marginTop: 24 }}>没有匹配「{query.trim()}」的组件。</p>}

      {groups.map((g) => (
        <section key={g.title} className="gallery-group">
          <h2 className="gallery-title">{g.title}</h2>
          <div className="gallery-grid">
            {g.items.map((d) => (
              <div key={d.key} className="gallery-card" role="button" tabIndex={0}
                   aria-label={`打开 ${d.cn} ${d.name} 文档`}
                   onClick={() => onOpen(d.key)}
                   onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(d.key); } }}>
                {/* 迷你预览:居中展示单个标志性组件(取首个演示的第一个元素,其余 CSS 隐藏),不可交互 */}
                <div className="gc-preview" aria-hidden="true">
                  <div className="gc-fit">{d.sections[0]?.demo}</div>
                </div>
                <div className="gc-meta">
                  <span className="gc-name">{d.cn}<i>{d.name}</i></span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <Divider>宿主通信演示</Divider>
      <Expander summary="IPC 调用与日志(独立预览时由 mock 宿主响应)">
        <div className="row" style={{ marginBottom: 10 }}>
          <Button variant="accent" onClick={() => void inv('export_report', { rows: 200 })}>导出报表(进度推送)</Button>
          <Button onClick={() => void inv('risky_op')}>故意失败</Button>
          <Button onClick={async () => {
            const r = await inv('ping');
            if (r) toast({ level: 'info', title: 'ping', message: JSON.stringify(r) });
          }}>ping</Button>
          <Button variant="subtle" onClick={clearLog}>清空日志</Button>
        </div>
        <ProgressBar value={exportPct} className="mb-3" />
        <LogPane entries={entries} />
      </Expander>
    </>
  );
}
