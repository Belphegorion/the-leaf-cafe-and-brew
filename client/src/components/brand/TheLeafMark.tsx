import React from 'react';

interface TheLeafMarkProps {
  className?: string;
  size?: number | string;
  strokeColor?: string;
  fillColor?: string;
  showCircleBg?: boolean;
  circleBgColor?: string;
  animate?: boolean;
}

/**
 * High-precision vector representation of The Leaf logo emblem mark.
 * Faithful to logo_the_leaf.jpg:
 * - Upper concentric arch
 * - Teardrop leaf with central spine and angled branching veins
 * - Stylized coffee cup silhouette intersecting the leaf
 * - Cup handle and saucer base
 */
export const TheLeafMark: React.FC<TheLeafMarkProps> = ({
  className = '',
  size = 48,
  strokeColor = '#325736',
  fillColor = 'none',
  showCircleBg = false,
  circleBgColor = '#325736',
  animate = false,
}) => {
  const stroke = showCircleBg ? '#F7FBFA' : strokeColor;

  return (
    <svg
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={`inline-block select-none overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {showCircleBg && (
        <circle cx="200" cy="200" r="195" fill={circleBgColor} />
      )}

      {/* Group scaled and centered */}
      <g
        stroke={stroke}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? 'leaf-draw-group' : ''}
      >
        {/* 1. Upper Arch above cup */}
        <path
          d="M 124 165 C 118 100, 160 52, 200 52 C 240 52, 282 100, 276 165"
          className={animate ? 'path-draw' : ''}
        />

        {/* 2. Central Leaf Outline */}
        <path
          d="M 200 78
             C 162 120, 142 165, 150 205
             C 156 235, 185 248, 200 248
             C 215 248, 244 235, 250 205
             C 258 165, 238 120, 200 78 Z"
          fill={fillColor === 'none' ? 'none' : fillColor}
          className={animate ? 'path-draw leaf-pulse' : ''}
        />

        {/* 3. Leaf Center Spine Vein */}
        <line
          x1="200"
          y1="90"
          x2="200"
          y2="242"
          className={animate ? 'path-draw' : ''}
        />

        {/* 4. Upper Veins (Left & Right) */}
        <path
          d="M 200 135 L 168 116"
          className={animate ? 'path-draw' : ''}
        />
        <path
          d="M 200 135 L 232 116"
          className={animate ? 'path-draw' : ''}
        />

        {/* 5. Lower Veins (Left & Right) */}
        <path
          d="M 200 182 L 160 168"
          className={animate ? 'path-draw' : ''}
        />
        <path
          d="M 200 182 L 240 168"
          className={animate ? 'path-draw' : ''}
        />

        {/* 6. Cup Rim (horizontal line spanning across with leaf intersection) */}
        <line
          x1="114"
          y1="184"
          x2="152"
          y2="184"
          className={animate ? 'path-draw' : ''}
        />
        <line
          x1="248"
          y1="184"
          x2="276"
          y2="184"
          className={animate ? 'path-draw' : ''}
        />

        {/* 7. Cup Bowl Lower Curve */}
        <path
          d="M 126 198
             C 134 246, 170 268, 200 268
             C 230 268, 266 246, 274 198"
          className={animate ? 'path-draw' : ''}
        />

        {/* 8. Cup Handle (Right) */}
        <path
          d="M 276 184
             C 305 184, 305 232, 270 232"
          className={animate ? 'path-draw' : ''}
        />

        {/* 9. Saucer Base Arc */}
        <path
          d="M 132 238
             C 152 284, 248 284, 268 238"
          className={animate ? 'path-draw' : ''}
        />
      </g>
    </svg>
  );
};
