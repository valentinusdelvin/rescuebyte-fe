# Handoff Report: Requirement R3 — Notification and Toast Cleanup Investigation

## 1. Observation

### 1.1 Noisy External App / Client Toasts
* **Location**: `src/pages/customer/CustomerContact.tsx`, lines 96–107
  ```tsx
  const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;

  // Buka Gmail Compose di tab baru
  window.open(gmailUrl, '_blank');

  if (onShowToast) {
    onShowToast(
      'Membuka Gmail... Silakan tekan Send untuk mengirim saran kamu.',
      'info'
    );
  }
  ```
  * **Current Behavior**: When a customer clicks "Kirim Masukan", the form validates inputs, opens Gmail Compose in a new browser tab (`window.open(gmailUrl, '_blank')`), and additionally displays a redundant informational toast: `"Membuka Gmail... Silakan tekan Send untuk mengirim saran kamu."`. The browser tab switch already informs the user; this toast is visual noise and specifically flagged for removal.

* **Location**: `src/pages/customer/CustomerHome.tsx`, lines 324–328 & line 659
  ```tsx
  const handleContactSupport = () => {
    if (onShowToast) {
      onShowToast('Membuka live chat Customer Service RescueBite...');
    }
  };
  ...
  <CustomerFooter
    ...
    onContactSupport={handleContactSupport}
  />
  ```
  And in `src/components/customer/CustomerFooter.tsx`, lines 39–45:
  ```tsx
  const handleOpenHelp = () => {
    if (onContactSupport) {
      onContactSupport();
    } else {
      setIsHelpOpen(true);
    }
  };
  ```
  * **Current Behavior**: When `CustomerHome` passes `onContactSupport={handleContactSupport}` to `CustomerFooter`, clicking "Pusat Bantuan" or "Bantuan" in the footer invokes `handleContactSupport()`, which merely fires the dummy toast `'Membuka live chat Customer Service RescueBite...'` and completely suppresses the accessible help modal dialog (`isHelpOpen`).

* **Location**: `src/pages/auth/CustomerAuth.tsx`, lines 431–432 & 452–453
  ```tsx
  onShowTerms={() => onShowToast?.('Membuka Syarat & Ketentuan RescueBite', 'info')}
  onShowPrivacy={() => onShowToast?.('Membuka Kebijakan Privasi RescueBite', 'info')}
  ```
  * **Current Behavior**: Clicking terms or privacy triggers informational toasts simulating page navigation.

---

### 1.2 Location Permission Error Toasts ("Izin lokasi belum diberikan, default: Malang")
* **Location**: `src/pages/customer/CustomerMarketplace.tsx`, lines 142–171
  ```tsx
  // Request browser live location (quick non-blocking 3s timeout)
  const handleRequestLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (onShowToast) onShowToast('Browser tidak mendukung geolokasi');
      setSelectedCity('Malang');
      return;
    }
    setIsLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLoadingLoc(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        try {
          localStorage.setItem('rescuebyte_user_coords', JSON.stringify(coords));
        } catch { }
        setSelectedCity('Lokasi Saat Ini');
        setOpenDropdown(null);
        if (onShowToast) onShowToast('📍 Lokasi terdeteksi, menampilkan Mystery Box terdekat');
      },
      (err) => {
        setIsLoadingLoc(false);
        console.warn('Geolocation permission:', err.message);
        if (onShowToast) onShowToast('Izin lokasi belum diberikan, default: Malang');
        setSelectedCity('Malang');
        const fallback = CITY_COORDINATES['Malang'];
        setUserCoords(fallback);
      },
      { enableHighAccuracy: false, timeout: 3000 }
    );
  }, [onShowToast]);
  ```
  * **Current Behavior**:
    1. In `CustomerMarketplace.tsx`, clicking "Gunakan Live Loc" triggers `handleRequestLiveLocation`.
    2. There is **no in-flight concurrency lock** (`if (isLoadingLoc) return;` is missing). If clicked rapidly, multiple geolocation queries run concurrently.
    3. When permission is denied, each failed query calls `onShowToast('Izin lokasi belum diberikan, default: Malang')`.

