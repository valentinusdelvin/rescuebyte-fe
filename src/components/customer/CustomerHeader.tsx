import { useState, useRef, useEffect, useCallback } from 'react';
import { User } from 'lucide-react';
import rescueBiteLogo from '../../assets/logo.svg';
import { getCurrentUser, subscribeToAuth, logoutUser, clearAuth } from '../../services/authService';
import { UserPayload } from '../../types';

export interface CustomerHeaderProps {
  activeTab?: 'beranda' | 'marketplace' | 'kontak';
  onNavigateSeller?: () => void;
  onNavigateProfile?: () => void;
  onNavigateOrders?: () => void;
  onOpenAuthModal?: () => void;
  onNavigateAuth?: () => void;
  onSelectTab?: (tab: 'beranda' | 'marketplace' | 'kontak') => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

// =========================================================================
// ⚙️ PENGATURAN UKURAN MEMBESAR SAAT HOVER (HOVER SCALE)
// Sesuaikan nilai di bawah ini untuk mengatur seberapa besar blok membesar saat kursor diarahkan:
// - 1.05 = membesar 5%  (halus / subtle)
// - 1.08 = membesar 8%  (proporsional & elegan - Rekomendasi)
// - 1.10 = membesar 10% (jelas & tegas)
// - 1.15 = membesar 15% (besar & menonjol)
// =========================================================================
export const HOVER_SCALE_LOGO = 1.2; // 👈 Atur ukuran membesar Logo di sini
export const HOVER_SCALE_AUTH = 1.2; // 👈 Atur ukuran membesar tombol Daftar/Masuk di sini

type TabType = 'beranda' | 'marketplace' | 'kontak';
type IndicatorKey = 'logo' | 'beranda' | 'marketplace' | 'kontak' | 'auth';

interface NavTabItem {
  id: TabType;
  label: string;
  href: string;
}

// Semua tab di dalam kapsul tengah memiliki ukuran panjang yang sama persis (uniform)
const NAV_TABS: NavTabItem[] = [
  { id: 'beranda', label: 'Beranda', href: '#beranda-customer' },
  { id: 'marketplace', label: 'Marketplace', href: '#marketplace' },
  { id: 'kontak', label: 'Kontak', href: '#kontak' },
];

/**
 * Customer Floating Pill Navigation Bar
 * - Center Capsule: Uniform-sized Animated Sliding Navbar / Active Indicator
 * - Logo & Daftar/Masuk / Profile Avatar: Cross-over sliding indicator + smooth hover scale expansion
 */
export function CustomerHeader({
  activeTab = 'beranda',
  onNavigateSeller,
  onNavigateProfile,
  onNavigateOrders,
  onOpenAuthModal,
  onNavigateAuth,
  onSelectTab,
  onShowToast,
}: CustomerHeaderProps) {
  const [currentUser, setCurrentUser] = useState<UserPayload | null>(() => getCurrentUser());
  const [selectedTab, setSelectedTab] = useState<TabType>(activeTab);
  const [hoveredTab, setHoveredTab] = useState<IndicatorKey | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileDropdownOpen]);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(false);
    if (onNavigateProfile) {
      onNavigateProfile();
    } else {
      window.location.hash = '#akun';
    }
  };

  const handleOrdersClick = () => {
    setIsProfileDropdownOpen(false);
    if (onNavigateOrders) {
      onNavigateOrders();
    } else {
      window.location.hash = '#riwayat-seller';
    }
  };

  const handleSellerClick = () => {
    setIsProfileDropdownOpen(false);
    if (onNavigateSeller) {
      onNavigateSeller();
    } else {
      window.location.hash = '#beranda-seller';
    }
  };

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    try {
      await logoutUser();
      if (onShowToast) {
        onShowToast('Berhasil keluar dari akun.', 'success');
      }
    } catch {
      clearAuth();
      if (onShowToast) {
        onShowToast('Berhasil keluar.', 'success');
      }
    }
  };

  // Subscribe to auth state updates reactively
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Common header container ref for coordinate calculations across all 3 elements
  const headerContainerRef = useRef<HTMLDivElement>(null);

  // References to all 5 interactive elements
  const itemRefs = useRef<Record<IndicatorKey, HTMLElement | null>>({
    logo: null,
    beranda: null,
    marketplace: null,
    kontak: null,
    auth: null,
  });

  // Indicator styles for smooth sliding animation
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    ready: boolean;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  const isAutoScrollingRef = useRef(false);

  // Target indicator is hovered element if hovered, otherwise active/selected page tab
  const activeIndicatorKey: IndicatorKey = hoveredTab ?? selectedTab;

  // Scale for indicator: blooms when on logo or auth button
  const currentScale =
    activeIndicatorKey === 'logo'
      ? HOVER_SCALE_LOGO
      : activeIndicatorKey === 'auth'
        ? currentUser
          ? HOVER_SCALE_LOGO
          : HOVER_SCALE_AUTH
        : 1;

  // Sync selected tab when activeTab prop changes (React recommended pattern without effect)
  const [prevActiveTab, setPrevActiveTab] = useState(activeTab);
  if (activeTab !== prevActiveTab) {
    setPrevActiveTab(activeTab);
    setSelectedTab(activeTab);
  }

  // Update sliding indicator bounding box relative to headerContainerRef
  const updateIndicatorPosition = useCallback(() => {
    const currentKey: IndicatorKey = hoveredTab ?? selectedTab;
    const currentEl = itemRefs.current[currentKey];
    const containerEl = headerContainerRef.current;
    if (!currentEl || !containerEl) return;

    // Use unscaled layout dimensions
    const width = currentEl.offsetWidth;
    const height = currentEl.offsetHeight;

    // Calculate center point relative to container to prevent double-scaling
    const targetRect = currentEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    const centerX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const centerY = targetRect.top + targetRect.height / 2 - containerRect.top;

    setIndicatorStyle({
      left: centerX - width / 2,
      top: centerY - height / 2,
      width,
      height,
      ready: true,
    });
  }, [hoveredTab, selectedTab]);

  // Recalculate on tab change or mount
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      updateIndicatorPosition();
    });
    return () => cancelAnimationFrame(rafId);
  }, [updateIndicatorPosition]);

  // Recalculate on resize and when fonts load
  useEffect(() => {
    const handleResize = () => {
      updateIndicatorPosition();
    };

    window.addEventListener('resize', handleResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(updateIndicatorPosition);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicatorPosition]);

  // Keep active tab indicator locked to the activeTab (Beranda on home page) without scrollspy switching
  useEffect(() => {
    setSelectedTab(activeTab);
  }, [activeTab]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTab = (tab: TabType) => {
    // Guard: Redirect unauthenticated user to login when clicking marketplace
    if (tab === 'marketplace') {
      const user = getCurrentUser();
      if (!user) {
        if (onShowToast) {
          onShowToast('Silakan masuk terlebih dahulu untuk mengakses Marketplace.', 'warning');
        }
        if (onNavigateAuth) {
          onNavigateAuth();
        } else {
          window.location.hash = '#masuk';
        }
        return;
      }
    }

    setSelectedTab(tab);
    isAutoScrollingRef.current = true;
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 900);

    if (onSelectTab) {
      onSelectTab(tab);
      return;
    }

    if (tab === 'beranda') {
      if (window.location.hash.startsWith('#marketplace')) {
        window.location.hash = '#beranda-customer';
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (tab === 'marketplace') {
      window.location.hash = '#marketplace';
    } else if (tab === 'kontak') {
      scrollToSection('kontak-section');
    }
  };

  const handleAuthClick = () => {
    if (onNavigateAuth) {
      onNavigateAuth();
    } else if (onOpenAuthModal) {
      onOpenAuthModal();
    } else if (onNavigateSeller) {
      onNavigateSeller();
    }
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none" id="customer-header">
      <div
        ref={headerContainerRef}
        className="pointer-events-auto relative flex items-center justify-center gap-3 sm:gap-4 md:gap-5"
        onMouseLeave={() => setHoveredTab(null)}
      >
        {/* Animated Flying Indicator - crosses over Logo, Nav tabs, and Daftar/Masuk */}
        <div
          className={`hidden md:block absolute rounded-full bg-[#1e2420] pointer-events-none shadow-xs ease-[cubic-bezier(0.25,1,0.5,1)] z-10 ${indicatorStyle.ready ? 'opacity-100 transition-all duration-300' : 'opacity-0'
            }`}
          style={{
            left: `${indicatorStyle.left}px`,
            top: `${indicatorStyle.top}px`,
            width: `${indicatorStyle.width}px`,
            height: `${indicatorStyle.height}px`,
            transform: `scale(${currentScale})`,
            transformOrigin: 'center center',
          }}
          aria-hidden="true"
        />

        {/* 1. Standalone Circular Logo Badge */}
        <a
          ref={(el) => {
            itemRefs.current['logo'] = el;
          }}
          href="#beranda-customer"
          onMouseEnter={() => setHoveredTab('logo')}
          onFocus={() => setHoveredTab('logo')}
          onBlur={() => setHoveredTab(null)}
          className={`w-13 h-13 md:w-16 md:h-16 rounded-full border-2 border-black shadow-sm flex items-center justify-center shrink-0 relative z-20 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${activeIndicatorKey === 'logo' ? 'bg-transparent' : 'bg-white'
            }`}
          style={{
            transform: activeIndicatorKey === 'logo' ? `scale(${HOVER_SCALE_LOGO})` : 'scale(1)',
            transformOrigin: 'center center',
          }}
          aria-label="RescueBite Customer Home"
          onClick={(e) => {
            e.preventDefault();
            handleSelectTab('beranda');
          }}
        >
          <img
            src={rescueBiteLogo}
            alt="RescueBite"
            className={`w-8 h-8 md:w-10 md:h-10 object-contain relative z-30 transition-all duration-200 select-none ${activeIndicatorKey === 'logo' ? 'brightness-0 invert' : ''
              }`}
          />
        </a>

        {/* 2. Standalone Center Navigation Pill - Semua tab memiliki ukuran panjang sama persis */}
        <div className="bg-white border-2 border-black rounded-full p-1.5 md:p-2 flex items-center shadow-sm">
          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2"
            aria-label="Navigasi Utama Pelanggan"
          >
            {NAV_TABS.map((tab) => {
              const isTarget = activeIndicatorKey === tab.id;
              return (
                <a
                  key={tab.id}
                  ref={(el) => {
                    itemRefs.current[tab.id] = el;
                  }}
                  href={tab.href}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onFocus={() => setHoveredTab(tab.id)}
                  onBlur={() => setHoveredTab(null)}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectTab(tab.id);
                  }}
                  className={`relative z-20 w-28 sm:w-32 lg:w-36 py-2.5 lg:py-3 rounded-full text-base font-bold flex items-center justify-center text-center transition-colors duration-200 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${isTarget ? 'text-white' : 'text-[#1b1c1c] hover:text-black'
                    }`}
                >
                  {tab.label}
                </a>
              );
            })}
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

        {/* 3. Standalone User Avatar Circle with Dropdown (Logged In) OR Daftar/Masuk Pill (Logged Out) */}
        {currentUser ? (
          <div className="relative z-30 shrink-0" ref={profileDropdownRef}>
            {/* Avatar Circle toggling Profile Dropdown */}
            <button
              ref={(el) => {
                itemRefs.current['auth'] = el;
              }}
              type="button"
              onMouseEnter={() => setHoveredTab('auth')}
              onFocus={() => setHoveredTab('auth')}
              onBlur={() => setHoveredTab(null)}
              className={`w-13 h-13 md:w-16 md:h-16 rounded-full border-2 border-black shadow-sm flex items-center justify-center shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                activeIndicatorKey === 'auth' || isProfileDropdownOpen ? 'bg-[#121613]' : 'bg-[#1e2420] hover:bg-[#161a17]'
              }`}
              style={{
                transform: (activeIndicatorKey === 'auth' || isProfileDropdownOpen) ? `scale(${HOVER_SCALE_LOGO})` : 'scale(1)',
                transformOrigin: 'center center',
              }}
              id="btn-customer-avatar"
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="menu"
              title={`Menu Akun: ${currentUser.name}`}
              aria-label={`Menu Akun ${currentUser.name}`}
            >
              <User className="w-6 h-6 md:w-7 md:h-7 text-white stroke-[2.2] relative z-30" />
            </button>

            {/* Dropdown Menu (Clean layout with precise arrow alignment and comfortable tap targets) */}
            {isProfileDropdownOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="btn-customer-avatar"
                className="absolute right-0 top-full mt-4 w-52 sm:w-56 bg-white rounded-2xl border-2 border-black shadow-xl py-1.5 z-50 text-left transition-all duration-200 animate-in fade-in zoom-in-95"
              >
                {/* Pointer triangle arrow pointing up to the avatar center */}
                <div
                  className="absolute -top-[9px] right-[18px] md:right-[24px] w-4 h-4 bg-white border-t-2 border-l-2 border-black rotate-45 pointer-events-none z-10"
                  aria-hidden="true"
                />
                {/* Mask to ensure seamless merge with the popover top border */}
                <div
                  className="absolute top-0 right-[15px] md:right-[21px] w-5 h-1.5 bg-white pointer-events-none z-10"
                  aria-hidden="true"
                />

                {/* Compact User Header */}
                <div className="px-4 pt-2.5 pb-2 border-b border-[#f0eded] mb-1">
                  <p className="text-xs font-bold text-[#1b1c1c] truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-[#525252] truncate font-medium">
                    {currentUser.email}
                  </p>
                </div>

                {/* Dropdown Action Items - Clean text without emojis, comfortable tap targets */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleProfileClick}
                    className="mx-1.5 px-2.5 py-2 rounded-xl text-left text-sm font-semibold text-[#1b1c1c] hover:bg-[#1e2420] hover:text-white transition-all cursor-pointer"
                    id="btn-dropdown-profile"
                  >
                    Akun Saya
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleOrdersClick}
                    className="mx-1.5 px-2.5 py-2 rounded-xl text-left text-sm font-semibold text-[#1b1c1c] hover:bg-[#1e2420] hover:text-white transition-all cursor-pointer"
                    id="btn-dropdown-orders"
                  >
                    Pesanan Saya
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSellerClick}
                    className="mx-1.5 px-2.5 py-2 rounded-xl text-left text-sm font-semibold text-[#1b1c1c] hover:bg-[#1e2420] hover:text-white transition-all cursor-pointer"
                    id="btn-dropdown-seller-dashboard"
                  >
                    Dashboard Restoran
                  </button>

                  <div className="h-px bg-[#f0eded] my-1 mx-2" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      setIsProfileDropdownOpen(false);
                      await handleLogout();
                    }}
                    className="mx-1.5 px-2.5 py-2 rounded-xl text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    id="btn-customer-logout"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            ref={(el) => {
              itemRefs.current['auth'] = el;
            }}
            type="button"
            onMouseEnter={() => setHoveredTab('auth')}
            onFocus={() => setHoveredTab('auth')}
            onBlur={() => setHoveredTab(null)}
            className={`relative z-20 px-10 md:px-10 py-2.5 md:py-3.5 rounded-full border-2 border-black text-base font-bold shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-black ${
              activeIndicatorKey === 'auth' ? 'bg-transparent' : 'bg-white hover:bg-gray-50'
            }`}
            style={{
              transform: activeIndicatorKey === 'auth' ? `scale(${HOVER_SCALE_AUTH})` : 'scale(1)',
              transformOrigin: 'center center',
            }}
            id="btn-customer-auth"
            onClick={handleAuthClick}
            title="Masuk atau Daftar Akun"
          >
            <span
              className={`relative z-30 transition-colors duration-200 select-none ${
                activeIndicatorKey === 'auth' ? 'text-white' : 'text-[#1b1c1c]'
              }`}
            >
              Daftar/Masuk
            </span>
          </button>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto absolute top-full left-4 right-4 mt-3 p-4 bg-white/98 backdrop-blur-md rounded-2xl border-[1.5px] border-black shadow-2xl flex flex-col gap-2 md:hidden" id="customer-mobile-menu">
          <nav className="flex flex-col gap-1.5">
            {NAV_TABS.map((tab) => (
              <a
                key={tab.id}
                href={tab.href}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${selectedTab === tab.id ? 'bg-[#1e2420] text-white' : 'text-[#1b1c1c] hover:bg-gray-100'
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  handleSelectTab(tab.id);
                }}
              >
                {tab.label}
              </a>
            ))}
            {currentUser ? (
              <div className="flex flex-col gap-1.5 mt-2">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F4F3F0] text-[#1b1c1c] text-xs font-semibold text-left flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleProfileClick();
                  }}
                >
                  <span>Akun Saya</span>
                  <span className="text-[11px] text-[#737874]">{currentUser.name}</span>
                </button>
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl text-[#1b1c1c] hover:bg-[#F4F3F0] text-xs font-semibold text-left cursor-pointer"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleOrdersClick();
                  }}
                >
                  Pesanan Saya
                </button>
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1e2420] text-white text-xs font-semibold text-left cursor-pointer"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSellerClick();
                  }}
                >
                  Dashboard Restoran
                </button>
                <button
                  type="button"
                  className="w-full py-2 px-4 rounded-xl border border-red-300 bg-red-50 text-red-600 text-xs font-semibold text-center cursor-pointer hover:bg-red-100"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await handleLogout();
                  }}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="w-full mt-2 py-2 px-4 rounded-xl bg-black text-white text-xs font-bold text-center cursor-pointer"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleAuthClick();
                }}
              >
                Daftar / Masuk
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
