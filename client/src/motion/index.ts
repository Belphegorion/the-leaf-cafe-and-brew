import React from 'react';
import type { Variants } from 'motion/react';

/**
 * The Leaf – Unified Motion System
 *
 * Rules:
 * - Purposeful not decorative
 * - Under ~700ms for UI feedback
 * - Never block interaction, always skippable
 * - Respects prefers-reduced-motion automatically
 * - Transforms & opacity only (avoid layout thrashing)
 */

export const motionTokens = {
  easings: {
    outExpo: [0.16, 1, 0.3, 1] as const,
    springGentle: [0.22, 1, 0.36, 1] as const,
    springSnappy: [0.34, 1.56, 0.64, 1] as const,
    drawer: [0.32, 0.72, 0, 1] as const,
  },
  durations: {
    instant: 0,
    fast: 0.18,
    normal: 0.32,
    slow: 0.6,
    reveal: 0.75,
  },
  springs: {
    snappy: { type: 'spring' as const, stiffness: 400, damping: 28 },
    gentle: { type: 'spring' as const, stiffness: 260, damping: 24 },
    bouncy: { type: 'spring' as const, stiffness: 450, damping: 18 },
    modal: { type: 'spring' as const, stiffness: 300, damping: 30 },
    bottomSheet: { type: 'spring' as const, stiffness: 320, damping: 28 },
    mobilePress: { type: 'spring' as const, stiffness: 500, damping: 30 },
  },
  mobile: {
    durations: {
      feedback: 0.1,    // 100ms
      ui: 0.2,          // 200ms (mobile budget is <= 250ms)
      reveal: 0.35,     // 350ms
    },
    springs: {
      settle: { type: 'spring' as const, stiffness: 380, damping: 28 },
      sheet: { type: 'spring' as const, stiffness: 300, damping: 28 },
      tap: { type: 'spring' as const, stiffness: 500, damping: 32 },
    },
  },
};

/**
 * Hook to detect mobile viewport (< 768px)
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(media.matches);

    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [breakpoint]);

  return isMobile;
};

/**
 * Hook to detect reduced motion preference
 */
export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);

    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  return reduced;
};

/**
 * Checks if reduced motion is requested
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Checks if hardware has fine pointer capability (for desktop hover / cursor effects)
 */
export const hasFinePointer = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
};

/**
 * Safe mobile haptic feedback helper
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(20);
        break;
      case 'medium':
        navigator.vibrate(40);
        break;
      case 'success':
        navigator.vibrate([30, 40, 50]);
        break;
    }
  } catch {
    // Ignore unsupported browser errors
  }
};

/**
 * Reusable Framer Motion Variants
 */
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const lineMaskRevealVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const popoverVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: motionTokens.springs.modal,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

export const drawerVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: motionTokens.springs.modal,
  },
  exit: {
    x: '100%',
    transition: { duration: 0.22, ease: 'easeIn' },
  },
};

/**
 * Mobile-Adaptive Drawer Variants:
 * Slides up from bottom (y: 100%) on mobile as a bottom sheet,
 * and slides from right (x: 100%) on desktop.
 */
export const responsiveDrawerVariants: Variants = {
  hidden: (isMobile: boolean) => ({
    x: isMobile ? 0 : '100%',
    y: isMobile ? '100%' : 0,
  }),
  visible: {
    x: 0,
    y: 0,
    transition: motionTokens.springs.bottomSheet,
  },
  exit: (isMobile: boolean) => ({
    x: isMobile ? 0 : '100%',
    y: isMobile ? '100%' : 0,
    transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
  }),
};

export const buttonPressProps = {
  whileTap: { scale: 0.97 },
  transition: motionTokens.mobile.springs.tap,
};

export const getButtonPressProps = (finePointer: boolean = false) => ({
  whileHover: finePointer ? { scale: 1.02 } : undefined,
  whileTap: { scale: 0.97 },
  transition: { type: 'spring' as const, stiffness: 450, damping: 25 },
});
