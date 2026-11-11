import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TheLeafMark } from '../brand/TheLeafMark';
import { TheLeafWordmark } from '../brand/TheLeafWordmark';

interface PreloaderProps {
  onComplete?: () => void;
}

/**
 * Branded Preloader:
 * - Logo mark draws itself via SVG stroke animation
 * - Three waves ripple
 * - Leaf fills
 * - Circular iris wipe reveals the site
 * - Skips automatically on repeat visits within the same session
 */
export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      const isRepeat = localStorage.getItem('theleaf_visited');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return !isRepeat && !prefersReduced;
    }
    return false;
  });

  const [leafFilled, setLeafFilled] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      onComplete?.();
      return;
    }

    // Step 1: Trigger leaf fill at 250ms
    const fillTimer = setTimeout(() => {
      setLeafFilled(true);
    }, 250);

    // Step 2: Trigger exit iris wipe at 600ms
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      try {
        localStorage.setItem('theleaf_visited', 'true');
      } catch (e) {
        // Ignore private browsing storage quota
      }
      onComplete?.();
    }, 600);

    return () => {
      clearTimeout(fillTimer);
      clearTimeout(exitTimer);
    };
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{
            clipPath: 'circle(0% at 50% 50%)',
            opacity: 0.95,
            transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#325736] text-[#F7FBFA]"
          style={{ clipPath: 'circle(150% at 50% 50%)' }}
          role="status"
          aria-live="polite"
          aria-label="Loading The Leaf – Cafe and Brew"
        >
          <div className="flex flex-col items-center justify-center scale-110 md:scale-125">
            <TheLeafMark
              size={140}
              strokeColor="#F7FBFA"
              fillColor={leafFilled ? 'rgba(247, 251, 250, 0.92)' : 'none'}
              animate={true}
            />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-4"
            >
              <TheLeafWordmark size={180} color="#F7FBFA" showWaves={true} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="mt-2 text-[10px] tracking-[0.3em] uppercase font-light text-[#C9DCC9]"
            >
              Pure Vegetarian · Bhopal
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
