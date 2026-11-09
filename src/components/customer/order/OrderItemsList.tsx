import { OrderItemDetail } from './types';
import { formatRupiah } from '../../../utils/currency';
import saladStopCard from '../../../assets/customer/card-saladstop.jpg';

export interface OrderItemsListProps {
  items: OrderItemDetail[];
  fallbackStoreName?: string;
}

export function OrderItemsList({ items, fallbackStoreName = 'Toko Mitra' }: OrderItemsListProps) {
  return (
    <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
      <div className="mb-5">
        <h3 className="text-base font-bold text-[#1b1c1c]">Barang yang Diselamatkan</h3>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item, idx) => {
          const itName = item.name || 'Paket Surplus';
          const itOriginal = item.originalPrice || 0;
          const itRescue = item.rescuePrice || 0;
          const itDisc = item.discountPercent || 0;
          const itQty = item.quantity || 1;
          const sName = item.storeName || fallbackStoreName;

          return (
            <div
              key={item.id || idx}
              className="flex flex-col sm:flex-row items-start gap-4 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0"
            >
              {/* Thumbnail with discount badge */}
              <div className="relative w-full sm:w-24 sm:h-24 aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={item.imageSrc || saladStopCard}
                  alt={itName}
                  className="w-full h-full object-cover"
                />
                {itDisc > 0 && (
                  <div className="absolute top-2 left-2 bg-[#22c55e] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                    -{itDisc}%
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-[#1b1c1c] truncate">{itName}</h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {itQty} Box ({sName})
                </p>

                <div className="flex items-baseline justify-between gap-2 mt-2 pt-2 border-t border-slate-50">
                  <div>
                    {itOriginal > 0 && (
                      <span className="text-xs text-slate-400 line-through block">
                        Rp {formatRupiah(itOriginal * itQty)}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-[#1b1c1c]">
                        Rp {formatRupiah(itRescue)}
                      </span>
                      <span className="text-xs text-slate-500">/ 1 Box</span>
                    </div>
                  </div>

                  <div className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                    Subtotal: Rp {formatRupiah(itRescue * itQty)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
