import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, StorageFolder } from '../../services/storageService';

export interface ProfileAvatarProps {
  name: string;
  avatarUrl: string;
  onAvatarChange: (newUrl: string) => Promise<void> | void;
  onUploadingChange?: (isUploading: boolean) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  folder?: StorageFolder;
  label?: string;
}

export function ProfileAvatar({
  name,
  avatarUrl,
  onAvatarChange,
  onUploadingChange,
  onShowToast,
  folder = 'avatars',
  label = 'Foto Profil',
}: ProfileAvatarProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prevAvatarUrl, setPrevAvatarUrl] = useState(avatarUrl);
  if (avatarUrl !== prevAvatarUrl) {
    setPrevAvatarUrl(avatarUrl);
    setImageError(false);
  }

  useEffect(() => {
    if (!isZoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onShowToast?.('File harus berupa gambar (JPEG, PNG, atau WebP).', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      onShowToast?.('Ukuran foto maksimal adalah 2 MB.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadStatus('Mengunggah...');
    onUploadingChange?.(true);
    setImageError(false);

    // Keep optimistic local preview active for display
    const localPreviewUrl = URL.createObjectURL(file);
    setLocalPreview(localPreviewUrl);

    try {
      const uploadRes = await uploadImage(file, folder);
      setUploadStatus('Menyimpan...');
      await onAvatarChange(uploadRes.url);
      setLocalPreview(null);
    } catch (err) {
      setLocalPreview(null);
      if (!(err instanceof Error && err.message.includes('profil'))) {
        const msg = err instanceof Error ? err.message : 'Gagal mengunggah foto profil.';
        onShowToast?.(msg, 'error');
      }
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
      onUploadingChange?.(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const currentDisplayUrl = localPreview || (!imageError && avatarUrl ? avatarUrl : '');

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative group/avatar">
          <div
            onClick={() => !isUploading && setIsZoomOpen(true)}
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#f0eded] flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border border-gray-200/80 shadow-2xs relative transition-all ${
              isUploading ? 'cursor-wait' : 'cursor-zoom-in hover:brightness-95'
            }`}
            title={isUploading ? 'Sedang memperbarui foto profil...' : 'Klik untuk melihat foto lebih besar'}
          >
            {currentDisplayUrl ? (
              <img
                src={currentDisplayUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400" aria-hidden="true">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>

          <button
            type="button"
            onClick={() => !isUploading && setIsZoomOpen(true)}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)] border-[1.5px] border-gray-400 flex items-center justify-center transition-all hover:scale-110 hover:border-gray-900 hover:bg-gray-50 z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Lihat dan ubah foto profil"
            aria-label="Lihat dan Ubah Foto Profil"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        <div>
          <span className="font-bold text-sm text-[#1b1c1c] block">{label}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarFileChange}
            aria-label="Upload Foto Profil"
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => !isUploading && setIsZoomOpen(true)}
            disabled={isUploading}
            className="mt-1.5 px-3.5 py-1.5 rounded-xl border border-[#e6e4df] bg-[#f4f3f0] hover:bg-[#eae8e3] text-xs font-bold text-gray-800 shadow-2xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
            title="Lihat dan ubah foto profil"
          >
            {isUploading && <Loader2 className="w-3 h-3 animate-spin text-gray-700" />}
            <span>{isUploading ? (uploadStatus || 'Menyimpan...') : 'Ubah Foto'}</span>
          </button>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Format JPG, PNG, atau WebP, maksimal 2MB.
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
              <span className="text-sm font-bold text-gray-900">{label}</span>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-gray-200 bg-[#f0eded] flex items-center justify-center shadow-inner relative">
              {currentDisplayUrl ? (
                <img
                  src={currentDisplayUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
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
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-[#1F4D36] hover:bg-[#163b29] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploading ? (uploadStatus || 'Menyimpan...') : 'Ganti Foto'}</span>
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
