import { ArrowLeft } from 'lucide-react';
import rescueBiteLogo from '../assets/logo_new.svg';
import customerIllustration from '../assets/Login & Register/Illustration Area_margin.svg';
import merchantIllustration from '../assets/Login & Register/Illustration Area_margin (1).svg';

export interface AuthRoleSelectionProps {
  onSelectCustomer: () => void;
  onSelectSeller: () => void;
  onNavigateHome?: () => void;
}

/**
 * AuthRoleSelection Page
 * Role gateway directing users to Customer (role_id: 1) or Mitra Toko (role_id: 3) authentication.
 * Complies with AGENTS.md, design.md, and antislop guidelines.
 */
export function AuthRoleSelection({
  onSelectCustomer,
  onSelectSeller,
  onNavigateHome,
}: AuthRoleSelectionProps) {
  return (
    <div className="min-h-screen bg-[#F4F6F0] flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* 1. Top Botanical Leaves Accents */}
      {/* Top Left Leaf Branch */}
      <svg
        className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 w-36 h-36 sm:w-48 sm:h-48 text-[#244230] pointer-events-none select-none z-0 opacity-90"
        viewBox="0 0 160 160"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M-10 -10 C30 20 50 60 40 100 C30 85 25 65 10 50 Z" />
        <ellipse cx="65" cy="40" rx="20" ry="12" transform="rotate(-35 65 40)" />
        <ellipse cx="85" cy="80" rx="24" ry="13" transform="rotate(-20 85 80)" />
        <ellipse cx="105" cy="125" rx="22" ry="11" transform="rotate(-40 105 125)" />
        <ellipse cx="40" cy="115" rx="18" ry="10" transform="rotate(-55 40 115)" />
      </svg>

      {/* Top Right Leaf Branch */}
      <svg
        className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 w-36 h-36 sm:w-48 sm:h-48 text-[#244230] pointer-events-none select-none z-0 opacity-90"
        viewBox="0 0 160 160"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M170 -10 C130 20 110 60 120 100 C130 85 135 65 150 50 Z" />
        <ellipse cx="95" cy="40" rx="20" ry="12" transform="rotate(35 95 40)" />
        <ellipse cx="75" cy="80" rx="24" ry="13" transform="rotate(20 75 80)" />
        <ellipse cx="55" cy="125" rx="22" ry="11" transform="rotate(40 55 125)" />
        <ellipse cx="120" cy="115" rx="18" ry="10" transform="rotate(55 120 115)" />
      </svg>

      {/* 2. Top Bar with Back Button */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 relative z-20 flex items-center justify-between">
        {onNavigateHome ? (
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-[#DCE4D8] text-xs sm:text-sm font-semibold text-[#191c1d] shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-xs"
            title="Kembali ke Beranda"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4 text-[#5A6658]" />
            <span>Kembali ke Beranda</span>
          </button>
        ) : (
          <div />
        )}
      </header>

      {/* 3. Main Center Content Container */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7 sm:mb-9">
          {/* RescueByte Logo with Box Icon */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#14291B] flex items-center justify-center p-1.5 shadow-xs">
              <img
                src={rescueBiteLogo}
                alt="Logo RescueBite"
                className="w-5 h-5 object-contain brightness-0 invert"
                draggable={false}
              />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
              <span className="text-[#191c1d]">Rescue</span>
              <span className="text-[#2F8535]">Bite</span>
            </span>
          </div>

          {/* Title with decorative tick sparkles */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {/* Left green sparkle */}
            <span className="text-[#3A8D40] text-sm sm:text-base font-bold select-none leading-none -mt-1" aria-hidden="true">
              {`'-`}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-[#191c1d] leading-tight">
              Selamat Datang di <span className="text-[#2E8033]">RescueBite</span>
            </h1>
            {/* Right green sparkle */}
            <span className="text-[#3A8D40] text-sm sm:text-base font-bold select-none leading-none -mt-1" aria-hidden="true">
              {`-'`}
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[#5D6B5A] font-medium mt-2">
            Pilih cara kamu menggunakan RescueBite
          </p>
        </div>

        {/* 4. Dual Option Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
          {/* Card 1: Customer */}
          <div
            className="bg-white rounded-[26px] sm:rounded-[32px] p-5 sm:p-7 border border-[#E3E8DE] shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between group"
            id="role-card-customer"
          >
            <div>
              {/* Illustration Header Box */}
              <div className="w-full h-44 sm:h-52 rounded-2xl bg-[#EFF5EE] overflow-hidden flex items-center justify-center relative p-2">
                <img
                  src={customerIllustration}
                  alt="Ilustrasi Pelanggan RescueBite"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  draggable={false}
                />
              </div>

              {/* Text Information */}
              <div className="text-center mt-5 px-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#191c1d] tracking-tight">
                  Customer
                </h2>
                <p className="text-xs sm:text-sm text-[#5C6659] leading-relaxed mt-2 min-h-[38px] flex items-center justify-center">
                  Temukan Mystery Box favorit, hemat biaya, dan bantu kurangi food waste.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={onSelectCustomer}
              className="w-full mt-6 py-3.5 px-6 rounded-2xl bg-[#1B2B21] hover:bg-[#253B2D] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 group/btn"
              id="btn-select-customer"
              aria-label="Masuk sebagai Customer"
            >
              <span>Masuk sebagai Customer</span>
              <span className="transition-transform group-hover/btn:translate-x-1" aria-hidden="true">→</span>
            </button>
          </div>

          {/* Card 2: Mitra Toko */}
          <div
            className="bg-white rounded-[26px] sm:rounded-[32px] p-5 sm:p-7 border border-[#E3E8DE] shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between group"
            id="role-card-seller"
          >
            <div>
              {/* Illustration Header Box */}
              <div className="w-full h-44 sm:h-52 rounded-2xl bg-[#EFF5EE] overflow-hidden flex items-center justify-center relative p-2">
                <img
                  src={merchantIllustration}
                  alt="Ilustrasi Mitra Toko RescueBite"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  draggable={false}
                />
              </div>

              {/* Text Information */}
              <div className="text-center mt-5 px-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#191c1d] tracking-tight">
                  Mitra Toko
                </h2>
                <p className="text-xs sm:text-sm text-[#5C6659] leading-relaxed mt-2 min-h-[38px] flex items-center justify-center">
                  Jual surplus makanan, kelola produk, dan jangkau lebih banyak pelanggan.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={onSelectSeller}
              className="w-full mt-6 py-3.5 px-6 rounded-2xl bg-[#1B2B21] hover:bg-[#253B2D] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 group/btn"
              id="btn-select-seller"
              aria-label="Masuk sebagai Mitra Toko"
            >
              <span>Masuk sebagai Mitra Toko</span>
              <span className="transition-transform group-hover/btn:translate-x-1" aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* 5. Bottom Slogan / Mission Statement */}
        <div className="mt-7 sm:mt-9 flex items-center gap-2.5 text-center px-4">
          <div className="w-4 h-4 text-[#3A8D40] shrink-0" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15 9L22 9L16.5 14L18.5 21L12 17L5.5 21L7.5 14L2 9L9 9Z" className="hidden" />
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>
          <div className="text-left">
            <span className="font-bold text-xs sm:text-sm text-[#191c1d] block">
              Good Food. Brighter Tomorrow.
            </span>
            <span className="text-[11px] sm:text-xs text-[#637060] block mt-0.5">
              Bersama mengurangi food waste dan mendukung bisnis lokal.
            </span>
          </div>
        </div>
      </main>

      {/* 6. Bottom Landscape Waves Graphic */}
      <footer className="w-full h-16 sm:h-24 relative z-0 pointer-events-none mt-auto">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Back wave */}
          <path
            d="M0 60 C320 15 580 95 900 45 C1180 5 1320 70 1440 50 L1440 120 L0 120 Z"
            fill="#1E382A"
          />
          {/* Front wave */}
          <path
            d="M0 80 C280 40 520 100 840 65 C1160 30 1320 85 1440 70 L1440 120 L0 120 Z"
            fill="#14261C"
          />
        </svg>
      </footer>
    </div>
  );
}
