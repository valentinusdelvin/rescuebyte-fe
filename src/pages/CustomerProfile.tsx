import React, { useState, useEffect } from 'react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CustomerProfileSidebar } from '../components/customer/CustomerProfileSidebar';
import { ProfileAvatar } from '../components/common/ProfileAvatar';
import { AccountInfoCard } from '../components/customer/AccountInfoCard';
import { CustomerProfileForm } from '../components/customer/CustomerProfileForm';
import { getCurrentUser, clearAuth, logoutUser } from '../services/authService';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { getTodayFormatted, parseIsoToIndonesianDate, parseIndonesianDateToIso } from '../utils/date';
import { UserPayload } from '../types';

export interface CustomerProfileProps {
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateSeller?: () => void;
  onNavigateOrders?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const EMPTY_USER: UserPayload = {
  id: '',
  name: '',
  email: '',
  avatar_url: '',
  provider: 'LOCAL',
  role: 'Customer',
  role_id: 1,
  created_at: '',
  updated_at: '',
};

export function CustomerProfile({
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateSeller,
  onNavigateOrders,
  onShowToast,
}: CustomerProfileProps) {
  const [user, setUser] = useState<UserPayload>(() => getCurrentUser() || EMPTY_USER);
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [birthDate, setBirthDate] = useState(() =>
    user.date_of_birth ? parseIsoToIndonesianDate(user.date_of_birth) : getTodayFormatted()
  );
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>(() =>
    user.gender === 2 || user.gender_name?.toLowerCase() === 'perempuan' ? 'Perempuan' : 'Laki-laki'
  );
  const [phone, setPhone] = useState(user.phone_number || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then((profile) => {
        setUser(profile);
        setName(profile.name || '');
        setEmail(profile.email || '');
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        if (profile.phone_number) setPhone(profile.phone_number);
        if (profile.date_of_birth) {
          setBirthDate(parseIsoToIndonesianDate(profile.date_of_birth));
        }
        if (profile.gender === 2 || profile.gender_name?.toLowerCase() === 'perempuan') {
          setGender('Perempuan');
        } else if (profile.gender === 1 || profile.gender_name?.toLowerCase() === 'laki-laki') {
          setGender('Laki-laki');
        }
      })
      .catch(() => {});
  }, []);

  const handleAvatarChange = async (newUrl: string) => {
    setAvatarUrl(newUrl);
    try {
      const genderCode = gender === 'Perempuan' ? 2 : 1;
      const isoBirthDate = parseIndonesianDateToIso(birthDate);

      const updated = await updateUserProfile({
        name: name.trim() || user.name || 'Pengguna',
        avatar_url: newUrl,
        phone_number: phone.trim() || user.phone_number,
        date_of_birth: isoBirthDate || user.date_of_birth,
        gender: genderCode,
      });
      setUser(updated);
      onShowToast?.('Foto profil berhasil diperbarui.', 'success');
    } catch (err) {
      setAvatarUrl(user.avatar_url || '');
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan foto profil.';
      onShowToast?.(msg, 'error');
      throw err;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast?.('Nama lengkap wajib diisi.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const genderCode = gender === 'Perempuan' ? 2 : 1;
      const isoBirthDate = parseIndonesianDateToIso(birthDate);

      const updated = await updateUserProfile({
        name: name.trim(),
        avatar_url: avatarUrl,
        phone_number: phone.trim(),
        date_of_birth: isoBirthDate,
        gender: genderCode,
      });
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
    setName(user.name || '');
    setEmail(user.email || '');
    setBirthDate(user.date_of_birth ? parseIsoToIndonesianDate(user.date_of_birth) : getTodayFormatted());
    setGender(user.gender === 2 || user.gender_name?.toLowerCase() === 'perempuan' ? 'Perempuan' : 'Laki-laki');
    setPhone(user.phone_number || '');
    setAvatarUrl(user.avatar_url || '');
    onShowToast?.('Perubahan dibatalkan.', 'info');
  };

  const handleLogout = async () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.hash = '#beranda-customer';
    }
    try {
      await logoutUser();
      onShowToast?.('Berhasil keluar dari akun.', 'success');
    } catch {
      clearAuth();
      onShowToast?.('Berhasil keluar.', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col justify-between selection:bg-brand-green/20 selection:text-[#0b1510]">
      <CustomerHeader
        activeTab="profile"
        currentUser={user}
        onNavigateHome={onNavigateHome}
        onSelectTab={(tab) => {
          if (tab === 'beranda') {
            if (onNavigateHome) onNavigateHome();
            else window.location.hash = '#beranda-customer';
          } else if (tab === 'marketplace') {
            if (onNavigateMarketplace) onNavigateMarketplace();
            else window.location.hash = '#marketplace';
          } else if (tab === 'kontak') {
            window.location.hash = '#kontak';
          }
        }}
        onNavigateSeller={onNavigateSeller}
        onNavigateOrders={onNavigateOrders}
        onShowToast={onShowToast}
      />

      <main className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 flex-1">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <CustomerProfileSidebar
            name={name}
            email={email}
            avatarUrl={avatarUrl}
            onNavigateOrders={onNavigateOrders}
            onLogout={handleLogout}
            onShowToast={onShowToast}
          />

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
                <ProfileAvatar
                  name={name}
                  avatarUrl={avatarUrl}
                  onAvatarChange={handleAvatarChange}
                  onUploadingChange={setIsUploadingAvatar}
                  onShowToast={onShowToast}
                />

                <AccountInfoCard
                  createdAt={user.created_at}
                  onShowToast={onShowToast}
                />
              </div>

              <CustomerProfileForm
                name={name}
                setName={setName}
                birthDate={birthDate}
                setBirthDate={setBirthDate}
                email={email}
                gender={gender}
                setGender={setGender}
                phone={phone}
                setPhone={setPhone}
                isSaving={isSaving || isUploadingAvatar}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter variant="compact" onNavigateSeller={onNavigateSeller} />
    </div>
  );
}
