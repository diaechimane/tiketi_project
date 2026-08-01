import React from 'react';
import ReactDOM from 'react-dom/client';
import TIKETI from './TIKETI_MVP';
import { AuthProvider } from './TIKETI_Auth';
import { NotifProvider } from './TIKETI_Notifications';
import { OfflineBanner, registerSW } from './TIKETI_PWA';

// Enregistrement du Service Worker (PWA)
registerSW();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <NotifProvider>
        <OfflineBanner />
        <TIKETI />
      </NotifProvider>
    </AuthProvider>
  </React.StrictMode>
);
