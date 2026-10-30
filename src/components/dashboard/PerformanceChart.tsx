import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { PerformanceFilterKey } from '../../types';
import {
  getSellerPerformanceData,
  SellerPerformanceData,
  PerformanceTrendPoint,
} from '../../services/sellerAnalyticsService';
import { subscribeToMerchantOrders } from '../../services/orderService';

export interface PerformanceChartProps {
  storeName?: string;
  onShowToast?: (message: string) => void;
}

interface ChartTooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}

const FILTER_OPTIONS: { value: PerformanceFilterKey; label: string; toastMsg: string }[] = [
  { value: 'bulan-ini', label: 'Bulan ini', toastMsg: 'Menampilkan performa bulan ini' },
  { value: 'minggu-ini', label: 'Minggu ini', toastMsg: 'Menampilkan performa minggu ini' },
  { value: 'tahun-ini', label: 'Tahun ini', toastMsg: 'Menampilkan performa tahun ini' },
];

function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Generate smooth cubic bezier SVG path between consecutive points
 */
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + 40;
    const cp1y = curr.y;
    const cp2x = next.x - 40;
    const cp2y = next.y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }
  return d;
}

/**
 * PerformanceChart Component
 * Integrated directly with backend orders API via the unified orderService mechanism:
 * - Total Pemasukan & Jumlah Pesanan
 * - Jumlah Pembeli (Unique Customers)
 * - Pesanan Selesai
 * - Interactive SVG trend lines and dynamic custom dropdown filter
 */
