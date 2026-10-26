import React, { useState, useEffect, useRef } from 'react';
import rescueBiteLogo from '../../assets/logo.svg';

export interface HeaderProps {
  storeName?: string;
  onNavigate?: (viewId: string) => void;
  onToggleMobileMenu?: () => void;
  onShowToast?: (message: string) => void;
}

/**
 * RescueBite Header Component
 * Contains the brand logo, mobile toggle, and store user dropdown menu.
 * Styled with Tailwind CSS classes.
 */
export function Header({
  storeName = 'Toko Reza',
  onNavigate,
  onToggleMobileMenu,
  onShowToast,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onNavigate) onNavigate('view-beranda');
  };

  const handleGotoProfil = () => {
    setIsDropdownOpen(false);
    if (onNavigate) onNavigate('view-profil');
  };

  const handleGotoUbahPin = () => {
    setIsDropdownOpen(false);
    if (onShowToast) onShowToast('Fitur Ubah PIN akan segera hadir.');
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (onShowToast) onShowToast('Sesi Anda tetap aktif dalam mode demo.');
  };

  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between h-20 max-md:h-[72px] px-0 pr-8 max-md:px-4 bg-white border-b border-black/[0.08] shadow-[0_4px_18px_-2px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.03)]" id="app-header">
      <div className="flex items-center justify-center w-[250px] max-md:w-auto max-md:justify-start max-md:gap-3 shrink-0 h-full">
        <button
          type="button"
          className="hidden max-md:flex items-center justify-center w-10 h-10 rounded-lg text-[#111827] hover:bg-[#f3f4f6] transition-colors duration-150 cursor-pointer"
          id="mobile-toggle"
          aria-label="Buka Menu Navigasi"
          onClick={onToggleMobileMenu}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* RescueBite Logo */}
        <a href="#beranda-seller" className="flex items-center justify-center gap-2.5 no-underline text-inherit hover:scale-[1.03] transition-transform duration-150" id="brand-logo-link" onClick={handleLogoClick}>
          <img
            src={rescueBiteLogo}
            alt="RescueBite"
            className="h-[62px] max-md:h-12 w-auto max-w-[190px] object-contain block"
          />
        </a>
      </div>

      <div className="flex items-center gap-3">
        {/* Switch to Customer Portal button */}
        <button
          type="button"
          className="customer-switch-btn inline-flex items-center gap-1.5 text-xs font-semibold text-[#3c6a00] bg-[rgba(60,106,0,0.08)] hover:bg-[rgba(60,106,0,0.15)] border border-[rgba(60,106,0,0.2)] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          id="btn-goto-customer-view"
          title="Buka Web Customer / Pelanggan"
          onClick={() => onNavigate && onNavigate('view-customer-home')}
        >
          <span>🌐 Web Customer</span>
        </button>

        {/* Store Profile Item */}
        <div
          ref={dropdownRef}
          className="relative flex items-center gap-2.5 py-1.5 px-3 rounded-xl cursor-pointer select-none hover:bg-[#f3f4f6] focus-visible:outline-none transition-colors duration-150"
          id="user-profile-menu-trigger"
          tabIndex={0}
          role="button"
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen((prev) => !prev);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsDropdownOpen((prev) => !prev);
            }
          }}
        >
          <div className="flex items-center justify-center text-[#111827]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="9" r="3.2"></circle>
              <path d="M6.168 18.849a6.5 6.5 0 0 1 11.664 0"></path>
            </svg>
          </div>
          <span className="text-[1.15rem] font-bold tracking-[-0.01em] text-[#111827] max-w-[160px] truncate">{storeName}</span>
          <svg className={`text-[#6b7280] transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>

          {/* Dropdown Menu */}
          <div className={`absolute top-[calc(100%+8px)] right-0 w-[210px] bg-white border border-[#e5e7eb] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-2 z-[110] flex-col ${isDropdownOpen ? 'flex' : 'hidden'}`} id="profile-dropdown">
            <div className="py-2 px-2.5">
              <p className="font-bold text-[0.95rem] text-[#111827] truncate">{storeName}</p>
              <p className="text-[0.78rem] text-[#6b7280] truncate">{storeName.replace(/\s+/g, '')}@gmail.com</p>
            </div>
            <hr className="border-0 h-px bg-[#e5e7eb] my-1.5" />
            <button type="button" className="flex items-center gap-2.5 py-[9px] px-3 rounded-lg text-[0.9rem] font-semibold text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827] text-left w-full transition-colors cursor-pointer" id="dropdown-goto-profil" onClick={handleGotoProfil}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Profil Toko
            </button>
            <button type="button" className="flex items-center gap-2.5 py-[9px] px-3 rounded-lg text-[0.9rem] font-semibold text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827] text-left w-full transition-colors cursor-pointer" id="dropdown-goto-ubah-pin" onClick={handleGotoUbahPin}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m21 2-9.6 9.6" />
                <path d="m15.5 7.5 3 3L22 7l-2-2" />
              </svg>
              Ubah PIN
            </button>
            <button
              type="button"
              className="flex items-center gap-2.5 py-[9px] px-3 rounded-lg text-[0.9rem] font-semibold text-[#15803d] hover:bg-[#dcfce7] hover:text-[#166534] transition-colors w-full text-left cursor-pointer"
              id="dropdown-goto-customer-home"
              onClick={() => {
                setIsDropdownOpen(false);
                if (onNavigate) onNavigate('view-customer-home');
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Buka Web Customer
            </button>
            <hr className="border-0 h-px bg-[#e5e7eb] my-1.5" />
            <button type="button" className="flex items-center gap-2.5 py-[9px] px-3 rounded-lg text-[0.9rem] font-semibold text-[#dc2626] hover:bg-[#fee2e2] hover:text-[#991b1b] transition-colors w-full text-left cursor-pointer" id="dropdown-logout-btn" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
