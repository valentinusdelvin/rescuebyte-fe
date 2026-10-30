import rescueBiteLogo from '../../assets/logo_new.svg';
import centerpieceLogin from '../../assets/Login & Register/Centerpiece_ Realistic Mystery Box & Fresh Harvest Artwork.svg';
import centerpieceRegister from '../../assets/Login & Register/Centerpiece Illustration.svg';
import merchantIllustration from '../../assets/Login & Register/Illustration Area_margin (1).svg';

interface CustomerAuthArtworkProps {
  mode: 'login' | 'register';
  roleType?: 'customer' | 'seller';
}

export function CustomerAuthArtwork({ mode, roleType = 'customer' }: CustomerAuthArtworkProps) {
  const isSeller = roleType === 'seller';

  return (
    <section
      className="lg:col-span-6 p-6 sm:p-9 lg:p-12 relative flex flex-col justify-between z-10"
      aria-label="Informasi RescueBite"
    >
      {/* 1. Header row: Brand logo on left, slogan script on right */}
      <div className="flex items-start justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#162E1A] flex items-center justify-center p-1.5 shadow-xs">
            <img
              src={rescueBiteLogo}
              alt="Logo RescueBite"
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain brightness-0 invert select-none"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight select-none leading-none">
              <span className="text-[#191c1d]">Rescue</span>
              <span className="text-[#237126]">Bite</span>
            </span>
            {isSeller && (
              <span className="text-[10px] font-bold text-[#237126] uppercase tracking-wider mt-0.5">
                Portal Mitra Toko
              </span>
            )}
          </div>
        </div>

        {/* Slogan */}
        <div className="text-right select-none">
          {isSeller ? (
            <p className="font-['Caveat',cursive] text-sm sm:text-base font-bold text-[#2D3748] leading-[1.3]">
              Kurangi Food Waste, <br />
              Maksimalkan Profit.
            </p>
          ) : mode === 'login' ? (
            <>
              <p className="font-['Caveat',cursive] text-sm sm:text-base font-bold text-[#2D3748] leading-tight">
                Lebih Baik <br />
                Bersama, <br />
                Lebih Sedikit <br />
                Terbuang.
              </p>
              <svg className="w-7 h-2.5 ml-auto -mt-0.5 text-[#237126]" viewBox="0 0 28 8" fill="none">
                <path d="M2 3C10 7 18 7 26 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </>
          ) : (
            <p className="font-['Caveat',cursive] text-sm sm:text-base font-bold text-[#2D3748] leading-[1.3]">
              Lebih Baik Bersama, <br />
              Lebih Sedikit Terbuang.
            </p>
          )}
        </div>
      </div>

      {/* 2. Value Proposition Headline */}
      <div className="my-6 lg:my-auto py-2">
        {isSeller ? (
          <>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.18] text-[#191c1d]">
              Jual Surplus Makanan, <br />
              <span className="text-[#237126]">Maksimalkan Profit</span> <br />
              <span className="text-[#237126]">Toko Anda!</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-[15px] text-[#525D50] leading-relaxed max-w-md mt-3.5">
              Ubah makanan layak konsumsi yang belum terjual menjadi pemasukan baru. Jangkau ribuan pelanggan lokal dan kurangi kerugian stok toko.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.18] text-[#191c1d]">
              Selamatkan Makanan, <br />
              <span className="text-[#237126]">Nikmati Harga Lebih</span> <br />
              <span className="text-[#237126]">Hemat!</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-[15px] text-[#525D50] leading-relaxed max-w-md mt-3.5">
              Temukan Mystery Box dari toko favoritmu, nikmati makanan berkualitas dengan harga spesial, dan bantu kurangi food waste.
            </p>
          </>
        )}
      </div>

      {/* 3. Centerpiece Illustration */}
      <div className="mt-4 sm:mt-6 flex flex-col items-center sm:items-end">
        {mode === 'register' && (
          <div className="mb-2 self-center sm:self-end mr-0 sm:mr-8 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#263238] font-['Caveat',cursive] select-none">
            <span className="text-[#237126] font-bold text-base">↗</span>
            <span>
              {isSeller ? 'Bisnis Berdaya, Makanan Terjaga.' : 'Makanan Enak, Masa Depan Lebih Baik.'}
            </span>
          </div>
        )}

        <div className="w-full max-w-[440px] flex items-center justify-center">
          {isSeller ? (
            <img
              src={merchantIllustration}
              alt="Ilustrasi Kemitraan Toko RescueBite"
              className="w-full h-auto object-contain select-none drop-shadow-xs transition-opacity duration-300"
              draggable={false}
            />
          ) : mode === 'login' ? (
            <img
              src={centerpieceLogin}
              alt="RescueBite Mystery Box & Hasil Panen Segar"
              className="w-full h-auto object-contain select-none drop-shadow-xs transition-opacity duration-300"
              draggable={false}
            />
          ) : (
            <img
              src={centerpieceRegister}
              alt="Ilustrasi Mystery Box RescueBite"
              className="w-full h-auto object-contain select-none drop-shadow-xs transition-opacity duration-300"
              draggable={false}
            />
          )}
        </div>
      </div>
    </section>
  );
}
