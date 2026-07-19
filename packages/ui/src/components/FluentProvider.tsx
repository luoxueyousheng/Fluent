/* FluentProvider — Toast + ContentDialog(confirm)上下文。
 * Toast 契约与 fluent-kit 一致:{level,title,message,duration,id,action}
 * 规则:同 id 去重重置计时;hover 暂停;error 不自动消失且 assertive;
 *       含 action 不自动消失;上限 5 条挤掉最旧。 */
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../focusTrap';
import { cn } from '../cn';
import { Icon } from './Icon';
import { Button } from './Button';
import { _bindImperative } from '../imperative';

export interface ToastOptions {
  level?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  id?: string;
  action?: { label: string; command?: string };
  onAction?: (command?: string) => void;
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  buttons?: string[];
  danger?: boolean;
  defaultId?: number;
}

interface Ctx {
  toast: (opts: ToastOptions) => void;
  confirm: (opts: ConfirmOptions) => Promise<number>;
}

const FluentCtx = createContext<Ctx | null>(null);

export function useToast(): Ctx['toast'] {
  const ctx = useContext(FluentCtx);
  if (!ctx) throw new Error('useToast 需在 <FluentProvider> 内使用');
  return ctx.toast;
}
export function useConfirm(): Ctx['confirm'] {
  const ctx = useContext(FluentCtx);
  if (!ctx) throw new Error('useConfirm 需在 <FluentProvider> 内使用');
  return ctx.confirm;
}

/* 默认 5 秒自动关闭(全等级统一);含 action 的仍常驻等待用户处理 */
const DEFAULT_DURATION = { info: 5000, success: 5000, warning: 5000, error: 5000 } as const;

interface ToastItem extends ToastOptions {
  key: number;
  level: NonNullable<ToastOptions['level']>;
  closing?: boolean;
}

interface ConfirmState extends Required<Pick<ConfirmOptions, 'title' | 'buttons' | 'defaultId'>> {
  message?: string; danger?: boolean; open: boolean;
  resolve: (i: number) => void;
}

let seq = 0;

export function FluentProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, { timer: number; remaining: number; started: number }>());
  const [dlg, setDlg] = useState<ConfirmState | null>(null);

  const dismiss = useCallback((key: number) => {
    const t = timers.current.get(key);
    if (t) { clearTimeout(t.timer); timers.current.delete(key); }
    setToasts((list) => list.map((x) => (x.key === key ? { ...x, closing: true } : x)));
    window.setTimeout(() => setToasts((list) => list.filter((x) => x.key !== key)), 200);
  }, []);

  const arm = useCallback((key: number, ms: number) => {
    if (ms <= 0) return;
    timers.current.set(key, {
      timer: window.setTimeout(() => dismiss(key), ms),
      remaining: ms, started: Date.now(),
    });
  }, [dismiss]);

  const toast = useCallback((opts: ToastOptions) => {
    const level = opts.level && ['info', 'success', 'warning', 'error'].includes(opts.level) ? opts.level : 'info';
    const key = ++seq;
    const duration = opts.duration != null ? opts.duration : (opts.action ? 0 : DEFAULT_DURATION[level]);
    setToasts((list) => {
      let next = list;
      if (opts.id) {
        const old = next.find((x) => x.id === opts.id);
        if (old) { const t = timers.current.get(old.key); if (t) clearTimeout(t.timer); next = next.filter((x) => x.id !== opts.id); }
      }
      if (next.length >= 5) {
        const oldest = next[0];
        const t = timers.current.get(oldest.key); if (t) clearTimeout(t.timer);
        next = next.slice(1);
      }
      return [...next, { ...opts, level, key }];
    });
    arm(key, duration);
  }, [arm]);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<number>((resolve) => {
      setDlg({
        title: opts.title, message: opts.message,
        buttons: opts.buttons ?? ['确定', '取消'],
        danger: opts.danger, defaultId: opts.defaultId ?? 0,
        open: false, resolve,
      });
      requestAnimationFrame(() => setDlg((d) => (d ? { ...d, open: true } : d)));
    });
  }, []);

  const finish = useCallback((i: number) => {
    setDlg((d) => {
      if (d) { d.resolve(i); }
      return d ? { ...d, open: false } : d;
    });
    window.setTimeout(() => setDlg(null), 220);
  }, []);

  const pause = (key: number) => {
    const t = timers.current.get(key);
    if (t) { clearTimeout(t.timer); t.remaining -= Date.now() - t.started; }
  };
  const resume = (key: number) => {
    const t = timers.current.get(key);
    if (t && t.remaining > 0) { t.started = Date.now(); t.timer = window.setTimeout(() => dismiss(key), t.remaining); }
  };

  const dlgRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dlgRef, !!dlg?.open);   // 确认框焦点陷阱

  const value = useMemo<Ctx>(() => ({ toast, confirm }), [toast, confirm]);

  // 命令式 API(message/notification/modal)绑定到本 Provider
  useEffect(() => {
    _bindImperative(toast, confirm);
    return () => _bindImperative(null, null);
  }, [toast, confirm]);

  return (
    <FluentCtx.Provider value={value}>
      {children}
      {createPortal(
        <div className="toast-host" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.key}
                 className={cn('toast', t.level, t.closing && 'toast-out')}
                 aria-live={t.level === 'error' ? 'assertive' : undefined}
                 onMouseEnter={() => pause(t.key)} onMouseLeave={() => resume(t.key)}>
              <Icon name={t.level} strokeWidth={1.6} />
              <div className="body">
                {t.title && <div className="title">{t.title}</div>}
                <div className="msg">{t.message}</div>
                {t.action && (
                  <div className="act">
                    <Button variant="subtle" style={{ height: 28 }}
                            onClick={() => { t.onAction?.(t.action!.command); dismiss(t.key); }}>
                      {t.action.label}
                    </Button>
                  </div>
                )}
              </div>
              <button className="close" aria-label="关闭" onClick={() => dismiss(t.key)}>
                <Icon name="close" size={12} strokeWidth={1.3} />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
      {dlg && createPortal(
        <div className={cn('smoke', dlg.open && 'open')}
             onMouseDown={(e) => { if (e.target === e.currentTarget) finish(dlg.buttons.length - 1); }}
             onKeyDown={(e) => { if (e.key === 'Escape') finish(dlg.buttons.length - 1); }}>
          <div ref={dlgRef} tabIndex={-1} className="dialog" role="dialog" aria-modal="true" aria-label={dlg.title}>
            <h3 className="t-subtitle">{dlg.title}</h3>
            <p>{dlg.message}</p>
            <div className="actions">
              {dlg.buttons.map((label, i) => (
                <Button key={i}
                        variant={i === 0 ? 'accent' : 'default'}
                        style={dlg.danger && i === 0 ? { background: 'var(--critical)' } : undefined}
                        autoFocus={i === dlg.defaultId}
                        onClick={() => finish(i)}>
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </FluentCtx.Provider>
  );
}
