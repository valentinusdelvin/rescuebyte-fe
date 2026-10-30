import {
  fetchMerchantOrdersApi,
  getMerchantOrders,
  MerchantOrderItem,
} from './orderService';
import { PerformanceFilterKey } from '../types';

export interface PerformanceTrendPoint {
  label: string; // e.g. 'Mgg 1', 'Sen', 'Jan'
  totalOrders: number;
  buyers: number;
  completedOrders: number;
}

export interface SellerPerformanceData {
  totalPemasukan: number;
  totalOrdersCount: number;
  totalBuyersCount: number;
  completedOrdersCount: number;
  trendPoints: PerformanceTrendPoint[];
  rawOrdersCount: number;
}

const INDO_DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const INDO_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function parseOrderDate(order: MerchantOrderItem): Date {
  if (order.createdAt) {
    const d = new Date(order.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (order.pickupDate) {
    const d = new Date(order.pickupDate);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * Filter orders based on the selected period
 */
function filterOrdersByPeriod(
  orders: MerchantOrderItem[],
  period: PerformanceFilterKey
): MerchantOrderItem[] {
  const now = new Date();

  if (period === 'bulan-ini') {
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    return orders.filter((o) => {
      const d = parseOrderDate(o);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    });
  }

  if (period === 'minggu-ini') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return orders.filter((o) => {
      const d = parseOrderDate(o);
      return d >= sevenDaysAgo && d <= now;
    });
  }

  if (period === 'tahun-ini') {
    const curYear = now.getFullYear();
    return orders.filter((o) => {
      const d = parseOrderDate(o);
      return d.getFullYear() === curYear;
    });
  }

  return orders;
}

/**
 * Compute 6 trend data points tailored to the selected period
 */
function computeTrendPoints(
  orders: MerchantOrderItem[],
  period: PerformanceFilterKey
): PerformanceTrendPoint[] {
  const now = new Date();

  if (period === 'minggu-ini') {
    // 6 daily points ending today
    const points: PerformanceTrendPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayName = INDO_DAY_NAMES[targetDate.getDay()];
      const dayNum = targetDate.getDate();
      const label = `${dayName} ${dayNum}`;

      const dayOrders = orders.filter((o) => {
        const d = parseOrderDate(o);
        return (
          d.getFullYear() === targetDate.getFullYear() &&
          d.getMonth() === targetDate.getMonth() &&
          d.getDate() === targetDate.getDate()
        );
      });

      const completedOrders = dayOrders.filter((o) => o.status === 'selesai').length;
      const buyersSet = new Set(dayOrders.map((o) => o.customerName?.trim() || o.id));

      points.push({
        label,
        totalOrders: dayOrders.length,
        buyers: buyersSet.size,
        completedOrders,
      });
    }
    return points;
  }

  if (period === 'bulan-ini') {
    // 6 intervals across the current month (Days: 1-5, 6-10, 11-15, 16-20, 21-25, 26-31)
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const intervals = [
      { label: 'Mgg 1', start: 1, end: 5 },
      { label: 'Mgg 2', start: 6, end: 10 },
      { label: 'Mgg 3', start: 11, end: 15 },
      { label: 'Mgg 4', start: 16, end: 20 },
      { label: 'Mgg 5', start: 21, end: 25 },
      { label: 'Mgg 6', start: 26, end: 31 },
    ];

    return intervals.map((inv) => {
      const invOrders = orders.filter((o) => {
        const d = parseOrderDate(o);
        if (d.getFullYear() !== curYear || d.getMonth() !== curMonth) return false;
        const day = d.getDate();
        return day >= inv.start && day <= inv.end;
      });

      const completedOrders = invOrders.filter((o) => o.status === 'selesai').length;
      const buyersSet = new Set(invOrders.map((o) => o.customerName?.trim() || o.id));

      return {
        label: inv.label,
        totalOrders: invOrders.length,
        buyers: buyersSet.size,
        completedOrders,
      };
    });
  }

  // 'tahun-ini': 6 monthly points ending in current month (or Jan-Jun)
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const useTrailing = currentMonth >= 6;
  const windowMonths: { month: string; monthIndex: number; year: number }[] = [];

  if (useTrailing) {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      windowMonths.push({
        month: INDO_MONTH_NAMES[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
      });
    }
  } else {
    for (let m = 0; m < 6; m++) {
      windowMonths.push({
        month: INDO_MONTH_NAMES[m],
        monthIndex: m,
        year: currentYear,
      });
    }
  }

  return windowMonths.map((w) => {
    const monthOrders = orders.filter((o) => {
      const d = parseOrderDate(o);
      return d.getFullYear() === w.year && d.getMonth() === w.monthIndex;
    });

    const completedOrders = monthOrders.filter((o) => o.status === 'selesai').length;
    const buyersSet = new Set(monthOrders.map((o) => o.customerName?.trim() || o.id));

    return {
      label: w.month,
      totalOrders: monthOrders.length,
      buyers: buyersSet.size,
      completedOrders,
    };
  });
}

/**
 * Fetch and calculate seller store performance metrics from backend orders API.
 * Uses the proven integration mechanism of ActivityCards and FinanceCard.
 */
export async function getSellerPerformanceData(
  period: PerformanceFilterKey = 'bulan-ini',
  storeName?: string
): Promise<SellerPerformanceData> {
  const activeStore =
    storeName ||
    (typeof window !== 'undefined' ? localStorage.getItem('rescuebyte_store_name') || '' : '');

  // 1. Fetch freshest orders from backend GET /api/v1/orders/seller
  try {
    await fetchMerchantOrdersApi(activeStore, 'all');
  } catch (err) {
    console.warn('Backend fetchMerchantOrdersApi failed, using cached store orders:', err);
  }

  // 2. Read normalized merchant orders for this store
  const allOrders = getMerchantOrders(activeStore);

  // 3. Filter orders according to selected period
  const filteredOrders = filterOrdersByPeriod(allOrders, period);

  // 4. Calculate Total Pemasukan:
  // Defined as sum of grandTotal of completed orders in that period
  const totalPemasukan = filteredOrders
    .filter((o) => o.status === 'selesai')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const totalOrdersCount = filteredOrders.length;

  const completedOrdersCount = filteredOrders.filter((o) => o.status === 'selesai').length;

  // 5. Calculate unique buyers in that period
  const buyersSet = new Set<string>();
  filteredOrders.forEach((o) => {
    const key = o.customerName?.trim() || o.id;
    if (key) buyersSet.add(key.toLowerCase());
  });

  // 6. Compute 6 trend data points for the SVG chart
  const trendPoints = computeTrendPoints(allOrders, period);

  return {
    totalPemasukan,
    totalOrdersCount,
    totalBuyersCount: buyersSet.size,
    completedOrdersCount,
    trendPoints,
    rawOrdersCount: allOrders.length,
  };
}
