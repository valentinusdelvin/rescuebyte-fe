import { ActivityCards } from '../components/dashboard/ActivityCards';
import { FinanceCard } from '../components/dashboard/FinanceCard';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { OrderStatusTab } from '../types';

export interface DashboardProps {
  onShowToast?: (message: string) => void;
  onNavigateToOrders?: (tabId: OrderStatusTab) => void;
}

/**
 * Dashboard (Beranda) Page View
 * Composes activity indicators, financial balance, and graphical performance.
 * Styled with Tailwind CSS classes.
 */
export function Dashboard({ onShowToast, onNavigateToOrders }: DashboardProps) {
  return (
    <section className="block animate-[fadeIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]" id="view-beranda" aria-labelledby="heading-beranda">
      <h1 className="sr-only" id="heading-beranda">Beranda Toko Reza</h1>
      <ActivityCards onSelectActivity={onNavigateToOrders} />
      <FinanceCard />
      <PerformanceChart onShowToast={onShowToast} />
    </section>
  );
}
