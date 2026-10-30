import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { OrderStatusTab, OrderTabItem } from '../types';
import emptyOrdersIllustration from '../assets/pesanan-kosong.svg';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';
import {
  MerchantOrderItem,
  getMerchantOrders,
  fetchMerchantOrdersApi,
  confirmMerchantOrder,
  processMerchantOrder,
  completeMerchantOrder,
  cancelMerchantOrder,
  subscribeToMerchantOrders,
} from '../services/orderService';
import { SellerOrderDetailModal } from '../components/seller/SellerOrderDetailModal';

export interface OrderHistoryProps {
  storeName?: string;
  initialTab?: OrderStatusTab;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const ORDER_TABS: OrderTabItem[] = [
  { id: 'perlu-konfirmasi', label: 'Perlu Dikonfirmasi' },
  { id: 'diproses', label: 'Perlu Diproses' },
  { id: 'siap-diambil', label: 'Siap Diambil' },
  { id: 'selesai', label: 'Pesanan Selesai' },
];

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * OrderHistory Page Component (Merchant View)
 * Displays store order history segmented by operational tabs matching Photo 2.
 * Includes interactive confirmation modal matching reference design.
 * Fully compliant with design.md and antislop guidelines.
 */
export function OrderHistory({ storeName: propStoreName, initialTab = 'perlu-konfirmasi', onShowToast }: OrderHistoryProps) {
  const currentStore = propStoreName || (typeof window !== 'undefined' ? localStorage.getItem('rescuebyte_store_name') || undefined : undefined);
  const validTabIds = ORDER_TABS.map((t) => t.id);
  const resolvedInitialTab = validTabIds.includes(initialTab)
    ? initialTab
    : (initialTab as string) === 'konfirmasi'
      ? 'perlu-konfirmasi'
      : (initialTab as string) === 'batal'
        ? 'selesai'
        : 'perlu-konfirmasi';
  const [activeTab, setActiveTab] = useState<OrderStatusTab>(resolvedInitialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('semua');
  const [sortOrder, setSortOrder] = useState<string>('terbaru');
  const [orders, setOrders] = useState<MerchantOrderItem[]>(() => getMerchantOrders(currentStore));
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal State for order confirmation popup
  const [selectedModalOrder, setSelectedModalOrder] = useState<MerchantOrderItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setOrders(getMerchantOrders(currentStore));
    fetchMerchantOrdersApi(currentStore).then((apiOrders) => {
      if (apiOrders && apiOrders.length > 0) {
        setOrders(getMerchantOrders(currentStore));
      }
    });

    const unsubscribe = subscribeToMerchantOrders((latest) => {
      setOrders(latest);
    }, currentStore);

    const handleStoreChange = () => {
      const updated = localStorage.getItem('rescuebyte_store_name') || undefined;
      setOrders(getMerchantOrders(updated));
    };

    window.addEventListener('rescuebyte_store_updated', handleStoreChange);

    return () => {
      unsubscribe();
      window.removeEventListener('rescuebyte_store_updated', handleStoreChange);
    };
  }, [currentStore, activeTab]);

  const handleTabChange = (tabId: OrderStatusTab) => {
    setActiveTab(tabId);
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Tab matching
        if (order.status !== activeTab) {
          return false;
        }

        // Search query matching (nomor pesanan, nama pembeli, nama produk)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchNumber = (order.orderNumber || '').toLowerCase().includes(q);
          const matchCustomer = (order.customerName || '').toLowerCase().includes(q);
          const matchProduct = (order.productName || '').toLowerCase().includes(q);
          if (!matchNumber && !matchCustomer && !matchProduct) {
            return false;
          }
        }

