import React from 'react';
import { MonolineIcon } from '../brand/MonolineIcon';

interface MenuSearchFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalCount: number;
}

const TAG_FILTERS = [
  { id: null, label: 'All Items' },
  { id: 'bestseller', label: 'Bestseller' },
  { id: 'jain', label: 'Jain Special' },
  { id: 'vegan', label: 'Vegan Friendly' },
  { id: 'spicy', label: 'Spicy' },
  { id: 'chef-special', label: 'Chef Crafted' },
];

export const MenuSearchFilter: React.FC<MenuSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  activeTag,
  onTagChange,
  viewMode,
  onViewModeChange,
  totalCount,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Top Search Input & Layout Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#38483C] dark:text-[#A3C2A5]">
            <MonolineIcon name="search" size={16} />
          </div>
          <input
            id="menu-search-input"
            name="menuSearch"
            aria-label="Search menu items"
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search coffee, pizza, pasta, shakes, salads..."
            className="w-full rounded-full border border-[#325736]/20 bg-white dark:bg-[#1F3A24] py-3 pl-11 pr-10 text-xs sm:text-sm text-[#142318] dark:text-[#F7FBFA] placeholder-[#142318]/50 dark:placeholder-[#F7FBFA]/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#325736]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-[#142318]/50 hover:text-black dark:text-white/50"
            >
              ✕
            </button>
          )}
        </div>

        {/* Grid / List View Toggle */}
        <div className="flex items-center rounded-full border border-[#325736]/20 bg-white dark:bg-[#1F3A24] p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#325736] text-white'
                : 'text-[#38483C] dark:text-[#C9DCC9] hover:text-[#325736]'
            }`}
            aria-label="Grid layout view"
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              viewMode === 'list'
                ? 'bg-[#325736] text-white'
                : 'text-[#38483C] dark:text-[#C9DCC9] hover:text-[#325736]'
            }`}
            aria-label="List layout view"
          >
            List
          </button>
        </div>
      </div>

      {/* Dietary Filter Tags */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {TAG_FILTERS.map(filter => {
            const isSelected = activeTag === filter.id;
            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => onTagChange(filter.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#325736] text-white shadow-sm'
                    : 'border border-[#325736]/15 bg-white dark:bg-[#1F3A24] text-[#142318]/80 dark:text-[#F7FBFA]/80 hover:bg-[#EEF5EE]'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-[#325736] dark:text-[#A3C2A5] font-semibold whitespace-nowrap">
          Showing {totalCount} items
        </span>
      </div>
    </div>
  );
};
