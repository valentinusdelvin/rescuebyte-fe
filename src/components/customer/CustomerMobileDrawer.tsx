import React from 'react';
import type { UserPayload } from '../../types';

export type PillTabType = 'beranda' | 'marketplace' | 'kontak';

export interface NavTabItem {
  id: PillTabType;
  label: string;
  href: string;
}

interface CustomerMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navTabs: readonly NavTabItem[];
  selectedTab: string;
  onSelectTab: (tabId: PillTabType) => void;
  currentUser: UserPayload | null;
  onAuthClick: () => void;
}

export const CustomerMobileDrawer: React.FC<CustomerMobileDrawerProps> = ({
  isOpen,
  onClose,
  navTabs,
  selectedTab,
  onSelectTab,
  currentUser,
  onAuthClick,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="pointer-events-auto absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 p-2 bg-white rounded-2xl border-2 border-black shadow-xl flex flex-col gap-1 md:hidden z-50 animate-in fade-in zoom-in-95"
      id="customer-mobile-menu"
    >
      <nav className="flex flex-col gap-1 text-center">
        {navTabs.map((tab) => {
          const isSelected = selectedTab === tab.id;
          return (
            <a
              key={tab.id}
              href={tab.href}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                isSelected ? 'bg-[#1F4D36] text-white' : 'text-[#1b1c1c] hover:bg-gray-100'
              }`}
              onClick={(e) => {
                e.preventDefault();
                onClose();
                onSelectTab(tab.id);
              }}
            >
              {tab.label}
            </a>
          );
        })}

        {!currentUser && (
          <button
            type="button"
            className="w-full mt-1 py-2 px-4 rounded-xl bg-black text-white text-xs font-bold text-center cursor-pointer"
            onClick={() => {
              onClose();
              onAuthClick();
            }}
          >
            Daftar / Masuk
          </button>
        )}
      </nav>
    </div>
  );
};
