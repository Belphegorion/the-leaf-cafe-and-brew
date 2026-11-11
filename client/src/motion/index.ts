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
  },
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
  } catch (e) {
    // Ignore unsupported browser errors
  }
};

/**
 * Reusable Framer Motion Variants
 */
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const lineMaskRevealVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: {
      duration: 0.75,
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
    transition: { duration: 0.2, ease: 'easeOut' },
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
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export const buttonPressProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 450, damping: 25 },
};
