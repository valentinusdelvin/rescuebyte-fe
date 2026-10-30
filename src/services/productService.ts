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

export type DeleteProductResult =
  | { type: 'deleted' }
  | { type: 'deactivated'; product: ProductResponse };

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
 * Automatically filters out legacy mock placeholder products and ensures fallback to real initial products.
 */
export function getStoredProducts(): ProductItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const realProducts = parsed.filter(
        (p: ProductItem) =>
          p &&
          p.id &&
          !['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6'].includes(p.id) &&
          !p.name.startsWith('Mystery ')
      );
      if (realProducts.length > 0) {
        return realProducts;
      }
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

  try {
    const rawMarketplaceProducts = localStorage.getItem('rescuebyte_cached_marketplace_products');
    if (rawMarketplaceProducts) {
      const marketplaceProducts: unknown = JSON.parse(rawMarketplaceProducts);
      if (Array.isArray(marketplaceProducts)) {
        const remainingMarketplaceProducts = marketplaceProducts.filter(
          (item) => item && typeof item === 'object' && 'id' in item && item.id !== id
        );
        localStorage.setItem(
          'rescuebyte_cached_marketplace_products',
          JSON.stringify(remainingMarketplaceProducts)
        );
      }
    }
  } catch (err) {
    console.warn('Failed to remove product from marketplace cache:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rescuebyte_product_updated', { detail: { id, deleted: true } }));
  }
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
 * Maps a backend ProductResponse or PublicProductItem to frontend ProductItem model.
 */
