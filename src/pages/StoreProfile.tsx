import React, { useState, useEffect } from 'react';
import { StoreInfoForm } from '../components/seller/StoreInfoForm';
import { OperationalCard } from '../components/seller/OperationalCard';
import { StoreLocationMap } from '../components/seller/StoreLocationMap';
import { StoreLocation, Coordinates, DaysSchedule, DayKey } from '../types';
import {
  getStoreProfile,
  updateStoreProfile,
  updateStoreOperational,
  toggleStoreStatus,
  createStore,
} from '../services/storeService';
import { getCurrentUser } from '../services/authService';
import { toIndoTime, toApiTime, isValidTimeFormat } from '../utils/time';

const DEFAULT_COORDS: StoreLocation = {
  lat: -7.9526,
  lng: 112.6146,
  address: 'Jl. Veteran No. 10, Merjosari',
  city: 'Kota Malang',
  district: 'Lowokwaru',
};

const DEFAULT_DAYS: DaysSchedule = {
  senin: true,
  selasa: true,
  rabu: true,
  kamis: true,
  jumat: true,
  sabtu: true,
  minggu: true,
};

export interface StoreProfileProps {
  storeName: string;
  onStoreNameChange?: (name: string) => void;
  onShowToast?: (message: string) => void;
  onTriggerLoading?: (title?: string, subtitle?: string, durationMs?: number) => Promise<void>;
}

/**
 * StoreProfile Page View
 * Connects seller store profile to backend endpoint /api/v1/stores/me/profile.
 * Composes StoreInfoForm on the left, and OperationalCard + StoreLocationMap on the right.
 * Complies with .agents/docs/architecture.md, .agents/docs/typescript.md, and .agents/docs/styling.md.
 */
