import '@fluent-react/bridge/auto';   // 零配置:mock(真机自动让位)+ init + 默认 Mica
import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluent-react/ui';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluentProvider>
      <App />
    </FluentProvider>
  </StrictMode>,
);
