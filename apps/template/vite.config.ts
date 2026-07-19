import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 产物为纯静态 dist/,照常走 JadeView 的 japk 打包 / 协议服务 / 回环 HTTP 分发。
// 开发期注意:dev server 是 http://localhost,与 jade:// 不同源,IPC 会被跨域拦——
// 浏览器 + mock 开发,真机验收用 vite build 产物。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: { target: 'es2022' },
});
