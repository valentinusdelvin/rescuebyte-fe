import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, ExternalLink, X, Store, Utensils, AlertCircle } from 'lucide-react';
import { OrderItemDetail } from './types';

export interface DualReviewSubmitPayload {
  storeReview: {
    rating: number;
    content: string;
  };
  productReview: {
    productId: string;
    productName: string;
    rating: number;
    content: string;
  };
}

export interface OrderReviewModalProps {
  storeName: string;
  storeId?: string;
  items?: OrderItemDetail[];
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  reviewComment?: string;
  setReviewComment?: (comment: string) => void;
  isSubmittingReview: boolean;
  isReviewSubmitted: boolean;
  onSubmitReview?: (e: React.FormEvent) => void;
  onSubmitDualReview?: (payload: DualReviewSubmitPayload) => Promise<void> | void;
}

function getSatisfactionLabel(rating: number): string {
  switch (rating) {
    case 5:
      return 'Sangat Puas!';
    case 4:
      return 'Puas';
    case 3:
      return 'Cukup';
    case 2:
      return 'Kurang';
    case 1:
      return 'Kecewa';
    default:
      return 'Pilih Rating';
  }
}

export function OrderReviewSection({
  storeName,
  setIsReviewModalOpen,
  selectedRating,
  setSelectedRating,
  isReviewSubmitted,
}: Pick<
  OrderReviewModalProps,
  'storeName' | 'setIsReviewModalOpen' | 'selectedRating' | 'setSelectedRating' | 'isReviewSubmitted'
>) {
  return (
    <section className="bg-[#fffbf0] border border-[#fde68a] rounded-3xl p-5 sm:p-6 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#fed7aa] text-[#c2410c] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1b1c1c]">Bagaimana Pengalamanmu?</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-xl leading-relaxed">
              Bagikan ulasanmu saat menikmati hidangan dari {storeName}. Pendapatmu membantu
              pelanggan lain menemukan pangan surplus bermutu dan memberi apresiasi kepada mitra toko.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3 self-start md:self-auto shrink-0">
          <div className="flex items-center gap-1" aria-label="Beri rating bintang">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setSelectedRating(star);
                  setIsReviewModalOpen(true);
                }}
                className="text-amber-400 hover:text-amber-500 transition p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 min-w-[32px] min-h-[32px] flex items-center justify-center"
                title={`Beri ${star} bintang`}
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
                  }`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="bg-[#1b1c1c] hover:bg-black text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full inline-flex items-center gap-2 transition cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 min-h-[44px]"
          >
            <span>{isReviewSubmitted ? 'Ubah Ulasan' : 'Beri Ulasan Sekarang'}</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function OrderReviewModal({
  storeName,
  items = [],
  isReviewModalOpen,
  setIsReviewModalOpen,
  selectedRating,
  setSelectedRating,
  reviewComment = '',
  setReviewComment,
  isSubmittingReview,
  onSubmitReview,
  onSubmitDualReview,
}: OrderReviewModalProps) {
  // Store review state
  const [storeRating, setStoreRating] = useState<number>(() => selectedRating || 5);
  const [storeText, setStoreText] = useState<string>(() => reviewComment || '');

  // Product review state
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(0);
  const [productRating, setProductRating] = useState<number>(5);
  const [productText, setProductText] = useState<string>('');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync initial store rating when opened from prompt card stars
  useEffect(() => {
    if (isReviewModalOpen) {
      if (selectedRating && selectedRating > 0) {
        setStoreRating(selectedRating);
      }
      setValidationError(null);
    }
  }, [isReviewModalOpen, selectedRating]);

  if (!isReviewModalOpen) return null;

  const currentProduct = items[selectedProductIndex] || items[0] || {
    id: 'default-product',
    productId: 'default-product',
    name: 'Paket Surplus Makanan',
  };

  const currentProductId = currentProduct.productId || currentProduct.id || 'default-product';
  const currentProductName = currentProduct.name || 'Paket Surplus Makanan';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation checks
    if (!storeRating || storeRating < 1) {
      setValidationError('Mohon berikan rating bintang untuk toko.');
      return;
    }
    if (!storeText.trim()) {
      setValidationError('Mohon isi ulasan pengalaman toko terlebih dahulu.');
      return;
    }
    if (!productRating || productRating < 1) {
      setValidationError('Mohon berikan rating bintang untuk produk.');
      return;
    }
    if (!productText.trim()) {
      setValidationError('Mohon isi ulasan kualitas produk terlebih dahulu.');
      return;
    }

    if (onSubmitDualReview) {
      await onSubmitDualReview({
        storeReview: {
          rating: storeRating,
          content: storeText.trim(),
        },
        productReview: {
          productId: currentProductId,
          productName: currentProductName,
          rating: productRating,
          content: productText.trim(),
        },
      });
    } else if (onSubmitReview) {
      // Keep legacy state updated
      setSelectedRating(storeRating);
      setReviewComment?.(storeText);
      onSubmitReview(e);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !isSubmittingReview) setIsReviewModalOpen(false);
      }}
    >
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-150 relative max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 id="review-modal-title" className="text-lg sm:text-xl font-bold text-[#1b1c1c]">
              Beri Ulasan Pesanan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Ulasan Anda membantu pelanggan lain dan mendukung mitra penyelamat makanan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsReviewModalOpen(false)}
            disabled={isSubmittingReview}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {validationError && (
            <div
              role="alert"
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Ulasan Toko */}
          <div className="bg-[#fafaf8] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/60">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Ulasan Toko
                </span>
                <h4 className="text-sm font-bold text-[#1b1c1c] truncate">{storeName}</h4>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Rating Pelayanan Toko <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex items-center gap-1" aria-label="Rating Toko">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStoreRating(star)}
                      className="text-amber-400 hover:scale-110 transition p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 min-w-[34px] min-h-[34px] flex items-center justify-center"
                      title={`Beri ${star} bintang untuk toko`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= storeRating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                  {getSatisfactionLabel(storeRating)}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="store-review-comment"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5"
              >
                Catatan Pengalaman Toko <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="store-review-comment"
                rows={2}
                value={storeText}
                onChange={(e) => setStoreText(e.target.value)}
                placeholder="Ceritakan pelayanan staf kasir, kemudahan pengambilan, dan lokasi toko..."
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                required
              />
            </div>
          </div>

          {/* Section 2: Ulasan Produk */}
          <div className="bg-[#fafaf8] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                  <Utensils className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider block">
                    Ulasan Produk
                  </span>
                  <h4 className="text-sm font-bold text-[#1b1c1c] truncate">{currentProductName}</h4>
                </div>
              </div>

              {currentProduct.imageSrc && (
                <img
                  src={currentProduct.imageSrc}
                  alt={currentProductName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
              )}
            </div>

            {/* Multiple items selector tab if applicable */}
            {items.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] text-slate-500 font-medium shrink-0">Pilih Produk:</span>
                {items.map((it, idx) => (
                  <button
                    key={it.id || idx}
                    type="button"
                    onClick={() => {
                      setSelectedProductIndex(idx);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer whitespace-nowrap ${
                      selectedProductIndex === idx
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {it.name || `Produk ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Rating Kualitas Produk <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex items-center gap-1" aria-label="Rating Produk">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setProductRating(star)}
                      className="text-amber-400 hover:scale-110 transition p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 min-w-[34px] min-h-[34px] flex items-center justify-center"
                      title={`Beri ${star} bintang untuk produk`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= productRating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                  {getSatisfactionLabel(productRating)}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="product-review-comment"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5"
              >
                Catatan Kualitas Makanan <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="product-review-comment"
                rows={2}
                value={productText}
                onChange={(e) => setProductText(e.target.value)}
                placeholder="Ceritakan kesegaran, rasa, porsi, dan kondisi makanan surplus yang diselamatkan..."
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                required
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-2 shrink-0">
            <button
              type="button"
              disabled={isSubmittingReview}
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition min-h-[44px] cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="bg-[#1b1c1c] hover:bg-black text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 min-h-[44px] cursor-pointer inline-flex items-center gap-2"
            >
              {isSubmittingReview ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengirim Ulasan...</span>
                </>
              ) : (
                <span>Kirim Ulasan Toko & Produk</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderReviewModal;
