import React, { useState } from 'react';
import { DayKey, DayItem, DaysSchedule } from '../../types';

export interface OperationalCardProps {
  onShowToast?: (message: string) => void;
}

const DAY_LIST: DayItem[] = [
  { key: 'senin', label: 'Senin' },
  { key: 'selasa', label: 'Selasa' },
  { key: 'rabu', label: 'Rabu' },
  { key: 'kamis', label: 'Kamis' },
  { key: 'jumat', label: 'Jumat' },
  { key: 'sabtu', label: 'Sabtu' },
  { key: 'minggu', label: 'Minggu' },
];

/**
 * OperationalCard Component
 * Manages store active status, operational hours, and working days.
 * Styled with Tailwind CSS classes.
 */
export function OperationalCard({ onShowToast }: OperationalCardProps) {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [jamBuka, setJamBuka] = useState<string>('08.00');
  const [jamTutup, setJamTutup] = useState<string>('08.00');
  const [days, setDays] = useState<DaysSchedule>({
    senin: true,
    selasa: true,
    rabu: true,
    kamis: true,
    jumat: true,
    sabtu: true,
    minggu: true,
  });

  const handleToggleStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsActive(checked);
    if (onShowToast) {
      onShowToast(checked ? 'Status toko diubah: Toko Aktif' : 'Status toko diubah: Toko Nonaktif');
    }
  };

  const handleDayChange = (dayKey: DayKey) => {
    setDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-100/60 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-black font-display">Informasi Operasional</h2>

      <div className="flex flex-col gap-6">
        {/* Status Toko Section */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-black">Status Toko</h3>
          <div className="flex items-center gap-4 py-1">
            <label className="relative inline-flex items-center cursor-pointer select-none" htmlFor="store-status-toggle">
              <input
                type="checkbox"
                id="store-status-toggle"
                className="sr-only peer"
                checked={isActive}
                onChange={handleToggleStatus}
              />
              <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-black" id="status-title-display">
                {isActive ? 'Toko Aktif' : 'Toko Nonaktif'}
              </span>
              <span className="text-xs text-gray-500" id="status-desc-display">
                {isActive
                  ? 'Toko akan terlihat di marketplace'
                  : 'Toko sementara disembunyikan dari marketplace'}
              </span>
            </div>
          </div>
        </div>

        {/* Jam Operasional Section */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-black font-display">Jam Operasional</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              id="jam-buka"
              className="w-full sm:w-36 text-center px-4 py-3 border border-gray-700 rounded-2xl font-bold text-black text-sm focus:outline-black focus:border-black bg-white"
              value={jamBuka}
              maxLength={5}
              aria-label="Jam Buka"
              onChange={(e) => setJamBuka(e.target.value)}
            />
            <span className="text-black font-extrabold text-lg" aria-hidden="true">-</span>
            <input
              type="text"
              id="jam-tutup"
              className="w-full sm:w-36 text-center px-4 py-3 border border-gray-700 rounded-2xl font-bold text-black text-sm focus:outline-black focus:border-black bg-white"
              value={jamTutup}
              maxLength={5}
              aria-label="Jam Tutup"
              onChange={(e) => setJamTutup(e.target.value)}
            />
          </div>
        </div>

        {/* Hari Operasional Section */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-black font-display">Hari Operasional</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4">
            {DAY_LIST.map(({ key, label }) => (
              <label
                key={key}
                htmlFor={`day-${key}`}
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  id={`day-${key}`}
                  className="sr-only"
                  checked={days[key]}
                  onChange={() => handleDayChange(key)}
                />
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                    days[key]
                      ? 'bg-black text-white'
                      : 'border-2 border-gray-400 bg-white text-transparent'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-sm font-bold text-black">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
