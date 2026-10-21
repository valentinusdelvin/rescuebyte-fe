import { CustomerMysteryBox } from '../../types';

export interface MysteryBoxCardProps {
  item: CustomerMysteryBox;
  variant?: 'popular' | 'radius';
  onOrderClick: (item: CustomerMysteryBox) => void;
}

/**
 * Format currency with dots thousands separator (e.g. 35000 -> "35.000")
 */
function formatRupiah(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Reusable Mystery Box Card for Customer Landing Page
 * Matches high-fidelity design specifications for "Mystery Box Populer" and "Sekitarmu (Radius 5 km)".
 * Complies with .agents/docs/architecture.md, styling.md, and typescript.md.
 */
export function MysteryBoxCard({
  item,
  variant = 'popular',
  onOrderClick,
}: MysteryBoxCardProps) {
  const isPopular = variant === 'popular';

  return (
    <article className="customer-box-card" id={`box-card-${item.id}`}>
      {/* Card Visual Header with Badges */}
      <div className="box-card-media">
        <img
          src={item.imageSrc}
          alt={`Mystery Box ${item.storeName}`}
          className="box-card-img"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="box-card-badges-top">
          <div className="box-card-left-badges">
            {isPopular ? (
              <>
                <span className="badge-remaining-urgent">
                  {item.remainingBoxesText.toUpperCase()}
                </span>
                <span className="badge-distance-pill">
                  {item.distanceText}
                </span>
              </>
            ) : (
              <span className="badge-rating-pill">
                ⭐ {item.rating?.toFixed(1) || '4.9'} ({item.reviewCount || 100}+)
              </span>
            )}
          </div>

          <div className="box-card-right-badges">
            <span className="badge-discount-green">
              -{item.discountPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="box-card-body">
        {/* Category & Store Name */}
        <div className="box-card-category-row">
          <span className="box-card-category">{item.category}</span>
          {!isPopular && (
            <span className="box-card-distance-inline">{item.distanceText}</span>
          )}
        </div>

        <h3 className="box-card-title">{item.storeName}</h3>

        <p className="box-card-desc">{item.description}</p>

        {/* Tags */}
        <div className="box-card-tags">
          {item.tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className={`box-tag-pill ${idx === 0 ? 'box-tag-green' : 'box-tag-gray'}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Pickup Time */}
        <div className="box-card-pickup-time">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{item.pickupTime}</span>
        </div>
      </div>

      {/* Card Footer with Price and Action */}
      <div className="box-card-footer">
        <div className="box-card-price-group">
          <span className="box-card-original-price">
            Rp {formatRupiah(item.originalPrice)}
          </span>
          <span className="box-card-rescue-price">
            Rp {formatRupiah(item.rescuePrice)}
          </span>
        </div>

        <button
          type="button"
          className="box-card-cta-btn"
          id={`btn-order-${item.id}`}
          onClick={() => onOrderClick(item)}
          aria-label={`Ambil Mystery Box dari ${item.storeName}`}
        >
          {isPopular ? (
            <>
              <span>Ambil Sekarang</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          ) : (
            <span>Pesan Box</span>
          )}
        </button>
      </div>
    </article>
  );
}
