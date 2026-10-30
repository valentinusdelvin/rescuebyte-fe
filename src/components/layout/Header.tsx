import React, { useState, useEffect, useRef } from 'react';
import { Menu, Store, ChevronDown, User, Globe, LogOut } from 'lucide-react';
import rescueBiteLogo from '../../assets/logo_new.svg';
import { logoutUser } from '../../services/authService';
import { getStoreProfile } from '../../services/storeService';

export interface HeaderProps {
  storeName?: string;
  storeLogo?: string;
  onNavigate?: (viewId: string) => void;
  onToggleMobileMenu?: () => void;
  onShowToast?: (message: string) => void;
}

/**
 * RescueBite Header Component
 * Contains the brand logo, mobile toggle, and store user dropdown menu.
 * Displays dynamic backend store logo and profile information.
 */
export function Header({
  storeName = 'Toko Reza',
  storeLogo: propStoreLogo,
  onNavigate,
  onToggleMobileMenu,
  onShowToast,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currentStoreName, setCurrentStoreName] = useState<string>(() => {
    try {
      return storeName || localStorage.getItem('rescuebyte_store_name') || 'Toko Reza';
    } catch {
      return storeName || 'Toko Reza';
    }
  });

  const [storeLogo, setStoreLogo] = useState<string>(() => {
    try {
      return propStoreLogo || localStorage.getItem('rescuebyte_store_logo') || '';
    } catch {
      return propStoreLogo || '';
    }
  });

  const [storeEmail, setStoreEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('rescuebyte_store_email') || 'TokoReza@gmail.com';
    } catch {
      return 'TokoReza@gmail.com';
    }
  });

  const [logoImageError, setLogoImageError] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    if (storeName) setCurrentStoreName(storeName);
  }, [storeName]);

  useEffect(() => {
    if (propStoreLogo !== undefined) {
      setStoreLogo(propStoreLogo);
      setLogoImageError(false);
    }
  }, [propStoreLogo]);

  // Fetch store profile from backend API and listen to updates
  useEffect(() => {
    let isMounted = true;

    const syncFromStorage = () => {
      try {
        const savedLogo = localStorage.getItem('rescuebyte_store_logo');
        if (savedLogo !== null) {
          setStoreLogo(savedLogo);
          setLogoImageError(false);
        }
        const savedName = localStorage.getItem('rescuebyte_store_name');
        if (savedName) setCurrentStoreName(savedName);
        const savedEmail = localStorage.getItem('rescuebyte_store_email');
        if (savedEmail) setStoreEmail(savedEmail);
      } catch {}
    };

    syncFromStorage();

    // Fetch live from backend endpoint /api/v1/stores/me/profile
    getStoreProfile()
      .then((store) => {
        if (!isMounted) return;
        if (store.profile_picture_url) {
          setStoreLogo(store.profile_picture_url);
          setLogoImageError(false);
          try {
            localStorage.setItem('rescuebyte_store_logo', store.profile_picture_url);
          } catch {}
        }
        if (store.name) {
          setCurrentStoreName(store.name);
          try {
            localStorage.setItem('rescuebyte_store_name', store.name);
          } catch {}
        }
        if (store.email) {
          setStoreEmail(store.email);
          try {
            localStorage.setItem('rescuebyte_store_email', store.email);
          } catch {}
        }
      })
      .catch(() => {});

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('rescuebyte_store_updated', syncFromStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('rescuebyte_store_updated', syncFromStorage);
    };
  }, []);

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
    if (onNavigate) onNavigate('view-customer-home');
  };

  const handleGotoProfil = () => {
    setIsDropdownOpen(false);
    if (onNavigate) onNavigate('view-profil');
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await logoutUser();
      if (onShowToast) onShowToast('Berhasil keluar dari akun.');
      if (onNavigate) onNavigate('view-customer-home');
    } catch {
      if (onShowToast) onShowToast('Berhasil keluar.');
      if (onNavigate) onNavigate('view-customer-home');
    }
  };

  return (
    <header className="sticky top-0 z-100 flex items-center justify-between h-20 max-md:h-18 px-0 pr-8 max-md:px-4 bg-white border-b border-black/8 shadow-[0_4px_18px_-2px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.03)]" id="app-header">
      <div className="flex items-center justify-center w-62.5 max-md:w-auto max-md:justify-start max-md:gap-3 shrink-0 h-full">
        <button
          type="button"
          className="hidden max-md:flex items-center justify-center w-10 h-10 rounded-lg text-[#111827] hover:bg-[#f3f4f6] transition-colors duration-150 cursor-pointer"
          id="mobile-toggle"
          aria-label="Buka Menu Navigasi"
          onClick={onToggleMobileMenu}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* RescueBite Logo */}
        <a href="#beranda-customer" className="flex items-center justify-center gap-2.5 no-underline text-inherit hover:scale-[1.03] transition-transform duration-150" id="brand-logo-link" onClick={handleLogoClick} title="Ke Landing Page RescueBite">
          <img
            src={rescueBiteLogo}
            alt="RescueBite"
            className="h-10 max-md:h-9 w-auto object-contain block"
          />
          <span className="text-xl max-md:text-lg font-extrabold tracking-tight select-none">
            <span className="text-[#191c1d]">Rescue</span>
            <span className="text-[#237126]">Bite</span>
          </span>
        </a>
      </div>

      <div className="flex items-center gap-3">
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
          {/* Logo Profil Toko (Backend Logo atau Toko Icon) */}
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#bbf7d0] flex items-center justify-center border border-gray-200">
            {storeLogo && !logoImageError ? (
              <img
                src={storeLogo}
                alt={currentStoreName}
                className="w-full h-full object-cover"
                onError={() => setLogoImageError(true)}
              />
            ) : (
              <Store className="w-4.5 h-4.5 text-[#111827]" aria-hidden="true" />
            )}
          </div>
          <span className="text-[1.15rem] font-bold tracking-[-0.01em] text-[#111827] max-w-40 truncate">{currentStoreName}</span>
          <ChevronDown className={`w-4 h-4 text-[#6b7280] transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />

          {/* Dropdown Menu */}
          <div className={`absolute top-[calc(100%+8px)] right-0 w-56 bg-white border border-[#e5e7eb] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-2 z-110 flex-col ${isDropdownOpen ? 'flex' : 'hidden'}`} id="profile-dropdown">
            <div className="py-2 px-2.5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-[#bbf7d0] flex items-center justify-center border border-gray-200">
                {storeLogo && !logoImageError ? (
                  <img
                    src={storeLogo}
                    alt={currentStoreName}
                    className="w-full h-full object-cover"
                    onError={() => setLogoImageError(true)}
                  />
                ) : (
                  <Store className="w-5 h-5 text-[#111827]" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[0.95rem] text-[#111827] truncate">{currentStoreName}</p>
                <p className="text-[0.78rem] text-[#6b7280] truncate">{storeEmail}</p>
              </div>
            </div>
            <hr className="border-0 h-px bg-[#e5e7eb] my-1.5" />
            <button type="button" className="flex items-center gap-2.5 py-2.25 px-3 rounded-lg text-[0.9rem] font-semibold text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827] text-left w-full transition-colors cursor-pointer" id="dropdown-goto-profil" onClick={handleGotoProfil}>
              <User className="w-4 h-4" />
              Profil Toko
            </button>
            <button
              type="button"
              className="flex items-center gap-2.5 py-2.25 px-3 rounded-lg text-[0.9rem] font-semibold text-primary hover:bg-[#dcfce7] hover:text-primary-dark transition-colors w-full text-left cursor-pointer"
              id="dropdown-goto-customer-home"
              onClick={() => {
                setIsDropdownOpen(false);
                if (onNavigate) onNavigate('view-customer-home');
              }}
            >
              <Globe className="w-4 h-4" />
              Buka Web
            </button>
            <hr className="border-0 h-px bg-[#e5e7eb] my-1.5" />
            <button type="button" className="flex items-center gap-2.5 py-2.25 px-3 rounded-lg text-[0.9rem] font-semibold text-[#dc2626] hover:bg-[#fee2e2] hover:text-[#991b1b] transition-colors w-full text-left cursor-pointer" id="dropdown-logout-btn" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
