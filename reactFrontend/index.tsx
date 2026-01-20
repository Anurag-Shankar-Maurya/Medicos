/**
 * @project Medicos Dashboard
 * @author Anurag Shankar Maurya
 * @copyright © 2026 Anurag Shankar Maurya. All rights reserved.
 * @license Proprietary - No unauthorized copying or distribution.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Copyright Tracking & Diagnostic Banner
console.log(
  `%cMedicos Dashboard %cv1.0.0\n%c© 2026 Anurag Shankar Maurya. All rights reserved.\n%cProprietary Software - Unauthorized access is tracked.`,
  'color: #0ea5e9; font-size: 20px; font-weight: bold;',
  'color: #006aff; font-size: 14px;',
  'color: #00ff22; font-size: 12px;',
  'color: #ef4444; font-size: 10px; font-style: italic;'
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);