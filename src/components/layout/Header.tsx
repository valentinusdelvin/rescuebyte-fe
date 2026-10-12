import React, { useState, useEffect, useRef } from 'react';

export interface HeaderProps {
  storeName?: string;
  onNavigate?: (viewId: string) => void;
  onToggleMobileMenu?: () => void;
  onShowToast?: (message: string) => void;
}

/**
 * RescueBite Header Component
 * Contains the brand logo, mobile toggle, and store user dropdown menu.
 * Complies with .agents/docs/architecture.md, .agents/docs/typescript.md, and .agents/docs/styling.md.
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

  const handleGotoBeranda = () => {
    setIsDropdownOpen(false);
    if (onNavigate) onNavigate('view-beranda');
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (onShowToast) onShowToast('Sesi Anda tetap aktif dalam mode demo.');
  };

  return (
    <header className="app-header" id="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-toggle"
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
        <a href="#beranda" className="brand-logo" id="brand-logo-link" onClick={handleLogoClick}>
          <div className="logo-mark">
            <svg viewBox="0 0 60 60" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Leaf Elements */}
              <path d="M30 6C30 6 36 12 36 18C36 21 34 23 30 24C26 23 24 21 24 18C24 12 30 6 30 6Z" fill="#15803d"/>
              <path d="M35 14C35 14 42 16 43 23C44 26 42 29 39 30C36 29 34 26 34 22C34 18 35 14 35 14Z" fill="#84cc16"/>
              <path d="M25 14C25 14 18 16 17 23C16 26 18 29 21 30C24 29 26 26 26 22C26 18 25 14 25 14Z" fill="#65a30d"/>
              <circle cx="37" cy="11" r="3" fill="#eab308"/>
              {/* Bowl / Smile Silhouette */}
              <path d="M14 26C14 26 16 46 30 46C44 46 46 26 46 26C42 30 36 32 30 32C24 32 18 30 14 26Z" fill="#22c55e"/>
              <path d="M19 45C22 51 27 54 30 54C33 54 38 51 41 45C37 47 33 48 30 48C27 48 23 47 19 45Z" fill="#166534"/>
            </svg>
          </div>
          <div className="logo-text-group">
            <span className="brand-title">Rescue<span className="brand-accent">Bite</span></span>
            <span className="brand-tagline">SAVE FOOD, SHARE THE LOVE</span>
          </div>
        </a>
      </div>

      <div className="header-right">
        {/* Store Profile Pill */}
        <div
          ref={dropdownRef}
          className="user-profile-btn"
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
          <div className="user-avatar-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="9" r="3.2"></circle>
              <path d="M6.168 18.849a6.5 6.5 0 0 1 11.664 0"></path>
            </svg>
          </div>
          <span className="user-store-name">{storeName}</span>
          <svg className="chevron-down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>

          {/* Dropdown Menu */}
          <div className={`profile-dropdown ${isDropdownOpen ? 'open' : ''}`} id="profile-dropdown">
            <div className="dropdown-header">
              <p className="dropdown-store-title">{storeName}</p>
              <p className="dropdown-store-subtitle">{storeName.replace(/\s+/g, '')}@gmail.com</p>
            </div>
            <hr className="dropdown-divider" />
            <button type="button" className="dropdown-item" id="dropdown-goto-profil" onClick={handleGotoProfil}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Profil Toko
            </button>
            <button type="button" className="dropdown-item" id="dropdown-goto-beranda" onClick={handleGotoBeranda}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              Beranda
            </button>
            <hr className="dropdown-divider" />
            <button type="button" className="dropdown-item text-danger" id="dropdown-logout-btn" onClick={handleLogout}>
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
