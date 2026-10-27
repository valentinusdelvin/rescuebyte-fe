import rescueBiteLogo from '../../assets/logo.svg';

export interface CustomerFooterProps {
  onNavigateSeller?: () => void;
  onContactSupport?: () => void;
}

/**
 * Customer Landing Page Footer
 * Redesigned to clean white background matching brand guidelines.
 */
export function CustomerFooter({
  onNavigateSeller,
  onContactSupport,
}: CustomerFooterProps) {
  return (
    <footer className="bg-white text-[#1b1c1c] border-t border-gray-100 pt-16 pb-12 px-6 sm:px-12" id="kontak-section">
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Top Brand Section & Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-2.5 mb-2.5">
              <img
                src={rescueBiteLogo}
                alt="RescueBite"
                className="h-8 w-auto"
              />
              <span className="text-xl font-extrabold font-display text-[#1b1c1c] tracking-tight">RescueBite</span>
            </div>

            <p className="text-xs sm:text-[13px] font-bold text-brand-green mb-2 tracking-normal">
              Good Food. Brighter Tomorrow.
            </p>

            <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed max-w-sm">
              Platform penyelamatan makanan berlebih terverifikasi di Indonesia. Mengubah surplus kuliner berkualitas menjadi berkah konsumsi dan donasi nyata.
            </p>
          </div>

          {/* Links Column 1: Konsumen */}
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-[#1b1c1c] mb-4">Konsumen</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a href="#marketplace" className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors">
                  Jelajah Mystery Box
                </a>
              </li>
              <li>
                <a href="#marketplace" className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors">
                  Jadwal Ambil Makanan
                </a>
              </li>
              <li>
                <a href="#about-us-section" className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors">
                  Kalkulator Jejak Karbon
                </a>
              </li>
              <li>
                <a href="#marketplace" className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors">
                  Voucher & Langganan
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Mitra & Ekosistem */}
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-[#1b1c1c] mb-4">Mitra & Ekosistem</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href="#beranda-seller"
                  className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors"
                  onClick={(e) => {
                    if (onNavigateSeller) {
                      e.preventDefault();
                      onNavigateSeller();
                    }
                  }}
                >
                  Daftar Mitra Restoran
                </a>
              </li>
              <li>
                <a
                  href="#beranda-seller"
                  className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors"
                  onClick={(e) => {
                    if (onNavigateSeller) {
                      e.preventDefault();
                      onNavigateSeller();
                    }
                  }}
                >
                  Portal Merchant F&B
                </a>
              </li>
              <li>
                <a href="#about-us-section" className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors">
                  Mitra Donasi / NGO
                </a>
              </li>
              <li>
                <a href="#about-us-section" className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors">
                  Program Food Bank
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Jaminan & Bantuan */}
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-[#1b1c1c] mb-4">Jaminan & Bantuan</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a href="#about-us-section" className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors">
                  Halal & Safety Assurance
                </a>
              </li>
              <li>
                <a href="#about-us-section" className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors">
                  Standar Higienitas Makanan
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="text-left text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors cursor-pointer"
                  onClick={onContactSupport}
                  id="btn-footer-support"
                >
                  Pusat Bantuan Konsumen
                </button>
              </li>
              <li>
                <a href="#kontak-section" className="text-xs sm:text-[13px] text-gray-500 hover:text-black transition-colors">
                  Syarat & Ketentuan Layanan
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Security Bar */}
        <div className="pt-8 mt-12 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © 2025 RescueBite Indonesia. Terdaftar di Kemenparekraf & Badan Pangan Nasional.
          </p>

          <div className="flex items-center gap-5 flex-wrap">
            <a href="#privasi" className="text-gray-500 hover:text-black transition-colors">
              Privasi
            </a>
            <a href="#kebijakan-surplus" className="text-gray-500 hover:text-black transition-colors">
              Kebijakan Surplus
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
