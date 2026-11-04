import { CheckoutItem } from '../../../types';

export interface StoreCheckoutGroup {
  key: string;
  storeId?: string;
  storeName: string;
  storeAvatar?: string;
  storeAddress: string;
  operationalHours: string;
  rating: number;
  reviewCount: number | string;
  distanceText: string;
  items: CheckoutItem[];
}

export type PaymentMethod = 'online' | 'cod';
