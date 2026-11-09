export interface TimelineStep {
  step: number;
  title: string;
  desc?: string;
}

export interface OrderItemDetail {
  id?: string;
  productId?: string;
  name?: string;
  imageSrc?: string;
  originalPrice?: number;
  rescuePrice?: number;
  discountPercent?: number;
  quantity?: number;
  storeName?: string;
}
