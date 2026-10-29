import { OrderStatusTab } from '../../types';

export interface ActivityItem {
  id: OrderStatusTab;
  label: string;
  count: number;
}

const ACTIVITIES: ActivityItem[] = [
  { id: 'diproses', label: 'Perlu Diproses', count: 12 },
  { id: 'konfirmasi', label: 'Dikonfirmasi', count: 2 },
  { id: 'kendala', label: 'Kendala Pesanan', count: 30 },
  { id: 'selesai', label: 'Pesanan Selesai', count: 60 },
  { id: 'batal', label: 'Dibatalkan', count: 1 },
  { id: 'habis', label: 'Stok Habis', count: 12 },
];

export interface ActivityCardsProps {
  onSelectActivity?: (tabId: OrderStatusTab) => void;
}

/**
 * ActivityCards Component
 * Displays summary cards for critical store activities.
 * Clicking any card links directly to the corresponding tab in Riwayat Pesanan.
 * Styled with Tailwind CSS classes.
 */
export function ActivityCards({ onSelectActivity }: ActivityCardsProps) {
  const handleClick = (tabId: OrderStatusTab) => {
    if (onSelectActivity) {
      onSelectActivity(tabId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: OrderStatusTab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(tabId);
    }
  };

  return (
    <section className="mb-9" aria-labelledby="section-title-aktifitas">
      <h2 className="text-[1.45rem] font-bold text-[#111827] tracking-[-0.015em] mb-[18px]" id="section-title-aktifitas">
        Aktifitas Penting
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ACTIVITIES.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-[20px_24px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_8px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between min-h-[96px] cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#15803d] focus-visible:outline-offset-2"
            tabIndex={0}
            role="button"
            aria-label={`Buka riwayat pesanan ${item.label}: ${item.count} pesanan`}
            onClick={() => handleClick(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
          >
            <span className="text-[0.92rem] font-semibold text-[#374151]">{item.label}</span>
            <span className="text-[2rem] font-extrabold text-[#111827] leading-[1.1] mt-2 font-sans">{item.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
