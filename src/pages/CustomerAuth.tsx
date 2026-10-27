import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { loginUser, registerUser, getGoogleAuthUrl } from '../services/authService';
import { CustomerAuthArtwork } from '../components/auth/CustomerAuthArtwork';
import { CustomerLoginForm } from '../components/auth/CustomerLoginForm';
import { CustomerRegisterForm } from '../components/auth/CustomerRegisterForm';

export interface CustomerAuthProps {
  initialMode?: 'login' | 'register';
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

/**
 * CustomerAuth Page (Login & Register Views)
 * Modular orchestrator delegating UI subtrees to CustomerAuthArtwork, CustomerLoginForm, and CustomerRegisterForm.
 * Complies with AGENTS.md, .agents/docs/architecture.md, and antislop guidelines.
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
  const [rememberMe, setRememberMe] = useState(false);

  // Register form states
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        {/* Decorative corner accents in Login mode */}
        {mode === 'login' && (
          <>
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

            <svg
              className="absolute -bottom-10 left-1/4 -translate-x-1/2 w-56 h-36 text-[#E4ECE0] pointer-events-none select-none z-0"
              viewBox="0 0 200 120"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M10 120 C30 50 170 50 190 120 Z"
                opacity="0.6"
              />
            </svg>

            <div
              className="absolute -bottom-8 -right-8 w-44 h-44 pointer-events-none select-none z-0 overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute bottom-5 right-2 w-36 h-6 bg-[#E3EBE0] rounded-full rotate-[-45deg] opacity-75" />
              <div className="absolute bottom-0 right-10 w-36 h-6 bg-[#E3EBE0] rounded-full rotate-[-45deg] opacity-75" />
            </div>
          </>
        )}

        {/* LEFT COLUMN: BRAND, VALUE PROP & CENTERPIECE ARTWORK */}
        <CustomerAuthArtwork mode={mode} />

        {/* RIGHT COLUMN: AUTHENTICATION FORM CARD */}
        <section
          className="lg:col-span-6 p-4 sm:p-7 lg:p-9 flex items-center justify-center relative z-10"
          aria-label={mode === 'login' ? 'Formulir Masuk' : 'Formulir Pendaftaran Akun'}
        >
          <div className="w-full max-w-[430px] bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-9 shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-[#EBF0E6]">
            {mode === 'login' ? (
              <CustomerLoginForm
                email={loginEmail}
                setEmail={setLoginEmail}
                password={loginPassword}
                setPassword={setLoginPassword}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                onSubmit={handleLoginSubmit}
                onForgotPassword={handleForgotPassword}
                onGoogleAuth={handleGoogleAuth}
                onSwitchToRegister={() => switchMode('register')}
                onShowTerms={() => onShowToast?.('Membuka Syarat & Ketentuan RescueBite', 'info')}
                onShowPrivacy={() => onShowToast?.('Membuka Kebijakan Privasi RescueBite', 'info')}
                isSubmitting={isSubmitting}
              />
            ) : (
              <CustomerRegisterForm
                fullName={fullName}
                setFullName={setFullName}
                email={registerEmail}
                setEmail={setRegisterEmail}
                password={registerPassword}
                setPassword={setRegisterPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                agreeTerms={agreeTerms}
                setAgreeTerms={setAgreeTerms}
                onSubmit={handleRegisterSubmit}
                onGoogleAuth={handleGoogleAuth}
                onSwitchToLogin={() => switchMode('login')}
                onShowTerms={() => onShowToast?.('Membuka Syarat & Ketentuan RescueBite', 'info')}
                onShowPrivacy={() => onShowToast?.('Membuka Kebijakan Privasi RescueBite', 'info')}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
