import { useState, useRef, useEffect, useCallback } from 'react';
import rescueBiteLogo from '../../assets/logo.svg';
import { getCurrentUser, subscribeToAuth, logoutUser, clearAuth } from '../../services/authService';
import { UserPayload } from '../../types';
import { CustomerProfileDropdown } from './CustomerProfileDropdown';
import { CustomerMobileDrawer, PillTabType, NavTabItem } from './CustomerMobileDrawer';

type TabType = PillTabType | 'profile' | 'none';
type IndicatorKey = 'logo' | PillTabType | 'auth';

export interface CustomerHeaderProps {
  activeTab?: TabType;
  currentUser?: UserPayload | null;
  onNavigateHome?: () => void;
  onNavigateSeller?: () => void;
  onNavigateProfile?: () => void;
  onNavigateOrders?: () => void;
  onOpenAuthModal?: () => void;
  onNavigateAuth?: () => void;
  onSelectTab?: (tab: PillTabType) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const HOVER_SCALE_LOGO = 1.2;
export const HOVER_SCALE_AUTH = 1.2;

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
  currentUser: propCurrentUser,
  onNavigateHome,
  onNavigateSeller,
  onNavigateProfile,
  onNavigateOrders,
  onOpenAuthModal,
  onNavigateAuth,
  onSelectTab,
  onShowToast,
}: CustomerHeaderProps) {
  const [currentUser, setCurrentUser] = useState<UserPayload | null>(
    () => propCurrentUser ?? getCurrentUser()
  );

  useEffect(() => {
    if (propCurrentUser !== undefined) {
      setCurrentUser(propCurrentUser);
    }
  }, [propCurrentUser]);
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
    if (onNavigateHome) {
      onNavigateHome();
    } else if (onSelectTab) {
      onSelectTab('beranda');
    } else {
      window.location.hash = '#beranda-customer';
    }
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

  // Target indicator is hovered element if hovered, otherwise active/selected page tab (null if on profile/none)
  const activeIndicatorKey: IndicatorKey | null =
    hoveredTab ??
    (selectedTab === 'profile' || selectedTab === 'none' ? null : (selectedTab as IndicatorKey));

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
    const currentKey: IndicatorKey | null =
      hoveredTab ??
      (selectedTab === 'profile' || selectedTab === 'none' ? null : (selectedTab as IndicatorKey));
    if (!currentKey) {
      setIndicatorStyle((prev) => ({ ...prev, ready: false }));
      return;
    }
    const currentEl = itemRefs.current[currentKey];
    const containerEl = headerContainerRef.current;
    if (!currentEl || !containerEl) {
      setIndicatorStyle((prev) => ({ ...prev, ready: false }));
      return;
    }

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


  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTab = (tab: PillTabType) => {
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
    <header className="fixed top-5 left-[calc(50%+24px)] -translate-x-1/2 z-50 px-4 flex items-center justify-center w-max max-w-full pointer-events-none" id="customer-header">
      <div
        ref={headerContainerRef}
        className="pointer-events-auto relative flex items-center justify-center gap-3 sm:gap-4 md:gap-5"
        onMouseLeave={() => setHoveredTab(null)}
      >
        {/* Animated Flying Indicator - crosses over Logo, Nav tabs, and Daftar/Masuk */}
        <div
          className={`hidden md:block absolute rounded-full bg-[#1F4D36] pointer-events-none shadow-xs ease-[cubic-bezier(0.25,1,0.5,1)] z-10 ${
            indicatorStyle.ready && activeIndicatorKey ? 'opacity-100 transition-all duration-300' : 'opacity-0'
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
        {/* 3. Standalone User Avatar Circle with Dropdown (Logged In) OR Daftar/Masuk Pill (Logged Out) */}
        {currentUser ? (
          <CustomerProfileDropdown
            currentUser={currentUser}
            isOpen={isProfileDropdownOpen}
            onToggle={() => setIsProfileDropdownOpen((prev) => !prev)}
            onClose={() => setIsProfileDropdownOpen(false)}
            onProfileClick={handleProfileClick}
            onOrdersClick={handleOrdersClick}
            onSellerClick={handleSellerClick}
            onLogout={handleLogout}
            onMouseEnter={() => setHoveredTab('auth')}
            onFocus={() => setHoveredTab('auth')}
            onBlur={() => setHoveredTab(null)}
            isActiveOrHovered={activeIndicatorKey === 'auth'}
            buttonRef={(el) => {
              itemRefs.current['auth'] = el;
            }}
            containerRef={profileDropdownRef}
          />
        ) : (
          <button
            ref={(el) => {
              itemRefs.current['auth'] = el;
            }}
            type="button"
            onMouseEnter={() => setHoveredTab('auth')}
            onFocus={() => setHoveredTab('auth')}
            onBlur={() => setHoveredTab(null)}
            className={`relative z-20 px-10 md:px-10 py-2.5 md:py-3.5 rounded-full border-2 border-black text-base font-bold shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-black ${activeIndicatorKey === 'auth' ? 'bg-transparent' : 'bg-white hover:bg-gray-50'
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
              className={`relative z-30 transition-colors duration-200 select-none ${activeIndicatorKey === 'auth' ? 'text-white' : 'text-[#1b1c1c]'
                }`}
            >
              Daftar/Masuk
            </span>
          </button>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      <CustomerMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navTabs={NAV_TABS}
        selectedTab={selectedTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onAuthClick={handleAuthClick}
      />
    </header>
  );
}
