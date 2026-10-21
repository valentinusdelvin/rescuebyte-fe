import { useState } from 'react';
import rescueBiteLogo from '../../assets/logo.svg';

export interface CustomerHeaderProps {
  activeTab?: 'beranda' | 'marketplace' | 'kontak';
  onNavigateSeller?: () => void;
  onOpenAuthModal?: () => void;
}

/**
 * Customer Floating Pill Navigation Bar
 * Styled with Tailwind CSS classes.
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
    <header className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none" id="customer-header">
      <div className="pointer-events-auto flex items-center justify-between gap-4 bg-white/90 backdrop-blur-md border border-gray-200/80 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.08),0_2px_8px_-1px_rgba(0,0,0,0.04)] rounded-full px-3 py-1.5 w-full max-w-4xl transition-all">
        {/* Brand Logo Circular Badge */}
        <a
          href="#beranda-customer"
          className="w-9 h-9 rounded-full bg-white border border-gray-200/80 shadow-xs flex items-center justify-center overflow-hidden shrink-0 hover:scale-105 transition-transform"
          aria-label="RescueBite Customer Home"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img
            src={rescueBiteLogo}
            alt="RescueBite"
            className="w-6 h-6 object-contain"
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi Utama Pelanggan">
          <a
            href="#beranda-customer"
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeTab === 'beranda'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Beranda
          </a>
          <a
            href="#marketplace"
            className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('marketplace-section');
            }}
          >
            Marketplace
          </a>
          <a
            href="#kontak"
            className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('kontak-section');
            }}
          >
            Kontak
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          {/* Seller Mode Switcher Quick Link */}
          {onNavigateSeller && (
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
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
            className="px-4 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            id="btn-customer-auth"
            onClick={onOpenAuthModal}
          >
            Daftar/Masuk
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="flex md:hidden p-1.5 text-gray-700 hover:text-gray-900 cursor-pointer"
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
        <div className="pointer-events-auto absolute top-full left-4 right-4 mt-2 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl flex flex-col gap-2 md:hidden" id="customer-mobile-menu">
          <nav className="flex flex-col gap-1">
            <a
              href="#beranda-customer"
              className="px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-800"
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
              className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('marketplace-section');
              }}
            >
              Marketplace
            </a>
            <a
              href="#kontak"
              className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
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
                className="px-3 py-2 rounded-xl text-sm font-semibold text-left text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
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
              className="w-full mt-2 py-2 px-4 rounded-xl bg-emerald-700 text-white text-xs font-bold text-center cursor-pointer"
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
