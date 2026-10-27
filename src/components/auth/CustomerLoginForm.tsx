import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface CustomerLoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onGoogleAuth: () => void;
  onSwitchToRegister: () => void;
  onShowTerms: () => void;
  onShowPrivacy: () => void;
  isSubmitting: boolean;
}

export function CustomerLoginForm({
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  onSubmit,
  onForgotPassword,
  onGoogleAuth,
  onSwitchToRegister,
  onShowTerms,
  onShowPrivacy,
  isSubmitting,
}: CustomerLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {/* Title & Subtitle */}
      <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#111913] text-center tracking-tight">
        Selamat Datang Kembali!
      </h2>
      <p className="text-xs sm:text-sm text-[#647466] text-center mt-1.5 mb-6">
        Masuk untuk menemukan Mystery Box favoritmu.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm text-[#191c1d] placeholder:text-[#A0ABA0] outline-hidden bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#8A9889] hover:text-[#191c1d] transition-colors cursor-pointer"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            onClick={onForgotPassword}
            className="text-xs font-semibold text-[#237126] hover:underline cursor-pointer"
          >
            Lupa Kata Sandi?
          </button>
        </div>

        {/* Submit Button */}
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
          onClick={onGoogleAuth}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl border border-[#DCE4D8] bg-white hover:bg-[#F9FAF8] text-[#191c1d] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-60"
        >
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
          <span>Lanjutkan dengan Google</span>
        </button>

        {/* Switch to Register */}
        <p className="text-center text-xs text-[#5C685A] pt-2">
          Belum punya akun?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
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
            onClick={onShowTerms}
            className="text-[#237126] hover:underline font-medium cursor-pointer"
          >
            Syarat & Ketentuan
          </button>{' '}
          dan{' '}
          <button
            type="button"
            onClick={onShowPrivacy}
            className="text-[#237126] hover:underline font-medium cursor-pointer"
          >
            Kebijakan Privasi
          </button>{' '}
          RescueBite.
        </p>
      </form>
    </div>
  );
}
