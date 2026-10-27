import React, { useState, useRef } from 'react';
import { ProductDescriptionModal } from '../components/products/ProductDescriptionModal';
import { addProduct } from '../services/productService';
import cloudTambahkanIcon from '../assets/cloud-tambahkan.svg';

export interface BuatDaganganProps {
  onShowToast?: (message: string) => void;
  onNavigateToProducts?: () => void;
  onTriggerLoading?: (title?: string, subtitle?: string, durationMs?: number) => Promise<void>;
}

/**
 * Format a number or numeric string with Indonesian dot thousand separator.
 */
const formatWithDots = (val: number | string): string => {
  if (val === '' || val === null || val === undefined) return '';
  const clean = String(val).replace(/\D/g, '');
  if (!clean) return '';
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse an Indonesian dot-separated number string back to integer.
 */
const parseFromDots = (val: string): number => {
  const clean = val.replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

/**
 * BuatDagangan Page Component
 * Allows merchants to create food rescue listings with real photo upload,
 * dynamic pricing calculation with discount badges, and dot-thousand formatted inputs.
 * Styled with Tailwind CSS classes.
 */
export function BuatDagangan({
  onShowToast,
  onNavigateToProducts,
  onTriggerLoading,
}: BuatDaganganProps) {
  // Form state
  const [productName, setProductName] = useState<string>('');
  const [description, setDescription] = useState<string>(
    'Berisi aneka makanan siap santap berkualitas dari surplus harian restoran. Disiapkan dengan standar kebersihan tinggi.'
  );
  const [normalPrice, setNormalPrice] = useState<number>(45000);
  const [rescuePrice, setRescuePrice] = useState<number>(25000);
  const [stock, setStock] = useState<number>(5);
  const [maxStock, setMaxStock] = useState<number>(10);

  // Modal editor state
  const [isDescModalOpen, setIsDescModalOpen] = useState<boolean>(false);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const discountPercent =
    normalPrice > 0 && rescuePrice < normalPrice
      ? Math.round(((normalPrice - rescuePrice) / normalPrice) * 100)
      : 0;
  const savingsAmount = Math.max(0, normalPrice - rescuePrice);

  // Handle file input
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      if (onShowToast) onShowToast('File harus berupa gambar (JPEG, PNG, atau WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      if (onShowToast) onShowToast('Ukuran file maksimal adalah 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
      setPhotoName(file.name);
      if (onShowToast) onShowToast(`Foto "${file.name}" berhasil diunggah!`);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onShowToast) onShowToast('Foto produk dihapus');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      if (onShowToast) onShowToast('Nama produk wajib diisi!');
      return;
    }

    if (rescuePrice <= 0 || normalPrice <= 0) {
      if (onShowToast) onShowToast('Harga produk harus lebih dari 0!');
      return;
    }

    if (rescuePrice >= normalPrice) {
      if (onShowToast) onShowToast('Harga Rescue harus lebih hemat daripada Harga Normal!');
      return;
    }

    if (stock <= 0) {
      if (onShowToast) onShowToast('Stok tersedia minimal 1 box!');
      return;
    }

    if (onTriggerLoading) {
      await onTriggerLoading(
        'Menyimpan Dagangan Baru...',
        `Mendaftarkan ${productName.trim()} ke etalase toko`
      );
    }

    addProduct({
      name: productName.trim(),
      description: description.trim(),
      normalPrice,
      rescuePrice,
      stock,
      maxStock: maxStock || stock,
      status: 'aktif',
      imageUrl: photoPreview || undefined,
    });

    if (onShowToast) {
      onShowToast(`Produk "${productName.trim()}" berhasil dibuat!`);
    }

    // Navigate to Daganganku view
    if (onNavigateToProducts) {
      onNavigateToProducts();
    }
  };

  return (
    <section className="flex flex-col gap-6" id="view-buat-dagangan" aria-labelledby="heading-buat-dagangan">
      <h2 className="text-xl font-bold text-gray-900 tracking-tight" id="heading-buat-dagangan">Buat Dagangan</h2>

      <form id="form-buat-dagangan" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" onSubmit={handleSubmit} noValidate>
        {/* LEFT COLUMN: Informasi Dasar & Harga */}
        <div className="flex flex-col gap-6">
          {/* Card 1: Informasi Dasar */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-5">
            <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">Informasi Dasar</h3>

            {/* Nama Produk */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-nama-produk" className="text-xs font-bold text-gray-700">
                Nama Produk
              </label>
              <input
                type="text"
                id="input-nama-produk"
                name="namaProduk"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-black transition-colors"
                placeholder="Contoh: Meal Mystery Box"
                value={productName}
                required
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            {/* Deskripsi Produk */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="preview-deskripsi" className="text-xs font-bold text-gray-700">
                Deskripsi Produk
              </label>
              <div
                id="preview-deskripsi"
                className="w-full min-h-25 p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-black cursor-pointer transition-colors text-sm text-gray-800 leading-relaxed"
                tabIndex={0}
                role="button"
                aria-label="Klik untuk mengedit Deskripsi Produk"
                onClick={() => setIsDescModalOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsDescModalOpen(true);
                  }
                }}
              >
                {description.trim() ? (
                  <p className="line-clamp-4">{description}</p>
                ) : (
                  <p className="text-gray-400 italic">Tuliskan deskripsi produk, standar kebersihan, isi menu, dll...</p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Harga Normal & Harga Rescue */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-5">
            <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">Harga & Porsi</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Harga Normal */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="harga-normal" className="text-xs font-bold text-gray-700">
                  Harga Normal
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 font-bold text-sm text-gray-400 pointer-events-none" aria-hidden="true">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="harga-normal"
                    name="hargaNormal"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-black transition-colors"
                    value={normalPrice === 0 ? '' : formatWithDots(normalPrice)}
                    placeholder="0"
                    required
                    onChange={(e) => setNormalPrice(parseFromDots(e.target.value))}
                  />
                </div>
              </div>

              {/* Harga Rescue */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="harga-rescue" className="text-xs font-bold text-gray-700">
                  Harga Rescue
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 font-bold text-sm text-gray-400 pointer-events-none" aria-hidden="true">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="harga-rescue"
                    name="hargaRescue"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-black transition-colors"
                    value={rescuePrice === 0 ? '' : formatWithDots(rescuePrice)}
                    placeholder="0"
                    required
                    onChange={(e) => setRescuePrice(parseFromDots(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Discount & Savings Badge */}
            {discountPercent > 0 && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50/80 border border-green-200/80 text-xs text-green-950 font-medium" aria-live="polite">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary text-white font-bold text-xs shrink-0 shadow-xs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Hemat {discountPercent}%
                </div>
                <span className="text-green-900">
                  Pembeli hemat <b className="text-green-950 font-bold">Rp {savingsAmount.toLocaleString('id-ID')}</b> per box dari harga restoran normal!
                </span>
              </div>
            )}

            {/* Porsi Stok Tambahan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="stok-tersedia" className="text-xs font-bold text-gray-700">
                  Stok Tersedia
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="stok-tersedia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-black transition-colors"
                  value={stock === 0 ? '' : formatWithDots(stock)}
                  placeholder="0"
                  onChange={(e) => setStock(parseFromDots(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="stok-maksimal" className="text-xs font-bold text-gray-700">
                  Kapasitas / Total Box
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="stok-maksimal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-black transition-colors"
                  value={maxStock === 0 ? '' : formatWithDots(maxStock)}
                  placeholder="0"
                  onChange={(e) => setMaxStock(parseFromDots(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Upload Foto Produk & Submit Button */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-5">
            <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">Upload Foto Produk</h3>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              id="product-photo-file"
              className="sr-only"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />

            {/* Interactive Upload Box */}
            <div
              className={`relative rounded-2xl border-2 border-dashed border-gray-200 hover:border-black bg-gray-50/60 min-h-65 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all overflow-hidden ${
                isDragging ? 'border-black bg-gray-100' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!photoPreview && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Upload Foto Produk"
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !photoPreview) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              {photoPreview ? (
                <div className="relative w-full h-60 rounded-xl overflow-hidden group">
                  <img src={photoPreview} alt={productName || 'Preview Foto'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-white/95 text-xs font-bold text-gray-900 hover:bg-white transition-colors cursor-pointer shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto();
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                  {photoName && <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md truncate max-w-[80%]">{photoName}</span>}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                    <img
                      src={cloudTambahkanIcon}
                      alt="Tambah Foto"
                      className="w-10 h-10 object-contain"
                      width="40"
                      height="40"
                    />
                  </div>
                  <p className="text-sm font-bold text-gray-800">Tambahkan Foto Produk</p>
                  <p className="text-xs text-gray-400">JPEG, PNG, maks 5 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Button: Simpan Perubahan */}
          <div>
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold text-[0.98rem] shadow-sm transition-all cursor-pointer text-center"
              id="btn-simpan-dagangan"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </form>

      {/* Modal Editor for Deskripsi */}
      <ProductDescriptionModal
        isOpen={isDescModalOpen}
        initialValue={description}
        onSave={setDescription}
        onClose={() => setIsDescModalOpen(false)}
      />
    </section>
  );
}
