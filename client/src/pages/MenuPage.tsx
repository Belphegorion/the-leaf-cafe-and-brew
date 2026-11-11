import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CategoryTabs } from '../components/menu/CategoryTabs';
import { MenuSearchFilter } from '../components/menu/MenuSearchFilter';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { ItemCustomizerModal } from '../components/menu/ItemCustomizerModal';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { FALLBACK_MENU_ITEMS } from '../data/fallbackMenu';
import type { MenuItem, CategorySlug, CartCustomizationSelection } from '../../../shared/types';
import { useCartStore } from '../stores/useCartStore';

export const MenuPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategorySlug | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  const addItemToCart = useCartStore(state => state.addItem);
  const openCart = useCartStore(state => state.openDrawer);

  // Fetch items from backend API with fallback to bundled seed data
  const { data: menuItems = FALLBACK_MENU_ITEMS } = useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/menu/items');
        if (!res.ok) throw new Error('API fetch failed');
        const json = await res.json();
        return json.data || FALLBACK_MENU_ITEMS;
      } catch (err) {
        return FALLBACK_MENU_ITEMS;
      }
    },
  });

  // Client-side filtering for ultra-snappy 60fps search & category switching
  const filteredItems = menuItems.filter((item: MenuItem) => {
    // Category match
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    // Tag match
    if (activeTag && !item.tags.includes(activeTag as any)) {
      return false;
    }
    // Search match
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTag = item.tags.some((t: string) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  const handleAddToCartFromModal = (
    item: MenuItem,
    selections: CartCustomizationSelection[],
    quantity: number,
    instructions: string
  ) => {
    addItemToCart(item, selections, quantity, instructions);
    openCart();
  };

  return (
    <main id="main-content" className="pt-24 pb-24 min-h-[100dvh]">
      {/* Header Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-8 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#38483C] dark:text-[#A3C2A5]">
          100% Pure Vegetarian · Arera Colony, Bhopal
        </span>
        <h1 className="text-4xl sm:text-6xl font-display uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#EDE3D1] mt-1">
          THE ARTISANAL MENU
        </h1>
        <p className="mt-2 text-sm text-[#38483C] dark:text-[#C9DCC9] max-w-2xl mx-auto font-light leading-relaxed">
          From single-origin pour-overs and 18-hour cold brews to hand-tossed peri peri paneer pizzas and decadent Belgian brownie shakes.
        </p>

        {/* Pricing Notice Disclaimer */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[#B8A582]/40 bg-[#EDE3D1]/60 px-4 py-2 text-xs text-[#1F2A22] dark:text-[#EDE3D1]">
          <MonolineIcon name="star" size={14} color="#325736" />
          <span>
            <strong>Provisional Pricing Notice:</strong> All menu prices are currently estimated placeholders (avg. ₹1000 for two); admin confirmation pending before commercial launch.
          </span>
        </div>
      </div>

      {/* Sticky Category Tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search, Tag Chips, and Grid/List Toggle */}
        <MenuSearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTag={activeTag}
          onTagChange={setActiveTag}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={filteredItems.length}
        />

        {/* Items Listing */}
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE3D1] text-[#325736] mb-3">
              <MonolineIcon name="search" size={28} />
            </div>
            <h2 className="font-display uppercase text-lg font-bold text-[#1F2A22] dark:text-[#EDE3D1]">
              No Creations Match Your Filter
            </h2>
            <p className="mt-1 text-xs text-[#38483C] dark:text-[#C9DCC9]">
              Try adjusting your search query or dietary filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveTag(null);
                setActiveCategory('all');
              }}
              className="mt-4 rounded-full bg-[#325736] px-5 py-2 text-xs font-semibold text-white uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {filteredItems.map((item: MenuItem) => (
              <MenuItemCard
                key={item.id}
                item={item}
                viewMode={viewMode}
                onCustomize={setCustomizingItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Item Customizer Modal */}
      <ItemCustomizerModal
        item={customizingItem}
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={handleAddToCartFromModal}
      />
    </main>
  );
};
