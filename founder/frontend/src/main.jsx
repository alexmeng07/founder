import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { DemoProjectsProvider } from './context/DemoProjectsContext';
import { DemoProfileProvider } from './context/DemoProfileContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DemoProjectsProvider>
          <DemoProfileProvider>
            <App />
          </DemoProfileProvider>
        </DemoProjectsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
