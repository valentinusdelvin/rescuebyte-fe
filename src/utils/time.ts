/**
 * Utility functions for operational time handling and formatting.
 * Complies with RescueByte design tokens and backend API specifications.
 */

/**
 * Validates if time string conforms to 24-hour clock (00.00 - 23.59 or 00:00 - 23:59).
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
 * Converts backend time format (e.g. "07:00:00", "07:00", "07.00") to Indonesian dot format ("07.00").
 * Preserves raw value if parsing is not applicable, without silently rewriting hour values.
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
 * Converts Indonesian time format (e.g. "22.00", "22:00") to API format ("22:00" or "08:00").
 * Backend expects HH:mm or HH.mm format (rejects HH:mm:ss with seconds).
 * Does not overwrite invalid hours (validation must occur before calling this).
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
