import {trackPageView} from './traffic-tracker.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
async function start() {
  const ConsultingSite = (await import('./ConsultingSite')).default;
  ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><ConsultingSite /></React.StrictMode>);
}
trackPageView();
start();
