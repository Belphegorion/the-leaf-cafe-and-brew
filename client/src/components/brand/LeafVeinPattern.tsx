import React from 'react';

interface LeafVeinPatternProps {
  className?: string;
  opacity?: number;
}

/**
 * Botanical Leaf-Vein delicate line overlay pattern (4-6% opacity),
 * enhancing green sections and plinths with organic Art Deco texture.
 */
export const LeafVeinPattern: React.FC<LeafVeinPatternProps> = ({
  className = '',
  opacity = 0.05,
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        <pattern
          id="leaf-veins"
          x="0"
          y="0"
          width="200"
          height="200"
          patternUnits="userSpaceOnUse"
        >
          {/* Main vein stem */}
          <path d="M 20 180 Q 70 120, 100 20" />
          {/* Lateral branching veins */}
          <path d="M 45 145 Q 85 140, 115 155" />
          <path d="M 68 108 Q 110 95, 140 115" />
          <path d="M 85 68 Q 120 50, 150 70" />

          {/* Opposing branch set */}
          <path d="M 180 20 Q 130 80, 100 180" />
          <path d="M 155 55 Q 115 60, 85 45" />
          <path d="M 132 92 Q 90 105, 60 85" />
          <path d="M 115 132 Q 80 150, 50 130" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#leaf-veins)" />
      </svg>
    </div>
  );
};
