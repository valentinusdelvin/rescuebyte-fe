import React, { useState } from 'react';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { getCurrentUser } from '../services/authService';

export interface CustomerContactProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateSeller?: () => void;
  onNavigateAuth?: () => void;
  onNavigateProfile?: () => void;
  onNavigateOrders?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  suggestion?: string;
}

/**
 * CustomerContact Page View
 * Halaman Kontak & Kirim Saran untuk RescueBite.
 * Menggunakan Gmail Compose URL untuk mengirim masukan langsung ke fahmimuhammad2626@gmail.com.
 */
export function CustomerContact({
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateSeller,
  onNavigateAuth,
  onNavigateProfile,
  onNavigateOrders,
  onShowToast,
}: CustomerContactProps) {
  const currentUser = getCurrentUser();

  const [name, setName] = useState<string>(currentUser?.name || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [suggestion, setSuggestion] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSuggestion = suggestion.trim();

    if (!trimmedName) {
      newErrors.name = 'Nama lengkap wajib diisi.';
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email wajib diisi.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = 'Format email tidak valid (contoh: nama@domain.com).';
      }
    }

    if (!trimmedSuggestion) {
      newErrors.suggestion = 'Saran atau masukan wajib diisi.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      if (onShowToast) {
        onShowToast('Silakan periksa kembali formulir yang belum lengkap.', 'error');
      }
      return;
    }

    const recipient = 'fahmimuhammad2626@gmail.com';
    const subject = 'Masukan Aplikasi RescueBite';
    const body = `Nama Pengirim: ${name.trim()}
Email Pengirim: ${email.trim()}
Saran atau Masukan:
${suggestion.trim()}`;

    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: recipient,
      su: subject,
      body: body,
    });

    const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;

    // Buka Gmail Compose di tab baru
    window.open(gmailUrl, '_blank');

    if (onShowToast) {
      onShowToast(
        'Membuka Gmail... Silakan tekan Send untuk mengirim saran kamu.',
        'info'
      );
    }

    // Jangan mengosongkan form setelah Gmail terbuka
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between" id="customer-contact-root">
      {/* 1. Floating Pill Header */}
      <CustomerHeader
        activeTab="kontak"
        currentUser={currentUser}
        onNavigateHome={onNavigateHome}
        onNavigateSeller={onNavigateSeller}
        onNavigateProfile={onNavigateProfile}
        onNavigateOrders={onNavigateOrders}
        onNavigateAuth={onNavigateAuth}
        onSelectTab={(tab) => {
          if (tab === 'beranda') {
            if (onNavigateHome) onNavigateHome();
            else window.location.hash = '#beranda-customer';
          } else if (tab === 'marketplace') {
            if (onNavigateMarketplace) onNavigateMarketplace();
            else window.location.hash = '#marketplace';
          }
        }}
        onShowToast={onShowToast}
      />

      {/* 2. Main Contact Form Container */}
      <main className="pt-28 md:pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
        {/* Page Headings */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1b1c1c] tracking-tight">
            Punya Saran untuk RescueBite?
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-3 leading-relaxed">
            Bantu kami menjadi lebih baik! Bagikan ide, kritik, atau saran kamu untuk pengalaman RescueBite yang lebih menyenangkan.
          </p>
        </div>

        {/* Suggestion Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 max-w-xl w-full shadow-sm border border-slate-200/80">
          {/* Card Top Title with Speech Bubble Icon */}
          <div className="flex items-start gap-3.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Kirim Saran Kamu
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Isi formulir berikut untuk menyampaikan masukan kepada tim RescueBite.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Field: Nama Lengkap */}
            <div>
              <label htmlFor="contact-name" className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="Masukkan nama kamu"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-sm bg-slate-50/50 hover:bg-white transition-all`}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
              />
              {errors.name && (
                <p id="contact-name-error" className="text-xs text-red-600 mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Field: Email */}
            <div>
              <label htmlFor="contact-email" className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="contoh@email.com"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-sm bg-slate-50/50 hover:bg-white transition-all`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
              />
              {errors.email && (
                <p id="contact-email-error" className="text-xs text-red-600 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Field: Saran atau Masukan */}
            <div>
              <label htmlFor="contact-suggestion" className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Saran atau Masukan
              </label>
              <textarea
                id="contact-suggestion"
                rows={5}
                value={suggestion}
                onChange={(e) => {
                  setSuggestion(e.target.value);
                  if (errors.suggestion) setErrors((prev) => ({ ...prev, suggestion: '' }));
                }}
                placeholder="Ceritakan ide, kritik, atau saran kamu untuk RescueBite..."
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.suggestion ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-sm bg-slate-50/50 hover:bg-white transition-all resize-none`}
                aria-invalid={!!errors.suggestion}
                aria-describedby={errors.suggestion ? 'contact-suggestion-error' : undefined}
              />
              {errors.suggestion && (
                <p id="contact-suggestion-error" className="text-xs text-red-600 mt-1">
                  {errors.suggestion}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-kirim-saran"
              className="w-full py-3.5 px-6 rounded-xl bg-[#1c2a22] hover:bg-[#121c16] text-white font-bold text-sm transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.99] mt-2"
            >
              Kirim Saran
            </button>

            {/* Gmail Notice */}
            <p className="text-[12px] sm:text-xs text-slate-500 text-center mt-1 leading-relaxed">
              Gmail akan terbuka dengan pesan yang sudah disiapkan. Silakan tekan Send untuk mengirim saran kamu.
            </p>
          </form>

          {/* Guarantee Note */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Masukan kamu akan dikirimkan langsung kepada tim RescueBite.</span>
          </div>
        </div>
      </main>

      {/* 3. Customer Footer */}
      <CustomerFooter
        variant="full"
        onNavigateSeller={onNavigateSeller}
        onNavigateMarketplace={onNavigateMarketplace}
      />
    </div>
  );
}

export default CustomerContact;

