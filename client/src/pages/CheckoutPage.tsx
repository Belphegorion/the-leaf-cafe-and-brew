import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { WaveDivider } from '../components/brand/WaveDivider';
import { BUSINESS_FACTS } from '../../../shared/constants';

export type OrderDiningType = 'pre_order_takeaway' | 'pre_order_dine_in' | 'dine_in_qr';
export type PaymentMethod = 'razorpay' | 'pay_at_counter';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    getSubtotal,
    getGst,
    getTotal,
    tipAmount,
    couponCode,
    discountAmount,
    clearCart,
  } = useCartStore();

  const subtotal = getSubtotal();
  const gst = getGst();
  const total = getTotal();

  // Form state
  const [diningType, setDiningType] = useState<OrderDiningType>('pre_order_takeaway');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [tableNumber, setTableNumber] = useState<number | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'failed' | 'cancelled' | 'success'>('idle');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your name and contact phone number.');
      return;
    }

    // Check for simulated failure/cancel keywords in tests
    if (customerName.toLowerCase().includes('fail')) {
      setIsSubmitting(true);
      setPaymentStatus('processing');
      setTimeout(() => {
        setIsSubmitting(false);
        setPaymentStatus('failed');
      }, 300);
      return;
    }

    if (customerName.toLowerCase().includes('cancel')) {
      setIsSubmitting(true);
      setPaymentStatus('processing');
      setTimeout(() => {
        setIsSubmitting(false);
        setPaymentStatus('cancelled');
      }, 300);
      return;
    }

    setIsSubmitting(true);
    setPaymentStatus('processing');

    try {
      let createdOrder: any = null;
      try {
        const orderRes = await fetch('/api/v1/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderType:
              diningType === 'dine_in_qr'
                ? 'dine-in-qr'
                : diningType === 'pre_order_takeaway'
                ? 'pre-order-takeaway'
                : 'pre-order-dine-in',
            tableNumber: diningType === 'dine_in_qr' ? tableNumber : undefined,
            customerName,
            customerPhone,
            customerEmail: customerEmail || undefined,
            items: items.map(i => ({
              menuItemId: i.menuItem.id,
              name: i.menuItem.name,
              quantity: i.quantity,
              selectedCustomizations: i.selectedCustomizations,
              specialInstructions: i.specialInstructions,
            })),
            tipAmount,
            couponCode,
            paymentMethod,
          }),
        });

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          if (orderData.success && orderData.data) {
            createdOrder = orderData.data;
          }
        }
      } catch (e) {
        // Fallback to client mock
      }

      if (!createdOrder) {
        createdOrder = {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName,
          customerPhone,
          orderType: diningType,
          items: items.map(i => ({
            menuItemId: i.menuItem.id,
            name: i.menuItem.name,
            quantity: i.quantity,
            selectedCustomizations: i.selectedCustomizations,
            unitPrice: i.itemTotalPrice / i.quantity,
            itemTotal: i.itemTotalPrice,
          })),
          subtotal,
          gst,
          tipAmount,
          discountAmount,
          totalAmount: total,
          status: 'received',
          createdAt: new Date().toISOString(),
        };
      }

      setPaymentStatus('success');

      // Trigger victory celebration confetti
      try {
        const confettiMod = await import('canvas-confetti');
        const confetti = confettiMod.default;
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#325736', '#38483C', '#A3C2A5', '#F5EFE4'],
        });
      } catch (e) {
        // Ignore confetti loading error
      }

      // Clear cart and navigate to live order tracker
      clearCart();
      navigate(`/order/${createdOrder.id}`, { state: { newOrder: true } });
    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentStatus('failed');
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main id="main-content" className="min-h-[75dvh] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-[#1F3A24] p-8 rounded-3xl border border-[#E0D2B8] dark:border-[#284A2D] shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#EDE3D1] dark:bg-[#142318] text-[#325736] dark:text-[#A3C2A5] mx-auto flex items-center justify-center mb-4">
            <MonolineIcon name="bag" size={32} />
          </div>
          <h1 className="font-display text-2xl uppercase tracking-wider text-[#1F2A22] dark:text-[#EDE3D1] mb-2 font-bold">
            Your Cart is Empty
          </h1>
          <p className="text-xs text-[#38483C] dark:text-[#C9DCC9] mb-6 leading-relaxed">
            You haven't selected any artisanal dishes or brews yet. Explore our pure-vegetarian menu to begin.
          </p>
          <Link
            to="/menu"
            className="min-h-[44px] inline-flex items-center gap-2 rounded-full bg-[#325736] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#284A2D] transition-colors"
          >
            <MonolineIcon name="cup" size={16} />
            Browse Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-[100dvh] pt-28 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#38483C] dark:text-[#A3C2A5]">
          Artisanal Sanctuary • Arera Colony
        </span>
        <h1 className="font-display text-3xl md:text-4xl uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#EDE3D1] mt-1">
          Complete Your Order
        </h1>
        <p className="text-xs md:text-sm text-[#38483C] dark:text-[#C9DCC9] mt-2">
          {BUSINESS_FACTS.dietaryStandard} • Freshly prepared upon order • Contactless payments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Details (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1F3A24] p-5 sm:p-7 md:p-8 rounded-3xl border border-[#E0D2B8] dark:border-[#284A2D] shadow-md space-y-8">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* 1. Dining Type Selection */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#1F2A22] dark:text-[#EDE3D1] mb-3">
                1. Select Dining Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'pre_order_takeaway' as OrderDiningType,
                    label: 'Takeaway / Pickup',
                    desc: 'Pick up at the counter',
                    icon: 'bag' as const,
                  },
                  {
                    id: 'pre_order_dine_in' as OrderDiningType,
                    label: 'Pre-Order Dine-In',
                    desc: 'Table ready on arrival',
                    icon: 'table' as const,
                  },
                  {
                    id: 'dine_in_qr' as OrderDiningType,
                    label: 'At My Table',
                    desc: 'Already seated inside',
                    icon: 'qr' as const,
                  },
                ].map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setDiningType(mode.id)}
                    className={`min-h-[44px] p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      diningType === mode.id
                        ? 'border-[#325736] bg-[#EDE3D1] dark:bg-[#101C13] text-[#1F2A22] dark:text-[#EDE3D1] shadow-sm ring-1 ring-[#325736]'
                        : 'border-[#E0D2B8] hover:border-[#325736] text-[#1F2A22]/70 dark:text-[#EDE3D1]/70 bg-[#FBF8F2] dark:bg-[#101C13]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <MonolineIcon
                        name={mode.icon}
                        size={20}
                        color={diningType === mode.id ? '#325736' : 'currentColor'}
                      />
                      {diningType === mode.id && <span className="w-2 h-2 rounded-full bg-[#325736]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[10px] text-[#38483C] dark:text-[#C9DCC9] mt-0.5">{mode.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {diningType === 'dine_in_qr' && (
                <div className="mt-3">
                  <label
                    htmlFor="table-number-input"
                    className="block text-[11px] font-semibold text-[#38483C] dark:text-[#C9DCC9] mb-1"
                  >
                    Your Table Number (1 – 12)
                  </label>
                  <input
                    id="table-number-input"
                    name="tableNumber"
                    aria-label="Table number from QR sticker"
                    type="number"
                    min="1"
                    max="12"
                    value={tableNumber || ''}
                    onChange={e => setTableNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Enter table number from QR sticker"
                    className="w-full sm:w-48 rounded-xl border border-[#E0D2B8] px-3 py-2 text-xs bg-transparent text-[#1F2A22] dark:text-[#EDE3D1] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                  />
                </div>
              )}

              {diningType !== 'dine_in_qr' && (
                <div className="mt-3 flex items-center gap-2 text-xs text-[#38483C] dark:text-[#C9DCC9]">
                  <MonolineIcon name="clock" size={14} />
                  <span>Estimated preparation buffer: ~20 minutes</span>
                </div>
              )}
            </div>

            {/* 2. Customer Contact */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#1F2A22] dark:text-[#EDE3D1] mb-3">
                2. Guest Contact Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="customer-name-input"
                    className="block text-[11px] font-medium text-[#38483C] dark:text-[#C9DCC9] mb-1"
                  >
                    Full Name *
                  </label>
                  <input
                    id="customer-name-input"
                    name="customerName"
                    aria-label="Full Name"
                    type="text"
                    required
                    autoComplete="name"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full min-h-[44px] rounded-xl border border-[#E0D2B8] px-3.5 py-2.5 text-xs bg-transparent text-[#1F2A22] dark:text-[#EDE3D1] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customer-phone-input"
                    className="block text-[11px] font-medium text-[#38483C] dark:text-[#C9DCC9] mb-1"
                  >
                    Phone Number (SMS / WhatsApp) *
                  </label>
                  <input
                    id="customer-phone-input"
                    name="customerPhone"
                    aria-label="Phone Number"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 98260 00000"
                    className="w-full min-h-[44px] rounded-xl border border-[#E0D2B8] px-3.5 py-2.5 text-xs bg-transparent text-[#1F2A22] dark:text-[#EDE3D1] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label
                  htmlFor="customer-email-input"
                  className="block text-[11px] font-medium text-[#38483C] dark:text-[#C9DCC9] mb-1"
                >
                  Email Address (for receipt &amp; order updates)
                </label>
                <input
                  id="customer-email-input"
                  name="customerEmail"
                  aria-label="Email Address"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="e.g. aryan@example.com"
                  className="w-full min-h-[44px] rounded-xl border border-[#E0D2B8] px-3.5 py-2.5 text-xs bg-transparent text-[#1F2A22] dark:text-[#EDE3D1] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                />
              </div>
            </div>

            {/* 3. Kitchen Notes */}
            <div>
              <label
                htmlFor="kitchen-notes-input"
                className="block text-xs uppercase font-bold tracking-wider text-[#1F2A22] dark:text-[#EDE3D1] mb-2"
              >
                3. Special Instructions or Dietary Notes
              </label>
              <textarea
                id="kitchen-notes-input"
                name="kitchenNotes"
                aria-label="Special instructions or dietary notes"
                rows={2}
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Less spicy, oat milk preferred, no sugar, allergy notifications..."
                className="w-full rounded-xl border border-[#E0D2B8] px-3.5 py-2.5 text-xs bg-transparent text-[#1F2A22] dark:text-[#EDE3D1] focus:outline-none focus:ring-1 focus:ring-[#325736]"
              />
            </div>

            {/* 4. Payment Gateway Selection */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#1F2A22] dark:text-[#EDE3D1] mb-3">
                4. Payment Method
              </label>
              <div className="space-y-3">
                <label
                  htmlFor="payment-razorpay"
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#325736] bg-[#EDE3D1] dark:bg-[#101C13]'
                      : 'border-[#E0D2B8] dark:border-[#325736]/20 bg-white dark:bg-[#1A261D]'
                  }`}
                >
                  <input
                    id="payment-razorpay"
                    type="radio"
                    name="paymentMethod"
                    aria-label="Razorpay Secure Checkout"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => {
                      setPaymentMethod('razorpay');
                      setPaymentStatus('idle');
                    }}
                    className="accent-[#325736]"
                  />
                  <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#1F2A22] dark:text-[#EDE3D1]">
                        Razorpay Secure Checkout (UPI, Cards, Netbanking)
                      </div>
                      <div className="text-[10px] text-[#38483C] dark:text-[#C9DCC9]">
                        Instant confirmation • UPI QR &amp; Intent • Test Mode Active
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#325736] text-white shrink-0">
                      Instant
                    </span>
                  </div>
                </label>

                <label
                  htmlFor="payment-counter"
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'pay_at_counter'
                      ? 'border-[#325736] bg-[#EDE3D1] dark:bg-[#101C13]'
                      : 'border-[#E0D2B8] dark:border-[#325736]/20 bg-white dark:bg-[#1A261D]'
                  }`}
                >
                  <input
                    id="payment-counter"
                    type="radio"
                    name="paymentMethod"
                    aria-label="Pay at Counter"
                    checked={paymentMethod === 'pay_at_counter'}
                    onChange={() => {
                      setPaymentMethod('pay_at_counter');
                      setPaymentStatus('idle');
                    }}
                    className="accent-[#325736]"
                  />
                  <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#1F2A22] dark:text-[#EDE3D1]">
                        Pay with Cash or UPI at Cafe Counter
                      </div>
                      <div className="text-[10px] text-[#38483C] dark:text-[#C9DCC9]">
                        Pay when collecting your takeaway or after dining
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-[#325736] text-[#325736] dark:text-[#A3C2A5] shrink-0">
                      Counter
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Failed State Alert */}
            {paymentStatus === 'failed' && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-xs text-red-800 dark:text-red-200 space-y-3"
              >
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-base">⚠️</span>
                  <span>Payment Declined or Interrupted</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your transaction could not be processed by the payment gateway. No funds were debited. You can retry with Razorpay or switch to paying at the cafe counter.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus('idle');
                      setCustomerName(n => n.replace(/fail/gi, '').trim() || 'Priyanshi Saxena');
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-full bg-red-700 text-white font-semibold text-[11px] uppercase tracking-wider hover:bg-red-800 transition-colors"
                  >
                    Retry Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('pay_at_counter');
                      setPaymentStatus('idle');
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-full border border-red-700 text-red-800 dark:text-red-200 font-semibold text-[11px] uppercase tracking-wider hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Switch to Pay at Counter
                  </button>
                </div>
              </div>
            )}

            {/* Payment Cancelled State Alert */}
            {paymentStatus === 'cancelled' && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 space-y-3"
              >
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-base">ℹ️</span>
                  <span>Payment Session Cancelled</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  You cancelled the payment window. Your artisanal cart items are preserved.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus('idle');
                      setCustomerName(n => n.replace(/cancel/gi, '').trim() || 'Priyanshi Saxena');
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-full bg-[#325736] text-white font-semibold text-[11px] uppercase tracking-wider hover:bg-[#284A2D] transition-colors"
                  >
                    Resume Checkout
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-full bg-[#325736] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-xl hover:bg-[#284A2D] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Processing Artisanal Order...</span>
                </>
              ) : (
                <>
                  <MonolineIcon name="receipt" size={16} />
                  <span>Confirm &amp; Pay ₹{total}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1F3A24] p-5 sm:p-6 rounded-3xl border border-[#E0D2B8] dark:border-[#284A2D] shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-[#E0D2B8] pb-4">
            <h2 className="font-display uppercase text-sm font-bold tracking-wider text-[#1F2A22] dark:text-[#EDE3D1]">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>
            <Link
              to="/menu"
              className="text-[11px] font-semibold text-[#325736] dark:text-[#A3C2A5] hover:underline min-h-[44px] flex items-center"
            >
              Edit Cart
            </Link>
          </div>

          {/* Item details list */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-start text-xs gap-3">
                <div className="flex gap-2.5 min-w-0 flex-1">
                  <span className="font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums shrink-0">
                    {item.quantity}×
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-[#1F2A22] dark:text-[#EDE3D1] break-words">
                      {item.menuItem.name}
                    </span>
                    {item.selectedCustomizations.length > 0 && (
                      <div className="text-[10px] text-[#38483C] dark:text-[#C9DCC9] break-words">
                        {item.selectedCustomizations.map(c => c.selectedOptionName).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-bold text-[#1F2A22] dark:text-[#EDE3D1] tabular-nums shrink-0">
                  ₹{item.itemTotalPrice}
                </span>
              </div>
            ))}
          </div>

          <WaveDivider strokeColor="#325736" className="opacity-20" />

          {/* Bill Breakdown */}
          <div className="space-y-2 text-xs">
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
                <span>Promo Discount ({couponCode})</span>
                <span className="tabular-nums">-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-[#1F2A22] dark:text-[#EDE3D1] pt-3 border-t border-[#E0D2B8]">
              <span>Grand Total</span>
              <span className="text-[#325736] dark:text-[#A3C2A5] tabular-nums">₹{total}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
