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
    <section className="flex flex-col items-center justify-center min-h-[500px] py-12 px-4 animate-[fadeIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]" id="view-placeholder" aria-labelledby="placeholder-title">
      <div className="bg-white border border-gray-200/80 rounded-2xl p-8 sm:p-12 text-center max-w-md w-full shadow-xs flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200/80 flex items-center justify-center text-[#15803d] mb-5" id="placeholder-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 id="placeholder-title" className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p id="placeholder-desc" className="text-sm text-gray-500 mb-6 leading-relaxed">
          Halaman "{title}" terhubung dengan operasional RescueBite dan sedang dalam pengembangan.
        </p>
        <div>
          <button
            type="button"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] active:scale-[0.98] text-white text-sm font-semibold transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#15803d] focus:ring-offset-2 cursor-pointer"
            id="btn-back-beranda"
            onClick={onBackToBeranda}
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </section>
  );
}
