import mystBoxSvg from '../../assets/myst-box.svg';

interface MysteryBoxThumbProps {
  imageUrl?: string;
  altText?: string;
  className?: string;
}

/**
 * Reusable Mystery Box Product Thumbnail
 * Displays either user-uploaded photo or high-fidelity cardboard mystery box artwork from assets.
 */
export function MysteryBoxThumb({
  imageUrl,
  altText = 'Mystery Box',
  className = '',
}: MysteryBoxThumbProps) {
  return (
    <div className={`mystery-box-thumb-wrapper ${className}`} aria-label={altText}>
      <img
        src={imageUrl || mystBoxSvg}
        alt={altText}
        className="mystery-box-img-preview"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
