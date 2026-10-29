import { ProductItem } from '../types';
import { api } from './api';
import { extractApiErrorMessage } from './authService';

export interface CreateProductVariantPayload {
  name: string;
  sequence: number;
  normal_price: number;
  rescue_price: number;
  current_stock: number;
  initial_stock: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  main_image_url?: string;
  image_urls?: string[];
  variants: CreateProductVariantPayload[];
}

export interface ProductVariantResponse {
  id?: string;
  name?: string;
  normal_price?: number;
  rescue_price?: number;
  current_stock?: number;
  initial_stock?: number;
  sequence?: number;
}

export interface ProductImageResponse {
  id: string;
  image_url: string;
  sequence: number;
}

export interface ProductResponse {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  main_image_url?: string;
  is_active: boolean;
  total_current_stock: number;
  total_initial_stock: number;
  min_normal_price: number;
  min_rescue_price: number;
  images?: ProductImageResponse[];
  variants?: ProductVariantResponse[];
  created_at?: string;
  updated_at?: string;
}

export interface GetMerchantProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  tab?: 'all' | 'active' | 'low_stock' | 'out_of_stock';
  sort?: 'newest' | 'oldest';
}

const STORAGE_KEY = 'rescuebyte_merchant_products';

const INITIAL_PRODUCTS: ProductItem[] = [];

/**
 * Get all merchant products from localStorage.
 * Automatically filters out legacy mock placeholder products.
 */
export function getStoredProducts(): ProductItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const realProducts = parsed.filter(
        (p: ProductItem) =>
          p &&
          p.id &&
          !['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6'].includes(p.id) &&
          !p.name.startsWith('Mystery ')
      );
      if (realProducts.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realProducts));
      }
      return realProducts;
    }
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.warn('Failed to read products from localStorage:', err);
    return INITIAL_PRODUCTS;
  }
}

/**
 * Save all products to localStorage.
 */
export function saveAllProducts(products: ProductItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('Failed to write products to localStorage:', err);
  }
}

/**
 * Add a new product to the list.
 */
export function addProduct(newProduct: Omit<ProductItem, 'id' | 'createdAt'>): ProductItem {
  const products = getStoredProducts();
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const created: ProductItem = {
    ...newProduct,
    id: `prod-${Date.now()}`,
    createdAt: `Dibuat ${dateStr}, ${timeStr}`,
  };

  const updated = [created, ...products];
  saveAllProducts(updated);
  return created;
}

/**
 * Update an existing product.
 */
export function updateProduct(id: string, updates: Partial<ProductItem>): ProductItem[] {
  const products = getStoredProducts();
  const updated = products.map((item) => (item.id === id ? { ...item, ...updates } : item));
  saveAllProducts(updated);
  return updated;
}

/**
 * Delete a product.
 */
export function deleteProduct(id: string): ProductItem[] {
  const products = getStoredProducts();
  const updated = products.filter((item) => item.id !== id);
  saveAllProducts(updated);
  return updated;
}

/**
 * Format number into Indonesian Rupiah format.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Maps a backend ProductResponse to frontend ProductItem model.
 */
export function mapBackendProductToItem(p: ProductResponse): ProductItem {
  const stock = p.total_current_stock ?? (p.variants?.[0]?.current_stock ?? 0);
  const maxStock = p.total_initial_stock ?? (p.variants?.[0]?.initial_stock ?? stock);
  const normalPrice = p.min_normal_price ?? (p.variants?.[0]?.normal_price ?? 0);
  const rescuePrice = p.min_rescue_price ?? (p.variants?.[0]?.rescue_price ?? 0);

  let status: 'aktif' | 'segera_habis' | 'habis' | 'nonaktif' = 'aktif';
  if (!p.is_active) {
    status = 'nonaktif';
  } else if (stock === 0) {
    status = 'habis';
  } else if (stock <= 2) {
    status = 'segera_habis';
  }

  let formattedDate = 'Baru saja';
  if (p.created_at) {
    try {
      const d = new Date(p.created_at);
      formattedDate = `Dibuat ${d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {}
  }

  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    normalPrice,
    rescuePrice,
    stock,
    maxStock,
    status,
    isActive: p.is_active,
    imageUrl: p.main_image_url || p.images?.[0]?.image_url,
    createdAt: formattedDate,
  };
}

/**
 * Create a new product in the backend via POST /api/v1/products.
 * Automatically synchronizes with local storage cache upon creation.
 */
export async function createProduct(payload: CreateProductPayload): Promise<ProductResponse> {
  try {
    const response = await api.post('/api/v1/products', payload);
    const created = response.data?.payload as ProductResponse;

    if (!created || !created.id) {
      throw new Error('Gagal mendapatkan rincian produk dari server.');
    }

    // Sync into local cache
    const item = mapBackendProductToItem(created);
    const existing = getStoredProducts();
    saveAllProducts([item, ...existing.filter((p) => p.id !== item.id)]);

    return created;
  } catch (err) {
    const msg = extractApiErrorMessage(err, 'Gagal membuat produk dagangan baru.');
    throw new Error(msg);
  }
}

/**
 * Fetch merchant's product list from backend via GET /api/v1/products/me/list.
 * Falls back gracefully to local cached products if network fails.
 */
export async function getMerchantProducts(params?: GetMerchantProductsParams): Promise<ProductItem[]> {
  try {
    const response = await api.get('/api/v1/products/me/list', { params });
    const rawList = response.data?.payload;

    if (Array.isArray(rawList)) {
      const mapped = rawList.map(mapBackendProductToItem);
      saveAllProducts(mapped);
      return mapped;
    }

    return getStoredProducts();
  } catch (err) {
    console.warn('getMerchantProducts failed, using cached products:', err);
    return getStoredProducts();
  }
}

/**
 * Toggle product active status via PATCH /api/v1/products/:id/status
 */
export async function toggleProductStatusApi(productId: string, isActive: boolean): Promise<ProductResponse> {
  try {
    const response = await api.patch(`/api/v1/products/${productId}/status`, {
      is_active: isActive,
    });
    const updated = response.data?.payload as ProductResponse;
    return updated;
  } catch (err) {
    const msg = extractApiErrorMessage(err, 'Gagal mengubah status produk.');
    throw new Error(msg);
  }
}

/**
 * Delete product via DELETE /api/v1/products/:id
 */
export async function deleteProductApi(productId: string): Promise<void> {
  try {
    await api.delete(`/api/v1/products/${productId}`);
  } catch (err) {
    const msg = extractApiErrorMessage(err, 'Gagal menghapus produk.');
    throw new Error(msg);
  }
}

export interface PublicProductItem {
  id: string;
  store_id?: string;
  store_name?: string;
  name: string;
  description?: string;
  main_image_url?: string;
  stock: number;
  normal_price: number;
  rescue_price: number;
  discount_percentage?: number;
  operational_start?: string;
  operational_end?: string;
  pickup_time?: string;
  distance_km?: number;
}

export interface GetPublicProductsParams {
  latitude?: number;
  longitude?: number;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch marketplace public products via GET /api/v1/products.
 * Supports location coordinates (latitude, longitude) for dynamic distance calculation.
 */
export async function getPublicProducts(params?: GetPublicProductsParams): Promise<PublicProductItem[]> {
  try {
    const response = await api.get('/api/v1/products', { params });
    const payload = response.data?.payload;
    if (payload && Array.isArray(payload.products)) {
      return payload.products as PublicProductItem[];
    }
    return [];
  } catch (err) {
    console.warn('getPublicProducts failed, fallback to local/mock products:', err);
    return [];
  }
}
