import { OrderStatusTab } from '../../types';

export interface ActivityItem {
  id: OrderStatusTab;
  label: string;
  count: number;
}

const ACTIVITIES: ActivityItem[] = [
  { id: 'diproses', label: 'Perlu Diproses', count: 12 },
  { id: 'konfirmasi', label: 'Menunggu Konfirmasi', count: 2 },
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
 * Complies with .agents/docs/architecture.md and .agents/docs/styling.md.
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
    <section className="dashboard-section" aria-labelledby="section-title-aktifitas">
      <h2 className="section-title" id="section-title-aktifitas">Aktifitas Penting</h2>
      <div className="activity-cards-grid">
        {ACTIVITIES.map((item) => (
          <div
            key={item.id}
            className="stat-card activity-card interactive"
            tabIndex={0}
            role="button"
            aria-label={`Buka riwayat pesanan ${item.label}: ${item.count} pesanan`}
            onClick={() => handleClick(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
          >
            <span className="activity-label">{item.label}</span>
            <span className="activity-number">{item.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
