import { CSSProperties } from 'react';
import { ActiveViewId } from '../../types';

export interface SidebarProps {
  activeView: ActiveViewId;
  storeName?: string;
  isMobileOpen: boolean;
  onNavigate?: (viewId: string, label: string) => void;
  onCloseMobile?: () => void;
}

/**
 * Accessible Staggered Letter Text Component
 * Splits text into individual animated characters with CSS variable transition-delay
 * Screen readers consume aria-label while inner character spans remain aria-hidden
 */
export function StaggeredLinkText({ text, active = false }: { text: string; active?: boolean }) {
  return (
    <span className="inline-flex items-center relative" aria-label={text}>
      <span className="inline-flex items-center whitespace-nowrap" aria-hidden="true">
        {text.split('').map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="inline-block relative overflow-hidden h-[1.35em] leading-[1.35em] align-middle"
            style={{ '--char-index': index } as CSSProperties}
          >
            <span
              className={`block [backface-visibility:hidden] transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full ${
                active ? 'font-extrabold text-[#111827]' : ''
              }`}
              style={{ transitionDelay: `${index * 20}ms` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
            <span
              className={`block absolute top-full left-0 w-full [backface-visibility:hidden] transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full font-bold ${
                active ? 'font-extrabold text-[#15803d]' : 'text-[#111827]'
              }`}
              style={{ transitionDelay: `${index * 20}ms` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * RescueBite Sidebar Navigation Component
 * Features store profile identity and grouped navigation links for Tokoku, Pesanan, and Dagangan.
 * Styled with Tailwind CSS classes matching exact original CSS layout, kinetic animations, and green buttons.
 */
export function Sidebar({
  activeView,
  storeName = 'Toko Reza',
  isMobileOpen,
  onNavigate,
  onCloseMobile,
}: SidebarProps) {
  const handleItemClick = (viewId: string, label: string) => {
    if (onNavigate) onNavigate(viewId, label);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      <div
        className={`fixed top-[72px] left-0 right-0 bottom-0 bg-black/40 z-[80] transition-opacity duration-150 md:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        id="sidebar-backdrop"
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Left Sidebar Navigation */}
      <aside
        className={`w-[250px] shrink-0 bg-white p-[24px_20px] border-r border-black/[0.08] shadow-[6px_0_24px_-4px_rgba(0,0,0,0.08),2px_0_8px_-2px_rgba(0,0,0,0.04)] relative z-20 flex flex-col gap-5 max-md:fixed max-md:top-[72px] max-md:left-0 max-md:bottom-0 max-md:z-[90] max-md:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-md:transition-transform max-md:duration-250 max-md:ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        }`}
        id="app-sidebar"
      >
        {/* Sidebar Store Header */}
        <div className="flex items-center gap-3 py-1 px-1.5">
          <div className="flex items-center justify-center text-[#111827]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="9" r="3.2" />
              <path d="M6.168 18.849a6.5 6.5 0 0 1 11.664 0" />
            </svg>
          </div>
          <span className="text-[1.15rem] font-bold tracking-[-0.01em] text-[#111827] truncate">{storeName}</span>
        </div>

        <div className="h-[1.5px] bg-[#4b5563] mx-1" />

        {/* Navigation Groups */}
        <nav className="flex flex-col gap-7" aria-label="Navigasi Menu Toko">
          {/* Group 1: Tokoku */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 px-1">
              <span className="flex items-center justify-center text-[#111827]">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l2-5h14l2 5" />
                  <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
                  <path d="M9 22V12h6v10" />
                  <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
                </svg>
              </span>
              <span className="text-[1.25rem] font-bold text-[#111827] tracking-[-0.01em] font-sans">Tokoku</span>
            </div>
            <ul className="list-none flex flex-col gap-1.5 pl-[38px]">
              <li>
                <button
                  type="button"
                  className={`group inline-flex items-center w-full text-left text-base py-[5px] bg-transparent border-0 cursor-pointer relative transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1.5 hover:text-[#111827] focus-visible:translate-x-1.5 focus-visible:text-[#111827] focus-visible:outline-none ${
                    activeView === 'view-beranda'
                      ? 'font-extrabold text-[#111827]'
                      : 'font-medium text-[#4b5563]'
                  }`}
                  id="nav-beranda"
                  onClick={() => handleItemClick('view-beranda', 'Beranda')}
                >
                  <StaggeredLinkText text="Beranda" active={activeView === 'view-beranda'} />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`group inline-flex items-center w-full text-left text-base py-[5px] bg-transparent border-0 cursor-pointer relative transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1.5 hover:text-[#111827] focus-visible:translate-x-1.5 focus-visible:text-[#111827] focus-visible:outline-none ${
                    activeView === 'view-profil'
                      ? 'font-extrabold text-[#111827]'
                      : 'font-medium text-[#4b5563]'
                  }`}
                  id="nav-profil"
                  onClick={() => handleItemClick('view-profil', 'Profil Toko')}
                >
                  <StaggeredLinkText text="Profil Toko" active={activeView === 'view-profil'} />
                </button>
              </li>
            </ul>
          </div>

          {/* Group 2: Pesanan */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 px-1">
              <span className="flex items-center justify-center text-[#111827]">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </span>
              <span className="text-[1.25rem] font-bold text-[#111827] tracking-[-0.01em] font-sans">Pesanan</span>
            </div>
            <ul className="list-none flex flex-col gap-1.5 pl-[38px]">
              <li>
                <button
                  type="button"
                  className={`group inline-flex items-center w-full text-left text-base py-[5px] bg-transparent border-0 cursor-pointer relative transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1.5 hover:text-[#111827] focus-visible:translate-x-1.5 focus-visible:text-[#111827] focus-visible:outline-none ${
                    activeView === 'view-riwayat'
                      ? 'font-extrabold text-[#111827]'
                      : 'font-medium text-[#4b5563]'
                  }`}
                  id="nav-riwayat"
                  onClick={() => handleItemClick('view-riwayat', 'Riwayat Pesanan')}
                >
                  <StaggeredLinkText text="Riwayat Pesanan" active={activeView === 'view-riwayat'} />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`group inline-flex items-center w-full text-left text-base py-[5px] bg-transparent border-0 cursor-pointer relative transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1.5 hover:text-[#111827] focus-visible:translate-x-1.5 focus-visible:text-[#111827] focus-visible:outline-none ${
                    activeView === 'view-ulasan'
                      ? 'font-extrabold text-[#111827]'
                      : 'font-medium text-[#4b5563]'
                  }`}
                  id="nav-ulasan"
                  onClick={() => handleItemClick('view-ulasan', 'Ulasan Pembeli')}
                >
                  <StaggeredLinkText text="Ulasan Pembeli" active={activeView === 'view-ulasan'} />
                </button>
              </li>
            </ul>
          </div>

          {/* Group 3: Dagangan */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 px-1">
              <span className="flex items-center justify-center text-[#111827]">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" rx="1" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              </span>
              <span className="text-[1.25rem] font-bold text-[#111827] tracking-[-0.01em] font-sans">Dagangan</span>
            </div>
            <ul className="list-none flex flex-col gap-1.5 pl-[38px]">
              <li>
                <button
                  type="button"
                  className={`group inline-flex items-center w-full text-left text-base py-[5px] bg-transparent border-0 cursor-pointer relative transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1.5 hover:text-[#111827] focus-visible:translate-x-1.5 focus-visible:text-[#111827] focus-visible:outline-none ${
                    activeView === 'view-buat-dagangan'
                      ? 'font-extrabold text-[#111827]'
                      : 'font-medium text-[#4b5563]'
                  }`}
                  id="nav-buat-dagangan"
                  onClick={() => handleItemClick('view-buat-dagangan', 'Buat Dagangan')}
                >
                  <StaggeredLinkText text="Buat Dagangan" active={activeView === 'view-buat-dagangan'} />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`group inline-flex items-center w-full text-left text-base py-[5px] bg-transparent border-0 cursor-pointer relative transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-1.5 hover:text-[#111827] focus-visible:translate-x-1.5 focus-visible:text-[#111827] focus-visible:outline-none ${
                    activeView === 'view-daganganku'
                      ? 'font-extrabold text-[#111827]'
                      : 'font-medium text-[#4b5563]'
                  }`}
                  id="nav-daganganku"
                  onClick={() => handleItemClick('view-daganganku', 'Daganganku')}
                >
                  <StaggeredLinkText text="Daganganku" active={activeView === 'view-daganganku'} />
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
