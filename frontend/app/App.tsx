import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from './providers';
import { AppRouter } from './router';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AppRouter />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;