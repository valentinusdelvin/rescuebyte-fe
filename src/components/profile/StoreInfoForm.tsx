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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    <div className="profile-outline-card">
      <h2 className="card-outline-title">Informasi Toko</h2>

      <form id="form-info-toko" className="store-info-form" onSubmit={handleSubmit} noValidate>
        {/* Avatar & Store Name Row */}
        <div className="form-avatar-name-row">
          <div className="avatar-upload-block">
            <div className="store-avatar-circle" id="store-avatar-preview">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Logo Toko"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l2-5h14l2 5" />
                  <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
                  <path d="M9 22V12h6v10" />
                  <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
                </svg>
              )}
              <div className="avatar-badge-upload">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
            </div>

            <label htmlFor="store-logo-file" className="btn-ubah-logo" role="button" tabIndex={0}>
              Ubah Logo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="store-logo-file"
              accept="image/*"
              className="visually-hidden"
              aria-label="Upload logo toko"
              onChange={handleLogoUpload}
            />
          </div>

          <div className="form-group flex-grow">
            <label htmlFor="nama-toko" className="field-label">Nama Toko</label>
            <input
              type="text"
              id="nama-toko"
              name="namaToko"
              className="outline-input"
              value={storeName}
              required
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
        </div>

        {/* Deskripsi Toko */}
        <div className="form-group">
          <label htmlFor="deskripsi-toko" className="field-label">Deskripsi Toko</label>
          <textarea
            id="deskripsi-toko"
            name="deskripsiToko"
            className="outline-textarea"
            rows={4}
            value={storeDesc}
            onChange={(e) => setStoreDesc(e.target.value)}
          />
        </div>

        {/* WhatsApp & Email Row */}
        <div className="form-row-two-col">
          <div className="form-group">
            <label htmlFor="wa-toko" className="field-label">Nomor WhatsApp</label>
            <input
              type="tel"
              id="wa-toko"
              name="nomorWa"
              className="outline-input"
              value={storeWa}
              required
              onChange={(e) => setStoreWa(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email-toko" className="field-label">Email Toko</label>
            <input
              type="email"
              id="email-toko"
              name="emailToko"
              className="outline-input"
              value={storeEmail}
              required
              onChange={(e) => setStoreEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Alamat Toko (OSM Live Search) */}
        <div className="form-group position-relative" id="alamat-search-group">
          <div className="field-label-row">
            <label htmlFor="alamat-toko" className="field-label">Alamat Toko</label>
            <span className="field-badge-osm" title="Pencarian terhubung dengan OpenStreetMap">OSM Live Search</span>
          </div>
          <div className="search-input-wrapper">
            <span className="search-input-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              id="alamat-toko"
              name="alamatToko"
              className="outline-input search-outline-input"
              value={addressValue}
              placeholder="Cari jalan, tempat, toko (misal: piaggone)..."
              autoComplete="off"
              required
              onChange={handleAddressInput}
            />
            {addressValue && (
              <button
                type="button"
                className="search-clear-btn"
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
            {isSearchingOSM && <div className="search-spinner" id="search-spinner" aria-hidden="true" />}
          </div>

          {/* Autocomplete Suggestions Dropdown for Alamat */}
          {showOsmDropdown && (
            <ul className="autocomplete-dropdown-list" id="alamat-suggestions-dropdown" role="listbox">
              {osmSuggestions.length === 0 ? (
                <li className="autocomplete-empty-state">
                  Tidak ada hasil ditemukan di OpenStreetMap untuk "{addressValue}"
                </li>
              ) : (
                osmSuggestions.map((item) => (
                  <li
                    key={`${item.title}-${item.lat}-${item.lng}`}
                    className="autocomplete-dropdown-item"
                    onClick={() => handleSelectOsmItem(item)}
                  >
                    <div className="autocomplete-item-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    </div>
                    <div className="autocomplete-item-content">
                      <span className="autocomplete-item-title">{item.title}</span>
                      <span className="autocomplete-item-sub">{item.subtitle}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Kota & Kecamatan Cascading Autocomplete */}
        <div className="form-row-two-col">
          <div className="form-group position-relative" id="kota-input-group">
            <label htmlFor="kota-toko" className="field-label">Kota</label>
            <div className="autocomplete-input-wrapper">
              <input
                type="text"
                id="kota-toko"
                name="kotaToko"
                className="outline-input"
                value={cityValue}
                placeholder="Ketik nama kota (misal: M)..."
                autoComplete="off"
                required
                onFocus={handleKotaFocus}
                onChange={handleKotaInput}
              />
              <span className="dropdown-chevron-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>

            {showCityDropdown && (
              <ul className="autocomplete-dropdown-list" id="kota-suggestions-dropdown" role="listbox">
                {citySuggestions.length === 0 ? (
                  <li className="autocomplete-empty-state">Kota tidak ditemukan</li>
                ) : (
                  citySuggestions.map((c) => (
                    <li
                      key={c.name}
                      className="autocomplete-dropdown-item"
                      onClick={() => handleSelectKota(c)}
                    >
                      <div className="autocomplete-item-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                      <div className="autocomplete-item-content">
                        <span className="autocomplete-item-title">{c.name}</span>
                        <span className="autocomplete-item-sub">{c.province} &bull; {c.kecamatans.length} Kecamatan</span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="form-group position-relative" id="kecamatan-input-group">
            <label htmlFor="kecamatan-toko" className="field-label">Kecamatan</label>
            <div className="autocomplete-input-wrapper">
              <input
                type="text"
                id="kecamatan-toko"
                name="kecamatanToko"
                className="outline-input"
                value={districtValue}
                placeholder="Pilih kecamatan..."
                autoComplete="off"
                required
                onFocus={handleDistrictFocus}
                onChange={handleDistrictInput}
              />
              <span className="dropdown-chevron-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>

            {showDistrictDropdown && (
              <ul className="autocomplete-dropdown-list" id="kecamatan-suggestions-dropdown" role="listbox">
                {districtSuggestions.length === 0 ? (
                  <li className="autocomplete-empty-state">
                    {!cityValue ? 'Pilih kota terlebih dahulu' : 'Kecamatan tidak ditemukan'}
                  </li>
                ) : (
                  districtSuggestions.map((k) => (
                    <li
                      key={`${k.name}-${k.lat}`}
                      className="autocomplete-dropdown-item"
                      onClick={() => handleSelectDistrict(k)}
                    >
                      <div className="autocomplete-item-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div className="autocomplete-item-content">
                        <span className="autocomplete-item-title">Kecamatan {k.name}</span>
                        <span className="autocomplete-item-sub">{cityValue || 'Indonesia'}</span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save-primary" id="btn-save-profile">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
