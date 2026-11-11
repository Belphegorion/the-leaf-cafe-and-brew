import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { MonolineIcon } from '../brand/MonolineIcon';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Animated leaf-to-cup morphing theme toggle button.
 * - Light mode: Displays a vibrant botanical Leaf icon.
 * - Dark mode: Morphs into a steaming coffee cup icon.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex min-h-[44px] min-w-[44px] h-11 w-11 items-center justify-center rounded-full border border-[#E0D2B8] bg-white text-[#325736] shadow-sm backdrop-blur-md transition-colors hover:border-[#325736] hover:bg-[#F5EFE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#325736] active:scale-95 dark:border-[#284A2D] dark:bg-[#1F3A24] dark:text-[#A3C2A5] dark:hover:bg-[#284A2D] dark:focus-visible:ring-[#A3C2A5] ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Current: ${theme} mode (Click to toggle)`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="cup"
            initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <MonolineIcon name="cup" size={20} color="#F7FBFA" strokeWidth={2.2} />
          </motion.div>
        ) : (
          <motion.div
            key="leaf"
            initial={{ opacity: 0, rotate: 45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.7 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <MonolineIcon name="leaf" size={20} color="#325736" strokeWidth={2.2} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
