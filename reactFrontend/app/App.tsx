/**
 * @project Medicos Dashboard
 * @author Anurag Shankar Maurya
 * @copyright © 2026 Anurag Shankar Maurya. All rights reserved.
 * @license Proprietary - No unauthorized copying or distribution.
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from './providers';
import { AppRouter } from './router';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;