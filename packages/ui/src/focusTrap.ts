/* useFocusTrap — 模态焦点陷阱:激活时把焦点移入容器(首个可聚焦元素,
 * 兜底容器自身),Tab/Shift+Tab 在容器内循环;失活时焦点还给触发元素。
 * Modal / Drawer / 确认框共用。 */
import { useEffect, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const prev = document.activeElement as HTMLElement | null;

    const focusables = () =>
      [...root.querySelectorAll<HTMLElement>(FOCUSABLE)]
        .filter((el) => el.offsetParent !== null || el === document.activeElement);

    // 焦点移入(渲染后一帧,等入场动画元素就位)
    const raf = requestAnimationFrame(() => {
      if (root.contains(document.activeElement)) return;
      (focusables()[0] ?? root).focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) { e.preventDefault(); root.focus(); return; }
      const first = els[0], last = els[els.length - 1];
      const cur = document.activeElement;
      if (e.shiftKey && (cur === first || !root.contains(cur))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (cur === last || !root.contains(cur))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey, true);
      prev?.focus?.();
    };
  }, [ref, active]);
}