export function PerformanceChart({ storeName, onShowToast }: PerformanceChartProps) {
  const [filterRange, setFilterRange] = useState<PerformanceFilterKey>('bulan-ini');
  const [analyticsData, setAnalyticsData] = useState<SellerPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = useState<ChartTooltipState>({
    visible: false,
    text: '',
    x: 0,
    y: 0,
  });

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async (period: PerformanceFilterKey, silent = false) => {
    if (!silent) setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getSellerPerformanceData(period, storeName);
      setAnalyticsData(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data performa toko.';
      setErrorMessage(msg);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [storeName]);

  // Initial load and sync with storeName and period
  useEffect(() => {
    loadData(filterRange);

    const unsubscribe = subscribeToMerchantOrders(() => {
      loadData(filterRange, true);
    }, storeName);

    const handleOrdersUpdated = () => {
      loadData(filterRange, true);
    };

    window.addEventListener('rescuebyte_orders_updated', handleOrdersUpdated);
    window.addEventListener('storage', handleOrdersUpdated);

    return () => {
      unsubscribe();
      window.removeEventListener('rescuebyte_orders_updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleOrdersUpdated);
    };
  }, [filterRange, storeName, loadData]);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleSelectPeriod = (newPeriod: PerformanceFilterKey) => {
    setFilterRange(newPeriod);
    setIsDropdownOpen(false);
    const opt = FILTER_OPTIONS.find((o) => o.value === newPeriod);
    if (onShowToast && opt) {
      onShowToast(opt.toastMsg);
    }
  };

  const handlePointMouseEnter = (
    e: React.MouseEvent<SVGCircleElement>,
    series: string,
    label: string,
    val: number | string,
  ) => {
    if (!chartContainerRef.current) return;
    const containerRect = chartContainerRef.current.getBoundingClientRect();
    const circleRect = (e.target as SVGCircleElement).getBoundingClientRect();

    const leftPos = circleRect.left - containerRect.left + circleRect.width / 2;
    const topPos = circleRect.top - containerRect.top;

    setTooltip({
      visible: true,
      text: `${label}: ${series} (${val})`,
      x: leftPos,
      y: topPos,
    });
  };

  const handlePointMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // Safe defaults if loading or empty
  const totalPemasukan = analyticsData?.totalPemasukan ?? 0;
  const totalBuyers = analyticsData?.totalBuyersCount ?? 0;
  const completedOrders = analyticsData?.completedOrdersCount ?? 0;

  const trendPoints: PerformanceTrendPoint[] = analyticsData?.trendPoints || [
    { label: 'Jan', totalOrders: 0, buyers: 0, completedOrders: 0 },
    { label: 'Feb', totalOrders: 0, buyers: 0, completedOrders: 0 },
    { label: 'Mar', totalOrders: 0, buyers: 0, completedOrders: 0 },
    { label: 'Apr', totalOrders: 0, buyers: 0, completedOrders: 0 },
    { label: 'Mei', totalOrders: 0, buyers: 0, completedOrders: 0 },
    { label: 'Jun', totalOrders: 0, buyers: 0, completedOrders: 0 },
  ];

  // Dynamic Y scale math: Grid lines are at 30, 70, 110, 150, 190, 230
  const allValues = trendPoints.flatMap((m) => [m.totalOrders, m.buyers, m.completedOrders]);
  const maxDataVal = Math.max(10, ...allValues);
  const step = Math.max(2, Math.ceil(maxDataVal / 5));
  const yMax = step * 5;
  const yTicks = [0, step, step * 2, step * 3, step * 4, yMax];

  const getYCoord = (val: number): number => {
    const clamped = Math.max(0, Math.min(val, yMax));
    return 230 - (clamped / yMax) * 200;
  };

  const greenPoints = trendPoints.map((pt, idx) => ({
    x: 85 + idx * 100,
    y: getYCoord(pt.totalOrders),
    val: pt.totalOrders,
    label: pt.label,
  }));

  const yellowPoints = trendPoints.map((pt, idx) => ({
    x: 85 + idx * 100,
    y: getYCoord(pt.buyers),
    val: pt.buyers,
    label: pt.label,
  }));

  const redPoints = trendPoints.map((pt, idx) => ({
    x: 85 + idx * 100,
    y: getYCoord(pt.completedOrders),
    val: pt.completedOrders,
    label: pt.label,
  }));

  const greenPath = generateSmoothPath(greenPoints);
  const yellowPath = generateSmoothPath(yellowPoints);
  const redPath = generateSmoothPath(redPoints);

  const selectedOption = FILTER_OPTIONS.find((o) => o.value === filterRange) || FILTER_OPTIONS[0];

  return (
    <section className="mb-9" aria-labelledby="section-title-performa">
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[1.45rem] font-bold text-[#111827] tracking-[-0.015em]" id="section-title-performa">
          Performa Toko
        </h2>

        {/* Legend indicator */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#65a30d]" aria-hidden="true" />
            Total Pesanan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" aria-hidden="true" />
            Jumlah Pembeli
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" aria-hidden="true" />
            Pesanan Selesai
          </span>
        </div>
      </div>

      {/* Error state notification */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => loadData(filterRange)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition cursor-pointer text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[2.15fr_1fr] gap-6 items-stretch">
        {/* Left Chart Card */}
        <div className="bg-white rounded-2xl p-[24px_28px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_8px_-1px_rgba(0,0,0,0.04)] flex flex-col gap-4 relative">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[0.95rem] font-bold text-[#111827]">Total Pemasukan</span>

              {isLoading && !analyticsData ? (
                <div className="h-8 w-44 bg-slate-200 rounded-lg animate-pulse mt-1" />
              ) : (
                <span className="text-[1.9rem] font-extrabold text-[#111827] tracking-[-0.02em] mt-1 font-sans">
                  Rp {formatRupiah(totalPemasukan)}
                </span>
              )}
            </div>

            {/* Custom Modern Styled Dropdown Filter */}
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                type="button"
                id="chart-filter-btn"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label="Pilih Rentang Waktu"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="inline-flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl font-sans text-[0.88rem] sm:text-[0.92rem] font-semibold text-[#111827] shadow-2xs hover:bg-slate-50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F4D36]/20"
              >
                <span>{selectedOption.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180 text-[#1F4D36]' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl border border-slate-200/90 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden"
                  role="listbox"
                  aria-label="Pilih Rentang Waktu"
                >
                  {FILTER_OPTIONS.map((opt) => {
                    const isSelected = opt.value === filterRange;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectPeriod(opt.value)}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F4D36] text-white font-bold'
                            : 'text-slate-700 hover:bg-emerald-50 hover:text-[#1F4D36] font-medium'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chart Interactive SVG Canvas */}
          <div className="relative w-full pt-2" ref={chartContainerRef}>
            <div
              className={`absolute pointer-events-none bg-[#111827] text-white py-1.5 px-3 rounded-lg text-[0.8rem] font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.2)] -translate-x-1/2 -translate-y-[120%] transition-[opacity,transform] duration-150 z-20 whitespace-nowrap ${
                tooltip.visible ? 'opacity-100' : 'opacity-0'
              }`}
              id="chart-tooltip"
              aria-hidden={!tooltip.visible}
              style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
            >
              {tooltip.text}
            </div>

            <svg
              className={`w-full h-[260px] block transition-opacity duration-300 ${
                isLoading && !analyticsData ? 'opacity-40 animate-pulse' : 'opacity-100'
              }`}
              id="performance-chart"
              viewBox="0 0 620 280"
              preserveAspectRatio="none"
            >
              {/* Background Grid Lines */}
              <g className="chart-grid">
                <line x1="45" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1.2" />
                <line x1="45" y1="70" x2="600" y2="70" stroke="#f1f5f9" strokeWidth="1.2" />
                <line x1="45" y1="110" x2="600" y2="110" stroke="#f1f5f9" strokeWidth="1.2" />
                <line x1="45" y1="150" x2="600" y2="150" stroke="#f1f5f9" strokeWidth="1.2" />
                <line x1="45" y1="190" x2="600" y2="190" stroke="#f1f5f9" strokeWidth="1.2" />
                <line x1="45" y1="230" x2="600" y2="230" stroke="#e2e8f0" strokeWidth="1.2" />

                <line x1="85" y1="30" x2="85" y2="230" stroke="#f8fafc" strokeWidth="1" />
                <line x1="185" y1="30" x2="185" y2="230" stroke="#f8fafc" strokeWidth="1" />
                <line x1="285" y1="30" x2="285" y2="230" stroke="#f8fafc" strokeWidth="1" />
                <line x1="385" y1="30" x2="385" y2="230" stroke="#f8fafc" strokeWidth="1" />
                <line x1="485" y1="30" x2="485" y2="230" stroke="#f8fafc" strokeWidth="1" />
                <line x1="585" y1="30" x2="585" y2="230" stroke="#f8fafc" strokeWidth="1" />
              </g>

              {/* Y-Axis Labels aligned with ticks */}
              <g className="chart-y-axis" fontSize="12" fill="#64748b" textAnchor="end">
                <text x="35" y="34">{yTicks[5]}</text>
                <text x="35" y="74">{yTicks[4]}</text>
                <text x="35" y="114">{yTicks[3]}</text>
                <text x="35" y="154">{yTicks[2]}</text>
                <text x="35" y="194">{yTicks[1]}</text>
                <text x="35" y="234">{yTicks[0]}</text>
              </g>

              {/* Data Series 1: Green Line (Total Pesanan) */}
              <path
                d={greenPath}
                fill="none"
                stroke="#65a30d"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Data Series 2: Yellow Line (Jumlah Pembeli) */}
              <path
                d={yellowPath}
                fill="none"
                stroke="#eab308"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Data Series 3: Red Line (Pesanan Selesai) */}
              <path
                d={redPath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Interactive Data Points (Green - Total Pesanan) */}
              <g className="[&_circle]:cursor-pointer [&_circle]:transition-all [&_circle]:duration-200 [&_circle:hover]:[r:7] [&_circle:hover]:stroke-white [&_circle:hover]:stroke-[2.5]">
                {greenPoints.map((pt, i) => (
                  <circle
                    key={`green-${pt.label}-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#65a30d"
                    onMouseEnter={(e) => handlePointMouseEnter(e, 'Total Pesanan', pt.label, pt.val)}
                    onMouseLeave={handlePointMouseLeave}
                  />
                ))}
              </g>

              {/* Interactive Data Points (Yellow - Jumlah Pembeli) */}
              <g className="[&_circle]:cursor-pointer [&_circle]:transition-all [&_circle]:duration-200 [&_circle:hover]:[r:7] [&_circle:hover]:stroke-white [&_circle:hover]:stroke-[2.5]">
                {yellowPoints.map((pt, i) => (
                  <circle
                    key={`yellow-${pt.label}-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#eab308"
                    onMouseEnter={(e) => handlePointMouseEnter(e, 'Jumlah Pembeli', pt.label, pt.val)}
                    onMouseLeave={handlePointMouseLeave}
                  />
                ))}
              </g>

              {/* Interactive Data Points (Red - Pesanan Selesai) */}
              <g className="[&_circle]:cursor-pointer [&_circle]:transition-all [&_circle]:duration-200 [&_circle:hover]:[r:7] [&_circle:hover]:stroke-white [&_circle:hover]:stroke-[2.5]">
                {redPoints.map((pt, i) => (
                  <circle
                    key={`red-${pt.label}-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#ef4444"
                    onMouseEnter={(e) => handlePointMouseEnter(e, 'Pesanan Selesai', pt.label, pt.val)}
                    onMouseLeave={handlePointMouseLeave}
                  />
                ))}
              </g>

              {/* X-Axis Labels */}
              <g className="chart-x-axis" fontSize="12" fill="#64748b" textAnchor="middle">
                {trendPoints.map((m, idx) => (
                  <text key={`period-lbl-${m.label}-${idx}`} x={85 + idx * 100} y="258">
                    {m.label}
                  </text>
                ))}
              </g>
            </svg>
          </div>
        </div>

        {/* Right Stat Cards Stack */}
        <div className="flex flex-col justify-between gap-4 h-full">
          {/* Card: Jumlah Pembeli */}
          <div
            className="flex-1 flex flex-col justify-between p-[24px_26px] min-h-[130px] bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_8px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#15803d] focus-visible:outline-offset-2"
            tabIndex={0}
          >
            <span className="text-[0.95rem] font-bold text-[#374151] leading-[1.3]">Jumlah Pembeli</span>
            {isLoading && !analyticsData ? (
              <div className="h-9 w-20 bg-slate-200 rounded-lg animate-pulse mt-3.5" />
            ) : (
              <span className="text-[2.2rem] font-extrabold text-[#111827] leading-none mt-3.5 font-sans">
                {totalBuyers}
              </span>
            )}
          </div>

          {/* Card: Pesanan Selesai */}
          <div
            className="flex-1 flex flex-col justify-between p-[24px_26px] min-h-[130px] bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_8px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#15803d] focus-visible:outline-offset-2"
            tabIndex={0}
          >
            <span className="text-[0.95rem] font-bold text-[#374151] leading-[1.3]">Pesanan Selesai</span>
            {isLoading && !analyticsData ? (
              <div className="h-9 w-20 bg-slate-200 rounded-lg animate-pulse mt-3.5" />
            ) : (
              <span className="text-[2.2rem] font-extrabold text-[#111827] leading-none mt-3.5 font-sans">
                {completedOrders}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
