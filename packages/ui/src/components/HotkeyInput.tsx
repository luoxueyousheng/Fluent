/* HotkeyInput — 快捷键录入(监听键盘组合并记录)。
 * 点击后等待按键组合(Ctrl/Alt/Shift/Meta + 任意键),捕获后显示并回调。
 * antd 风 API:value/onChange 受控;clearable 可清除。 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../cn';
import { useMergedState } from '../useMergedState';
import {
  DismissRegular,
} from '@fluent-jade/icon';

function formatKey(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  const key = e.key;
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    parts.push(key.length === 1 ? key.toUpperCase() : key);
  }
  return parts.join(' + ');
}

export interface HotkeyInputProps {
  /** 快捷键值(受控) */
  value?: string;
  /** 默认值 */
  defaultValue?: string;
  /** 变化回调 */
  onChange?: (hotkey: string) => void;
  /** 占位符 */
  placeholder?: string;
  /** 是否可清除 */
  clearable?: boolean;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
  className?: string;
}

export function HotkeyInput({
  value: valueProp, defaultValue, onChange, placeholder = '点击录入快捷键…', clearable = true, size, disabled, className,
}: HotkeyInputProps) {
  const [value, setValue] = useMergedState(defaultValue ?? '', valueProp);
  const [recording, setRecording] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const stopRecord = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const hk = formatKey(e);
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
    setRecording(false);
    setValue(hk);
    onChange?.(hk);
  }, [setValue, onChange]);

  useEffect(() => {
    if (!recording) return;
    addEventListener('keydown', stopRecord, true);
    return () => removeEventListener('keydown', stopRecord, true);
  }, [recording, stopRecord]);

  const startRecord = () => {
    if (disabled) return;
    setRecording(true);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue('');
    onChange?.('');
  };

  return (
    <div
      ref={inputRef}
      className={cn('hotkey-input', recording && 'hotkey-recording', size === 'small' && 'hotkey-sm', size === 'large' && 'hotkey-lg', disabled && 'disabled', className)}
      onClick={startRecord}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={value || placeholder}
    >
      {recording ? (
        <span className="hotkey-placeholder">请按键组合…</span>
      ) : value ? (
        <span className="hotkey-value">{value}</span>
      ) : (
        <span className="hotkey-placeholder">{placeholder}</span>
      )}
      {clearable && value && !recording && !disabled && (
        <span className="hotkey-clear" onClick={clear}><DismissRegular size={12} /></span>
      )}
    </div>
  );
}
