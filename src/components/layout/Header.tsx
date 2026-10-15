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

  const handleGotoUbahPin = () => {
    setIsDropdownOpen(false);
    if (onShowToast) onShowToast('Fitur Ubah PIN akan segera hadir.');
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
          <img
            src={rescueBiteLogo}
            alt="RescueBite"
            className="brand-logo-image"
          />
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
            <button type="button" className="dropdown-item" id="dropdown-goto-ubah-pin" onClick={handleGotoUbahPin}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="m21 2-9.6 9.6" />
                <path d="m15.5 7.5 3 3L22 7l-2-2" />
              </svg>
              Ubah PIN
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
