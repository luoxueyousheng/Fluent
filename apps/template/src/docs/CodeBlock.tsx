/* 示例代码块:等宽字体 + 复制按钮(HeroUI 文档页的 Code 区) */
import { useRef, useState } from 'react';
import { Icon } from '@fluent-react/ui';

export function CodeBlock({ code, standalone }: { code: string; standalone?: boolean }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className={standalone ? 'code-block standalone' : 'code-block'}>
      <button className="code-copy" aria-label="复制代码" title={copied ? '已复制' : '复制'} onClick={copy}>
        <Icon name={copied ? 'check' : 'copy'} size={13} strokeWidth={1.4} />
      </button>
      <pre><code>{code.trim()}</code></pre>
    </div>
  );
}
