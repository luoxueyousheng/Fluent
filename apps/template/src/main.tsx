import '@fluent-jade/bridge/auto';   // 零配置:mock(真机自动让位)+ init + 默认 Mica
import '@fluent-jade/icon/styles';   // 图标基础样式(reset / RTL / HCM),独立入口以保证图标可 tree-shake
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluent-jade/ui';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluentProvider>
      <App />
    </FluentProvider>
  </StrictMode>,
);
