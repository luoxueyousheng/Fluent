/* antd 风命令式反馈 API:message / notification / modal。
 * 渲染仍走 FluentProvider 的 Toast/ContentDialog(WinUI 外观),这里只是接口层;
 * duration 单位为【秒】(antd 惯例),内部换算毫秒。Provider 未挂载时抛错提示。 */
import type { ConfirmOptions, ToastOptions, ToastPlacement } from './components/FluentProvider';

type ToastFn = (opts: ToastOptions) => void;
type ConfirmFn = (opts: ConfirmOptions) => Promise<number>;

let toastFn: ToastFn | null = null;
let confirmFn: ConfirmFn | null = null;

/** FluentProvider 挂载时调用(内部用) */
export function _bindImperative(t: ToastFn | null, c: ConfirmFn | null): void {
  toastFn = t; confirmFn = c;
}

function fire(level: NonNullable<ToastOptions['level']>, content: string, durationSec?: number, title?: string, placement?: ToastPlacement) {
  if (!toastFn) {
    // 未绑定时降级为警告:抛异常会炸掉调用方所在的整棵 React 树
    //(StrictMode 双跑期存在「已清理未重绑」窗口,踩过白屏)
    console.warn('[fluent-jade] message/notification 需要 <FluentProvider>(本次调用已忽略):', content);
    return;
  }
  toastFn({ level, message: content, title, placement, duration: durationSec != null ? durationSec * 1000 : undefined });
}

/** 轻提示(antd message 形态,WinUI Toast 渲染) */
export const message = {
  info: (content: string, duration?: number) => fire('info', content, duration),
  success: (content: string, duration?: number) => fire('success', content, duration),
  warning: (content: string, duration?: number) => fire('warning', content, duration),
  error: (content: string, duration?: number) => fire('error', content, duration),
};

/** 通知(带标题+描述) */
export interface NotificationConfig {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;          // 标题(antd 命名)
  description?: string;
  duration?: number;        // 秒
  placement?: ToastPlacement;
}
export const notification = {
  open: ({ type = 'info', message: title, description = '', duration, placement }: NotificationConfig) =>
    fire(type, description, duration, title, placement),
  info: (c: Omit<NotificationConfig, 'type'>) => notification.open({ ...c, type: 'info' }),
  success: (c: Omit<NotificationConfig, 'type'>) => notification.open({ ...c, type: 'success' }),
  warning: (c: Omit<NotificationConfig, 'type'>) => notification.open({ ...c, type: 'warning' }),
  error: (c: Omit<NotificationConfig, 'type'>) => notification.open({ ...c, type: 'error' }),
};

/** 确认框(antd Modal.confirm 形态,resolve 布尔) */
export interface ModalConfirmConfig {
  title: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}
export const modal = {
  confirm: async ({ title, content, okText = '确定', cancelText = '取消', danger }: ModalConfirmConfig): Promise<boolean> => {
    if (!confirmFn) {
      console.warn('[fluent-jade] modal.confirm 需要 <FluentProvider>(按取消处理):', title);
      return false;
    }
    return (await confirmFn({ title, message: content, buttons: [okText, cancelText], danger })) === 0;
  },
};
