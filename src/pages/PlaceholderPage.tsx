export interface PlaceholderPageProps {
  title?: string;
  onBackToBeranda?: () => void;
}

/**
 * PlaceholderPage Component
 * Displays a friendly under-construction screen for secondary menu items.
 * Complies with .agents/docs/architecture.md and .agents/docs/typescript.md.
 */
export function PlaceholderPage({
  title = 'Fitur Segera Hadir',
  onBackToBeranda,
}: PlaceholderPageProps) {
  return (
    <section className="page-view active" id="view-placeholder" aria-labelledby="placeholder-title">
      <div className="placeholder-card">
        <div className="placeholder-icon-wrap" id="placeholder-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 id="placeholder-title" className="placeholder-title">{title}</h2>
        <p id="placeholder-desc" className="placeholder-desc">
          Halaman "{title}" terhubung dengan operasional RescueBite dan sedang dalam pengembangan.
        </p>
        <div className="placeholder-action">
          <button type="button" className="btn-save-primary" id="btn-back-beranda" onClick={onBackToBeranda}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </section>
  );
}
