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
 * Displays store order history segmented by operational tabs (Perlu Diproses, Menunggu Konfirmasi, etc.).
 * Includes searching by order number, filter by type, and date sorting with an empty state illustration.
 * Complies with .agents/docs/architecture.md and .agents/docs/typescript.md.
 */
export function OrderHistory({ initialTab = 'diproses', onShowToast }: OrderHistoryProps) {
  const [activeTab, setActiveTab] = useState<OrderStatusTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('semua');
  const [sortOrder, setSortOrder] = useState<string>('terbaru');

  const handleTabChange = (tabId: OrderStatusTab, label: string) => {
    setActiveTab(tabId);
    if (onShowToast) {
      onShowToast(`Menampilkan pesanan: ${label}`);
    }
  };

  return (
    <section className="page-view active" id="view-riwayat" aria-labelledby="heading-riwayat">
      <h2 className="section-title" id="heading-riwayat">Riwayat Pesanan</h2>

      <div className="order-history-card">
        {/* Horizontal Navigation Tabs */}
        <div className="order-tabs-wrapper">
          <nav className="order-tabs-list" role="tablist" aria-label="Kategori Riwayat Pesanan">
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
                  className={`order-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id, tab.label)}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filter & Search Bar */}
        <div className="order-filters-row">
          {/* Search Box */}
          <div className="order-search-box">
            <svg
              className="order-search-icon"
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
              className="order-search-input"
              placeholder="Cari Nomor Pesanan"
              aria-label="Cari Nomor Pesanan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="order-filter-dropdown">
            <select
              className="order-filter-select"
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
              className="order-filter-chevron"
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
          <div className="order-filter-dropdown order-sort-dropdown">
            <select
              className="order-filter-select"
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
              className="order-filter-chevron"
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
          className="order-content-area"
        >
          <div className="order-empty-state">
            <img
              src={emptyOrdersIllustration}
              alt="Ilustrasi mystery box belum ada pesanan"
              className="order-empty-illustration"
            />
            <h3 className="order-empty-title">
              Kamu belum memiliki <span className="order-empty-highlight">pesanan</span>
            </h3>
            <p className="order-empty-desc">
              Yuk jelajahi berbagai mystery box makanan dari restoran favorit di sekitarmu dan lakukan reservasi sekarang!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrderHistory;
