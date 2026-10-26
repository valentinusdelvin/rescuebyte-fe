import rescueBiteLogo from '../../assets/logo.svg';

export interface CustomerFooterProps {
  onNavigateSeller?: () => void;
  onContactSupport?: () => void;
}

/**
 * Customer Landing Page Footer
 * Styled with Tailwind CSS classes.
 */
export function CustomerFooter({
  onNavigateSeller,
  onContactSupport,
}: CustomerFooterProps) {
  return (
    <footer className="bg-[#1b1c1c] text-white pt-16 pb-12 px-4 md:px-8" id="kontak-section">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Top Brand Section & Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={rescueBiteLogo}
                alt="RescueBite"
                className="h-8 w-auto brightness-0 invert"
              />
              <span className="text-xl font-bold font-display text-white">RescueBite</span>
            </div>

            <p className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-2">
              Good Food, Greener Tomorrow.
            </p>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mb-5">
              Platform penyelamat makanan berlebih nomor satu di Indonesia. Hidup lebih hemat, nikmati makanan lezat dari resto favorit, dan kurangi food waste sekarang juga.
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              onClick={onContactSupport}
              id="btn-customer-service-footer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Hubungi Customer Service</span>
            </button>
          </div>

          {/* Links Column 1: Konsumen */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Konsumen</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a href="#marketplace" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Jelajahi Mystery Box
                </a>
              </li>
              <li>
                <a href="#marketplace" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Jadwal Ambil Makanan
                </a>
              </li>
              <li>
                <a href="#about-us-section" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Cara Belanja di Aplikasi
                </a>
              </li>
              <li>
                <a href="#marketplace" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Voucher & Langganan
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Mitra & Ekosistem */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Mitra & Ekosistem</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a href="#beranda-seller" className="text-xs text-gray-400 hover:text-white transition-colors" onClick={(e) => {
                  if (onNavigateSeller) {
                    e.preventDefault();
                    onNavigateSeller();
                  }
                }}>
                  Daftar Menjadi Mitra
                </a>
              </li>
              <li>
                <a
                  href="#beranda-seller"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  onClick={(e) => {
                    if (onNavigateSeller) {
                      e.preventDefault();
                      onNavigateSeller();
                    }
                  }}
                >
                  Portal Toko (Seller) →
                </a>
              </li>
              <li>
                <a href="#kontak-section" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Kemitraan Resto / Kafe
                </a>
              </li>
              <li>
                <a href="#about-us-section" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Program Food Bank
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Jaminan & Bantuan */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Jaminan & Bantuan</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a href="#kontak-section" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Kebijakan Pengembalian
                </a>
              </li>
              <li>
                <a href="#about-us-section" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Standar Kebersihan Makanan
                </a>
              </li>
              <li>
                <a href="#kontak-section" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Pusat Bantuan & Kontak
                </a>
              </li>
              <li>
                <a href="#kontak-section" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Syarat & Ketentuan Layanan
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Security Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            © 2026 RescueBite Indonesia. Part of Food Rescue Movement. All Rights Reserved.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-emerald-400 font-semibold">
              🛡️ Terverifikasi 100% Keamanan Pangan
            </span>
            <span>•</span>
            <a href="#kontak-section" className="hover:text-white transition-colors">
              Privasi
            </a>
            <span>•</span>
            <a href="#kontak-section" className="hover:text-white transition-colors">
              Kebijakan Cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
