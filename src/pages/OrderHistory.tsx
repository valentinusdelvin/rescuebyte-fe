import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { OrderStatusTab, OrderTabItem } from '../types';
import emptyOrdersIllustration from '../assets/pesanan-kosong.svg';

export interface OrderHistoryProps {
  initialTab?: OrderStatusTab;
  onShowToast?: (message: string) => void;
}

const ORDER_TABS: OrderTabItem[] = [
  { id: 'diproses', label: 'Perlu Diproses' },
  { id: 'konfirmasi', label: 'Perlu Dikonfirmasi' },
  { id: 'selesai', label: 'Pesanan Selesai' },
  { id: 'batal', label: 'Dibatalkan' },
];

/**
 * OrderHistory Page Component
 * Displays store order history segmented by operational tabs.
 * Styled with Tailwind CSS classes.
 */
export function OrderHistory({ initialTab = 'diproses', onShowToast }: OrderHistoryProps) {
  const validTabIds = ORDER_TABS.map((t) => t.id);
  const resolvedInitialTab = validTabIds.includes(initialTab) ? initialTab : 'diproses';
  const [activeTab, setActiveTab] = useState<OrderStatusTab>(resolvedInitialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('semua');
  const [sortOrder, setSortOrder] = useState<string>('terbaru');

  const handleTabChange = (tabId: OrderStatusTab) => {
    setActiveTab(tabId);
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
                  className={`py-4 px-2 text-center text-xs sm:text-sm md:text-base font-bold border-b-2 transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#15803d] focus-visible:outline-offset-[-2px] ${
                    isActive
                      ? 'border-[#15803d] text-[#15803d]'
                      : 'border-transparent text-gray-800 hover:text-[#15803d]'
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 md:p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-b border-gray-100">
          {/* Search Box */}
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 text-gray-400 pointer-events-none w-4.5 h-4.5" aria-hidden="true" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-black bg-white"
              placeholder="Cari Nomor Pesanan"
              aria-label="Cari Nomor Pesanan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex items-center min-w-[150px]">
            <select
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-gray-700 hover:border-gray-300 focus:outline-black cursor-pointer shadow-xs"
              aria-label="Pilih Filter Kategori"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                if (onShowToast) onShowToast('Filter kategori diperbarui');
              }}
            >
              <option value="semua">Pilih Filter</option>
              <option value="reguler">Pesanan Reguler</option>
              <option value="instan">Pengiriman Instan</option>
              <option value="mystery-box">Mystery Box</option>
            </select>
            <ChevronDown className="absolute right-3 pointer-events-none text-gray-400 w-4 h-4" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center min-w-[160px]">
            <select
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-gray-700 hover:border-gray-300 focus:outline-black cursor-pointer shadow-xs"
              aria-label="Urutkan Tanggal Pesanan"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                if (onShowToast) onShowToast('Urutan tanggal diperbarui');
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

        {/* Tab Panel Content / Empty State (placeholder dikosongkan seperti sekarang) */}
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="p-8 md:p-14 flex flex-col items-center text-center justify-center min-h-[360px]"
        >
          <img
            src={emptyOrdersIllustration}
            alt="Ilustrasi mystery box belum ada pesanan"
            className="w-48 sm:w-60 h-auto mb-6 object-contain"
          />
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
            Belum Ada Pesanan Masuk
          </h3>
          <p className="text-xs md:text-sm text-gray-500 max-w-md leading-relaxed">
            Belum ada pesanan pada status ini. Pesanan baru dari pelanggan akan otomatis ditampilkan di sini.
          </p>
        </div>
      </div>
    </section>
  );
}

export default OrderHistory;
