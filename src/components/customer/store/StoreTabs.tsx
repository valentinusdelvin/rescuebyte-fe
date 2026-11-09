import { StoreDetailTab } from './types';

export interface StoreTabsProps {
  activeTab: StoreDetailTab;
  onTabChange: (tab: StoreDetailTab) => void;
  productCount: number;
  reviewCount: number;
}

export function StoreTabs({
  activeTab,
  onTabChange,
  productCount,
  reviewCount,
}: StoreTabsProps) {
  return (
    <nav aria-label="Tab Informasi Toko" className="flex items-center gap-6 border-b border-slate-200/90 mb-8">
      <button
        type="button"
        onClick={() => onTabChange('tentang')}
        className={`pb-3 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          activeTab === 'tentang'
            ? 'border-[#1b1c1c] text-[#1b1c1c]'
            : 'border-transparent text-slate-400 hover:text-slate-700'
        }`}
      >
        Tentang Toko
      </button>
      <button
        type="button"
        onClick={() => onTabChange('produk')}
        className={`pb-3 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          activeTab === 'produk'
            ? 'border-[#1b1c1c] text-[#1b1c1c]'
            : 'border-transparent text-slate-400 hover:text-slate-700'
        }`}
      >
        Semua Produk ({productCount})
      </button>
      <button
        type="button"
        onClick={() => onTabChange('ulasan')}
        className={`pb-3 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          activeTab === 'ulasan'
            ? 'border-[#1b1c1c] text-[#1b1c1c]'
            : 'border-transparent text-slate-400 hover:text-slate-700'
        }`}
      >
        Ulasan ({reviewCount})
      </button>
    </nav>
  );
}
