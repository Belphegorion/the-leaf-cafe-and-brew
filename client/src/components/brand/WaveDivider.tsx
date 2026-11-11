import React from 'react';

interface WaveDividerProps {
  className?: string;
  fillColor?: string;
  strokeColor?: string;
  flip?: boolean;
  animated?: boolean;
}

/**
 * The Three-Wave Divider component derived from The Leaf's logo.
 * Used for elegant section boundaries, card trims, and headers.
 */
export const WaveDivider: React.FC<WaveDividerProps> = ({
  className = '',
  fillColor = 'none',
  strokeColor = '#325736',
  flip = false,
  animated = false,
}) => {
  return (
    <div
      className={`w-full overflow-hidden leading-none select-none ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 48"
        className={`w-full h-8 md:h-12 overflow-visible ${animated ? 'wave-animated' : ''}`}
        preserveAspectRatio="none"
        fill={fillColor}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round">
          {/* Wave 1 */}
          <path
            d="M 0 16
               Q 100 6, 200 16
               T 400 16
               T 600 16
               T 800 16
               T 1000 16
               T 1200 16"
          />
          {/* Wave 2 */}
          <path
            d="M 0 24
               Q 100 14, 200 24
               T 400 24
               T 600 24
               T 800 24
               T 1000 24
               T 1200 24"
            opacity="0.8"
          />
          {/* Wave 3 */}
          <path
            d="M 0 32
               Q 100 22, 200 32
               T 400 32
               T 600 32
               T 800 32
               T 1000 32
               T 1200 32"
            opacity="0.6"
          />
        </g>
      </svg>
    </div>
  );
};
