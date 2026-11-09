import { useCartContext } from '../context/CartContext';

/** Custom hook untuk mengelola state keranjang belanja dan mutasi tersinkronisasi ke API. */
export function useCart() {
  return useCartContext();
}

export default useCart;
