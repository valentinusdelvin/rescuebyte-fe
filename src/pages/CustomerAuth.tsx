import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User } from 'lucide-react';
import rescueBiteLogo from '../assets/logo.svg';
import centerpieceLogin from '../assets/Login & Register/Centerpiece_ Realistic Mystery Box & Fresh Harvest Artwork.svg';
import centerpieceRegister from '../assets/Login & Register/Centerpiece Illustration.svg';
import { loginUser, registerUser, getGoogleAuthUrl } from '../services/authService';

export interface CustomerAuthProps {
  initialMode?: 'login' | 'register';
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

/**
 * Standard 4-color Google Icon for OAuth
 */
function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/**
 * CustomerAuth Page (Login & Register Views)
 * Pixel-perfect match with the user's reference design images.
 * Aligned with backend contract payload:
 *  - access_token: string
 *  - refresh_token: string
 *  - user: { id, name, email, avatar_url, provider: 'LOCAL', role: 'customer', role_id: 1, created_at, updated_at }
 * Error toasts display red 'X' cross marks, while success toasts display green checkmarks.
 * Strict compliance with AGENTS.md, Design.md, and antislop rules (R-02 no em dash, R-03 mobile responsive, R-25 contrast).
 */
export function CustomerAuth({
  initialMode = 'login',
  onNavigateHome,
  onNavigateMarketplace,
  onShowToast,
}: CustomerAuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('daftar') || hash.includes('register')) {
        return 'register';
      }
    }
    return initialMode;
  });

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register form states (name, email, password, confirmPassword)
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode with window hash if user navigates with browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('daftar') || hash.includes('register')) {
        setMode('register');
      } else if (hash.includes('masuk') || hash.includes('login') || hash.includes('auth')) {
        setMode('login');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newMode === 'register' ? '#daftar' : '#masuk');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      if (onShowToast) onShowToast('Silakan isi alamat email dan kata sandi kamu.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = await loginUser({
        email: loginEmail,
        password: loginPassword,
      });

      setIsSubmitting(false);
      if (onShowToast) {
        onShowToast(`Selamat datang kembali, ${payload.user.name}!`, 'success');
      }
      if (onNavigateHome) {
        onNavigateHome();
      } else if (onNavigateMarketplace) {
        onNavigateMarketplace();
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      const message =
        err instanceof Error
          ? err.message
          : 'Gagal masuk. Periksa kembali email dan kata sandi kamu.';
      if (onShowToast) onShowToast(message, 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      if (onShowToast) onShowToast('Silakan isi nama lengkap kamu.', 'error');
      return;
    }
    if (!registerEmail.trim()) {
      if (onShowToast) onShowToast('Silakan isi alamat email kamu.', 'error');
      return;
    }
    if (registerPassword.length < 8) {
      if (onShowToast) onShowToast('Kata sandi harus minimal 8 karakter.', 'error');
      return;
    }
    if (registerPassword !== confirmPassword) {
      if (onShowToast) onShowToast('Konfirmasi kata sandi tidak cocok.', 'error');
      return;
    }
    if (!agreeTerms) {
      if (onShowToast) onShowToast('Silakan setujui Syarat & Ketentuan dan Kebijakan Privasi.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = await registerUser({
        name: fullName,
        email: registerEmail,
        password: registerPassword,
      });

      setIsSubmitting(false);
      if (onShowToast) {
        onShowToast(`Akun berhasil dibuat! Selamat bergabung, ${payload.user.name}!`, 'success');
      }
      if (onNavigateHome) {
        onNavigateHome();
      } else if (onNavigateMarketplace) {
        onNavigateMarketplace();
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      const message =
        err instanceof Error ? err.message : 'Gagal mendaftar akun. Silakan coba lagi.';
      if (onShowToast) onShowToast(message, 'error');
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    if (onShowToast) onShowToast('Mengarahkan ke Google OAuth...', 'info');
    try {
      const { auth_url, state } = await getGoogleAuthUrl();
      if (state) {
        sessionStorage.setItem('oauth_state', state);
      }
      // Redirect to Google OAuth authorization page
      window.location.href = auth_url;
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg =
        err instanceof Error ? err.message : 'Gagal menghubungkan ke Google OAuth.';
      if (onShowToast) onShowToast(msg, 'error');
    }
  };

  const handleForgotPassword = () => {
    if (onShowToast) {
      onShowToast('Tautan atur ulang kata sandi telah dikirim ke email kamu jika terdaftar.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F2] flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-x-hidden font-sans">
      {/* Top Floating Back to Home Button */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-8 z-30">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 hover:bg-white border border-[#DCE4D8] text-xs sm:text-sm font-bold text-[#191c1d] shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-xs"
          title="Kembali ke Beranda"
          aria-label="Kembali ke Beranda"
        >
          <ArrowLeft className="w-4 h-4 text-[#5A6658]" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Main Dual-Column Container Card */}
      <main
        className="w-full max-w-6xl bg-white rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] shadow-[0_16px_50px_-10px_rgba(0,0,0,0.06)] border border-[#E6EBE0] overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-6 sm:my-8 relative transition-all"
        id="auth-card-container"
      >
        {/* Decorative corner accents in Login mode (Faithful to Image 1) */}
        {mode === 'login' && (
          <>
            {/* Top-left organic sage blob */}
            <svg
              className="absolute -top-1 -left-1 w-44 h-44 sm:w-56 sm:h-56 text-[#E1EBDD] pointer-events-none select-none z-0"
              viewBox="0 0 240 240"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M0 0 H200 C165 75 130 135 75 165 C25 190 0 190 0 190 Z"
                opacity="0.85"
              />
            </svg>

            {/* Bottom-left / center subtle sage arch */}
            <svg
              className="absolute -bottom-10 left-1/4 -translate-x-1/2 w-56 h-36 text-[#E4ECE0] pointer-events-none select-none z-0"
              viewBox="0 0 200 120"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M0 120 C20 40 180 40 200 120 Z"
                opacity="0.75"
              />
            </svg>

            {/* Bottom-right diagonal accent pills (as seen in Image 1) */}
            <div
              className="absolute -bottom-8 -right-8 w-44 h-44 pointer-events-none select-none z-0 overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute bottom-5 right-2 w-36 h-6 bg-[#E3EBE0] rounded-full rotate-[-45deg] opacity-75" />
              <div className="absolute bottom-0 right-10 w-36 h-6 bg-[#E3EBE0] rounded-full rotate-[-45deg] opacity-75" />
            </div>
          </>
        )}

        {/* ========================================================
            LEFT COLUMN: BRAND, VALUE PROP & CENTERPIECE ARTWORK
           ======================================================== */}
        <section
          className="lg:col-span-6 p-6 sm:p-9 lg:p-12 relative flex flex-col justify-between z-10"
          aria-label="Informasi RescueBite"
        >
          {/* 1. Header row: Brand logo on left, handwritten script on right */}
          <div className="flex items-start justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#162E1A] flex items-center justify-center p-1.5 shadow-xs">
                <img
                  src={rescueBiteLogo}
                  alt="Logo RescueBite"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain brightness-0 invert select-none"
                />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight select-none">
                <span className="text-[#191c1d]">Rescue</span>
                <span className="text-[#237126]">Bite</span>
              </span>
            </div>

            {/* Handwritten script slogan: 4 lines in Login, 2 lines in Register */}
            <div className="text-right select-none">
              {mode === 'login' ? (
                <>
                  <p className="font-['Caveat',cursive] text-sm sm:text-base font-bold text-[#2D3748] leading-tight">
                    Lebih Baik <br />
                    Bersama, <br />
                    Lebih Sedikit <br />
                    Terbuang. <span className="inline-block text-base">💚</span>
                  </p>
                  <svg className="w-7 h-2.5 ml-auto -mt-0.5 text-[#237126]" viewBox="0 0 28 8" fill="none">
                    <path d="M2 3C10 7 18 7 26 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </>
              ) : (
                <p className="font-['Caveat',cursive] text-sm sm:text-base font-bold text-[#2D3748] leading-[1.3]">
                  Lebih Baik Bersama, <br />
                  Lebih Sedikit Terbuang. <span className="inline-block text-base">💚</span>
                </p>
              )}
            </div>
          </div>

          {/* 2. Headline & Subheadline (Balanced black & green, never solid green) */}
          <div className="my-6 lg:my-auto py-2">
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.18] text-[#191c1d]">
              Selamatkan Makanan, <br />
              <span className="text-[#237126]">Nikmati Harga Lebih</span> <br />
              <span className="text-[#237126]">Hemat!</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-[15px] text-[#525D50] leading-relaxed max-w-md mt-3.5">
              Temukan Mystery Box dari toko favoritmu, nikmati makanan berkualitas dengan harga spesial, dan bantu kurangi food waste.
            </p>
          </div>

          {/* 3. Centerpiece Illustration */}
          <div className="mt-4 sm:mt-6 flex flex-col items-center sm:items-end">
            {/* For Register only: render callout tag because Centerpiece Illustration doesn't have it embedded */}
            {mode === 'register' && (
              <div className="mb-2 self-center sm:self-end mr-0 sm:mr-8 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#263238] font-['Caveat',cursive] select-none">
                <span className="text-[#237126] font-bold text-base">↗</span>
                <span>Makanan Enak, Masa Depan Lebih Baik.</span>
                <span>💚</span>
              </div>
            )}

            {/* Artwork Image faithfully mapped to mode */}
            <div className="w-full max-w-[440px] flex items-center justify-center">
              {mode === 'login' ? (
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

        {/* ========================================================
            RIGHT COLUMN: AUTHENTICATION FORM CARD
           ======================================================== */}
        <section
          className="lg:col-span-6 p-4 sm:p-7 lg:p-9 flex items-center justify-center relative z-10"
          aria-label={mode === 'login' ? 'Formulir Masuk' : 'Formulir Pendaftaran Akun'}
        >
          <div className="w-full max-w-[430px] bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-9 shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-[#EBF0E6]">
            {/* =========================================
                MODE 1: LOGIN FORM (IMAGE 1)
               ========================================= */}
            {mode === 'login' ? (
              <div>
                {/* Title & Subtitle (Centered) */}
                <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#111913] text-center tracking-tight">
                  Selamat Datang Kembali!
                </h2>
                <p className="text-xs sm:text-sm text-[#647466] text-center mt-1.5 mb-6">
                  Masuk untuk menemukan Mystery Box favoritmu.
                </p>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-[11px] font-bold text-[#1E2922] uppercase tracking-wider mb-1.5"
                    >
                      ALAMAT EMAIL
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-[#DCE4D8] focus-within:border-[#237126] focus-within:ring-2 focus-within:ring-[#237126]/15 bg-white transition-all">
                      <Mail className="w-4 h-4 text-[#8A9889] shrink-0" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        placeholder="Masukkan alamat email kamu"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full text-sm text-[#191c1d] placeholder:text-[#A0ABA0] outline-hidden bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-[11px] font-bold text-[#1E2922] uppercase tracking-wider mb-1.5"
                    >
                      KATA SANDI
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-[#DCE4D8] focus-within:border-[#237126] focus-within:ring-2 focus-within:ring-[#237126]/15 bg-white transition-all">
                      <Lock className="w-4 h-4 text-[#8A9889] shrink-0" />
                      <input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="Masukkan kata sandi"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-sm text-[#191c1d] placeholder:text-[#A0ABA0] outline-hidden bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="text-[#8A9889] hover:text-[#191c1d] transition-colors cursor-pointer"
                        aria-label={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password Row */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#CBD5E1] text-[#237126] focus:ring-[#237126] cursor-pointer"
                      />
                      <span className="text-xs text-[#525D50]">Ingat Saya</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-semibold text-[#237126] hover:underline cursor-pointer"
                    >
                      Lupa Kata Sandi?
                    </button>
                  </div>

                  {/* Submit Button (Deep Evergreen) */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#162E1A] hover:bg-[#0E2012] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-70 mt-2"
                  >
                    <span>{isSubmitting ? 'Memproses...' : 'Masuk'}</span>
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5EDE2]"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px]">
                      <span className="bg-white px-3 text-[#798677]">atau masuk dengan</span>
                    </div>
                  </div>

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl border border-[#DCE4D8] hover:bg-[#F9FAF8] text-sm font-semibold text-[#1F2923] flex items-center justify-center gap-2.5 transition-colors cursor-pointer bg-white shadow-2xs disabled:opacity-70"
                  >
                    <GoogleIcon />
                    <span>Lanjutkan dengan Google</span>
                  </button>

                  {/* Switch to Register */}
                  <p className="text-center text-xs text-[#5C685A] pt-2">
                    Belum punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="text-[#237126] font-bold hover:underline cursor-pointer"
                    >
                      Daftar sekarang.
                    </button>
                  </p>

                  {/* Terms & Privacy */}
                  <p className="text-center text-[10.5px] text-[#788576] pt-1 leading-relaxed">
                    Dengan melanjutkan, kamu menyetujui{' '}
                    <button
                      type="button"
                      onClick={() => onShowToast?.('Membuka Syarat & Ketentuan RescueBite', 'info')}
                      className="text-[#237126] hover:underline font-medium cursor-pointer"
                    >
                      Syarat & Ketentuan
                    </button>{' '}
                    dan{' '}
                    <button
                      type="button"
                      onClick={() => onShowToast?.('Membuka Kebijakan Privasi RescueBite', 'info')}
                      className="text-[#237126] hover:underline font-medium cursor-pointer"
                    >
                      Kebijakan Privasi
                    </button>{' '}
                    RescueBite.
                  </p>
                </form>
              </div>
            ) : (
              /* =========================================
                  MODE 2: REGISTER FORM (IMAGE 2)
                 ========================================= */
              <div>
                {/* Top Link: Kembali ke Login */}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6658] hover:text-[#111913] transition-colors cursor-pointer mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Login</span>
                </button>

                {/* Title & Subtitle (Left-aligned) */}
                <h2 className="text-2xl sm:text-[25px] font-extrabold text-[#111913] text-left tracking-tight">
                  Gabung Bersama RescueBite!
                </h2>
                <p className="text-xs sm:text-sm text-[#647466] text-left mt-1 mb-4">
                  Buat akun dan mulai nikmati makanan berkualitas dengan harga lebih hemat.
                </p>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {/* Field 1: Nama Lengkap */}
                  <div>
                    <label
                      htmlFor="register-fullname"
                      className="block text-[11px] font-bold text-[#1E2922] uppercase tracking-wider mb-1"
                    >
                      NAMA LENGKAP
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#DCE4D8] focus-within:border-[#237126] focus-within:ring-2 focus-within:ring-[#237126]/15 bg-white transition-all">
                      <User className="w-4 h-4 text-[#8A9889] shrink-0" />
                      <input
                        id="register-fullname"
                        type="text"
                        required
                        placeholder="Masukkan nama lengkap kamu"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-sm text-[#191c1d] placeholder:text-[#A0ABA0] outline-hidden bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Field 2: Alamat Email */}
                  <div>
                    <label
                      htmlFor="register-email"
                      className="block text-[11px] font-bold text-[#1E2922] uppercase tracking-wider mb-1"
                    >
                      ALAMAT EMAIL
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#DCE4D8] focus-within:border-[#237126] focus-within:ring-2 focus-within:ring-[#237126]/15 bg-white transition-all">
                      <Mail className="w-4 h-4 text-[#8A9889] shrink-0" />
                      <input
                        id="register-email"
                        type="email"
                        required
                        placeholder="Masukkan alamat email kamu"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full text-sm text-[#191c1d] placeholder:text-[#A0ABA0] outline-hidden bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Field 3: Kata Sandi */}
                  <div>
                    <label
                      htmlFor="register-password"
                      className="block text-[11px] font-bold text-[#1E2922] uppercase tracking-wider mb-1"
                    >
                      KATA SANDI
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#DCE4D8] focus-within:border-[#237126] focus-within:ring-2 focus-within:ring-[#237126]/15 bg-white transition-all">
                      <Lock className="w-4 h-4 text-[#8A9889] shrink-0" />
                      <input
                        id="register-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimal 8 karakter"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full text-sm text-[#191c1d] placeholder:text-[#A0ABA0] outline-hidden bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="text-[#8A9889] hover:text-[#191c1d] transition-colors cursor-pointer"
                        aria-label={showRegisterPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Field 4: Konfirmasi Kata Sandi */}
                  <div>
                    <label
                      htmlFor="register-confirm-password"
                      className="block text-[11px] font-bold text-[#1E2922] uppercase tracking-wider mb-1"
                    >
                      KONFIRMASI KATA SANDI
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#DCE4D8] focus-within:border-[#237126] focus-within:ring-2 focus-within:ring-[#237126]/15 bg-white transition-all">
                      <Lock className="w-4 h-4 text-[#8A9889] shrink-0" />
                      <input
                        id="register-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Masukkan kembali kata sandi"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-sm text-[#191c1d] placeholder:text-[#A0ABA0] outline-hidden bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-[#8A9889] hover:text-[#191c1d] transition-colors cursor-pointer"
                        aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms & Privacy Checkbox */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="register-terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-[#CBD5E1] text-[#237126] focus:ring-[#237126] cursor-pointer shrink-0"
                    />
                    <label htmlFor="register-terms" className="text-xs text-[#525D50] leading-snug cursor-pointer select-none">
                      Saya menyetujui{' '}
                      <button
                        type="button"
                        onClick={() => onShowToast?.('Membuka Syarat & Ketentuan RescueBite', 'info')}
                        className="text-[#237126] hover:underline font-medium cursor-pointer"
                      >
                        Syarat & Ketentuan
                      </button>{' '}
                      dan{' '}
                      <button
                        type="button"
                        onClick={() => onShowToast?.('Membuka Kebijakan Privasi RescueBite', 'info')}
                        className="text-[#237126] hover:underline font-medium cursor-pointer"
                      >
                        Kebijakan Privasi
                      </button>{' '}
                      RescueBite.
                    </label>
                  </div>

                  {/* Submit Button (Deep Evergreen) */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-xl bg-[#162E1A] hover:bg-[#0E2012] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-70 mt-3"
                  >
                    <span>{isSubmitting ? 'Mendaftarkan...' : 'Buat Akun'}</span>
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </button>

                  {/* Divider */}
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5EDE2]"></div>
                    </div>
                    <div className="relative flex justify-center text-[10.5px] uppercase tracking-wider">
                      <span className="bg-white px-3 text-[#798677]">ATAU DAFTAR DENGAN</span>
                    </div>
                  </div>

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#DCE4D8] hover:bg-[#F9FAF8] text-sm font-semibold text-[#1F2923] flex items-center justify-center gap-2.5 transition-colors cursor-pointer bg-white shadow-2xs disabled:opacity-70"
                  >
                    <GoogleIcon />
                    <span>Lanjutkan dengan Google</span>
                  </button>

                  {/* Switch to Login */}
                  <p className="text-center text-xs text-[#5C685A] pt-1">
                    Sudah punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-[#237126] font-bold hover:underline cursor-pointer"
                    >
                      Masuk.
                    </button>
                  </p>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
