import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, NavView, SearchBox, TitleBar, useLog, useToast, type NavEntry } from '@fluent-react/ui';
import { init, configure, applyBackdrop, useJadeEvent, hasJade, type ToastPayload } from '@fluent-react/bridge';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { DocPage } from './docs/DocPage';
import { docByKey, docGroups } from './docs/registry';

/* 左侧导航:细分到每个组件(分组标题 + 组件项),文档注册表驱动;
 * query 命中组件英文名/中文名/key 即保留,空组隐藏 */
function buildNav(query: string): NavEntry[] {
  const q = query.trim().toLowerCase();
  const groups = docGroups.flatMap((g): NavEntry[] => {
    const hits = q
      ? g.items.filter((d) =>
          d.name.toLowerCase().includes(q) || d.cn.includes(query.trim()) || d.key.includes(q))
      : g.items;
    if (!hits.length) return [];
    return [{ header: g.title }, ...hits.map((d) => ({ key: d.key, label: `${d.cn} ${d.name}` }))];
  });
  if (q && groups.length === 0) groups.push({ header: '无匹配组件' });
  return [
    { key: 'home', label: '首页', icon: <Icon name="home" /> },
    ...groups,
    { key: 'settings', label: '设置', icon: <Icon name="settings" strokeWidth={1.3} />, bottom: true },
  ];
}

export function App() {
  const toast = useToast();
  const { entries, log, clear } = useLog();
  const [page, setPage] = useState('home');
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const nav = useMemo(() => buildNav(query), [query]);
  const [booted, setBooted] = useState(false);
  const [hasBackdrop, setHasBackdrop] = useState(true);

  /* ---- 启动:bridge 错误接 Toast,日志接首页 LogPane ---- */
  const bootRef = useRef(false);
  useEffect(() => {
    if (bootRef.current) return;   // StrictMode 双跑保护
    bootRef.current = true;
    configure({
      onError: (channel, err) => toast({ level: 'error', title: `${channel} 失败`, message: String((err as Error)?.message ?? err) }),
      onLog: (text, ok) => log(text, ok),
    });
    void init().then((r) => {
      setHasBackdrop(r.hasBackdrop);
      if (r.hasBackdrop) void applyBackdrop('mica');
      setBooted(true);
      toast({ level: 'success', title: '已就绪', message: r.hasJade ? 'IPC 通道已连通。' : '独立预览(mock 宿主)。' });
    });
  }, [toast, log]);

  useJadeEvent<ToastPayload>('toast', (p) => toast(p));

  const doc = docByKey.get(page);

  return (
    <div className="app">
      <TitleBar appName="fluent-react 组件文档"
                sub={booted ? (hasJade && !window.jade?._isMock ? 'JadeView 宿主' : '独立预览(mock)') : '启动中…'} />
      <div className="shell">
        <NavView items={nav} value={page} onChange={setPage}
                 collapsed={collapsed} onCollapsedChange={setCollapsed}
                 header={<SearchBox value={query} onChange={setQuery} size="small" placeholder="搜索组件" />} />
        <main className="content">
          <div className="content-inner">
            {/* key=page:切换即重挂载,重放入场动效;仅渲染当前页 */}
            <section className="page active page-enter" key={page}>
              {page === 'home' ? (
                <HomePage entries={entries} clearLog={clear} />
              ) : page === 'settings' ? (
                <SettingsPage hasBackdrop={hasBackdrop} />
              ) : doc ? (
                <DocPage doc={doc} />
              ) : null}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
