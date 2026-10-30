import axios from 'axios';
import { api } from './api';
import { extractApiErrorMessage, getAccessToken } from './authService';
import { PerformanceFilterKey } from '../types';

export interface SellerOrderApiItem {
  id: string;
  order_number: string;
  status: string;
  status_label?: string;
  total_amount: number;
  total_items?: number;
  customer_name?: string;
  customer_phone?: string;
  created_at: string;
}

export interface MonthlyTrendData {
  month: string;
  monthIndex: number;
  year: number;
  totalOrders: number;
  buyers: number;
  completedOrders: number;
}

export interface PerformanceAnalyticsResult {
  totalPurchaseNominal: number;
  totalOrdersCount: number;
  totalBuyersCount: number;
  completedOrdersCount: number;
  monthlyTrends: MonthlyTrendData[];
  rawOrdersCount: number;
}

const INDO_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function filterOrdersByPeriod(orders: SellerOrderApiItem[], period: PerformanceFilterKey): SellerOrderApiItem[] {
  const now = new Date();

  if (period === 'bulan-ini') {
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    return orders.filter((o) => {
      const d = parseDate(o.created_at);
      return d ? d.getFullYear() === curYear && d.getMonth() === curMonth : false;
    });
  }

  if (period === 'minggu-ini') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return orders.filter((o) => {
      const d = parseDate(o.created_at);
      return d ? d >= sevenDaysAgo && d <= now : false;
    });
  }

  if (period === 'tahun-ini') {
    const curYear = now.getFullYear();
    return orders.filter((o) => {
      const d = parseDate(o.created_at);
      return d ? d.getFullYear() === curYear : false;
    });
  }

  return orders;
}

function computeMonthlyTrends(orders: SellerOrderApiItem[]): MonthlyTrendData[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // If current month is >= July, show trailing 6 months ending at current month
  // Otherwise, default to first 6 months Jan - Jun
  const useTrailing = currentMonth >= 6;
  const windowMonths: { month: string; monthIndex: number; year: number }[] = [];

  if (useTrailing) {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      windowMonths.push({
        month: INDO_MONTHS[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
      });
    }
  } else {
    for (let m = 0; m < 6; m++) {
      windowMonths.push({
        month: INDO_MONTHS[m],
        monthIndex: m,
        year: currentYear,
      });
    }
  }

  return windowMonths.map((w) => {
    const monthOrders = orders.filter((o) => {
      const d = parseDate(o.created_at);
      return d && d.getFullYear() === w.year && d.getMonth() === w.monthIndex;
    });

    const completedOrders = monthOrders.filter((o) => {
      const s = (o.status || '').toUpperCase();
      return s === 'COMPLETED' || s === 'SELESAI';
    }).length;

    const buyersSet = new Set<string>();
    monthOrders.forEach((o) => {
      const key = o.customer_name?.trim() || o.customer_phone?.trim() || o.id;
      if (key) buyersSet.add(key);
    });

    return {
      month: w.month,
      monthIndex: w.monthIndex,
      year: w.year,
      totalOrders: monthOrders.length,
      buyers: buyersSet.size,
      completedOrders,
    };
  });
}

/**
 * Fetch seller performance data from GET /api/v1/orders/seller
 * Aggregates Total Pembelian, Jumlah Pesanan, Jumlah Pembeli, Pesanan Selesai,
 * and monthly trends for the interactive chart.
 */
export async function getSellerPerformance(
  period: PerformanceFilterKey = 'bulan-ini'
): Promise<PerformanceAnalyticsResult> {
  const token = getAccessToken();
  if (!token) {
    return {
      totalPurchaseNominal: 0,
      totalOrdersCount: 0,
      totalBuyersCount: 0,
      completedOrdersCount: 0,
      monthlyTrends: computeMonthlyTrends([]),
      rawOrdersCount: 0,
    };
  }

  try {
    const response = await api.get('/api/v1/orders/seller', {
      params: {
        page: 1,
        limit: 100,
        tab: 'all',
      },
    });

    const payload = response.data?.payload;
    const orders: SellerOrderApiItem[] = Array.isArray(payload?.orders) ? payload.orders : [];

    const filteredOrders = filterOrdersByPeriod(orders, period);

    const validOrders = filteredOrders.filter((o) => (o.status || '').toUpperCase() !== 'CANCELLED');
    const totalPurchaseNominal = validOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
    const totalOrdersCount = filteredOrders.length;

    const completedOrdersCount = filteredOrders.filter((o) => {
      const s = (o.status || '').toUpperCase();
      return s === 'COMPLETED' || s === 'SELESAI';
    }).length;

    const buyersSet = new Set<string>();
    filteredOrders.forEach((o) => {
      const key = o.customer_name?.trim() || o.customer_phone?.trim() || o.id;
      if (key) buyersSet.add(key);
    });

    const monthlyTrends = computeMonthlyTrends(orders);

    return {
      totalPurchaseNominal,
      totalOrdersCount,
      totalBuyersCount: buyersSet.size,
      completedOrdersCount,
      monthlyTrends,
      rawOrdersCount: orders.length,
    };
  } catch (err: unknown) {
    if (
      axios.isAxiosError(err) &&
      (err.response?.status === 404 || (err.response?.data as { payload?: { error?: { error_code?: string } } })?.payload?.error?.error_code === 'store_not_found')
    ) {
      return {
        totalPurchaseNominal: 0,
        totalOrdersCount: 0,
        totalBuyersCount: 0,
        completedOrdersCount: 0,
        monthlyTrends: computeMonthlyTrends([]),
        rawOrdersCount: 0,
      };
    }

    const msg = extractApiErrorMessage(err, 'Gagal mengambil data performa toko dari server.');
    throw new Error(msg);
  }
}
