/* escStack — 全局 Esc 关闭栈。
 * 所有"打开期间响应 Esc"的浮层(Modal / Drawer / Image 预览 / TeachingTip / Tour /
 * FluentProvider 确认框)统一在此登记回调:唯一的 window keydown 监听只触发栈顶,
 * 叠层时按一次 Esc 只关最上面一层,不再一键全关。
 * (useFlyout 下拉类浮层是另一套独立 Esc 实现,不经过本栈,两体系并存。) */

type EscHandler = () => void;

const stack: EscHandler[] = [];
let listening = false;

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return;
  stack[stack.length - 1]?.();
}

/** 打开期间 push Esc 回调,返回退栈函数(关闭/卸载时调用,幂等) */
export function pushEsc(handler: EscHandler): () => void {
  stack.push(handler);
  if (!listening) {
    window.addEventListener('keydown', onKeydown);
    listening = true;
  }
  let popped = false;
  return () => {
    if (popped) return;
    popped = true;
    const i = stack.lastIndexOf(handler);
    if (i >= 0) stack.splice(i, 1);
    if (!stack.length && listening) {
      window.removeEventListener('keydown', onKeydown);
      listening = false;
    }
  };
}
