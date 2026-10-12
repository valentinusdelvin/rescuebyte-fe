/**
 * FinanceCard Component
 * Displays ongoing store transactions and available store balance.
 * Complies with .agents/docs/architecture.md and .agents/docs/styling.md.
 */
export function FinanceCard() {
  return (
    <section className="dashboard-section" aria-labelledby="section-title-keuangan">
      <h2 className="section-title" id="section-title-keuangan">Keuangan Toko</h2>
      <div className="finance-card">
        <div className="finance-col">
          <span className="finance-label">Transaksi Berjalan</span>
          <span className="finance-value">Rp 12.450.000</span>
        </div>
        <div className="finance-divider" aria-hidden="true" />
        <div className="finance-col">
          <span className="finance-label">Saldo Toko</span>
          <span className="finance-value">Rp 3.251.576</span>
        </div>
      </div>
    </section>
  );
}
