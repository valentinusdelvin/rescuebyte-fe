import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Toast, ToastType } from './components/common/Toast';
import { BrandLoadingOverlay } from './components/common/BrandLoadingOverlay';
import { useBrandLoading } from './hooks/useBrandLoading';
import { useAuth } from './hooks/useAuth';
import { useToastContext } from './context/ToastContext';
import { ActiveViewId, OrderStatusTab, CustomerMysteryBox, CheckoutPayload, PaymentOrderData, CheckoutItem } from './types';
import {
  handleGoogleCallback,
  extractApiErrorMessage,
  getCurrentUser,
  subscribeToAuth,
} from './services/authService';
import { getStoreProfile } from './services/storeService';
import { getCustomerOrders, fetchOrderDetailApi } from './services/orderService';
import { productApi } from './api/services/productApi';
import { isCustomerOrderDetailPath, parseHash, safeDecode } from './app/hashRouting';

// Route-level code splitting using React.lazy() to eliminate Vite chunk size warning
const CustomerHome = React.lazy(() => import('./pages/customer/CustomerHome').then((m) => ({ default: m.CustomerHome })));
const CustomerMarketplace = React.lazy(() => import('./pages/customer/CustomerMarketplace').then((m) => ({ default: m.CustomerMarketplace })));
const CustomerContact = React.lazy(() => import('./pages/customer/CustomerContact').then((m) => ({ default: m.CustomerContact })));
const CustomerProductDetail = React.lazy(() => import('./pages/customer/CustomerProductDetail').then((m) => ({ default: m.CustomerProductDetail })));
const CustomerCart = React.lazy(() => import('./pages/customer/CustomerCart').then((m) => ({ default: m.CustomerCart })));
const CustomerCheckout = React.lazy(() => import('./pages/customer/CustomerCheckout').then((m) => ({ default: m.CustomerCheckout })));
const CustomerOrderDetail = React.lazy(() => import('./pages/customer/CustomerOrderDetail').then((m) => ({ default: m.CustomerOrderDetail })));
const CustomerOrderHistory = React.lazy(() => import('./pages/customer/CustomerOrderHistory').then((m) => ({ default: m.CustomerOrderHistory })));
const CustomerStoreDetail = React.lazy(() => import('./pages/customer/CustomerStoreDetail').then((m) => ({ default: m.CustomerStoreDetail })));
const AuthRoleSelection = React.lazy(() => import('./pages/auth/AuthRoleSelection').then((m) => ({ default: m.AuthRoleSelection })));
const CustomerAuth = React.lazy(() => import('./pages/auth/CustomerAuth').then((m) => ({ default: m.CustomerAuth })));
const CustomerProfile = React.lazy(() => import('./pages/customer/CustomerProfile').then((m) => ({ default: m.CustomerProfile })));
const Dashboard = React.lazy(() => import('./pages/seller/Dashboard').then((m) => ({ default: m.Dashboard })));
const StoreProfile = React.lazy(() => import('./pages/seller/StoreProfile').then((m) => ({ default: m.StoreProfile })));
const OrderHistory = React.lazy(() => import('./pages/seller/OrderHistory').then((m) => ({ default: m.OrderHistory })));
const BuatDagangan = React.lazy(() => import('./pages/seller/BuatDagangan').then((m) => ({ default: m.BuatDagangan })));
const Daganganku = React.lazy(() => import('./pages/seller/Daganganku').then((m) => ({ default: m.Daganganku })));
const PlaceholderPage = React.lazy(() => import('./pages/shared/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })));

function findOrderById(orderId: string): PaymentOrderData | null {
  try {
    const orders = getCustomerOrders();
    const found = orders.find(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
    if (!found) return null;
    if (found.orderData) return found.orderData;
    return {
      orderId: found.orderNumber || found.id,
      backendOrderId: found.id,
      status: found.status,
      items: [
        {
          id: found.id,
          name: found.productName,
          storeId: found.storeId,
          storeName: found.storeName,
          storeAvatar: found.imageUrl,
          storeAddress: found.storeAddress,
          rating: found.storeRating,
          reviewCount: found.storeReviewCount,
          distanceText: found.storeDistance,
          categoryTags: found.storeTags || [],
          originalPrice: found.originalPrice || found.finalPrice + 15000,
          rescuePrice: found.finalPrice,
          discountPercent: 50,
          quantity: found.productBoxCount,
          pickupTime: found.pickupTime,
        },
      ],
      primaryStore: {
        storeId: found.storeId,
        storeName: found.storeName,
        storeAvatar: found.imageUrl,
        storeAddress: found.storeAddress,
        rating: found.storeRating,
        reviewCount: found.storeReviewCount,
      },
      pickupDate: found.pickupDate,
      pickupTimeSlot: found.pickupTime,
      customerInfo: {
        name: 'Pelanggan',
        phone: '08123456789',
        email: '',
      },
      totalBoxes: found.productBoxCount,
      subtotal: found.finalPrice,
      discountTotal: 15000,
      serviceFee: 2000,
      grandTotal: found.finalPrice,
      createdAt: found.createdAt,
    };
  } catch {
    return null;
  }
}

/**
 * Root Application Component
 * Modernized with route-level code splitting, deep linking hash params, and context consumption.
 */
export function App() {
  const { isLoading, loadingTitle, loadingSubtitle, triggerLoading } = useBrandLoading();
  const { user } = useAuth();
  const { showToast: toastContextShow } = useToastContext();

  const [activeView, setActiveView] = useState<ActiveViewId>(() => {
    const { path, params } = parseHash();
    if (path.startsWith('beranda-seller') || path === 'beranda') return 'view-beranda';
    if (path.startsWith('profil-seller') || path === 'profil') return 'view-profil';
    if (path.startsWith('riwayat-seller') || path.startsWith('riwayat')) return 'view-riwayat';
    if (path.startsWith('buat-dagangan-seller') || path.startsWith('buat-dagangan')) return 'view-buat-dagangan';
    if (path.startsWith('daganganku-seller') || path.startsWith('daganganku')) return 'view-daganganku';

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

  // Toast state (integrated with ToastContext and local state fallback)
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

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
      setToastMessage(message);
      setToastType(type);
      setIsToastVisible(true);
    },
    [toastContextShow]
  );

  // Deep linking initial resolution for product / order / store params
  useEffect(() => {
    const { path, params } = parseHash();

    // Deep linking for product detail: #detail-produk?id=...
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

    // Deep linking for order detail: #detail-pesanan?id=...
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
                    name: it.product_name || 'Paket Surplus',
                    storeName: apiDetail.store_name || 'Toko Mitra',
                    categoryTags: ['Surplus Makanan'],
                    originalPrice: it.normal_price || it.price || 40000,
                    rescuePrice: it.rescue_price || it.price || 20000,
                    discountPercent: 50,
                    quantity: it.quantity || 1,
                  })),
                  primaryStore: {
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

    // Deep linking for store: #toko?name=... or #toko?id=...
    if (path.startsWith('toko') || path.startsWith('store') || path.startsWith('detail-toko')) {
      if (params.get('name')) {
        setSelectedStoreName(safeDecode(params.get('name')!));
      }
      if (params.get('id')) {
        setSelectedStoreId(params.get('id')!);
      }
    }
  }, []);

  // Handle Google OAuth Callback
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
        })
        .catch(() => {});
    }
  }, []);

  // Sync hash on navigation with deep linking query params
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
        window.history.replaceState(null, '', selectedStoreName ? `#toko?name=${encodeURIComponent(selectedStoreName)}` : '#toko');
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
      }

      setIsMobileOpen(false);
    },
    [showToast, selectedProduct, paymentOrderData, selectedStoreName, user]
  );

  // Sync with browser back/forward hash changes with deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const { path, params } = parseHash();
      if (path.startsWith('beranda-seller') || path === 'beranda') {
        setActiveView('view-beranda');
        setActiveLabel('Beranda Toko');
      } else if (path.startsWith('profil-seller') || path === 'profil') {
        setActiveView('view-profil');
        setActiveLabel('Profil Toko');
      } else if (path.startsWith('riwayat-seller') || path.startsWith('riwayat')) {
        setActiveView('view-riwayat');
        setActiveLabel('Riwayat Pesanan');
        const match = window.location.hash.match(/tab=([a-z-]+)/);
        if (match && ['perlu-konfirmasi', 'diproses', 'siap-diambil', 'selesai', 'konfirmasi', 'habis', 'kendala', 'batal'].includes(match[1])) {
          setOrderTab(match[1] as OrderStatusTab);
        }
      } else if (path.startsWith('buat-dagangan-seller') || path.startsWith('buat-dagangan')) {
        setActiveView('view-buat-dagangan');
        setActiveLabel('Buat Dagangan');
      } else if (path.startsWith('daganganku-seller') || path.startsWith('daganganku')) {
        setActiveView('view-daganganku');
        setActiveLabel('Daganganku');
      } else if (isCustomerOrderDetailPath(path)) {
        if (!getCurrentUser() && !user) {
          showToast('Silakan masuk terlebih dahulu untuk mengakses detail pesanan.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        const oId = params.get('id');
        if (oId) {
          const cached = findOrderById(oId);
          if (cached) setPaymentOrderData(cached);
          else {
            fetchOrderDetailApi(oId).then((apiDetail) => {
              if (apiDetail) {
                setPaymentOrderData({
                  orderId: apiDetail.order_number || apiDetail.id || oId,
                  backendOrderId: apiDetail.id,
                  status: apiDetail.status,
                  items: (apiDetail.items || []).map((it: any) => ({
                    id: it.id,
                    name: it.product_name || 'Paket Surplus',
                    storeName: apiDetail.store_name || 'Toko Mitra',
                    categoryTags: ['Surplus Makanan'],
                    originalPrice: it.normal_price || it.price || 40000,
                    rescuePrice: it.rescue_price || it.price || 20000,
                    discountPercent: 50,
                    quantity: it.quantity || 1,
                  })),
                  primaryStore: {
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
            }).catch(() => {});
          }
        } else if (!paymentOrderData) {
          setActiveView('view-customer-home');
          setActiveLabel('Beranda Pelanggan');
          window.history.replaceState(null, '', '#beranda-customer');
          return;
        }
        setActiveView('view-customer-order-detail');
        setActiveLabel('Detail Pesanan');
      } else if (path.startsWith('detail-produk') || path.startsWith('detail') || path.startsWith('mystery-box-detail')) {
        const currentUser = getCurrentUser();
        if (!currentUser && !user) {
          showToast('Silakan masuk terlebih dahulu untuk memesan Mystery Box.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        const pId = params.get('id');
        if (pId && (!selectedProduct || selectedProduct.id !== pId)) {
          productApi.getProductDetail(pId).then((prod) => {
            if (prod) {
              const firstVariant = prod.variants?.[0];
              const norm = firstVariant?.normal_price || prod.min_normal_price || 40000;
              const resc = firstVariant?.rescue_price || prod.min_rescue_price || 20000;
              const disc = Math.round(((norm - resc) / norm) * 100);
              setSelectedProduct({
                id: prod.id || pId,
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
          }).catch(() => {});
        }
        setActiveView('view-customer-product-detail');
        setActiveLabel('Detail Produk');
      } else if (path.startsWith('keranjang') || path.startsWith('cart')) {
        const currentUser = getCurrentUser();
        if (!currentUser && !user) {
          showToast('Silakan masuk terlebih dahulu untuk memesan Mystery Box.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-cart');
        setActiveLabel('Keranjang Saya');
      } else if (path.startsWith('checkout')) {
        const currentUser = getCurrentUser();
        if (!currentUser && !user) {
          showToast('Silakan masuk terlebih dahulu untuk melakukan checkout.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-checkout');
        setActiveLabel('Checkout');
      } else if (path.startsWith('pesanan-saya') || path.startsWith('pesanan') || path.startsWith('riwayat-pesanan')) {
        const currentUser = getCurrentUser();
        if (!currentUser && !user) {
          showToast('Silakan masuk terlebih dahulu untuk mengakses pesanan Anda.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-orders');
        setActiveLabel('Riwayat Pesanan');
      } else if (path.startsWith('toko') || path.startsWith('store') || path.startsWith('detail-toko')) {
        if (params.get('name')) {
          setSelectedStoreName(safeDecode(params.get('name')!));
        }
        if (params.get('id')) {
          setSelectedStoreId(params.get('id')!);
        }
        setActiveView('view-customer-store');
        setActiveLabel('Detail Toko');
      } else if (path.startsWith('kontak') || path.startsWith('contact') || path.startsWith('saran')) {
        setActiveView('view-customer-contact');
        setActiveLabel('Kontak');
      } else if (path.startsWith('marketplace')) {
        const currentUser = getCurrentUser();
        if (!currentUser && !user) {
          showToast('Silakan masuk terlebih dahulu untuk mengakses Marketplace.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-marketplace');
        setActiveLabel('Marketplace');
      } else if (path.startsWith('akun') || path.startsWith('profil-user') || path.startsWith('profil-customer') || path.startsWith('profile')) {
        const currentUser = getCurrentUser();
        if (!currentUser && !user) {
          showToast('Silakan masuk terlebih dahulu untuk mengakses Informasi Akun.', 'warning');
          setActiveView('view-auth-role-selection');
          setActiveLabel('Pilih Peran Akun');
          window.history.replaceState(null, '', '#auth');
          return;
        }
        setActiveView('view-customer-profile');
        setActiveLabel('Informasi Akun');
      } else if (path.startsWith('masuk-mitra') || path.startsWith('daftar-mitra') || path.startsWith('auth-seller') || path.startsWith('seller-auth')) {
        setActiveView('view-seller-auth');
        setActiveLabel('Masuk sebagai Mitra Toko');
      } else if (path.startsWith('masuk-customer') || path.startsWith('daftar-customer')) {
        setActiveView('view-customer-auth');
        setActiveLabel('Masuk sebagai Customer');
      } else if (path.startsWith('masuk') || path.startsWith('daftar') || path.startsWith('auth') || path.startsWith('login') || path.startsWith('pilih-role')) {
        setActiveView('view-auth-role-selection');
        setActiveLabel('Pilih Peran Akun');
      } else {
        setActiveView('view-customer-home');
        setActiveLabel('Beranda Pelanggan');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [showToast, paymentOrderData, selectedProduct, user]);

  // If user logs out while on protected routes, automatically redirect to login
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
          path.startsWith('daganganku-seller')
        ) {
          handleNavigate('view-customer-home', 'Beranda Pelanggan');
        }
      }
    });
    return unsubscribe;
  }, [handleNavigate]);

  const handleNavigateStore = useCallback(
    (targetStoreName?: string, targetStoreId?: string) => {
      const cleanName = targetStoreName && targetStoreName.trim() && targetStoreName.trim() !== 'TerasRasa Bakery' ? targetStoreName.trim() : 'Toko Rejak';
      setSelectedStoreName(cleanName);
      try {
        localStorage.setItem('rescuebyte_selected_store', cleanName);
      } catch { }
      setSelectedStoreId(targetStoreId);
      handleNavigate('view-customer-store', 'Detail Toko');
    },
    [handleNavigate]
  );

  return (
    <>
      <Suspense fallback={<BrandLoadingOverlay isVisible={true} title="RescueBite" subtitle="Memuat halaman..." />}>
        {/* 1. Customer Views */}
        {activeView === 'view-customer-home' ? (
          <CustomerHome
            onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
            onNavigateProfile={() => handleNavigate('view-customer-profile', 'Informasi Akun')}
            onNavigateOrders={() => handleNavigate('view-customer-orders', 'Riwayat Pesanan')}
            onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
            onNavigateStore={handleNavigateStore}
            onNavigateAuth={() => handleNavigate('view-auth-role-selection', 'Pilih Peran Akun')}
            onNavigateDetail={(item: CustomerMysteryBox) => {
              const currentUser = getCurrentUser();
              if (!currentUser && !user) {
                showToast('Silakan masuk terlebih dahulu untuk memesan Mystery Box.', 'warning');
                handleNavigate('view-auth-role-selection', 'Pilih Peran Akun');
                return;
              }
              setSelectedProduct(item);
              handleNavigate('view-customer-product-detail', 'Detail Produk');
            }}
            onShowToast={showToast}
          />
        ) : activeView === 'view-customer-contact' ? (
          <CustomerContact
            onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
            onNavigateMarketplace={() => handleNavigate('view-customer-marketplace', 'Marketplace')}
            onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
            onNavigateAuth={() => handleNavigate('view-auth-role-selection', 'Pilih Peran Akun')}
            onNavigateProfile={() => handleNavigate('view-customer-profile', 'Informasi Akun')}
            onNavigateOrders={() => handleNavigate('view-customer-orders', 'Riwayat Pesanan')}
            onShowToast={showToast}
          />
        ) : activeView === 'view-customer-marketplace' ? (
          <CustomerMarketplace
            onNavigateHome={() => handleNavigate('view-customer-home', 'Beranda Pelanggan')}
            onNavigateSeller={() => handleNavigate('view-beranda', 'Beranda Toko')}
            onNavigateAuth={() => handleNavigate('view-auth-role-selection', 'Pilih Peran Akun')}
            onNavigateProfile={() => handleNavigate('view-customer-profile', 'Informasi Akun')}
            onNavigateOrders={() => handleNavigate('view-customer-orders', 'Riwayat Pesanan')}
            onNavigateDetail={(item: CustomerMysteryBox) => {
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
            onNavigateCheckout={(product: CustomerMysteryBox, qty: number) => {
              setCheckoutPayload({
                source: 'direct',
                items: [
                  {
                    id: product.id,
                    name: product.category ? product.category.replace(/^[^\w\s]+/, '').trim() : 'Mystery Bakery Box',
                    storeId: 'store-terasa',
                    storeName: (product.storeName && product.storeName !== 'TerasRasa Bakery') ? product.storeName : 'Toko Rejak',
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
            onNavigateDetail={(item: CustomerMysteryBox) => {
              setSelectedProduct(item);
              handleNavigate('view-customer-product-detail', 'Detail Produk');
            }}
            onNavigateCheckout={(items?: CheckoutItem[]) => {
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
            onNavigateOrderDetail={(orderData: PaymentOrderData) => {
              setPaymentOrderData(orderData);
              handleNavigate('view-customer-order-detail', 'Detail Pesanan');
            }}
            onNavigatePayment={(orderData: PaymentOrderData) => {
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
            onNavigateOrderDetail={(order: PaymentOrderData) => {
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
            onNavigateProductDetail={(item: CustomerMysteryBox) => {
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
            onSwitchRole={(nextRole: 'customer' | 'seller') => {
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
            onSwitchRole={(nextRole: 'customer' | 'seller') => {
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
                    storeName={storeName}
                    onShowToast={showToast}
                    onNavigateToOrders={(tabId: string) => handleNavigate('view-riwayat', 'Riwayat Pesanan', tabId as OrderStatusTab)}
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
      </Suspense>

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
