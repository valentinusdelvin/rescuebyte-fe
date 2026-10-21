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
 * Format a number or numeric string with Indonesian dot thousand separator (e.g. 45000 -> "45.000", 1000000 -> "1.000.000").
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      if (onShowToast) onShowToast('Mohon masukkan nama produk');
      return;
    }
    if (normalPrice <= 0 || rescuePrice <= 0) {
      if (onShowToast) onShowToast('Harga normal dan harga rescue harus lebih dari Rp 0');
      return;
    }
    if (rescuePrice >= normalPrice) {
      if (onShowToast) onShowToast('Harga rescue harus lebih terjangkau daripada harga normal');
      return;
    }

    // Trigger brand loading overlay
    if (onTriggerLoading) {
      await onTriggerLoading(
        'Menyimpan Produk Dagangan...',
        'Mendaftarkan menu surplus ke etalase RescueByte',
        1100
      );
    }

    // Persist product
    addProduct({
      name: productName.trim(),
      description: description.trim(),
      normalPrice,
      rescuePrice,
      stock: stock > 0 ? stock : 5,
      maxStock: maxStock >= stock ? maxStock : stock,
      status: stock > 0 ? (stock <= 2 ? 'segera_habis' : 'aktif') : 'habis',
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
    <section className="page-view active" id="view-buat-dagangan" aria-labelledby="heading-buat-dagangan">
      <h2 className="section-title" id="heading-buat-dagangan">Buat Dagangan</h2>

      <form id="form-buat-dagangan" className="buat-dagangan-grid" onSubmit={handleSubmit} noValidate>
        {/* LEFT COLUMN: Informasi Dasar & Harga */}
        <div className="buat-dagangan-left-col">
          {/* Card 1: Informasi Dasar */}
          <div className="dagangan-card">
            <h3 className="dagangan-card-title">Informasi Dasar</h3>

            {/* Nama Produk */}
            <div className="form-group">
              <label htmlFor="input-nama-produk" className="field-label">
                Nama Produk
              </label>
              <input
                type="text"
                id="input-nama-produk"
                name="namaProduk"
                className="outline-input"
                placeholder="Contoh: Meal Mystery Box"
                value={productName}
                required
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            {/* Deskripsi Produk (Clicking the box triggers the Modal Editor, without extra buttons or hint texts) */}
            <div className="form-group">
              <label htmlFor="preview-deskripsi" className="field-label">
                Deskripsi Produk
              </label>
              <div
                id="preview-deskripsi"
                className="outline-input desc-textarea-clickable"
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
                  <p className="desc-preview-text">{description}</p>
                ) : (
                  <p className="desc-preview-placeholder">Tuliskan deskripsi produk, standar kebersihan, isi menu, dll...</p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Harga Normal & Harga Rescue */}
          <div className="dagangan-card">
            <h3 className="dagangan-card-title">Harga & Porsi</h3>

            <div className="form-row-two-col">
              {/* Harga Normal */}
              <div className="form-group">
                <label htmlFor="harga-normal" className="field-label">
                  Harga Normal
                </label>
                <div className="currency-input-wrapper">
                  <span className="currency-prefix" aria-hidden="true">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="harga-normal"
                    name="hargaNormal"
                    className="outline-input currency-input"
                    value={normalPrice === 0 ? '' : formatWithDots(normalPrice)}
                    placeholder="0"
                    required
                    onChange={(e) => setNormalPrice(parseFromDots(e.target.value))}
                  />
                </div>
              </div>

              {/* Harga Rescue */}
              <div className="form-group">
                <label htmlFor="harga-rescue" className="field-label">
                  Harga Rescue
                </label>
                <div className="currency-input-wrapper">
                  <span className="currency-prefix" aria-hidden="true">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="harga-rescue"
                    name="hargaRescue"
                    className="outline-input currency-input"
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
              <div className="discount-summary-banner" aria-live="polite">
                <div className="discount-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Hemat {discountPercent}%
                </div>
                <span className="discount-summary-text">
                  Pembeli hemat <b>Rp {savingsAmount.toLocaleString('id-ID')}</b> per box dari harga restoran normal!
                </span>
              </div>
            )}

            {/* Porsi Stok Tambahan */}
            <div className="form-row-two-col mt-4">
              <div className="form-group">
                <label htmlFor="stok-tersedia" className="field-label">
                  Stok Tersedia
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="stok-tersedia"
                  className="outline-input"
                  value={stock === 0 ? '' : formatWithDots(stock)}
                  placeholder="0"
                  onChange={(e) => setStock(parseFromDots(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="stok-maksimal" className="field-label">
                  Kapasitas / Total Box
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="stok-maksimal"
                  className="outline-input"
                  value={maxStock === 0 ? '' : formatWithDots(maxStock)}
                  placeholder="0"
                  onChange={(e) => setMaxStock(parseFromDots(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Upload Foto Produk & Submit Button */}
        <div className="buat-dagangan-right-col">
          <div className="dagangan-card photo-upload-card">
            <h3 className="dagangan-card-title">Upload Foto Produk</h3>

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
              className={`product-dropzone ${isDragging ? 'dragging' : ''} ${photoPreview ? 'has-photo' : ''}`}
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
                <div className="photo-preview-container">
                  <img src={photoPreview} alt={productName || 'Preview Foto'} className="uploaded-photo-img" />
                  <div className="photo-preview-overlay">
                    <button
                      type="button"
                      className="photo-action-btn edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      className="photo-action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto();
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                  {photoName && <span className="photo-file-label">{photoName}</span>}
                </div>
              ) : (
                <div className="dropzone-content">
                  {/* Cloud Check Icon matching Figma asset cloud-tambahkan.svg */}
                  <div className="dropzone-icon-circle">
                    <img
                      src={cloudTambahkanIcon}
                      alt="Tambah Foto"
                      className="dropzone-cloud-icon"
                      width="60"
                      height="60"
                    />
                  </div>
                  <p className="dropzone-main-text">Tambahkan Foto Produk</p>
                  <p className="dropzone-sub-text">JPEG, PNG, maks 5 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Button: Simpan Perubahan */}
          <div className="buat-dagangan-actions">
            <button type="submit" className="btn-save-primary w-full" id="btn-simpan-dagangan">
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
