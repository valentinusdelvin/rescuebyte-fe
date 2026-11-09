import { useState, useMemo, useEffect, useCallback } from 'react';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerFooter } from '../../components/customer/CustomerFooter';
import { CustomerMysteryBox } from '../../types';
import { parseHash } from '../../app/hashRouting';
import { getAllStores } from '../../services/storeService';
import { getPublicProducts, getStoredProducts } from '../../services/productService';
import { calculateDistanceKm, formatDistanceKm, getUserCoordinates } from '../../services/locationService';
import { useStoreReviews, useStoreProductReviews } from '../../hooks/useReviews';
import { reviewApi } from '../../api/services/reviewApi';
import {
  StoreHero,
  StoreTabs,
  StoreInfoCard,
  StoreDaganganGrid,
  StoreReviewsList,
  StoreDetailTab,
  StoreProductItem,
  StoreReviewItem,
  StoreDetailInfo,
} from '../../components/customer/store';
import cardPastry from '../../assets/customer/card-monsieur-spoon.jpg';

function formatReviewDate(dateStr?: string): string {
  if (!dateStr) return 'Baru saja';
  if (/[a-zA-Z]/.test(dateStr) && !dateStr.includes('T')) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export interface CustomerStoreDetailProps {
  storeName?: string;
  storeId?: string;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateProfile?: () => void;
  onNavigateOrders?: () => void;
  onNavigateProductDetail?: (product: CustomerMysteryBox) => void;
  onNavigateSeller?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function CustomerStoreDetail({
  storeName,
  storeId,
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateProfile,
  onNavigateOrders,
  onNavigateProductDetail,
  onNavigateSeller,
  onShowToast,
}: CustomerStoreDetailProps) {
  const [activeTab, setActiveTab] = useState<StoreDetailTab>('tentang');

  // Resilient smooth scrolling to #ulasan-pelanggan
  const scrollToReviews = useCallback(() => {
    setActiveTab('ulasan');
    let attempts = 0;
    const maxAttempts = 30;

    const tryScroll = () => {
      const el = document.getElementById('ulasan-pelanggan');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempts < maxAttempts) {
        attempts++;
        requestAnimationFrame(tryScroll);
      }
    };

    requestAnimationFrame(tryScroll);
  }, []);

  // Detect section=ulasan-pelanggan or #ulasan-pelanggan on mount
  useEffect(() => {
    const { params, anchor } = parseHash();
    const section = params.get('section') || anchor;
    if (section === 'ulasan-pelanggan' || window.location.hash.includes('ulasan-pelanggan')) {
      scrollToReviews();
    }
  }, [scrollToReviews]);

  // Listen to hash changes while mounted
  useEffect(() => {
    const handleHash = () => {
      const { params, anchor } = parseHash();
      const section = params.get('section') || anchor;
      if (section === 'ulasan-pelanggan' || window.location.hash.includes('ulasan-pelanggan')) {
        scrollToReviews();
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [scrollToReviews]);

  // Resolve store name from prop, localStorage, or fallback to Toko Rejak
  const effectiveStoreName = useMemo(() => {
    if (storeName && storeName.trim() && storeName.trim() !== 'TerasRasa Bakery') return storeName.trim();
    try {
      const savedStore = localStorage.getItem('rescuebyte_selected_store');
      if (savedStore && savedStore.trim() && savedStore.trim() !== 'TerasRasa Bakery') return savedStore.trim();
      const sellerStore = localStorage.getItem('rescuebyte_store_name');
      if (sellerStore && sellerStore.trim() && sellerStore.trim() !== 'TerasRasa Bakery') return sellerStore.trim();
    } catch { }
    return 'Toko Rejak';
  }, [storeName]);

  // Clean up any stale legacy TerasRasa Bakery in localStorage
  useEffect(() => {
    try {
      if (localStorage.getItem('rescuebyte_selected_store') === 'TerasRasa Bakery') {
        localStorage.setItem('rescuebyte_selected_store', 'Toko Rejak');
      }
    } catch { }
  }, []);

  // Dynamic store data initialized cleanly with honest zero defaults
  const [storeData, setStoreData] = useState<StoreDetailInfo>(() => ({
    name: effectiveStoreName,
    category: 'Kuliner & Pangan Surplus',
    status: 'Buka',
    rating: 0,
    reviewCount: 0,
    distance: '',
    area: '',
    address: '',
    operationalHours: '',
    pickupHours: '',
    email: '',
    phone: '',
    socialMedia: '',
    description: '',
    avatarUrl: '',
  }));

  // Track resolved store backend UUID
  const [resolvedStoreId, setResolvedStoreId] = useState<string | undefined>(storeId);

  useEffect(() => {
    if (storeId) {
      setResolvedStoreId(storeId);
    }
  }, [storeId]);

  // Live reviews & rating summary from backend API
  const {
    reviews: rawReviews,
    averageRating,
    totalReviews,
  } = useStoreReviews(resolvedStoreId, undefined, { autoFetch: Boolean(resolvedStoreId) });

  // Sync storeData rating & reviewCount reactively whenever backend summary changes
  useEffect(() => {
    setStoreData((prev) => ({
      ...prev,
      rating: averageRating,
      reviewCount: totalReviews,
    }));
  }, [averageRating, totalReviews]);

  // Initial store products
  const [storeProducts, setStoreProducts] = useState<StoreProductItem[]>([]);

  // Fetch product reviews for products belonging to this store
  const {
    productReviews: storeProductReviews,
    isLoading: isProductReviewsLoading,
  } = useStoreProductReviews(storeProducts);

  // Sync store profile & products dynamically from backend API & local storage
  useEffect(() => {
    let isCancelled = false;

    async function loadStoreAndProducts() {
      try {
        const currentTarget = effectiveStoreName.trim().toLowerCase();

        // 1. Fetch live stores from backend GET /api/v1/stores
        const stores = await getAllStores();
        if (isCancelled) return;

        // Find store in backend list by storeId first, then name
        const matchedBackendStore =
          (storeId ? stores.find((s) => s.id === storeId) : undefined) ||
          stores.find((s) => {
            const sName = (s.name || '').toLowerCase();
            return sName === currentTarget || sName.includes(currentTarget) || currentTarget.includes(sName);
          }) ||
          (currentTarget.includes('rejak') ? stores.find((s) => (s.name || '').toLowerCase().includes('rejak')) : undefined);

        if (matchedBackendStore) {
          if (matchedBackendStore.id && matchedBackendStore.id !== resolvedStoreId) {
            setResolvedStoreId(matchedBackendStore.id);
          }

          const fullAddress = [
            matchedBackendStore.address,
            matchedBackendStore.district,
            matchedBackendStore.city,
          ]
            .filter(Boolean)
            .join(', ');

          const opStart = matchedBackendStore.operational_start
            ? matchedBackendStore.operational_start.slice(0, 5)
            : '08:00';
          const opEnd = matchedBackendStore.operational_end
            ? matchedBackendStore.operational_end.slice(0, 5)
            : '23:59';

          const isStoreActive = matchedBackendStore.status
            ? matchedBackendStore.status.toUpperCase() === 'ACTIVE'
            : true;
          const displayStatus = isStoreActive ? 'Buka' : 'Tutup';

          const daysText = (() => {
            const days = matchedBackendStore.operational_days;
            if (!days || days.length === 0 || days.length === 7) return 'Senin - Minggu';
            const DAY_NAMES: Record<number, string> = {
              1: 'Senin',
              2: 'Selasa',
              3: 'Rabu',
              4: 'Kamis',
              5: 'Jumat',
              6: 'Sabtu',
              7: 'Minggu',
            };
            const sorted = [...days].sort((a, b) => a - b);
            const isConsecutive = sorted.every((d, idx) => idx === 0 || d === sorted[idx - 1] + 1);
            if (isConsecutive && sorted.length > 1) {
              return `${DAY_NAMES[sorted[0]]} - ${DAY_NAMES[sorted[sorted.length - 1]]}`;
            }
            return sorted.map((d) => DAY_NAMES[d] || '').filter(Boolean).join(', ');
          })();

          const userCoords = getUserCoordinates();
          const storeLat = Number(matchedBackendStore.latitude);
          const storeLng = Number(matchedBackendStore.longitude);
          const dynamicDistance =
            !isNaN(storeLat) && !isNaN(storeLng) && (storeLat !== 0 || storeLng !== 0)
              ? formatDistanceKm(calculateDistanceKm(userCoords.lat, userCoords.lng, storeLat, storeLng))
              : '0.0 km';

          setStoreData((prev) => ({
            ...prev,
            id: matchedBackendStore.id,
            name: matchedBackendStore.name,
            category: 'Aneka Makanan Berat & Kuliner',
            status: displayStatus,
            distance: dynamicDistance,
            area: matchedBackendStore.district
              ? `${matchedBackendStore.district}, ${matchedBackendStore.city || 'Malang'}`
              : matchedBackendStore.city || 'Kota Malang',
            address: fullAddress || matchedBackendStore.address || '-',
            operationalHours: daysText || 'Senin - Minggu',
            pickupHours: `${opStart} - ${opEnd} WIB`,
            email: matchedBackendStore.email || '-',
            phone: matchedBackendStore.whatsapp_number || '-',
            socialMedia: `@${matchedBackendStore.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            description: matchedBackendStore.description || '',
            avatarUrl: matchedBackendStore.profile_picture_url || cardPastry,
          }));
        }

        const targetStoreId = matchedBackendStore?.id || storeId;

        // Fetch real store summary statistics from dedicated backend endpoint
        if (targetStoreId) {
          try {
            const summary = await reviewApi.getStoreSummary(targetStoreId);
            if (!isCancelled && summary) {
              setStoreData((prev) => ({
                ...prev,
                rating: summary.average_rating > 0 ? Math.round(summary.average_rating * 10) / 10 : 0,
                reviewCount: summary.total_reviews ?? 0,
              }));
            }
          } catch {
            // Silently fall back to useStoreReviews hook calculation
          }
        }
        const userCoords = getUserCoordinates();

        // 2. Fetch live products from backend GET /api/v1/products?store_id=... with coordinates & localStorage
        const [publicProducts, localStored] = await Promise.all([
          getPublicProducts({
            store_id: targetStoreId || undefined,
            latitude: userCoords.lat,
            longitude: userCoords.lng,
          }).catch(() => []),
          Promise.resolve(getStoredProducts()),
        ]);
        if (isCancelled) return;

        // If backend returned distance_km on products, use backend-calculated distance
        if (publicProducts[0] && typeof publicProducts[0].distance_km === 'number') {
          const apiDistance = formatDistanceKm(publicProducts[0].distance_km);
          setStoreData((prev) => ({ ...prev, distance: apiDistance }));
        }

        const liveItems: StoreProductItem[] = [];

        // Match from backend public products strictly by store
        publicProducts.forEach((p) => {
          const isMatch = targetStoreId
            ? p.store_id === targetStoreId
            : (p.store_name || '').toLowerCase() === currentTarget;

          if (isMatch) {
            const discount =
              p.discount_percentage ||
              (p.normal_price > 0
                ? Math.round(((p.normal_price - p.rescue_price) / p.normal_price) * 100)
                : 56);

            liveItems.push({
              id: p.id,
              name: p.name,
              category: 'Surplus Makanan',
              originalPrice: p.normal_price,
              rescuePrice: p.rescue_price,
              discountPercent: discount,
              imageSrc: p.main_image_url || cardPastry,
              pickupTime: p.pickup_time || '08:00 - 23:59 WIB',
              stock: p.stock,
              description: p.description,
            });
          }
        });

        // Also check if current seller's local dagangan matches this store
        const sellerStoreName = (localStorage.getItem('rescuebyte_store_name') || '').toLowerCase();
        if (sellerStoreName && (sellerStoreName === currentTarget || currentTarget.includes(sellerStoreName))) {
          localStored
            .filter((lp) => lp.isActive !== false && lp.status !== 'nonaktif')
            .forEach((lp) => {
              if (!liveItems.some((item) => item.id === lp.id || item.name === lp.name)) {
                const discount =
                  lp.normalPrice > 0
                    ? Math.round(((lp.normalPrice - lp.rescuePrice) / lp.normalPrice) * 100)
                    : 0;

                liveItems.push({
                  id: lp.id,
                  name: lp.name,
                  category: 'Surplus Makanan',
                  originalPrice: lp.normalPrice,
                  rescuePrice: lp.rescuePrice,
                  discountPercent: discount,
                  imageSrc: lp.imageUrl || cardPastry,
                  pickupTime: '08:00 - 23:59 WIB',
                  stock: lp.stock,
                  description: lp.description,
                });
              }
            });
        }

        // Set live products from database
        setStoreProducts(liveItems);
      } catch (err) {
        console.warn('Failed to load store and products:', err);
      }
    }

    loadStoreAndProducts();

    return () => {
      isCancelled = true;
    };
  }, [effectiveStoreName, storeId]);

  // Reviews list mapped from live backend reviews
  const storeReviews: StoreReviewItem[] = useMemo(() => {
    return (rawReviews || []).map((r) => ({
      id: r.id,
      name: r.author?.name || 'Pelanggan',
      avatar: r.author?.avatar_url || '',
      rating: r.rating,
      date: formatReviewDate(r.created_at),
      comment: r.content,
      type: 'store' as const,
    }));
  }, [rawReviews]);

  const combinedTotalReviews = useMemo(() => {
    const storeCount = storeData.reviewCount || storeReviews.length;
    return storeCount + storeProductReviews.length;
  }, [storeData.reviewCount, storeReviews.length, storeProductReviews.length]);

  const handleSelectProduct = (prod: StoreProductItem) => {
    if (onNavigateProductDetail) {
      const boxItem: CustomerMysteryBox = {
        id: prod.id,
        storeName: storeData.name,
        category: prod.name,
        categoryBadge: prod.name,
        distanceText: storeData.distance,
        remainingBoxesText: `Sisa ${prod.stock ?? 0} Box`,
        discountPercent: prod.discountPercent,
        originalPrice: prod.originalPrice,
        rescuePrice: prod.rescuePrice,
        pickupTime: prod.pickupTime || storeData.pickupHours,
        description:
          prod.description ||
          `${prod.name} dari ${storeData.name}. Berisi sajian pilihan harian berkualitas tinggi.`,
        tags: [storeData.name, storeData.category, '✓ Halal MUI', 'Surplus Harian'],
        rating: storeData.rating,
        reviewCount: storeData.reviewCount,
        imageSrc: prod.imageSrc,
      };
      onNavigateProductDetail(boxItem);
    } else {
      onShowToast?.(`Melihat ${prod.name}`, 'info');
    }
  };

  const handleOpenGoogleMaps = () => {
    const query = `${storeData.name} ${storeData.address}`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleHeaderTab = (tab: 'beranda' | 'marketplace' | 'kontak') => {
    if (tab === 'beranda') {
      if (onNavigateHome) onNavigateHome();
      else window.location.hash = '#beranda-customer';
    } else if (tab === 'marketplace') {
      if (onNavigateMarketplace) onNavigateMarketplace();
      else window.location.hash = '#marketplace';
    } else if (tab === 'kontak') {
      window.location.hash = '#kontak';
    }
  };

  return (
    <div
      className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between"
      id="customer-store-detail-page"
    >
      <div className="flex flex-col flex-1">
        <CustomerHeader
          activeTab="marketplace"
          onSelectTab={handleHeaderTab}
          onNavigateSeller={onNavigateSeller}
          onNavigateProfile={onNavigateProfile}
          onNavigateOrders={onNavigateOrders}
          onShowToast={onShowToast}
        />

        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 flex-1">
          <StoreHero
            storeData={storeData}
            onOpenGoogleMaps={handleOpenGoogleMaps}
            onScrollToReviews={scrollToReviews}
          />

          <StoreTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            productCount={storeProducts.length}
            reviewCount={combinedTotalReviews}
          />

          {activeTab === 'tentang' && (
            <StoreInfoCard
              storeData={storeData}
              storeProducts={storeProducts}
              onNavigateToProducts={() => setActiveTab('produk')}
              onNavigateToReviews={scrollToReviews}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {activeTab === 'produk' && (
            <StoreDaganganGrid
              products={storeProducts}
              distanceText={storeData.distance}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {(activeTab === 'tentang' || activeTab === 'ulasan') && (
            <StoreReviewsList
              reviews={storeReviews}
              storeReviews={storeReviews}
              productReviews={storeProductReviews}
              storeProducts={storeProducts}
              reviewCount={combinedTotalReviews}
              storeId={resolvedStoreId || storeId}
              onSelectProduct={handleSelectProduct}
              isLoadingProductReviews={isProductReviewsLoading}
            />
          )}
        </main>
      </div>

      <CustomerFooter variant="compact" onNavigateSeller={onNavigateSeller} />
    </div>
  );
}

export default CustomerStoreDetail;
