export interface MidtransResult {
  order_id?: string;
  transaction_status?: string;
  status_code?: string;
}

export interface MidtransCallbacks {
  onSuccess: (result: MidtransResult) => void | Promise<void>;
  onPending: (result: MidtransResult) => void | Promise<void>;
  onError: (result: MidtransResult) => void | Promise<void>;
  onClose: () => void | Promise<void>;
}

let isSnapPopupActive = false;

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks: {
        onSuccess: (result: MidtransResult) => void;
        onPending: (result: MidtransResult) => void;
        onError: (result: MidtransResult) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

/** Open Midtrans Snap in a popup. Never navigate the current page to the hosted checkout. */
export function launchMidtransPayment(
  snapToken: string | undefined,
  callbacks: MidtransCallbacks
): void {
  if (!snapToken) {
    throw new Error('Token pembayaran Midtrans belum tersedia. Muat ulang detail pesanan lalu coba lagi.');
  }

  if (typeof window === 'undefined' || !window.snap?.pay) {
    throw new Error('Popup pembayaran Midtrans belum siap. Muat ulang halaman lalu coba lagi.');
  }

  if (isSnapPopupActive) {
    throw new Error('Popup pembayaran Midtrans masih terbuka. Selesaikan atau tutup popup tersebut dulu.');
  }

  isSnapPopupActive = true;
  const closePopup = () => {
    isSnapPopupActive = false;
  };

  try {
    window.snap.pay(snapToken, {
      onSuccess: (result) => { closePopup(); void callbacks.onSuccess(result); },
      onPending: (result) => { closePopup(); void callbacks.onPending(result); },
      onError: (result) => { closePopup(); void callbacks.onError(result); },
      onClose: () => { closePopup(); void callbacks.onClose(); },
    });
  } catch (error) {
    closePopup();
    throw error;
  }
}
