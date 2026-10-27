import { useState, useEffect, useCallback } from 'react';
import { CustomerHome } from './pages/CustomerHome';
import { CustomerMarketplace } from './pages/CustomerMarketplace';
import { CustomerProductDetail } from './pages/CustomerProductDetail';
import { CustomerCart } from './pages/CustomerCart';
import { CustomerCheckout } from './pages/CustomerCheckout';
import { CustomerAuth } from './pages/CustomerAuth';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { StoreProfile } from './pages/StoreProfile';
import { OrderHistory } from './pages/OrderHistory';
import { BuatDagangan } from './pages/BuatDagangan';
import { Daganganku } from './pages/Daganganku';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Toast, ToastType } from './components/common/Toast';
import { BrandLoadingOverlay } from './components/common/BrandLoadingOverlay';
import { useBrandLoading } from './hooks/useBrandLoading';
import { ActiveViewId, OrderStatusTab, CustomerMysteryBox, CheckoutPayload } from './types';
import { handleGoogleCallback, extractApiErrorMessage } from './services/authService';

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
    if (hash.startsWith('#detail-produk') || hash.startsWith('#detail') || hash.startsWith('#mystery-box-detail')) return 'view-customer-product-detail';
    if (hash.startsWith('#keranjang') || hash.startsWith('#cart')) return 'view-customer-cart';
    if (hash.startsWith('#checkout')) return 'view-customer-checkout';
    if (hash.startsWith('#marketplace')) return 'view-customer-marketplace';
    if (hash.startsWith('#masuk') || hash.startsWith('#daftar') || hash.startsWith('#auth') || hash.startsWith('#login')) return 'view-customer-auth';
    // Default to Customer Landing Page
    return 'view-customer-home';
  });

  const [selectedProduct, setSelectedProduct] = useState<CustomerMysteryBox | null>(null);
  const [checkoutPayload, setCheckoutPayload] = useState<CheckoutPayload | null>(null);

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
    if (hash.startsWith('#detail-produk') || hash.startsWith('#detail')) return 'Detail Produk';
    if (hash.startsWith('#keranjang') || hash.startsWith('#cart')) return 'Keranjang Saya';
    if (hash.startsWith('#checkout')) return 'Checkout';
    if (hash.startsWith('#marketplace')) return 'Marketplace';
    if (hash.startsWith('#masuk') || hash.startsWith('#daftar') || hash.startsWith('#auth') || hash.startsWith('#login')) return 'Masuk / Daftar';
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
  const [toastType, setToastType] = useState<ToastType>('success');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  const showToast = useCallback(
    (message: string, typeOrDuration?: ToastType | number, maybeDuration?: number) => {
      let type: ToastType = 'success';
      let duration = 3000;

      if (typeof typeOrDuration === 'string') {
        type = typeOrDuration;
        if (typeof maybeDuration === 'number') duration = maybeDuration;
      } else if (typeof typeOrDuration === 'number') {
        duration = typeOrDuration;
      }

      if (
        type === 'success' &&
        /(minimal|tidak cocok|gagal|harus|salah|belum|wajib|silakan isi|error|batal)/i.test(message)
      ) {
        type = 'error';
      }

      setToastMessage(message);
      setToastType(type);
      setIsToastVisible(true);
      const timer = setTimeout(() => {
        setIsToastVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    },
    []
  );

  // Handle Google OAuth2 callback query parameters if redirected back
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      handleGoogleCallback(code, state)
        .then((payload) => {
          showToast(`Berhasil masuk dengan akun Google (${payload.user.name})!`, 'success');
          // Clean query params
          const cleanUrl = window.location.pathname + '#beranda-customer';
          window.history.replaceState(null, '', cleanUrl);
          setActiveView('view-customer-home');
          setActiveLabel('Beranda Pelanggan');
        })
        .catch((err) => {
          showToast(extractApiErrorMessage(err, 'Gagal menyelesaikan otentikasi Google.'), 'error');
        });
    }
  }, [showToast]);

  // Sync hash on navigation
  const handleNavigate = (viewId: string, label: string = '', tab?: OrderStatusTab) => {
    setActiveView(viewId);
    if (label) setActiveLabel(label);
    if (tab) setOrderTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (viewId === 'view-customer-home') {
      window.history.replaceState(null, '', '#beranda-customer');
    } else if (viewId === 'view-customer-marketplace') {
      window.history.replaceState(null, '', '#marketplace');
    } else if (viewId === 'view-customer-product-detail') {
      window.history.replaceState(null, '', '#detail-produk');
    } else if (viewId === 'view-customer-cart') {
      window.history.replaceState(null, '', '#keranjang');
    } else if (viewId === 'view-customer-checkout') {
      window.history.replaceState(null, '', '#checkout');
    } else if (viewId === 'view-customer-auth') {
      window.history.replaceState(null, '', '#masuk');
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
      } else if (hash.startsWith('#detail-produk') || hash.startsWith('#detail') || hash.startsWith('#mystery-box-detail')) {
        setActiveView('view-customer-product-detail');
        setActiveLabel('Detail Produk');
      } else if (hash.startsWith('#keranjang') || hash.startsWith('#cart')) {
        setActiveView('view-customer-cart');
        setActiveLabel('Keranjang Saya');
      } else if (hash.startsWith('#checkout')) {
        setActiveView('view-customer-checkout');
        setActiveLabel('Checkout');
      } else if (hash.startsWith('#marketplace')) {
        setActiveView('view-customer-marketplace');
        setActiveLabel('Marketplace');
      } else if (hash.startsWith('#masuk') || hash.startsWith('#daftar') || hash.startsWith('#auth') || hash.startsWith('#login')) {
        setActiveView('view-customer-auth');
        setActiveLabel('Masuk / Daftar');
      } else {
        // Customer view for #beranda-customer, #customer, or empty hash
        setActiveView('view-customer-home');
        setActiveLabel('Beranda Pelanggan');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <>
      {/* 1. Customer Views */}
      {activeView === 'view-customer-home' ? (
        <CustomerHome
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateAuth={() => handleNavigate('view-customer-auth', 'Masuk / Daftar')}
          onNavigateDetail={(item) => {
            setSelectedProduct(item);
            handleNavigate('view-customer-product-detail', 'Detail Produk');
          }}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-marketplace' ? (
        <CustomerMarketplace
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateAuth={() => handleNavigate('view-customer-auth', 'Masuk / Daftar')}
          onNavigateDetail={(item) => {
            setSelectedProduct(item);
            handleNavigate('view-customer-product-detail', 'Detail Produk');
          }}
          onNavigateCart={() => handleNavigate('view-customer-cart', 'Keranjang Saya')}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-product-detail' ? (
        <CustomerProductDetail
          product={selectedProduct}
          onNavigateBack={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateCart={() => handleNavigate('view-customer-cart', 'Keranjang Saya')}
          onNavigateCheckout={(product, qty) => {
            setCheckoutPayload({
              source: 'direct',
              items: [
                {
                  id: product.id,
                  name: product.category
                    ? `${product.category.replace(/^[^\w\s]+/, '').trim()} Reguler`
                    : 'Mystery Bakery Box Reguler',
                  storeId: 'store-terasa',
                  storeName: product.storeName || 'TerasRasa Bakery',
                  storeAvatar: 'TR',
                  storeAddress: 'Jl. Soekarno Hatta No. 12, Lowokwaru, Malang, Jawa Timur',
                  rating: product.rating || 4.8,
                  reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : Number(product.reviewCount) || 320,
                  distanceText: product.distanceText || '1.2 km',
                  categoryTags:
                    product.tags && product.tags.length > 0
                      ? product.tags
                      : ['Roti & Pastry', '✓ Halal'],
                  originalPrice: product.originalPrice || 40000,
                  rescuePrice: product.rescuePrice || 20000,
                  discountPercent: product.discountPercent || 50,
                  quantity: qty,
                  imageSrc: product.imageSrc,
                  pickupTime: product.pickupTime,
                },
              ],
            });
            handleNavigate('view-customer-checkout', 'Checkout');
          }}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateAuth={() => handleNavigate('view-customer-auth', 'Masuk / Daftar')}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-cart' ? (
        <CustomerCart
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateCheckout={(items) => {
            setCheckoutPayload({
              source: 'cart',
              items: items && items.length > 0 ? items : [],
            });
            handleNavigate('view-customer-checkout', 'Checkout');
          }}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-checkout' ? (
        <CustomerCheckout
          payload={checkoutPayload}
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateCart={() => handleNavigate('view-customer-cart', 'Keranjang Saya')}
          onNavigateDetail={() => handleNavigate('view-customer-product-detail', 'Detail Produk')}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-auth' ? (
        <CustomerAuth
          initialMode={
            typeof window !== 'undefined' &&
            (window.location.hash.toLowerCase().includes('daftar') ||
              window.location.hash.toLowerCase().includes('register'))
              ? 'register'
              : 'login'
          }
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
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

          <div className="flex min-h-[calc(100vh-80px)] bg-[#f7f7f5] relative">
            <Sidebar
              activeView={activeView}
              storeName={storeName}
              isMobileOpen={isMobileOpen}
              onNavigate={(view, label) => handleNavigate(view, label)}
              onCloseMobile={() => setIsMobileOpen(false)}
            />

            <main className="flex-1 p-[32px_36px] max-md:p-[24px_20px] bg-[#f7f7f5] overflow-y-auto min-w-0" id="main-content">
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
      <Toast message={toastMessage} isVisible={isToastVisible} type={toastType} />
      <BrandLoadingOverlay
        isVisible={isLoading}
        title={loadingTitle}
        subtitle={loadingSubtitle}
      />
    </>
  );
}

export default App;
