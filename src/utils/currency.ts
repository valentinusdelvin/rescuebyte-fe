/**
 * Utilitas pemformatan mata uang Rupiah terpusat (standar id-ID).
 */

/**
 * Format nominal angka menjadi string ribuan bertitik (contoh: 35000 -> "35.000").
 */
export function formatRupiah(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format nominal dengan awalan "Rp" tanpa spasi sesuai panduan desain RescueByte (contoh: "Rp35.000").
 */
export function formatRupiahWithPrefix(amount: number): string {
  return `Rp${formatRupiah(amount)}`;
}

/**
 * Format input teks mentah menjadi format ribuan bertitik secara realtime saat user mengetik.
 */
export function formatPriceInput(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('id-ID');
}

/**
 * Parse kembali string angka bertitik menjadi nilai integer (contoh: "10.000" -> 10000).
 */
export function parsePriceInput(val: string): number | null {
  if (!val) return null;
  const digits = val.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : null;
}
