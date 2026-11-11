import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MenuItem, CartCustomizationSelection } from '../../../../shared/types';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selections: CartCustomizationSelection[], quantity: number, instructions: string) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  // Handle Escape key and Lenis scrolling pause
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.stop === 'function') lenis.stop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (lenis && typeof lenis.start === 'function') lenis.start();
    };
  }, [isOpen, onClose]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Default selections
    const initial: Record<string, string> = {};
    if (item.customizations) {
      item.customizations.forEach(g => {
        const defaultOpt = g.options.find(o => o.isDefault) || g.options[0];
        if (defaultOpt) {
          initial[g.id] = defaultOpt.id;
        }
      });
    }
    return initial;
  });

  const handleOptionSelect = (groupId: string, optionId: string) => {
    setSelectedOptions(prev => ({ ...prev, [groupId]: optionId }));
  };

  // Calculate dynamic total price
  let optionsDelta = 0;
  const selectionsList: CartCustomizationSelection[] = [];

  if (item.customizations) {
    item.customizations.forEach(group => {
      const selectedId = selectedOptions[group.id];
      const opt = group.options.find(o => o.id === selectedId);
      if (opt) {
        optionsDelta += opt.priceDelta;
        selectionsList.push({
          groupId: group.id,
          groupName: group.name,
          selectedOptionId: opt.id,
          selectedOptionName: opt.name,
          priceDelta: opt.priceDelta,
        });
      }
    });
  }

  const unitPrice = item.price + optionsDelta;
  const grandTotal = unitPrice * quantity;

  const handleSubmit = () => {
    onAddToCart(item, selectionsList, quantity, instructions);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customizer-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card / Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#F5EFE4] dark:bg-[#1A261D] text-[#1F2A22] dark:text-[#F7FBFA] shadow-2xl border border-[#E0D2B8] dark:border-[#325736]/30 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header Image */}
            <div className="relative h-48 w-full bg-[#142318] shrink-0 dark">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                aria-label="Close customization modal"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-4 rounded-full bg-[#325736] px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                100% Pure Vegetarian
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h2 id="customizer-modal-title" className="text-2xl font-display uppercase tracking-wider font-bold">
                  {item.name}
                </h2>
                <p className="mt-1 text-xs text-[#1F2A22]/70 dark:text-[#F7FBFA]/70 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-2 text-sm font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
                  Base Price: ₹{item.price} <span className="text-[10px] text-[#5E8662] uppercase font-normal">(Est. TBC)</span>
                </div>
              </div>

              {/* Customization Groups */}
              {item.customizations && item.customizations.length > 0 && (
                <div className="space-y-5 border-t border-[#325736]/10 pt-4">
                  {item.customizations.map(group => (
                    <div key={group.id} className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#5E8662] dark:text-[#A3C2A5]">
                        <span>{group.name}</span>
                        {group.required && <span className="text-[10px] text-red-500 font-bold">*Required</span>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {group.options.map(option => {
                          const isSelected = selectedOptions[group.id] === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleOptionSelect(group.id, option.id)}
                              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs min-h-[44px] transition-all ${
                                isSelected
                                  ? 'border-[#325736] bg-[#EAE0D0] dark:bg-[#142318] dark:border-[#5E8662] font-semibold text-[#325736] dark:text-[#A3C2A5] shadow-sm'
                                  : 'border-[#325736]/20 bg-white/70 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10'
                              }`}
                            >
                              <span>{option.name}</span>
                              {option.priceDelta > 0 && (
                                <span className="text-[11px] font-bold opacity-80">+₹{option.priceDelta}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Special Instructions */}
              <div className="border-t border-[#325736]/10 pt-4">
                <label htmlFor="instructions" className="block text-xs font-semibold uppercase tracking-wider text-[#5E8662] dark:text-[#A3C2A5] mb-2">
                  Special Kitchen Notes (e.g. Jain preparation, less spicy)
                </label>
                <input
                  id="instructions"
                  type="text"
                  placeholder="e.g. No onions/garlic, extra hot, oat milk"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full rounded-xl border border-[#325736]/20 bg-white/60 dark:bg-black/20 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#325736]"
                />
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="border-t border-[#E0D2B8] dark:border-[#325736]/30 p-4 sm:p-6 bg-[#F5EFE4] dark:bg-[#1A261D] flex items-center justify-between gap-4 shrink-0">
              {/* Stepper */}
              <div className="flex items-center rounded-full border border-[#325736]/30 bg-white/70 dark:bg-[#142318] px-1 text-sm gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="font-bold text-base min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-[#325736]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="font-bold tabular-nums px-2">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="font-bold text-base min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-[#325736]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add CTA */}
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-full bg-[#325736] py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg hover:bg-[#284A2D] transition-colors dark:bg-[#5E8662] dark:hover:bg-[#325736]"
              >
                <span>Add to Order</span>
                <span>·</span>
                <span className="tabular-nums">₹{grandTotal}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
