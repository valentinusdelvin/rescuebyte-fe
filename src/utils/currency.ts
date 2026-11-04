/**
 * Centralized Indonesian Rupiah Currency Utilities
 * Formats, cleans, and parses currency numbers and inputs according to Indonesian localization standards (id-ID).
 */

/**
 * Format numeric amount to Indonesian Rupiah thousands dot-separated string.
 * Examples:
 * - 35000 -> "35.000"
 * - 0 -> "0"
 * - 1250000 -> "1.250.000"
 */
export function formatRupiah(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format numeric amount with standardized Indonesian Rupiah prefix "Rp".
 * Follows RescueByte design guide: strictly cohesive weight, no space or dot after Rp.
 * Examples:
 * - 35000 -> "Rp35.000"
 */
export function formatRupiahWithPrefix(amount: number): string {
  return `Rp${formatRupiah(amount)}`;
}

/**
 * Format raw input string into thousands dot separated string while user types.
 * Strips any non-digit characters.
 * Examples:
 * - "10000" -> "10.000"
 * - "" -> ""
 */
export function formatPriceInput(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('id-ID');
}

/**
 * Parse thousands dot separated string back into a numeric value.
 * Examples:
 * - "10.000" -> 10000
 * - "" -> null
 */
export function parsePriceInput(val: string): number | null {
  if (!val) return null;
  const digits = val.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : null;
}
