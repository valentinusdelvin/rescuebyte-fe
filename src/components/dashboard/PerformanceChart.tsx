import React, { useState, useRef } from 'react';
import { PerformanceFilterKey, FilterSummaryItem } from '../../types';

export interface PerformanceChartProps {
  onShowToast?: (message: string) => void;
}

interface ChartTooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}

const FILTER_SUMMARY: Record<PerformanceFilterKey, FilterSummaryItem> = {
  'bulan-ini': {
    total: 'Rp 1.237.000',
    orders: '60 Pesanan',
    toastMsg: 'Menampilkan performa bulan ini',
  },
  'minggu-ini': {
    total: 'Rp 340.000',
    orders: '16 Pesanan',
    toastMsg: 'Menampilkan performa minggu ini',
  },
  'tahun-ini': {
    total: 'Rp 14.850.000',
    orders: '720 Pesanan',
    toastMsg: 'Menampilkan performa tahun ini',
  },
};

/**
 * PerformanceChart Component
 * Displays store analytics with interactive SVG lines, data points, dynamic tooltips, and time range filter.
 * Complies with .agents/docs/architecture.md, .agents/docs/typescript.md, and .agents/docs/styling.md.
 */
export function PerformanceChart({ onShowToast }: PerformanceChartProps) {
  const [filterRange, setFilterRange] = useState<PerformanceFilterKey>('bulan-ini');
  const [tooltip, setTooltip] = useState<ChartTooltipState>({
    visible: false,
    text: '',
    x: 0,
    y: 0,
  });

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as PerformanceFilterKey;
    setFilterRange(val);
    if (onShowToast && FILTER_SUMMARY[val]) {
      onShowToast(FILTER_SUMMARY[val].toastMsg);
    }
  };

  const handlePointMouseEnter = (
    e: React.MouseEvent<SVGCircleElement>,
    series: string,
    month: string,
    val: string,
  ) => {
    if (!chartContainerRef.current) return;
    const containerRect = chartContainerRef.current.getBoundingClientRect();
    const circleRect = (e.target as SVGCircleElement).getBoundingClientRect();

    const leftPos = circleRect.left - containerRect.left + circleRect.width / 2;
    const topPos = circleRect.top - containerRect.top;

    setTooltip({
      visible: true,
      text: `${month}: ${series} (${val})`,
      x: leftPos,
      y: topPos,
    });
  };

  const handlePointMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const activeData = FILTER_SUMMARY[filterRange] || FILTER_SUMMARY['bulan-ini'];

  return (
    <section className="dashboard-section" aria-labelledby="section-title-performa">
      <h2 className="section-title" id="section-title-performa">Performa Toko</h2>
      <div className="performance-grid">
        {/* Left Chart Card */}
        <div className="performance-chart-card">
          <div className="chart-header">
            <div className="chart-summary">
              <span className="chart-label">Total Pembelian</span>
              <span className="chart-value">{activeData.total}</span>
              <span className="chart-subtitle">{activeData.orders}</span>
            </div>
            <div className="chart-filter-wrapper">
              <select
                className="chart-filter-select"
                id="chart-filter"
                aria-label="Pilih Rentang Waktu"
                value={filterRange}
                onChange={handleFilterChange}
              >
                <option value="bulan-ini">Bulan ini</option>
                <option value="minggu-ini">Minggu ini</option>
                <option value="tahun-ini">Tahun ini</option>
              </select>
            </div>
          </div>

          {/* Chart Interactive SVG Canvas */}
          <div className="chart-canvas-container" ref={chartContainerRef}>
            <div
              className={`chart-tooltip ${tooltip.visible ? 'visible' : ''}`}
              id="chart-tooltip"
              aria-hidden={!tooltip.visible}
              style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
            >
              {tooltip.text}
            </div>

            <svg
              className="performance-svg-chart"
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

              {/* Y-Axis Labels */}
              <g className="chart-y-axis" fontSize="12" fill="#64748b" textAnchor="end">
                <text x="35" y="34">60</text>
                <text x="35" y="74">50</text>
                <text x="35" y="114">40</text>
                <text x="35" y="154">30</text>
                <text x="35" y="194">20</text>
                <text x="35" y="234">10</text>
              </g>

              {/* Data Series 1: Green Line (Kunjungan) */}
              <path
                className="chart-line-green"
                d="M 85 150 C 125 152, 145 156, 185 156 C 225 156, 245 142, 285 138 C 325 130, 345 50, 385 48 C 425 46, 445 74, 485 76 C 525 80, 545 140, 585 142"
                fill="none"
                stroke="#65a30d"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Data Series 2: Yellow Line (Produk Dilihat) */}
              <path
                className="chart-line-yellow"
                d="M 85 174 C 125 162, 145 146, 185 142 C 225 138, 245 125, 285 122 C 325 116, 345 98, 385 98 C 425 98, 445 98, 485 98 C 525 98, 545 32, 585 30"
                fill="none"
                stroke="#eab308"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Data Series 3: Red Line (Pesanan Selesai) */}
              <path
                className="chart-line-red"
                d="M 85 190 C 125 178, 145 168, 185 166 C 225 162, 245 156, 285 154 C 325 150, 345 148, 385 146 C 425 142, 445 140, 485 138 C 525 134, 545 130, 585 128"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Interactive Data Points (Green - Kunjungan) */}
              <g className="chart-points-green">
                <circle cx="85" cy="150" r="4.5" fill="#65a30d" onMouseEnter={(e) => handlePointMouseEnter(e, 'Kunjungan', 'Jan', '30')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="185" cy="156" r="4.5" fill="#65a30d" onMouseEnter={(e) => handlePointMouseEnter(e, 'Kunjungan', 'Feb', '28')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="285" cy="138" r="4.5" fill="#65a30d" onMouseEnter={(e) => handlePointMouseEnter(e, 'Kunjungan', 'Mar', '34')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="385" cy="48" r="4.5" fill="#65a30d" onMouseEnter={(e) => handlePointMouseEnter(e, 'Kunjungan', 'Apr', '55')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="485" cy="76" r="4.5" fill="#65a30d" onMouseEnter={(e) => handlePointMouseEnter(e, 'Kunjungan', 'Mai', '48')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="585" cy="142" r="4.5" fill="#65a30d" onMouseEnter={(e) => handlePointMouseEnter(e, 'Kunjungan', 'Jun', '33')} onMouseLeave={handlePointMouseLeave} />
              </g>

              {/* Interactive Data Points (Yellow - Produk Dilihat) */}
              <g className="chart-points-yellow">
                <circle cx="85" cy="174" r="4.5" fill="#eab308" onMouseEnter={(e) => handlePointMouseEnter(e, 'Produk Dilihat', 'Jan', '24')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="185" cy="142" r="4.5" fill="#eab308" onMouseEnter={(e) => handlePointMouseEnter(e, 'Produk Dilihat', 'Feb', '32')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="285" cy="122" r="4.5" fill="#eab308" onMouseEnter={(e) => handlePointMouseEnter(e, 'Produk Dilihat', 'Mar', '38')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="385" cy="98" r="4.5" fill="#eab308" onMouseEnter={(e) => handlePointMouseEnter(e, 'Produk Dilihat', 'Apr', '43')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="485" cy="98" r="4.5" fill="#eab308" onMouseEnter={(e) => handlePointMouseEnter(e, 'Produk Dilihat', 'Mai', '43')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="585" cy="30" r="4.5" fill="#eab308" onMouseEnter={(e) => handlePointMouseEnter(e, 'Produk Dilihat', 'Jun', '60')} onMouseLeave={handlePointMouseLeave} />
              </g>

              {/* Interactive Data Points (Red - Pesanan Selesai) */}
              <g className="chart-points-red">
                <circle cx="85" cy="190" r="4.5" fill="#ef4444" onMouseEnter={(e) => handlePointMouseEnter(e, 'Pesanan Selesai', 'Jan', '20')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="185" cy="166" r="4.5" fill="#ef4444" onMouseEnter={(e) => handlePointMouseEnter(e, 'Pesanan Selesai', 'Feb', '26')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="285" cy="154" r="4.5" fill="#ef4444" onMouseEnter={(e) => handlePointMouseEnter(e, 'Pesanan Selesai', 'Mar', '29')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="385" cy="146" r="4.5" fill="#ef4444" onMouseEnter={(e) => handlePointMouseEnter(e, 'Pesanan Selesai', 'Apr', '31')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="485" cy="138" r="4.5" fill="#ef4444" onMouseEnter={(e) => handlePointMouseEnter(e, 'Pesanan Selesai', 'Mai', '33')} onMouseLeave={handlePointMouseLeave} />
                <circle cx="585" cy="128" r="4.5" fill="#ef4444" onMouseEnter={(e) => handlePointMouseEnter(e, 'Pesanan Selesai', 'Jun', '36')} onMouseLeave={handlePointMouseLeave} />
              </g>

              {/* X-Axis Labels */}
              <g className="chart-x-axis" fontSize="12" fill="#64748b" textAnchor="middle">
                <text x="85" y="258">Jan</text>
                <text x="185" y="258">Feb</text>
                <text x="285" y="258">Mar</text>
                <text x="385" y="258">Apr</text>
                <text x="485" y="258">Mai</text>
                <text x="585" y="258">Jun</text>
              </g>
            </svg>
          </div>

          {/* Legend Indicator */}
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot green"></span> Kunjungan</span>
            <span className="legend-item"><span className="legend-dot yellow"></span> Produk Dilihat</span>
            <span className="legend-item"><span className="legend-dot red"></span> Pesanan Selesai</span>
          </div>
        </div>

        {/* Right Stat Cards Stack */}
        <div className="performance-stats-stack">
          <div className="stat-card perf-card" tabIndex={0}>
            <span className="perf-label">Jumlah Pembeli</span>
            <span className="perf-number">60</span>
          </div>

          <div className="stat-card perf-card" tabIndex={0}>
            <span className="perf-label">Pesanan Selesai</span>
            <span className="perf-number">48</span>
          </div>

          <div className="stat-card perf-card" tabIndex={0}>
            <span className="perf-label">Pesanan Dibatalkan</span>
            <span className="perf-number">12</span>
          </div>
        </div>
      </div>
    </section>
  );
}
