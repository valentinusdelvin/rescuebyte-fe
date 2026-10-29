import { useState, useMemo } from 'react';
import {
  User,
  ShoppingBag,
  Store,
  Calendar,
  FileText,
  CreditCard,
  ChevronDown,
  Info,
  Edit2,
  Trash2,
} from 'lucide-react';
import { CustomerHeader } from '../components/customer/CustomerHeader';
import { CustomerFooter } from '../components/customer/CustomerFooter';
import { CheckoutItem, CheckoutPayload, PaymentOrderData } from '../types';
import cardMonsieurSpoon from '../assets/customer/card-monsieur-spoon.jpg';

export interface CustomerCheckoutProps {
  payload?: CheckoutPayload | null;
  onNavigateHome?: () => void;
  onNavigateMarketplace?: () => void;
  onNavigateCart?: () => void;
  onNavigateDetail?: () => void;
  onNavigateSeller?: () => void;
  onNavigatePayment?: (orderData: PaymentOrderData) => void;
  onNavigateOrderDetail?: (orderData: PaymentOrderData) => void;
  onShowToast?: (message: string) => void;
}

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function CustomerCheckout({
  payload,
  onNavigateHome,
  onNavigateMarketplace,
  onNavigateCart,
  onNavigateDetail,
  onNavigateSeller,
  onNavigatePayment,
  onNavigateOrderDetail,
  onShowToast,
}: CustomerCheckoutProps) {
  // Customer Info State
  const [customerName, setCustomerName] = useState('Reza Pratama');
  const [customerPhone, setCustomerPhone] = useState('081234567890');
  const [customerEmail, setCustomerEmail] = useState('reza.pratama@email.com');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);

  // Items State (defaults to TerasRasa Bakery Mystery Box matching Image 2 if payload empty)
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(() => {
    if (payload && payload.items && payload.items.length > 0) {
      return payload.items;
    }
    return [
      {
        id: 'item-bakery-box-reguler',
        name: 'Mystery Bakery Box Reguler',
        storeId: 'store-terasa',
        storeName: 'TerasRasa Bakery',
        storeAvatar: 'TR',
        storeAddress: 'Jl. Soekarno Hatta No. 12, Lowokwaru, Malang, Jawa Timur',
        rating: 4.8,
        reviewCount: 320,
        distanceText: '1.2 km',
        categoryTags: ['Roti & Pastry', '✓ Halal'],
        originalPrice: 40000,
        rescuePrice: 20000,
        discountPercent: 50,
        quantity: 1,
        imageSrc: cardMonsieurSpoon,
        pickupTime: '15.00 - 18.00 WIB',
      },
    ];
  });

  // Pickup selection
  const [selectedDate, setSelectedDate] = useState('Sab, 26 Okt 2025');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('15.00 - 16.00');

  const timeSlots = [
    '15.00 - 16.00',
    '16.00 - 17.00',
    '17.00 - 18.00',
    '18.00 - 19.00',
  ];

  // Payment Method: 'online' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Primary store info (taken from first item)
  const primaryStore = checkoutItems[0] || {
    storeName: 'TerasRasa Bakery',
    storeAvatar: 'TR',
    storeAddress: 'Jl. Soekarno Hatta No. 12, Lowokwaru, Malang, Jawa Timur',
    rating: 4.8,
    reviewCount: 320,
  };

  // Stepper handlers
  const handleIncreaseQty = (itemId: string) => {
    setCheckoutItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          if (item.quantity >= 5) {
            if (onShowToast) onShowToast('Maksimal 5 box per transaksi.');
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  const handleDecreaseQty = (itemId: string) => {
    setCheckoutItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity: Math.max(1, item.quantity - 1) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (itemId: string) => {
    if (checkoutItems.length <= 1) {
      if (onShowToast) onShowToast('Minimal 1 item untuk checkout.');
      return;
    }
    setCheckoutItems((prev) => prev.filter((item) => item.id !== itemId));
    if (onShowToast) onShowToast('Item dihapus dari checkout.');
  };

  // Calculations
  const { totalBoxes, subtotal, discountTotal, serviceFee, grandTotal } = useMemo(() => {
    let boxes = 0;
    let sub = 0;
    let disc = 0;

    checkoutItems.forEach((item) => {
      boxes += item.quantity;
      const originalTotal = item.originalPrice * item.quantity;
      const rescueTotal = item.rescuePrice * item.quantity;
      sub += rescueTotal;
      disc += originalTotal - rescueTotal;
    });

    const fee = boxes > 0 ? 2000 : 0;
    const finalTotal = sub + fee;

    return {
      totalBoxes: boxes,
      subtotal: sub,
      discountTotal: disc,
      serviceFee: fee,
      grandTotal: finalTotal,
    };
  }, [checkoutItems]);

  const handlePayNow = () => {
    if (totalBoxes === 0) {
      if (onShowToast) onShowToast('Tidak ada item untuk dipesan.');
      return;
    }

    setIsSubmitting(true);
    const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const generatedCode = `RB${todayStr}-${randomSuffix}`;

    const orderData: PaymentOrderData = {
      orderId: generatedCode,
      items: checkoutItems,
      primaryStore: {
        storeName: primaryStore.storeName,
        storeAvatar: primaryStore.storeAvatar,
        storeAddress: primaryStore.storeAddress,
        rating: primaryStore.rating,
        reviewCount: primaryStore.reviewCount,
      },
      pickupDate: selectedDate,
      pickupTimeSlot: selectedTimeSlot,
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },
      totalBoxes,
      subtotal,
      discountTotal,
      serviceFee,
      grandTotal,
      source: payload?.source,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      if (onNavigateOrderDetail) {
        onNavigateOrderDetail(orderData);
      } else if (onNavigatePayment) {
        onNavigatePayment(orderData);
      }
    }, 300);
  };

  const handleHeaderTab = (tab: string) => {
    if (tab === 'beranda' && onNavigateHome) {
      onNavigateHome();
    } else if (tab === 'marketplace' && onNavigateMarketplace) {
      onNavigateMarketplace();
    }
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1c] font-sans antialiased flex flex-col justify-between" id="checkout-page-root">
      <div>
        {/* 1. Header (Active Marketplace pill matching design) */}
        <CustomerHeader
          activeTab="marketplace"
          onSelectTab={handleHeaderTab}
          onNavigateSeller={onNavigateSeller}
        />

        {/* 2. Main Container */}
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Periksa pesananmu, lengkapi informasi, dan pilih metode pembayaran.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {/* CARD 1: Informasi Customer */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-700" />
                  <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                    Informasi Customer
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingCustomer((prev) => !prev)}
                  className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1.5 cursor-pointer select-none transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingCustomer ? 'Simpan' : 'Ubah Data'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    NAMA LENGKAP
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={!isEditingCustomer}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#fbfbf9] text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-85 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    NOMOR HP
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={!isEditingCustomer}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#fbfbf9] text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-85 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={!isEditingCustomer}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#fbfbf9] text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-85 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* CARD 2: Detail Pesanan */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gray-700" />
                  <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                    Detail Pesanan
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (payload?.source === 'cart' && onNavigateCart) {
                      onNavigateCart();
                    } else if (onNavigateDetail) {
                      onNavigateDetail();
                    } else if (onNavigateCart) {
                      onNavigateCart();
                    }
                  }}
                  className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1.5 cursor-pointer select-none transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah Pesanan</span>
                </button>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {checkoutItems.map((item) => (
                  <div
                    key={item.id}
                    className="pt-4 first:pt-0 pb-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left: Image & Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#24201c] shrink-0 border border-black/10 relative">
                        <img
                          src={item.imageSrc || cardMonsieurSpoon}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                          {item.name}
                        </h3>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-gray-700">
                            {item.storeName}
                          </span>
                          <span className="bg-[#e7f7ea] text-[#1b6b2c] border border-[#c6edcb] text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            ✓ Terverifikasi
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <span className="text-amber-500 font-bold">★ {item.rating || 4.8}</span>
                          <span className="text-gray-400">({item.reviewCount || 320} ulasan)</span>
                          <span className="text-gray-300">•</span>
                          <span>📍 {item.distanceText || '1.2 km'}</span>
                        </div>

                        {/* Category Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                          {item.categoryTags.map((tag, idx) => (
                            <span
                              key={`${tag}-${idx}`}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                tag.includes('Halal')
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Stepper */}
                    <div className="flex flex-col sm:items-end justify-between gap-1.5 shrink-0">
                      <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-0">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-base sm:text-lg text-[#e11d48]">
                            Rp {formatRupiah(item.rescuePrice)}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">/box</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400 line-through">
                            Rp {formatRupiah(item.originalPrice)}
                          </span>
                          <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-1.5 py-0.2 rounded">
                            {item.discountPercent}%
                          </span>
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="bg-[#f4f4f2] rounded-xl p-1 flex items-center gap-2.5 border border-gray-200">
                          <button
                            type="button"
                            onClick={() => handleDecreaseQty(item.id)}
                            className="w-6 h-6 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors"
                            title="Kurangi box"
                            aria-label="Kurangi box"
                          >
                            –
                          </button>
                          <span className="font-bold text-xs sm:text-sm text-[#1b1c1c] min-w-4 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncreaseQty(item.id)}
                            className="w-6 h-6 rounded-lg bg-white shadow-2xs hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer transition-colors"
                            title="Tambah box"
                            aria-label="Tambah box"
                          >
                            +
                          </button>
                        </div>

                        {checkoutItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                            title="Hapus produk ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <span className="text-[11px] text-gray-400">
                        Maksimal 5 box per transaksi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CARD 3: Pengambilan Pesanan */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Store className="w-4 h-4 text-gray-700" />
                <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                  Pengambilan Pesanan
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left: Store info */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#1e2a22] text-white flex items-center justify-center font-bold text-sm shrink-0 select-none">
                      {primaryStore.storeAvatar || 'TR'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#1b1c1c]">
                          {primaryStore.storeName}
                        </h3>
                        <span className="bg-[#e7f7ea] text-[#1b6b2c] border border-[#c6edcb] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ✓ Terverifikasi
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <span className="text-amber-500 font-bold">★ {primaryStore.rating || 4.8}</span>
                        <span className="text-gray-400">({primaryStore.reviewCount || 320} ulasan)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-1 flex items-start gap-1.5 leading-relaxed">
                    <span>📍</span>
                    <span>{primaryStore.storeAddress || 'Jl. Soekarno Hatta No. 12, Lowokwaru, Malang, Jawa Timur'}</span>
                  </p>

                  <div className="mt-1">
                    <span className="bg-[#e7f7ea] text-[#1b6b2c] border border-[#c6edcb] text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                      ✓ Ambil Langsung di Toko
                    </span>
                  </div>
                </div>

                {/* Right: Pickup Date & Time Selection */}
                <div className="flex flex-col gap-3">
                  {/* Date selection */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Pilih Tanggal Pickup
                    </label>
                    <div className="relative">
                      <label htmlFor="select-pickup-date" className="sr-only">Pilih Tanggal Pickup</label>
                      <div className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-[#fbfbf9] text-xs sm:text-sm font-semibold text-gray-800">
                        <div className="flex items-center gap-2 flex-1">
                          <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                          <select
                            id="select-pickup-date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer w-full py-0.5"
                          >
                            <option value="Sab, 26 Okt 2025">Sab, 26 Okt 2025</option>
                            <option value="Min, 27 Okt 2025">Min, 27 Okt 2025</option>
                            <option value="Sen, 28 Okt 2025">Sen, 28 Okt 2025</option>
                          </select>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Time slot buttons */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Pilih Waktu Pickup
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => {
                        const isSelected = selectedTimeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                              isSelected
                                ? 'border-[#1f2620] bg-[#1f2620] text-white shadow-xs'
                                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Light Green Alert Banner */}
              <div className="bg-[#eef8ee] border border-[#d2edd2] rounded-xl p-3 flex items-center gap-2.5 text-xs text-[#24521e] mt-1">
                <span className="text-base">🌱</span>
                <span>
                  Pesanan harus diambil langsung di lokasi toko sesuai jadwal yang dipilih.
                </span>
              </div>
            </section>

            {/* CARD 4: Ringkasan Pembayaran */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <FileText className="w-4 h-4 text-gray-700" />
                <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                  Ringkasan Pembayaran
                </h2>
              </div>

              {/* Compact item preview box */}
              <div className="bg-[#fbfbf9] border border-gray-150 rounded-2xl p-3 flex items-center gap-3">
                <img
                  src={checkoutItems[0]?.imageSrc || cardMonsieurSpoon}
                  alt={checkoutItems[0]?.name || ''}
                  className="w-11 h-11 rounded-xl object-cover border border-black/10 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs sm:text-sm text-[#1b1c1c] truncate">
                    {checkoutItems[0]?.name}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {checkoutItems[0]?.storeName}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="bg-gray-100 text-gray-600 text-[9px] font-semibold px-1.5 py-0.2 rounded">
                      Roti &amp; Pastry
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 text-[9px] font-semibold px-1.5 py-0.2 rounded">
                      Halal
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown lines */}
              <div className="flex flex-col gap-2 text-xs text-gray-600 pt-1">
                <div className="flex items-center justify-between">
                  <span>Harga per box</span>
                  <span className="font-semibold text-gray-900">
                    Rp {formatRupiah(checkoutItems[0]?.rescuePrice || 20000)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Jumlah box</span>
                  <span className="font-semibold text-gray-900">{totalBoxes} box</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Rp {formatRupiah(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    Diskon{' '}
                    <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      50%
                    </span>
                  </span>
                  <span className="font-semibold text-[#e11d48]">
                    - Rp {formatRupiah(discountTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    Biaya layanan
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  <span className="font-semibold text-gray-900">Rp {formatRupiah(serviceFee)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-150 flex items-center justify-between">
                <span className="font-bold text-sm text-[#1b1c1c]">Total Pembayaran</span>
                <span className="font-black text-2xl text-[#e11d48] font-display">
                  Rp {formatRupiah(grandTotal)}
                </span>
              </div>

              {/* Impact Card */}
              <div className="bg-[#eef8ee] border border-[#d2edd2] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#24521e]">
                <span className="text-base shrink-0 mt-0.5">🌱</span>
                <span className="leading-relaxed">
                  Dengan berbelanja di RescueBite, kamu ikut membantu mengurangi food waste dan mendukung bisnis lokal.
                </span>
              </div>
            </section>

            {/* CARD 5: Metode Pembayaran */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <CreditCard className="w-4 h-4 text-gray-700" />
                <h2 className="font-bold text-sm sm:text-base text-[#1b1c1c]">
                  Metode Pembayaran
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Pembayaran Online */}
                <div
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    paymentMethod === 'online'
                      ? 'border-[#1f2620] bg-white shadow-xs'
                      : 'border-gray-200 bg-[#fbfbf9] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'online'
                            ? 'border-[#1f2620] bg-[#1f2620]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {paymentMethod === 'online' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1b1c1c]">
                        Pembayaran Online
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Bayar secara digital dengan metode pembayaran yang tersedia.
                      </p>
                    </div>
                  </div>

                  {/* Payment partner badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pl-7 pt-1">
                    <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      QRIS
                    </span>
                    <span className="bg-[#00a5cf] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      GoPay
                    </span>
                    <span className="bg-[#118eea] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      DANA
                    </span>
                    <span className="bg-[#4c2a86] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      OVO
                    </span>
                    <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      ShopeePay
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium ml-1">
                      Lainnya ›
                    </span>
                  </div>
                </div>

                {/* Option 2: Bayar di Tempat */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    paymentMethod === 'cod'
                      ? 'border-[#1f2620] bg-white shadow-xs'
                      : 'border-gray-200 bg-[#fbfbf9] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'cod'
                            ? 'border-[#1f2620] bg-[#1f2620]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {paymentMethod === 'cod' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1b1c1c]">
                        Bayar di Tempat
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Lakukan pembayaran saat mengambil pesanan di toko.
                      </p>
                    </div>
                  </div>

                  <ul className="text-xs text-gray-500 space-y-1 pl-7 pt-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span>Bayar langsung ke kasir di lokasi toko.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span>Pastikan datang sesuai jadwal pickup.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span>Pesanan akan diproses setelah pembayaran dikonfirmasi.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Bottom Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isSubmitting || totalBoxes === 0}
                className="w-full sm:w-auto min-w-55 py-3.5 px-6 rounded-2xl bg-[#1f2620] hover:bg-black disabled:bg-gray-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:cursor-not-allowed select-none"
                id="btn-bayar-sekarang"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses Pesanan...' : 'Bayar Sekarang →'}</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* 3. Footer */}
      <CustomerFooter
        onNavigateSeller={onNavigateSeller}
        onContactSupport={() => {
          if (onShowToast) onShowToast('Membuka live chat Customer Service RescueBite...');
        }}
      />
    </div>
  );
}

export default CustomerCheckout;