* **Location**: `src/components/seller/StoreLocationMap.tsx`, lines 231–280
  ```tsx
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      if (onShowToast) onShowToast('Fitur GPS tidak didukung di peramban ini.');
      return;
    }

    if (onShowToast) onShowToast('Mencari posisi perangkat Anda...');
    setIsLocatingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => { ... },
      (error) => {
        setIsLocatingGps(false);
        console.warn('Geolocation error:', error);
        if (onShowToast) onShowToast('Tidak dapat mengakses lokasi perangkat. Periksa izin peramban.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  ```
  * **Current Behavior**: On clicking GPS, an in-progress toast is displayed (`'Mencari posisi perangkat Anda...'`), followed immediately by the failure toast (`'Tidak dapat mengakses lokasi perangkat. Periksa izin peramban.'`), stacking two location toasts.

---

### 1.3 Toast Architecture & The Dual-Render Bug
* **Location**: `src/App.tsx`, lines 200–224 & line 570
  ```tsx
  // Toast state (integrated with ToastContext and local state fallback)
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  const showToast = useCallback(
    (message: string, typeOrDuration?: ToastType | number, maybeDuration?: number) => {
      const type: ToastType = typeof typeOrDuration === 'string' ? typeOrDuration : 'success';
      const duration: number =
        typeof typeOrDuration === 'number'
          ? typeOrDuration
          : typeof maybeDuration === 'number'
          ? maybeDuration
          : 3000;

      // Delegate to context if available
      if (toastContextShow) {
        toastContextShow(message, type, duration);
      }
      setToastMessage(message);
      setToastType(type);
      setIsToastVisible(true);
    },
    [toastContextShow]
  );
  ...
  {/* Global Toast & Loading Overlay */}
  <Toast message={toastMessage} isVisible={isToastVisible} type={toastType} />
  ```
* **Location**: `src/main.tsx`, lines 11–17
  ```tsx
  <ToastProvider>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </ToastProvider>
  ```
* **Location**: `src/context/ToastContext.tsx`, lines 25–50 & lines 56–99
  ```tsx
  export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    ...
    const showToast = useCallback(
      (message: string, type: ToastType = 'info', duration = 3500) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newToast: Toast = { id, message, type, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
          setTimeout(() => {
            removeToast(id);
          }, duration);
        }
      },
      [removeToast]
    );

    return (
      <ToastContext.Provider value={{ toasts, showToast, removeToast, clearToasts }}>
        {children}
        {/* Toast Notification Floating Container */}
        {toasts.length > 0 && (
          <div
            role="region"
            aria-label="Notifikasi"
            className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
          >
            {toasts.map((toast) => ( ... ))}
          </div>
        )}
      </ToastContext.Provider>
    );
  };
  ```

---

## 2. Logic Chain

### 2.1 Why Duplicate Location Toasts Appear and Stack
1. **Root Cause 1: Dual Toast Containers Active Concurrently**
   - In `main.tsx`, `<App />` is wrapped inside `<ToastProvider>`.
   - When any page calls `showToast(msg)`, `App.tsx`'s `showToast` executes.
   - It invokes `toastContextShow(message, type, duration)`, which adds the toast to `ToastContext.toasts` and renders it at `fixed bottom-6 right-6`.
   - **Simultaneously**, `App.tsx` calls `setToastMessage(message); setIsToastVisible(true);` and renders `<Toast message={toastMessage} isVisible={isToastVisible} />` at `fixed bottom-24 right-4`.
   - **Crucially**, `App.tsx` has **no timeout** to reset `isToastVisible` to `false`. Once shown, `<Toast />` at `bottom-24` stays visible indefinitely until replaced by another message.
   - Therefore, a single error event already produces two visible toasts on the screen.

2. **Root Cause 2: Zero Deduplication and Debouncing in `ToastContext.tsx`**
   - `ToastContext.showToast` uses `setToasts((prev) => [...prev, newToast])`.
   - It performs **no check** against `prev` to see if a toast with identical message and type already exists.
   - It performs **no debouncing or timestamp tracking**. If two calls occur within 100ms or 2 seconds, both are pushed into the array and rendered stacked vertically via `flex flex-col gap-2`.

3. **Root Cause 3: Concurrency in Geolocation Triggers**
   - In `CustomerMarketplace.tsx`, `handleRequestLiveLocation` does not check if `isLoadingLoc` is already `true`.
   - If the user double-clicks "Gunakan Live Loc" or if location permission fails while another request is in-flight, `navigator.geolocation.getCurrentPosition` invokes the error callback multiple times.
   - Each error callback fires `onShowToast('Izin lokasi belum diberikan, default: Malang')`.
   - Combined with Root Cause 1 and 2, this produces 3 to 4 duplicate stacked toast cards on screen.

