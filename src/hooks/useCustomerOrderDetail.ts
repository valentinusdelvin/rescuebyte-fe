import { useCallback, useEffect, useMemo, useState } from 'react';
import { OrderDetailResponse } from '../api/types';
import {
  CustomerOrderStatus,
  PaymentOrderData,
} from '../types';
import {
  createCustomerOrder,
  fetchOrderDetailApi,
  fetchPaymentDetailsApi,
  fetchPaymentStatusApi,
  getCustomerOrders,
  mapBackendStatusToCustomerStatus,
  subscribeToCustomerOrders,
  updateCustomerOrderStatus,
} from '../services/orderService';
import { getCurrentUser } from '../services/authService';
import { getStoreById, StoreProfileData } from '../services/storeService';
import { getPublicProducts, PublicProductItem } from '../services/productService';
import { getUserCoordinates } from '../services/locationService';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';

type CustomerOrderBackendDetail = OrderDetailResponse;

interface UseCustomerOrderDetailOptions {
  orderData?: PaymentOrderData | null;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const CUSTOMER_ORDER_STATUSES: CustomerOrderStatus[] = [
  'menunggu-pembayaran',
  'menunggu-konfirmasi',
  'diproses',
  'siap-diambil',
  'selesai',
  'dibatalkan',
];

function isCustomerOrderStatus(status: unknown): status is CustomerOrderStatus {
  return typeof status === 'string' && new Set<string>(CUSTOMER_ORDER_STATUSES).has(status);
}

function hasConfirmedPayment(orderStatus: unknown): boolean {
  const status = String(orderStatus || '').toUpperCase();
  return [
    'PAID', 'SETTLEMENT', 'CAPTURE', 'PAYMENT_SUCCESS', 'SUCCESS',
    'WAITING_CONFIRMATION', 'WAITING_FOR_CONFIRMATION', 'IN_PROCESS', 'PROCESSING',
    'READY_FOR_PICKUP', 'COMPLETED', 'FINISHED',
  ].includes(status);
}

function makeFallbackOrderData(order: ReturnType<typeof getCustomerOrders>[number]): PaymentOrderData {
  const currentUser = getCurrentUser();
  return {
    orderId: order.orderNumber,
    items: [
      {
        id: order.id,
        name: order.productName,
        storeName: order.storeName,
        storeAddress: order.storeAddress,
        rescuePrice: order.finalPrice,
        quantity: order.productBoxCount,
        categoryTags: ['Penyelamatan Pangan'],
        imageSrc: order.imageUrl || cardMonsieurSpoon,
      },
    ],
    primaryStore: {
      storeId: order.storeId,
      storeName: order.storeName,
      storeAddress: order.storeAddress,
    },
    pickupDate: order.pickupDate,
    pickupTimeSlot: order.pickupTime,
    customerInfo: {
      name: currentUser?.name || 'Pelanggan RescueByte',
      phone: currentUser?.phone_number || '081234567890',
      email: currentUser?.email || 'customer@rescuebyte.com',
    },
    totalBoxes: order.productBoxCount,
    subtotal: order.finalPrice,
    grandTotal: order.finalPrice,
    status: order.status,
    createdAt: order.createdAt,
  } as PaymentOrderData;
}

export function useCustomerOrderDetail({ orderData, onShowToast }: UseCustomerOrderDetailOptions) {
  const effectiveOrderData = useMemo<PaymentOrderData | null>(() => {
    if (orderData) return orderData;
    const latestOrder = getCustomerOrders()[0];
    if (!latestOrder) return null;
    return latestOrder.orderData || makeFallbackOrderData(latestOrder);
  }, [orderData]);

  const [storeProfile, setStoreProfile] = useState<StoreProfileData | null>(null);
  const [recommendations, setRecommendations] = useState<PublicProductItem[]>([]);
  const [backendOrderDetail, setBackendOrderDetail] = useState<CustomerOrderBackendDetail | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isSnapPopupOpen, setIsSnapPopupOpen] = useState(false);
  const [isPaymentSessionLoading, setIsPaymentSessionLoading] = useState(false);
  const [retrievedPayment, setRetrievedPayment] = useState<{
    backendOrderId: string;
    snapToken?: string;
  } | null>(null);

