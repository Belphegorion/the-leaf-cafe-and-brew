import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

/**
 * A thin brand green wave line fixed at the very top of the viewport
 * that advances with the user's scroll progress.
 */
export const ScrollProgressWave: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[3px] bg-transparent"
      aria-hidden="true"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-[#325736] via-[#5E8662] to-[#A3C2A5] origin-left shadow-[0_0_8px_rgba(50,87,54,0.6)]"
        style={{ scaleX }}
      />
    </div>
  );
};
