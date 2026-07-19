import { useEffect, useRef, useState } from 'react';
import { Icon, NavView, TitleBar, useLog, useToast, type NavEntry } from '@fluent-react/ui';
import { init, configure, applyBackdrop, useJadeEvent, hasJade, type ToastPayload } from '@fluent-react/bridge';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { DocPage } from './docs/DocPage';
import { docByKey, docGroups } from './docs/registry';

/* 左侧导航:细分到每个组件(分组标题 + 组件项),文档注册表驱动;
 * 组件检索走首页画廊(预览卡片 + 搜索) */
const NAV: NavEntry[] = [
  { key: 'home', label: '首页', icon: <Icon name="home" /> },
  ...docGroups.flatMap((g): NavEntry[] => [
    { header: g.title },
    ...g.items.map((d) => ({ key: d.key, label: `${d.cn} ${d.name}` })),
  ]),
  { key: 'settings', label: '设置', icon: <Icon name="settings" strokeWidth={1.3} />, bottom: true },
];

export function App() {
  const toast = useToast();
  const { entries, log, clear } = useLog();
  const [page, setPage] = useState('home');
  const [collapsed, setCollapsed] = useState(false);
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

  /* 返回历史栈(WinUI 3 标题栏返回键) */
  const [hist, setHist] = useState<string[]>([]);
  const navigate = (k: string) => {
    if (k === page) return;
    setHist((h) => [...h, page]);
    setPage(k);
  };
  const goBack = () => {
    setHist((h) => {
      if (!h.length) return h;
      setPage(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  const doc = docByKey.get(page);
  const onHost = booted && hasJade && !window.jade?._isMock;

  return (
    <div className="app">
      {/* WinUI 3 标题栏:返回 + 汉堡在栏内;真机 title-overlay 由宿主画控制钮,
          浏览器预览不渲染不预留 */}
      <TitleBar appName="fluent-react 组件文档"
                sub={booted ? (onHost ? 'JadeView 宿主' : '独立预览(mock)') : '启动中…'}
                onBack={goBack} backDisabled={hist.length === 0}
                onMenu={() => setCollapsed(!collapsed)}
                controls={onHost ? 'host' : 'none'} />
      <div className="shell">
        <NavView items={NAV} value={page} onChange={navigate} collapsed={collapsed} />
        <main className="content">
          <div className="content-inner">
            {/* key=page:切换即重挂载,重放入场动效;仅渲染当前页 */}
            <section className="page active page-enter" key={page}>
              {page === 'home' ? (
                <HomePage entries={entries} clearLog={clear} onOpen={navigate} />
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
