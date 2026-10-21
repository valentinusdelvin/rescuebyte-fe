import rescueBiteLogo from '../../assets/logo.svg';

export interface CustomerFooterProps {
  onNavigateSeller?: () => void;
  onContactSupport?: () => void;
}

/**
 * Customer Landing Page Footer
 * Complies with .agents/docs/architecture.md, styling.md, and prd/design specifications.
 */
export function CustomerFooter({
  onNavigateSeller,
  onContactSupport,
}: CustomerFooterProps) {
  return (
    <footer className="customer-footer-root" id="kontak-section">
      <div className="customer-footer-container">
        {/* Top Brand Section & Link Columns */}
        <div className="customer-footer-grid">
          {/* Brand Info Column */}
          <div className="customer-footer-brand-col">
            <div className="customer-footer-brand-header">
              <img
                src={rescueBiteLogo}
                alt="RescueBite"
                className="customer-footer-logo-img"
              />
              <span className="customer-footer-brand-name">RescueBite</span>
            </div>

            <p className="customer-footer-tagline">
              Good Food, Greener Tomorrow.
            </p>

            <p className="customer-footer-desc">
              Platform penyelamat makanan berlebih nomor satu di Indonesia. Hidup lebih hemat, nikmati makanan lezat dari resto favorit, dan kurangi food waste sekarang juga.
            </p>

            <button
              type="button"
              className="customer-footer-cs-btn"
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
          <div className="customer-footer-links-col">
            <h4 className="customer-footer-col-title">Konsumen</h4>
            <ul className="customer-footer-col-list">
              <li>
                <a href="#marketplace" className="customer-footer-col-link">
                  Jelajahi Mystery Box
                </a>
              </li>
              <li>
                <a href="#marketplace" className="customer-footer-col-link">
                  Jadwal Ambil Makanan
                </a>
              </li>
              <li>
                <a href="#about-us-section" className="customer-footer-col-link">
                  Cara Belanja di Aplikasi
                </a>
              </li>
              <li>
                <a href="#marketplace" className="customer-footer-col-link">
                  Voucher & Langganan
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Mitra & Ekosistem */}
          <div className="customer-footer-links-col">
            <h4 className="customer-footer-col-title">Mitra & Ekosistem</h4>
            <ul className="customer-footer-col-list">
              <li>
                <a href="#beranda-seller" className="customer-footer-col-link" onClick={(e) => {
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
                  className="customer-footer-col-link font-semibold text-[#3c6a00]"
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
                <a href="#kontak-section" className="customer-footer-col-link">
                  Kemitraan Resto / Kafe
                </a>
              </li>
              <li>
                <a href="#about-us-section" className="customer-footer-col-link">
                  Program Food Bank
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Jaminan & Bantuan */}
          <div className="customer-footer-links-col">
            <h4 className="customer-footer-col-title">Jaminan & Bantuan</h4>
            <ul className="customer-footer-col-list">
              <li>
                <a href="#kontak-section" className="customer-footer-col-link">
                  Kebijakan Pengembalian
                </a>
              </li>
              <li>
                <a href="#about-us-section" className="customer-footer-col-link">
                  Standar Kebersihan Makanan
                </a>
              </li>
              <li>
                <a href="#kontak-section" className="customer-footer-col-link">
                  Pusat Bantuan & Kontak
                </a>
              </li>
              <li>
                <a href="#kontak-section" className="customer-footer-col-link">
                  Syarat & Ketentuan Layanan
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Security Bar */}
        <div className="customer-footer-bottom-bar">
          <p className="customer-footer-copyright">
            © 2026 RescueBite Indonesia. Part of Food Rescue Movement. All Rights Reserved.
          </p>

          <div className="customer-footer-certifications">
            <span className="customer-footer-cert-badge">
              🛡️ Terverifikasi 100% Keamanan Pangan
            </span>
            <span className="customer-footer-separator">•</span>
            <a href="#kontak-section" className="customer-footer-sublink">
              Privasi
            </a>
            <span className="customer-footer-separator">•</span>
            <a href="#kontak-section" className="customer-footer-sublink">
              Kebijakan Cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
