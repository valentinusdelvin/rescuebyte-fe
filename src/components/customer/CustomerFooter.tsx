import { useState, useEffect } from 'react';
import { MessageCircle, Mail, Clock, ShieldCheck, X, FileText } from 'lucide-react';
import rescueBiteLogo from '../../assets/logo.svg';

export interface CustomerFooterProps {
  variant?: 'full' | 'compact';
  onNavigateSeller?: () => void;
  onNavigateMarketplace?: () => void;
  onContactSupport?: () => void;
}

type PolicyTab = 'terms' | 'privacy' | 'surplus';

export function CustomerFooter({
  variant = 'full',
  onNavigateSeller,
  onNavigateMarketplace,
  onContactSupport,
}: CustomerFooterProps) {
  const currentYear = new Date().getFullYear();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab>('terms');

  // Handle ESC key for modal dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsHelpOpen(false);
        setIsPolicyOpen(false);
      }
    };
    if (isHelpOpen || isPolicyOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isHelpOpen, isPolicyOpen]);

  const handleOpenHelp = () => {
    if (onContactSupport) {
      onContactSupport();
    } else {
      setIsHelpOpen(true);
    }
  };

  const handleOpenPolicy = (tab: PolicyTab) => {
    setPolicyTab(tab);
    setIsPolicyOpen(true);
  };

  // Compact footer for transactional and operational pages (Cart, Checkout, Orders, Profile, Product Detail)
  if (variant === 'compact') {
    return (
      <>
        <footer className="bg-white text-slate-600 border-t border-slate-200/80 py-6 px-6 sm:px-12 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <img src={rescueBiteLogo} alt="RescueBite" className="h-5 w-auto" />
              <span className="font-bold text-slate-800">RescueBite</span>
              <span className="text-slate-300" aria-hidden="true">•</span>
              <span className="text-slate-500">© {currentYear} RescueBite Indonesia.</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleOpenHelp}
                className="text-slate-600 hover:text-emerald-700 font-medium transition cursor-pointer"
              >
                Butuh Bantuan?
              </button>
              <span className="text-slate-300" aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => handleOpenPolicy('terms')}
                className="text-slate-600 hover:text-emerald-700 font-medium transition cursor-pointer"
              >
                Syarat & Ketentuan
              </button>
              <span className="text-slate-300" aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => handleOpenPolicy('privacy')}
                className="text-slate-600 hover:text-emerald-700 font-medium transition cursor-pointer"
              >
                Privasi
              </button>
            </div>
          </div>
        </footer>

        {/* Modals */}
        {renderModals()}
      </>
    );
  }

  // Full footer for discovery pages (Beranda & Marketplace)
  return (
    <>
      <footer className="bg-white text-[#1b1c1c] border-t border-slate-200/80 pt-16 pb-12 px-6 sm:px-12 mt-auto" id="kontak-section">
        <div className="max-w-7xl mx-auto flex flex-col">
          {/* Top Brand Section & Link Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Info Column */}
            <div className="lg:col-span-2 flex flex-col items-start">
              <div className="flex items-center gap-2.5 mb-2.5">
                <img src={rescueBiteLogo} alt="RescueBite" className="h-8 w-auto" />
                <span className="text-xl font-extrabold font-display text-[#1b1c1c] tracking-tight">RescueBite</span>
              </div>

              <p className="text-xs sm:text-[13px] font-bold text-emerald-700 mb-2 tracking-normal">
                Good Food. Brighter Tomorrow.
              </p>

              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-sm">
                Platform penyelamatan makanan surplus bermutu di Indonesia. Membantu mengurangi food waste dan mendukung bisnis kuliner lokal.
              </p>
            </div>

            {/* Links Column 1: Jelajah */}
            <div className="flex flex-col">
              <h4 className="text-sm font-bold text-[#1b1c1c] mb-4">Jelajah</h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a
                    href="#marketplace"
                    onClick={(e) => {
                      if (onNavigateMarketplace) {
                        e.preventDefault();
                        onNavigateMarketplace();
                      }
                    }}
                    className="text-xs sm:text-[13px] text-slate-500 hover:text-emerald-700 transition-colors"
                  >
                    Jelajah Marketplace
                  </a>
                </li>
                <li>
                  <a
                    href="#about-us-section"
                    className="text-xs sm:text-[13px] text-slate-500 hover:text-emerald-700 transition-colors"
                  >
                    Tentang RescueBite
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Column 2: Kemitraan */}
            <div className="flex flex-col">
              <h4 className="text-sm font-bold text-[#1b1c1c] mb-4">Kemitraan</h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a
                    href="#daftar-mitra"
                    onClick={(e) => {
                      if (onNavigateSeller) {
                        e.preventDefault();
                        onNavigateSeller();
                      }
                    }}
                    className="text-xs sm:text-[13px] text-slate-500 hover:text-emerald-700 transition-colors"
                  >
                    Gabung sebagai Mitra Toko
                  </a>
                </li>
                <li>
                  <a
                    href="#about-us-section"
                    className="text-xs sm:text-[13px] text-slate-500 hover:text-emerald-700 transition-colors"
                  >
                    Program Donasi Pangan
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Column 3: Bantuan & Kebijakan */}
            <div className="flex flex-col">
              <h4 className="text-sm font-bold text-[#1b1c1c] mb-4">Bantuan & Layanan</h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <button
                    type="button"
                    onClick={handleOpenHelp}
                    className="text-left text-xs sm:text-[13px] text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                    id="btn-footer-support"
                  >
                    Pusat Bantuan CS
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenPolicy('terms')}
                    className="text-left text-xs sm:text-[13px] text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    Syarat & Ketentuan Layanan
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenPolicy('privacy')}
                    className="text-left text-xs sm:text-[13px] text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    Kebijakan Privasi
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal Bar */}
          <div className="pt-8 mt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {currentYear} RescueBite Indonesia. Save Food, Share The Love.
            </p>

            <div className="flex items-center gap-5 flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenPolicy('privacy')}
                className="text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                Privasi
              </button>
              <button
                type="button"
                onClick={() => handleOpenPolicy('surplus')}
                className="text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                Kebijakan Surplus
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {renderModals()}
    </>
  );

  function renderModals() {
    return (
      <>
        {/* Help Center Modal */}
        {isHelpOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
          >
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="help-modal-title" className="text-base font-bold text-slate-900">
                      Pusat Bantuan RescueBite
                    </h3>
                    <p className="text-xs text-slate-500">Tim kami siap membantu kendala Anda</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  aria-label="Tutup pusat bantuan"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20RescueBite,%20saya%20butuh%20bantuan%20terkait%20pesanan"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-800">
                      WhatsApp Dukungan Resmi
                    </p>
                    <p className="text-xs text-slate-500">Respon cepat via obrolan WhatsApp</p>
                  </div>
                </a>

                <a
                  href="mailto:support@rescuebyte.id"
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-slate-800">
                      Email Dukungan Pelanggan
                    </p>
                    <p className="text-xs text-slate-500">support@rescuebyte.id</p>
                  </div>
                </a>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-slate-100/70 p-3 rounded-xl">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Jam operasional CS: Setiap hari, 08.00 – 22.00 WIB</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Policies and Terms Modal */}
        {isPolicyOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-modal-title"
          >
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <h3 id="policy-modal-title" className="text-base font-bold text-slate-900">
                    Informasi Legal & Kebijakan
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPolicyOpen(false)}
                  aria-label="Tutup kebijakan"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 px-5 gap-4">
                <button
                  type="button"
                  onClick={() => setPolicyTab('terms')}
                  className={`py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                    policyTab === 'terms'
                      ? 'border-emerald-700 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Syarat & Ketentuan
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyTab('privacy')}
                  className={`py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                    policyTab === 'privacy'
                      ? 'border-emerald-700 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Kebijakan Privasi
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyTab('surplus')}
                  className={`py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                    policyTab === 'surplus'
                      ? 'border-emerald-700 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Kebijakan Surplus
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto text-xs leading-relaxed text-slate-600 space-y-4">
                {policyTab === 'terms' && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1.5 text-sm">1. Ketentuan Pemesanan Makanan Surplus</h4>
                    <p className="mb-3">
                      RescueBite memfasilitasi penyelamatan makanan berkualitas yang berlebih dari gerai mitra restoran, bakery, dan toko pangan. Setiap paket dipesan untuk diambil sendiri (self-pickup) di lokasi toko mitra.
                    </p>
                    <h4 className="font-bold text-slate-900 mb-1.5 text-sm">2. Waktu dan Jadwal Pengambilan</h4>
                    <p className="mb-3">
                      Pelanggan wajib mengambil pesanan pada slot waktu operasional pickup yang telah ditentukan toko. Pesanan yang tidak diambil dalam batas waktu yang ditentukan tidak dapat dibatalkan atau dikembalikan secara sepihak.
                    </p>
                    <h4 className="font-bold text-slate-900 mb-1.5 text-sm">3. Konfirmasi & Pembayaran</h4>
                    <p>
                      Pembayaran diverifikasi secara otomatis melalui gateway resmi atau pembayaran tunai saat pickup. Mitra toko akan menyiapkan pesanan begitu transaksi tercatat di sistem.
                    </p>
                  </div>
                )}

                {policyTab === 'privacy' && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1.5 text-sm">1. Data yang Kami Kelola</h4>
                    <p className="mb-3">
                      Kami menghargai privasi pengguna. Informasi nama, nomor telepon, dan lokasi yang Anda masukkan digunakan secara eksklusif untuk koordinasi pickup pesanan dan notifikasi status pesanan di RescueBite.
                    </p>
                    <h4 className="font-bold text-slate-900 mb-1.5 text-sm">2. Keamanan Pembayaran</h4>
                    <p>
                      Seluruh transaksi pembayaran diproses melalui saluran gateway terenkripsi dan terverifikasi standar keamanan industri. RescueBite tidak menyimpan data sensitif perbankan pengguna di server aplikasi.
                    </p>
                  </div>
                )}

                {policyTab === 'surplus' && (
                  <div>
                    <div className="flex items-center gap-2 text-emerald-800 font-bold mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Standar Higienitas & Kualitas Pangan</span>
                    </div>
                    <p className="mb-3">
                      Setiap paket makanan surplus yang terdaftar di RescueBite dipastikan memenuhi standar higienitas dan kelayakan konsumsi sebelum batas kedaluwarsa.
                    </p>
                    <p>
                      Mitra wajib mengemas makanan secara higienis dalam wadah bersih dan menyimpannya pada rak atau tempat penyimpanan khusus pickup makanan surplus.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPolicyOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default CustomerFooter;
