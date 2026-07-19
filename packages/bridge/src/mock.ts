/* ============================================================================
 * mock.ts — JadeView 宿主的浏览器模拟(side-effect 模块,真机自动让位)
 * import '@fluent-jade/bridge/mock' 即生效;内置模拟后端命令 + 主动推送,
 * 让前端脱离宿主在浏览器里全功能开发。信封契约与真机一致。
 * ========================================================================== */
/* eslint-disable @typescript-eslint/no-explicit-any */

if (typeof window !== 'undefined' && !window.jade) {
  console.info('[jade] 使用浏览器 mock 宿主(后端为模拟实现)');
  // 浏览器里没有真实 Mica/Acrylic:标记 mock,CSS 据此强制铺纯色底
  //(否则 data-backdrop=mica 的透明 body 在白画布上会让暗色文字全部隐形)
  document.documentElement.dataset.mock = '';

  const listeners = new Map<string, Set<(p: any) => void>>();
  const emit = (event: string, payload: any) => {
    listeners.get(event)?.forEach((fn) => {
      try { fn(payload); } catch (e) { console.error('[jade] listener error', e); }
    });
  };
  const push = (event: string, payload: any) => setTimeout(() => emit(event, payload), 0);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const store = {
    theme: 'System',
    config: { theme: 'System', accent: '#0078D4', autosave: true, zoom: 1.0 } as Record<string, any>,
    users: [
      { id: 1, name: '林婉清', role: '管理员', online: true },
      { id: 2, name: '赵子龙', role: '编辑', online: false },
      { id: 3, name: '周文轩', role: '访客', online: true },
    ],
  };

  /* 模拟后端命令(command -> async handler);抛 {code,message} 即错误信封 */
  const handlers: Record<string, (payload?: any) => Promise<any>> = {
    async ping() { return { pong: true, at: 'mock-backend' }; },
    async env() { return JSON.stringify({ os: 'windows', arch: 'amd64', win11: true }); },

    async 'read_config'({ key }: any = {}) {
      await sleep(120);
      return key ? { [key]: store.config[key] } : { ...store.config };
    },
    async 'write_config'({ patch }: any = {}) {
      await sleep(200);
      if (!patch || typeof patch !== 'object') throw { code: 'BAD_REQUEST', message: 'patch 必须是对象' };
      store.config = { ...store.config, ...patch };
      push('toast', { level: 'success', title: '已保存', message: '配置已写入磁盘。' });
      return { ...store.config };
    },

    async 'load_users'({ query }: any = {}) {
      await sleep(400);
      let list = store.users;
      if (query) list = list.filter((u) => u.name.includes(query) || u.role.includes(query));
      return { users: list, total: list.length };
    },
    async 'create_user'({ name, role }: any = {}) {
      await sleep(300);
      if (!name) throw { code: 'VALIDATION', message: '姓名不能为空' };
      const u = { id: Date.now() % 100000, name, role: role || '访客', online: false };
      store.users = [u, ...store.users];
      push('toast', { level: 'success', title: '已创建', message: `用户「${name}」已添加。`, id: 'user-op' });
      return { user: u };
    },
    async 'delete_user'({ id }: any = {}) {
      await sleep(250);
      const before = store.users.length;
      store.users = store.users.filter((u) => u.id !== id);
      if (store.users.length === before) throw { code: 'NOT_FOUND', message: `用户 ${id} 不存在` };
      return { deleted: id };
    },

    async 'export_report'({ rows = 100 }: any = {}) {
      for (let done = 0; done <= rows; done += Math.ceil(rows / 10)) {
        emit('progress', { task: 'export', percent: Math.min(100, Math.round((done / rows) * 100)) });
        await sleep(180);
      }
      push('toast', {
        level: 'success', title: '导出完成', message: `report.csv(${rows} 行)已保存。`,
        action: { label: '打开', command: 'open_file' },
      });
      return { file: 'report.csv', rows };
    },
    async 'open_file'() { await sleep(100); return { opened: true }; },
    async 'risky_op'() { await sleep(200); throw { code: 'UPLOAD_FAILED', message: '网络超时,请重试。' }; },

    async 'set-theme'({ mode }: any = {}) {
      store.theme = mode;
      const eff = mode === 'System' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light') : mode;
      push('theme-changed', { theme: eff });
      return { theme: mode, effective: eff };
    },
    async 'apply-titlebar'() { return 'ok'; },
    async 'set-backdrop'({ type }: any = {}) { console.log('[jade] set-backdrop', type); return 'ok'; },
  };

  const envelopeError = (id: string, error: { code: string; message: string }) => {
    const e = new Error(error.message) as any;
    e.code = error.code; e.id = id;
    e.envelope = { v: 1, id, type: 'response', ok: false, error };
    return e;
  };

  let seq = 0;
  window.jade = {
    invoke(command: string, payload: any = {}, opts: any = {}) {
      const id = `req-${++seq}`;
      const timeout = opts.timeout ?? 8000;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(envelopeError(id, { code: 'TIMEOUT', message: `命令 ${command} 超时` })), timeout);
        const h = handlers[command];
        if (!h) {
          clearTimeout(timer);
          return reject(envelopeError(id, { code: 'NO_HANDLER', message: `未知命令:${command}` }));
        }
        Promise.resolve().then(() => h(payload))
          .then((data) => { clearTimeout(timer); resolve(data); })
          .catch((err) => {
            clearTimeout(timer);
            const e = err && err.code ? err : { code: 'INTERNAL', message: String((err && err.message) || err) };
            reject(envelopeError(id, e));
          });
      });
    },

    on(event: string, cb: (p: any) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(cb);
      return () => { listeners.get(event)?.delete(cb); };
    },

    dialog: {
      showMessageBox: (o: any) => mockMessageBox(o),
      showErrorBox: (title: string, content: string) => { void mockMessageBox({ title, message: content, type: 'error', buttons: ['确定'] }); },
      showOpenDialog: async (o?: any) => { await sleep(150); return { canceled: false, filePaths: ['C:/Demo/' + (o?.title || 'file')] }; },
      showSaveDialog: async (o?: any) => { await sleep(150); return { canceled: false, filePath: 'C:/Demo/' + (o?.defaultPath || 'untitled') }; },
    },

    setWindowBackdrop(_id: number, type: string) { console.log('[jade] set_window_backdrop', type); },
    setWindowProgress(_id: number, p: number, state: number) { emit('progress', { task: 'window', percent: Math.round(p * 100), state }); },
    setWindowTheme(_id: number, theme: string) { return handlers['set-theme']({ mode: theme }); },
    setWebviewZoom(_id: number, level: number) { (document.documentElement.style as any).zoom = level; },
    minimizeWindow() { console.log('[jade] minimize_window'); },
    toggleMaximizeWindow() { document.documentElement.toggleAttribute('data-maximized'); },
    closeWindow() { console.log('[jade] close_window'); },

    _isMock: true,
  };

  /* 模拟系统消息框(复用 .smoke/.dialog 样式;真机为原生窗口) */
  function mockMessageBox(o: any = {}): Promise<{ response: number }> {
    return new Promise((resolve) => {
      const buttons: string[] = o.buttons?.length ? o.buttons : ['确定'];
      const host = document.createElement('div');
      host.className = 'smoke';
      host.innerHTML = `
        <div class="dialog" role="dialog" aria-modal="true">
          <h3 class="t-subtitle"></h3><p></p>
          <div class="actions"></div>
        </div>`;
      host.querySelector('h3')!.textContent = o.title || '';
      host.querySelector('p')!.innerHTML = '';
      const p = host.querySelector('p')!;
      p.append(o.message || '');
      if (o.detail) { p.append(document.createElement('br')); const s = document.createElement('span'); s.className = 'muted'; s.textContent = o.detail; p.append(s); }
      const actions = host.querySelector('.actions')!;
      buttons.forEach((label, i) => {
        const b = document.createElement('button');
        b.className = 'btn' + (i === (o.defaultId ?? 0) ? ' accent' : '');
        b.textContent = label;
        b.onclick = () => { host.classList.remove('open'); setTimeout(() => host.remove(), 200); resolve({ response: i }); };
        actions.appendChild(b);
      });
      document.body.appendChild(host);
      requestAnimationFrame(() => host.classList.add('open'));
      host.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') (actions.children[o.cancelId ?? buttons.length - 1] as HTMLButtonElement)?.click();
      });
    });
  }
} else if (typeof window !== 'undefined') {
  console.info('[jade] 真机宿主已注入,跳过 mock');
}

export {};
