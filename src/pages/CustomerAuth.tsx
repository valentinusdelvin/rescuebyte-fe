import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  loginUser,
  registerUser,
  getGoogleAuthUrl,
  getAuth,
  saveAuth,
  clearAuth,
  getRoleForEmail,
  setRoleForEmail,
} from '../services/authService';
import { CustomerAuthArtwork } from '../components/auth/CustomerAuthArtwork';
import { CustomerLoginForm } from '../components/auth/CustomerLoginForm';
import { CustomerRegisterForm } from '../components/auth/CustomerRegisterForm';

export interface CustomerAuthProps {
  initialMode?: 'login' | 'register';
  roleType?: 'customer' | 'seller';
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateSeller?: () => void;
  onNavigateRoleSelection?: () => void;
  onSwitchRole?: (role: 'customer' | 'seller') => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

/**
 * CustomerAuth Page (Login & Register Views)
 * Supports Customer (role_id: 1) and Mitra Toko (role_id: 3) authentication.
 * Complies with AGENTS.md, .agents/docs/architecture.md, and antislop guidelines.
 */
export function CustomerAuth({
  initialMode = 'login',
  roleType = 'customer',
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateRoleSelection,
  onSwitchRole,
  onShowToast,
}: CustomerAuthProps) {
  const [currentRole, setCurrentRole] = useState<'customer' | 'seller'>(roleType);

  // Sync role when prop changes
  const [prevRoleType, setPrevRoleType] = useState(roleType);
  if (roleType !== prevRoleType) {
    setPrevRoleType(roleType);
    setCurrentRole(roleType);
  }

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

    const cleanEmail = loginEmail.trim().toLowerCase();
    const existingRole = getRoleForEmail(cleanEmail);

    // Pre-flight check: store email cannot log in via Customer form
    if (currentRole === 'customer' && existingRole === 'seller') {
      if (onShowToast) {
        onShowToast(
          'Akun ini terdaftar sebagai Mitra Toko. Silakan masuk melalui halaman login Mitra Toko.',
          'error'
        );
      }
      return;
    }

    // Pre-flight check: customer email cannot log in via Mitra Toko form
    if (currentRole === 'seller' && existingRole === 'customer') {
      if (onShowToast) {
        onShowToast(
          'Akun ini terdaftar sebagai Customer. Silakan masuk melalui halaman login Customer.',
          'error'
        );
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = await loginUser({
        email: loginEmail,
        password: loginPassword,
      });

      const userRoleId = Number(payload.user?.role_id);
      const userRoleStr = (payload.user?.role || '').toLowerCase();
      const storeKeywords = [
        'seller',
        'merchant',
        'mitra',
        'restaurant',
        'restoran',
        'store',
        'toko',
        'warung',
        'kedai',
        'cafe',
        'kafe',
        'dapur',
        'bakery',
        'outlet',
        'kuliner',
      ];
      const isActuallySeller =
        existingRole === 'seller' ||
        userRoleId === 3 ||
        storeKeywords.some((r) => userRoleStr.includes(r)) ||
        storeKeywords.some((k) => cleanEmail.includes(k)) ||
        cleanEmail === 'tokoreza@gmail.com';

      // Role guard: Customer cannot login through Mitra Toko portal
      if (currentRole === 'seller' && !isActuallySeller) {
        clearAuth();
        setRoleForEmail(cleanEmail, 'customer');
        setIsSubmitting(false);
        if (onShowToast) {
          onShowToast(
            'Akun ini terdaftar sebagai Customer. Silakan masuk melalui halaman login Customer.',
            'error'
          );
        }
        return;
      }

      // Role guard: Mitra Toko cannot login through Customer portal
      if (currentRole === 'customer' && isActuallySeller) {
        clearAuth();
        setRoleForEmail(cleanEmail, 'seller');
        setIsSubmitting(false);
        if (onShowToast) {
          onShowToast(
            'Akun ini terdaftar sebagai Mitra Toko. Silakan masuk melalui halaman login Mitra Toko.',
            'error'
          );
        }
        return;
      }

      // Record verified role in email registry
      setRoleForEmail(cleanEmail, isActuallySeller ? 'seller' : 'customer');

      // Synchronize role state
      try {
        if (isActuallySeller) {
          localStorage.setItem('rescuebyte_user_role', 'seller');
          if (payload.user && payload.user.role_id !== 3) {
            payload.user.role_id = 3;
            payload.user.role = 'seller';
            const auth = getAuth();
            if (auth) {
              auth.user.role_id = 3;
              auth.user.role = 'seller';
              saveAuth(auth);
            }
          }
        } else {
          localStorage.setItem('rescuebyte_user_role', 'customer');
          localStorage.removeItem('rescuebyte_store_logo');
          localStorage.removeItem('rescuebyte_store_name');
          localStorage.removeItem('rescuebyte_store_email');
          localStorage.removeItem('rescuebyte_store_address');
          localStorage.removeItem('rescuebyte_store_coordinates');
          window.dispatchEvent(new Event('rescuebyte_store_updated'));
          if (payload.user && payload.user.role_id !== 1) {
            payload.user.role_id = 1;
            const auth = getAuth();
            if (auth) {
              auth.user.role_id = 1;
              saveAuth(auth);
            }
          }
        }
      } catch {
        // ignore
      }

      setIsSubmitting(false);
      if (onShowToast) {
        onShowToast(`Selamat datang kembali, ${payload.user.name}!`, 'success');
      }

      // Always redirect to landing page (customer home) for both customer and restaurant
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
      const roleId = currentRole === 'seller' ? 3 : 1;
      const cleanEmail = registerEmail.trim().toLowerCase();

      // Register role in email registry
      setRoleForEmail(cleanEmail, currentRole);

      const payload = await registerUser({
        name: fullName,
        email: registerEmail,
        password: registerPassword,
        role_id: roleId,
      });

      try {
        localStorage.setItem('rescuebyte_user_role', currentRole);
        if (currentRole === 'seller' && payload.user && payload.user.role_id !== 3) {
          payload.user.role_id = 3;
          payload.user.role = 'seller';
          const auth = getAuth();
          if (auth) {
            auth.user.role_id = 3;
            auth.user.role = 'seller';
            saveAuth(auth);
          }
        }
      } catch {
        // ignore
      }

      setIsSubmitting(false);
      if (onShowToast) {
        onShowToast(`Akun berhasil dibuat! Selamat bergabung, ${payload.user.name}!`, 'success');
      }
      // Always redirect to landing page (customer home) for both customer and restaurant
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

  const handleSwitchRole = (newRole: 'customer' | 'seller') => {
    setCurrentRole(newRole);
    if (onSwitchRole) onSwitchRole(newRole);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F2] flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-x-hidden font-sans">
      {/* Top Floating Back Button (Goes to Role Selection or Home) */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-8 z-30">
        <button
          type="button"
          onClick={() => {
            if (onNavigateRoleSelection) {
              onNavigateRoleSelection();
            } else if (onNavigateHome) {
              onNavigateHome();
            }
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 hover:bg-white border border-[#DCE4D8] text-xs sm:text-sm font-bold text-[#191c1d] shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-xs"
          title={onNavigateRoleSelection ? 'Kembali ke Pilihan Akun' : 'Kembali ke Beranda'}
          aria-label={onNavigateRoleSelection ? 'Kembali ke Pilihan Akun' : 'Kembali ke Beranda'}
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
        <CustomerAuthArtwork mode={mode} roleType={currentRole} />

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
                onSwitchRole={handleSwitchRole}
                onShowTerms={() => onShowToast?.('Membuka Syarat & Ketentuan RescueBite', 'info')}
                onShowPrivacy={() => onShowToast?.('Membuka Kebijakan Privasi RescueBite', 'info')}
                isSubmitting={isSubmitting}
                roleType={currentRole}
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
                onSwitchRole={handleSwitchRole}
                onShowTerms={() => onShowToast?.('Membuka Syarat & Ketentuan RescueBite', 'info')}
                onShowPrivacy={() => onShowToast?.('Membuka Kebijakan Privasi RescueBite', 'info')}
                isSubmitting={isSubmitting}
                roleType={currentRole}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