export function StoreProfile({
  storeName,
  onStoreNameChange,
  onShowToast,
  onTriggerLoading,
}: StoreProfileProps) {
  const [hasExistingStore, setHasExistingStore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>(() => storeName || 'Toko Reza');
  const [description, setDescription] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('+62812345678');
  const [email, setStoreEmail] = useState<string>('TokoReza@gmail.com');
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('rescuebyte_store_logo') || '';
    } catch {
      return '';
    }
  });

  // Location Fields
  const [coordinates, setCoordinates] = useState<Coordinates>(() => {
    try {
      const savedCoords = localStorage.getItem('rescuebyte_store_coordinates');
      if (savedCoords) {
        const parsed = JSON.parse(savedCoords) as Coordinates;
        if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') return parsed;
      }
    } catch {}
    return DEFAULT_COORDS;
  });

  const [addressValue, setAddressValue] = useState<string>(() => {
    try {
      return localStorage.getItem('rescuebyte_store_address') || DEFAULT_COORDS.address;
    } catch {
      return DEFAULT_COORDS.address;
    }
  });

  const [cityValue, setCityValue] = useState<string>(DEFAULT_COORDS.city);
  const [districtValue, setDistrictValue] = useState<string>(DEFAULT_COORDS.district);

  // Operational Fields
  const [isActive, setIsActive] = useState<boolean>(true);
  const [jamBuka, setJamBuka] = useState<string>('08.00');
  const [jamTutup, setJamTutup] = useState<string>('22.00');
  const [days, setDays] = useState<DaysSchedule>(DEFAULT_DAYS);
  const [isSavingOperational, setIsSavingOperational] = useState<boolean>(false);

  // Fetch current store profile from /api/v1/stores/me/profile on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getStoreProfile()
      .then((store) => {
        if (!isMounted) return;
        setHasExistingStore(true);
        if (store.name) {
          setName(store.name);
          onStoreNameChange?.(store.name);
          localStorage.setItem('rescuebyte_store_name', store.name);
        }
        if (store.description !== undefined) setDescription(store.description);
        if (store.whatsapp_number) setWhatsapp(store.whatsapp_number);
        if (store.email) setStoreEmail(store.email);
        if (store.profile_picture_url) {
          setAvatarUrl(store.profile_picture_url);
          localStorage.setItem('rescuebyte_store_logo', store.profile_picture_url);
        }
        if (store.address) {
          setAddressValue(store.address);
          localStorage.setItem('rescuebyte_store_address', store.address);
        }
        if (store.city) setCityValue(store.city);
        if (store.district) setDistrictValue(store.district);
        if (typeof store.latitude === 'number' && typeof store.longitude === 'number') {
          const coords = { lat: store.latitude, lng: store.longitude };
          setCoordinates(coords);
          localStorage.setItem('rescuebyte_store_coordinates', JSON.stringify(coords));
        }
        if (store.status) {
          setIsActive(store.status.toUpperCase() === 'ACTIVE');
        }
        if (store.operational_start) {
          setJamBuka(toIndoTime(store.operational_start));
        }
        if (store.operational_end) {
          setJamTutup(toIndoTime(store.operational_end));
        }
        if (Array.isArray(store.operational_days) && store.operational_days.length > 0) {
          const daysObj: DaysSchedule = {
            senin: store.operational_days.includes(1),
            selasa: store.operational_days.includes(2),
            rabu: store.operational_days.includes(3),
            kamis: store.operational_days.includes(4),
            jumat: store.operational_days.includes(5),
            sabtu: store.operational_days.includes(6),
            minggu: store.operational_days.includes(7) || store.operational_days.includes(0),
          };
          setDays(daysObj);
        }
      })
      .catch((_err) => {
        // If 404 (store not registered yet), fallback to user defaults
        if (isMounted) {
          setHasExistingStore(false);
          const currentUser = getCurrentUser();
          if (currentUser) {
            if (currentUser.email) setStoreEmail(currentUser.email);
            if (currentUser.name && !name) setName(currentUser.name);
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  };

  const handleLocationUpdateFromMap = (locationData: Partial<StoreLocation> & Coordinates) => {
    setCoordinates({ lat: locationData.lat, lng: locationData.lng });
    if (locationData.address) {
      setAddressValue(locationData.address);
    }
    if (locationData.city) {
      setCityValue(locationData.city);
    }
    if (locationData.district) {
      setDistrictValue(locationData.district);
    }
  };

  const handleDayToggle = (dayKey: DayKey) => {
    setDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  const handleActiveToggle = async (active: boolean) => {
    setIsActive(active);
    if (hasExistingStore) {
      try {
        await toggleStoreStatus();
      } catch (err) {
        console.warn('Failed to toggle status remotely:', err);
      }
    }
  };

  const handleSaveOperational = async () => {
    if (!isValidTimeFormat(jamBuka) || !isValidTimeFormat(jamTutup)) {
      onShowToast?.('Hanya bisa memasukkan jam 00.00 - 23.59');
      return;
    }

    const opDaysList: number[] = [];
    if (days.senin) opDaysList.push(1);
    if (days.selasa) opDaysList.push(2);
    if (days.rabu) opDaysList.push(3);
    if (days.kamis) opDaysList.push(4);
    if (days.jumat) opDaysList.push(5);
    if (days.sabtu) opDaysList.push(6);
    if (days.minggu) opDaysList.push(7);
    if (opDaysList.length === 0) {
      opDaysList.push(1);
    }

    setIsSavingOperational(true);
    try {
      if (hasExistingStore) {
        await updateStoreOperational({
          status: isActive ? 'ACTIVE' : 'INACTIVE',
          operational_start: toApiTime(jamBuka),
          operational_end: toApiTime(jamTutup),
          operational_days: opDaysList,
        });
        onShowToast?.('Informasi operasional berhasil disimpan!');
      } else {
        onShowToast?.('Silakan simpan profil toko terlebih dahulu.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan operasional toko.';
      onShowToast?.(msg);
    } finally {
      setIsSavingOperational(false);
    }
  };

  const handleLogoChange = async (newUrl: string) => {
    setAvatarUrl(newUrl);
    try {
      localStorage.setItem('rescuebyte_store_logo', newUrl);
      window.dispatchEvent(new Event('rescuebyte_store_updated'));
    } catch {}

    if (hasExistingStore) {
      try {
        await updateStoreProfile({
          name: name.trim(),
          description: description.trim(),
          whatsapp_number: whatsapp.trim(),
          email: email.trim(),
          address: addressValue.trim(),
          city: cityValue.trim(),
          district: districtValue.trim(),
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          profile_picture_url: newUrl,
        });
        onShowToast?.('Logo toko berhasil disimpan!');
      } catch (err) {
        console.warn('Auto-save store logo error:', err);
      }
    }
  };

  // Submit and save profile + operational details to /api/v1/stores/me/profile
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast?.('Nama toko wajib diisi.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.trim().length < 8) {
      onShowToast?.('Nomor WhatsApp toko wajib diisi minimal 8 digit.');
      return;
    }
    if (!email.trim()) {
      onShowToast?.('Email toko wajib diisi.');
      return;
    }
    if (!addressValue.trim()) {
      onShowToast?.('Alamat toko wajib diisi.');
      return;
    }
    if (!cityValue.trim()) {
      onShowToast?.('Kota toko wajib diisi.');
      return;
    }
    if (!districtValue.trim()) {
      onShowToast?.('Kecamatan toko wajib diisi.');
      return;
    }
    if (!isValidTimeFormat(jamBuka) || !isValidTimeFormat(jamTutup)) {
      onShowToast?.('Hanya bisa memasukkan jam 00.00 - 23.59');
      return;
    }

    const opDaysList: number[] = [];
    if (days.senin) opDaysList.push(1);
    if (days.selasa) opDaysList.push(2);
    if (days.rabu) opDaysList.push(3);
    if (days.kamis) opDaysList.push(4);
    if (days.jumat) opDaysList.push(5);
    if (days.sabtu) opDaysList.push(6);
    if (days.minggu) opDaysList.push(7);
    if (opDaysList.length === 0) {
      opDaysList.push(1);
    }

    setIsSaving(true);
    try {
      if (hasExistingStore) {
        // 1. Update basic store profile via PUT /api/v1/stores/me/profile
        const updated = await updateStoreProfile({
          name: name.trim(),
          description: description.trim(),
          whatsapp_number: whatsapp.trim(),
          email: email.trim(),
          address: addressValue.trim(),
          city: cityValue.trim(),
          district: districtValue.trim(),
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          profile_picture_url: avatarUrl,
        });

        // 2. Update operational settings via PUT /api/v1/stores/me/operational
        try {
          await updateStoreOperational({
            status: isActive ? 'ACTIVE' : 'INACTIVE',
            operational_start: toApiTime(jamBuka),
            operational_end: toApiTime(jamTutup),
            operational_days: opDaysList,
          });
        } catch (opErr) {
          console.warn('Operational update non-fatal error:', opErr);
        }

        setName(updated.name);
        onStoreNameChange?.(updated.name);
        localStorage.setItem('rescuebyte_store_name', updated.name);
        localStorage.setItem('rescuebyte_store_address', updated.address);
        localStorage.setItem('rescuebyte_store_coordinates', JSON.stringify({ lat: updated.latitude, lng: updated.longitude }));
        if (avatarUrl) localStorage.setItem('rescuebyte_store_logo', avatarUrl);
        localStorage.setItem('rescuebyte_store_email', email);
        window.dispatchEvent(new Event('rescuebyte_store_updated'));

        onShowToast?.('Profil toko berhasil disimpan!');
      } else {
        // Create new store via POST /api/v1/stores
        const created = await createStore({
          name: name.trim(),
          description: description.trim(),
          whatsapp_number: whatsapp.trim(),
          email: email.trim(),
          address: addressValue.trim(),
          city: cityValue.trim(),
          district: districtValue.trim(),
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          profile_picture_url: avatarUrl,
          operational_start: toApiTime(jamBuka),
          operational_end: toApiTime(jamTutup),
          operational_days: opDaysList,
        });

        setHasExistingStore(true);
        setName(created.name);
        onStoreNameChange?.(created.name);
        localStorage.setItem('rescuebyte_store_name', created.name);
        localStorage.setItem('rescuebyte_store_address', created.address);
        localStorage.setItem('rescuebyte_store_coordinates', JSON.stringify({ lat: created.latitude, lng: created.longitude }));
        if (avatarUrl) localStorage.setItem('rescuebyte_store_logo', avatarUrl);

        onShowToast?.('Profil toko baru berhasil dibuat!');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan profil toko.';
      onShowToast?.(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-6" id="view-profil" aria-labelledby="heading-profil">
      <h1 className="sr-only" id="heading-profil">Pengaturan Profil {name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Informasi Toko Form */}
        <StoreInfoForm
          storeName={name}
          onStoreNameChange={setName}
          storeDesc={description}
          onStoreDescChange={setDescription}
          storeWa={whatsapp}
          onStoreWaChange={setWhatsapp}
          storeEmail={email}
          onStoreEmailChange={setStoreEmail}
          avatarUrl={avatarUrl}
          onAvatarUrlChange={handleLogoChange}
          currentCoordinates={coordinates}
          addressValue={addressValue}
          cityValue={cityValue}
          districtValue={districtValue}
          onAddressChange={setAddressValue}
          onCityChange={setCityValue}
          onDistrictChange={setDistrictValue}
          onCoordinatesChange={handleCoordinatesChange}
          onShowToast={onShowToast}
          onTriggerLoading={onTriggerLoading}
          onSubmit={handleSubmit}
          isSaving={isSaving}
          isLoading={isLoading}
        />

        {/* Right Column: Operasional & Peta Lokasi Toko */}
        <div className="flex flex-col gap-6">
          <OperationalCard
            isActive={isActive}
            onActiveChange={handleActiveToggle}
            jamBuka={jamBuka}
            onJamBukaChange={setJamBuka}
            jamTutup={jamTutup}
            onJamTutupChange={setJamTutup}
            days={days}
            onDayToggle={handleDayToggle}
            onShowToast={onShowToast}
            isLoading={isLoading}
            isSaving={isSavingOperational}
            onSave={handleSaveOperational}
          />

          <StoreLocationMap
            storeName={name}
            coordinates={coordinates}
            displayAddress={addressValue}
            onLocationChange={handleLocationUpdateFromMap}
            onShowToast={onShowToast}
          />
        </div>
      </div>
    </section>
  );
}
