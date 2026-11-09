import type { PaymentOrderData } from '../types';
import { getCustomerOrders } from '../services/orderService';

export function findOrderById(orderId: string): PaymentOrderData | null {
  try {
    const orders = getCustomerOrders();
    const found = orders.find(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
    if (!found) return null;
    if (found.orderData) return found.orderData;
    return {
      orderId: found.orderNumber || found.id,
      backendOrderId: found.id,
      status: found.status,
      items: [
        {
          id: found.id,
          name: found.productName,
          storeId: found.storeId,
          storeName: found.storeName,
          storeAvatar: found.imageUrl,
          storeAddress: found.storeAddress,
          rating: found.storeRating,
          reviewCount: found.storeReviewCount,
          distanceText: found.storeDistance,
          categoryTags: found.storeTags || [],
          originalPrice: found.originalPrice || found.finalPrice + 15000,
          rescuePrice: found.finalPrice,
          discountPercent: 50,
          quantity: found.productBoxCount,
          pickupTime: found.pickupTime,
        },
      ],
      primaryStore: {
        storeId: found.storeId,
        storeName: found.storeName,
        storeAvatar: found.imageUrl,
        storeAddress: found.storeAddress,
        rating: found.storeRating,
        reviewCount: found.storeReviewCount,
      },
      pickupDate: found.pickupDate,
      pickupTimeSlot: found.pickupTime,
      customerInfo: {
        name: 'Pelanggan',
        phone: '08123456789',
        email: '',
      },
      totalBoxes: found.productBoxCount,
      subtotal: found.finalPrice,
      discountTotal: 15000,
      serviceFee: 2000,
      grandTotal: found.finalPrice,
      createdAt: found.createdAt,
    };
  } catch {
    return null;
  }
}
