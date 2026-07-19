/* 示例代码块:等宽字体 + 精简 TSX 高亮 + 复制按钮 */
import { useMemo, useRef, useState } from 'react';
import { CheckmarkRegular, CopyRegular } from '@fluent-jade/icon';
import { highlightTsx } from './highlight';

export function CodeBlock({ code, standalone }: { code: string; standalone?: boolean }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const src = code.trim();
  const nodes = useMemo(() => highlightTsx(src), [src]);

  const copy = () => {
    void navigator.clipboard?.writeText(src).then(() => {
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className={standalone ? 'code-block standalone' : 'code-block'}>
      <button className="code-copy" aria-label="复制代码" title={copied ? '已复制' : '复制'} onClick={copy}>
        {copied ? <CheckmarkRegular size={13} /> : <CopyRegular size={13} />}
      </button>
      <pre><code className="language-tsx">{nodes}</code></pre>
    </div>
  );
}
