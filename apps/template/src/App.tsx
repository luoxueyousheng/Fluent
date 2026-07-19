import { useEffect, useRef, useState } from 'react';
import { AppShell, useLog, useToast, type NavEntry } from '@fluent-jade/ui';
import { HomeRegular, SettingsRegular } from '@fluent-jade/icon';
import { ready, configure, useJadeEvent, hasJade, type ToastPayload } from '@fluent-jade/bridge';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { DocPage } from './docs/DocPage';
import { docByKey, docGroups } from './docs/registry';

/* 左侧导航:细分到每个组件(分组标题 + 组件项),文档注册表驱动;
 * 组件检索走首页画廊(预览卡片 + 搜索) */
const NAV: NavEntry[] = [
  { key: 'home', label: '首页', icon: <HomeRegular /> },
  ...docGroups.flatMap((g): NavEntry[] => [
    { header: g.title },
    ...g.items.map((d) => ({ key: d.key, label: [d.cn, d.name].filter(Boolean).join(' ') })),
  ]),
  { key: 'settings', label: '设置', icon: <SettingsRegular />, bottom: true },
];

/* hash 路由:#/modal 直达组件页(可分享/刷新保持);无效键回落首页 */
const keyFromHash = (): string => {
  const k = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  return k && (docByKey.has(k) || k === 'home' || k === 'settings') ? k : 'home';
};

export function App() {
  const toast = useToast();
  const { entries, log, clear } = useLog();
  const [page, setPage] = useState(keyFromHash);
  const [collapsed, setCollapsed] = useState(false);
  const [booted, setBooted] = useState(false);
  const [hasBackdrop, setHasBackdrop] = useState(true);

  /* ---- 启动:auto 入口已完成 init(含默认 Mica),这里只接回调与取结果 ---- */
  const bootRef = useRef(false);
  useEffect(() => {
    if (bootRef.current) return;   // StrictMode 双跑保护
    bootRef.current = true;
    configure({
      onError: (channel, err) => toast({ level: 'error', title: `${channel} 失败`, message: String((err as Error)?.message ?? err) }),
      onLog: (text, ok) => log(text, ok),
    });
    void ready().then((r) => {
      setHasBackdrop(r.hasBackdrop);
      setBooted(true);
      toast({ level: 'success', title: '已就绪', message: r.hasJade ? 'IPC 通道已连通。' : '独立预览(mock 宿主)。' });
    });
  }, [toast, log]);

  useJadeEvent<ToastPayload>('toast', (p) => toast(p));

  /* 路由:hash 为真源(浏览器前进/后退经 hashchange 回灌);
     标题栏返回键走独立历史栈,不与浏览器历史双写 */
  const [hist, setHist] = useState<string[]>([]);
  useEffect(() => {
    const onHash = () => setPage(keyFromHash());
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  const navigate = (k: string) => {
    if (k === page) return;
    setHist((h) => [...h, page]);
    location.hash = `#/${k}`;
  };
  const goBack = () => {
    setHist((h) => {
      if (!h.length) return h;
      location.hash = `#/${h[h.length - 1]}`;
      return h.slice(0, -1);
    });
  };

  const doc = docByKey.get(page);
  const onHost = booted && hasJade && !window.jade?._isMock;

  /* AppShell 多页模式:标题栏(返回 + 汉堡)+ 侧导航 + 内容区一体;
     真机 title-overlay 由宿主画控制钮,浏览器预览不渲染不预留 */
  return (
    <AppShell mode="multi"
              appName="Fluent UI × JadeView"
              sub={booted ? (onHost ? 'JadeView 宿主' : '独立预览(mock)') : '启动中…'}
              controls={onHost ? 'host' : 'none'}
              onBack={goBack} backDisabled={hist.length === 0}
              items={NAV} value={page} onChange={navigate}
              collapsed={collapsed} onCollapsedChange={setCollapsed}>
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
    </AppShell>
  );
}
