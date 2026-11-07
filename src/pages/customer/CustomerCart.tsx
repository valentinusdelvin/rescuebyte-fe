import { useCustomerCart } from '../../hooks/useCustomerCart';
import { CartStoreGroup as CartStoreGroupCard } from '../../components/customer/cart/CartStoreGroup';
import { CartSummary } from '../../components/customer/cart/CartSummary';
import {
  Lock,
  User,
  ShoppingBag,
} from 'lucide-react';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerFooter } from '../../components/customer/CustomerFooter';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { CartItem, StoreCartGroup, CustomerMysteryBox } from '../../types';
import { formatRupiah } from '../../utils/currency';

export type { CartItem, StoreCartGroup };

export interface CustomerCartProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateSeller?: () => void;
  onNavigateCheckout?: (items?: import('../../types').CheckoutItem[]) => void;
  onNavigateStore?: (storeName: string) => void;
  onNavigateDetail?: (item: CustomerMysteryBox) => void;
  onShowToast?: (message: string) => void;
}

export function CustomerCart({
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateSeller,
  onNavigateCheckout,
  onNavigateStore,
  onNavigateDetail,
  onShowToast,
}: CustomerCartProps) {
  const {
    cartStores, isAuthModalOpen, setIsAuthModalOpen, deleteTarget, setDeleteTarget,
    handleStoreClick, handleItemClick, selectedItemIds, toggleItemSelection, isStoreAllSelected, toggleStoreSelection,
    totalBoxes, subtotal, discountTotal, serviceFee, grandTotal,
    handleIncrease, handleDecrease, handlePromptRemoveItem, handlePromptRemoveStore, handleConfirmDelete, handleCheckout, handleHeaderTab,
    formatStorePickupTime,
  } = useCustomerCart({ onNavigateHome, onNavigateMarketplace, onNavigateCheckout, onNavigateStore, onNavigateDetail, onShowToast });

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between" id="cart-page-root">
      <div>
        {/* 1. Floating Pill Header (Active on Marketplace as per Figma) */}
        <CustomerHeader
          activeTab="marketplace"
          onSelectTab={handleHeaderTab}
          onNavigateSeller={onNavigateSeller}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* 2. Main Content Grid */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 max-sm:pb-28">
          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              Keranjang Saya
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Periksa kembali pesananmu sebelum melanjutkan ke checkout.
            </p>
          </div>

          {cartStores.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Stores & Items */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {cartStores.map((store) => (
                  <CartStoreGroupCard
                    key={store.storeId}
                    store={store}
                    selectedItemIds={selectedItemIds}
                    isStoreAllSelected={isStoreAllSelected}
                    toggleStoreSelection={toggleStoreSelection}
                    toggleItemSelection={toggleItemSelection}
                    handleStoreClick={handleStoreClick}
                    handleItemClick={handleItemClick}
                    handleDecrease={handleDecrease}
                    handleIncrease={handleIncrease}
                    handlePromptRemoveStore={handlePromptRemoveStore}
                    handlePromptRemoveItem={handlePromptRemoveItem}
                    formatStorePickupTime={formatStorePickupTime}
                  />
                ))}
              </div>

              {/* RIGHT COLUMN: Info Cards & Order Summary */}
              <CartSummary
                totalBoxes={totalBoxes}
                subtotal={subtotal}
                discountTotal={discountTotal}
                serviceFee={serviceFee}
                grandTotal={grandTotal}
                onCheckout={handleCheckout}
              />
            </div>
          ) : (
            /* Empty State */
            <div className="w-full py-16 px-4 bg-white rounded-3xl border border-black/10 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-brand-green" strokeWidth={1.75} />
              </div>
              <h3 className="font-bold text-lg text-[#1b1c1c]">Keranjangmu Kosong</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mt-1 mb-5">
                Belum ada Mystery Box di keranjangmu. Jelajahi aneka paket makanan lezat dan hemat di sekitarmu!
              </p>
              <button
                type="button"
                onClick={onNavigateMarketplace || (() => { window.location.hash = '#marketplace'; })}
                className="px-6 py-2.5 bg-[#1e2420] text-white text-xs font-bold rounded-full hover:bg-black transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Jelajahi Marketplace
              </button>
            </div>
          )}
        </main>

        {/* Mobile Sticky Checkout Action Bar */}
        {cartStores.length > 0 && (
          <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-outline-variant p-4 z-40 shadow-level-3 flex items-center justify-between gap-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div>
              <span className="text-[11px] text-gray-500 block">Total ({totalBoxes} box)</span>
              <span className="text-lg font-bold font-display text-primary">Rp {formatRupiah(grandTotal)}</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={totalBoxes === 0}
              className="px-5 py-2.5 rounded-xl bg-[#1f2620] hover:bg-black disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Checkout</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Customer Footer */}
      <CustomerFooter variant="compact"
        onNavigateSeller={onNavigateSeller}
      />

      {/* 4. Quick Auth Modal */}
      {isAuthModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
              <User className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#1b1c1c]">Masuk ke RescueBite</h3>
            <p className="text-xs text-gray-500">
              Masuk untuk memesan mystery box dan menyimpan pesanan favoritmu.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#0b1510] text-white rounded-xl font-semibold text-sm hover:bg-[#202a24] transition-colors cursor-pointer"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  if (onShowToast) onShowToast('Selamat datang kembali, Reza Akbar!');
                }}
              >
                Masuk sebagai Reza Akbar
              </button>
              <button
                type="button"
                className="w-full py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setIsAuthModalOpen(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === 'store' ? 'Hapus Semua Pesanan?' : 'Hapus Item dari Keranjang?'}
        itemName={deleteTarget?.type === 'store' ? deleteTarget.storeName : (deleteTarget?.itemName || '')}
        message={
          deleteTarget?.type === 'store'
            ? `Apakah kamu yakin ingin menghapus semua pesanan dari "${deleteTarget.storeName}" dari keranjang?`
            : `Apakah kamu yakin ingin menghapus "${deleteTarget?.itemName}" dari keranjang?`
        }
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default CustomerCart;
