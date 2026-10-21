import { ProductItem } from '../types';

const STORAGE_KEY = 'rescuebyte_merchant_products';

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Mystery Meal Box',
    description: 'Berisi makanan siap santap dengan variasi menu lezat',
    normalPrice: 45000,
    rescuePrice: 25000,
    stock: 5,
    maxStock: 10,
    status: 'aktif',
    createdAt: 'Dibuat 8 Okt 2026, 14:30',
  },
  {
    id: 'prod-2',
    name: 'Mystery Pastry & Bakery Box',
    description: 'Roti dan pastry artisan pilihan hari ini dengan kualitas terjaga',
    normalPrice: 40000,
    rescuePrice: 20000,
    stock: 4,
    maxStock: 8,
    status: 'aktif',
    createdAt: 'Dibuat 8 Okt 2026, 13:15',
  },
  {
    id: 'prod-3',
    name: 'Mystery Fresh Bento Box',
    description: 'Set bento lengkap dengan lauk pauk segar dan sayuran',
    normalPrice: 50000,
    rescuePrice: 28000,
    stock: 2,
    maxStock: 6,
    status: 'segera_habis',
    createdAt: 'Dibuat 7 Okt 2026, 16:45',
  },
  {
    id: 'prod-4',
    name: 'Mystery Dessert Delight',
    description: 'Kudapan manis dan dessert spesial surplus higienis',
    normalPrice: 35000,
    rescuePrice: 18000,
    stock: 0,
    maxStock: 5,
    status: 'habis',
    createdAt: 'Dibuat 7 Okt 2026, 11:20',
  },
  {
    id: 'prod-5',
    name: 'Mystery Snack Healthy Box',
    description: 'Aneka camilan sehat dan buah potong segar',
    normalPrice: 30000,
    rescuePrice: 15000,
    stock: 6,
    maxStock: 12,
    status: 'aktif',
    createdAt: 'Dibuat 6 Okt 2026, 15:10',
  },
  {
    id: 'prod-6',
    name: 'Mystery Family Meal Box',
    description: 'Porsi hemat untuk makan bersama keluarga 3-4 orang',
    normalPrice: 85000,
    rescuePrice: 48000,
    stock: 3,
    maxStock: 5,
    status: 'aktif',
    createdAt: 'Dibuat 6 Okt 2026, 09:30',
  },
];

/**
 * Get all merchant products from localStorage (fallback to initial mock data).
 */
export function getStoredProducts(): ProductItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
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