### 2.2 Root Cause of Noise Toasts
- `CustomerContact.tsx`: After launching Gmail Compose via `window.open`, the code unnecessarily notifies the user with `'Membuka Gmail... Silakan tekan Send untuk mengirim saran kamu.'`.
- `CustomerHome.tsx`: Clicking help/support in the footer invokes a mock handler that displays `'Membuka live chat Customer Service RescueBite...'` instead of rendering the Help dialog.

---

## 3. Caveats

1. **User Feedback Preservation**:
   All standard user feedback toasts must be strictly preserved:
   - Cart additions, updates, deletions, and quantity limits (`useCustomerCart.ts`, `CustomerProductDetail.tsx`).
   - Order submissions, checkout validations, and Midtrans payment status changes (`CustomerCheckout.tsx`, `CustomerOrderDetail.tsx`, `OrderHistory.tsx`).
   - Authentication feedback: login, register, logout, validation errors (`CustomerAuth.tsx`, `CustomerLoginForm.tsx`, `CustomerRegisterForm.tsx`).
   - Seller inventory, product creation, status toggles, and order status transitions (`Daganganku.tsx`, `BuatDagangan.tsx`, `StoreProfile.tsx`).
   - Clipboard copy notifications (`CustomerOrderHistory.tsx`, `SellerOrderDetailModal.tsx`).
2. **Generic Deduplication Scope**:
   Deduplicating in `ToastContext.tsx` should only suppress duplicate messages that are identical and recent (e.g. same text within 2.5–3 seconds cooldown or already visible in `toasts`). Different messages (e.g., "Item ditambahkan ke keranjang" followed by "Promo diaplikasikan") must both appear without being blocked.
3. **Location Fallback Behavior**:
   Suppressing the duplicate location toast must not affect the fallback coordinate state: `setSelectedCity('Malang')` and `setUserCoords(CITY_COORDINATES['Malang'])` must still execute normally.

---

## 4. Conclusion & Implementation Strategy

### 4.1 Changes in `src/pages/customer/CustomerContact.tsx`
* **File**: `src/pages/customer/CustomerContact.tsx`
* **Target Line**: ~101–106
* **Action**: Remove the `onShowToast('Membuka Gmail... Silakan tekan Send untuk mengirim saran kamu.', 'info')` call. Keep `window.open(gmailUrl, '_blank')`.
* **Diff Preview**:
  ```diff
      const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;

      // Buka Gmail Compose di tab baru
      window.open(gmailUrl, '_blank');

  -   if (onShowToast) {
  -     onShowToast(
  -       'Membuka Gmail... Silakan tekan Send untuk mengirim saran kamu.',
  -       'info'
  -     );
  -   }
  ```

### 4.2 Changes in `src/pages/customer/CustomerHome.tsx`
* **File**: `src/pages/customer/CustomerHome.tsx`
* **Target Lines**: 324–328, 659
* **Action**: Remove the fake `handleContactSupport` toast handler and do not pass `onContactSupport` to `CustomerFooter`, allowing `CustomerFooter`'s native interactive help modal to open cleanly (`isHelpOpen`).

### 4.3 Changes in `src/context/ToastContext.tsx` (Global Deduplication & Debounce)
* **File**: `src/context/ToastContext.tsx`
* **Action**:
  1. Add a ref `recentToastsRef = useRef<Map<string, number>>(new Map())` to track recent messages with timestamps.
  2. In `showToast`:
     - Clean message: `const clean = message.trim();`
     - Check cooldown: if `clean` was shown within the last 2500ms, ignore.
     - Check existing active toasts: if `prev.some(t => t.message === clean)`, ignore duplicate.
     - Limit max concurrent toasts: `const trimmedPrev = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;`
* **Code Preview**:
  ```tsx
  export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const recentToastsRef = React.useRef<Map<string, number>>(new Map());

    const removeToast = useCallback((id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const clearToasts = useCallback(() => {
      setToasts([]);
    }, []);

    const showToast = useCallback(
      (message: string, type: ToastType = 'info', duration = 3500) => {
        if (!message || !message.trim()) return;
        const cleanMessage = message.trim();
        const now = Date.now();

        // 1. Cooldown deduplication (prevent same message within 2.5s)
        const lastTime = recentToastsRef.current.get(cleanMessage);
        if (lastTime && now - lastTime < 2500) {
          return;
        }
        recentToastsRef.current.set(cleanMessage, now);

        // 2. Active toast check & capping
        setToasts((prev) => {
          if (prev.some((t) => t.message === cleanMessage)) {
            return prev;
          }
          const cappedPrev = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
          const id = `${now}-${Math.random().toString(36).slice(2, 9)}`;
          const newToast: Toast = { id, message: cleanMessage, type, duration };

          if (duration > 0) {
            setTimeout(() => {
              removeToast(id);
            }, duration);
          }

          return [...cappedPrev, newToast];
        });
      },
      [removeToast]
    );
  ```

