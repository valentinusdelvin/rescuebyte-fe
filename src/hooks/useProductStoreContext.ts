import { useEffect, useMemo, useState } from 'react';
import { StoreResponse } from '../api/types';
import { getAllStores } from '../services/storeService';

interface UseProductStoreContextOptions {
  productStoreId?: string;
  productStoreAvatar?: string;
  storeName: string;
}

export function useProductStoreContext({ productStoreId, productStoreAvatar, storeName }: UseProductStoreContextOptions) {
  const hashStoreId = useMemo(() => {
    try {
      const hash = window.location.hash || '';
      const query = hash.includes('?') ? hash.split('?')[1] : '';
      const params = new URLSearchParams(query);
      return params.get('storeId') || params.get('store_id') || undefined;
    } catch {
      return undefined;
    }
  }, []);

  const lookupKey = `${productStoreId || hashStoreId || ''}:${storeName.toLowerCase()}`;
  const [storeLookup, setStoreLookup] = useState<{ key: string; store: StoreResponse } | null>(null);
  const matchedStore = storeLookup?.key === lookupKey ? storeLookup.store : undefined;

  useEffect(() => {
    let isCancelled = false;
    getAllStores()
      .then((stores) => {
        if (isCancelled || !stores) return;
        const storeId = productStoreId || hashStoreId;
        const matchingStore = stores.find((store) =>
          (store.id && storeId && (store.id === storeId || storeId.includes(store.id))) ||
          (store.name && storeName && store.name.toLowerCase() === storeName.toLowerCase())
        );
        if (matchingStore) setStoreLookup({ key: lookupKey, store: matchingStore });
      })
      .catch(() => {});
    return () => {
      isCancelled = true;
    };
  }, [lookupKey, productStoreId, hashStoreId, storeName]);

  return {
    resolvedStoreId: matchedStore?.id || productStoreId || hashStoreId,
    storeAvatarUrl: productStoreAvatar || matchedStore?.profile_picture_url || null,
  };
}
