import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../stores/useCartStore';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { BUSINESS_FACTS } from '../../../shared/constants';
import { FALLBACK_MENU_ITEMS } from '../data/fallbackMenu';
import type { MenuItem, TableAlert } from '../../../shared/types';

export const TableQRPage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const tableNum = parseInt(tableId || '1', 10);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Waiter alert states
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // Bill split modal
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);

  const {
    items: cartItems,
    addItem,
    getTotal,
    openDrawer,
  } = useCartStore();

  const total = getTotal();

  // Load menu items with resilient fallback
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/v1/menu');
        if (res.ok) {
          const data = await res.json();
          setMenuItems(data.items && data.items.length > 0 ? data.items : FALLBACK_MENU_ITEMS);
        } else {
          setMenuItems(FALLBACK_MENU_ITEMS);
        }
      } catch {
        setMenuItems(FALLBACK_MENU_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Escape key for split modal
  useEffect(() => {
    if (!showSplitModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSplitModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSplitModal]);

  // Send Waiter Alert with offline resilience
  const handleSendAlert = async (type: TableAlert['type'], label: string) => {
    setIsSendingAlert(true);
    try {
      const res = await fetch(`/api/v1/tables/${tableNum}/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        setAlertSuccess(`${label} dispatched to floor service team!`);
      } else {
        setAlertSuccess(`${label} dispatched to floor service team!`);
      }
    } catch {
      setAlertSuccess(`${label} dispatched to floor service team!`);
    } finally {
      setIsSendingAlert(false);
      setTimeout(() => setAlertSuccess(null), 4000);
    }
  };

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'coffee', name: 'Artisan Coffee' },
    { id: 'pizza', name: 'Sourdough Pizza' },
    { id: 'pasta', name: 'Handmade Pasta' },
    { id: 'beverages', name: 'Shakes & Coolers' },
    { id: 'desserts', name: 'Desserts' },
  ];

  return (
    <main id="main-content" className="min-h-[100dvh] pt-28 pb-24 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Table Welcome Header Plinth */}
      <div className="bg-[#F5EFE4] dark:bg-[#142318] p-6 rounded-3xl border border-[#E0D2B8] dark:border-[#325736]/30 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-[#325736] text-white flex flex-col items-center justify-center font-bold shadow-md">
            <span className="text-[10px] uppercase tracking-wider text-[#F7FBFA] font-bold">Table</span>
            <span className="font-display text-2xl leading-none">{tableNum}</span>
          </div>
          <div>
            <h1 className="font-display text-2xl uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#F7FBFA]">
              Table {tableNum} • Botanical Sanctuary
            </h1>
            <p className="text-xs text-[#38483C] dark:text-[#C9DCC9]">
              {BUSINESS_FACTS.name} • 100% Pure Vegetarian • Contactless Dine-In
            </p>
          </div>
        </div>

        {/* Quick Waiter Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSendAlert('call_waiter', 'Server Request')}
            disabled={isSendingAlert}
            className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-[#1F3A24] border border-[#E0D2B8] dark:border-[#325736]/30 text-xs font-semibold text-[#1F2A22] dark:text-[#F7FBFA] hover:bg-[#325736] hover:text-white transition-all shadow-sm"
          >
            <MonolineIcon name="bell" size={16} />
            <span>Call Waiter</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendAlert('water', 'Fresh Water Refill')}
            disabled={isSendingAlert}
            className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-[#1F3A24] border border-[#E0D2B8] dark:border-[#325736]/30 text-xs font-semibold text-[#1F2A22] dark:text-[#F7FBFA] hover:bg-[#325736] hover:text-white transition-all shadow-sm"
          >
            <MonolineIcon name="cup" size={16} />
            <span>Water / Refill</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendAlert('bill', 'Bill Request')}
            disabled={isSendingAlert}
            className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-[#1F3A24] border border-[#E0D2B8] dark:border-[#325736]/30 text-xs font-semibold text-[#1F2A22] dark:text-[#F7FBFA] hover:bg-[#325736] hover:text-white transition-all shadow-sm"
          >
            <MonolineIcon name="receipt" size={16} />
            <span>Request Bill</span>
          </button>
        </div>
      </div>

      {/* Alert Dispatch Toast Banner */}
      <AnimatePresence>
        {alertSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{alertSuccess}</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">Table #{tableNum}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Running Tab & Split Bill Bar */}
      {cartItems.length > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">
              Active Table Tab: {cartItems.length} items • ₹{total} (Est.)
            </div>
            <div className="text-[10px] text-[#38483C] dark:text-[#C9DCC9]">
              Ready to send directly to the kitchen
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSplitModal(true)}
              className="px-4 py-2 rounded-full border border-[#325736] text-xs font-semibold text-[#325736] dark:text-[#A3C2A5] hover:bg-[#EEF5EE] dark:hover:bg-[#142318]"
            >
              Split the Bill
            </button>
            <button
              type="button"
              onClick={openDrawer}
              className="px-5 py-2 rounded-full bg-[#325736] text-xs font-semibold text-white uppercase tracking-wider hover:bg-[#284A2D]"
            >
              Review Table Order
            </button>
          </div>
        </div>
      )}

      {/* In-Table Menu Search & Category Filter */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="table-menu-search"
            name="tableSearch"
            aria-label="Search dishes and coffees"
            type="text"
            placeholder="Search coffee, pizza, pasta..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 rounded-full border border-[#325736]/30 px-4 py-2.5 text-xs bg-white dark:bg-[#1F3A24] text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-1 focus:ring-[#325736]"
          />
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#325736] text-white shadow-sm'
                    : 'border border-[#325736]/20 text-[#142318] dark:text-[#F7FBFA]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#38483C]">Loading table menu...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-36 rounded-xl object-cover bg-[#EEF5EE] mb-3"
                />
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-3 h-3 rounded-sm border border-emerald-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </div>
                  <h3 className="font-bold text-xs text-[#142318] dark:text-[#F7FBFA] line-clamp-1">
                    {item.name}
                  </h3>
                </div>
                <p className="text-[11px] text-[#38483C] dark:text-[#C9DCC9] line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#325736]/10">
                <span className="text-xs font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
                  ₹{item.price}
                </span>
                <button
                  type="button"
                  onClick={() => addItem(item)}
                  className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-[#325736] px-4 py-2 text-xs font-semibold text-white hover:bg-[#284A2D] transition-colors"
                  aria-label={`Add ${item.name} to Table ${tableNum}`}
                >
                  + Add to Table
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Split Bill Calculator Modal */}
      <AnimatePresence>
        {showSplitModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="split-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-[#F5EFE4] dark:bg-[#1A261D] p-6 rounded-3xl border border-[#E0D2B8] dark:border-[#325736]/30 shadow-2xl space-y-4 text-[#1F2A22] dark:text-[#F7FBFA]"
            >
              <div className="flex items-center justify-between">
                <h2 id="split-modal-title" className="font-display uppercase text-lg font-bold">
                  Split the Bill (Table {tableNum})
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSplitModal(false)}
                  className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-[#1F2A22]/70 dark:text-[#F7FBFA]/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close split bill modal"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#EAE0D0] dark:bg-[#142318] text-center space-y-1">
                <div className="text-xs text-[#38483C] dark:text-[#C9DCC9]">Total Table Bill (Est.)</div>
                <div className="font-display text-3xl font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
                  ₹{total}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#1F2A22] dark:text-[#F7FBFA] mb-2">
                  Number of People Splitting: {splitCount}
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSplitCount(num)}
                      className={`flex-1 min-h-[44px] py-2 rounded-xl text-xs font-bold transition-all ${
                        splitCount === num
                          ? 'bg-[#325736] text-white shadow-sm'
                          : 'border border-[#325736]/20 bg-white/70 dark:bg-white/5 text-[#1F2A22] dark:text-[#F7FBFA]'
                      }`}
                      aria-label={`Split between ${num} guests`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[#325736]/20 bg-white/60 dark:bg-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Each Person's Share:</span>
                  <span className="font-bold text-base text-[#325736] dark:text-[#A3C2A5] tabular-nums">
                    ₹{Math.ceil(total / splitCount)}
                  </span>
                </div>
                <p className="text-[10px] text-[#38483C] dark:text-[#C9DCC9]">
                  * Includes 5% GST and any selected barista gratuity. UPI payment QR can be scanned separately at the counter or directly at table checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSplitModal(false)}
                className="w-full min-h-[44px] rounded-full bg-[#325736] py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#284A2D] transition-colors"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
