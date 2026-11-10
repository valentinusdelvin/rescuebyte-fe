import { useEffect, useState } from 'react';
import {
  CustomerOrderItem,
  fetchCustomerOrdersApi,
  getCustomerOrders,
  subscribeToOrders,
} from '../services/orderService';
import { getAllStores } from '../services/storeService';

export function useCustomerOrderHistoryData() {
  const [orders, setOrders] = useState<CustomerOrderItem[]>(getCustomerOrders);
  const [storeAvatars, setStoreAvatars] = useState<Record<string, string>>({});
  const [storeAddresses, setStoreAddresses] = useState<Record<string, string>>({});

  useEffect(() => subscribeToOrders(setOrders), []);

  useEffect(() => {
    let isCancelled = false;
    getAllStores()
      .then((stores) => {
        if (isCancelled || !stores) return;
        const avatars: Record<string, string> = {};
        const addresses: Record<string, string> = {};
        stores.forEach((store) => {
          if (store.profile_picture_url) {
            if (store.name) avatars[store.name.trim().toLowerCase()] = store.profile_picture_url;
            if (store.id) avatars[store.id] = store.profile_picture_url;
          }
          const fullAddress = [store.address, store.district, store.city].filter(Boolean).join(', ');
          if (fullAddress) {
            if (store.name) addresses[store.name.trim().toLowerCase()] = fullAddress;
            if (store.id) addresses[store.id] = fullAddress;
          }
        });
        setStoreAvatars(avatars);
        setStoreAddresses(addresses);
      })
      .catch(() => {});
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let refreshTimer: number | undefined;

    async function loadBackendOrders() {
      try {
        const backendOrders = await fetchCustomerOrdersApi();
        if (!isCancelled && backendOrders !== null) setOrders(backendOrders);
      } catch (error) {
        console.warn('Gagal memuat pesanan dari backend:', error);
      } finally {
        if (!isCancelled) refreshTimer = window.setTimeout(() => void loadBackendOrders(), 15000);
      }
    }

    void loadBackendOrders();
    return () => {
      isCancelled = true;
      if (refreshTimer) window.clearTimeout(refreshTimer);
    };
  }, []);

  return { orders, setOrders, storeAvatars, storeAddresses };
}
