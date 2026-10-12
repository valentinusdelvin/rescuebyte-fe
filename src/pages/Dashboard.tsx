import { ActivityCards } from '../components/dashboard/ActivityCards';
import { FinanceCard } from '../components/dashboard/FinanceCard';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';

export interface DashboardProps {
  onShowToast?: (message: string) => void;
}

/**
 * Dashboard (Beranda) Page View
 * Composes activity indicators, financial balance, and graphical performance.
 * Complies with .agents/docs/architecture.md and .agents/docs/typescript.md.
 */
export function Dashboard({ onShowToast }: DashboardProps) {
  return (
    <section className="page-view active" id="view-beranda" aria-labelledby="heading-beranda">
      <h1 className="visually-hidden" id="heading-beranda">Beranda Toko Reza</h1>
      <ActivityCards />
      <FinanceCard />
      <PerformanceChart onShowToast={onShowToast} />
    </section>
  );
}
