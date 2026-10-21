import React, { useState, useEffect, useRef } from 'react';
import {
  searchCities,
  getKecamatansForCity,
  searchOpenStreetMap,
  CityItem,
  KecamatanItem,
  OSMSearchResult,
} from '../../services/locationService';
import { Coordinates } from '../../types';

export interface StoreInfoFormProps {
  initialName?: string;
  currentCoordinates: Coordinates;
  addressValue: string;
  cityValue: string;
  districtValue: string;
  onAddressChange: (val: string) => void;
  onCityChange: (val: string) => void;
  onDistrictChange: (val: string) => void;
  onCoordinatesChange: (lat: number, lng: number, zoom?: number) => void;
  onStoreNameChange?: (name: string) => void;
  onShowToast?: (message: string) => void;
  onTriggerLoading?: (title?: string, subtitle?: string, durationMs?: number) => Promise<void>;
}

/**
 * StoreInfoForm Component
 * Manages store branding, contact info, and cascading location search (OSM, Kota, Kecamatan).
 * Complies with .agents/docs/architecture.md, .agents/docs/typescript.md, and .agents/docs/security.md.
 */
export function StoreInfoForm({
  initialName = 'Toko Reza',
  currentCoordinates,
  addressValue,
  cityValue,
  districtValue,
  onAddressChange,
  onCityChange,
  onDistrictChange,
  onCoordinatesChange,
  onStoreNameChange,
  onShowToast,
  onTriggerLoading,
}: StoreInfoFormProps) {
  const [storeName, setStoreName] = useState<string>(initialName);
  const [storeDesc, setStoreDesc] = useState<string>(
    'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et',
  );
  const [storeWa, setStoreWa] = useState<string>('+62812345678');
  const [storeEmail, setStoreEmail] = useState<string>('TokoReza@gmail.com');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Autocomplete UI states
  const [isSearchingOSM, setIsSearchingOSM] = useState<boolean>(false);
  const [osmSuggestions, setOsmSuggestions] = useState<OSMSearchResult[]>([]);
  const [showOsmDropdown, setShowOsmDropdown] = useState<boolean>(false);

  const [citySuggestions, setCitySuggestions] = useState<CityItem[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);

  const [districtSuggestions, setDistrictSuggestions] = useState<KecamatanItem[]>([]);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState<boolean>(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('#alamat-search-group')) {
        setShowOsmDropdown(false);
      }
      if (!target.closest('#kota-input-group')) {
        setShowCityDropdown(false);
      }
      if (!target.closest('#kecamatan-input-group')) {
        setShowDistrictDropdown(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
          if (onShowToast) onShowToast('Foto logo toko berhasil diperbarui!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Alamat OSM Live Search
  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onAddressChange(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query || query.trim().length < 2) {
      setShowOsmDropdown(false);
      setIsSearchingOSM(false);
      return;
    }

    setIsSearchingOSM(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchOpenStreetMap(query, currentCoordinates);
        setIsSearchingOSM(false);
        setOsmSuggestions(results || []);
        setShowOsmDropdown(true);
      } catch (err) {
        console.error('OSM Search failed:', err);
        setIsSearchingOSM(false);
      }
    }, 300);
  };

  const handleSelectOsmItem = (item: OSMSearchResult) => {
    const selectedStreet = item.street || item.title;
    onAddressChange(selectedStreet);
    if (item.city) onCityChange(item.city);
    if (item.district) onDistrictChange(item.district);

    onCoordinatesChange(item.lat, item.lng, 17);
    setShowOsmDropdown(false);

    if (onShowToast) onShowToast(`Titik peta disesuaikan: ${item.title}`);
  };

  const handleClearAddress = () => {
    onAddressChange('');
    setShowOsmDropdown(false);
  };

  // 2. Kota Autocomplete
  const handleKotaFocus = () => {
    const cities = searchCities(cityValue || '');
    setCitySuggestions(cities);
    setShowCityDropdown(true);
  };

  const handleKotaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onCityChange(val);
    const cities = searchCities(val);
    setCitySuggestions(cities);
    setShowCityDropdown(true);
  };

  const handleSelectKota = (city: CityItem) => {
    onCityChange(city.name);
    setShowCityDropdown(false);

    if (city.kecamatans && city.kecamatans.length > 0) {
      onDistrictChange(city.kecamatans[0].name);
    }

    onCoordinatesChange(city.lat, city.lng, 14);
    if (onShowToast) onShowToast(`Kota dipilih: ${city.name}`);
  };

  // 3. Kecamatan Autocomplete
  const handleDistrictFocus = () => {
    const allKec = getKecamatansForCity(cityValue || '');
    setDistrictSuggestions(allKec);
    setShowDistrictDropdown(true);
  };

  const handleDistrictInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onDistrictChange(val);
    const allKec = getKecamatansForCity(cityValue || '');
    const filtered = val ? allKec.filter((k) => k.name.toLowerCase().includes(val.toLowerCase())) : allKec;
    setDistrictSuggestions(filtered);
    setShowDistrictDropdown(true);
  };

  const handleSelectDistrict = (district: KecamatanItem) => {
    onDistrictChange(district.name);
    setShowDistrictDropdown(false);

    onCoordinatesChange(district.lat, district.lng, 15);
    if (onShowToast) onShowToast(`Kecamatan dipilih: ${district.name}`);
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (onTriggerLoading) {
      await onTriggerLoading(
        'Menyimpan Profil Toko...',
        'Sinkronisasi informasi toko dan lokasi operasional',
        1000
      );
    }

    if (onStoreNameChange) {
      onStoreNameChange(storeName);
    }

    try {
      localStorage.setItem('rescuebyte_store_coordinates', JSON.stringify(currentCoordinates));
      localStorage.setItem('rescuebyte_store_name', storeName);
      localStorage.setItem('rescuebyte_store_address', addressValue);
    } catch (err) {
      console.warn('Failed saving to localStorage', err);
    }

    if (onShowToast) onShowToast('Informasi profil dan lokasi toko berhasil disimpan!');
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-100/60 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-black font-display">Informasi Toko</h2>

      <form id="form-info-toko" className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {/* Avatar & Store Name Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <label
              htmlFor="store-logo-file"
              className="relative w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center bg-[#c6ea8d] overflow-hidden cursor-pointer transition-transform hover:scale-105 shrink-0"
              id="store-avatar-preview"
              tabIndex={0}
              role="button"
              aria-label="Upload logo toko"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Logo Toko"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l2-5h14l2 5" />
                  <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
                  <path d="M9 22V12h6v10" />
                  <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
                </svg>
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white shadow-md border border-gray-300 flex items-center justify-center" title="Pilih foto untuk logo toko">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
            </label>

            <label
              htmlFor="store-logo-file"
              className="px-3 py-1.5 text-xs font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-xl cursor-pointer transition-colors select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              Ubah Logo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="store-logo-file"
              accept="image/*"
              className="sr-only"
              aria-label="Upload logo toko"
              onChange={handleLogoUpload}
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1 w-full">
            <label htmlFor="nama-toko" className="text-sm font-bold text-black font-display">Nama Toko</label>
            <input
              type="text"
              id="nama-toko"
              name="namaToko"
              className="w-full px-4 py-3 rounded-2xl border border-gray-700 bg-white text-sm font-semibold text-black placeholder:text-gray-400 focus:outline-black focus:border-black transition-colors"
              value={storeName}
              required
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
        </div>

        {/* Deskripsi Toko */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="deskripsi-toko" className="text-sm font-bold text-black font-display">Deskripsi Toko</label>
          <textarea
            id="deskripsi-toko"
            name="deskripsiToko"
            className="w-full px-4 py-3 rounded-2xl border border-gray-700 bg-white text-sm text-black placeholder:text-gray-400 focus:outline-black focus:border-black transition-colors resize-none leading-relaxed"
            rows={4}
            value={storeDesc}
            onChange={(e) => setStoreDesc(e.target.value)}
          />
        </div>

        {/* WhatsApp & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="wa-toko" className="text-sm font-bold text-black font-display">Nomor WhatsApp</label>
            <input
              type="tel"
              id="wa-toko"
              name="nomorWa"
              className="w-full px-4 py-3 rounded-2xl border border-gray-700 bg-white text-sm font-semibold text-black placeholder:text-gray-400 focus:outline-black focus:border-black transition-colors"
              value={storeWa}
              required
              onChange={(e) => setStoreWa(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email-toko" className="text-sm font-bold text-black font-display">Email Toko</label>
            <input
              type="email"
              id="email-toko"
              name="emailToko"
              className="w-full px-4 py-3 rounded-2xl border border-gray-700 bg-white text-sm font-semibold text-black placeholder:text-gray-400 focus:outline-black focus:border-black transition-colors"
              value={storeEmail}
              required
              onChange={(e) => setStoreEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Alamat Toko */}
        <div className="flex flex-col gap-1.5 relative" id="alamat-search-group">
          <label htmlFor="alamat-toko" className="text-sm font-bold text-black font-display">Alamat Toko</label>
          <div className="relative flex items-center">
            <input
              type="text"
              id="alamat-toko"
              name="alamatToko"
              className="w-full px-4 pr-10 py-3 rounded-2xl border border-gray-700 bg-white text-sm font-semibold text-black placeholder:text-gray-400 focus:outline-black focus:border-black transition-colors"
              value={addressValue}
              placeholder="Cari jalan, tempat, toko (misal: Jl. Veteran)..."
              autoComplete="off"
              required
              onChange={handleAddressInput}
            />
            {addressValue && (
              <button
                type="button"
                className="absolute right-3.5 p-1 text-gray-400 hover:text-black cursor-pointer"
                id="btn-clear-alamat"
                aria-label="Hapus pencarian alamat"
                onClick={handleClearAddress}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            {isSearchingOSM && <div className="absolute right-3.5 w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" id="search-spinner" aria-hidden="true" />}
          </div>

          {/* Autocomplete Suggestions Dropdown for Alamat */}
          {showOsmDropdown && (
            <ul className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-40 p-1.5 flex flex-col gap-0.5" id="alamat-suggestions-dropdown" role="listbox">
              {osmSuggestions.length === 0 ? (
                <li className="p-3 text-xs text-gray-500 text-center">
                  Tidak ada hasil ditemukan di OpenStreetMap untuk "{addressValue}"
                </li>
              ) : (
                osmSuggestions.map((item) => (
                  <li
                    key={`${item.title}-${item.lat}-${item.lng}`}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-100 text-left transition-colors cursor-pointer select-none"
                    onClick={() => handleSelectOsmItem(item)}
                  >
                    <div className="text-black mt-0.5 shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-gray-900 truncate">{item.title}</span>
                      <span className="text-[11px] text-gray-500 truncate">{item.subtitle}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Kota & Kecamatan Cascading Autocomplete */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 relative" id="kota-input-group">
            <label htmlFor="kota-toko" className="text-sm font-bold text-black font-display">Kota</label>
            <div className="relative flex items-center">
              <input
                type="text"
                id="kota-toko"
                name="kotaToko"
                className="w-full px-4 py-3 pr-8 rounded-2xl border border-gray-700 bg-white text-sm font-semibold text-black placeholder:text-gray-400 focus:outline-black focus:border-black transition-colors"
                value={cityValue}
                placeholder="Ketik nama kota (misal: Malang)..."
                autoComplete="off"
                required
                onFocus={handleKotaFocus}
                onChange={handleKotaInput}
              />
              <span className="absolute right-3 pointer-events-none text-gray-500" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>

            {showCityDropdown && (
              <ul className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-40 p-1.5 flex flex-col gap-0.5" id="kota-suggestions-dropdown" role="listbox">
                {citySuggestions.length === 0 ? (
                  <li className="p-3 text-xs text-gray-500 text-center">Kota tidak ditemukan</li>
                ) : (
                  citySuggestions.map((c) => (
                    <li
                      key={c.name}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-100 text-left transition-colors cursor-pointer select-none"
                      onClick={() => handleSelectKota(c)}
                    >
                      <div className="text-black mt-0.5 shrink-0">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-gray-900 truncate">{c.name}</span>
                        <span className="text-[11px] text-gray-500 truncate">{c.province} &bull; {c.kecamatans.length} Kecamatan</span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-1.5 relative" id="kecamatan-input-group">
            <label htmlFor="kecamatan-toko" className="text-sm font-bold text-black font-display">Kecamatan</label>
            <div className="relative flex items-center">
              <input
                type="text"
                id="kecamatan-toko"
                name="kecamatanToko"
                className="w-full px-4 py-3 pr-8 rounded-2xl border border-gray-700 bg-white text-sm font-semibold text-black placeholder:text-gray-400 focus:outline-black focus:border-black transition-colors"
                value={districtValue}
                placeholder="Pilih kecamatan..."
                autoComplete="off"
                required
                onFocus={handleDistrictFocus}
                onChange={handleDistrictInput}
              />
              <span className="absolute right-3 pointer-events-none text-gray-500" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>

            {showDistrictDropdown && (
              <ul className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-40 p-1.5 flex flex-col gap-0.5" id="kecamatan-suggestions-dropdown" role="listbox">
                {districtSuggestions.length === 0 ? (
                  <li className="p-3 text-xs text-gray-500 text-center">
                    {!cityValue ? 'Pilih kota terlebih dahulu' : 'Kecamatan tidak ditemukan'}
                  </li>
                ) : (
                  districtSuggestions.map((k) => (
                    <li
                      key={`${k.name}-${k.lat}`}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-100 text-left transition-colors cursor-pointer select-none"
                      onClick={() => handleSelectDistrict(k)}
                    >
                      <div className="text-black mt-0.5 shrink-0">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-gray-900 truncate">Kecamatan {k.name}</span>
                        <span className="text-[11px] text-gray-500 truncate">{cityValue || 'Indonesia'}</span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-[#15803d] hover:bg-[#166534] active:scale-[0.98] text-white font-bold text-[0.98rem] shadow-sm transition-all cursor-pointer text-center"
            id="btn-save-profile"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
