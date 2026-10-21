import { useState } from 'react';
import { OrderStatusTab, OrderTabItem } from '../types';
import emptyOrdersIllustration from '../assets/pesanan-kosong.svg';

export interface OrderHistoryProps {
  initialTab?: OrderStatusTab;
  onShowToast?: (message: string) => void;
}

const ORDER_TABS: OrderTabItem[] = [
  { id: 'diproses', label: 'Perlu Diproses' },
  { id: 'konfirmasi', label: 'Menunggu Konfirmasi' },
  { id: 'selesai', label: 'Pesanan Selesai' },
  { id: 'habis', label: 'Stok Habis' },
  { id: 'kendala', label: 'Kendala Pesanan' },
  { id: 'batal', label: 'Dibatalkan' },
];

/**
 * OrderHistory Page Component
 * Displays store order history segmented by operational tabs.
 * Styled with Tailwind CSS classes.
 */
export function OrderHistory({ initialTab = 'diproses', onShowToast }: OrderHistoryProps) {
  const [activeTab, setActiveTab] = useState<OrderStatusTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('semua');
  const [sortOrder, setSortOrder] = useState<string>('terbaru');

  const handleTabChange = (tabId: OrderStatusTab) => {
    setActiveTab(tabId);
  };

  return (
    <section className="flex flex-col gap-6" id="view-riwayat" aria-labelledby="heading-riwayat">
      <h2 className="text-xl font-bold text-gray-900 font-display" id="heading-riwayat">Riwayat Pesanan</h2>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col overflow-hidden">
        {/* Horizontal Navigation Tabs */}
        <div className="border-b border-gray-200/80 overflow-x-auto">
          <nav className="flex items-center min-w-max px-4" role="tablist" aria-label="Kategori Riwayat Pesanan">
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
                  className={`px-5 py-4 text-xs font-bold border-b-2 transition-all cursor-pointer select-none whitespace-nowrap ${
                    isActive ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
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
            <svg
              className="absolute left-3.5 text-gray-400 pointer-events-none"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-black bg-white"
              placeholder="Cari Nomor Pesanan"
              aria-label="Cari Nomor Pesanan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex items-center min-w-[150px]">
            <select
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-gray-700 hover:border-gray-300 focus:outline-black cursor-pointer"
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
            <svg
              className="absolute right-3 pointer-events-none text-gray-400"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center min-w-[160px]">
            <select
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-gray-700 hover:border-gray-300 focus:outline-black cursor-pointer"
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
            <svg
              className="absolute right-3 pointer-events-none text-gray-400"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Tab Panel Content / Empty State */}
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
          <h3 className="text-lg md:text-xl font-bold text-gray-900 font-display mb-2">
            Kamu belum memiliki pesanan
          </h3>
          <p className="text-xs md:text-sm text-gray-500 max-w-md leading-relaxed">
            Yuk jelajahi berbagai mystery box makanan dari restoran favorit di sekitarmu dan lakukan reservasi sekarang!
          </p>
        </div>
      </div>
    </section>
  );
}

export default OrderHistory;
