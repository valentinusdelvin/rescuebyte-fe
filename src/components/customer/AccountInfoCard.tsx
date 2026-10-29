import { useState } from 'react';
import { CheckCircle, Calendar, MapPin, LocateFixed } from 'lucide-react';
import { formatDate } from '../../utils/date';
import { reverseGeocodeOSM } from '../../services/locationService';

export interface AccountInfoCardProps {
  createdAt?: string;
  location: string;
  onLocationChange: (newLocation: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function AccountInfoCard({
  createdAt,
  location,
  onLocationChange,
  onShowToast,
}: AccountInfoCardProps) {
  const [isLocating, setIsLocating] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      onShowToast?.('Geolocation tidak didukung pada browser ini.', 'warning');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const geo = await reverseGeocodeOSM(latitude, longitude);
          if (geo) {
            const detectedAddress = geo.street
              ? `${geo.street}${geo.suburb ? ', ' + geo.suburb : ''}`
              : geo.displayName.split(',').slice(0, 2).join(',');
            onLocationChange(detectedAddress);
            onShowToast?.(`Lokasi utama diperbarui: ${detectedAddress}`, 'success');
          } else {
            onShowToast?.('Gagal mendapatkan nama jalan dari koordinat GPS.', 'warning');
          }
        } catch {
          onShowToast?.('Terjadi kesalahan saat memproses data GPS.', 'error');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        onShowToast?.(`Akses GPS ditolak atau tidak aktif: ${err.message}`, 'warning');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="bg-[#f4f3f0] border border-[#e6e4df] rounded-2xl p-4 sm:p-5 w-full sm:w-[380px] shrink-0 flex flex-col gap-2.5 shadow-2xs">
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
          {formatDate(createdAt)}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs gap-2">
        <span className="flex items-center gap-1.5 text-gray-500 shrink-0">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Lokasi Utama</span>
        </span>
        <div className="flex items-center gap-1.5 min-w-0 justify-end">
          <span className="font-bold text-gray-900 text-right truncate">
            {location}
          </span>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="p-1 rounded-md bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-black transition-colors shrink-0 shadow-2xs cursor-pointer disabled:opacity-50"
            title="Deteksi Lokasi GPS Saat Ini"
            aria-label="Deteksi Lokasi GPS Saat Ini"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-[#3c6a00]' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
