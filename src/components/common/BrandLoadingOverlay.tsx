import { useState, useEffect } from 'react';
import rescuebyteLogo from '../../assets/logo.svg';

export interface BrandLoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
}

interface RadialTick {
  color: string;
  opacity: number;
}

/**
 * 24-segment radial progress indicator:
 * Smooth gradient from deep forest green (#1B5E20) through brand primary (#2E7D32)
 * to luminous light mint (#EBFCEE), with delicately stepped opacities (1.00 down to 0.11).
 * Leaves no awkward empty gaps, forming an exquisite continuous ring around the RescueBite logo.
 */
const RADIAL_TICKS: RadialTick[] = [
  { color: '#1B5E20', opacity: 1.0 },
  { color: '#1E6524', opacity: 0.96 },
  { color: '#226C28', opacity: 0.92 },
  { color: '#27742D', opacity: 0.88 },
  { color: '#2E7D32', opacity: 0.84 },
  { color: '#338537', opacity: 0.8 },
  { color: '#398E3D', opacity: 0.76 },
  { color: '#3F9743', opacity: 0.72 },
  { color: '#45A049', opacity: 0.68 },
  { color: '#4CAF50', opacity: 0.64 },
  { color: '#55B559', opacity: 0.6 },
  { color: '#5FBA64', opacity: 0.56 },
  { color: '#69C06E', opacity: 0.52 },
  { color: '#74C679', opacity: 0.48 },
  { color: '#80CC84', opacity: 0.44 },
  { color: '#8CD190', opacity: 0.4 },
  { color: '#97D79B', opacity: 0.36 },
  { color: '#A3DDA7', opacity: 0.32 },
  { color: '#AFE3B3', opacity: 0.28 },
  { color: '#BBE9BF', opacity: 0.25 },
  { color: '#C7EFCB', opacity: 0.22 },
  { color: '#D3F4D7', opacity: 0.2 },
  { color: '#DFF8E3', opacity: 0.18 },
  { color: '#EBFCEE', opacity: 0.16 },
];

/**
 * BrandLoadingOverlay Component
 *
 * Modern, premium, minimalist brand loading indicator:
 * - Transparent container pod (no solid white card/frame)
 * - Prominent, crisp, enlarged RescueBite logo in the center
 * - Continuous, silky-smooth 24-ray radial spinner in dark-to-light green gradient
 * - Balanced, translucent dark slate overlay with restrained optical backdrop blur
 * - Soft enter and exit opacity transitions
 * - Supports prefers-reduced-motion
 */
export function BrandLoadingOverlay({ isVisible }: BrandLoadingOverlayProps) {
  const [isRendered, setIsRendered] = useState(isVisible);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
      setIsExiting(false);
    } else if (isRendered) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsExiting(false);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isRendered]);

  if (!isRendered) return null;

  return (
    <div
      className={`brand-loading-backdrop ${isExiting ? 'is-exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      id="brand-loading-overlay"
    >
      <div className={`brand-spinner-pod ${isExiting ? 'is-exiting' : ''}`}>
        {/* Radial tick spinner around the logo (170x170 viewBox with center at 85, 85) */}
        <svg
          className="brand-radial-spinner-svg"
          viewBox="0 0 170 170"
          width="170"
          height="170"
          aria-hidden="true"
        >
          <g className="brand-radial-ticks-group">
            {RADIAL_TICKS.map((tick, i) => (
              <line
                key={i}
                x1="85"
                y1="5"
                x2="85"
                y2="20"
                stroke={tick.color}
                strokeWidth="2.9"
                strokeLinecap="round"
                opacity={tick.opacity}
                transform={`rotate(${i * 15} 85 85)`}
              />
            ))}
          </g>
        </svg>

        {/* RescueBite logo centered, enlarged, and razor sharp */}
        <div className="brand-spinner-logo-center">
          <img
            src={rescuebyteLogo}
            alt="RescueBite"
            className="brand-loading-logo"
            width="86"
            height="78"
            loading="eager"
            decoding="sync"
          />
        </div>
      </div>
    </div>
  );
}
