/* 精简 TSX/JS 语法高亮(零依赖)。
 * 覆盖:注释 / 字符串 / 模板串 / 关键字 / 类型名 / 数字 / JSX 标签 / 属性名。
 * 不做完整解析,够文档示例可读即可。 */
import type { ReactNode } from 'react';

const KEYWORDS = new Set([
  'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends',
  'false', 'finally', 'for', 'from', 'function', 'if', 'implements', 'import',
  'in', 'instanceof', 'interface', 'let', 'new', 'null', 'of', 'package',
  'private', 'protected', 'public', 'return', 'static', 'super', 'switch',
  'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'var', 'void',
  'while', 'with', 'yield', 'keyof', 'infer', 'readonly', 'satisfies', 'asserts',
]);

type Kind =
  | 'comment' | 'string' | 'template' | 'keyword' | 'type' | 'number'
  | 'tag' | 'attr' | 'punct' | 'plain';

interface Tok { kind: Kind; text: string }

function push(out: Tok[], kind: Kind, text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.kind === kind) last.text += text;
  else out.push({ kind, text });
}

/** 词法扫描(单遍);模板串内不递归插值高亮,整段标 template */
export function tokenizeTsx(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const n = src.length;

  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];

    // line comment
    if (c === '/' && c2 === '/') {
      let j = i + 2;
      while (j < n && src[j] !== '\n') j++;
      push(out, 'comment', src.slice(i, j));
      i = j;
      continue;
    }
    // block comment
    if (c === '/' && c2 === '*') {
      let j = i + 2;
      while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++;
      j = Math.min(n, j + 2);
      push(out, 'comment', src.slice(i, j));
      i = j;
      continue;
    }
    // string '
    if (c === "'" || c === '"') {
      const q = c;
      let j = i + 1;
      while (j < n) {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === q) { j++; break; }
        if (src[j] === '\n') break;
        j++;
      }
      push(out, 'string', src.slice(i, j));
      i = j;
      continue;
    }
    // template `
    if (c === '`') {
      let j = i + 1;
      while (j < n) {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '`') { j++; break; }
        j++;
      }
      push(out, 'template', src.slice(i, j));
      i = j;
      continue;
    }
    // number
    if ((c >= '0' && c <= '9') || (c === '.' && c2 >= '0' && c2 <= '9')) {
      let j = i + 1;
      while (j < n && /[0-9_a-fA-FxX.eE+-]/.test(src[j])) j++;
      push(out, 'number', src.slice(i, j));
      i = j;
      continue;
    }
    // identifier / keyword / type / jsx tag-ish
    if (/[A-Za-z_$]/.test(c)) {
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (KEYWORDS.has(word)) push(out, 'keyword', word);
      else if (/^[A-Z]/.test(word)) push(out, 'type', word); // Component / Type
      else {
        // attr name if followed by =
        let k = j;
        while (k < n && (src[k] === ' ' || src[k] === '\t')) k++;
        if (src[k] === '=') push(out, 'attr', word);
        else push(out, 'plain', word);
      }
      i = j;
      continue;
    }
    // JSX/TS punct & operators — group runs of non-word
    if (/[<>/=!&|?:;,.()[\]{}+*\-%^~]/.test(c)) {
      // tag open/close: <Identifier or </Identifier
      if (c === '<' && /[A-Za-z/]/.test(c2 ?? '')) {
        push(out, 'punct', '<');
        i++;
        if (src[i] === '/') { push(out, 'punct', '/'); i++; }
        if (/[A-Za-z]/.test(src[i] ?? '')) {
          let j = i + 1;
          while (j < n && /[A-Za-z0-9._-]/.test(src[j])) j++;
          push(out, 'tag', src.slice(i, j));
          i = j;
        }
        continue;
      }
      push(out, 'punct', c);
      i++;
      continue;
    }
    // whitespace & other
    let j = i + 1;
    while (j < n && !/[A-Za-z0-9_$'"`/<>=!&|?:;,.()[\]{}+*\-%^~]/.test(src[j]) && src[j] !== '/' ) {
      // stop before // or /*
      if (src[j] === '/' && (src[j + 1] === '/' || src[j + 1] === '*')) break;
      j++;
    }
    // single slash as plain if not comment
    if (j === i) { push(out, 'plain', c); i++; continue; }
    push(out, 'plain', src.slice(i, j));
    i = j;
  }
  return out;
}

export function highlightTsx(code: string): ReactNode[] {
  return tokenizeTsx(code).map((t, idx) =>
    t.kind === 'plain'
      ? t.text
      : <span key={idx} className={`tok-${t.kind}`}>{t.text}</span>,
  );
}
