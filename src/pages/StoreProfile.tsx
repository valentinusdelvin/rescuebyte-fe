import { useState } from 'react';
import { StoreInfoForm } from '../components/profile/StoreInfoForm';
import { OperationalCard } from '../components/profile/OperationalCard';
import { StoreLocationMap } from '../components/profile/StoreLocationMap';
import { StoreLocation, Coordinates } from '../types';

const DEFAULT_COORDS: StoreLocation = {
  lat: -7.9526,
  lng: 112.6146,
  address: 'Jl. Veteran No. 10, Merjosari',
  city: 'Kota Malang',
  district: 'Lowokwaru',
};

export interface StoreProfileProps {
  storeName: string;
  onStoreNameChange?: (name: string) => void;
  onShowToast?: (message: string) => void;
}

/**
 * StoreProfile Page View
 * Composes StoreInfoForm on the left, and OperationalCard + StoreLocationMap on the right.
 * Complies with .agents/docs/architecture.md and .agents/docs/typescript.md.
 */
export function StoreProfile({ storeName, onStoreNameChange, onShowToast }: StoreProfileProps) {
  const [coordinates, setCoordinates] = useState<Coordinates>(() => {
    try {
      const savedCoords = localStorage.getItem('rescuebyte_store_coordinates');
      if (savedCoords) {
        const parsed = JSON.parse(savedCoords) as Coordinates;
        if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') return parsed;
      }
    } catch {
      // fallback
    }
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

  return (
    <section className="page-view active" id="view-profil" aria-labelledby="heading-profil">
      <h1 className="visually-hidden" id="heading-profil">Pengaturan Profil {storeName}</h1>

      <div className="profile-layout-grid">
        {/* Left Column: Informasi Toko Form */}
        <StoreInfoForm
          initialName={storeName}
          currentCoordinates={coordinates}
          addressValue={addressValue}
          cityValue={cityValue}
          districtValue={districtValue}
          onAddressChange={setAddressValue}
          onCityChange={setCityValue}
          onDistrictChange={setDistrictValue}
          onCoordinatesChange={handleCoordinatesChange}
          onStoreNameChange={onStoreNameChange}
          onShowToast={onShowToast}
        />

        {/* Right Column: Operasional & Peta Lokasi Toko */}
        <div className="profile-right-column">
          <OperationalCard onShowToast={onShowToast} />

          <StoreLocationMap
            storeName={storeName}
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
