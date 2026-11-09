import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartResponse, BackendStoreCartGroup } from '../api/types';
import { cartApi } from '../api/services/cartApi';
import { extractErrorMessage } from '../api/client';
import { useAuthContext } from './AuthContext';

export interface CartContextValue {
  cart: CartResponse | null;
  stores: BackendStoreCartGroup[];
  count: number;
  subtotal: number;
  totalPayment: number;
  isLoading: boolean;
  error: string | null;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQty: (itemId: string, quantity: number) => Promise<void>;
  clearStore: (storeId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<CartResponse | null>;
  clearError: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshCart = useCallback(async (): Promise<CartResponse | null> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setCart(null);
      return null;
    }

    setIsLoading(true);
    try {
      const response = await cartApi.getCart();
      setCart(response);
      return response;
    } catch (err) {
      console.warn('Failed to fetch backend cart:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sinkronkan isi keranjang saat status autentikasi berubah
  useEffect(() => {
    if (isAuthenticated) {
      void refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, refreshCart]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await cartApi.addItem({
          product_variant_id: variantId,
          quantity,
        });
        await refreshCart();
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal menambahkan produk ke keranjang.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (itemId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await cartApi.removeItem(itemId);
        await refreshCart();
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal menghapus item dari keranjang.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart]
  );

  const updateQty = useCallback(
    async (itemId: string, quantity: number): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await cartApi.updateItemQty(itemId, { quantity });
        await refreshCart();
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal memperbarui jumlah item.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart]
  );

  const clearStore = useCallback(
    async (storeId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await cartApi.removeStoreItems(storeId);
        await refreshCart();
      } catch (err) {
        const msg = extractErrorMessage(err, 'Gagal menghapus produk toko dari keranjang.');
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart]
  );

  const clearCart = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await cartApi.clearCart();
      setCart(null);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Gagal mengosongkan keranjang.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hitung akumulasi total kuantitas item dan subtotal harga
  const stores = cart?.stores || [];
  const count =
    cart?.total_items ??
    cart?.total_boxes ??
    stores.reduce(
      (acc, s) => acc + (s.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0),
      0
    );

  const subtotal = cart?.subtotal ?? 0;
  const totalPayment = cart?.total_payment ?? subtotal;

  const value: CartContextValue = {
    cart,
    stores,
    count,
    subtotal,
    totalPayment,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQty,
    clearStore,
    clearCart,
    refreshCart,
    clearError,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
