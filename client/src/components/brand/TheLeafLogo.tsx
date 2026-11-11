import React from 'react';
import { TheLeafMark } from './TheLeafMark';
import { TheLeafWordmark } from './TheLeafWordmark';

interface TheLeafLogoProps {
  variant?: 'emblem' | 'horizontal' | 'mark-only' | 'wordmark-only';
  size?: number | string;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  showCircleBg?: boolean;
  animate?: boolean;
}

/**
 * The Leaf – Cafe and Brew Master Logo Component
 * Supports:
 * - 'emblem': The full circular badge matching logo_the_leaf.jpg
 * - 'horizontal': Navbar and header lockup (Mark on left, Wordmark on right)
 * - 'mark-only': Just the cup + leaf + arch mark
 * - 'wordmark-only': "THE LEAF" typography + waves
 */
export const TheLeafLogo: React.FC<TheLeafLogoProps> = ({
  variant = 'horizontal',
  size,
  theme = 'auto',
  className = '',
  showCircleBg = false,
  animate = false,
}) => {
  const isDark = theme === 'dark';
  const defaultStroke = isDark ? '#F7FBFA' : '#325736';

  if (variant === 'mark-only') {
    return (
      <TheLeafMark
        size={size || 44}
        className={className}
        strokeColor={defaultStroke}
        showCircleBg={showCircleBg}
        animate={animate}
      />
    );
  }

  if (variant === 'wordmark-only') {
    return (
      <TheLeafWordmark
        size={size || 140}
        className={className}
        color={defaultStroke}
      />
    );
  }

  if (variant === 'emblem') {
    // Complete circular badge exactly matching logo_the_leaf.jpg
    const badgeSize = size || 180;
    return (
      <div
        className={`relative inline-flex flex-col items-center justify-center rounded-full bg-[#325736] p-6 text-[#F7FBFA] shadow-xl ${className}`}
        style={{ width: badgeSize, height: badgeSize }}
        role="img"
        aria-label="The Leaf – Cafe and Brew Circular Emblem"
      >
        <div className="flex flex-col items-center justify-center -translate-y-1">
          <TheLeafMark size={typeof badgeSize === 'number' ? badgeSize * 0.52 : '52%'} strokeColor="#F7FBFA" animate={animate} />
          <div className="mt-1">
            <TheLeafWordmark size={typeof badgeSize === 'number' ? badgeSize * 0.72 : '72%'} color="#F7FBFA" />
          </div>
        </div>
      </div>
    );
  }

  // Default: 'horizontal' lockup for Navbar & Headers
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <TheLeafMark
        size={size || 40}
        strokeColor={defaultStroke}
        showCircleBg={showCircleBg}
        animate={animate}
      />
      <div className="flex flex-col">
        <TheLeafWordmark size={size ? Number(size) * 2.8 : 112} color={defaultStroke} />
        <span className="text-[9px] uppercase tracking-[0.28em] font-medium text-[#5E8662] dark:text-[#A3C2A5] -mt-1 pl-1">
          Cafe &amp; Brew · Bhopal
        </span>
      </div>
    </div>
  );
};
