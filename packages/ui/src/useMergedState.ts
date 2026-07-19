/* antd 惯例:受控(value)/非受控(defaultValue)双支持 */
import { useCallback, useRef, useState } from 'react';

export function useMergedState<T>(
  defaultValue: T,
  value: T | undefined,
  onChange?: (v: T) => void,
): [T, (v: T) => void] {
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const set = useCallback((v: T) => {
    if (!controlled) setInner(v);
    onChangeRef.current?.(v);
  }, [controlled]);
  return [current, set];
}
