/* JadeView 宿主注入的 window.jade 与 PreloadJS 环境类型(仅 Windows 场景) */

export interface JadeEnv {
  os: string;
  arch: string;
  win11: boolean;
}

export interface JadeDialogAPI {
  showMessageBox(opts: {
    title?: string; message?: string; detail?: string;
    buttons?: string[]; defaultId?: number; cancelId?: number; type?: string;
  }): Promise<{ response: number }>;
  showErrorBox(title: string, content: string): void;
  showOpenDialog(opts?: { title?: string; properties?: string[] }): Promise<{ canceled: boolean; filePaths: string[] }>;
  showSaveDialog(opts?: { title?: string; defaultPath?: string }): Promise<{ canceled: boolean; filePath: string }>;
}

export interface JadeHost {
  invoke(channel: string, payload?: unknown, opts?: { timeout?: number }): Promise<unknown>;
  on(event: string, cb: (payload: unknown) => void): () => void;
  dialog?: JadeDialogAPI;
  setWindowBackdrop?(id: number, type: string): void;
  setWindowTheme?(id: number, theme: string): unknown;
  setWebviewZoom?(id: number, level: number): void;
  setWindowProgress?(id: number, progress: number, state: number): void;
  minimizeWindow?(): void;
  toggleMaximizeWindow?(): void;
  closeWindow?(): void;
  _isMock?: boolean;
}

declare global {
  interface Window {
    jade?: JadeHost;
    __JV_ENV?: Partial<JadeEnv>;
  }
}

/** Toast 契约(与 fluent-kit 一致;bridge 只定义类型,渲染交给 UI 层) */
export interface ToastPayload {
  level?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  id?: string;
  action?: { label: string; command: string };
}
