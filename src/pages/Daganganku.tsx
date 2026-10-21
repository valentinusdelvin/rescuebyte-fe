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
 * Displays merchant active products list segmented by status tabs.
 * Styled with Tailwind CSS classes.
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
      // Keep default
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
      onShowToast(`Status "${item.name}" berhasil diubah menjadi ${nextStatus === 'aktif' ? 'Aktif' : 'Habis'}`);
    }
  };

  const handleRequestDelete = (item: ProductItem) => {
    setItemToDelete(item);
  };

  const handleExecuteDelete = () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    const updated = deleteProduct(target.id);
    setProducts(updated);
    setItemToDelete(null);
    if (onShowToast) onShowToast(`Produk "${target.name}" berhasil dihapus`);
  };

  return (
    <section className="flex flex-col gap-6" id="view-daganganku" aria-labelledby="heading-daganganku">
      <h2 className="text-xl font-bold text-gray-900 font-display" id="heading-daganganku">Daganganku</h2>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col overflow-hidden">
        {/* Horizontal Navigation Tabs */}
        <div className="border-b border-gray-200/80 overflow-x-auto">
          <nav className="flex items-center min-w-max px-4" role="tablist" aria-label="Filter Status Dagangan">
            {PRODUCT_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-product-${tab.id}`}
                  aria-selected={isActive}
                  className={`px-5 py-4 text-xs font-bold border-b-2 transition-all cursor-pointer select-none whitespace-nowrap ${
                    isActive ? 'border-[#15803d] text-[#15803d]' : 'border-transparent text-gray-500 hover:text-[#15803d]'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-black bg-white"
              placeholder="Cari Nama Produk..."
              aria-label="Cari Nama Produk"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex items-center min-w-[150px]">
            <select
              className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-gray-700 hover:border-black focus:outline-black cursor-pointer"
              aria-label="Pilih Filter Kategori"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="semua">Pilih Filter</option>
              <option value="diskon_tinggi">Diskon Tertinggi</option>
              <option value="stok_sedikit">Stok Menipis</option>
            </select>
            <svg className="absolute right-3 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center min-w-[160px]">
            <select
              className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-semibold text-gray-700 hover:border-black focus:outline-black cursor-pointer"
              aria-label="Urutan Tanggal"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="terbaru">Tanggal Terbaru</option>
              <option value="terlama">Tanggal Terlama</option>
              <option value="harga_terendah">Harga Terendah</option>
              <option value="harga_tertinggi">Harga Tertinggi</option>
            </select>
            <svg className="absolute right-3 pointer-events-none text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Product Items List */}
        <div className="p-4 md:p-6 flex flex-col gap-3">
          {filteredProducts.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 font-display">Belum ada dagangan pada filter ini</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                {searchQuery
                  ? `Tidak ada produk yang cocok dengan "${searchQuery}".`
                  : 'Mulai buat paket mystery box atau surplus makanan untuk toko Anda sekarang.'}
              </p>
              {onNavigateToCreate && (
                <button
                  type="button"
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] active:scale-[0.98] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
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
                <article key={item.id} className="p-4 rounded-2xl border border-gray-200/80 bg-white hover:border-gray-400 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Left: Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img
                      src={item.imageUrl || mystBoxImg}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Center: Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
                    <span className="text-[11px] text-gray-400 mt-1">{item.createdAt}</span>
                  </div>

                  {/* Metrics Col 1: Stok */}
                  <div className="flex flex-col items-start sm:items-center min-w-[70px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stok</span>
                    <div className="mt-0.5">
                      <span className="text-sm font-bold text-gray-900">{item.stock}</span>
                      <span className="text-xs text-gray-400 font-normal">/{item.maxStock || 10}</span>
                    </div>
                  </div>

                  {/* Metrics Col 2: Harga */}
                  <div className="flex flex-col items-start sm:items-end min-w-[110px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Harga</span>
                    <div className="flex flex-col items-start sm:items-end mt-0.5">
                      <span className="text-sm font-extrabold text-black font-display">{formatRupiah(item.rescuePrice)}</span>
                      <span className="text-[11px] text-gray-400 line-through">{formatRupiah(item.normalPrice)}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-start sm:items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
                    <button
                      type="button"
                      className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 cursor-pointer select-none ${
                        isAktif
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : isSegeraHabis
                          ? 'bg-[#fef3c7] text-[#b45309]'
                          : 'bg-[#f3f4f6] text-[#6b7280]'
                      }`}
                      title="Klik untuk mengubah status aktif/nonaktif"
                      onClick={() => handleToggleStatus(item)}
                    >
                      {isAktif ? 'Aktif' : isSegeraHabis ? 'Segera Habis' : 'Habis'}
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0 self-center"
                    title="Hapus Produk"
                    aria-label={`Hapus ${item.name}`}
                    onClick={() => handleRequestDelete(item)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default Daganganku;
