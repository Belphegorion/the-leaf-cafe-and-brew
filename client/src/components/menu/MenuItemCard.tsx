import React from 'react';
import { motion } from 'motion/react';
import type { MenuItem } from '../../../../shared/types';
import { useCartStore } from '../../stores/useCartStore';

interface MenuItemCardProps {
  item: MenuItem;
  viewMode?: 'grid' | 'list';
  onCustomize: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  viewMode = 'grid',
  onCustomize,
}) => {
  const { items, addItem, updateQuantity, openDrawer } = useCartStore();

  // Check if item is already in cart
  const cartEntries = items.filter(i => i.menuItem.id === item.id);
  const totalCartQty = cartEntries.reduce((sum, i) => sum + i.quantity, 0);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If item has customizable options, open customizer modal
    if (item.customizations && item.customizations.length > 0) {
      onCustomize(item);
      return;
    }

    // Direct add with haptics
    addItem(item);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }

    setTimeout(() => {
      openDrawer();
    }, 450);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartEntries.length > 0) {
      updateQuantity(cartEntries[0].cartItemId, cartEntries[0].quantity + 1);
    } else {
      addItem(item);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartEntries.length > 0) {
      updateQuantity(cartEntries[0].cartItemId, cartEntries[0].quantity - 1);
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onCustomize(item)}
        className="group relative cursor-pointer double-bezel-shell w-full transition-all hover:scale-[1.01]"
        data-cursor="Customize"
      >
        <div className="double-bezel-core p-4 flex items-center justify-between gap-4 bg-white dark:bg-[#1F3A24]">
          <div className="flex items-center gap-4 flex-1">
            <img
              src={item.image}
              alt={item.name}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover bg-[#EEF5EE]"
              loading="lazy"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {/* Pure Veg Green Circle Icon */}
                <div className="flex h-3.5 w-3.5 items-center justify-center rounded border border-[#325736] p-0.5" title="100% Pure Vegetarian">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#325736]" />
                </div>
                <h3 className="font-display uppercase text-sm sm:text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
                  {item.name}
                </h3>
              </div>
              <p className="mt-1 text-xs text-[#142318]/70 dark:text-[#F7FBFA]/70 line-clamp-1">
                {item.description}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
                  ₹{item.price}
                </span>
                <span className="text-[10px] text-[#38483C] dark:text-[#C9DCC9] uppercase font-medium">(Est. TBC)</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {totalCartQty > 0 ? (
              <div className="flex items-center rounded-full border border-[#325736] bg-[#F5EFE4] dark:bg-[#142318] px-1 text-xs gap-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="font-bold text-sm min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-[#325736] text-[#1F2A22] dark:text-[#F7FBFA]"
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  -
                </button>
                <span className="font-bold tabular-nums text-[#325736] dark:text-[#A3C2A5] px-1">{totalCartQty}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="font-bold text-sm min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-[#325736] text-[#1F2A22] dark:text-[#F7FBFA]"
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-[#325736] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[#284A2D] dark:bg-[#325736]"
                aria-label={item.customizations && item.customizations.length > 0 ? `Customise ${item.name}` : `Add ${item.name} to cart`}
                data-cursor="Add"
              >
                + Add
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: Grid View Card
  return (
    <div
      onClick={() => onCustomize(item)}
      className="group relative cursor-pointer double-bezel-shell w-full h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      data-cursor="Customize"
    >
      <div className="double-bezel-core p-4 flex flex-col justify-between h-full bg-white dark:bg-[#1F3A24]">
        {/* Top Image & Badges */}
        <div>
          <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-[#EEF5EE] dark:bg-[#142318]">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Dietary Tags */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {item.tags.includes('bestseller') && (
                <span className="rounded-full bg-[#325736] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F7FBFA] shadow-md">
                  Bestseller
                </span>
              )}
              {item.tags.includes('jain') && (
                <span className="rounded-full bg-[#284A2D] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F7FBFA] shadow-md">
                  Jain Available
                </span>
              )}
            </div>

            {/* Pure Veg Badge */}
            <div className="absolute bottom-3 right-3 rounded-full bg-white/90 dark:bg-black/80 px-2 py-0.5 flex items-center gap-1 shadow-sm">
              <div className="flex h-3 w-3 items-center justify-center rounded border border-[#325736] p-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#325736]" />
              </div>
              <span className="text-[9px] font-bold uppercase text-[#325736] dark:text-[#A3C2A5]">Pure Veg</span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <h3 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA] line-clamp-1 group-hover:text-[#325736] dark:group-hover:text-[#A3C2A5] transition-colors">
              {item.name}
            </h3>
            <p className="mt-1 text-xs text-[#142318]/70 dark:text-[#F7FBFA]/70 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>

        {/* Bottom Price & Button Stepper */}
        <div className="mt-5 flex items-center justify-between border-t border-[#325736]/10 dark:border-[#F7FBFA]/10 pt-3">
          <div>
            <span className="text-base font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
              ₹{item.price}
            </span>
            <span className="ml-1 text-[10px] text-[#38483C] dark:text-[#C9DCC9] uppercase tracking-wider font-medium">
              (Est. TBC)
            </span>
          </div>

          <div className="relative">
            {totalCartQty > 0 ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center rounded-full border border-[#325736] bg-[#F5EFE4] dark:bg-[#142318] px-1 text-xs gap-1 shadow-sm"
              >
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="font-bold text-sm min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-[#325736] text-[#1F2A22] dark:text-[#F7FBFA]"
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  -
                </button>
                <span className="font-bold tabular-nums text-[#325736] dark:text-[#A3C2A5] px-1">
                  {totalCartQty}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="font-bold text-sm min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-[#325736] text-[#1F2A22] dark:text-[#F7FBFA]"
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  +
                </button>
              </motion.div>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-full bg-[#325736] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F7FBFA] shadow-md hover:bg-[#284A2D] active:scale-95 transition-all dark:bg-[#325736] dark:hover:bg-[#284A2D]"
                aria-label={item.customizations && item.customizations.length > 0 ? `Customise ${item.name}` : `Add ${item.name} to cart`}
                data-cursor="Add"
              >
                <span aria-hidden="true" className="text-base leading-none">+</span>
                <span>{item.customizations && item.customizations.length > 0 ? 'Customise' : 'Add'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
