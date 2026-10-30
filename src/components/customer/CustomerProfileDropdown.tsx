import React from 'react';
import { User as UserIcon, Store as StoreIcon } from 'lucide-react';
import type { UserPayload } from '../../types';
import { getRoleForEmail } from '../../services/authService';
import { getStoreProfile } from '../../services/storeService';

interface CustomerProfileDropdownProps {
  currentUser: UserPayload;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onSellerClick: () => void;
  onLogout: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isActiveOrHovered: boolean;
  buttonRef: (el: HTMLButtonElement | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const HOVER_SCALE_LOGO = 1.05;

export const CustomerProfileDropdown: React.FC<CustomerProfileDropdownProps> = ({
  currentUser,
  isOpen,
  onToggle,
  onClose,
  onProfileClick,
  onOrdersClick,
  onSellerClick,
  onLogout,
  onMouseEnter,
  onFocus,
  onBlur,
  isActiveOrHovered,
  buttonRef,
  containerRef,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const isSeller = React.useMemo(() => {
    const roleId = Number(currentUser.role_id);
    const roleStr = typeof currentUser.role === 'string' ? currentUser.role.toLowerCase().trim() : '';
    const storedRole = (() => {
      try {
        return localStorage.getItem('rescuebyte_user_role');
      } catch {
        return null;
      }
    })();

    // 1. Explicit Customer check: role_id 1/2, 'customer'/'user', stored 'customer'
    if (
      roleId === 1 ||
      roleId === 2 ||
      ['customer', 'user', 'pembeli', 'pengguna'].includes(roleStr) ||
      storedRole === 'customer' ||
      getRoleForEmail(currentUser.email) === 'customer'
    ) {
      return false;
    }

    // 2. Explicit Seller / Mitra Toko check: role_id 3, seller keywords, stored 'seller'
    if (
      roleId === 3 ||
      ['seller', 'merchant', 'mitra', 'restaurant', 'restoran', 'store', 'toko'].some((r) =>
        roleStr.includes(r)
      ) ||
      storedRole === 'seller' ||
      getRoleForEmail(currentUser.email) === 'seller'
    ) {
      return true;
    }

    return false;
  }, [currentUser.role_id, currentUser.role, currentUser.email]);

  const [storeLogo, setStoreLogo] = React.useState<string>(() => {
    if (!isSeller) return '';
    try {
      return localStorage.getItem('rescuebyte_store_logo') || '';
    } catch {
      return '';
    }
  });

  const [storeName, setStoreName] = React.useState<string>(() => {
    if (!isSeller) return '';
    try {
      return localStorage.getItem('rescuebyte_store_name') || '';
    } catch {
      return '';
    }
  });

  const [storeEmail, setStoreEmail] = React.useState<string>(() => {
    if (!isSeller) return '';
    try {
      return localStorage.getItem('rescuebyte_store_email') || '';
    } catch {
      return '';
    }
  });

  // Fetch store profile if seller and listen to profile updates from seller dashboard
  React.useEffect(() => {
    if (!isSeller) {
      setStoreLogo('');
      setStoreName('');
      setStoreEmail('');
      return;
    }

    let isMounted = true;

    const syncFromStorage = () => {
      try {
        const savedLogo = localStorage.getItem('rescuebyte_store_logo');
        if (savedLogo !== null) {
          setStoreLogo(savedLogo);
          setImageError(false);
        }
        const savedName = localStorage.getItem('rescuebyte_store_name');
        if (savedName) setStoreName(savedName);
        const savedEmail = localStorage.getItem('rescuebyte_store_email');
        if (savedEmail) setStoreEmail(savedEmail);
      } catch {}
    };

    syncFromStorage();

    getStoreProfile()
      .then((store) => {
        if (!isMounted) return;
        if (store.profile_picture_url) {
          setStoreLogo(store.profile_picture_url);
          setImageError(false);
          try {
            localStorage.setItem('rescuebyte_store_logo', store.profile_picture_url);
          } catch {}
        }
        if (store.name) {
          setStoreName(store.name);
          try {
            localStorage.setItem('rescuebyte_store_name', store.name);
          } catch {}
        }
      })
      .catch(() => {});

    window.addEventListener('rescuebyte_store_updated', syncFromStorage);
    window.addEventListener('storage', syncFromStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('rescuebyte_store_updated', syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, [isSeller]);

  React.useEffect(() => {
    setImageError(false);
  }, [currentUser.avatar_url, storeLogo]);

  // Strip generic Dicebear avatar placeholder (cartoon girl)
  const isDicebear = currentUser.avatar_url?.includes('dicebear.com');

  // If user is seller, prioritize store logo from dashboard/backend
  const effectiveAvatarUrl = isSeller
    ? storeLogo || (!isDicebear ? currentUser.avatar_url : '')
    : !isDicebear
    ? currentUser.avatar_url
    : '';

  const hasAvatar = Boolean(effectiveAvatarUrl && !imageError);
  const displayName = (isSeller && storeName) ? storeName : currentUser.name;
  const displayEmail = (isSeller && storeEmail) ? storeEmail : currentUser.email;

  return (
    <div className="relative z-30 shrink-0" ref={containerRef}>
      {/* Avatar Circle toggling Profile Dropdown */}
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`w-13 h-13 md:w-16 md:h-16 rounded-full border-2 border-black shadow-sm flex items-center justify-center shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${
          hasAvatar
            ? 'bg-white'
            : isSeller
            ? 'bg-[#bbf7d0]'
            : isActiveOrHovered || isOpen
            ? 'bg-[#121613]'
            : 'bg-[#1e2420] hover:bg-[#161a17]'
        }`}
        style={{
          transform: isActiveOrHovered || isOpen ? `scale(${HOVER_SCALE_LOGO})` : 'scale(1)',
          transformOrigin: 'center center',
        }}
        id="btn-customer-avatar"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={`Menu Akun: ${displayName}`}
        aria-label={`Menu Akun ${displayName}`}
      >
        {hasAvatar ? (
          <img
            src={effectiveAvatarUrl}
            alt={displayName}
            className="w-full h-full object-cover relative z-30"
            onError={() => setImageError(true)}
          />
        ) : isSeller ? (
          <StoreIcon className="w-6 h-6 md:w-7 md:h-7 text-black stroke-[2] relative z-30" />
        ) : (
          <UserIcon className="w-6 h-6 md:w-7 md:h-7 text-white stroke-[2.2] relative z-30" />
        )}
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
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

          {/* User / Store Info Header */}
          <div className="px-4 pt-2.5 pb-2 border-b border-[#f0eded] mb-1 flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 ${
                hasAvatar ? 'bg-white' : isSeller ? 'bg-[#bbf7d0]' : 'bg-[#f0eded]'
              }`}
            >
              {hasAvatar ? (
                <img
                  src={effectiveAvatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : isSeller ? (
                <StoreIcon className="w-4 h-4 text-black stroke-[2]" />
              ) : (
                <UserIcon className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1b1c1c] truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-[#525252] truncate font-medium">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Action Items */}
          <div className="flex flex-col gap-0.5">
            {isSeller ? (
              /* Restoran / Mitra Toko: Hanya Dashboard Restoran dan Log Out */
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onClose();
                  onSellerClick();
                }}
                className="mx-1.5 px-2.5 py-2 rounded-xl text-left text-sm font-semibold text-[#1b1c1c] hover:bg-[#1F4D36] hover:text-white transition-all cursor-pointer"
                id="btn-dropdown-seller-dashboard"
              >
                Dashboard Restoran
              </button>
            ) : (
              /* Customer: Hanya Akun Saya, Pesanan Saya, dan Log Out */
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onClose();
                    onProfileClick();
                  }}
                  className="mx-1.5 px-2.5 py-2 rounded-xl text-left text-sm font-semibold text-[#1b1c1c] hover:bg-[#1F4D36] hover:text-white transition-all cursor-pointer"
                  id="btn-dropdown-profile"
                >
                  Akun Saya
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onClose();
                    onOrdersClick();
                  }}
                  className="mx-1.5 px-2.5 py-2 rounded-xl text-left text-sm font-semibold text-[#1b1c1c] hover:bg-[#1F4D36] hover:text-white transition-all cursor-pointer"
                  id="btn-dropdown-orders"
                >
                  Riwayat Pesanan
                </button>
              </>
            )}

            <div className="h-px bg-[#f0eded] my-1 mx-2" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onClose();
                onLogout();
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
  );
};
