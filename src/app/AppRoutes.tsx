import React, { Suspense } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { BrandLoadingOverlay } from '../components/common/BrandLoadingOverlay';
import { getCurrentUser } from '../services/authService';
import type { ActiveViewId, OrderStatusTab, CustomerMysteryBox, CheckoutPayload, PaymentOrderData, CheckoutItem } from '../types';
import type { UseBrandLoadingReturn } from '../hooks/useBrandLoading';
import type { ToastType } from '../components/common/Toast';

// Code splitting level route menggunakan React.lazy() agar bundle size efisien
const CustomerHome = React.lazy(() => import('../pages/customer/CustomerHome').then((m) => ({ default: m.CustomerHome })));
const CustomerMarketplace = React.lazy(() => import('../pages/customer/CustomerMarketplace').then((m) => ({ default: m.CustomerMarketplace })));
const CustomerContact = React.lazy(() => import('../pages/customer/CustomerContact').then((m) => ({ default: m.CustomerContact })));
const CustomerProductDetail = React.lazy(() => import('../pages/customer/CustomerProductDetail').then((m) => ({ default: m.CustomerProductDetail })));
const CustomerCart = React.lazy(() => import('../pages/customer/CustomerCart').then((m) => ({ default: m.CustomerCart })));
const CustomerCheckout = React.lazy(() => import('../pages/customer/CustomerCheckout').then((m) => ({ default: m.CustomerCheckout })));
const CustomerOrderDetail = React.lazy(() => import('../pages/customer/CustomerOrderDetail').then((m) => ({ default: m.CustomerOrderDetail })));
const CustomerOrderHistory = React.lazy(() => import('../pages/customer/CustomerOrderHistory').then((m) => ({ default: m.CustomerOrderHistory })));
const CustomerStoreDetail = React.lazy(() => import('../pages/customer/CustomerStoreDetail').then((m) => ({ default: m.CustomerStoreDetail })));
const AuthRoleSelection = React.lazy(() => import('../pages/auth/AuthRoleSelection').then((m) => ({ default: m.AuthRoleSelection })));
const CustomerAuth = React.lazy(() => import('../pages/auth/CustomerAuth').then((m) => ({ default: m.CustomerAuth })));
const CustomerProfile = React.lazy(() => import('../pages/customer/CustomerProfile').then((m) => ({ default: m.CustomerProfile })));
const Dashboard = React.lazy(() => import('../pages/seller/Dashboard').then((m) => ({ default: m.Dashboard })));
const StoreProfile = React.lazy(() => import('../pages/seller/StoreProfile').then((m) => ({ default: m.StoreProfile })));
const OrderHistory = React.lazy(() => import('../pages/seller/OrderHistory').then((m) => ({ default: m.OrderHistory })));
const BuatDagangan = React.lazy(() => import('../pages/seller/BuatDagangan').then((m) => ({ default: m.BuatDagangan })));
const Daganganku = React.lazy(() => import('../pages/seller/Daganganku').then((m) => ({ default: m.Daganganku })));
const SellerReviews = React.lazy(() => import('../pages/seller/SellerReviews').then((m) => ({ default: m.SellerReviews })));
const PlaceholderPage = React.lazy(() => import('../pages/shared/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })));


export interface AppRoutesProps {
  activeView: ActiveViewId;
  activeLabel: string;
  orderTab: OrderStatusTab;
  selectedProduct: CustomerMysteryBox | null;
  setSelectedProduct: Dispatch<SetStateAction<CustomerMysteryBox | null>>;
  checkoutPayload: CheckoutPayload | null;
  setCheckoutPayload: Dispatch<SetStateAction<CheckoutPayload | null>>;
  paymentOrderData: PaymentOrderData | null;
  setPaymentOrderData: Dispatch<SetStateAction<PaymentOrderData | null>>;
  selectedStoreName: string;
  selectedStoreId?: string;
  storeName: string;
  setStoreName: Dispatch<SetStateAction<string>>;
  isMobileOpen: boolean;
  setIsMobileOpen: Dispatch<SetStateAction<boolean>>;
  isAuthenticated: boolean;
  showToast: (message: string, typeOrDuration?: ToastType | number, maybeDuration?: number) => void;
  handleNavigate: (viewId: string, label?: string, tab?: OrderStatusTab) => void;
  handleNavigateStore: (storeName?: string, storeId?: string, section?: string) => void;
  triggerLoading: UseBrandLoadingReturn['triggerLoading'];
}

export function AppRoutes({
  activeView, activeLabel, orderTab, selectedProduct, setSelectedProduct, checkoutPayload, setCheckoutPayload,
  paymentOrderData, setPaymentOrderData, selectedStoreName, selectedStoreId, storeName, setStoreName,
  isMobileOpen, setIsMobileOpen, isAuthenticated, showToast, handleNavigate, handleNavigateStore, triggerLoading,
}: AppRoutesProps) {
  return (
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
              if (!currentUser && !isAuthenticated) {
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
                    rating: product.rating || 0,
                    reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : Number(product.reviewCount) || 0,
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
                {activeView === 'view-ulasan' && (
                  <SellerReviews storeName={storeName} />
                )}
                {activeView !== 'view-beranda' &&
                  activeView !== 'view-profil' &&
                  activeView !== 'view-riwayat' &&
                  activeView !== 'view-buat-dagangan' &&
                  activeView !== 'view-daganganku' &&
                  activeView !== 'view-ulasan' && (
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
  );
}
