import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { StoreProfile } from './pages/StoreProfile';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Toast } from './components/common/Toast';
import { ActiveViewId } from './types';

/**
 * Root Application Component
 * Coordinates state-based and URL hash navigation, layout, and global toast notifications.
 * Complies with .agents/docs/architecture.md and .agents/docs/typescript.md.
 */
export function App() {
  const [activeView, setActiveView] = useState<ActiveViewId>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#beranda') return 'view-beranda';
    if (hash === '#profil') return 'view-profil';
    return 'view-beranda';
  });

  const [activeLabel, setActiveLabel] = useState<string>('Beranda');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [storeName, setStoreName] = useState<string>(() => {
    try {
      return localStorage.getItem('rescuebyte_store_name') || 'Toko Reza';
    } catch {
      return 'Toko Reza';
    }
  });

  // Toast state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  const showToast = useCallback((message: string, duration: number = 3000) => {
    setToastMessage(message);
    setIsToastVisible(true);
    const timer = setTimeout(() => {
      setIsToastVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  // Sync hash on navigation
  const handleNavigate = (viewId: string, label: string = '') => {
    setActiveView(viewId);
    if (label) setActiveLabel(label);

    if (viewId === 'view-beranda') {
      window.history.replaceState(null, '', '#beranda');
    } else if (viewId === 'view-profil') {
      window.history.replaceState(null, '', '#profil');
    }

    setIsMobileOpen(false);
  };

  // Sync with browser back/forward hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#beranda') {
        setActiveView('view-beranda');
        setActiveLabel('Beranda');
      } else if (hash === '#profil') {
        setActiveView('view-profil');
        setActiveLabel('Profil Toko');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <>
      <Header
        storeName={storeName}
        onNavigate={(view) => handleNavigate(view)}
        onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
        onShowToast={showToast}
      />

      <div className="app-layout">
        <Sidebar
          activeView={activeView}
          storeName={storeName}
          isMobileOpen={isMobileOpen}
          onNavigate={(view, label) => handleNavigate(view, label)}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        <main className="app-main" id="main-content">
          {activeView === 'view-beranda' && <Dashboard onShowToast={showToast} />}
          {activeView === 'view-profil' && (
            <StoreProfile
              storeName={storeName}
              onStoreNameChange={setStoreName}
              onShowToast={showToast}
            />
          )}
          {activeView !== 'view-beranda' && activeView !== 'view-profil' && (
            <PlaceholderPage
              title={activeLabel}
              onBackToBeranda={() => handleNavigate('view-beranda', 'Beranda')}
            />
          )}
        </main>
      </div>

      <Toast message={toastMessage} isVisible={isToastVisible} />
    </>
  );
}

export default App;