export function mapBackendProductToItem(p: any): ProductItem {
  const stock =
    typeof p.stock === 'number'
      ? p.stock
      : p.total_current_stock ?? p.variants?.[0]?.current_stock ?? 0;

  const maxStock =
    typeof p.maxStock === 'number'
      ? p.maxStock
      : p.total_initial_stock ?? p.variants?.[0]?.initial_stock ?? stock;

  const normalPrice =
    typeof p.normal_price === 'number'
      ? p.normal_price
      : p.min_normal_price ?? p.variants?.[0]?.normal_price ?? 0;

  const rescuePrice =
    typeof p.rescue_price === 'number'
      ? p.rescue_price
      : p.min_rescue_price ?? p.variants?.[0]?.rescue_price ?? 0;

  const isActive =
    p.is_active !== undefined
      ? Boolean(p.is_active)
      : p.isActive !== undefined
      ? Boolean(p.isActive)
      : true;

  let status: 'aktif' | 'segera_habis' | 'habis' | 'nonaktif' = 'aktif';
  if (!isActive) {
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
    isActive,
    imageUrl: p.main_image_url || p.images?.[0]?.image_url || p.imageUrl,
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
 * Fetch the merchant's product list from GET /api/v1/products/me/list.
 * A successful empty response is authoritative; cached data is used only when the request fails.
 */
export async function getMerchantProducts(params?: GetMerchantProductsParams): Promise<ProductItem[]> {
  try {
    const response = await api.get('/api/v1/products/me/list', { params });
    const rawList = response.data?.payload;

    const list = Array.isArray(rawList)
      ? rawList
      : Array.isArray(rawList?.products)
      ? rawList.products
      : Array.isArray(rawList?.items)
      ? rawList.items
      : null;

    if (list) {
      const mapped = list.map(mapBackendProductToItem);
      saveAllProducts(mapped);
      return mapped;
    }

    throw new Error('Format daftar produk dari server tidak dikenali.');
  } catch (err) {
    console.warn('getMerchantProducts failed, using the local merchant cache:', err);
  }

  return getStoredProducts();
}

/**
 * Toggle product active status via PATCH /api/v1/products/:id/status
 */
export async function toggleProductStatusApi(productId: string, isActive: boolean): Promise<ProductResponse> {
  try {
    const response = await api.patch(`/api/v1/products/${productId}/status`, {
      is_active: isActive,
    });
    const updated = response.data?.payload as ProductResponse | undefined;
    if (
      !updated ||
      updated.id !== productId ||
      typeof updated.is_active !== 'boolean' ||
      updated.is_active !== isActive
    ) {
      throw new Error('Server tidak mengembalikan status produk terbaru.');
    }
    return updated;
  } catch (err) {
    const msg = extractApiErrorMessage(err, 'Gagal mengubah status produk.');
    throw new Error(msg);
  }
}

/**
 * Delete product via DELETE /api/v1/products/:id
 */
export async function deleteProductApi(productId: string): Promise<DeleteProductResult> {
  try {
    await api.delete(`/api/v1/products/${productId}`);
    return { type: 'deleted' };
  } catch (err) {
    const msg = extractApiErrorMessage(err, 'Gagal menghapus produk.');
    if (/order_items|foreign key|still referenced/i.test(msg)) {
      try {
        const product = await toggleProductStatusApi(productId, false);
        if (product.is_active) {
          throw new Error('Server belum menonaktifkan produk.');
        }
        return { type: 'deactivated', product };
      } catch (deactivateErr) {
        const deactivateMsg = extractApiErrorMessage(
          deactivateErr,
          'Produk memiliki riwayat pesanan dan gagal dinonaktifkan.'
        );
        throw new Error(deactivateMsg);
      }
    }

    throw new Error(msg);
  }
}

/**
 * Synchronize product updates to the marketplace cached items in localStorage
 */
export function syncProductToMarketplaceCache(
  productId: string,
  updates: {
    status?: 'aktif' | 'segera_habis' | 'habis' | 'nonaktif';
    isActive?: boolean;
    stock?: number;
    name?: string;
  }
): void {
  try {
    const raw = localStorage.getItem('rescuebyte_cached_marketplace_products');
    if (!raw) return;
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return;

    const isNonaktif = updates.status === 'nonaktif' || updates.isActive === false;
    const stockDisplay = isNonaktif ? 0 : (updates.stock ?? 0);

    const updated = items.map((item: any) => {
      if (item.id === productId || (updates.name && item.productName === updates.name)) {
        return {
          ...item,
          stock: stockDisplay,
          remainingBoxesText: `Sisa ${stockDisplay} Box`,
        };
      }
      return item;
    });

    localStorage.setItem('rescuebyte_cached_marketplace_products', JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to sync product to marketplace cache:', err);
  }
}

/**
 * Update product stock both in local cache and backend database.
 */
export async function updateProductStockApi(
  item: ProductItem,
  newStock: number,
  nextStatus?: 'aktif' | 'segera_habis' | 'habis' | 'nonaktif'
): Promise<ProductItem> {
  if (!Number.isInteger(newStock) || newStock < 0) {
    throw new Error('Stok harus berupa bilangan bulat nol atau lebih.');
  }
  if (!item.id || item.id.startsWith('prod-')) {
    throw new Error('Produk ini belum memiliki ID dari server, jadi stoknya tidak dapat disimpan.');
  }

  try {
    const response = await api.put(`/api/v1/products/${item.id}`, {
      name: item.name,
      description: item.description,
      is_active: item.isActive ?? item.status !== 'nonaktif',
      main_image_url: item.imageUrl || '',
      stock: newStock,
    });
    const updated = response.data?.payload as ProductResponse | undefined;
    if (!updated || updated.id !== item.id) {
      throw new Error('Server tidak mengembalikan data produk terbaru.');
    }

    const mapped = mapBackendProductToItem(updated);
    if (mapped.stock !== newStock) {
      throw new Error('Stok yang dikembalikan server tidak sesuai dengan perubahan.');
    }

    const confirmedItem = {
      ...mapped,
      createdAt: item.createdAt || mapped.createdAt,
      status: nextStatus || mapped.status,
    };
    updateProduct(item.id, confirmedItem);
    syncProductToMarketplaceCache(item.id, {
      stock: confirmedItem.stock,
      status: confirmedItem.status,
      isActive: confirmedItem.isActive,
      name: confirmedItem.name,
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rescuebyte_product_updated', {
        detail: {
          id: item.id,
          stock: confirmedItem.stock,
          status: confirmedItem.status,
          isActive: confirmedItem.isActive,
        },
      }));
    }

    return confirmedItem;
  } catch (err) {
    const message = extractApiErrorMessage(err, 'Gagal memperbarui stok produk.');
    throw new Error(message);
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
  store_id?: string;
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

    throw new Error('Format daftar produk publik dari server tidak dikenali.');
  } catch (err) {
    console.warn('getPublicProducts failed:', err);
    throw err;
  }
}
