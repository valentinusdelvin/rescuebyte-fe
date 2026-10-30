import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

interface CustomerRegisterFormProps {
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  agreeTerms: boolean;
  setAgreeTerms: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleAuth: () => void;
  onSwitchToLogin: () => void;
  onSwitchRole?: (role: 'customer' | 'seller') => void;
  onShowTerms: () => void;
  onShowPrivacy: () => void;
  isSubmitting: boolean;
  roleType?: 'customer' | 'seller';
}

export function CustomerRegisterForm({
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  agreeTerms,
  setAgreeTerms,
  onSubmit,
  onGoogleAuth,
  onSwitchToLogin,
  onSwitchRole,
  onShowTerms,
  onShowPrivacy,
  isSubmitting,
  roleType = 'customer',
}: CustomerRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isSeller = roleType === 'seller';

  return (
    <div>
      {/* Top Link: Kembali ke Login */}
      <div className="flex items-center mb-2">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6658] hover:text-[#111913] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Login</span>
        </button>
      </div>

      {/* Title & Subtitle */}
      <h2 className="text-2xl sm:text-[25px] font-extrabold text-[#111913] text-left tracking-tight">
        {isSeller ? 'Daftar Mitra Toko' : 'Gabung Bersama RescueBite!'}
      </h2>
      <p className="text-xs sm:text-sm text-[#647466] text-left mt-1 mb-4">
        {isSeller
          ? 'Mulai jual surplus makanan dan perluas jangkauan pelanggan tokomu.'
          : 'Buat akun dan mulai nikmati makanan berkualitas dengan harga lebih hemat.'}
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        {/* Field 1: Nama Lengkap */}
        <div>
          <label
            htmlFor="register-fullname"
            className="block text-[11px] font-bold text-[#1E2922] uppercase tracking-wider mb-1"
          >
            {isSeller ? 'NAMA LENGKAP PEMILIK / PENGELOLA' : 'NAMA LENGKAP'}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm text-[#191c1d] placeholder:text-[#A0ABA0] outline-hidden bg-transparent [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
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
              className="w-full text-sm text-[#191c1d] placeholder:text-[#A0ABA0] outline-hidden bg-transparent [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
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
          </label>
        </div>

        {/* Submit Button */}
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

        {/* Switch to Login */}
        <p className="text-center text-xs text-[#5C685A] pt-1">
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#237126] font-bold hover:underline cursor-pointer"
          >
            Masuk.
          </button>
        </p>

        {/* Switch Role Option */}
        {onSwitchRole && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => onSwitchRole(isSeller ? 'customer' : 'seller')}
              className="text-xs text-[#526050] hover:text-[#111913] transition-colors cursor-pointer"
            >
              {isSeller ? (
                <>Bukan Mitra Toko? <span className="text-[#237126] font-bold underline">Daftar sebagai Customer</span></>
              ) : (
                <>Punya bisnis kuliner? <span className="text-[#237126] font-bold underline">Daftar sebagai Mitra Toko</span></>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
