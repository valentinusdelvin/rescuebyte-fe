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
  const [selectedTab, setSelectedTab] = useState<'beranda' | 'marketplace' | 'kontak'>(activeTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTab = (tab: 'beranda' | 'marketplace' | 'kontak') => {
    setSelectedTab(tab);
    if (tab === 'beranda') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'marketplace') {
      scrollToSection('marketplace-section');
    } else if (tab === 'kontak') {
      scrollToSection('kontak-section');
    }
  };

  const handleAuthClick = () => {
    if (onNavigateSeller) {
      onNavigateSeller();
    } else if (onOpenAuthModal) {
      onOpenAuthModal();
    }
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none" id="customer-header">
      <div className="pointer-events-auto flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
          {/* 1. Standalone Circular Logo Badge */}
          <a
            href="#beranda-customer"
            className="w-13 h-13 md:w-16 md:h-16 rounded-full bg-white border-2 border-black shadow-sm flex items-center justify-center overflow-hidden shrink-0 hover:scale-105 transition-transform"
            aria-label="RescueBite Customer Home"
            onClick={(e) => {
              e.preventDefault();
              handleSelectTab('beranda');
            }}
          >
            <img
              src={rescueBiteLogo}
              alt="RescueBite"
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
            />
          </a>

          {/* 2. Standalone Center Navigation Pill */}
          <div className="bg-white border-2 border-black rounded-full p-1.5 md:p-2 flex items-center shadow-sm">
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2 lg:gap-3" aria-label="Navigasi Utama Pelanggan">
              <a
                href="#beranda-customer"
                className={`px-8 lg:px-10 py-2.5 lg:py-3 rounded-full text-base font-bold transition-all ${selectedTab === 'beranda'
                    ? 'bg-[#1e2420] text-white shadow-xs'
                    : 'text-[#1b1c1c] hover:text-black hover:bg-gray-100'
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('beranda');
                }}
              >
                Beranda
              </a>
              <a
                href="#marketplace"
                className={`px-6 lg:px-8 py-2.5 lg:py-3 rounded-full text-base font-bold transition-all ${selectedTab === 'marketplace'
                    ? 'bg-[#1e2420] text-white shadow-xs'
                    : 'text-[#1b1c1c] hover:text-black hover:bg-gray-100'
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('marketplace');
                }}
              >
                Marketplace
              </a>
              <a
                href="#kontak"
                className={`px-6 lg:px-8 py-2.5 lg:py-3 rounded-full text-base font-bold transition-all ${selectedTab === 'kontak'
                    ? 'bg-[#1e2420] text-white shadow-xs'
                    : 'text-[#1b1c1c] hover:text-black hover:bg-gray-100'
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectTab('kontak');
                }}
              >
                Kontak
              </a>
            </nav>

            {/* Mobile Hamburger inside the pill for small screens */}
            <button
              type="button"
              className="flex md:hidden px-4 py-2 text-sm font-bold text-[#1b1c1c] items-center gap-2 cursor-pointer"
              aria-label="Buka menu navigasi"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              <span className="font-bold">Menu</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
        </div>

        {/* 3. Standalone Daftar/Masuk Pill Button - Navigates to Restaurant Dashboard */}
        <button
          type="button"
          className="px-7 md:px-10 py-2.5 md:py-3.5 rounded-full bg-white border-2 border-black text-[#1b1c1c] hover:bg-gray-50 text-base font-bold shadow-sm transition-all cursor-pointer shrink-0"
          id="btn-customer-auth"
          onClick={handleAuthClick}
          title="Beralih ke Dashboard Restoran"
        >
          Daftar/Masuk
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto absolute top-full left-4 right-4 mt-3 p-4 bg-white/98 backdrop-blur-md rounded-2xl border-[1.5px] border-black shadow-2xl flex flex-col gap-2 md:hidden" id="customer-mobile-menu">
          <nav className="flex flex-col gap-1.5">
            <a
              href="#beranda-customer"
              className={`px-4 py-2.5 rounded-xl text-sm font-bold ${selectedTab === 'beranda' ? 'bg-[#1e2420] text-white' : 'text-[#1b1c1c] hover:bg-gray-100'
                }`}
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                handleSelectTab('beranda');
              }}
            >
              Beranda
            </a>
            <a
              href="#marketplace"
              className={`px-4 py-2.5 rounded-xl text-sm font-bold ${selectedTab === 'marketplace' ? 'bg-[#1e2420] text-white' : 'text-[#1b1c1c] hover:bg-gray-100'
                }`}
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                handleSelectTab('marketplace');
              }}
            >
              Marketplace
            </a>
            <a
              href="#kontak"
              className={`px-4 py-2.5 rounded-xl text-sm font-bold ${selectedTab === 'kontak' ? 'bg-[#1e2420] text-white' : 'text-[#1b1c1c] hover:bg-gray-100'
                }`}
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                handleSelectTab('kontak');
              }}
            >
              Kontak
            </a>
            <button
              type="button"
              className="w-full mt-2 py-2 px-4 rounded-xl bg-black text-white text-xs font-bold text-center cursor-pointer"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleAuthClick();
              }}
            >
              Daftar / Masuk (Dashboard Restoran)
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
