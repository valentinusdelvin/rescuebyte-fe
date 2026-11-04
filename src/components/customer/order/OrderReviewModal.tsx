import { MessageSquare, Star, ExternalLink, X } from 'lucide-react';

export interface OrderReviewModalProps {
  storeName: string;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  reviewComment: string;
  setReviewComment: (comment: string) => void;
  isSubmittingReview: boolean;
  isReviewSubmitted: boolean;
  onSubmitReview: (e: React.FormEvent) => void;
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
  isReviewModalOpen,
  setIsReviewModalOpen,
  selectedRating,
  setSelectedRating,
  reviewComment,
  setReviewComment,
  isSubmittingReview,
  onSubmitReview,
}: OrderReviewModalProps) {
  if (!isReviewModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setIsReviewModalOpen(false);
      }}
    >
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-xl border border-slate-100 relative">
        <button
          type="button"
          onClick={() => setIsReviewModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <h3 id="review-modal-title" className="text-xl font-bold text-[#1b1c1c] mb-1">
          Beri Ulasan untuk {storeName}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
          Bagaimana kualitas makanan surplus yang kamu dapatkan? Ulasanmu sangat berarti untuk menjaga mutu
          penyelamatan makanan.
        </p>

        <form onSubmit={onSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Tingkat Kepuasan
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className="text-amber-400 hover:scale-110 transition p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-slate-600 ml-2">
                {selectedRating === 5 && 'Sangat Puas!'}
                {selectedRating === 4 && 'Puas'}
                {selectedRating === 3 && 'Cukup'}
                {selectedRating === 2 && 'Kurang'}
                {selectedRating === 1 && 'Kecewa'}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2"
            >
              Catatan Pengalaman (Opsional)
            </label>
            <textarea
              id="review-comment"
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Contoh: Sayurannya masih sangat segar dan porsinya melimpah!"
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="bg-[#1b1c1c] hover:bg-black text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 min-h-[44px]"
            >
              {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
