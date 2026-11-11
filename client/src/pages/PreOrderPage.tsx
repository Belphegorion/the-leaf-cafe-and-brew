import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { MonolineIcon } from '../components/brand/MonolineIcon';

export const PreOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    getSubtotal,
    getTotal,
    updateQuantity,
    removeItem,
  } = useCartStore();

  const [orderMode, setOrderMode] = useState<'takeaway' | 'dine_in'>('takeaway');
  const [selectedBufferMinutes, setSelectedBufferMinutes] = useState(25);

  const subtotal = getSubtotal();
  const total = getTotal();

  // Calculate projected ready time
  const now = new Date();
  const readyTime = new Date(now.getTime() + selectedBufferMinutes * 60 * 1000);
  const formattedReadyTime = readyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <main id="main-content" className="min-h-[100dvh] pt-28 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#325736] dark:text-[#A3C2A5]">
          Skip the Wait • Freshly Brewed On Arrival
        </span>
        <h1 className="font-display text-3xl md:text-5xl uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#F7FBFA] mt-1">
          Pre-Order Ahead
        </h1>
        <p className="text-xs md:text-sm text-[#38483C] dark:text-[#C9DCC9] mt-2">
          Your specialty coffee and oven-fresh pizzas timed to perfection for when you step into our sanctuary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Timing & Mode Selection (7 cols) */}
        <div className="lg:col-span-7 bg-[#F5EFE4] dark:bg-[#1A261D] p-6 md:p-8 rounded-3xl border border-[#E0D2B8] dark:border-[#325736]/30 shadow-lg space-y-8 text-[#1F2A22] dark:text-[#F7FBFA]">
          {/* Mode Switcher */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-[#1F2A22] dark:text-[#F7FBFA] mb-3">
              1. How will you enjoy this order?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOrderMode('takeaway')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all min-h-[44px] ${
                  orderMode === 'takeaway'
                    ? 'border-[#325736] bg-[#EAE0D0] dark:bg-[#142318] ring-1 ring-[#325736]'
                    : 'border-[#325736]/20 bg-white/70 dark:bg-white/5 hover:border-[#325736]/40'
                }`}
              >
                <div className={`p-2 rounded-xl ${orderMode === 'takeaway' ? 'bg-[#325736] text-white' : 'bg-[#EAE0D0] dark:bg-[#142318]'}`}>
                  <MonolineIcon name="bag" size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1F2A22] dark:text-[#F7FBFA]">
                    Curbside / Grab &amp; Go
                  </div>
                  <div className={`text-[11px] mt-0.5 ${orderMode === 'takeaway' ? 'text-[#1F2A22] dark:text-[#EDE3D1]' : 'text-[#38483C] dark:text-[#C9DCC9]'}`}>
                    Packed securely for immediate pickup
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderMode('dine_in')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all min-h-[44px] ${
                  orderMode === 'dine_in'
                    ? 'border-[#325736] bg-[#EAE0D0] dark:bg-[#142318] ring-1 ring-[#325736]'
                    : 'border-[#325736]/20 bg-white/70 dark:bg-white/5 hover:border-[#325736]/40'
                }`}
              >
                <div className={`p-2 rounded-xl ${orderMode === 'dine_in' ? 'bg-[#325736] text-white' : 'bg-[#EAE0D0] dark:bg-[#142318]'}`}>
                  <MonolineIcon name="table" size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1F2A22] dark:text-[#F7FBFA]">
                    Dine-in on Arrival
                  </div>
                  <div className={`text-[11px] mt-0.5 ${orderMode === 'dine_in' ? 'text-[#1F2A22] dark:text-[#EDE3D1]' : 'text-[#38483C] dark:text-[#C9DCC9]'}`}>
                    Served hot at your reserved table
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Preparation Buffer Picker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase font-bold tracking-wider text-[#1F2A22] dark:text-[#F7FBFA]">
                2. When do you plan to arrive?
              </label>
              <span className="text-xs font-bold text-[#325736] dark:text-[#A3C2A5]">
                Target: {formattedReadyTime} ({selectedBufferMinutes} mins)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[20, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSelectedBufferMinutes(mins)}
                  className={`min-h-[44px] py-3 px-4 rounded-2xl border text-center transition-all ${
                    selectedBufferMinutes === mins
                      ? 'bg-[#325736] text-white font-bold border-[#325736] shadow-sm'
                      : 'border-[#325736]/20 bg-white/70 dark:bg-white/5 hover:border-[#325736]/50 text-[#1F2A22] dark:text-[#F7FBFA]'
                  }`}
                >
                  <div className="text-sm font-bold">{mins} mins</div>
                  <div className="text-[10px] opacity-80">
                    {mins === 20 ? 'Fastest' : `in ${mins}m`}
                  </div>
                </button>
              ))}
            </div>

            <p className="mt-3 text-[11px] text-[#38483C] dark:text-[#C9DCC9]">
              * Our baristas and chefs start extracting pour-overs and baking sourdough crusts 10 minutes before your arrival so your meal never sits cold.
            </p>
          </div>

          {/* Current Items in Cart or Prompt */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA]">
                3. Your Selected Delicacies ({items.length})
              </label>
              <Link to="/menu" className="text-xs font-semibold text-[#325736] dark:text-[#A3C2A5] underline">
                + Add More Dishes
              </Link>
            </div>

            {items.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#EEF5EE] dark:bg-[#142318] border border-dashed border-[#325736]/30 text-center">
                <MonolineIcon name="cup" size={28} color="#325736" />
                <p className="mt-2 text-xs font-semibold text-[#142318] dark:text-[#F7FBFA]">
                  You have not added any items yet
                </p>
                <Link
                  to="/menu"
                  className="mt-3 inline-block rounded-full bg-[#325736] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                >
                  Explore Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div
                    key={item.cartItemId}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-[#325736]/15 bg-[#F7FBFA] dark:bg-[#142318]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">
                          {item.menuItem.name}
                        </div>
                        <div className="text-[10px] text-[#38483C] dark:text-[#C9DCC9]">
                          ₹{item.itemTotalPrice} • {item.quantity} serving(s)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-[#325736]/30 dark:border-[#A3C2A5]/30 rounded-full p-0.5 text-xs gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.menuItem.name}`}
                          className="w-11 h-11 flex items-center justify-center font-bold text-sm text-[#142318] dark:text-[#F7FBFA] touch-manipulation hover:bg-[#28492C]/10 rounded-full transition-colors"
                        >
                          -
                        </button>
                        <span className="font-semibold px-1 min-w-[20px] text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.menuItem.name}`}
                          className="w-11 h-11 flex items-center justify-center font-bold text-sm text-[#142318] dark:text-[#F7FBFA] touch-manipulation hover:bg-[#28492C]/10 rounded-full transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.cartItemId)}
                        aria-label={`Remove ${item.menuItem.name} from pre-order`}
                        className="w-11 h-11 flex items-center justify-center text-sm text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-full transition-colors touch-manipulation"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Transition (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1F3A24] p-6 md:p-8 rounded-3xl border border-[#325736]/20 shadow-lg space-y-6">
          <h2 className="font-display uppercase text-sm font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] border-b border-[#325736]/15 pb-4">
            Pre-Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#325736]/10">
              <span className="text-[#38483C] dark:text-[#C9DCC9]">Mode</span>
              <span className="font-bold text-[#142318] dark:text-[#F7FBFA] capitalize">
                {orderMode === 'takeaway' ? 'Curbside / Grab & Go' : 'Dine-In on Arrival'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#325736]/10">
              <span className="text-[#38483C] dark:text-[#C9DCC9]">Target Arrival</span>
              <span className="font-bold text-[#142318] dark:text-[#F7FBFA]">{formattedReadyTime}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#325736]/10">
              <span className="text-[#38483C] dark:text-[#C9DCC9]">Total Items</span>
              <span className="font-bold text-[#142318] dark:text-[#F7FBFA]">{items.length} items</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#325736]/10">
              <span className="text-[#38483C] dark:text-[#C9DCC9]">Subtotal</span>
              <span className="font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums">₹{subtotal}</span>
            </div>
            <div className="flex justify-between py-2 text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
              <span>Estimated Total</span>
              <span className="text-[#325736] dark:text-[#A3C2A5] tabular-nums">₹{total}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#325736] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7FBFA] shadow-lg hover:bg-[#284A2D] transition-colors disabled:opacity-50"
          >
            <MonolineIcon name="receipt" size={16} />
            <span>Proceed to Checkout (₹{total})</span>
          </button>

          <div className="p-4 rounded-2xl bg-[#EEF5EE] dark:bg-[#142318] border border-[#325736]/20 text-[11px] text-[#325736] dark:text-[#A3C2A5] space-y-1">
            <p className="font-bold">Live Order Tracking Included</p>
            <p>Once confirmed, track preparation stages in real time with our live coffee cup progress meter.</p>
          </div>
        </div>
      </div>
    </main>
  );
};
