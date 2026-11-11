import React from 'react';
import { motion } from 'motion/react';
import { MENU_CATEGORIES } from '../../../../shared/constants';
import type { CategorySlug } from '../../../../shared/types';

interface CategoryTabsProps {
  activeCategory: CategorySlug | 'all';
  onSelectCategory: (category: CategorySlug | 'all') => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const allTabs = [
    { id: 'all' as const, name: 'All Creations' },
    ...MENU_CATEGORIES.map(c => ({ id: c.id, name: c.name })),
  ];

  return (
    <div className="sticky top-20 z-30 bg-[#F5EFE4]/95 dark:bg-[#101C13]/95 backdrop-blur-md border-y border-[#E0D2B8] dark:border-[#325736]/30 py-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          role="tablist"
          aria-label="Menu categories"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {allTabs.map(tab => {
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => onSelectCategory(tab.id)}
                className={`relative shrink-0 min-h-[44px] inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? 'text-white'
                    : 'text-[#38483C] dark:text-[#C9DCC9] hover:text-[#325736] dark:hover:text-[#A3C2A5]'
                }`}
              >
                {/* Active animated pill background */}
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 rounded-full bg-[#325736] dark:bg-[#325736] shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
