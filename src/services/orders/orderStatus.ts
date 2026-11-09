import type { CustomerOrderStatus } from '../../types';

export function getOrderStatusLabel(status: CustomerOrderStatus): string {
  switch (status) {
    case 'menunggu-pembayaran':
      return 'Menunggu Pembayaran';
    case 'menunggu-konfirmasi':
      return 'Menunggu Konfirmasi';
    case 'diproses':
      return 'Diproses';
    case 'siap-diambil':
      return 'Siap Diambil';
    case 'selesai':
      return 'Selesai';
    case 'dibatalkan':
      return 'Dibatalkan';
    default:
      return 'Diproses';
  }
}

export function mapBackendStatusToCustomerStatus(backendStatus: string): CustomerOrderStatus {
  const status = (backendStatus || '').toUpperCase();
  if (['PAID', 'SETTLEMENT', 'CAPTURE', 'PAYMENT_SUCCESS', 'SUCCESS'].includes(status)) return 'menunggu-konfirmasi';
  if (['WAITING_PAYMENT', 'PENDING', 'UNPAID', 'NEW', 'PENDING_PAYMENT'].includes(status)) return 'menunggu-pembayaran';
  if (status.includes('PAYMENT')) return 'menunggu-pembayaran';
  if (status.includes('CONFIRM') || status === 'WAITING_CONFIRMATION') return 'menunggu-konfirmasi';
  if (status.includes('PROCESS') || status === 'PREPARING' || status === 'CONFIRMED') return 'diproses';
  if (status.includes('READY') || status === 'READY_FOR_PICKUP') return 'siap-diambil';
  if (status.includes('COMPLETE') || status === 'COMPLETED' || status === 'FINISHED') return 'selesai';
  if (status.includes('CANCEL') || status === 'CANCELLED') return 'dibatalkan';
  return 'menunggu-pembayaran';
}


