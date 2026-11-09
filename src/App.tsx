import { useState, useEffect, useCallback } from 'react';
import { ToastType } from './components/common/Toast';
import { BrandLoadingOverlay } from './components/common/BrandLoadingOverlay';
import { useBrandLoading } from './hooks/useBrandLoading';
import { useAuth } from './hooks/useAuth';
import { useToastContext } from './context/ToastContext';
import { ActiveViewId, OrderStatusTab, CustomerMysteryBox, CheckoutPayload, PaymentOrderData } from './types';
import {
  handleGoogleCallback,
  extractApiErrorMessage,
  getCurrentUser,
  subscribeToAuth,
} from './services/authService';
import { getStoreProfile } from './services/storeService';
import { fetchOrderDetailApi } from './services/orderService';
import { productApi } from './api/services/productApi';
import { useHashNavigation } from './app/useHashNavigation';
import { findOrderById } from './app/orderRouteData';
import { AppRoutes } from './app/AppRoutes';
import { isCustomerOrderDetailPath, parseHash, safeDecode } from './app/hashRouting';

/** Komponen Shell Utama Aplikasi: Mengatur modular routing hash, deep linking, dan auth guard. */
export function App() {
  const { isLoading, loadingTitle, loadingSubtitle, triggerLoading } = useBrandLoading();
  const { user } = useAuth();
  const { showToast: toastContextShow } = useToastContext();

  const [activeView, setActiveView] = useState<ActiveViewId>(() => {
    const { path, params } = parseHash();
    const isSellerPath =
      path.startsWith('beranda-seller') ||
      path === 'beranda' ||
      path.startsWith('profil-seller') ||
      path === 'profil' ||
      path.startsWith('riwayat-seller') ||
      path.startsWith('riwayat') ||
      path.startsWith('buat-dagangan-seller') ||
      path.startsWith('buat-dagangan') ||
      path.startsWith('daganganku-seller') ||
      path.startsWith('daganganku') ||
      path.startsWith('ulasan-seller') ||
      path === 'ulasan';

    if (isSellerPath) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      if (path.startsWith('beranda-seller') || path === 'beranda') return 'view-beranda';
      if (path.startsWith('profil-seller') || path === 'profil') return 'view-profil';
      if (path.startsWith('riwayat-seller') || path.startsWith('riwayat')) return 'view-riwayat';
      if (path.startsWith('buat-dagangan-seller') || path.startsWith('buat-dagangan')) return 'view-buat-dagangan';
      if (path.startsWith('daganganku-seller') || path.startsWith('daganganku')) return 'view-daganganku';
      if (path.startsWith('ulasan-seller') || path === 'ulasan') return 'view-ulasan';
    }

    if (isCustomerOrderDetailPath(path)) {
      if (params.get('id') || findOrderById(params.get('id') || '')) {
        return 'view-customer-order-detail';
      }
      return 'view-customer-home';
    }

    if (path.startsWith('detail-produk') || path.startsWith('detail') || path.startsWith('mystery-box-detail')) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-product-detail';
    }
    if (path.startsWith('keranjang') || path.startsWith('cart')) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-cart';
    }
    if (path.startsWith('pesanan-saya') || path.startsWith('pesanan') || path.startsWith('riwayat-pesanan') || path.startsWith('customer-orders')) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-orders';
    }
    if (path.startsWith('toko') || path.startsWith('store') || path.startsWith('detail-toko')) {
      return 'view-customer-store';
    }
    if (path.startsWith('checkout')) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-checkout';
    }
    if (path.startsWith('kontak') || path.startsWith('contact') || path.startsWith('saran')) return 'view-customer-contact';
    if (path.startsWith('marketplace')) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-marketplace';
    }
    if (path.startsWith('akun') || path.startsWith('profil-user') || path.startsWith('profil-customer') || path.startsWith('profile')) {
      if (!getCurrentUser()) return 'view-auth-role-selection';
      return 'view-customer-profile';
    }
    if (path.startsWith('masuk-mitra') || path.startsWith('daftar-mitra') || path.startsWith('auth-seller') || path.startsWith('seller-auth')) {
      return 'view-seller-auth';
    }
    if (path.startsWith('masuk-customer') || path.startsWith('daftar-customer')) {
      return 'view-customer-auth';
    }
    if (path.startsWith('masuk') || path.startsWith('daftar') || path.startsWith('auth') || path.startsWith('login') || path.startsWith('pilih-role')) {
      return 'view-auth-role-selection';
    }
    return 'view-customer-home';
  });

  const [selectedProduct, setSelectedProduct] = useState<CustomerMysteryBox | null>(null);
  const [checkoutPayload, setCheckoutPayload] = useState<CheckoutPayload | null>(null);
  const [paymentOrderData, setPaymentOrderData] = useState<PaymentOrderData | null>(() => {
    const { params } = parseHash();
    const orderId = params.get('id');
    if (orderId) {
      return findOrderById(orderId);
    }
    return null;
  });

  const [selectedStoreName, setSelectedStoreName] = useState<string>(() => {
    const { params } = parseHash();
    const qName = params.get('name');
    if (qName && qName.trim()) return safeDecode(qName.trim());
    try {
      const saved = localStorage.getItem('rescuebyte_selected_store');
      if (saved && saved.trim() && saved !== 'TerasRasa Bakery') return saved.trim();
      const sellerStore = localStorage.getItem('rescuebyte_store_name');
      if (sellerStore && sellerStore.trim() && sellerStore !== 'TerasRasa Bakery') return sellerStore.trim();
    } catch { }
    return 'Toko Rejak';
  });
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(() => {
    const { params } = parseHash();
    return params.get('id') || undefined;
  });

  const [orderTab, setOrderTab] = useState<OrderStatusTab>(() => {
    const { hash } = window.location;
    if (hash.includes('tab=')) {
      const match = hash.match(/tab=([a-z-]+)/);
      if (match && ['perlu-konfirmasi', 'diproses', 'siap-diambil', 'selesai', 'konfirmasi', 'habis', 'kendala', 'batal'].includes(match[1])) {
        return match[1] as OrderStatusTab;
      }
    }
    return 'perlu-konfirmasi';
  });

  const [activeLabel, setActiveLabel] = useState<string>(() => {
    const { path } = parseHash();
    if (path.startsWith('profil-seller') || path === 'profil') return 'Profil Toko';
    if (path.startsWith('riwayat-seller') || path.startsWith('riwayat')) return 'Riwayat Pesanan';
    if (path.startsWith('buat-dagangan-seller') || path.startsWith('buat-dagangan')) return 'Buat Dagangan';
    if (path.startsWith('daganganku-seller') || path.startsWith('daganganku')) return 'Daganganku';
    if (path.startsWith('beranda-seller') || path === 'beranda') return 'Beranda Toko';
    if (isCustomerOrderDetailPath(path)) return 'Detail Pesanan';
    if (path.startsWith('detail-produk') || path.startsWith('detail') || path.startsWith('mystery-box-detail')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Detail Produk';
    }
    if (path.startsWith('keranjang') || path.startsWith('cart')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Keranjang Saya';
    }
    if (path.startsWith('pesanan-saya') || path.startsWith('pesanan') || path.startsWith('riwayat-pesanan')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Riwayat Pesanan';
    }
    if (path.startsWith('toko') || path.startsWith('store') || path.startsWith('detail-toko')) {
      return 'Detail Toko';
    }
    if (path.startsWith('checkout')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Checkout';
    }
    if (path.startsWith('kontak') || path.startsWith('contact') || path.startsWith('saran')) {
      return 'Kontak';
    }
    if (path.startsWith('marketplace')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Marketplace';
    }
    if (path.startsWith('akun') || path.startsWith('profil-user') || path.startsWith('profil-customer') || path.startsWith('profile')) {
      if (!getCurrentUser()) return 'Pilih Peran Akun';
      return 'Informasi Akun';
    }
    if (path.startsWith('masuk-mitra') || path.startsWith('daftar-mitra') || path.startsWith('auth-seller') || path.startsWith('seller-auth')) {
      return 'Masuk sebagai Mitra Toko';
    }
    if (path.startsWith('masuk-customer') || path.startsWith('daftar-customer')) {
      return 'Masuk sebagai Customer';
    }
    if (path.startsWith('masuk') || path.startsWith('daftar') || path.startsWith('auth') || path.startsWith('login') || path.startsWith('pilih-role')) {
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

  useEffect(() => {
    const handleStoreChange = () => {
      const saved = localStorage.getItem('rescuebyte_store_name');
      if (saved) {
        setStoreName(saved);
      }
    };
    window.addEventListener('rescuebyte_store_updated', handleStoreChange);
    window.addEventListener('storage', handleStoreChange);
    return () => {
      window.removeEventListener('rescuebyte_store_updated', handleStoreChange);
      window.removeEventListener('storage', handleStoreChange);
    };
  }, []);

  // Toast handler (no-op / context delegate per R1)
  const showToast = useCallback(
    (message: string, typeOrDuration?: ToastType | number, maybeDuration?: number) => {
      const type: ToastType = typeof typeOrDuration === 'string' ? typeOrDuration : 'success';
      const duration: number =
        typeof typeOrDuration === 'number'
          ? typeOrDuration
          : typeof maybeDuration === 'number'
          ? maybeDuration
          : 3000;

      // Delegate to context if available
      if (toastContextShow) {
        toastContextShow(message, type, duration);
      }
    },
    [toastContextShow]
  );

  // Deep linking initial resolution for product / order / store params
  useEffect(() => {
    const { path, params } = parseHash();

    // Deep linking untuk halaman detail produk: #detail-produk?id=...
    if (
      (path.startsWith('detail-produk') || path.startsWith('detail') || path.startsWith('mystery-box-detail')) &&
      params.get('id')
    ) {
      const prodId = params.get('id')!;
      if (!selectedProduct || selectedProduct.id !== prodId) {
        productApi.getProductDetail(prodId)
          .then((prod) => {
            if (prod) {
              const firstVariant = prod.variants?.[0];
              const norm = firstVariant?.normal_price || prod.min_normal_price || 40000;
              const resc = firstVariant?.rescue_price || prod.min_rescue_price || 20000;
              const disc = Math.round(((norm - resc) / norm) * 100);
              setSelectedProduct({
                id: prod.id || prodId,
                name: prod.name,
                category: 'Surplus Food Box',
                storeId: prod.store_id,
                storeName: (prod as any).store_name || 'Toko Mitra',
                distanceText: '1.2 km',
                remainingBoxesText: `Sisa ${prod.total_current_stock} Box`,
                discountPercent: disc,
                originalPrice: norm,
                rescuePrice: resc,
                pickupTime: '15.00 - 17.00 WIB',
                description: prod.description || 'Paket makanan surplus bermutu tinggi.',
                tags: ['✓ Halal', 'Surplus Makanan'],
                imageSrc: prod.main_image_url || '',
                variantId: firstVariant?.id,
                stock: prod.total_current_stock,
              });
            }
          })
          .catch(() => {});
      }
    }

    // Deep linking untuk halaman detail pesanan: #detail-pesanan?id=...
    if (isCustomerOrderDetailPath(path) && params.get('id')) {
      const orderId = params.get('id')!;
      if (!paymentOrderData || (paymentOrderData.orderId !== orderId && paymentOrderData.backendOrderId !== orderId)) {
        const found = findOrderById(orderId);
        if (found) {
          setPaymentOrderData(found);
        } else {
          fetchOrderDetailApi(orderId)
            .then((apiDetail) => {
              if (apiDetail) {
                setPaymentOrderData({
                  orderId: apiDetail.order_number || apiDetail.id || orderId,
                  backendOrderId: apiDetail.id,
                  status: apiDetail.status,
                  items: (apiDetail.items || []).map((it: any) => ({
                    id: it.id,
                    productId: it.product_id || it.productId || it.id,
                    name: it.product_name || 'Paket Surplus',
                    storeName: apiDetail.store_name || 'Toko Mitra',
                    categoryTags: ['Surplus Makanan'],
                    originalPrice: it.normal_price || it.price || 40000,
                    rescuePrice: it.rescue_price || it.price || 20000,
                    discountPercent: 50,
                    quantity: it.quantity || 1,
                  })),
                  primaryStore: {
                    storeId: apiDetail.store_id || '',
                    storeName: apiDetail.store_name || 'Toko Mitra',
                    storeAddress: apiDetail.store_address || '',
                  },
                  pickupDate: apiDetail.pickup_date || '',
                  pickupTimeSlot: apiDetail.pickup_window || '15.00 - 17.00 WIB',
                  customerInfo: {
                    name: apiDetail.customer_name || 'Pelanggan',
                    phone: apiDetail.customer_phone || '',
                    email: '',
                  },
                  totalBoxes: apiDetail.total_items || 1,
                  subtotal: apiDetail.total_amount || 20000,
                  discountTotal: 0,
                  serviceFee: 2000,
                  grandTotal: (apiDetail.total_amount || 20000) + 2000,
                });
              }
            })
            .catch(() => {});
        }
      }
    }

    // Deep linking untuk halaman toko: #toko?name=... atau #toko?id=...
    if (path.startsWith('toko') || path.startsWith('store') || path.startsWith('detail-toko')) {
      if (params.get('name')) {
        setSelectedStoreName(safeDecode(params.get('name')!));
      }
      if (params.get('id')) {
        setSelectedStoreId(params.get('id')!);
      }
    }
  }, []);

  // Tangani callback otorisasi Google OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      const storedState = sessionStorage.getItem('google_auth_state');
      if (storedState && storedState !== state) {
        showToast('Verifikasi Google tidak cocok. Silakan mulai proses masuk lagi.', 'error');
        return;
      }

      handleGoogleCallback(code, state)
        .then((payload) => {
          showToast(`Berhasil masuk dengan akun Google (${payload.user.name})!`, 'success');
          const authCurrent = getCurrentUser();
          const role = (authCurrent?.role || '').toLowerCase();
          const isSeller =
            authCurrent?.role_id === 3 ||
            role.includes('seller') ||
            role.includes('merchant') ||
            role.includes('mitra') ||
            localStorage.getItem('rescuebyte_user_role') === 'seller';
          const nextHash = isSeller ? '#beranda-seller' : '#beranda-customer';
          const cleanUrl = window.location.pathname + nextHash;
          window.history.replaceState(null, '', cleanUrl);
          setActiveView(isSeller ? 'view-beranda' : 'view-customer-home');
          setActiveLabel(isSeller ? 'Beranda Toko' : 'Beranda Pelanggan');
        })
        .catch((err) => {
          showToast(extractApiErrorMessage(err, 'Gagal menyelesaikan otentikasi Google.'), 'error');
        });
    }
  }, [showToast]);

  // Sync store name from backend for seller portal
  useEffect(() => {
    const currentUser = getCurrentUser();
    const isCustomer = currentUser && (currentUser.role_id === 1 || currentUser.role_id === 2 || currentUser.role?.toLowerCase() === 'user' || currentUser.role?.toLowerCase() === 'customer');
    if (currentUser && !isCustomer && (currentUser.role_id === 3 || currentUser.role === 'Seller' || localStorage.getItem('rescuebyte_user_role') === 'seller')) {
      getStoreProfile()
        .then((store) => {
          if (store?.name) {
            setStoreName(store.name);
            localStorage.setItem('rescuebyte_store_name', store.name);
          }
          if (store?.id) {
            localStorage.setItem('rescuebyte_store_id', store.id);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Sync hash on navigation with deep linking query params
  const handleNavigate = useCallback(
    (viewId: string, label: string = '', tab?: OrderStatusTab) => {
      // Auth guard: Wajib login untuk mengakses marketplace, checkout, dan pesanan
      if (
        viewId === 'view-customer-marketplace' ||
        viewId === 'view-customer-product-detail' ||
        viewId === 'view-customer-cart' ||
        viewId === 'view-customer-checkout' ||
        viewId === 'view-customer-orders' ||
        viewId === 'view-customer-order-detail'
      ) {
        const currentUser = getCurrentUser();
        if (!currentUser && !user) {
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
        const pId = selectedProduct?.id;
        window.history.replaceState(null, '', pId ? `#detail-produk?id=${pId}` : '#detail-produk');
      } else if (viewId === 'view-customer-cart') {
        window.history.replaceState(null, '', '#keranjang');
      } else if (viewId === 'view-customer-checkout') {
        window.history.replaceState(null, '', '#checkout');
      } else if (viewId === 'view-customer-orders') {
        window.history.replaceState(null, '', '#pesanan-saya');
      } else if (viewId === 'view-customer-order-detail') {
        const oId = paymentOrderData?.orderId || paymentOrderData?.backendOrderId;
        window.history.replaceState(null, '', oId ? `#detail-pesanan?id=${oId}` : '#detail-pesanan');
      } else if (viewId === 'view-customer-store') {
        const hash = window.location.hash || '';
        if (!hash.startsWith('#toko?') && !hash.includes('section=') && !hash.includes('ulasan-pelanggan')) {
          window.history.replaceState(null, '', selectedStoreName ? `#toko?name=${encodeURIComponent(selectedStoreName)}` : '#toko');
        }
      } else if (viewId === 'view-customer-profile') {
        window.history.replaceState(null, '', '#akun');
      } else if (viewId === 'view-customer-contact') {
        window.history.replaceState(null, '', '#kontak');
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
      } else if (viewId === 'view-ulasan') {
        window.history.replaceState(null, '', '#ulasan-seller');
      }

      setIsMobileOpen(false);
    },
    [showToast, selectedProduct, paymentOrderData, selectedStoreName, user]
  );

  useHashNavigation({
    showToast,
    isAuthenticated: Boolean(user),
    paymentOrderData,
    setPaymentOrderData,
    selectedProduct,
    setSelectedProduct,
    setSelectedStoreName,
    setSelectedStoreId,
    setActiveView,
    setActiveLabel,
    setOrderTab,
  });

  // Redirect otomatis ke halaman login jika user logout saat berada di route terproteksi
  useEffect(() => {
    const unsubscribe = subscribeToAuth((authLatest) => {
      const { path } = parseHash();
      if (!authLatest) {
        if (
          path.startsWith('marketplace') ||
          path.startsWith('detail-produk') ||
          path.startsWith('detail') ||
          path.startsWith('mystery-box-detail') ||
          path.startsWith('keranjang') ||
          path.startsWith('cart') ||
          path.startsWith('checkout') ||
          path.startsWith('pesanan-saya') ||
          path.startsWith('pesanan') ||
          path.startsWith('riwayat-pesanan') ||
          path.startsWith('pembayaran') ||
          path.startsWith('payment') ||
          path.startsWith('detail-pesanan') ||
          path.startsWith('order-detail') ||
          path.startsWith('akun') ||
          path.startsWith('profile') ||
          path.startsWith('beranda-seller') ||
          path.startsWith('profil-seller') ||
          path.startsWith('riwayat-seller') ||
          path.startsWith('buat-dagangan-seller') ||
          path.startsWith('daganganku-seller') ||
          path.startsWith('ulasan-seller') ||
          path === 'ulasan'
        ) {
          handleNavigate('view-auth-role-selection', 'Pilih Peran');
          window.history.replaceState(null, '', '#auth');
        }
      }
    });
    return unsubscribe;
  }, [handleNavigate]);

  const handleNavigateStore = useCallback(
    (targetStoreName?: string, targetStoreId?: string, section?: string) => {
      const cleanName = targetStoreName && targetStoreName.trim() && targetStoreName.trim() !== 'TerasRasa Bakery' ? targetStoreName.trim() : 'Toko Rejak';
      setSelectedStoreName(cleanName);
      try {
        localStorage.setItem('rescuebyte_selected_store', cleanName);
      } catch { }
      setSelectedStoreId(targetStoreId);

      const query = new URLSearchParams();
      if (cleanName) query.set('name', cleanName);
      if (targetStoreId) query.set('id', targetStoreId);
      if (section) query.set('section', section);
      window.location.hash = `#toko?${query.toString()}`;

      if (!section) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }

      setActiveView('view-customer-store');
      setActiveLabel('Detail Toko');
      setIsMobileOpen(false);
    },
    [setActiveView, setActiveLabel, setIsMobileOpen]
  );

  return (
    <>
      <AppRoutes
        activeView={activeView}
        activeLabel={activeLabel}
        orderTab={orderTab}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        checkoutPayload={checkoutPayload}
        setCheckoutPayload={setCheckoutPayload}
        paymentOrderData={paymentOrderData}
        setPaymentOrderData={setPaymentOrderData}
        selectedStoreName={selectedStoreName}
        selectedStoreId={selectedStoreId}
        storeName={storeName}
        setStoreName={setStoreName}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isAuthenticated={Boolean(user)}
        showToast={showToast}
        handleNavigate={handleNavigate}
        handleNavigateStore={handleNavigateStore}
        triggerLoading={triggerLoading}
      />

      {/* Loading Overlay */}
      <BrandLoadingOverlay
        isVisible={isLoading}
        title={loadingTitle}
        subtitle={loadingSubtitle}
      />
    </>
  );
}

export default App;
