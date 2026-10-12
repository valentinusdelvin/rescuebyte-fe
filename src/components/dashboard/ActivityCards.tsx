export interface ActivityItem {
  id: string;
  label: string;
  count: number;
}

const PRIMARY_ACTIVITIES: ActivityItem[] = [
  { id: 'diproses', label: 'Perlu Diproses', count: 12 },
  { id: 'konfirmasi', label: 'Menunggu Konfirmasi', count: 2 },
  { id: 'kendala', label: 'Kendala Pesanan', count: 30 },
];

const SECONDARY_ACTIVITIES: ActivityItem[] = [
  { id: 'batal', label: 'Dibatalkan', count: 1 },
  { id: 'habis', label: 'Stok Habis', count: 12 },
];

/**
 * ActivityCards Component
 * Displays summary cards for critical store activities.
 * Complies with .agents/docs/architecture.md and .agents/docs/styling.md.
 */
export function ActivityCards() {
  return (
    <section className="dashboard-section" aria-labelledby="section-title-aktifitas">
      <h2 className="section-title" id="section-title-aktifitas">Aktifitas Penting</h2>
      <div className="activity-cards-grid">
        {/* Row 1: 3 Cards */}
        {PRIMARY_ACTIVITIES.map((item) => (
          <div key={item.id} className="stat-card activity-card" tabIndex={0}>
            <span className="activity-label">{item.label}</span>
            <span className="activity-number">{item.count}</span>
          </div>
        ))}

        {/* Row 2: 2 Cards (Offset/Centered as in wireframe) */}
        <div className="activity-row-2">
          {SECONDARY_ACTIVITIES.map((item) => (
            <div key={item.id} className="stat-card activity-card" tabIndex={0}>
              <span className="activity-label">{item.label}</span>
              <span className="activity-number">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
