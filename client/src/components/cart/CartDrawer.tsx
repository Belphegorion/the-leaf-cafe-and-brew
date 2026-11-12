import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { MonolineIcon } from '../brand/MonolineIcon';
import { useIsMobile, responsiveDrawerVariants } from '../../motion';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    tipAmount,
    setTip,
    couponCode,
    discountAmount,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getGst,
    getTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<string | null>(null);
  const isMobile = useIsMobile(640);

  const subtotal = getSubtotal();
  const gst = getGst();
  const total = getTotal();

  // Control Lenis scrolling & listen to Escape key when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      if ((window as any).__lenis) (window as any).__lenis.stop();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeDrawer();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if ((window as any).__lenis) (window as any).__lenis.start();
      };
    } else {
      if ((window as any).__lenis) (window as any).__lenis.start();
    }
  }, [isDrawerOpen, closeDrawer]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponStatus(res.message);
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Cart Drawer"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto flex max-w-full sm:pl-10 justify-end">
            <motion.div
              custom={isMobile}
              variants={responsiveDrawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full sm:w-screen sm:max-w-md max-h-[88dvh] sm:max-h-full rounded-t-3xl sm:rounded-none bg-[#F5EFE4] text-[#1F2A22] dark:bg-[#101C13] dark:text-[#EDE3D1] shadow-2xl flex flex-col"
            >
              {/* Mobile grab handle pill */}
              {isMobile && (
                <div className="pt-3 pb-1 flex justify-center shrink-0">
                  <div className="w-12 h-1.5 rounded-full bg-[#325736]/20 dark:bg-[#A3C2A5]/30" />
                </div>
              )}

              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#E0D2B8] dark:border-[#284A2D] px-6 py-4">
                <div className="flex items-center gap-2">
                  <MonolineIcon name="bag" size={20} color="#325736" strokeWidth={2.2} />
                  <h2 className="font-display uppercase text-lg font-bold text-[#1F2A22] dark:text-[#EDE3D1]">
                    Your Artisanal Order
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="min-h-[44px] min-w-[44px] h-11 w-11 flex items-center justify-center rounded-full text-[#1F2A22]/70 hover:bg-[#325736]/10 dark:text-[#EDE3D1]/70 transition-colors"
                  aria-label="Close cart drawer"
                >
                  ✕
                </button>
              </div>

              {/* Items List / Empty State */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDE3D1] dark:bg-[#1F3A24] text-[#325736] dark:text-[#A3C2A5] mb-4">
                      <MonolineIcon name="cup" size={36} strokeWidth={1.8} />
                    </div>
                    <h3 className="font-display uppercase text-base font-bold text-[#1F2A22] dark:text-[#EDE3D1]">
                      Your Cup is Empty
                    </h3>
                    <p className="mt-1 text-xs text-[#38483C] dark:text-[#C9DCC9] max-w-xs">
                      Explore our handcrafted coffees, artisan pizzas, and cold brews to begin.
                    </p>
                    <Link
                      to="/menu"
                      onClick={closeDrawer}
                      className="mt-6 min-h-[44px] inline-flex items-center rounded-full bg-[#325736] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#284A2D]"
                    >
                      Browse Menu
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {items.map(item => (
                      <div
                        key={item.cartItemId}
                        className="flex gap-4 p-3 rounded-2xl border border-[#E0D2B8] bg-white dark:bg-[#1F3A24] shadow-sm"
                      >
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="h-20 w-20 shrink-0 rounded-xl object-cover bg-[#F5EFE4]"
                        />

                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-sm font-bold text-[#1F2A22] dark:text-[#EDE3D1] line-clamp-1">
                                {item.menuItem.name}
                              </h3>
                              {item.selectedCustomizations.length > 0 && (
                                <p className="text-[11px] text-[#38483C] dark:text-[#C9DCC9]">
                                  {item.selectedCustomizations.map(c => c.selectedOptionName).join(', ')}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.cartItemId)}
                              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs text-red-500 hover:text-red-700"
                              aria-label={`Remove ${item.menuItem.name} from cart`}
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
                              ₹{item.itemTotalPrice}
                            </span>

                            {/* Stepper with 44px tap targets */}
                            <div className="flex items-center rounded-full border border-[#E0D2B8] dark:border-[#284A2D] bg-[#F5EFE4] dark:bg-[#101C13] px-1 py-0.5 text-xs gap-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="min-h-[44px] min-w-[44px] flex items-center justify-center font-bold text-sm text-[#1F2A22] dark:text-[#EDE3D1] hover:text-[#325736]"
                                aria-label={`Decrease quantity of ${item.menuItem.name}`}
                              >
                                -
                              </button>
                              <span className="font-semibold tabular-nums px-1 text-xs">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="min-h-[44px] min-w-[44px] flex items-center justify-center font-bold text-sm text-[#1F2A22] dark:text-[#EDE3D1] hover:text-[#325736]"
                                aria-label={`Increase quantity of ${item.menuItem.name}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer & Checkout Calculations */}
              {items.length > 0 && (
                <div className="border-t border-[#E0D2B8] dark:border-[#284A2D] p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] bg-white dark:bg-[#142318] space-y-4">
                  {/* Coupon Code Section */}
                  <div>
                    {couponCode ? (
                      <div className="flex items-center justify-between rounded-xl bg-[#EDE3D1] dark:bg-[#1F3A24] px-3 py-2 text-xs text-[#325736] dark:text-[#A3C2A5]">
                        <span>Applied: <strong>{couponCode}</strong> (-₹{discountAmount})</span>
                        <button type="button" onClick={removeCoupon} className="font-bold underline text-red-500 min-h-[44px] flex items-center">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          id="cart-coupon-input"
                          name="couponCode"
                          aria-label="Coupon code"
                          type="text"
                          placeholder="Coupon (e.g. LEAF10)"
                          value={couponInput}
                          onChange={e => setCouponInput(e.target.value)}
                          className="flex-1 rounded-full border border-[#E0D2B8] px-3 py-2 text-xs uppercase bg-transparent text-[#1F2A22] dark:text-[#EDE3D1] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                        />
                        <button
                          type="submit"
                          className="min-h-[44px] rounded-full bg-[#325736] px-4 py-2 text-xs font-semibold text-white uppercase hover:bg-[#284A2D] transition-colors"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                    {couponStatus && !couponCode && (
                      <p className="mt-1 text-[11px] text-red-500">{couponStatus}</p>
                    )}
                  </div>

                  {/* Tip Selection */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#38483C] dark:text-[#C9DCC9]">
                      Tip Our Baristas &amp; Kitchen
                    </span>
                    <div className="flex gap-2 mt-1.5">
                      {[0, 20, 50, 100].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setTip(amt)}
                          className={`min-h-[44px] rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                            tipAmount === amt
                              ? 'bg-[#325736] text-white'
                              : 'border border-[#E0D2B8] text-[#1F2A22] dark:text-[#EDE3D1]'
                          }`}
                        >
                          {amt === 0 ? 'No tip' : `₹${amt}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  <div className="space-y-1.5 text-xs border-t border-[#E0D2B8] dark:border-[#284A2D] pt-3">
                    <div className="flex justify-between text-[#38483C] dark:text-[#C9DCC9]">
                      <span>Item Subtotal</span>
                      <span className="tabular-nums">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#38483C] dark:text-[#C9DCC9]">
                      <span>5% Restaurant GST</span>
                      <span className="tabular-nums">₹{gst}</span>
                    </div>
                    {tipAmount > 0 && (
                      <div className="flex justify-between text-[#325736] dark:text-[#A3C2A5]">
                        <span>Barista Gratuity</span>
                        <span className="tabular-nums">+₹{tipAmount}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[#325736] dark:text-[#A3C2A5]">
                        <span>Promo Discount</span>
                        <span className="tabular-nums">-₹{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-[#1F2A22] dark:text-[#EDE3D1] pt-2 border-t border-[#E0D2B8] dark:border-[#284A2D]">
                      <span>Grand Total (Est.)</span>
                      <span className="text-[#325736] dark:text-[#A3C2A5] tabular-nums">₹{total}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Link
                    to="/checkout"
                    onClick={closeDrawer}
                    className="min-h-[44px] w-full flex items-center justify-center rounded-full bg-[#325736] py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-lg hover:bg-[#284A2D] transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
