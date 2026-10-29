import { useState, useEffect, useCallback } from 'react';
import { CustomerHome } from './pages/CustomerHome';
import { CustomerMarketplace } from './pages/CustomerMarketplace';
import { CustomerProductDetail } from './pages/CustomerProductDetail';
import { CustomerCart } from './pages/CustomerCart';
import { CustomerCheckout } from './pages/CustomerCheckout';
import { CustomerOrderDetail } from './pages/CustomerOrderDetail';
import { CustomerOrderHistory } from './pages/CustomerOrderHistory';
import { CustomerStoreDetail } from './pages/CustomerStoreDetail';
import { AuthRoleSelection } from './pages/AuthRoleSelection';
import { CustomerAuth } from './pages/CustomerAuth';
import { CustomerProfile } from './pages/CustomerProfile';
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
import { ActiveViewId, OrderStatusTab, CustomerMysteryBox, CheckoutPayload, PaymentOrderData } from './types';
import {
  handleGoogleCallback,
  extractApiErrorMessage,
  getCurrentUser,
  subscribeToAuth,
} from './services/authService';
import { getStoreProfile } from './services/storeService';

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
    if (hash.startsWith('#profil-seller') || hash === '#profil') return 'view-profil';
    if (hash.startsWith('#riwayat-seller') || hash.startsWith('#riwayat')) return 'view-riwayat';
    if (hash.startsWith('#buat-dagangan-seller') || hash.startsWith('#buat-dagangan')) return 'view-buat-dagangan';
    if (hash.startsWith('#daganganku-seller') || hash.startsWith('#daganganku')) return 'view-daganganku';
    if (hash.startsWith('#detail-produk') || hash.startsWith('#detail') || hash.startsWith('#mystery-box-detail')) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-product-detail';
    }
    if (hash.startsWith('#keranjang') || hash.startsWith('#cart')) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-cart';
    }
    if (
      hash.startsWith('#pembayaran') ||
      hash.startsWith('#payment') ||
      hash.startsWith('#detail-pesanan') ||
      hash.startsWith('#order-detail')
    ) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-order-detail';
    }
    if (
      hash.startsWith('#pesanan-saya') ||
      hash.startsWith('#pesanan') ||
      hash.startsWith('#riwayat-pesanan') ||
      hash.startsWith('#customer-orders')
    ) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-orders';
    }
    if (
      hash.startsWith('#toko') ||
      hash.startsWith('#store') ||
      hash.startsWith('#detail-toko')
    ) {
      return 'view-customer-store';
    }
    if (hash.startsWith('#checkout')) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-checkout';
    }
    if (hash.startsWith('#marketplace')) {
      if (!getCurrentUser()) {
        return 'view-auth-role-selection';
      }
      return 'view-customer-marketplace';
    }
    if (hash.startsWith('#akun') || hash.startsWith('#profil-user') || hash.startsWith('#profil-customer') || hash.startsWith('#profile')) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-profile';
    }
    if (hash.startsWith('#masuk-mitra') || hash.startsWith('#daftar-mitra') || hash.startsWith('#auth-seller') || hash.startsWith('#seller-auth')) {
      return 'view-seller-auth';
    }
    if (hash.startsWith('#masuk-customer') || hash.startsWith('#daftar-customer')) {
      return 'view-customer-auth';
    }
    if (hash.startsWith('#masuk') || hash.startsWith('#daftar') || hash.startsWith('#auth') || hash.startsWith('#login') || hash.startsWith('#pilih-role')) {
      return 'view-auth-role-selection';
    }
    // Default to Customer Landing Page
    return 'view-customer-home';
  });

  const [selectedProduct, setSelectedProduct] = useState<CustomerMysteryBox | null>(null);
  const [checkoutPayload, setCheckoutPayload] = useState<CheckoutPayload | null>(null);
  const [paymentOrderData, setPaymentOrderData] = useState<PaymentOrderData | null>(null);
  const [selectedStoreName, setSelectedStoreName] = useState<string>('TerasRasa Bakery');
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(undefined);

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
    if (hash.startsWith('#profil-seller') || hash === '#profil') return 'Profil Toko';
    if (hash.startsWith('#riwayat-seller') || hash.startsWith('#riwayat')) return 'Riwayat Pesanan';
    if (hash.startsWith('#buat-dagangan-seller') || hash.startsWith('#buat-dagangan')) return 'Buat Dagangan';
    if (hash.startsWith('#daganganku-seller') || hash.startsWith('#daganganku')) return 'Daganganku';
    if (hash.startsWith('#beranda-seller') || hash === '#beranda') return 'Beranda Toko';
    if (hash.startsWith('#detail-produk') || hash.startsWith('#detail') || hash.startsWith('#mystery-box-detail')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Detail Produk';
    }
    if (hash.startsWith('#keranjang') || hash.startsWith('#cart')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Keranjang Saya';
    }
    if (
      hash.startsWith('#pembayaran') ||
      hash.startsWith('#payment') ||
      hash.startsWith('#detail-pesanan') ||
      hash.startsWith('#order-detail')
    ) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Detail Pesanan';
    }
    if (
      hash.startsWith('#pesanan-saya') ||
      hash.startsWith('#pesanan') ||
      hash.startsWith('#riwayat-pesanan')
    ) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Riwayat Pesanan';
    }
    if (
      hash.startsWith('#toko') ||
      hash.startsWith('#store') ||
      hash.startsWith('#detail-toko')
    ) {
      return 'Detail Toko';
    }
    if (hash.startsWith('#checkout')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Checkout';
    }
    if (hash.startsWith('#marketplace')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Marketplace';
    }
    if (hash.startsWith('#akun') || hash.startsWith('#profil-user') || hash.startsWith('#profil-customer') || hash.startsWith('#profile')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Informasi Akun';
    }
    if (hash.startsWith('#masuk-mitra') || hash.startsWith('#daftar-mitra') || hash.startsWith('#auth-seller') || hash.startsWith('#seller-auth')) {
      return 'Masuk sebagai Mitra Toko';
    }
    if (hash.startsWith('#masuk-customer') || hash.startsWith('#daftar-customer')) {
      return 'Masuk sebagai Customer';
    }
    if (hash.startsWith('#masuk') || hash.startsWith('#daftar') || hash.startsWith('#auth') || hash.startsWith('#login') || hash.startsWith('#pilih-role')) {
      return 'Pilih Peran Akun';
    }
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

  // Sync store name from backend for seller portal
  useEffect(() => {
    const user = getCurrentUser();
    const isCustomer = user && (user.role_id === 1 || user.role_id === 2 || user.role?.toLowerCase() === 'user' || user.role?.toLowerCase() === 'customer');
    if (user && !isCustomer && (user.role_id === 3 || user.role === 'Seller' || localStorage.getItem('rescuebyte_user_role') === 'seller')) {
      getStoreProfile()
        .then((store) => {
          if (store?.name) {
            setStoreName(store.name);
            localStorage.setItem('rescuebyte_store_name', store.name);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Sync hash on navigation
  const handleNavigate = useCallback(
    (viewId: string, label: string = '', tab?: OrderStatusTab) => {
      // Auth guard: Require login before accessing marketplace, product detail, cart, checkout, orders, or order detail
      if (
        viewId === 'view-customer-marketplace' ||
        viewId === 'view-customer-product-detail' ||
        viewId === 'view-customer-cart' ||
        viewId === 'view-customer-checkout' ||
        viewId === 'view-customer-orders' ||
        viewId === 'view-customer-order-detail'
      ) {
        const user = getCurrentUser();
        if (!user) {
          const message =
            viewId === 'view-customer-marketplace'
              ? 'Silakan masuk terlebih dahulu untuk mengakses Marketplace.'
              : 'Silakan masuk terlebih dahulu untuk melanjutkan pesanan.';
          showToast(message, 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          setIsMobileOpen(false);
          return;
        }
      }

      setActiveView(viewId as ActiveViewId);
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
      } else if (viewId === 'view-customer-orders') {
        window.history.replaceState(null, '', '#pesanan-saya');
      } else if (viewId === 'view-customer-order-detail') {
        window.history.replaceState(null, '', '#detail-pesanan');
      } else if (viewId === 'view-customer-store') {
        window.history.replaceState(null, '', '#toko');
      } else if (viewId === 'view-customer-profile') {
        window.history.replaceState(null, '', '#akun');
      } else if (viewId === 'view-auth-role-selection') {
        window.history.replaceState(null, '', '#auth');
      } else if (viewId === 'view-customer-auth') {
        window.history.replaceState(null, '', '#masuk-customer');
      } else if (viewId === 'view-seller-auth') {
        window.history.replaceState(null, '', '#masuk-mitra');
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
    },
    [showToast]
  );

  // Sync with browser back/forward hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#beranda-seller') || hash === '#beranda') {
        setActiveView('view-beranda');
        setActiveLabel('Beranda Toko');
      } else if (hash.startsWith('#profil-seller') || hash === '#profil') {
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
        const user = getCurrentUser();
        if (!user) {
          showToast('Silakan masuk terlebih dahulu untuk memesan Mystery Box.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-product-detail');
        setActiveLabel('Detail Produk');
      } else if (hash.startsWith('#keranjang') || hash.startsWith('#cart')) {
        const user = getCurrentUser();
        if (!user) {
          showToast('Silakan masuk terlebih dahulu untuk memesan Mystery Box.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-cart');
        setActiveLabel('Keranjang Saya');
      } else if (hash.startsWith('#checkout')) {
        const user = getCurrentUser();
        if (!user) {
          showToast('Silakan masuk terlebih dahulu untuk melakukan checkout.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-checkout');
        setActiveLabel('Checkout');
      } else if (
        hash.startsWith('#pesanan-saya') ||
        hash.startsWith('#pesanan') ||
        hash.startsWith('#riwayat-pesanan')
      ) {
        const user = getCurrentUser();
        if (!user) {
          showToast('Silakan masuk terlebih dahulu untuk mengakses pesanan Anda.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-orders');
        setActiveLabel('Riwayat Pesanan');
      } else if (
        hash.startsWith('#pembayaran') ||
        hash.startsWith('#payment') ||
        hash.startsWith('#detail-pesanan') ||
        hash.startsWith('#order-detail')
      ) {
        const user = getCurrentUser();
        if (!user) {
          showToast('Silakan masuk terlebih dahulu untuk mengakses detail pesanan.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-order-detail');
        setActiveLabel('Detail Pesanan');
      } else if (
        hash.startsWith('#toko') ||
        hash.startsWith('#store') ||
        hash.startsWith('#detail-toko')
      ) {
        setActiveView('view-customer-store');
        setActiveLabel('Detail Toko');
      } else if (hash.startsWith('#marketplace')) {
        const user = getCurrentUser();
        if (!user) {
          showToast('Silakan masuk terlebih dahulu untuk mengakses Marketplace.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-marketplace');
        setActiveLabel('Marketplace');
      } else if (hash.startsWith('#akun') || hash.startsWith('#profil-user') || hash.startsWith('#profil-customer') || hash.startsWith('#profile')) {
        const user = getCurrentUser();
        if (!user) {
          showToast('Silakan masuk terlebih dahulu untuk mengakses Informasi Akun.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-profile');
        setActiveLabel('Informasi Akun');
      } else if (hash.startsWith('#masuk-mitra') || hash.startsWith('#daftar-mitra') || hash.startsWith('#auth-seller') || hash.startsWith('#seller-auth')) {
        setActiveView('view-seller-auth');
        setActiveLabel('Masuk sebagai Mitra Toko');
      } else if (hash.startsWith('#masuk-customer') || hash.startsWith('#daftar-customer')) {
        setActiveView('view-customer-auth');
        setActiveLabel('Masuk sebagai Customer');
      } else if (hash.startsWith('#masuk') || hash.startsWith('#daftar') || hash.startsWith('#auth') || hash.startsWith('#login') || hash.startsWith('#pilih-role')) {
        setActiveView('view-auth-role-selection');
        setActiveLabel('Pilih Peran Akun');
      } else {
        // Customer view for #beranda-customer, #customer, or empty hash
        setActiveView('view-customer-home');
        setActiveLabel('Beranda Pelanggan');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [showToast]);

  // If user logs out while on protected routes, automatically redirect to login
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      const hash = window.location.hash.toLowerCase();
      if (!user) {
        if (
          hash.startsWith('#marketplace') ||
          hash.startsWith('#detail-produk') ||
          hash.startsWith('#detail') ||
          hash.startsWith('#mystery-box-detail') ||
          hash.startsWith('#keranjang') ||
          hash.startsWith('#cart') ||
          hash.startsWith('#checkout') ||
          hash.startsWith('#pesanan-saya') ||
          hash.startsWith('#pesanan') ||
          hash.startsWith('#riwayat-pesanan') ||
          hash.startsWith('#pembayaran') ||
          hash.startsWith('#payment') ||
          hash.startsWith('#detail-pesanan') ||
          hash.startsWith('#order-detail') ||
          hash.startsWith('#akun') ||
          hash.startsWith('#profile') ||
          hash.startsWith('#beranda-seller') ||
          hash.startsWith('#profil-seller') ||
          hash.startsWith('#riwayat-seller') ||
          hash.startsWith('#buat-dagangan-seller') ||
          hash.startsWith('#daganganku-seller')
        ) {
          handleNavigate('view-customer-home', 'Beranda Pelanggan');
        }
      }
    });
    return unsubscribe;
  }, [handleNavigate]);

  const handleNavigateStore = useCallback(
    (targetStoreName?: string, targetStoreId?: string) => {
      if (targetStoreName) {
        setSelectedStoreName(targetStoreName);
      }
      setSelectedStoreId(targetStoreId);
      handleNavigate('view-customer-store', 'Detail Toko');
    },
    [handleNavigate]
  );

  return (
    <>
      {/* 1. Customer Views */}
      {activeView === 'view-customer-home' ? (
        <CustomerHome
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateProfile={() => handleNavigate('view-customer-profile', 'Informasi Akun')}
          onNavigateOrders={() => handleNavigate('view-customer-orders', 'Riwayat Pesanan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateStore={handleNavigateStore}
          onNavigateAuth={() => handleNavigate('view-auth-role-selection', 'Pilih Peran Akun')}
          onNavigateDetail={(item) => {
            const user = getCurrentUser();
            if (!user) {
              showToast('Silakan masuk terlebih dahulu untuk memesan Mystery Box.', 'warning');
              handleNavigate('view-auth-role-selection', 'Pilih Peran Akun');
              return;
            }
            setSelectedProduct(item);
            handleNavigate('view-customer-product-detail', 'Detail Produk');
          }}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-marketplace' ? (
        <CustomerMarketplace
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateAuth={() => handleNavigate('view-auth-role-selection', 'Pilih Peran Akun')}
          onNavigateProfile={() => handleNavigate('view-customer-profile', 'Informasi Akun')}
          onNavigateOrders={() => handleNavigate('view-customer-orders', 'Riwayat Pesanan')}
          onNavigateDetail={(item) => {
            setSelectedProduct(item);
            handleNavigate('view-customer-product-detail', 'Detail Produk');
          }}
          onNavigateCart={() => handleNavigate('view-customer-cart', 'Keranjang Saya')}
          onNavigateStore={handleNavigateStore}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-product-detail' ? (
        <CustomerProductDetail
          product={selectedProduct}
          onNavigateBack={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateStore={handleNavigateStore}
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateCart={() => handleNavigate('view-customer-cart', 'Keranjang Saya')}
          onNavigateCheckout={(product, qty) => {
            setCheckoutPayload({
              source: 'direct',
              items: [
                {
                  id: product.id,
                  name: product.category ? product.category.replace(/^[^\w\s]+/, '').trim() : 'Mystery Bakery Box',
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
          onNavigateAuth={() => handleNavigate('view-auth-role-selection', 'Pilih Peran Akun')}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-cart' ? (
        <CustomerCart
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateStore={handleNavigateStore}
          onNavigateDetail={(item) => {
            setSelectedProduct(item);
            handleNavigate('view-customer-product-detail', 'Detail Produk');
          }}
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
          onNavigateOrderDetail={(orderData) => {
            setPaymentOrderData(orderData);
            handleNavigate('view-customer-order-detail', 'Detail Pesanan');
          }}
          onNavigatePayment={(orderData) => {
            setPaymentOrderData(orderData);
            handleNavigate('view-customer-order-detail', 'Detail Pesanan');
          }}
          onNavigateOrders={() => handleNavigate('view-customer-orders', 'Riwayat Pesanan')}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-orders' ? (
        <CustomerOrderHistory
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateStore={handleNavigateStore}
          onNavigateProfile={() => handleNavigate('view-customer-profile', 'Informasi Akun')}
          onNavigateOrderDetail={(order) => {
            setPaymentOrderData(order);
            handleNavigate('view-customer-order-detail', 'Detail Pesanan');
          }}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-order-detail' ? (
        <CustomerOrderDetail
          orderData={paymentOrderData}
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateOrders={() => handleNavigate('view-customer-orders', 'Riwayat Pesanan')}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateStore={handleNavigateStore}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-store' ? (
        <CustomerStoreDetail
          storeName={selectedStoreName}
          storeId={selectedStoreId}
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateProfile={() => handleNavigate('view-customer-profile', 'Informasi Akun')}
          onNavigateOrders={() => handleNavigate('view-customer-orders', 'Riwayat Pesanan')}
          onNavigateProductDetail={(item) => {
            setSelectedProduct(item);
            handleNavigate('view-customer-product-detail', 'Detail Produk');
          }}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onShowToast={showToast}
        />
      ) : activeView === 'view-auth-role-selection' ? (
        <AuthRoleSelection
          onSelectCustomer={() => handleNavigate('view-customer-auth', 'Masuk sebagai Customer')}
          onSelectSeller={() => handleNavigate('view-seller-auth', 'Masuk sebagai Mitra Toko')}
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
        />
      ) : activeView === 'view-customer-auth' ? (
        <CustomerAuth
          roleType="customer"
          initialMode={
            typeof window !== 'undefined' &&
              (window.location.hash.toLowerCase().includes('daftar') ||
                window.location.hash.toLowerCase().includes('register'))
              ? 'register'
              : 'login'
          }
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateRoleSelection={() => handleNavigate('view-auth-role-selection', 'Pilih Peran Akun')}
          onSwitchRole={(nextRole) => {
            if (nextRole === 'seller') {
              handleNavigate('view-seller-auth', 'Masuk sebagai Mitra Toko');
            } else {
              handleNavigate('view-customer-auth', 'Masuk sebagai Customer');
            }
          }}
          onShowToast={showToast}
        />
      ) : activeView === 'view-seller-auth' ? (
        <CustomerAuth
          roleType="seller"
          initialMode={
            typeof window !== 'undefined' &&
              (window.location.hash.toLowerCase().includes('daftar') ||
                window.location.hash.toLowerCase().includes('register'))
              ? 'register'
              : 'login'
          }
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateRoleSelection={() => handleNavigate('view-auth-role-selection', 'Pilih Peran Akun')}
          onSwitchRole={(nextRole) => {
            if (nextRole === 'seller') {
              handleNavigate('view-seller-auth', 'Masuk sebagai Mitra Toko');
            } else {
              handleNavigate('view-customer-auth', 'Masuk sebagai Customer');
            }
          }}
          onShowToast={showToast}
        />
      ) : activeView === 'view-customer-profile' ? (
        <CustomerProfile
          onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
          onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
          onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
          onNavigateOrders={() => handleNavigate('view-customer-orders', 'Riwayat Pesanan')}
          onShowToast={showToast}
        />
      ) : (
        /* 2. Merchant / Seller View: Portal Layout */
        <>
          <Header
            storeName={storeName}
            onNavigate={(view: string) => handleNavigate(view)}
            onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
            onShowToast={showToast}
          />

          <div className="flex min-h-[calc(100vh-80px)] bg-surface-app relative">
            <Sidebar
              activeView={activeView}
              storeName={storeName}
              isMobileOpen={isMobileOpen}
              onNavigate={(view: string, label: string) => handleNavigate(view, label)}
              onCloseMobile={() => setIsMobileOpen(false)}
            />

            <main className="flex-1 p-[32px_36px] max-md:p-[24px_20px] bg-surface-app overflow-y-auto min-w-0" id="main-content">
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
                  storeName={storeName}
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
