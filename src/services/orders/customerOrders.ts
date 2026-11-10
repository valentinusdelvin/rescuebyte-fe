import { api } from '../api';
import { OrderDetailResponse } from '../../api/types';
import cardMonsieurSpoon from '../../assets/customer/card-monsieur-spoon.jpg';
import { getOrderStatusLabel, mapBackendStatusToCustomerStatus } from './orderStatus';
import {
  PLACEHOLDER_ORDER_IDS, PLACEHOLDER_STORE_NAMES,
  getCustomerOrders, saveCustomerOrders,
} from './orderStorage';
import { CustomerOrderItem } from './orderTypes';

type OrderDetailApiResponse = OrderDetailResponse & {
  order?: OrderDetailResponse;
  payload?: (OrderDetailResponse & { order?: OrderDetailResponse }) | null;
};

export async function fetchOrderDetailApi(orderId: string): Promise<OrderDetailResponse | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token || !orderId) return null;

  try {
    const response = await api.get<OrderDetailApiResponse>('/api/v1/orders/' + orderId);
    const payload = response.data?.payload;
    return payload?.order || payload || response.data?.order || response.data || null;
  } catch (err) {
    console.warn('fetchOrderDetailApi failed:', err);
    return null;
  }
}

export async function fetchCustomerOrdersApi(params?: {
  page?: number;
  limit?: number;
  tab?: string;
  search?: string;
}): Promise<CustomerOrderItem[] | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token) return null;

  try {
    const response = await api.get('/api/v1/orders', { params });
    const payload = response.data?.payload;
    if (payload && Array.isArray(payload.orders)) {
      const mappedOrders: CustomerOrderItem[] = payload.orders
        .filter((bo: any) => !PLACEHOLDER_ORDER_IDS.has(bo.id) && !PLACEHOLDER_ORDER_IDS.has(bo.order_number))
        .map((bo: any) => {
        const status = mapBackendStatusToCustomerStatus(bo.status);
        const pickupScheduleParts = String(bo.pickup_schedule || '').split('|').map((part: string) => part.trim());
        const pickupDate = bo.pickup_date || (pickupScheduleParts.length > 1 ? pickupScheduleParts[0] : bo.pickup_schedule) || '';
        const pickupTime = bo.pickup_time || (pickupScheduleParts.length > 1 ? pickupScheduleParts[1] : '') || '';
        return {
          id: bo.id,
          orderNumber: bo.order_number,
          storeId: bo.store_id,
          createdAt: bo.created_at,
          status,
          statusLabel: bo.status_label || getOrderStatusLabel(status),
          storeName: bo.store_name,
          storeAddress: bo.store_address,
          productName: bo.summary_item_name || 'Mystery Box',
          productBoxCount: bo.total_items || 1,
          productDescription: bo.summary_item_name || 'Paket Mystery Box',
          imageUrl: bo.summary_image_url,
          pickupDate,
          pickupTime,
          finalPrice: bo.total_amount,
          category: 'meal',
          orderData: {
            orderId: bo.order_number,
            backendOrderId: bo.id,
            items: [
              {
                id: bo.id,
                name: bo.summary_item_name || 'Mystery Box',
                storeName: bo.store_name,
                storeAddress: bo.store_address,
                rescuePrice: bo.total_amount,
                quantity: bo.total_items || 1,
                categoryTags: ['Penyelamatan Pangan'],
                imageSrc: bo.summary_image_url || cardMonsieurSpoon,
              },
            ],
            primaryStore: {
              storeId: bo.store_id,
              storeName: bo.store_name,
              storeAddress: bo.store_address,
            },
            pickupDate,
            pickupTimeSlot: pickupTime,
            customerInfo: {
              name: 'Tester',
              phone: '081234567890',
              email: 'customer@rescuebite.com',
            },
            totalBoxes: bo.total_items || 1,
            subtotal: bo.total_amount,
            grandTotal: bo.total_amount,
            status,
            snapRedirectUrl: bo.payment?.snap_redirect_url || (bo as any).snap_redirect_url,
            snapToken: bo.payment?.snap_token || (bo as any).snap_token,
            createdAt: bo.created_at,
          },
        };
      });

      // Merge backend orders with active customer orders
      const existing = getCustomerOrders();
      const existingMap = new Map(existing.map((o) => [o.orderNumber, o]));
      mappedOrders.forEach((bo) => {
        const local = existingMap.get(bo.orderNumber);
        if (local && local.status === 'menunggu-konfirmasi' && bo.status === 'menunggu-pembayaran') {
          bo.status = 'menunggu-konfirmasi';
          bo.statusLabel = getOrderStatusLabel('menunggu-konfirmasi');
          if (bo.orderData) {
            bo.orderData.status = 'menunggu-konfirmasi';
          }
        }
      });
      const merged = [...mappedOrders];
      existing.forEach((localOrder) => {
        if (
          !PLACEHOLDER_ORDER_IDS.has(localOrder.id) &&
          !PLACEHOLDER_ORDER_IDS.has(localOrder.orderNumber) &&
          !PLACEHOLDER_STORE_NAMES.has(localOrder.storeName) &&
          !localOrder.orderNumber?.startsWith('RB25102') &&
          !merged.some((m) => m.orderNumber === localOrder.orderNumber || m.id === localOrder.id)
        ) {
          merged.push(localOrder);
        }
      });
      saveCustomerOrders(merged);
      return merged;
    }
    return null;
  } catch (err) {
    console.warn('fetchCustomerOrdersApi failed:', err);
    return null;
  }
}
