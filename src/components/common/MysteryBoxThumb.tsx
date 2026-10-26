import mystBoxSvg from '../../assets/myst-box.svg';

interface MysteryBoxThumbProps {
  imageUrl?: string;
  altText?: string;
  className?: string;
}

/**
 * Reusable Mystery Box Product Thumbnail
 * Displays either user-uploaded photo or high-fidelity cardboard mystery box artwork from assets.
 * Styled with Tailwind CSS classes.
 */
export function MysteryBoxThumb({
  imageUrl,
  altText = 'Mystery Box',
  className = '',
}: MysteryBoxThumbProps) {
  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200/80 ${className}`}
      aria-label={altText}
    >
      <img
        src={imageUrl || mystBoxSvg}
        alt={altText}
        className="w-full h-full object-contain p-1"
      />
    </div>
  );
}
