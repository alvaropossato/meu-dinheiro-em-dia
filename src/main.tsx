import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Registra o Service Worker do PWA para cache e funcionamento offline
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] Nova versão disponível');
  },
  onOfflineReady() {
    console.log('[PWA] Aplicativo pronto para uso offline');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
