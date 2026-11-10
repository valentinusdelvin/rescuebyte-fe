import { useCallback, useEffect, useRef, useState } from 'react';
import { getPublicProducts } from '../services/productService';
import { batchFetchProductRatings } from '../services/productRatingService';
import {
  getInitialMarketplaceProducts,
  mapPublicProductToItem,
  MARKETPLACE_CACHE_KEY,
  MarketplaceBoxItem,
} from '../features/customer/marketplace/model';

export interface MarketplaceCoordinates {
  lat: number;
  lng: number;
}

export function useMarketplaceProducts(coordinates: MarketplaceCoordinates) {
  const [products, setProducts] = useState<MarketplaceBoxItem[]>(getInitialMarketplaceProducts);
  const [isLoading, setIsLoading] = useState(() => getInitialMarketplaceProducts().length === 0);
  const hasProductsRef = useRef(products.length > 0);

  useEffect(() => {
    hasProductsRef.current = products.length > 0;
  }, [products.length]);

  const fetchProducts = useCallback(async (coords: MarketplaceCoordinates, query?: string) => {
    if (!hasProductsRef.current) setIsLoading(true);
    try {
      const publicItems = await getPublicProducts({
        latitude: coords.lat,
        longitude: coords.lng,
        search: query?.trim() || undefined,
      });
      const ratingMap = await batchFetchProductRatings(publicItems.map((product) => product.id));
      const mappedProducts = publicItems.map((product) => {
        const summary = ratingMap.get(product.id) || { rating: 0, reviewCount: 0 };
        return mapPublicProductToItem({
          ...product,
          rating: summary.rating,
          review_count: summary.reviewCount,
        }, 'Malang');
      });

      setProducts(mappedProducts);
      try {
        localStorage.setItem(MARKETPLACE_CACHE_KEY, JSON.stringify(mappedProducts));
      } catch {
        // Cache is an optimization; an unavailable storage must not block the listing.
      }
    } catch (error) {
      console.warn('Gagal mengambil produk marketplace:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts(coordinates);
  }, [coordinates, fetchProducts]);

  useEffect(() => {
    const handleProductUpdated = () => void fetchProducts(coordinates);
    window.addEventListener('rescuebyte_product_updated', handleProductUpdated);
    return () => window.removeEventListener('rescuebyte_product_updated', handleProductUpdated);
  }, [coordinates, fetchProducts]);

  return { products, isLoading, fetchProducts };
}
