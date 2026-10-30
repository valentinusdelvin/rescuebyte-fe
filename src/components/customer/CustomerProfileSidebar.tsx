import { useState } from 'react';
import { User, FileText, LogOut } from 'lucide-react';

export interface CustomerProfileSidebarProps {
  name: string;
  email: string;
  avatarUrl?: string;
  activeTab?: 'info' | 'orders';
  onNavigateProfile?: () => void;
  onNavigateOrders?: () => void;
  onLogout: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function CustomerProfileSidebar({
  name,
  email,
  avatarUrl,
  activeTab = 'info',
  onNavigateProfile,
  onNavigateOrders,
  onLogout,
}: CustomerProfileSidebarProps) {
  const [imageError, setImageError] = useState(false);

  const [prevAvatarUrl, setPrevAvatarUrl] = useState(avatarUrl);
  if (avatarUrl !== prevAvatarUrl) {
    setPrevAvatarUrl(avatarUrl);
    setImageError(false);
  }

  const hasValidAvatar = !!avatarUrl && !imageError;

  return (
    <aside className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-4 lg:sticky lg:top-28 z-20 self-start">
      {/* Mini Profile Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5 transition-shadow hover:shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#f0eded] flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border border-gray-150">
          {hasValidAvatar ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400" aria-hidden="true">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-[#1b1c1c] truncate">{name}</span>
          <span className="text-xs text-gray-400 truncate mt-0.5">{email}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="bg-white/95 backdrop-blur-sm rounded-2xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col gap-1 transition-shadow hover:shadow-sm" aria-label="Menu Navigasi Akun">
        <button
          type="button"
          onClick={() => {
            if (activeTab !== 'info') {
              onNavigateProfile?.();
            }
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${
            activeTab === 'info'
              ? 'bg-[#eef8ee] text-[#2d6a2e] font-bold'
              : 'font-semibold text-gray-600 hover:text-black hover:bg-gray-50'
          }`}
        >
          <User className={`w-4 h-4 shrink-0 ${activeTab === 'info' ? 'text-[#2d6a2e]' : 'text-gray-400'}`} />
          <span>Informasi Akun</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (activeTab !== 'orders') {
              onNavigateOrders?.();
            }
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#eef8ee] text-[#2d6a2e] font-bold'
              : 'font-semibold text-gray-600 hover:text-black hover:bg-gray-50'
          }`}
        >
          <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'orders' ? 'text-[#2d6a2e]' : 'text-gray-400'}`} />
          <span>Riwayat Pesanan</span>
        </button>

        <div className="h-px bg-gray-100 my-1 mx-2" />

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 text-left transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
          <span>Keluar dari Akun</span>
        </button>
      </nav>
    </aside>
  );
}
