import { Store, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { StoreCheckoutGroup } from './types';
import { formatRupiah } from '../../../utils/currency';
import cardMonsieurSpoon from '../../../assets/customer/card-monsieur-spoon.jpg';

export interface CheckoutItemsListProps {
  storeGroups: StoreCheckoutGroup[];
  orderDateFormatted: string;
  totalCheckoutItemsCount: number;
  onIncreaseQty: (itemId: string) => void;
  onDecreaseQty: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onChangeOrder?: () => void;
}

export function CheckoutItemsList({
  storeGroups,
  orderDateFormatted,
  totalCheckoutItemsCount,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveItem,
  onChangeOrder,
}: CheckoutItemsListProps) {
  return (
    <>
      {storeGroups.map((group, groupIdx) => (
        <section
          key={group.key}
          className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-5"
        >
          {/* Store Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <Store className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="flex items-center gap-2 truncate">
                <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c] truncate">
                  {group.storeName}
                </h2>
                {storeGroups.length > 1 && (
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                    Toko {groupIdx + 1}
                  </span>
                )}
              </div>
            </div>

            {onChangeOrder && (
              <button
                type="button"
                onClick={onChangeOrder}
                className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1.5 cursor-pointer select-none transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Pesanan</span>
              </button>
            )}
          </div>

          {/* Product List for this store */}
          <div className="flex flex-col divide-y divide-gray-100">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="pt-4 first:pt-0 pb-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Image & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#24201c] shrink-0 border border-black/10 relative">
                    <img
                      src={item.imageSrc || cardMonsieurSpoon}
                      alt={item.name?.replace(/\s+Reguler$/i, '')}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                      {group.storeName}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-[#1b1c1c] truncate">
                      {item.name?.replace(/\s+Reguler$/i, '')}
                    </h3>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Lihat ulasan toko"
                      className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 cursor-pointer hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700 rounded w-fit"
                      onClick={(e) => {
                        e.stopPropagation();
                        const query = new URLSearchParams();
                        if (group.storeName) query.set('name', group.storeName);
                        if (group.storeId) query.set('id', group.storeId);
                        query.set('section', 'ulasan-pelanggan');
                        window.location.hash = `#toko?${query.toString()}`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          const query = new URLSearchParams();
                          if (group.storeName) query.set('name', group.storeName);
                          if (group.storeId) query.set('id', group.storeId);
                          query.set('section', 'ulasan-pelanggan');
                          window.location.hash = `#toko?${query.toString()}`;
                        }
                      }}
                    >
                      {(() => {
                        const effectiveRating = item.rating || group.rating || 0;
                        const effectiveReviews = Number(item.reviewCount || group.reviewCount || 0);
                        return (
                          <>
                            <span className="text-amber-500 font-bold">
                              ★ {effectiveRating > 0 ? Number(effectiveRating).toFixed(1) : '-'}
                            </span>
                            <span className="text-gray-400">
                              ({effectiveReviews > 0 ? `${effectiveReviews} ulasan` : 'Belum ada ulasan'})
                            </span>
                          </>
                        );
                      })()}
                      <span className="text-gray-300">•</span>
                      <span>{item.distanceText || group.distanceText || '0.0 km'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Stepper */}
                <div className="flex flex-col sm:items-end justify-between gap-1.5 shrink-0">
                  <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-0">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-base sm:text-lg text-[#e11d48]">
                        Rp {formatRupiah(item.rescuePrice)}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">/box</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 line-through">
                        Rp {formatRupiah(item.originalPrice)}
                      </span>
                      <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-1.5 py-0.2 rounded">
                        {item.discountPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="bg-[#f4f4f2] rounded-xl p-1 flex items-center gap-2.5 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => onDecreaseQty(item.id)}
                        className="w-6 h-6 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="Kurangi box"
                        aria-label="Kurangi box"
                      >
                        –
                      </button>
                      <span className="font-bold text-xs sm:text-sm text-[#1b1c1c] min-w-4 text-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncreaseQty(item.id)}
                        className="w-6 h-6 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="Tambah box"
                        aria-label="Tambah box"
                      >
                        +
                      </button>
                    </div>

                    {totalCheckoutItemsCount > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                        title="Hapus produk ini"
                        aria-label="Hapus produk ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dedicated Store Pickup Section for this store */}
          <div className="bg-[#fbfbf9] rounded-2xl p-4 sm:p-5 border border-gray-200/90 flex flex-col gap-3.5 mt-1">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200/70">
              <Store className="w-4 h-4 text-gray-700" />
              <h3 className="font-bold text-xs sm:text-sm text-[#1b1c1c]">
                Pengambilan Pesanan: {group.storeName}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left: Store info & address */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1e2a22] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200 shadow-2xs select-none">
                    {group.storeAvatar && group.storeAvatar.startsWith('http') ? (
                      <img
                        src={group.storeAvatar}
                        alt={group.storeName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{group.storeName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1b1c1c]">
                      {group.storeName}
                    </h4>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Lihat ulasan toko"
                      className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 cursor-pointer hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700 rounded w-fit"
                      onClick={(e) => {
                        e.stopPropagation();
                        const query = new URLSearchParams();
                        if (group.storeName) query.set('name', group.storeName);
                        if (group.storeId) query.set('id', group.storeId);
                        query.set('section', 'ulasan-pelanggan');
                        window.location.hash = `#toko?${query.toString()}`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          const query = new URLSearchParams();
                          if (group.storeName) query.set('name', group.storeName);
                          if (group.storeId) query.set('id', group.storeId);
                          query.set('section', 'ulasan-pelanggan');
                          window.location.hash = `#toko?${query.toString()}`;
                        }
                      }}
                    >
                      {(() => {
                        const ratingNum = Number(group.rating || 0);
                        const reviewNum = Number(group.reviewCount || 0);
                        return (
                          <>
                            <span className="text-amber-500 font-bold">★ {ratingNum > 0 ? ratingNum.toFixed(1) : '-'}</span>
                            <span className="text-gray-400">
                              ({reviewNum > 0 ? `${reviewNum} ulasan` : 'Belum ada ulasan'})
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {group.storeAddress}
                </p>
              </div>

              {/* Right: Pickup Date & Operational Hours */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Tanggal Pickup
                  </label>
                  <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs">
                    <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{orderDateFormatted}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Waktu Pickup
                  </label>
                  <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs">
                    <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{group.operationalHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-[#eef8ee] border border-[#d2edd2] rounded-xl p-3 text-xs text-[#24521e] leading-relaxed">
              <span>
                Pesanan harus diambil langsung di lokasi {group.storeName} sesuai jadwal operasional yang tertera.
              </span>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
