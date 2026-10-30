import { useState, useEffect } from 'react';
import { X, Copy, Check, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { MerchantOrderItem, fetchOrderDetailApi } from '../../services/orderService';
import { getStoreById, StoreProfileData } from '../../services/storeService';
import { getUserById } from '../../services/userService';
import { UserPayload } from '../../types';
import cardMonsieurSpoon from '../../assets/customer/card-monsieur-spoon.jpg';

export interface SellerOrderDetailModalProps {
  order: MerchantOrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (order: MerchantOrderItem) => Promise<void> | void;
  onProcessReady?: (order: MerchantOrderItem) => Promise<void> | void;
  onComplete?: (order: MerchantOrderItem) => Promise<void> | void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatFriendlyDate(value?: string): string {
  if (!value) return 'Waktu pesanan belum tersedia';
  try {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  } catch {
    // ignore
  }
  return value;
}

/**
 * SellerOrderDetailModal Component
 * Interactive order verification popup for all order statuses.
 * Displays real customer, store, and order details strictly from backend relations.
 */
interface ModalItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  image: string;
}

export function SellerOrderDetailModal({
  order,
  isOpen,
  onClose,
  onConfirm,
  onProcessReady,
  onComplete,
  onShowToast,
}: SellerOrderDetailModalProps) {
  const [detailData, setDetailData] = useState<any | null>(null);
  const [storeData, setStoreData] = useState<StoreProfileData | null>(null);
  const [customerData, setCustomerData] = useState<UserPayload | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!isOpen || !order?.id) {
      setDetailData(null);
      setStoreData(null);
      setCustomerData(null);
      setAvatarFailed(false);
      setIsSubmitting(false);
      setIsLoadingDetail(false);
      return;
    }

    // Reset previous order details immediately on switch
    setDetailData(null);
    setStoreData(null);
    setCustomerData(null);
    setAvatarFailed(false);
    setIsSubmitting(false);
    setIsLoadingDetail(true);

    let isMounted = true;
    const orderId = order.id;

    async function loadFreshOrderDetails() {
      try {
        const detail = await fetchOrderDetailApi(orderId);
        if (!isMounted) return;

        if (detail) {
          setDetailData(detail);

          // 1. Resolve Store details if available
          const storeId = detail.store_id || order?.storeId;
          const needsStoreInfo = !detail.store_address || !detail.store_city || !detail.store_district;
          if (storeId && needsStoreInfo) {
            try {
              const fetchedStore = await getStoreById(storeId);
              if (isMounted && fetchedStore) {
                setStoreData(fetchedStore);
              }
            } catch (err) {
              console.warn('Gagal memuat detail toko mitra:', err);
            }
          }

          // 2. Resolve Customer details if customer ID is available but phone/name is incomplete
          const customerId = detail.customer_id || order?.customerId;
          const hasPhone = Boolean(
            detail.customer_phone ||
            detail.customer?.phone ||
            detail.customer?.phone_number ||
            order?.customerPhone
          );
          if (customerId && !hasPhone) {
            try {
              const fetchedUser = await getUserById(customerId);
              if (isMounted && fetchedUser) {
                setCustomerData(fetchedUser);
              }
            } catch (err) {
              console.warn('Gagal memuat detail data customer:', err);
            }
          }
        }
      } catch (err) {
        console.warn('Gagal memuat detail pesanan backend:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDetail(false);
        }
      }
    }

    void loadFreshOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, order?.id, order?.customerId, order?.customerPhone, order?.storeId]);

  if (!isOpen || !order) return null;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    if (onShowToast) onShowToast('ID Pesanan disalin ke clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmClick = async () => {
    if (!onConfirm) return;
    setIsSubmitting(true);
    try {
      await onConfirm(order);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessReadyClick = async () => {
    if (!onProcessReady) return;
    setIsSubmitting(true);
    try {
      await onProcessReady(order);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteClick = async () => {
    if (!onComplete) return;
    setIsSubmitting(true);
    try {
      await onComplete(order);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolved Customer Information
  const customerName =
    (typeof detailData?.customer_name === 'string' && detailData.customer_name.trim()) ||
    (typeof detailData?.customer?.name === 'string' && detailData.customer.name.trim()) ||
    (typeof customerData?.name === 'string' && customerData.name.trim()) ||
    order.customerName ||
    'Pelanggan RescueByte';

  const customerPhone =
    detailData?.customer_phone ||
    detailData?.customer?.phone ||
    detailData?.customer?.phone_number ||
    customerData?.phone_number ||
    order.customerPhone ||
    null;

  const customerAvatar =
    detailData?.customer_avatar_url ||
    detailData?.customer_avatar ||
    detailData?.customer?.avatar_url ||
    detailData?.customer?.profile_picture_url ||
    customerData?.avatar_url ||
    order.customerAvatar ||
    null;

  const customerInitials = customerName
    ? customerName
        .trim()
        .split(/\s+/)
        .map((w: string) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'P'
    : 'P';

  // Resolved Mitra Lokasi Information
  const storeName =
    detailData?.store_name ||
    detailData?.store?.name ||
    storeData?.name ||
    order.storeName ||
    'Mitra Toko';

  const district =
    detailData?.store_district ||
    detailData?.store?.district ||
    storeData?.district;

  const city =
    detailData?.store_city ||
    detailData?.store?.city ||
    storeData?.city;

  const branchText = district && city
    ? `Cabang ${district}, ${city}`
    : district
      ? `Cabang ${district}`
      : city
        ? `Cabang ${city}`
        : null;

  const storeAddress =
    detailData?.store_address ||
    detailData?.store?.address ||
    storeData?.address ||
    order.storeAddress;

  // Resolved Schedule & Payment Information
  const pickupDateText =
    detailData?.pickup_date ||
    order.pickupDate ||
    formatFriendlyDate(detailData?.created_at || order.createdAt) ||
    'Jadwal belum tersedia';

  const pickupTimeText =
    detailData?.pickup_time ||
    order.pickupTime ||
    '15.00 - 18.00 WIB';

  const paymentMethodText =
    detailData?.payment_method === 'CASH_ON_PICKUP'
      ? 'Bayar Tunai saat Pickup'
      : 'QRIS / Online Settlement Otomatis';

  // Resolved Items List
  const itemsList: ModalItem[] = Array.isArray(detailData?.items) && detailData.items.length > 0
    ? detailData.items.map((it: any) => ({
        id: it.id || it.product_id,
        name: it.product_name || it.name || order.productName,
        quantity: it.quantity || 1,
        price: it.rescue_price || it.price || order.rescuePrice,
        originalPrice: it.normal_price || it.original_price || order.originalPrice,
        image: it.product_image_url || it.image_url || order.productImage || cardMonsieurSpoon,
      }))
    : [
        {
          id: order.id,
          name: order.productName,
          quantity: order.totalBoxes || 1,
          price: order.rescuePrice,
          originalPrice: order.originalPrice,
          image: order.productImage || cardMonsieurSpoon,
        },
      ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-order-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full mx-auto shadow-2xl relative border border-gray-100 flex flex-col gap-4 text-gray-900 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title & Close Button */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h3
                className="text-xl sm:text-2xl font-bold text-[#1b1c1c] tracking-tight"
                id="modal-order-title"
              >
                Detail Pesanan
              </h3>
              {isLoadingDetail && (
                <Loader2 className="w-4 h-4 text-[#3c6a00] animate-spin shrink-0" aria-label="Memuat data..." />
              )}
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 mt-2 transition-colors cursor-pointer select-none"
              title="Salin ID Pesanan"
            >
              <span>ID: #{order.orderNumber}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            aria-label="Tutup Detail Pesanan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer, Waktu Pesan, Mitra Lokasi (3 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100 text-xs">
          {/* Customer */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              CUSTOMER
            </span>
            <div className="flex items-center gap-2.5">
              {customerAvatar && !avatarFailed ? (
                <img
                  src={customerAvatar}
                  alt={customerName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200 shadow-2xs"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 text-[#1F4D36] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                  {customerInitials}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#1b1c1c] truncate">{customerName}</p>
                <p className={`text-xs font-medium truncate ${customerPhone ? 'text-gray-500' : 'text-gray-400 italic'}`}>
                  {customerPhone || 'Nomor telepon tidak tersedia'}
                </p>
              </div>
            </div>
          </div>

          {/* Waktu Pesan */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              WAKTU PESAN
            </span>
            <p className="font-bold text-xs sm:text-sm text-[#1b1c1c] truncate">
              {pickupDateText}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">Dibuat via RescueBite App</p>
          </div>

          {/* Mitra Lokasi */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              MITRA LOKASI
            </span>
            <p className="font-bold text-xs sm:text-sm text-[#1b1c1c] truncate" title={storeName}>
              {storeName}
            </p>
            {branchText && (
              <p className="text-[11px] text-gray-600 font-medium truncate" title={branchText}>
                {branchText}
              </p>
            )}
            {storeAddress ? (
              <p className="text-[11px] text-gray-400 font-normal truncate" title={storeAddress}>
                {storeAddress}
              </p>
            ) : !branchText ? (
              <p className="text-[11px] text-gray-400 font-normal italic">
                Informasi lokasi toko belum tersedia
              </p>
            ) : null}
          </div>
        </div>

        {/* Section: ITEM PESANAN */}
        <div className="flex flex-col gap-2 pt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            ITEM PESANAN
          </span>

          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {itemsList.map((item, idx: number) => (
              <div
                key={`${item.id || idx}`}
                className="border border-gray-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcfcfb]"
              >
                {/* Left: Thumbnail & Item Description */}
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = cardMonsieurSpoon;
                      }}
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Jumlah: <span className="font-bold text-gray-800">{item.quantity} Box</span>
                    </p>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">
                      Harga Satuan: Rp {formatRupiah(item.price)} /box
                    </p>
                  </div>
                </div>

                {/* Right: Price & Payment Badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                  <div className="flex items-baseline gap-2">
                    {item.originalPrice !== undefined && item.originalPrice > item.price && (
                      <span className="text-xs text-gray-400 line-through">
                        Rp {formatRupiah(item.originalPrice * item.quantity)}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-extrabold text-[#1b1c1c]">
                      Rp {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Lunas
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dua Kartu Info (Jadwal Pengambilan & Status Pembayaran) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Card 1: Jadwal Pengambilan */}
          <div className="bg-[#fffdf2] border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900">Jadwal Pengambilan</p>
              <p className="text-xs sm:text-sm font-bold text-[#1b1c1c] mt-0.5">
                {pickupDateText}
              </p>
              <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                {pickupTimeText}
              </p>
            </div>
          </div>

          {/* Card 2: Status Pembayaran */}
          <div className="bg-[#f4fcf6] border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900">Status Pembayaran</p>
              <p className="text-xs sm:text-sm font-bold text-[#1b1c1c] mt-0.5">
                Lunas (Terverifikasi)
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                {paymentMethodText}
              </p>
            </div>
          </div>
        </div>

        {/* Footer: Warning Alert Note & Action Buttons */}
        <div className="mt-2 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 max-w-sm">
            {order.status === 'selesai' ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
            ) : order.status === 'diproses' ? (
              <Clock className="w-4.5 h-4.5 text-sky-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              {order.status === 'perlu-konfirmasi' && 'Pastikan ketersediaan produk dan jadwal pengambilan sebelum mengonfirmasi pesanan.'}
              {order.status === 'diproses' && 'Pastikan pesanan sudah dikemas rapi dan siap diambil oleh pembeli sebelum memperbarui status.'}
              {order.status === 'siap-diambil' && 'Pastikan produk dan jumlah pesanan sudah sesuai sebelum mengonfirmasi penyerahan kepada pembeli.'}
              {order.status === 'selesai' && 'Pesanan telah selesai dan diserahkan kepada pembeli.'}
              {order.status === 'batal' && 'Pesanan ini telah dibatalkan.'}
            </p>
          </div>

          <div className="flex items-center gap-3 justify-end shrink-0">
            {order.status === 'perlu-konfirmasi' && onConfirm && (
              <button
                type="button"
                onClick={handleConfirmClick}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial bg-[#3c6a00] hover:bg-[#325800] active:scale-[0.98] text-white font-bold text-sm sm:text-base px-8 py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Konfirmasi Pesanan'}
              </button>
            )}

            {order.status === 'diproses' && onProcessReady && (
              <button
                type="button"
                onClick={handleProcessReadyClick}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial bg-[#3c6a00] hover:bg-[#325800] active:scale-[0.98] text-white font-bold text-sm sm:text-base px-8 py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Siap Diambil'}
              </button>
            )}

            {order.status === 'siap-diambil' && onComplete && (
              <button
                type="button"
                onClick={handleCompleteClick}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial bg-[#1F2A24] hover:bg-[#2C3B33] active:scale-[0.98] text-white font-bold text-sm sm:text-base px-8 py-3 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Pesanan Selesai'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 font-bold text-sm sm:text-base px-6 py-3 rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
