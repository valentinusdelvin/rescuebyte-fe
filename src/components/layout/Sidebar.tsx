import { ActiveViewId } from '../../types';

export interface SidebarProps {
  activeView: ActiveViewId;
  storeName?: string;
  isMobileOpen: boolean;
  onNavigate?: (viewId: string, label: string) => void;
  onCloseMobile?: () => void;
}

/**
 * RescueBite Sidebar Navigation Component
 * Features store profile identity and grouped navigation links for Tokoku, Pesanan, and Dagangan.
 * Complies with .agents/docs/architecture.md, .agents/docs/typescript.md, and .agents/docs/styling.md.
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
        className={`sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        id="sidebar-backdrop"
        onClick={onCloseMobile}
      />

      {/* Left Sidebar Navigation */}
      <aside className={`app-sidebar ${isMobileOpen ? 'open' : ''}`} id="app-sidebar">
        {/* Sidebar Store Header */}
        <div className="sidebar-store-card">
          <div className="sidebar-store-icon">
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
          <span className="sidebar-store-name">{storeName}</span>
        </div>

        <div className="sidebar-divider" />

        {/* Navigation Groups */}
        <nav className="sidebar-nav" aria-label="Navigasi Menu Toko">
          {/* Group 1: Tokoku */}
          <div className="nav-group">
            <div className="nav-group-header">
              <span className="group-icon">
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
              <span className="group-title">Tokoku</span>
            </div>
            <ul className="nav-sublist">
              <li>
                <button
                  type="button"
                  className={`nav-sublink ${activeView === 'view-beranda' ? 'active' : ''}`}
                  id="nav-beranda"
                  onClick={() => handleItemClick('view-beranda', 'Beranda')}
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-sublink ${activeView === 'view-profil' ? 'active' : ''}`}
                  id="nav-profil"
                  onClick={() => handleItemClick('view-profil', 'Profil Toko')}
                >
                  Profil Toko
                </button>
              </li>
            </ul>
          </div>

          {/* Group 2: Pesanan */}
          <div className="nav-group">
            <div className="nav-group-header">
              <span className="group-icon">
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
              <span className="group-title">Pesanan</span>
            </div>
            <ul className="nav-sublist">
              <li>
                <button
                  type="button"
                  className={`nav-sublink ${activeView === 'view-riwayat' ? 'active' : ''}`}
                  id="nav-riwayat"
                  onClick={() => handleItemClick('view-riwayat', 'Riwayat Pesanan')}
                >
                  Riwayat Pesanan
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-sublink ${activeView === 'view-ulasan' ? 'active' : ''}`}
                  id="nav-ulasan"
                  onClick={() => handleItemClick('view-ulasan', 'Ulasan Pembeli')}
                >
                  Ulasan Pembeli
                </button>
              </li>
            </ul>
          </div>

          {/* Group 3: Dagangan */}
          <div className="nav-group">
            <div className="nav-group-header">
              <span className="group-icon">
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
              <span className="group-title">Dagangan</span>
            </div>
            <ul className="nav-sublist">
              <li>
                <button
                  type="button"
                  className={`nav-sublink ${activeView === 'view-buat-dagangan' ? 'active' : ''}`}
                  id="nav-buat-dagangan"
                  onClick={() => handleItemClick('view-buat-dagangan', 'Buat Dagangan')}
                >
                  Buat Dagangan
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-sublink ${activeView === 'view-daganganku' ? 'active' : ''}`}
                  id="nav-daganganku"
                  onClick={() => handleItemClick('view-daganganku', 'Daganganku')}
                >
                  Daganganku
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-sublink ${activeView === 'view-pengiriman' ? 'active' : ''}`}
                  id="nav-pengiriman"
                  onClick={() => handleItemClick('view-pengiriman', 'Pengiriman')}
                >
                  Pengiriman
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
