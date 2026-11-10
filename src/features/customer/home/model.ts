import { CustomerMysteryBox } from '../../../types';
import { PublicProductItem } from '../../../services/productService';
import { formatDistanceKm } from '../../../services/locationService';
import cardMonsieurSpoon from '../../../assets/customer/card-monsieur-spoon.jpg';

export function mapPublicProductToCustomerBox(p: PublicProductItem, isRadius = false): CustomerMysteryBox {
  const normalPrice = p.normal_price || 0;
  const rescuePrice = p.rescue_price || 0;
  const discount = typeof p.discount_percentage === 'number' && p.discount_percentage > 0
    ? p.discount_percentage
    : normalPrice > 0 ? Math.round(((normalPrice - rescuePrice) / normalPrice) * 100) : 0;

  let pickup = p.pickup_time;
  if (!pickup && p.operational_start && p.operational_end) {
    pickup = `Ambil: ${p.operational_start} – ${p.operational_end} WIB`;
  } else if (!pickup) {
    pickup = 'Ambil: 19:00 – 21:00 WIB';
  }

  const productName = p.name || 'Surprise Box';
  let storeName = p.store_name || '';
  if (!storeName) {
    try {
      storeName = localStorage.getItem('rescuebyte_store_name') || 'Toko Mitra';
    } catch {
      storeName = 'Toko Mitra';
    }
  }

  let imageSrc = cardMonsieurSpoon;
  if (p.main_image_url && typeof p.main_image_url === 'string') {
    const url = p.main_image_url.trim();
    if (url.startsWith('http') && !url.includes('pinterest.com/search')) imageSrc = url;
  }

  return {
    id: p.id,
    stock: p.stock,
    storeId: p.store_id,
    storeName,
    category: productName,
    categoryBadge: productName,
    remainingBoxesText: `Sisa ${p.stock ?? 1} Box`,
    distanceText: formatDistanceKm(p.distance_km),
    discountPercent: discount,
    originalPrice: normalPrice,
    rescuePrice,
    pickupTime: pickup,
    description: p.description || 'Berisi 1 porsi makanan surplus berkualitas dan higienis yang disiapkan langsung oleh merchant mitra.',
    tags: [storeName, productName, 'Halal MUI', 'Surplus Harian'],
    imageSrc,
    rating: p.rating ?? 0,
    reviewCount: p.review_count ?? p.reviewCount ?? 0,
    isRadiusItem: isRadius,
  };
}

export function hasAvailableStock(item: Pick<CustomerMysteryBox, 'stock' | 'remainingBoxesText'>): boolean {
  if (typeof item.stock === 'number') return item.stock > 0;
  const cachedStock = Number.parseInt(item.remainingBoxesText.match(/\d+/)?.[0] ?? '', 10);
  return !Number.isFinite(cachedStock) || cachedStock > 0;
}

function getBoxDistance(item: CustomerMysteryBox): number {
  const distance = Number.parseFloat(item.distanceText);
  return Number.isFinite(distance) ? distance : Number.POSITIVE_INFINITY;
}

export function getCachedBoxes(): { nearby: CustomerMysteryBox[]; bestSeller: CustomerMysteryBox[] } {
  try {
    const raw = localStorage.getItem('rescuebyte_cached_marketplace_products');
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const availableProducts = (parsed as CustomerMysteryBox[])
          .filter(hasAvailableStock)
          .sort((a, b) => getBoxDistance(a) - getBoxDistance(b));
        return {
          nearby: availableProducts.slice(0, 3).map((item) => ({ ...item, isRadiusItem: false })),
          bestSeller: [...availableProducts]
            .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
            .slice(0, 3)
            .map((item) => ({ ...item, isRadiusItem: true })),
        };
      }
    }
  } catch {
    // A broken cache should fall back to loading from the API.
  }
  return { nearby: [], bestSeller: [] };
}
