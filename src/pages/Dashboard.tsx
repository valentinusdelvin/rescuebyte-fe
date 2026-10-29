import { ActivityCards } from '../components/dashboard/ActivityCards';
import { FinanceCard } from '../components/dashboard/FinanceCard';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { OrderStatusTab } from '../types';

export interface DashboardProps {
  storeName?: string;
  onShowToast?: (message: string) => void;
  onNavigateToOrders?: (tabId: OrderStatusTab) => void;
}

/**
 * Dashboard (Beranda) Page View
 * Composes live activity indicators, financial balance, and graphical performance.
 * Styled with Tailwind CSS classes.
 */
export function Dashboard({ storeName, onShowToast, onNavigateToOrders }: DashboardProps) {
  return (
    <section
      className="block animate-[fadeIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]"
      id="view-beranda"
      aria-labelledby="heading-beranda"
    >
      <h1 className="sr-only" id="heading-beranda">
        Beranda {storeName || 'Toko'}
      </h1>
      <ActivityCards storeName={storeName} onSelectActivity={onNavigateToOrders} />
      <FinanceCard storeName={storeName} />
      <PerformanceChart onShowToast={onShowToast} />
    </section>
  );
}
