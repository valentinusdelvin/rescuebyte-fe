import { Check, Clock, Package, Trash2 } from 'lucide-react';
import { CartItem, StoreCartGroup } from '../../../types';
import { formatRupiah } from '../../../utils/currency';
import { getStoreInitials } from '../../../services/cartService';

interface CartStoreGroupProps {
  store: StoreCartGroup;
  selectedItemIds: Set<string>;
  isStoreAllSelected: (store: StoreCartGroup) => boolean;
  toggleStoreSelection: (store: StoreCartGroup) => void;
  toggleItemSelection: (itemId: string) => void;
  handleStoreClick: (storeName: string) => void;
  handleItemClick: (store: StoreCartGroup, item: CartItem) => void;
  handleDecrease: (storeId: string, storeName: string, item: CartItem) => void;
  handleIncrease: (storeId: string, itemId: string) => void;
  handlePromptRemoveStore: (storeId: string, storeName: string) => void;
  handlePromptRemoveItem: (storeId: string, storeName: string, item: CartItem) => void;
  formatStorePickupTime: (pickupTime?: string) => string;
}

export function CartStoreGroup({
  store, selectedItemIds, isStoreAllSelected, toggleStoreSelection, toggleItemSelection,
  handleStoreClick, handleItemClick, handleDecrease, handleIncrease, handlePromptRemoveStore,
  handlePromptRemoveItem, formatStorePickupTime,
}: CartStoreGroupProps) {
  return (
    <section
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-5"
                    id={`cart-store-${store.storeId}`}
                  >
                    {/* Store Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                      {/* Left: Store Checkbox, Avatar, Name, Rating, Distance */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Store Selection Checkbox */}
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isStoreAllSelected(store)}
                          onClick={() => toggleStoreSelection(store)}
                          className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border ${isStoreAllSelected(store)
                            ? 'bg-[#16a34a] border-[#16a34a] text-white shadow-2xs'
                            : store.items.some((it) => selectedItemIds.has(it.id))
                              ? 'bg-[#16a34a]/15 border-[#16a34a] text-[#16a34a]'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                            }`}
                          aria-label={`Pilih semua produk dari ${store.storeName}`}
                        >
                          {isStoreAllSelected(store) ? (
                            <Check className="w-3 h-3 stroke-[3.2]" />
                          ) : store.items.some((it) => selectedItemIds.has(it.id)) ? (
                            <span className="w-2.5 h-0.5 bg-[#16a34a] rounded-full" />
                          ) : null}
                        </button>

                        {/* Store Avatar & Name (Clickable to Store Page) */}
                        <div
                          onClick={() => handleStoreClick(store.storeName)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleStoreClick(store.storeName);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Buka halaman toko ${store.storeName}`}
                          title={`Lihat halaman toko ${store.storeName}`}
                          className="flex items-center gap-3 min-w-0 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 rounded-xl p-0.5"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1b261e] text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-2xs group-hover:scale-105 transition-transform border border-black/5">
                            {store.storeAvatar && (store.storeAvatar.startsWith('http') || store.storeAvatar.startsWith('/')) ? (
                              <img
                                src={store.storeAvatar}
                                alt={store.storeName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className={store.storeAvatar && (store.storeAvatar.startsWith('http') || store.storeAvatar.startsWith('/')) ? 'hidden' : 'block'}>
                              {getStoreInitials(store.storeName)}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c] whitespace-nowrap group-hover:text-emerald-800 group-hover:underline transition-colors">
                              {store.storeName}
                            </h2>
                            <div
                              role="button"
                              tabIndex={0}
                              aria-label="Lihat ulasan toko"
                              className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 whitespace-nowrap cursor-pointer hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                const query = new URLSearchParams();
                                if (store.storeName) query.set('name', store.storeName);
                                if (store.storeId) query.set('id', store.storeId);
                                query.set('section', 'ulasan-pelanggan');
                                window.location.hash = `#toko?${query.toString()}`;
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const query = new URLSearchParams();
                                  if (store.storeName) query.set('name', store.storeName);
                                  if (store.storeId) query.set('id', store.storeId);
                                  query.set('section', 'ulasan-pelanggan');
                                  window.location.hash = `#toko?${query.toString()}`;
                                }
                              }}
                            >
                              {(() => {
                                const hasRating = typeof store.rating === 'number' && store.rating > 0;
                                const numReviews = typeof store.reviewCount === 'number' ? store.reviewCount : Number(store.reviewCount) || 0;
                                return (
                                  <>
                                    <span className="text-amber-500 font-bold">★ {hasRating ? store.rating.toFixed(1) : '-'}</span>
                                    <span className="text-gray-400">
                                      ({numReviews > 0 ? `${numReviews} ulasan` : 'Belum ada ulasan'})
                                    </span>
                                  </>
                                );
                              })()}
                              <span className="text-gray-300">•</span>
                              <span>{store.distanceText}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Pickup Time Pill & Hapus Semua */}
                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-center">
                        {/* Waktu Pickup Tetap dari Toko */}
                        <div className="inline-flex items-center bg-[#f8f8f6] border border-gray-200/90 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 select-none">
                          <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0 mr-1.5" />
                          <span className="text-gray-500 whitespace-nowrap mr-1 text-[11px] sm:text-xs">Waktu Pickup</span>
                          <span className="font-bold text-gray-900 whitespace-nowrap text-[11px] sm:text-xs">
                            {formatStorePickupTime(store.pickupTime)}
                          </span>
                        </div>

                        {/* Hapus Semua Button */}
                        <button
                          type="button"
                          onClick={() => handlePromptRemoveStore(store.storeId, store.storeName)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer transition-colors"
                          title="Hapus semua pesanan toko ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Semua</span>
                        </button>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="flex flex-col divide-y divide-gray-100">
                      {store.items.map((item) => (
                        <div
                          key={item.id}
                          className="pt-4 first:pt-0 pb-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          {/* Left: Checkbox, Thumbnail & Details */}
                          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                            {/* Item Checkbox */}
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={selectedItemIds.has(item.id)}
                              onClick={() => toggleItemSelection(item.id)}
                              className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border ${selectedItemIds.has(item.id)
                                ? 'bg-[#16a34a] border-[#16a34a] text-white shadow-2xs'
                                : 'bg-white border-gray-300 hover:border-gray-400'
                                }`}
                              aria-label={`Pilih ${item.name}`}
                            >
                              {selectedItemIds.has(item.id) && (
                                <Check className="w-3 h-3 stroke-[3.2]" />
                              )}
                            </button>

                            {/* Product Thumbnail (Clickable to Detail) */}
                            <div
                              onClick={() => handleItemClick(store, item)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleItemClick(store, item);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label={`Lihat detail produk ${item.name}`}
                              title={`Lihat detail produk ${item.name}`}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#24201c] shrink-0 border border-black/10 relative cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                            >
                              {item.imageSrc ? (
                                <img
                                  src={item.imageSrc}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-[#2a241e] to-[#1c1815] text-amber-200">
                                  <Package className="w-5.5 h-5.5" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex flex-col min-w-0">
                              <h3
                                onClick={() => handleItemClick(store, item)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleItemClick(store, item);
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Lihat detail produk ${item.name}`}
                                title={`Lihat detail produk ${item.name}`}
                                className="font-bold text-sm sm:text-base text-[#1b1c1c] truncate cursor-pointer hover:text-emerald-800 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-sm"
                              >
                                {item.name?.replace(/\s+Reguler$/i, '')}
                              </h3>

                              {/* Prices */}
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="font-black text-sm text-[#e11d48]">
                                  Rp {formatRupiah(item.rescuePrice)}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  Rp {formatRupiah(item.originalPrice)}
                                </span>
                                <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                  {item.discountPercent}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Quantity Stepper, Subtotal, Red Trash Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 sm:self-center">
                            {/* Stepper */}
                            <div className="bg-[#f4f4f2] rounded-xl p-1 flex items-center gap-2.5 border border-gray-200/80">
                              <button
                                type="button"
                                onClick={() => handleDecrease(store.storeId, store.storeName, item)}
                                className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors"
                                title={item.quantity === 1 ? 'Hapus box' : 'Kurangi box'}
                                aria-label={item.quantity === 1 ? 'Hapus box' : 'Kurangi box'}
                              >
                                –
                              </button>
                              <span className="font-bold text-xs sm:text-sm text-[#1b1c1c] min-w-4 text-center select-none">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleIncrease(store.storeId, item.id)}
                                className="w-7 h-7 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors"
                                title="Tambah box"
                                aria-label="Tambah box"
                              >
                                +
                              </button>
                            </div>

                            {/* Subtotal Item Price */}
                            <div className="min-w-21.25 sm:min-w-23.75 text-right">
                              <span className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                                Rp {formatRupiah(item.rescuePrice * item.quantity)}
                              </span>
                            </div>

                            {/* Trash Button */}
                            <button
                              type="button"
                              onClick={() => handlePromptRemoveItem(store.storeId, store.storeName, item)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer p-1.5 rounded-lg"
                              title="Hapus produk ini"
                              aria-label="Hapus produk ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
  );
}