  const profileStoreId = effectiveOrderData?.primaryStore?.storeId;
  const orderId = effectiveOrderData?.orderId || orderData?.orderId || 'RB261030-001';

  const [currentStatus, setCurrentStatus] = useState<CustomerOrderStatus>(() => {
    const initialStatus = effectiveOrderData?.status || orderData?.status;
    if (isCustomerOrderStatus(initialStatus)) return initialStatus;
    if (effectiveOrderData?.snapRedirectUrl || effectiveOrderData?.snapToken) {
      return 'menunggu-pembayaran';
    }
    return 'menunggu-konfirmasi';
  });

  useEffect(() => {
    let isMounted = true;
    const coordinates = getUserCoordinates();
    getPublicProducts({ latitude: coordinates.lat, longitude: coordinates.lng })
      .then((items) => {
        if (isMounted && items) setRecommendations(items.slice(0, 3));
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setStoreProfile(null);
    if (!profileStoreId) return () => { isMounted = false; };

    getStoreById(profileStoreId).then((profile) => {
      if (isMounted) setStoreProfile(profile);
    });
    return () => { isMounted = false; };
  }, [profileStoreId]);

  const resolvedStoreId = useMemo(
    () => backendOrderDetail?.store_id || profileStoreId || storeProfile?.id || '',
    [backendOrderDetail?.store_id, profileStoreId, storeProfile?.id]
  );

  useEffect(() => {
    const data = effectiveOrderData || orderData;
    if (isCustomerOrderStatus(data?.status)) setCurrentStatus(data.status);

    const backendOrderId = data?.backendOrderId;
    if (!backendOrderId) return;

    const needsSnapToken = !data.snapToken;
    if (needsSnapToken) setIsPaymentSessionLoading(true);
    let cancelled = false;
    let statusPollId: number | undefined;

    const refreshOrderStatus = async (includePaymentDetails: boolean) => {
      const latest = await fetchOrderDetailApi(backendOrderId);
      if (latest) setBackendOrderDetail(latest);
      const payment = includePaymentDetails ? await fetchPaymentDetailsApi(backendOrderId) : null;
      if (cancelled) return null;

      const snapToken = payment?.snap_token || latest?.payment?.snap_token || latest?.snap_token;
      if (snapToken) setRetrievedPayment({ backendOrderId, snapToken });
      if (!latest?.status) return null;

      const backendStatus = mapBackendStatusToCustomerStatus(latest.status);
      if (!(data.paymentConfirmedByGateway && backendStatus === 'menunggu-pembayaran')) {
        setCurrentStatus(backendStatus);
      }
      return backendStatus;
    };

    const loadInitialStatus = async () => {
      const attempts = data.paymentConfirmedByGateway ? 6 : 1;
      let latestStatus: CustomerOrderStatus | null = null;
      try {
        for (let attempt = 0; attempt < attempts; attempt++) {
          latestStatus = await refreshOrderStatus(true);
          if (cancelled || (latestStatus && latestStatus !== 'menunggu-pembayaran')) break;
          if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } finally {
        if (!cancelled && needsSnapToken) setIsPaymentSessionLoading(false);
      }

      const pollOrderStatus = async () => {
        const status = await refreshOrderStatus(false);
        if (!cancelled && status !== 'selesai' && status !== 'dibatalkan') {
          statusPollId = window.setTimeout(() => void pollOrderStatus(), 5000);
        }
      };

      if (!cancelled && latestStatus !== 'selesai' && latestStatus !== 'dibatalkan') {
        statusPollId = window.setTimeout(() => void pollOrderStatus(), 5000);
      }
    };

    void loadInitialStatus();
    return () => {
      cancelled = true;
      if (statusPollId) window.clearTimeout(statusPollId);
    };
  }, [effectiveOrderData, orderData]);

  useEffect(() => {
    return subscribeToCustomerOrders((orders) => {
      const found = orders.find((order) => order.orderNumber === orderId || order.id === orderId);
      if (found?.status) setCurrentStatus(found.status);
    });
  }, [orderId]);

  const activeStep = useMemo(() => {
    if (currentStatus === 'menunggu-pembayaran' || currentStatus === 'dibatalkan') return 1;
    if (currentStatus === 'menunggu-konfirmasi') return 2;
    if (currentStatus === 'diproses') return 3;
    if (currentStatus === 'siap-diambil') return 4;
    if (currentStatus === 'selesai') return 5;
    return 2;
  }, [currentStatus]);

  const handlePaymentSuccess = useCallback(async () => {
    const targetData = effectiveOrderData || orderData;
    const backendOrderId = targetData?.backendOrderId;
    if (!backendOrderId) {
      onShowToast?.('Pesanan ini belum memiliki ID backend, jadi status pembayaran belum bisa diverifikasi.', 'error');
      return;
    }

    setIsVerifyingPayment(true);
    try {
      let verifiedStatus: CustomerOrderStatus = 'menunggu-konfirmasi';
      let paymentVerified = false;
      let latestPaymentState: Awaited<ReturnType<typeof fetchPaymentStatusApi>> = 'unknown';
      for (let attempt = 0; attempt < 6; attempt++) {
        const [paymentState, latestOrder] = await Promise.all([
          fetchPaymentStatusApi(backendOrderId),
          fetchOrderDetailApi(backendOrderId),
        ]);
        latestPaymentState = paymentState;
        if (paymentState === 'paid' || hasConfirmedPayment(latestOrder?.status)) {
          paymentVerified = true;
          if (latestOrder?.status && hasConfirmedPayment(latestOrder.status)) {
            verifiedStatus = mapBackendStatusToCustomerStatus(latestOrder.status);
          }
          break;
        }
        if (paymentState === 'failed') break;
        if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!paymentVerified) {
        setCurrentStatus('menunggu-pembayaran');
        if (latestPaymentState === 'failed') {
          onShowToast?.('Midtrans melaporkan pembayaran gagal atau kedaluwarsa. Pesanan tetap menunggu pembayaran; silakan coba lagi.', 'warning');
        } else if (latestPaymentState === 'pending') {
          onShowToast?.('Pembayaran masih diproses Midtrans. Status pesanan tetap menunggu pembayaran sampai backend mengonfirmasi.', 'info');
        } else {
          onShowToast?.('Backend belum mengonfirmasi pembayaran. Status pesanan tetap menunggu pembayaran; coba periksa lagi sebentar.', 'info');
        }
        return;
      }

      setCurrentStatus(verifiedStatus);
      createCustomerOrder(
        { ...targetData, status: verifiedStatus, paymentConfirmedByGateway: true },
        verifiedStatus
      );
      onShowToast?.('Pembayaran berhasil diverifikasi oleh backend. Menunggu konfirmasi toko mitra.', 'success');
    } finally {
      setIsVerifyingPayment(false);
    }
  }, [effectiveOrderData, onShowToast, orderData]);

  useEffect(() => {
    if (currentStatus !== 'menunggu-konfirmasi') return;
    const targetData = effectiveOrderData || orderData;
    if (!targetData) return;

    const updated = updateCustomerOrderStatus(orderId, 'menunggu-konfirmasi');
    if (!updated) {
      createCustomerOrder({ ...targetData, status: 'menunggu-konfirmasi' }, 'menunggu-konfirmasi');
    }
  }, [currentStatus, effectiveOrderData, orderData, orderId]);

  const activeData = effectiveOrderData || orderData;
  const paymentSnapToken = activeData?.snapToken || (
    retrievedPayment?.backendOrderId === activeData?.backendOrderId
      ? retrievedPayment?.snapToken
      : undefined
  );

  return {
    activeData,
    activeStep,
    backendOrderDetail,
    currentStatus,
    effectiveOrderData,
    handlePaymentSuccess,
    isPaymentSessionLoading,
    isSnapPopupOpen,
    isVerifyingPayment,
    orderId,
    paymentSnapToken,
    recommendations,
    resolvedStoreId,
    setIsSnapPopupOpen,
    storeProfile,
  };
}
