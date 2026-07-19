/* ColorPicker — antd API 规范(value/defaultValue/onChange(hex)/showText/
 * presets/disabledAlpha),WinUI 形态:SV 面板 + 色相/透明度滑条 + Hex 输入。
 * 内部 HSV 状态保留色相(s/v=0 时不丢 hue);输出 #RRGGBB / #RRGGBBAA。 */
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { useFixedPlacement, useFlyout } from './Flyout';
import { useMergedState } from '../useMergedState';

interface HSV { h: number; s: number; v: number; a: number }

/* ---- 颜色换算 ---- */
const p2 = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();

function hsvToRgb({ h, s, v }: HSV): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5) * 255, f(3) * 255, f(1) * 255];
}
function hsvToHex(hsv: HSV, withAlpha: boolean): string {
  const [r, g, b] = hsvToRgb(hsv);
  return `#${p2(r)}${p2(g)}${p2(b)}${withAlpha && hsv.a < 1 ? p2(hsv.a * 255) : ''}`;
}
function hexToHsv(hex: string): HSV | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max, a: m[2] ? parseInt(m[2], 16) / 255 : 1 };
}

/** 指针拖动:按下即捕获,回调归一化坐标(0~1,已钳制);onEnd 在抬手时触发 */
function useDrag(onMove: (x: number, y: number) => void, onEnd?: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const handle = (e: ReactPointerEvent) => {
    const el = ref.current!;
    el.setPointerCapture(e.pointerId);
    const move = (ev: { clientX: number; clientY: number }) => {
      const r = el.getBoundingClientRect();
      onMove(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)),
             Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)));
    };
    move(e);
    const onPM = (ev: globalThis.PointerEvent) => move(ev);
    const onPU = () => {
      removeEventListener('pointermove', onPM);
      removeEventListener('pointerup', onPU);
      onEnd?.();
    };
    addEventListener('pointermove', onPM);
    addEventListener('pointerup', onPU);
  };
  return { ref, onPointerDown: handle };
}

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string) => void;
  /** 触发器旁显示 Hex 文本 */
  showText?: boolean;
  presets?: string[];
  disabledAlpha?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function ColorPicker({
  value: valueProp, defaultValue = '#0078D4', onChange,
  showText, presets, disabledAlpha, disabled, className, ...aria
}: ColorPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  // 浮层 portal 到 body:祖先 overflow:hidden 裁不到;popRef 参与外点判定
  const fly = useFlyout(rootRef, popRef);
  // 传 fly.isOpen(closing 期间为 true):关闭动画中继续定位,不闪跳(踩过「闪到底部」)
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen);
  const [hex, setHexMerged] = useMergedState(defaultValue, valueProp, onChange);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(defaultValue) ?? { h: 210, s: 1, v: 0.83, a: 1 });
  const [text, setText] = useState<string | null>(null);
  const hsvRef = useRef(hsv);
  hsvRef.current = hsv;

  const displayHex = hsvToHex(hsv, !disabledAlpha);   // 实时显示值(拖拽中也更新)

  /* 外部受控值变化 → 同步 HSV(与当前 HSV 等价时不动,保住 hue) */
  useEffect(() => {
    if (displayHex.toLowerCase() !== hex.toLowerCase()) {
      const p = hexToHsv(hex);
      if (p) setHsv(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex]);

  /* notify=false:仅更新视觉(拖拽过程);对外 onChange 在拖拽结束统一发一次 */
  const commit = (next: HSV, notify = true) => {
    setHsv(next);
    if (notify) setHexMerged(hsvToHex(next, !disabledAlpha));
    setText(null);
  };
  const notifyEnd = () => setHexMerged(hsvToHex(hsvRef.current, !disabledAlpha));

  const sv = useDrag((x, y) => commit({ ...hsv, s: x, v: 1 - y }, false), notifyEnd);
  const hue = useDrag((x) => commit({ ...hsv, h: x * 360 }, false), notifyEnd);
  const alpha = useDrag((x) => commit({ ...hsv, a: Math.round(x * 100) / 100 }, false), notifyEnd);

  const pureHue = hsvToHex({ h: hsv.h, s: 1, v: 1, a: 1 }, false);
  const solid = hsvToHex({ ...hsv, a: 1 }, false);

  return (
    <div ref={rootRef} className={cn('colorpicker', className)}>
      <button className={cn('cp-trigger', disabled && 'disabled')} disabled={disabled}
              aria-haspopup="dialog" aria-expanded={fly.isOpen}
              aria-label={aria['aria-label'] ?? '选择颜色'}
              onClick={fly.toggle}>
        <span className="cp-swatch"><i style={{ background: displayHex }} /></span>
        {showText && <span className="cp-text">{displayHex}</span>}
      </button>
      {fly.isOpen && createPortal(
        <div ref={popRef} className={cn('cp-pop', placement.cls, fly.closing && 'closing')}
             style={placement.style} role="dialog" aria-label="颜色选择面板">
          {/* 纯色相底 + 白/黑双覆盖层(标准 SV 面板写法) */}
          <div className="cp-sv" ref={sv.ref} onPointerDown={sv.onPointerDown}
               style={{
                 background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), ${pureHue}`,
                 backgroundClip: 'padding-box',   // 勿画到半透明边框下(四边漏色)
               }}>
            <span className="cp-knob" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: solid }} />
          </div>
          <div className="cp-slider cp-hue" ref={hue.ref} onPointerDown={hue.onPointerDown}>
            <span className="cp-knob" style={{ left: `${(hsv.h / 360) * 100}%`, top: '50%', background: pureHue }} />
          </div>
          {!disabledAlpha && (
            <div className="cp-slider cp-alpha" ref={alpha.ref} onPointerDown={alpha.onPointerDown}>
              <i className="cp-alpha-grad" style={{ background: `linear-gradient(to right, transparent, ${solid})` }} />
              <span className="cp-knob" style={{ left: `${hsv.a * 100}%`, top: '50%', background: displayHex }} />
            </div>
          )}
          <div className="cp-row">
            <input className="input sm cp-hex" value={text ?? displayHex} spellCheck={false}
                   aria-label="Hex 颜色值"
                   onChange={(e) => setText(e.target.value)}
                   onBlur={(e) => { const p = hexToHsv(e.target.value); if (p) commit(p); else setText(null); }}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       const p = hexToHsv((e.target as HTMLInputElement).value);
                       if (p) commit(p); else setText(null);
                     }
                   }} />
            {!disabledAlpha && <span className="cp-a">{Math.round(hsv.a * 100)}%</span>}
          </div>
          {presets && presets.length > 0 && (
            <div className="cp-presets" role="listbox" aria-label="预设颜色">
              {presets.map((c) => (
                <button key={c} className={cn('cp-preset', c.toLowerCase() === displayHex.toLowerCase() && 'selected')}
                        style={{ background: c }} aria-label={c}
                        onClick={() => { const p = hexToHsv(c); if (p) commit(p); }} />
              ))}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
