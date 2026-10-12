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
 * Complies with .agents/docs/architecture.md, .agents/docs/typescript.md, and .agents/docs/styling.md.
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

  const handleSaveOperational = () => {
    if (onShowToast) {
      onShowToast(`Jam operasional (${jamBuka} - ${jamTutup}) dan status aktif berhasil disimpan!`);
    }
  };

  return (
    <div className="profile-outline-card">
      <h2 className="card-outline-title">Informasi Operasional</h2>

      <div className="operational-content">
        {/* Status Toko Section */}
        <div className="operational-section">
          <h3 className="operational-section-title">Status Toko</h3>
          <div className="store-status-toggle-wrapper">
            <label className="toggle-switch-label" htmlFor="store-status-toggle">
              <input
                type="checkbox"
                id="store-status-toggle"
                className="toggle-checkbox visually-hidden"
                checked={isActive}
                onChange={handleToggleStatus}
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
            </label>
            <div className="store-status-text">
              <span className="status-name" id="status-title-display">
                {isActive ? 'Toko Aktif' : 'Toko Nonaktif'}
              </span>
              <span className="status-subtext" id="status-desc-display">
                {isActive
                  ? 'Toko akan terlihat di marketplace'
                  : 'Toko sementara disembunyikan dari marketplace'}
              </span>
            </div>
          </div>
        </div>

        {/* Jam Operasional Section */}
        <div className="operational-section">
          <h3 className="operational-section-title">Jam Operasional</h3>
          <div className="hours-input-row">
            <div className="hours-input-group">
              <input
                type="text"
                id="jam-buka"
                className="outline-input hour-input"
                value={jamBuka}
                maxLength={5}
                aria-label="Jam Buka"
                onChange={(e) => setJamBuka(e.target.value)}
              />
            </div>
            <span className="hours-separator" aria-hidden="true" />
            <div className="hours-input-group">
              <input
                type="text"
                id="jam-tutup"
                className="outline-input hour-input"
                value={jamTutup}
                maxLength={5}
                aria-label="Jam Tutup"
                onChange={(e) => setJamTutup(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Hari Operasional Section */}
        <div className="operational-section">
          <h3 className="operational-section-title">Hari Operasional</h3>
          <div className="operational-days-grid">
            {DAY_LIST.map(({ key, label }) => (
              <label className="custom-day-checkbox" htmlFor={`day-${key}`} key={key}>
                <input
                  type="checkbox"
                  id={`day-${key}`}
                  className="day-checkbox-native visually-hidden"
                  checked={days[key]}
                  onChange={() => handleDayChange(key)}
                />
                <span className="custom-checkbox-box">
                  <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="day-name">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="operational-actions">
          <button
            type="button"
            className="btn-save-secondary"
            id="btn-save-operational"
            onClick={handleSaveOperational}
          >
            Perbarui Jam & Status
          </button>
        </div>
      </div>
    </div>
  );
}
