import { useState } from 'react';
import { Button, Card, LogPane, ProgressBar, Reveal, useToast, type LogEntry } from '@fluent-react/ui';
import { inv, useJadeEvent } from '@fluent-react/bridge';

export function HomePage({ entries, clearLog }: { entries: LogEntry[]; clearLog: () => void }) {
  const toast = useToast();
  const [exportPct, setExportPct] = useState(0);
  useJadeEvent<{ task: string; percent: number }>('progress', (p) => {
    if (p.task === 'export') setExportPct(p.percent);
  });

  return (
    <>
      <h1 className="t-title">首页</h1>
      <p className="desc muted">Fluent 2 React 组件库演示,左侧导航按组件类型分类。</p>
      <div className="grid-3">
        {[['WinUI 动效', '进入减速、退出加速,≤333ms'],
          ['火山 Demo 外壳', '40px 标题栏 + 透明底导航'],
          ['antd 设计标准', '三层令牌 / API 惯例 / 重型组件换皮']].map(([t, d]) => (
          <Reveal key={t}>
            <Card className="stagger-item">
              <b>{t}</b>
              <p className="muted" style={{ margin: '8px 0 0' }}>{d}</p>
            </Card>
          </Reveal>
        ))}
      </div>
      <h2 className="t-subtitle" style={{ margin: '24px 0 12px' }}>后端通信</h2>
      <div className="row">
        <Button variant="accent" onClick={() => void inv('export_report', { rows: 200 })}>导出报表(进度推送)</Button>
        <Button onClick={() => void inv('risky_op')}>故意失败</Button>
        <Button onClick={async () => {
          const r = await inv('ping');
          if (r) toast({ level: 'info', title: 'ping', message: JSON.stringify(r) });
        }}>ping</Button>
      </div>
      <ProgressBar value={exportPct} className="mt-3" />
      <h2 className="t-subtitle" style={{ margin: '24px 0 12px' }}>IPC 日志</h2>
      <div className="row" style={{ marginBottom: 8 }}>
        <Button variant="subtle" onClick={clearLog}>清空</Button>
      </div>
      <LogPane entries={entries} />
    </>
  );
}
