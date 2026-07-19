import '@fluent-react/bridge/mock';   // 浏览器模拟宿主(真机自动让位)
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
