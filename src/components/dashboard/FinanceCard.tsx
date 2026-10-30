/**
 * FinanceCard Component
 * Displays ongoing store transactions.
 * Styled with Tailwind CSS classes.
 */
export function FinanceCard() {
  return (
    <section className="mb-9" aria-labelledby="section-title-keuangan">
      <h2 className="text-[1.45rem] font-bold text-[#111827] tracking-[-0.015em] mb-[18px]" id="section-title-keuangan">
        Keuangan Toko
      </h2>
      <div className="bg-white rounded-2xl py-6 px-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_8px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] transition-shadow duration-150 flex flex-col gap-1.5">
        <span className="text-[0.95rem] font-semibold text-[#374151]">Transaksi Berjalan</span>
        <span className="text-[1.85rem] font-extrabold text-[#111827] tracking-[-0.02em] font-sans">Rp 12.450.000</span>
      </div>
    </section>
  );
}
