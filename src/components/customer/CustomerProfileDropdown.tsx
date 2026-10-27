import React from 'react';
import { User as UserIcon } from 'lucide-react';
import type { UserPayload } from '../../types';

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
  return (
    <div className="relative z-30 shrink-0" ref={containerRef}>
      {/* Avatar Circle toggling Profile Dropdown - Always Solid Black (#121613 / #1e2420) */}
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`w-13 h-13 md:w-16 md:h-16 rounded-full border-2 border-black shadow-sm flex items-center justify-center shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isActiveOrHovered || isOpen ? 'bg-[#121613]' : 'bg-[#1e2420] hover:bg-[#161a17]'
        }`}
        style={{
          transform: isActiveOrHovered || isOpen ? `scale(${HOVER_SCALE_LOGO})` : 'scale(1)',
          transformOrigin: 'center center',
        }}
        id="btn-customer-avatar"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={`Menu Akun: ${currentUser.name}`}
        aria-label={`Menu Akun ${currentUser.name}`}
      >
        <UserIcon className="w-6 h-6 md:w-7 md:h-7 text-white stroke-[2.2] relative z-30" />
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

          {/* User Info Header */}
          <div className="px-4 pt-2.5 pb-2 border-b border-[#f0eded] mb-1">
            <p className="text-xs font-bold text-[#1b1c1c] truncate">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-[#525252] truncate font-medium">
              {currentUser.email}
            </p>
          </div>

          {/* Action Items */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={onProfileClick}
              className="mx-1.5 px-2.5 py-2 rounded-xl text-left text-sm font-semibold text-[#1b1c1c] hover:bg-[#1F4D36] hover:text-white transition-all cursor-pointer"
              id="btn-dropdown-profile"
            >
              Akun Saya
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={onOrdersClick}
              className="mx-1.5 px-2.5 py-2 rounded-xl text-left text-sm font-semibold text-[#1b1c1c] hover:bg-[#1F4D36] hover:text-white transition-all cursor-pointer"
              id="btn-dropdown-orders"
            >
              Pesanan Saya
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={onSellerClick}
              className="mx-1.5 px-2.5 py-2 rounded-xl text-left text-sm font-semibold text-[#1b1c1c] hover:bg-[#1F4D36] hover:text-white transition-all cursor-pointer"
              id="btn-dropdown-seller-dashboard"
            >
              Dashboard Restoran
            </button>

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