### 4.4 Changes in `src/App.tsx` (Eliminate Double Toast Render)
* **File**: `src/App.tsx`
* **Action**:
  In `showToast`:
  If `toastContextShow` is available, delegate purely to `toastContextShow(message, type, duration)`. Do not also activate the local fallback `<Toast />` component when `toastContextShow` is active.
  Or add a timer to hide `isToastVisible` after `duration` so local fallback doesn't get permanently stuck.
* **Code Preview**:
  ```tsx
  const showToast = useCallback(
    (message: string, typeOrDuration?: ToastType | number, maybeDuration?: number) => {
      const type: ToastType = typeof typeOrDuration === 'string' ? typeOrDuration : 'success';
      const duration: number =
        typeof typeOrDuration === 'number'
          ? typeOrDuration
          : typeof maybeDuration === 'number'
          ? maybeDuration
          : 3000;

      if (toastContextShow) {
        toastContextShow(message, type, duration);
        return;
      }

      setToastMessage(message);
      setToastType(type);
      setIsToastVisible(true);
      setTimeout(() => {
        setIsToastVisible(false);
      }, duration);
    },
    [toastContextShow]
  );
  ```

### 4.5 Changes in `src/pages/customer/CustomerMarketplace.tsx` (In-Flight Lock & Location Cooldown)
* **File**: `src/pages/customer/CustomerMarketplace.tsx`
* **Action**:
  1. Add `if (isLoadingLoc) return;` at the beginning of `handleRequestLiveLocation`.
  2. Use a ref `hasShownLocationErrorRef` or timestamp cooldown to ensure location permission warning is never spammed if the user clicks repeatedly.
* **Code Preview**:
  ```tsx
  const hasWarnedLocationRef = useRef(false);

  const handleRequestLiveLocation = useCallback(() => {
    if (isLoadingLoc) return;
    if (!navigator.geolocation) {
      if (onShowToast) onShowToast('Browser tidak mendukung geolokasi');
      setSelectedCity('Malang');
      return;
    }
    setIsLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLoadingLoc(false);
        hasWarnedLocationRef.current = false;
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        try {
          localStorage.setItem('rescuebyte_user_coords', JSON.stringify(coords));
        } catch { }
        setSelectedCity('Lokasi Saat Ini');
        setOpenDropdown(null);
        if (onShowToast) onShowToast('📍 Lokasi terdeteksi, menampilkan Mystery Box terdekat');
      },
      (err) => {
        setIsLoadingLoc(false);
        console.warn('Geolocation permission:', err.message);
        if (!hasWarnedLocationRef.current) {
          hasWarnedLocationRef.current = true;
          if (onShowToast) onShowToast('Izin lokasi belum diberikan, default: Malang');
        }
        setSelectedCity('Malang');
        const fallback = CITY_COORDINATES['Malang'];
        setUserCoords(fallback);
      },
      { enableHighAccuracy: false, timeout: 3000 }
    );
  }, [isLoadingLoc, onShowToast]);
  ```

### 4.6 Antislop Compliance
* Strictly avoid generic AI comments (`// This function handles...`, `// Added by AI`).
* Keep clean, maintainable, idiomatic TypeScript and React code.

---

## 5. Verification Method

1. **Static Typecheck**:
   ```bash
   npm run typecheck
   ```
   Must pass with exit code 0.

2. **Production Build Verification**:
   ```bash
   npm run build
   ```
   Must compile cleanly without errors.

3. **Linter Verification**:
   ```bash
   npm run lint
   ```
   Must complete with 0 errors.

4. **Functional & Interactive Verification**:
   - Navigate to `#kontak` (`CustomerContact.tsx`), fill the contact form, and click "Kirim Masukan". Verify Gmail opens in a new tab and **no toast** appears.
   - Navigate to `#marketplace` (`CustomerMarketplace.tsx`), open city filter, click "Gunakan Live Loc" multiple times with browser location blocked. Verify only a **single** "Izin lokasi belum diberikan, default: Malang" toast appears (no stacking).
   - Add a product to cart or update quantity: verify standard success toast `"Berhasil ditambahkan ke keranjang"` or `"Maksimal 5 box per item"` displays normally and auto-dismisses after duration.
   - Place an order or copy order number: verify standard confirmation toasts appear normally.
