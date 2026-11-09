export interface StoreProductItem {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  rescuePrice: number;
  discountPercent: number;
  imageSrc: string;
  pickupTime: string;
  stock?: number;
  remainingBoxes?: number;
  description?: string;
}

export interface StoreReviewItem {
  id: string;
  name: string;
  role?: string;
  rating: number;
  avatar: string;
  comment: string;
  date: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  type?: 'store' | 'product';
}

export interface StoreDetailInfo {
  id?: string;
  name: string;
  category: string;
  status: string;
  rating: number;
  reviewCount: number;
  distance: string;
  area: string;
  address: string;
  operationalHours: string;
  pickupHours: string;
  email: string;
  phone: string;
  socialMedia: string;
  description: string;
  avatarUrl?: string;
}

export type StoreDetailTab = 'tentang' | 'produk' | 'ulasan';
