/**
 * Utilitas penanganan dan pemformatan jam operasional toko sesuai spesifikasi API backend.
 */

/**
 * Validasi format jam 24 jam (00.00 - 23.59 atau 00:00 - 23:59).
 */
export function isValidTimeFormat(timeStr?: string): boolean {
  if (!timeStr) return false;
  const clean = timeStr.trim().replace(':', '.');
  const match = clean.match(/^(\d{1,2})\.(\d{1,2})$/);
  if (!match) return false;
  const hh = parseInt(match[1], 10);
  const mm = parseInt(match[2], 10);
  return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
}

/**
 * Konversi format jam backend ("07:00:00", "07:00") ke format titik standar Indonesia ("07.00").
 */
export function toIndoTime(timeStr?: string): string {
  if (!timeStr) return '08.00';
  const clean = timeStr.trim().replace(':', '.');
  const parts = clean.split('.');
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0');
    const mm = parts[1].slice(0, 2).padEnd(2, '0');
    return `${hh}.${mm}`;
  }
  return timeStr;
}

/**
 * Konversi format jam Indonesia ("22.00") ke format yang diterima backend ("22:00", tanpa detik).
 */
export function toApiTime(timeStr?: string): string {
  if (!timeStr) return '08:00';
  const clean = timeStr.trim().replace(':', '.');
  const parts = clean.split('.');
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0');
    const mm = parts[1].slice(0, 2).padEnd(2, '0');
    return `${hh}:${mm}`;
  }
  return clean.replace('.', ':');
}
