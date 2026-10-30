import { useState, useEffect } from 'react';
import { getMerchantOrders, subscribeToMerchantOrders, MerchantOrderItem } from '../../services/orderService';

export interface FinanceCardProps {
  storeName?: string;
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * FinanceCard Component
 * Displays real ongoing store transactions and available store balance
 * calculated dynamically from real store orders.

 * Styled with Tailwind CSS classes.
 */
export function FinanceCard({ storeName }: FinanceCardProps) {
  const [orders, setOrders] = useState<MerchantOrderItem[]>(() => getMerchantOrders(storeName));

  const [prevStoreName, setPrevStoreName] = useState(storeName);
  if (storeName !== prevStoreName) {
    setPrevStoreName(storeName);
    setOrders(getMerchantOrders(storeName));
  }

  useEffect(() => {
    return subscribeToMerchantOrders((latest) => {
      setOrders(latest);
    });
  }, []);

  // Transaksi Berjalan: pesanan yang sedang diproses / dikonfirmasi
  const ongoingTotal = orders
    .filter((o) => o.status === 'diproses' || o.status === 'perlu-konfirmasi' || o.status === 'siap-diambil')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  // Saldo Toko: pesanan selesai (plus saldo dasar jika ada)
  const completedTotal = orders
    .filter((o) => o.status === 'selesai')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  return (
    <section className="mb-9" aria-labelledby="section-title-keuangan">
      <h2
        className="text-[1.45rem] font-bold text-[#111827] tracking-[-0.015em] mb-[18px]"
        id="section-title-keuangan"
      >
        Keuangan Toko
      </h2>
      <div className="bg-white rounded-2xl py-6 px-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_8px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] transition-shadow duration-150 flex flex-col md:flex-row md:items-center max-md:gap-4 border border-gray-100">
        <div className="flex-1 flex flex-col gap-1.5">
          <span className="text-[0.95rem] font-semibold text-[#374151]">Transaksi Berjalan</span>
          <span className="text-[1.85rem] font-extrabold text-[#111827] tracking-[-0.02em] font-sans">
            Rp {formatRupiah(ongoingTotal)}
          </span>
        </div>
        <div className="hidden md:block w-px h-12 bg-[#d1d5db] mx-10 shrink-0" aria-hidden="true" />
        <div className="flex-1 flex flex-col gap-1.5">
          <span className="text-[0.95rem] font-semibold text-[#374151]">Pemasukan Toko</span>
          <span className="text-[1.85rem] font-extrabold text-[#111827] tracking-[-0.02em] font-sans">
            Rp {formatRupiah(completedTotal)}
          </span>
        </div>

      </div>
    </section>
  );
}
