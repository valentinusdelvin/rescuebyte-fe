import React, { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';

export interface ProfileAvatarProps {
  name: string;
  avatarUrl: string;
  onAvatarChange: (newUrl: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function ProfileAvatar({
  name,
  avatarUrl,
  onAvatarChange,
  onShowToast,
}: ProfileAvatarProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isZoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast?.('File harus berupa gambar (JPG atau PNG).', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onShowToast?.('Ukuran foto maksimal adalah 2 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      onAvatarChange(event.target?.result as string);
      onShowToast?.('Foto profil baru dipilih.', 'info');
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative group/avatar">
          <div
            onClick={() => setIsZoomOpen(true)}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#f0eded] flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border border-gray-200/80 shadow-2xs cursor-zoom-in hover:brightness-95 transition-all"
            title="Klik untuk melihat foto lebih besar"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400" aria-hidden="true">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)] border-[1.5px] border-gray-400 flex items-center justify-center transition-all hover:scale-110 hover:border-gray-900 hover:bg-gray-50 z-10 cursor-pointer"
            title="Pilih foto untuk ganti profil"
            aria-label="Upload Foto Profil"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        <div>
          <span className="font-bold text-sm text-[#1b1c1c] block">Foto Profil</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarFileChange}
            aria-label="Upload Foto Profil"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-1.5 px-3.5 py-1.5 rounded-xl border border-[#e6e4df] bg-[#f4f3f0] hover:bg-[#eae8e3] text-xs font-bold text-gray-800 shadow-2xs transition-colors cursor-pointer"
          >
            Ubah Foto
          </button>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Format JPG atau PNG, maksimal 2MB.
          </span>
        </div>
      </div>

      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setIsZoomOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Lihat Foto Profil Penuh"
        >
          <div
            className="relative max-w-sm sm:max-w-md w-full bg-white rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4 cursor-default animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">Foto Profil</span>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-gray-200 bg-[#f0eded] flex items-center justify-center shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsZoomOpen(false);
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 rounded-xl bg-[#1F4D36] hover:bg-[#163b29] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Foto Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-all cursor-pointer shadow-2xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
