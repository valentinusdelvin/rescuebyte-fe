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
 * Complies with .agents/docs/architecture.md and .agents/docs/typescript.md.
 */
export function Dashboard({ onShowToast, onNavigateToOrders }: DashboardProps) {
  return (
    <section className="page-view active" id="view-beranda" aria-labelledby="heading-beranda">
      <h1 className="visually-hidden" id="heading-beranda">Beranda Toko Reza</h1>
      <ActivityCards onSelectActivity={onNavigateToOrders} />
      <FinanceCard />
      <PerformanceChart onShowToast={onShowToast} />
    </section>
  );
}
