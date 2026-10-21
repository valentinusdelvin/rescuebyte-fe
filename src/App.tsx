import { useState, useEffect, useCallback } from 'react';
import { CustomerHome } from './pages/CustomerHome';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { StoreProfile } from './pages/StoreProfile';
import { OrderHistory } from './pages/OrderHistory';
import { BuatDagangan } from './pages/BuatDagangan';
import { Daganganku } from './pages/Daganganku';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Toast } from './components/common/Toast';
import { BrandLoadingOverlay } from './components/common/BrandLoadingOverlay';
import { useBrandLoading } from './hooks/useBrandLoading';
import { ActiveViewId, OrderStatusTab } from './types';

/**
 * Root Application Component
 * Coordinates customer and seller views, URL hash navigation (#namapage-seller),
 * global toasts, and brand transitions.
 * Complies with .agents/docs/architecture.md and .agents/docs/typescript.md.
 */
export function App() {
  const { isLoading, loadingTitle, loadingSubtitle, triggerLoading } = useBrandLoading();

  const [activeView, setActiveView] = useState<ActiveViewId>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.startsWith('#beranda-seller') || hash === '#beranda') return 'view-beranda';
    if (hash.startsWith('#profil-seller') || hash.startsWith('#profil')) return 'view-profil';
    if (hash.startsWith('#riwayat-seller') || hash.startsWith('#riwayat')) return 'view-riwayat';
    if (hash.startsWith('#buat-dagangan-seller') || hash.startsWith('#buat-dagangan')) return 'view-buat-dagangan';
    if (hash.startsWith('#daganganku-seller') || hash.startsWith('#daganganku')) return 'view-daganganku';
    // Default to Customer Landing Page
    return 'view-customer-home';
  });

  const [orderTab, setOrderTab] = useState<OrderStatusTab>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('tab=')) {
      const match = hash.match(/tab=([a-z]+)/);
      if (match && ['diproses', 'konfirmasi', 'selesai', 'habis', 'kendala', 'batal'].includes(match[1])) {
        return match[1] as OrderStatusTab;
      }
    }
    return 'diproses';
  });

  const [activeLabel, setActiveLabel] = useState<string>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.startsWith('#profil-seller') || hash.startsWith('#profil')) return 'Profil Toko';
    if (hash.startsWith('#riwayat-seller') || hash.startsWith('#riwayat')) return 'Riwayat Pesanan';
    if (hash.startsWith('#buat-dagangan-seller') || hash.startsWith('#buat-dagangan')) return 'Buat Dagangan';
    if (hash.startsWith('#daganganku-seller') || hash.startsWith('#daganganku')) return 'Daganganku';
    if (hash.startsWith('#beranda-seller') || hash === '#beranda') return 'Beranda Toko';
    return 'Beranda Pelanggan';
  });

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
  const handleNavigate = (viewId: string, label: string = '', tab?: OrderStatusTab) => {
    setActiveView(viewId);
    if (label) setActiveLabel(label);
    if (tab) setOrderTab(tab);

    if (viewId === 'view-customer-home') {
      window.history.replaceState(null, '', '#beranda-customer');
    } else if (viewId === 'view-beranda') {
      window.history.replaceState(null, '', '#beranda-seller');
    } else if (viewId === 'view-profil') {
      window.history.replaceState(null, '', '#profil-seller');
    } else if (viewId === 'view-riwayat') {
      window.history.replaceState(null, '', tab ? `#riwayat-seller?tab=${tab}` : '#riwayat-seller');
    } else if (viewId === 'view-buat-dagangan') {
      window.history.replaceState(null, '', '#buat-dagangan-seller');
    } else if (viewId === 'view-daganganku') {
      window.history.replaceState(null, '', '#daganganku-seller');
    }

    setIsMobileOpen(false);
  };

  // Sync with browser back/forward hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#beranda-seller') || hash === '#beranda') {
        setActiveView('view-beranda');
        setActiveLabel('Beranda Toko');
      } else if (hash.startsWith('#profil-seller') || hash.startsWith('#profil')) {
        setActiveView('view-profil');
        setActiveLabel('Profil Toko');
      } else if (hash.startsWith('#riwayat-seller') || hash.startsWith('#riwayat')) {
        setActiveView('view-riwayat');
        setActiveLabel('Riwayat Pesanan');
        const match = hash.match(/tab=([a-z]+)/);
        if (match && ['diproses', 'konfirmasi', 'selesai', 'habis', 'kendala', 'batal'].includes(match[1])) {
          setOrderTab(match[1] as OrderStatusTab);
        }
      } else if (hash.startsWith('#buat-dagangan-seller') || hash.startsWith('#buat-dagangan')) {
        setActiveView('view-buat-dagangan');
        setActiveLabel('Buat Dagangan');
      } else if (hash.startsWith('#daganganku-seller') || hash.startsWith('#daganganku')) {
        setActiveView('view-daganganku');
        setActiveLabel('Daganganku');
      } else {
        // Customer view for #beranda-customer, #customer, #marketplace, or empty hash
        setActiveView('view-customer-home');
        setActiveLabel('Beranda Pelanggan');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <>
      {/* 1. Customer View: Full page landing */}
      {activeView === 'view-customer-home' ? (
        <CustomerHome
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onShowToast={showToast}
        />
      ) : (
        /* 2. Merchant / Seller View: Portal Layout */
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
              {activeView === 'view-beranda' && (
                <Dashboard
                  onShowToast={showToast}
                  onNavigateToOrders={(tabId) => handleNavigate('view-riwayat', 'Riwayat Pesanan', tabId)}
                />
              )}
              {activeView === 'view-profil' && (
                <StoreProfile
                  storeName={storeName}
                  onStoreNameChange={setStoreName}
                  onShowToast={showToast}
                  onTriggerLoading={triggerLoading}
                />
              )}
              {activeView === 'view-riwayat' && (
                <OrderHistory
                  key={orderTab}
                  initialTab={orderTab}
                  onShowToast={showToast}
                />
              )}
              {activeView === 'view-buat-dagangan' && (
                <BuatDagangan
                  onShowToast={showToast}
                  onNavigateToProducts={() => handleNavigate('view-daganganku', 'Daganganku')}
                  onTriggerLoading={triggerLoading}
                />
              )}
              {activeView === 'view-daganganku' && (
                <Daganganku
                  onShowToast={showToast}
                  onNavigateToCreate={() => handleNavigate('view-buat-dagangan', 'Buat Dagangan')}
                  onTriggerLoading={triggerLoading}
                />
              )}
              {activeView !== 'view-beranda' &&
                activeView !== 'view-profil' &&
                activeView !== 'view-riwayat' &&
                activeView !== 'view-buat-dagangan' &&
                activeView !== 'view-daganganku' && (
                  <PlaceholderPage
                    title={activeLabel}
                    onBackToBeranda={() => handleNavigate('view-beranda', 'Beranda Toko')}
                  />
                )}
            </main>
          </div>
        </>
      )}

      {/* Global Toast & Loading Overlay */}
      <Toast message={toastMessage} isVisible={isToastVisible} />
      <BrandLoadingOverlay
        isVisible={isLoading}
        title={loadingTitle}
        subtitle={loadingSubtitle}
      />
    </>
  );
}

export default App;
