import React from 'react';

interface TheLeafWordmarkProps {
  className?: string;
  size?: number | string;
  color?: string;
  showWaves?: boolean;
}

/**
 * Geometric Art Deco Wordmark "THE LEAF" with 3 wavy lines beneath,
 * faithfully vectorised from logo_the_leaf.jpg.
 */
export const TheLeafWordmark: React.FC<TheLeafWordmarkProps> = ({
  className = '',
  size = 180,
  color = 'currentColor',
  showWaves = true,
}) => {
  return (
    <svg
      viewBox="0 0 420 160"
      width={size}
      height={typeof size === 'number' ? size * 0.38 : undefined}
      className={`inline-block select-none overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="THE LEAF wordmark"
    >
      <g stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        {/* === T === */}
        {/* Top curved bar */}
        <path d="M 18 28 C 24 22, 46 22, 52 28" />
        {/* Stem */}
        <line x1="35" y1="26" x2="35" y2="82" />

        {/* === H === */}
        <line x1="68" y1="24" x2="68" y2="82" />
        <line x1="68" y1="52" x2="98" y2="52" />
        <line x1="98" y1="24" x2="98" y2="82" />

        {/* === E === */}
        <path d="M 144 26 C 122 26, 120 38, 120 53 C 120 68, 122 80, 144 80" />
        <line x1="120" y1="53" x2="140" y2="53" />

        {/* === SPACE === */}

        {/* === L === */}
        <line x1="184" y1="24" x2="184" y2="82" />
        <line x1="184" y1="82" x2="216" y2="82" />

        {/* === E === */}
        <path d="M 252 26 C 230 26, 228 38, 228 53 C 228 68, 230 80, 252 80" />
        <line x1="228" y1="53" x2="248" y2="53" />

        {/* === A === */}
        <line x1="272" y1="82" x2="292" y2="24" />
        <line x1="292" y1="24" x2="312" y2="82" />
        <line x1="279" y1="62" x2="305" y2="62" />

        {/* === F === */}
        <line x1="334" y1="24" x2="334" y2="82" />
        <path d="M 334 26 C 348 24, 358 26, 368 28" />
        <line x1="334" y1="52" x2="356" y2="52" />
      </g>

      {/* === THREE WAVES === */}
      {showWaves && (
        <g stroke={color} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Wave 1 */}
          <path
            d="M 18 102
               C 38 90, 58 114, 78 102
               C 98 90, 118 114, 138 102
               C 158 90, 178 114, 198 102
               C 218 90, 238 114, 258 102
               C 278 90, 298 114, 318 102
               C 338 90, 358 114, 378 102"
          />
          {/* Wave 2 */}
          <path
            d="M 18 118
               C 38 106, 58 130, 78 118
               C 98 106, 118 130, 138 118
               C 158 106, 178 130, 198 118
               C 218 106, 238 130, 258 118
               C 278 106, 298 130, 318 118
               C 338 106, 358 130, 378 118"
          />
          {/* Wave 3 */}
          <path
            d="M 18 134
               C 38 122, 58 146, 78 134
               C 98 122, 118 146, 138 134
               C 158 122, 178 146, 198 134
               C 218 122, 238 146, 258 134
               C 278 122, 298 146, 318 134
               C 338 122, 358 146, 378 134"
          />
        </g>
      )}
    </svg>
  );
};