        // Category filter matching
        if (filterType === 'mystery-box') {
          return (order.productName || '').toLowerCase().includes('mystery');
        } else if (filterType === 'reguler') {
          return !(order.productName || '').toLowerCase().includes('mystery');
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'terlama') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortOrder === 'nominal-tinggi') {
          return b.grandTotal - a.grandTotal;
        } else if (sortOrder === 'nominal-rendah') {
          return a.grandTotal - b.grandTotal;
        }
        // Default: terbaru
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [orders, activeTab, searchQuery, filterType, sortOrder]);

  const handleOpenConfirmModal = (order: MerchantOrderItem) => {
    setSelectedModalOrder(order);
    setIsModalOpen(true);
  };

  const handleModalConfirm = async (order: MerchantOrderItem) => {
    setProcessingId(order.id);
    try {
      await confirmMerchantOrder(order.id);
      setOrders(getMerchantOrders(currentStore));
      setIsModalOpen(false);
      setSelectedModalOrder(null);
      if (onShowToast) {
        onShowToast(`Pesanan ${order.orderNumber} berhasil dikonfirmasi!`, 'success');
      }
    } catch (err) {
      console.warn('Gagal konfirmasi pesanan:', err);
      if (onShowToast) onShowToast('Gagal mengonfirmasi pesanan.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleModalCancel = async (order: MerchantOrderItem) => {
    setProcessingId(order.id);
    try {
      await cancelMerchantOrder(order.id);
      setOrders(getMerchantOrders(currentStore));
      setIsModalOpen(false);
      setSelectedModalOrder(null);
      if (onShowToast) {
        onShowToast(`Pesanan ${order.orderNumber} telah dibatalkan.`, 'info');
      }
    } catch (err) {
      console.warn('Gagal membatalkan pesanan:', err);
      if (onShowToast) onShowToast('Gagal membatalkan pesanan.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessReady = async (order: MerchantOrderItem) => {
    setProcessingId(order.id);
    try {
      await processMerchantOrder(order.id);
      setOrders(getMerchantOrders(currentStore));
      if (onShowToast) {
        onShowToast(`Pesanan ${order.orderNumber} sudah diproses & siap diambil!`, 'success');
      }
    } catch (err) {
      console.warn('Gagal memproses pesanan:', err);
      if (onShowToast) onShowToast('Gagal memproses pesanan.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (order: MerchantOrderItem) => {
    setProcessingId(order.id);
    try {
      await completeMerchantOrder(order.id);
      setOrders(getMerchantOrders(currentStore));
      if (onShowToast) {
        onShowToast(`Pesanan ${order.orderNumber} telah diserahkan & selesai!`, 'success');
      }
    } catch (err) {
      console.warn('Gagal selesaikan pesanan:', err);
      if (onShowToast) onShowToast('Gagal memproses pesanan.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="flex flex-col gap-6" id="view-riwayat" aria-labelledby="heading-riwayat">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight" id="heading-riwayat">
        Riwayat Pesanan
      </h2>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col overflow-hidden">
        {/* Horizontal Navigation Tabs */}
        <div className="border-b border-gray-200/80 overflow-x-auto">
          <nav
            className="grid grid-cols-4 min-w-[500px] sm:min-w-full w-full"
            role="tablist"
            aria-label="Kategori Riwayat Pesanan"
          >
            {ORDER_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  className={`py-4 px-2 text-center text-xs sm:text-sm md:text-base font-bold border-b-2 transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3c6a00] focus-visible:outline-offset-[-2px] ${
                    isActive
                      ? 'border-[#3c6a00] text-[#3c6a00]'
                      : 'border-transparent text-gray-800 hover:text-[#3c6a00]'
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filter & Search Bar matching Photo 2 */}
        <div className="p-4 md:p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-b border-gray-100">
          {/* Search Box */}
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 text-gray-400 pointer-events-none w-4.5 h-4.5" aria-hidden="true" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-[#3c6a00] bg-white transition-colors"
              placeholder="Cari Nomor Pesanan"
              aria-label="Cari Nomor Pesanan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex items-center min-w-[150px]">
            <select
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-gray-700 hover:border-gray-300 focus:outline-[#3c6a00] cursor-pointer shadow-xs"
              aria-label="Pilih Filter Kategori"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                if (onShowToast) onShowToast('Filter kategori diperbarui', 'info');
              }}
            >
              <option value="semua">Pilih Filter</option>
              <option value="reguler">Pesanan Reguler</option>
              <option value="mystery-box">Mystery Box</option>
            </select>
            <ChevronDown className="absolute right-3 pointer-events-none text-gray-400 w-4 h-4" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center min-w-[160px]">
            <select
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-gray-700 hover:border-gray-300 focus:outline-[#3c6a00] cursor-pointer shadow-xs"
              aria-label="Urutkan Tanggal Pesanan"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                if (onShowToast) onShowToast('Urutan tanggal diperbarui', 'info');
              }}
            >
              <option value="terbaru">Tanggal Terbaru</option>
              <option value="terlama">Tanggal Terlama</option>
              <option value="nominal-tinggi">Nominal Tertinggi</option>
              <option value="nominal-rendah">Nominal Terendah</option>
            </select>
            <ChevronDown className="absolute right-3 pointer-events-none text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Tab Panel Content / Orders List */}
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="min-h-[360px]"
        >
          {filteredOrders.length === 0 ? (
            /* Empty State */
            <div className="p-8 md:p-14 flex flex-col items-center text-center justify-center min-h-[360px]">
              <img
                src={emptyOrdersIllustration}
                alt="Ilustrasi belum ada pesanan"
                className="w-48 sm:w-60 h-auto mb-6 object-contain"
              />
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                Belum Ada Pesanan Masuk
              </h3>
              <p className="text-xs md:text-sm text-gray-500 max-w-md leading-relaxed">
                Belum ada pesanan pada status ini. Pesanan baru dari pelanggan akan otomatis ditampilkan di sini.
              </p>
            </div>
          ) : (
            /* Order Rows strictly matching Photo 2 UI */
            <div className="flex flex-col divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fafaf8] transition-colors"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/80 shadow-2xs">
                      <img
                        src={order.productImage || cardMonsieurSpoon}
                        alt={order.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = cardMonsieurSpoon;
                        }}
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate leading-snug">
                        {order.productName}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
                        {order.customerName}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-[#ba1a1a]">
                          Rp {formatRupiah(order.rescuePrice)}
                        </span>
                        {order.originalPrice > order.rescuePrice && (
                          <span className="text-xs text-gray-400 line-through">
                            Rp {formatRupiah(order.originalPrice)}
                          </span>
                        )}
                        {order.discountPercent > 0 && (
                          <span className="text-[10px] font-bold text-[#b45309] bg-[#fef3c7] px-1.5 py-0.5 rounded">
                            {order.discountPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Total Price (centered on desktop) */}
                  <div className="sm:text-center shrink-0">
                    <span className="font-bold text-sm sm:text-base text-gray-900">
                      Rp {formatRupiah(order.grandTotal)}
                    </span>
                  </div>

                  {/* Right: Action Button or Status Badge */}
                  <div className="shrink-0 flex items-center justify-end">
                    {activeTab === 'perlu-konfirmasi' && (
                      <button
                        type="button"
                        onClick={() => handleOpenConfirmModal(order)}
                        disabled={processingId === order.id}
                        className="w-full sm:w-auto bg-[#3c6a00] hover:bg-[#325800] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {processingId === order.id ? 'Memproses...' : 'Konfirmasi Pesanan'}
                      </button>
                    )}
                    {activeTab === 'diproses' && (
                      <button
                        type="button"
                        onClick={() => handleProcessReady(order)}
                        disabled={processingId === order.id}
                        className="w-full sm:w-auto bg-[#3c6a00] hover:bg-[#325800] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {processingId === order.id ? 'Memproses...' : 'Sudah Diproses'}
                      </button>
                    )}
                    {activeTab === 'siap-diambil' && (
                      <button
                        type="button"
                        onClick={() => handleComplete(order)}
                        disabled={processingId === order.id}
                        className="w-full sm:w-auto bg-[#1F2A24] hover:bg-[#2C3B33] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {processingId === order.id ? 'Memproses...' : 'Pesanan Selesai'}
                      </button>
                    )}
                    {activeTab === 'selesai' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        Selesai
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Popup Modal matching User's Image */}
      <SellerOrderDetailModal
        order={selectedModalOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedModalOrder(null);
        }}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        onShowToast={onShowToast}
      />
    </section>
  );
}

export default OrderHistory;
