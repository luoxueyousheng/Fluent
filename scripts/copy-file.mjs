/* 跨平台文件拷贝(库构建用):node scripts/copy-file.mjs <src> <dest> */
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [src, dest] = process.argv.slice(2);
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`copied ${src} -> ${dest}`);
