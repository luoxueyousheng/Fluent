/* LogPane — 调试台日志面板(来自 JadeDemo):时间戳 + ok 绿色,自动滚底 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../cn';

export interface LogEntry { time: string; text: string; ok: boolean }

export function useLog(max = 500) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const log = useCallback((text: string, ok = false) => {
    setEntries((list) => {
      const next = [...list, { time: new Date().toLocaleTimeString(), text, ok }];
      return next.length > max ? next.slice(next.length - max) : next;
    });
  }, [max]);
  const clear = useCallback(() => setEntries([]), []);
  return { entries, log, clear };
}

export function LogPane({ entries, className }: { entries: LogEntry[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);
  return (
    <div ref={ref} className={cn('log', className)}>
      {entries.map((e, i) => (
        <div key={i}>
          <span className="t">[{e.time}]</span> <span className={e.ok ? 'ok' : ''}>{e.text}</span>
        </div>
      ))}
    </div>
  );
}
