import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { ToastProvider, AuthProvider, CartProvider, LocationProvider } from './context';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <LocationProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </LocationProvider>
    </StrictMode>,
  );
}
