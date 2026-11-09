import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Clock, ShoppingBag } from 'lucide-react';
import { StoreProductItem } from './types';
import { formatRupiah, formatPriceInput, parsePriceInput } from '../../../utils/currency';

export interface StoreDaganganGridProps {
  products: StoreProductItem[];
  distanceText: string;
  onSelectProduct: (product: StoreProductItem) => void;
}

export function StoreDaganganGrid({
  products,
  distanceText,
  onSelectProduct,
}: StoreDaganganGridProps) {
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);

  const priceDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        priceDropdownRef.current &&
        !priceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPriceDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter((item) => {
    if (appliedMinPrice !== null && item.rescuePrice < appliedMinPrice) return false;
    if (appliedMaxPrice !== null && item.rescuePrice > appliedMaxPrice) return false;
    return true;
  });

  const handleResetFilter = () => {
    setAppliedMinPrice(null);
    setAppliedMaxPrice(null);
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  return (
    <div className="space-y-6 mb-12">
      {/* Filter Row: Filter Harga */}
      <div className="flex items-center gap-3">
        <div ref={priceDropdownRef} className="relative w-full sm:w-72">
          <button
            type="button"
            onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
            className={`w-full bg-white border rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 shadow-2xs cursor-pointer transition-all ${
              isPriceDropdownOpen
                ? 'border-primary ring-1 ring-primary text-[#1b1c1c]'
                : appliedMinPrice !== null || appliedMaxPrice !== null
                  ? 'border-brand-green bg-[#f4f8f4] text-[#1b1c1c]'
                  : 'border-black/25 text-[#1b1c1c] hover:border-black/45'
            }`}
            aria-expanded={isPriceDropdownOpen}
          >
            <span className="truncate">
              {appliedMinPrice !== null && appliedMaxPrice !== null
                ? `Rp ${formatRupiah(appliedMinPrice)} - ${formatRupiah(appliedMaxPrice)}`
                : appliedMinPrice !== null
                  ? `≥ Rp ${formatRupiah(appliedMinPrice)}`
                  : appliedMaxPrice !== null
                    ? `≤ Rp ${formatRupiah(appliedMaxPrice)}`
                    : 'Harga'}
            </span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 text-black transition-transform duration-200 ${
                isPriceDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isPriceDropdownOpen && (
            <div className="absolute top-full left-0 w-full min-w-70 mt-1.5 bg-white border border-black/15 rounded-2xl shadow-xl z-30 p-4 animate-in fade-in zoom-in-95 duration-150">
              {/* Semua Harga */}
              <button
                type="button"
                onClick={() => {
                  handleResetFilter();
                  setIsPriceDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-between cursor-pointer mb-1 ${
                  appliedMinPrice === null && appliedMaxPrice === null
                    ? 'bg-gray-100 text-[#1b1c1c] font-bold'
                    : 'text-[#1b1c1c] hover:bg-gray-50 font-medium'
                }`}
              >
                <span>Semua Harga</span>
                {appliedMinPrice === null && appliedMaxPrice === null && (
                  <Check className="w-4 h-4 text-[#1b1c1c]" />
                )}
              </button>

              <div className="border-t border-gray-100 my-2" />

              {/* Rentang min x - max y */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Rentang Harga (Rp)
                </span>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">Min</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(formatPriceInput(e.target.value))}
                        className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-[#1b1c1c] focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">Max</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="50.000"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(formatPriceInput(e.target.value))}
                        className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-[#1b1c1c] focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const min = parsePriceInput(minPriceInput);
                    const max = parsePriceInput(maxPriceInput);
                    setAppliedMinPrice(min);
                    setAppliedMaxPrice(max);
                    setIsPriceDropdownOpen(false);
                  }}
                  className="w-full mt-2 py-2 bg-[#1f2a24] hover:bg-[#2c3b33] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}
        </div>

        {(appliedMinPrice !== null || appliedMaxPrice !== null) && (
          <button
            type="button"
            onClick={handleResetFilter}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline transition cursor-pointer self-center"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredProducts.map((item) => (
            <article
              key={item.id}
              onClick={() => handleSelectProduct(item)}
              className="bg-white rounded-3xl border border-black/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group cursor-pointer focus-within:ring-2 focus-within:ring-primary"
            >
              {/* Top Media Banner Area */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100">
                <img
                  src={item.imageSrc}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Top Row Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-white text-[#1b1c1c] text-[11px] font-bold border border-black/5 shadow-xs">
                      {distanceText}
                    </span>
                  </div>

                  <div>
                    <span className="px-2.5 py-1 rounded-full bg-brand-green text-white text-[11px] font-black shadow-xs">
                      -{item.discountPercent}%
                    </span>
                  </div>
                </div>

                {/* Bottom Dark Gradient with Category & Product Name Overlay */}
                <div className="absolute inset-x-0 bottom-0 pt-12 pb-3.5 px-4 bg-linear-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end pointer-events-none z-10">
                  <span className="text-xs sm:text-[13px] font-bold text-[#b7e472] uppercase tracking-wide drop-shadow-sm truncate mb-0.5">
                    {item.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display leading-tight drop-shadow-sm truncate">
                    {item.name}
                  </h3>
                </div>
              </div>

              {/* Card Body Content */}
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <p className="text-xs sm:text-[13px] text-[#434844] line-clamp-2 leading-relaxed mb-3.5">
                  {item.description}
                </p>

                {/* Pickup Time Bar */}
                <div className="w-full bg-[#F4F3F0] rounded-xl py-2.5 px-3.5 flex items-center gap-2 mt-auto">
                  <Clock className="w-3.5 h-3.5 text-[#d94a38] shrink-0" aria-hidden="true" />
                  <div className="text-xs text-[#434844] truncate">
                    <span className="font-normal text-[#5a625d]">Ambil: </span>
                    <span className="font-bold text-[#1b1c1c]">{item.pickupTime}</span>
                  </div>
                </div>

                {/* Card Footer: Price & Pesan Sekarang Button */}
                <div className="pt-3.5 mt-3.5 border-t border-[#f0eded] flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-[#737874] line-through font-medium">
                      Rp {formatRupiah(item.originalPrice)}
                    </span>
                    <span className="text-xl sm:text-[22px] font-black text-[#1b1c1c] font-display tracking-tight leading-none mt-0.5">
                      Rp {formatRupiah(item.rescuePrice)}
                    </span>
                  </div>

                  {(() => {
                    const isOutOfStock = (item.remainingBoxes ?? item.stock ?? 0) === 0;
                    if (isOutOfStock) {
                      return (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-gray-200 text-gray-400 text-xs sm:text-sm font-bold shadow-xs cursor-not-allowed shrink-0 select-none"
                        >
                          <span>Habis</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(item);
                        }}
                        className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-[#1f2a24] hover:bg-[#2c3b33] active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span>Pesan Sekarang</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-black/10 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-[#1b1c1c] mb-1">
            Tidak Ada Produk yang Cocok
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
            Coba ubah rentang harga untuk melihat produk surplus yang tersedia di toko ini.
          </p>
          <button
            type="button"
            onClick={handleResetFilter}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#1f2a24] hover:bg-[#2c3b33] text-white text-xs font-bold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Reset Filter Harga
          </button>
        </div>
      )}
    </div>
  );

  function handleSelectProduct(item: StoreProductItem) {
    onSelectProduct(item);
  }
}
