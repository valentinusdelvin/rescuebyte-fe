import { api } from '../api';
import cardMonsieurSpoon from '../../assets/customer/card-monsieur-spoon.jpg';
import { mapBackendStatusToCustomerStatus } from './orderStatus';
import {
  MERCHANT_ORDERS_STORAGE_KEY, PLACEHOLDER_ORDER_IDS, MerchantOrderItem,
} from '../orderService';

export async function fetchMerchantOrdersApi(
  _storeName?: string,
  tab: 'all' | 'perlu-konfirmasi' | 'diproses' | 'siap-diambil' | 'selesai' = 'all'
): Promise<MerchantOrderItem[] | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) return null;

  try {
    const backendTabBySellerTab = {
      all: 'all',
      'perlu-konfirmasi': 'WAITING_CONFIRMATION',
      diproses: 'IN_PROCESS',
      'siap-diambil': 'READY_FOR_PICKUP',
      selesai: 'COMPLETED',
    } as const;
    const response = await api.get('/api/v1/orders/seller', {
      params: {
        page: 1,
        limit: 100,
        tab: backendTabBySellerTab[tab],
      },
    });
    const payload = response.data?.payload;
    if (payload && Array.isArray(payload.orders)) {
            const backendOrders: MerchantOrderItem[] = [];

      payload.orders.forEach((bo: any) => {
        if (PLACEHOLDER_ORDER_IDS.has(bo.id) || PLACEHOLDER_ORDER_IDS.has(bo.order_number)) return;

        const customerStatus = mapBackendStatusToCustomerStatus(bo.status);
        if (customerStatus === 'menunggu-pembayaran') return;

        let merchantStatus: 'perlu-konfirmasi' | 'diproses' | 'siap-diambil' | 'selesai' | 'batal' = 'perlu-konfirmasi';
        if (customerStatus === 'menunggu-konfirmasi') merchantStatus = 'perlu-konfirmasi';
        else if (customerStatus === 'diproses') merchantStatus = 'diproses';
        else if (customerStatus === 'siap-diambil') merchantStatus = 'siap-diambil';
        else if (customerStatus === 'selesai') merchantStatus = 'selesai';
        else if (customerStatus === 'dibatalkan') merchantStatus = 'batal';

        const pickupScheduleParts = String(bo.pickup_schedule || '').split('|').map((part) => part.trim());
        const pickupDate = bo.pickup_date || (pickupScheduleParts.length > 1 ? pickupScheduleParts[0] : bo.pickup_schedule) || bo.created_at || '';
        const pickupTime = bo.pickup_time || (pickupScheduleParts.length > 1 ? pickupScheduleParts[1] : '') || '15.00 - 18.00 WIB';

        const rawCustomerName = bo.customer_name || bo.customer?.name || bo.user?.name;
        const customerName = typeof rawCustomerName === 'string' && rawCustomerName.trim()
          ? rawCustomerName.trim()
          : 'Pelanggan RescueByte';

        const customerPhone = bo.customer_phone || bo.customer?.phone || bo.customer?.phone_number || bo.user?.phone_number || undefined;
        const customerAvatar = bo.customer_avatar_url || bo.customer_avatar || bo.customer?.avatar_url || bo.customer?.profile_picture_url || bo.user?.avatar_url || undefined;
        const customerEmail = bo.customer_email || bo.customer?.email || bo.user?.email || undefined;
        const customerId = bo.customer_id || bo.user_id || bo.customer?.id || undefined;

        const storeId = bo.store_id || bo.store?.id || undefined;
        const storeName = bo.store_name || bo.store?.name || 'Toko Mitra';
        const storeAddress = bo.store_address || bo.store?.address || undefined;
        const storeCity = bo.store_city || bo.store?.city || undefined;
        const storeDistrict = bo.store_district || bo.store?.district || undefined;

        const itemsList = Array.isArray(bo.items) && bo.items.length > 0
          ? bo.items.map((it: any) => ({
              id: it.id || it.product_id,
              productName: it.product_name || it.name || 'Mystery Box',
              quantity: it.quantity || 1,
              price: it.rescue_price || it.price || 0,
              originalPrice: it.normal_price || it.original_price,
              imageUrl: it.product_image_url || it.image_url,
              variantName: it.variant_name,
            }))
          : undefined;

        backendOrders.push({
          id: bo.id,
          orderNumber: bo.order_number,
          status: merchantStatus,
          storeId,
          storeName,
          storeAddress,
          storeCity,
          storeDistrict,
          customerId,
          customerName,
          customerPhone,
          customerEmail,
          customerAvatar,
          productName: bo.summary_item_name || 'Mystery Box',
          productImage: bo.summary_image_url || cardMonsieurSpoon,
          totalBoxes: bo.total_items || 1,
          rescuePrice: bo.total_amount,
          originalPrice: bo.total_original_price || bo.total_amount * 2,
          discountPercent: bo.total_original_price
            ? Math.max(0, Math.round(((bo.total_original_price - bo.total_amount) / bo.total_original_price) * 100))
            : 50,
          grandTotal: bo.total_amount,
          pickupDate,
          pickupTime,
          paymentMethod: bo.payment_method || bo.payment?.method,
          paymentStatus: bo.payment_status || bo.payment?.status,
          notes: bo.notes,
          items: itemsList,
          createdAt: bo.created_at,
        });
      });

      // Use the server response as the seller history source, including an empty list.
      // This replaces stale browser-cached orders instead of silently retaining them.
      // The seller endpoint is already scoped to the authenticated seller's store.
      localStorage.setItem(MERCHANT_ORDERS_STORAGE_KEY, JSON.stringify(backendOrders));
      return backendOrders;
    }
    return null;
  } catch (err) {
    console.warn('fetchMerchantOrdersApi failed:', err);
    return null;
  }
}
