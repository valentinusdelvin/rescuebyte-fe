import { useCartContext } from '../context/CartContext';

/**
 * Custom hook providing shopping cart state and backend-synchronized mutation actions.
 */
export function useCart() {
  return useCartContext();
}

export default useCart;
