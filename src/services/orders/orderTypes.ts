import { CustomerOrderStatus, PaymentOrderData } from '../../types';

export interface CustomerOrderItem {
  id: string;
  orderNumber: string;
  storeId?: string;
  createdAt?: string;
  status: CustomerOrderStatus;
  statusLabel: string;
  storeName: string;
  storeAddress?: string;
  storeRating?: number;
  storeReviewCount?: number;
  storeDistance?: string;
  storeTags?: string[];
  productName: string;
  productBoxCount: number;
  productDescription: string;
  pickupDate: string;
  pickupTime: string;
  originalPrice?: number;
  finalPrice: number;
  category?: 'bakery' | 'meal' | 'snack' | 'fresh' | 'deli';
  orderData?: PaymentOrderData;
  imageUrl?: string;
}

export interface MerchantOrderItem {
  id: string;
  orderNumber: string;
  status: 'perlu-konfirmasi' | 'diproses' | 'siap-diambil' | 'selesai' | 'batal';
  storeId?: string;
  storeName: string;
  storeAddress?: string;
  storeCity?: string;
  storeDistrict?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAvatar?: string;
  productName: string;
  productImage?: string;
  totalBoxes: number;
  rescuePrice: number;
  originalPrice: number;
  discountPercent: number;
  grandTotal: number;
  pickupDate: string;
  pickupTime: string;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  items?: Array<{
    id?: string;
    productName: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    variantName?: string;
  }>;
  createdAt: string;
}
