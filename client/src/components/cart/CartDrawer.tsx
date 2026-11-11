import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { MonolineIcon } from '../brand/MonolineIcon';

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

  const subtotal = getSubtotal();
  const gst = getGst();
  const total = getTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponStatus(res.message);
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="w-screen max-w-md bg-[#F7FBFA] dark:bg-[#101C13] shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#325736]/15 dark:border-[#F7FBFA]/15 px-6 py-5">
                <div className="flex items-center gap-2">
                  <MonolineIcon name="bag" size={20} color="#325736" strokeWidth={2.2} />
                  <h2 className="font-display uppercase text-lg font-bold text-[#142318] dark:text-[#F7FBFA]">
                    Your Artisanal Order
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#142318]/70 hover:bg-[#325736]/10 dark:text-[#F7FBFA]/70"
                  aria-label="Close cart drawer"
                >
                  ✕
                </button>
              </div>

              {/* Items List / Empty State */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#325736]/10 text-[#325736] dark:bg-white/10 dark:text-[#A3C2A5] mb-4">
                      <MonolineIcon name="cup" size={36} strokeWidth={1.8} />
                    </div>
                    <h3 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
                      Your Cup is Empty
                    </h3>
                    <p className="mt-1 text-xs text-[#5E8662] dark:text-[#A3C2A5] max-w-xs">
                      Explore our handcrafted coffees, artisan pizzas, and cold brews to begin.
                    </p>
                    <Link
                      to="/menu"
                      onClick={closeDrawer}
                      className="mt-6 inline-flex rounded-full bg-[#325736] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#284A2D]"
                    >
                      Browse Menu
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {items.map(item => (
                      <div
                        key={item.cartItemId}
                        className="flex gap-4 p-3 rounded-2xl border border-[#325736]/15 bg-white dark:bg-[#1F3A24] shadow-sm"
                      >
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="h-20 w-20 shrink-0 rounded-xl object-cover bg-[#EEF5EE]"
                        />

                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-[#142318] dark:text-[#F7FBFA] line-clamp-1">
                                {item.menuItem.name}
                              </h4>
                              {item.selectedCustomizations.length > 0 && (
                                <p className="text-[11px] text-[#5E8662] dark:text-[#A3C2A5]">
                                  {item.selectedCustomizations.map(c => c.selectedOptionName).join(', ')}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.cartItemId)}
                              className="text-xs text-red-500 hover:text-red-700 p-1"
                              aria-label={`Remove ${item.menuItem.name}`}
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
                              ₹{item.itemTotalPrice}
                            </span>

                            {/* Stepper */}
                            <div className="flex items-center rounded-full border border-[#325736]/30 px-2 py-0.5 text-xs gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="font-bold text-sm px-1"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="font-semibold tabular-nums">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="font-bold text-sm px-1"
                                aria-label="Increase quantity"
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
                <div className="border-t border-[#325736]/15 dark:border-[#F7FBFA]/15 p-6 bg-white dark:bg-[#142318] space-y-4">
                  {/* Coupon Code Section */}
                  <div>
                    {couponCode ? (
                      <div className="flex items-center justify-between rounded-xl bg-[#EEF5EE] dark:bg-[#1F3A24] px-3 py-2 text-xs text-[#325736] dark:text-[#A3C2A5]">
                        <span>Applied: <strong>{couponCode}</strong> (-₹{discountAmount})</span>
                        <button type="button" onClick={removeCoupon} className="font-bold underline text-red-500">
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
                          className="flex-1 rounded-full border border-[#325736]/30 px-3 py-1.5 text-xs uppercase bg-transparent focus:outline-none focus:ring-1 focus:ring-[#325736]"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-[#325736] px-4 py-1.5 text-xs font-semibold text-white uppercase hover:bg-[#284A2D]"
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
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5E8662]">
                      Tip Our Baristas &amp; Kitchen
                    </span>
                    <div className="flex gap-2 mt-1.5">
                      {[0, 20, 50, 100].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setTip(amt)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            tipAmount === amt
                              ? 'bg-[#325736] text-white'
                              : 'border border-[#325736]/20 text-[#142318] dark:text-[#F7FBFA]'
                          }`}
                        >
                          {amt === 0 ? 'No tip' : `₹${amt}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  <div className="space-y-1.5 text-xs border-t border-[#325736]/10 pt-3">
                    <div className="flex justify-between text-[#142318]/70 dark:text-[#F7FBFA]/70">
                      <span>Item Subtotal</span>
                      <span className="tabular-nums">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#142318]/70 dark:text-[#F7FBFA]/70">
                      <span>5% Restaurant GST</span>
                      <span className="tabular-nums">₹{gst}</span>
                    </div>
                    {tipAmount > 0 && (
                      <div className="flex justify-between text-[#5E8662]">
                        <span>Barista Gratuity</span>
                        <span className="tabular-nums">+₹{tipAmount}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[#5E8662]">
                        <span>Promo Discount</span>
                        <span className="tabular-nums">-₹{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-[#142318] dark:text-[#F7FBFA] pt-2 border-t border-[#325736]/10">
                      <span>Grand Total (Est.)</span>
                      <span className="text-[#325736] dark:text-[#A3C2A5] tabular-nums">₹{total}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Link
                    to="/checkout"
                    onClick={closeDrawer}
                    className="w-full flex items-center justify-center rounded-full bg-[#325736] py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#F7FBFA] shadow-lg hover:bg-[#284A2D] transition-colors"
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
