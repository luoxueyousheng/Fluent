/* 组件文档页 — HeroUI v2 文档页结构:
 * 标题/描述 → 引入 → 用法各小节(活演示 + 可展开示例代码)→ API(Props / Events 表) */
import { useState } from 'react';
import { CodeRegular } from '@fluent-jade/icon';
import type { ApiRow, DocDef, DocSection } from './types';
import { CodeBlock } from './CodeBlock';

function Example({ section }: { section: DocSection }) {
  const [showCode, setShowCode] = useState(false);
  return (
    <section className="doc-section">
      <h2>{section.title}</h2>
      {section.description && <p className="doc-p">{section.description}</p>}
      <div className="doc-example">
        <div className="doc-demo">{section.demo}</div>
        <div className="doc-codebar">
          <button className="doc-codetoggle" aria-expanded={showCode} onClick={() => setShowCode(!showCode)}>
            <CodeRegular size={13} />
            {showCode ? '隐藏代码' : '显示代码'}
          </button>
        </div>
        {showCode && <CodeBlock code={section.code} />}
      </div>
    </section>
  );
}

function ApiTable({ title, rows, kind }: { title: string; rows: ApiRow[]; kind: 'props' | 'events' }) {
  return (
    <>
      <h3>{title}</h3>
      <div className="api-scroll">
        <table className="api-table">
          <thead>
            <tr>
              <th>{kind === 'props' ? '属性' : '事件'}</th>
              <th>类型</th>
              {kind === 'props' && <th>默认值</th>}
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td><code className="api-name">{r.name}</code></td>
                <td><code className="api-type">{r.type}</code></td>
                {kind === 'props' && <td>{r.default ? <code className="api-def">{r.default}</code> : <span className="api-none">—</span>}</td>}
                <td>{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function DocPage({ doc }: { doc: DocDef }) {
  return (
    <article className="doc">
      <header className="doc-head">
        <h1 className="doc-title">{doc.name}<span className="doc-cn">{doc.cn}</span></h1>
        <p className="doc-desc">{doc.description}</p>
      </header>

      <section className="doc-section">
        <h2>引入</h2>
        <CodeBlock code={doc.importCode} standalone />
      </section>

      {doc.sections.map((s) => <Example key={s.title} section={s} />)}

      {(doc.props.length > 0 || (doc.events?.length ?? 0) > 0 || (doc.extraApis?.length ?? 0) > 0) && (
        <section className="doc-section">
          <h2>API</h2>
          {doc.props.length > 0 && <ApiTable title={`${doc.name} Props`} rows={doc.props} kind="props" />}
          {doc.events && doc.events.length > 0 && <ApiTable title={`${doc.name} Events`} rows={doc.events} kind="events" />}
          {doc.extraApis?.map((g) => <ApiTable key={g.title} title={g.title} rows={g.rows} kind={g.kind ?? 'props'} />)}
        </section>
      )}
    </article>
  );
}
