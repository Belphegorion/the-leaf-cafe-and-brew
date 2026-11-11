import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { TheLeafMark } from '../components/brand/TheLeafMark';

export const NotFoundPage: React.FC = () => {
  return (
    <main id="main-content" className="min-h-[80vh] bg-[#F5EFE4] dark:bg-[#101C13] flex flex-col items-center justify-center text-center px-4 pt-28 pb-16">
      {/* Animated sleeping cup illustration */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="flex h-32 w-32 items-center justify-center rounded-full bg-[#28492C] text-[#F7FBFA] shadow-2xl border-4 border-[#D8C7AA] dark:border-[#1F3A24] mb-6"
      >
        <TheLeafMark size={70} strokeColor="#F7FBFA" />
      </motion.div>

      <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#5E8662] dark:text-[#A3C2A5]">
        Error 404 · Page Not Found
      </span>

      <h1 className="text-4xl sm:text-6xl font-display uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#F7FBFA] mt-2">
        THIS CUP HAS SPILLED
      </h1>

      <p className="mt-3 text-sm text-[#1F2A22]/70 dark:text-[#F7FBFA]/70 max-w-md font-light leading-relaxed">
        The table or recipe you were looking for doesn't exist or has wandered off into the botanical gardens.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#28492C] px-6 py-3 min-h-[44px] text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#1F3A24] transition-colors dark:bg-[#5E8662] dark:hover:bg-[#28492C] touch-manipulation focus-visible:outline-2 focus-visible:outline-[#28492C]"
        >
          <MonolineIcon name="cup" size={16} color="#F7FBFA" />
          <span>Return to Cafe Home</span>
        </Link>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 rounded-full border border-[#D8C7AA] dark:border-[#325736]/30 bg-white/80 dark:bg-transparent px-6 py-3 min-h-[44px] text-xs font-semibold uppercase tracking-wider text-[#28492C] dark:text-[#F7FBFA] hover:bg-[#EAE0D0] dark:hover:bg-[#1F3A24] transition-colors touch-manipulation focus-visible:outline-2 focus-visible:outline-[#28492C]"
        >
          <MonolineIcon name="spoon" size={16} />
          <span>Browse Menu</span>
        </Link>
      </div>
    </main>
  );
};
