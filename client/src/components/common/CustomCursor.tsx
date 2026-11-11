import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

/**
 * Custom Desktop Cursor:
 * - A refined leaf-dot follower
 * - Expands over interactive items and displays contextual badges ('View', 'Add', 'Book')
 * - Strictly disabled on touch devices via pointer:fine media query
 */
export const CustomCursor: React.FC = () => {
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Strict Hardware Pointer Capability Gating
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsFinePointer(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    if (!mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Detect cursor label or interactive hover
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest('[data-cursor]') as HTMLElement | null;
      if (cursorTarget) {
        setCursorLabel(cursorTarget.getAttribute('data-cursor'));
        setIsHovered(true);
      } else {
        const isInteractive = target.closest('button, a, input, select, textarea, [role="button"]');
        setCursorLabel(null);
        setIsHovered(Boolean(isInteractive));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  if (!isFinePointer) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
      style={{
        x: smoothX,
        y: smoothY,
      }}
      aria-hidden="true"
    >
      <motion.div
        animate={{
          scale: cursorLabel ? 2.8 : isHovered ? 1.8 : 1,
          backgroundColor: isHovered ? 'rgba(50, 87, 54, 0.9)' : 'rgba(50, 87, 54, 0.75)',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative flex items-center justify-center rounded-full text-white shadow-md backdrop-blur-sm"
        style={{
          width: cursorLabel ? '24px' : '10px',
          height: cursorLabel ? '24px' : '10px',
        }}
      >
        {cursorLabel && (
          <span className="text-[5px] uppercase tracking-wider font-bold text-[#F7FBFA]">
            {cursorLabel}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
};
