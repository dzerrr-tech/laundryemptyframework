import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Titik masuk aplikasi. Urutan pembungkus penting:
// BrowserRouter paling luar (supaya routing tersedia di mana saja),
// AuthProvider di dalamnya (supaya semua halaman bisa akses useAuth()).
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
