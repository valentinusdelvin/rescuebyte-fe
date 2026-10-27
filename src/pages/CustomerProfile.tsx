import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  FileText,
  Lock,
  LogOut,
  Calendar,
  CheckCircle,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { getCurrentUser, clearAuth } from '../services/authService';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { UserPayload } from '../types';

export interface CustomerProfileProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateSeller?: () => void;
  onNavigateOrders?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const DEFAULT_USER: UserPayload = {
  id: 'usr_reza_1024',
  name: 'Reza Pratama',
  email: 'reza.pratama@email.com',
  avatar_url: '',
  provider: 'LOCAL',
  role: 'Customer',
  role_id: 1,
  created_at: '2026-10-27T10:00:00Z',
  updated_at: '2026-10-27T10:00:00Z',
};

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 85 }, (_, i) => CURRENT_YEAR - i);

function formatDate(dateStr?: string): string {
  if (!dateStr) return '27 Oktober 2026';
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function CustomerProfile({
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateSeller,
  onNavigateOrders,
  onShowToast,
}: CustomerProfileProps) {
  const [user, setUser] = useState<UserPayload>(() => getCurrentUser() || DEFAULT_USER);
  const [name, setName] = useState(user.name || 'Reza Pratama');
  const [email, setEmail] = useState(user.email || 'reza.pratama@email.com');
  const [birthDate, setBirthDate] = useState('15 Agustus 2003');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [phone, setPhone] = useState('+62 812 3456 7890');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);

  // Calendar popover state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calYear, setCalYear] = useState<number>(2003);
  const [calMonth, setCalMonth] = useState<number>(7); // 7 = Agustus (0-indexed)
  const [calDay, setCalDay] = useState<number>(15);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserProfile()
      .then((profile) => {
        setUser(profile);
        setName(profile.name);
        setEmail(profile.email);
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
      })
      .catch(() => {});
  }, []);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarContainerRef.current &&
        !calendarContainerRef.current.contains(e.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast?.('File harus berupa gambar (JPG atau PNG).', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onShowToast?.('Ukuran foto maksimal adalah 2 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(event.target?.result as string);
      onShowToast?.('Foto profil baru dipilih.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast?.('Nama lengkap wajib diisi.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateUserProfile({ name: name.trim(), avatar_url: avatarUrl });
      setUser(updated);
      onShowToast?.('Informasi akun berhasil disimpan.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan.';
      onShowToast?.(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || 'Reza Pratama');
    setEmail(user.email || 'reza.pratama@email.com');
    setBirthDate('15 Agustus 2003');
    setGender('Laki-laki');
    setPhone('+62 812 3456 7890');
    setCalYear(2003);
    setCalMonth(7);
    setCalDay(15);
    setAvatarUrl(user.avatar_url || '');
    onShowToast?.('Perubahan dibatalkan.', 'info');
  };

  const handleLogout = () => {
    clearAuth();
    onShowToast?.('Berhasil keluar dari akun.', 'success');
    if (onNavigateHome) onNavigateHome();
    else window.location.hash = '#beranda-customer';
  };

  // Calendar calculations
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    setCalDay(day);
    const formatted = `${day} ${MONTH_NAMES[calMonth]} ${calYear}`;
    setBirthDate(formatted);
    setIsCalendarOpen(false);
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col justify-between selection:bg-[#3c6a00]/20 selection:text-[#0b1510]">
      <CustomerHeader
        activeTab="beranda"
        onSelectTab={(tab) => {
          if (tab === 'beranda' && onNavigateHome) onNavigateHome();
          else if (tab === 'marketplace' && onNavigateMarketplace) onNavigateMarketplace();
        }}
        onNavigateSeller={onNavigateSeller}
        onNavigateOrders={onNavigateOrders}
        onShowToast={onShowToast}
      />

      {/* Main container with wide layout mepet ke kiri dan kanan */}
      <main className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 flex-1">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Kolom Kiri: Sidebar Card mepet ke sisi kiri */}
          <div className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-5">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/5 shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#f0eded] flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border border-gray-150">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400" aria-hidden="true">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-[#1b1c1c] truncate">{name}</span>
                <span className="text-xs text-gray-400 truncate mt-0.5">{email}</span>
              </div>
            </div>

            <nav className="bg-white rounded-2xl p-2.5 border border-black/5 shadow-2xs flex flex-col gap-1" aria-label="Menu Navigasi Akun">
              <button
                type="button"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-left bg-[#eef8ee] text-[#2d6a2e]"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Informasi Akun</span>
              </button>

              <button
                type="button"
                onClick={() => (onNavigateOrders ? onNavigateOrders() : (window.location.hash = '#riwayat-seller'))}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-black hover:bg-gray-50 text-left transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Riwayat Pesanan</span>
              </button>

              <button
                type="button"
                onClick={() => onShowToast?.('Fitur Keamanan Akun akan segera hadir.', 'info')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-black hover:bg-gray-50 text-left transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Keamanan Akun</span>
              </button>

              <div className="h-px bg-gray-100 my-1 mx-2" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 text-left transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Keluar dari Akun</span>
              </button>
            </nav>
          </div>

          {/* Kolom Kanan: Judul tepat di atas card form kanan, card membentang ke kanan */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1b1c1c] tracking-tight">
                Informasi Akun
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Kelola informasi pribadi dan preferensi akunmu.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-2xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#f0eded] flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border border-gray-200/80 shadow-2xs">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400" aria-hidden="true">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#1b1c1c] block">Foto Profil</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleAvatarFileChange}
                      aria-label="Upload Foto Profil"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-2xs transition-colors cursor-pointer"
                    >
                      Ubah Foto
                    </button>
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Format JPG atau PNG, maksimal 2MB.
                    </span>
                  </div>
                </div>

                {/* Box Informasi Akun */}
                <div className="bg-[#f4f3f0] border border-[#e6e4df] rounded-2xl p-4 sm:p-5 w-full sm:w-[360px] shrink-0 flex flex-col gap-2.5 shadow-2xs">
                  <span className="text-xs font-bold text-gray-800 block">Informasi Akun</span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <CheckCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Status Akun</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[11px] font-bold">
                      Aktif
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Tanggal Bergabung</span>
                    </span>
                    <span className="font-semibold text-gray-700">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-500 shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Lokasi Utama</span>
                    </span>
                    <span className="font-bold text-gray-900 text-right whitespace-nowrap ml-2">
                      Jl. Veteran No. 10, Merjosari
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="customer-nama" className="text-xs font-bold text-gray-700">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="customer-nama"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-black transition-colors shadow-2xs"
                    placeholder="Reza Pratama"
                    required
                  />
                </div>

                {/* Tanggal Lahir with interactive Calendar Popover (pilih Hari, Bulan, Tahun) */}
                <div className="flex flex-col gap-1.5 relative" ref={calendarContainerRef}>
                  <label htmlFor="customer-dob" className="text-xs font-bold text-gray-700">
                    Tanggal Lahir
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      id="customer-dob"
                      value={birthDate}
                      readOnly
                      onClick={() => setIsCalendarOpen((prev) => !prev)}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-black transition-colors shadow-2xs cursor-pointer select-none"
                      placeholder="Pilih Tanggal Lahir"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen((prev) => !prev)}
                      className="absolute right-3 p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                      aria-label="Buka Kalender"
                    >
                      <Calendar className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Calendar Popover */}
                  {isCalendarOpen && (
                    <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 z-40 w-full sm:w-80 p-4 bg-white rounded-2xl border border-gray-200 shadow-xl flex flex-col gap-3">
                      {/* Controls: Bulan & Tahun */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                          aria-label="Bulan Sebelumnya"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5 flex-1 justify-center">
                          {/* Pilih Bulan */}
                          <select
                            value={calMonth}
                            onChange={(e) => setCalMonth(Number(e.target.value))}
                            className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-800 cursor-pointer focus:outline-black"
                          >
                            {MONTH_NAMES.map((m, idx) => (
                              <option key={m} value={idx}>
                                {m}
                              </option>
                            ))}
                          </select>

                          {/* Pilih Tahun */}
                          <select
                            value={calYear}
                            onChange={(e) => setCalYear(Number(e.target.value))}
                            className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-800 cursor-pointer focus:outline-black"
                          >
                            {YEARS.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                          aria-label="Bulan Berikutnya"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Header Hari */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400">
                        <span>Min</span>
                        <span>Sen</span>
                        <span>Sel</span>
                        <span>Rab</span>
                        <span>Kam</span>
                        <span>Jum</span>
                        <span>Sab</span>
                      </div>

                      {/* Grid Tanggal */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-8 w-8" />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                          const isSelected = d === calDay;
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => handleSelectDay(d)}
                              className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#1e2420] text-white shadow-xs'
                                  : 'text-gray-700 hover:bg-[#eef8ee] hover:text-[#2d6a2e]'
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email: Read-only & disabled (tidak dapat diubah, terikat ke login) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="customer-email" className="text-xs font-bold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="customer-email"
                    value={email}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-500 cursor-not-allowed shadow-2xs select-none"
                    placeholder="reza.pratama@email.com"
                  />
                </div>

                {/* Jenis Kelamin: Pilihan Laki-laki & Perempuan */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="customer-gender" className="text-xs font-bold text-gray-700">
                    Jenis Kelamin
                  </label>
                  <div className="relative flex items-center">
                    <select
                      id="customer-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-black transition-colors shadow-2xs appearance-none cursor-pointer"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="customer-phone" className="text-xs font-bold text-gray-700">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    id="customer-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-black transition-colors shadow-2xs"
                    placeholder="+62 812 3456 7890"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-bold text-gray-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#1e2420] hover:bg-black text-white text-sm font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter onNavigateSeller={onNavigateSeller} />
    </div>
  );
}
