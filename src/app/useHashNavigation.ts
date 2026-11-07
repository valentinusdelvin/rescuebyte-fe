import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ActiveViewId, OrderStatusTab, CustomerMysteryBox, PaymentOrderData } from '../types';
import type { ToastType } from '../components/common/Toast';
import { getCurrentUser } from '../services/authService';
import { fetchOrderDetailApi } from '../services/orderService';
import { productApi } from '../api/services/productApi';
import { isCustomerOrderDetailPath, parseHash, safeDecode } from './hashRouting';
import { findOrderById } from './orderRouteData';

interface UseHashNavigationOptions {
  showToast: (message: string, typeOrDuration?: ToastType | number, maybeDuration?: number) => void;
  isAuthenticated: boolean;
  paymentOrderData: PaymentOrderData | null;
  setPaymentOrderData: Dispatch<SetStateAction<PaymentOrderData | null>>;
  selectedProduct: CustomerMysteryBox | null;
  setSelectedProduct: Dispatch<SetStateAction<CustomerMysteryBox | null>>;
  setSelectedStoreName: Dispatch<SetStateAction<string>>;
  setSelectedStoreId: Dispatch<SetStateAction<string | undefined>>;
  setActiveView: Dispatch<SetStateAction<ActiveViewId>>;
  setActiveLabel: Dispatch<SetStateAction<string>>;
  setOrderTab: Dispatch<SetStateAction<OrderStatusTab>>;
}

export function useHashNavigation({
  showToast, isAuthenticated, paymentOrderData, setPaymentOrderData, selectedProduct, setSelectedProduct,
  setSelectedStoreName, setSelectedStoreId, setActiveView, setActiveLabel, setOrderTab,
}: UseHashNavigationOptions) {
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
        if (!getCurrentUser() && !isAuthenticated) {
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
        if (!currentUser && !isAuthenticated) {
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
        if (!currentUser && !isAuthenticated) {
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
        if (!currentUser && !isAuthenticated) {
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
        if (!currentUser && !isAuthenticated) {
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
        if (!currentUser && !isAuthenticated) {
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
        if (!currentUser && !isAuthenticated) {
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
  }, [showToast, paymentOrderData, selectedProduct, isAuthenticated]);
}
