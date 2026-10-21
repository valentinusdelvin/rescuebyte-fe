import { useState, useMemo } from 'react';
import { ProductItem, ProductStatusTab } from '../types';
import { getStoredProducts, updateProduct, deleteProduct, formatRupiah } from '../services/productService';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import mystBoxImg from '../assets/myst-box.svg';

export interface DagangankuProps {
  onShowToast?: (message: string) => void;
  onNavigateToCreate?: () => void;
  onTriggerLoading?: (title?: string, subtitle?: string, durationMs?: number) => Promise<void>;
}

const PRODUCT_TABS: { id: ProductStatusTab; label: string }[] = [
  { id: 'semua', label: 'Semua Produk' },
  { id: 'aktif', label: 'Aktif' },
  { id: 'segera_habis', label: 'Segera Habis' },
  { id: 'habis', label: 'Habis' },
];

/**
 * Daganganku Page Component
 * Displays merchant active products list segmented by status tabs,
 * with search, filtering, and stock/status actions.
 * Complies with .agents/docs/architecture.md and .agents/docs/typescript.md.
 */
export function Daganganku({
  onShowToast,
  onNavigateToCreate,
  onTriggerLoading,
}: DagangankuProps) {
  const [products, setProducts] = useState<ProductItem[]>(() => getStoredProducts());
  const [activeTab, setActiveTab] = useState<ProductStatusTab>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('semua');
  const [sortOrder, setSortOrder] = useState<string>('terbaru');
  const [itemToDelete, setItemToDelete] = useState<ProductItem | null>(null);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Tab status filter
    if (activeTab === 'aktif') {
      result = result.filter((p) => p.status === 'aktif' && p.stock > 0);
    } else if (activeTab === 'segera_habis') {
      result = result.filter((p) => p.status === 'segera_habis' || (p.stock > 0 && p.stock <= 2));
    } else if (activeTab === 'habis') {
      result = result.filter((p) => p.status === 'habis' || p.stock === 0);
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // 3. Category / Preset filter
    if (filterCategory === 'diskon_tinggi') {
      result.sort((a, b) => {
        const discA = (a.normalPrice - a.rescuePrice) / a.normalPrice;
        const discB = (b.normalPrice - b.rescuePrice) / b.normalPrice;
        return discB - discA;
      });
    } else if (filterCategory === 'stok_sedikit') {
      result.sort((a, b) => a.stock - b.stock);
    }

    // 4. Sort order
    if (sortOrder === 'terbaru') {
      // Keep default or by ID
    } else if (sortOrder === 'terlama') {
      result.reverse();
    } else if (sortOrder === 'harga_terendah') {
      result.sort((a, b) => a.rescuePrice - b.rescuePrice);
    } else if (sortOrder === 'harga_tertinggi') {
      result.sort((a, b) => b.rescuePrice - a.rescuePrice);
    }

    return result;
  }, [products, activeTab, searchQuery, filterCategory, sortOrder]);

  const handleToggleStatus = async (item: ProductItem) => {
    const nextStatus = item.status === 'aktif' ? 'habis' : 'aktif';
    const nextStock = nextStatus === 'aktif' && item.stock === 0 ? 5 : item.stock;

    if (onTriggerLoading) {
      await onTriggerLoading(
        'Memperbarui Status Produk...',
        `Mengubah status ${item.name} menjadi ${nextStatus === 'aktif' ? 'Aktif' : 'Nonaktif'}`
      );
    }

    const updated = updateProduct(item.id, {
      status: nextStatus,
      stock: nextStock,
    });
    setProducts(updated);

    if (onShowToast) {
      onShowToast(`Status "${item.name}" diubah menjadi ${nextStatus === 'aktif' ? 'Aktif' : 'Nonaktif'}`);
    }
  };

  const handleRequestDelete = (item: ProductItem) => {
    setItemToDelete(item);
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setItemToDelete(null);

    if (onTriggerLoading) {
      await onTriggerLoading('Menghapus Produk...', 'Memperbarui etalase toko', 800);
    }
    const updated = deleteProduct(target.id);
    setProducts(updated);
    if (onShowToast) onShowToast(`Produk "${target.name}" berhasil dihapus`);
  };

  return (
    <section className="page-view active" id="view-daganganku" aria-labelledby="heading-daganganku">
      <h2 className="section-title" id="heading-daganganku">Daganganku</h2>

      <div className="daganganku-main-card">
        {/* Horizontal Navigation Tabs */}
        <div className="order-tabs-wrapper">
          <nav className="order-tabs-list" role="tablist" aria-label="Filter Status Dagangan">
            {PRODUCT_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-product-${tab.id}`}
                  aria-selected={isActive}
                  className={`order-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
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
              placeholder="Cari Nama Produk..."
              aria-label="Cari Nama Produk"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="order-filter-dropdown">
            <select
              className="order-filter-select"
              aria-label="Pilih Filter Kategori"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="semua">Pilih Filter</option>
              <option value="diskon_tinggi">Diskon Tertinggi</option>
              <option value="stok_sedikit">Stok Menipis</option>
            </select>
            <svg className="order-filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Sort Dropdown */}
          <div className="order-filter-dropdown order-sort-dropdown">
            <select
              className="order-filter-select"
              aria-label="Urutan Tanggal"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="terbaru">Tanggal Terbaru</option>
              <option value="terlama">Tanggal Terlama</option>
              <option value="harga_terendah">Harga Terendah</option>
              <option value="harga_tertinggi">Harga Tertinggi</option>
            </select>
            <svg className="order-filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Product Items List */}
        <div className="product-list-container">
          {filteredProducts.length === 0 ? (
            <div className="daganganku-empty-state">
              <div className="empty-box-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              <h3 className="empty-state-title">Belum ada dagangan pada filter ini</h3>
              <p className="empty-state-sub">
                {searchQuery
                  ? `Tidak ada produk yang cocok dengan "${searchQuery}".`
                  : 'Mulai buat paket mystery box atau surplus makanan untuk toko Anda sekarang.'}
              </p>
              {onNavigateToCreate && (
                <button
                  type="button"
                  className="btn-save-primary mt-4"
                  onClick={onNavigateToCreate}
                >
                  Buat Dagangan Sekarang
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((item) => {
              const isAktif = item.status === 'aktif' && item.stock > 0;
              const isSegeraHabis = item.status === 'segera_habis' || (item.stock > 0 && item.stock <= 2);

              return (
                <article key={item.id} className="product-row-card">
                  {/* Left: Thumbnail */}
                  <div className="product-row-thumb">
                    <img
                      src={item.imageUrl || mystBoxImg}
                      alt={item.name}
                      className="product-row-img"
                    />
                  </div>

                  {/* Center: Info */}
                  <div className="product-row-info">
                    <h4 className="product-row-title">{item.name}</h4>
                    <p className="product-row-desc">{item.description}</p>
                    <span className="product-row-date">{item.createdAt}</span>
                  </div>

                  {/* Metrics Col 1: Stok */}
                  <div className="product-row-metric metric-stock">
                    <span className="metric-label">Stok</span>
                    <div className="metric-stock-value">
                      <span className="stock-number">{item.stock}</span>
                      <span className="stock-divider">/{item.maxStock || 10}</span>
                    </div>
                  </div>

                  {/* Metrics Col 2: Harga */}
                  <div className="product-row-metric metric-price">
                    <span className="metric-label">Harga</span>
                    <div className="price-stack">
                      <span className="price-rescue">{formatRupiah(item.rescuePrice)}</span>
                      <span className="price-normal">{formatRupiah(item.normalPrice)}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="product-row-status">
                    <span className="metric-label">Status</span>
                    <button
                      type="button"
                      className={`product-status-pill ${isAktif ? 'status-active' : isSegeraHabis ? 'status-warning' : 'status-inactive'
                        }`}
                      title="Klik untuk mengubah status aktif/nonaktif"
                      onClick={() => handleToggleStatus(item)}
                    >
                      {isAktif ? 'Aktif' : isSegeraHabis ? 'Segera Habis' : 'Habis'}
                    </button>
                  </div>

                  {/* Optional Delete/Quick action */}
                  <button
                    type="button"
                    className="product-row-delete-btn"
                    title="Hapus Produk"
                    aria-label={`Hapus ${item.name}`}
                    onClick={() => handleRequestDelete(item)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={itemToDelete !== null}
        itemName={itemToDelete?.name || ''}
        onConfirm={handleExecuteDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </section>
  );
}
