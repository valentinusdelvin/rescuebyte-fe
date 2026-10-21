import { useState } from 'react';
import rescueBiteLogo from '../../assets/logo.svg';

export interface CustomerHeaderProps {
  activeTab?: 'beranda' | 'marketplace' | 'kontak';
  onNavigateSeller?: () => void;
  onOpenAuthModal?: () => void;
}

/**
 * Customer Floating Pill Navigation Bar
 * Faithfully matches the Figma mockup with floating centered pill container,
 * smooth navigation anchors, and direct access to Seller portal.
 * Complies with .agents/docs/architecture.md, styling.md, and typescript.md.
 */
export function CustomerHeader({
  activeTab = 'beranda',
  onNavigateSeller,
  onOpenAuthModal,
}: CustomerHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="customer-header-wrapper" id="customer-header">
      <div className="customer-header-pill">
        {/* Brand Logo Circular Badge */}
        <a
          href="#beranda-customer"
          className="customer-brand-badge"
          aria-label="RescueBite Customer Home"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img
            src={rescueBiteLogo}
            alt="RescueBite"
            className="customer-brand-logo-img"
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="customer-nav-links" aria-label="Navigasi Utama Pelanggan">
          <a
            href="#beranda-customer"
            className={`customer-nav-item ${activeTab === 'beranda' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Beranda
          </a>
          <a
            href="#marketplace"
            className="customer-nav-item"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('marketplace-section');
            }}
          >
            Marketplace
          </a>
          <a
            href="#kontak"
            className="customer-nav-item"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('kontak-section');
            }}
          >
            Kontak
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="customer-header-actions">
          {/* Seller Mode Switcher Quick Link */}
          {onNavigateSeller && (
            <button
              type="button"
              className="customer-seller-pill-btn"
              onClick={onNavigateSeller}
              title="Beralih ke Portal Toko / Seller"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l2-5h14l2 5" />
                <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
                <path d="M9 22V12h6v10" />
              </svg>
              <span>Portal Toko</span>
            </button>
          )}

          {/* Auth Button */}
          <button
            type="button"
            className="customer-auth-btn"
            id="btn-customer-auth"
            onClick={onOpenAuthModal}
          >
            Daftar/Masuk
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="customer-mobile-toggle"
            aria-label="Buka menu navigasi"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="customer-mobile-drawer" id="customer-mobile-menu">
          <nav className="customer-mobile-links">
            <a
              href="#beranda-customer"
              className="customer-mobile-link active"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Beranda
            </a>
            <a
              href="#marketplace"
              className="customer-mobile-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('marketplace-section');
              }}
            >
              Marketplace
            </a>
            <a
              href="#kontak"
              className="customer-mobile-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('kontak-section');
              }}
            >
              Kontak
            </a>
            {onNavigateSeller && (
              <button
                type="button"
                className="customer-mobile-link text-left w-full text-[#3c6a00] font-semibold"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigateSeller();
                }}
              >
                🏬 Masuk Portal Toko (Seller)
              </button>
            )}
            <button
              type="button"
              className="customer-auth-btn w-full mt-2"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenAuthModal) onOpenAuthModal();
              }}
            >
              Daftar / Masuk
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
