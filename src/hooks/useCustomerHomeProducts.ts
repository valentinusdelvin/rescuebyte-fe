import { useEffect, useState } from 'react';
import { getPublicProducts } from '../services/productService';
import { batchFetchProductRatings } from '../services/productRatingService';
import { CustomerMysteryBox } from '../types';
import { getCachedBoxes, mapPublicProductToCustomerBox } from '../features/customer/home/model';

interface HomeCoordinates {
  lat: number;
  lng: number;
}

export function useCustomerHomeProducts(coordinates: HomeCoordinates) {
  const [cached] = useState(getCachedBoxes);
  const [nearbyBoxes, setNearbyBoxes] = useState<CustomerMysteryBox[]>(cached.nearby);
  const [bestSellerBoxes, setBestSellerBoxes] = useState<CustomerMysteryBox[]>(cached.bestSeller);
  const [isLoadingNearby, setIsLoadingNearby] = useState(cached.nearby.length === 0);
  const [isLoadingBestSeller, setIsLoadingBestSeller] = useState(cached.bestSeller.length === 0);

  useEffect(() => {
    let isMounted = true;
    async function loadNearbyBoxes() {
      try {
        setIsLoadingNearby(true);
        const products = await getPublicProducts({ latitude: coordinates.lat, longitude: coordinates.lng, limit: 30 });
        if (!isMounted) return;
        if (products.length > 0) {
          const uniqueProducts = Array.from(new Map(products.map((product) => [product.id, product])).values());
          const nearestAvailable = uniqueProducts
            .filter((product) => product.stock > 0)
            .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
            .slice(0, 3);
          const ratingMap = await batchFetchProductRatings(nearestAvailable.map((product) => product.id));
          if (!isMounted) return;
          setNearbyBoxes(nearestAvailable.map((product) => {
            const summary = ratingMap.get(product.id) || { rating: 0, reviewCount: 0 };
            return mapPublicProductToCustomerBox({
              ...product,
              rating: summary.rating,
              review_count: summary.reviewCount,
            }, false);
          }));
        } else {
          setNearbyBoxes([]);
        }
      } catch (error) {
        console.warn('Gagal memuat produk sekitar untuk CustomerHome:', error);
      } finally {
        if (isMounted) setIsLoadingNearby(false);
      }
    }
    void loadNearbyBoxes();
    return () => {
      isMounted = false;
    };
  }, [coordinates.lat, coordinates.lng]);

  useEffect(() => {
    let isMounted = true;
    async function loadBestSellerBoxes() {
      try {
        setIsLoadingBestSeller(true);
        const products = await getPublicProducts({ limit: 10 });
        if (!isMounted) return;
        if (products.length > 0) {
          const uniqueProducts = Array.from(new Map(products.map((product) => [product.id, product])).values())
            .filter((product) => product.stock > 0);
          const ratingMap = await batchFetchProductRatings(uniqueProducts.map((product) => product.id));
          if (!isMounted) return;
          setBestSellerBoxes(uniqueProducts
            .map((product) => {
              const summary = ratingMap.get(product.id) || { rating: 0, reviewCount: 0 };
              return {
                product: {
                  ...product,
                  rating: summary.rating,
                  review_count: summary.reviewCount,
                },
                reviewCount: summary.reviewCount,
              };
            })
            .sort((a, b) => b.reviewCount - a.reviewCount ||
              (b.product.discount_percentage ?? 0) - (a.product.discount_percentage ?? 0))
            .slice(0, 3)
            .map(({ product }) => mapPublicProductToCustomerBox(product, true)));
        } else {
          setBestSellerBoxes([]);
        }
      } catch (error) {
        console.warn('Gagal memuat produk terlaris untuk CustomerHome:', error);
      } finally {
        if (isMounted) setIsLoadingBestSeller(false);
      }
    }
    void loadBestSellerBoxes();
    return () => {
      isMounted = false;
    };
  }, []);

  return { nearbyBoxes, bestSellerBoxes, isLoadingNearby, isLoadingBestSeller };
}
