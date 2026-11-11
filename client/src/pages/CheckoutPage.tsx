import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
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

    setIsSubmitting(true);

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType: diningType === 'dine_in_qr' ? 'dine-in-qr' : diningType === 'pre_order_takeaway' ? 'pre-order-takeaway' : 'pre-order-dine-in',
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
          paymentMethod: 'razorpay',
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.data) {
        throw new Error(orderData.message || 'Could not place order. Please try again.');
      }
      const createdOrder = orderData.data;

      // 2. Initiate Razorpay / Payment Order on backend
      const paymentRes = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrder.id,
        }),
      });

      const paymentData = await paymentRes.json();
      const rzpOrderId = paymentData.data?.razorpayOrderId || `rzp_${Date.now()}`;

      // 3. Complete payment verification (simulated seamlessly in test mode)
      const verifyRes = await fetch('/api/v1/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrder.id,
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'test_signature_mock',
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.message || 'Payment verification failed.');
      }

      // 4. Trigger victory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#325736', '#5E8662', '#A3C2A5', '#F7FBFA'],
      });

      // 5. Clear cart and navigate to live order tracker
      clearCart();
      navigate(`/order/${createdOrder.id}`, { state: { newOrder: true } });
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-[#1F3A24] p-8 rounded-3xl border border-[#325736]/20 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#EEF5EE] dark:bg-[#142318] text-[#325736] dark:text-[#A3C2A5] mx-auto flex items-center justify-center mb-4">
            <MonolineIcon name="bag" size={32} />
          </div>
          <h1 className="font-display text-2xl uppercase tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-2 font-bold">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-[#5E8662] dark:text-[#A3C2A5] mb-6">
            You haven't selected any artisanal dishes or brews yet. Explore our pure-vegetarian menu to begin.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 rounded-full bg-[#325736] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#284A2D] transition-colors"
          >
            <MonolineIcon name="cup" size={16} />
            Browse Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#5E8662] dark:text-[#A3C2A5]">
          Artisanal Sanctuary • Arera Colony
        </span>
        <h1 className="font-display text-3xl md:text-4xl uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
          Complete Your Order
        </h1>
        <p className="text-xs md:text-sm text-[#5E8662] dark:text-[#A3C2A5] mt-2">
          {BUSINESS_FACTS.dietaryStandard} • Freshly prepared upon order • Contactless payments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Details (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1F3A24] p-6 md:p-8 rounded-3xl border border-[#325736]/20 shadow-lg space-y-8">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* 1. Dining Type Selection */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-3">
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
                    className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      diningType === mode.id
                        ? 'border-[#325736] bg-[#EEF5EE] dark:bg-[#142318] text-[#142318] dark:text-[#F7FBFA] shadow-sm ring-1 ring-[#325736]'
                        : 'border-[#325736]/15 hover:border-[#325736]/40 text-[#142318]/70 dark:text-[#F7FBFA]/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <MonolineIcon name={mode.icon} size={20} color={diningType === mode.id ? '#325736' : 'currentColor'} />
                      {diningType === mode.id && (
                        <span className="w-2 h-2 rounded-full bg-[#325736]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[10px] text-[#5E8662] dark:text-[#A3C2A5] mt-0.5">{mode.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {diningType === 'dine_in_qr' && (
                <div className="mt-3">
                  <label htmlFor="table-number-input" className="block text-[11px] font-semibold text-[#5E8662] dark:text-[#A3C2A5] mb-1">
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
                    className="w-full sm:w-48 rounded-xl border border-[#325736]/30 px-3 py-2 text-xs bg-transparent text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                  />
                </div>
              )}

              {diningType !== 'dine_in_qr' && (
                <div className="mt-3 flex items-center gap-2 text-xs text-[#5E8662] dark:text-[#A3C2A5]">
                  <MonolineIcon name="clock" size={14} />
                  <span>Estimated preparation buffer: ~20 minutes</span>
                </div>
              )}
            </div>

            {/* 2. Customer Contact */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-3">
                2. Guest Contact Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="customer-name-input" className="block text-[11px] font-medium text-[#5E8662] dark:text-[#A3C2A5] mb-1">
                    Full Name *
                  </label>
                  <input
                    id="customer-name-input"
                    name="customerName"
                    aria-label="Full Name"
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full rounded-xl border border-[#325736]/30 px-3.5 py-2.5 text-xs bg-transparent text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                  />
                </div>
                <div>
                  <label htmlFor="customer-phone-input" className="block text-[11px] font-medium text-[#5E8662] dark:text-[#A3C2A5] mb-1">
                    Phone Number (SMS / WhatsApp) *
                  </label>
                  <input
                    id="customer-phone-input"
                    name="customerPhone"
                    aria-label="Phone Number"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 98260 00000"
                    className="w-full rounded-xl border border-[#325736]/30 px-3.5 py-2.5 text-xs bg-transparent text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label htmlFor="customer-email-input" className="block text-[11px] font-medium text-[#5E8662] dark:text-[#A3C2A5] mb-1">
                  Email Address (for receipt &amp; order updates)
                </label>
                <input
                  id="customer-email-input"
                  name="customerEmail"
                  aria-label="Email Address"
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="e.g. aryan@example.com"
                  className="w-full rounded-xl border border-[#325736]/30 px-3.5 py-2.5 text-xs bg-transparent text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                />
              </div>
            </div>

            {/* 3. Kitchen Notes */}
            <div>
              <label htmlFor="kitchen-notes-input" className="block text-xs uppercase font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-2">
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
                className="w-full rounded-xl border border-[#325736]/30 px-3.5 py-2.5 text-xs bg-transparent text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-1 focus:ring-[#325736]"
              />
            </div>

            {/* 4. Payment Gateway Selection */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-3">
                4. Payment Method
              </label>
              <div className="space-y-2">
                <label htmlFor="payment-razorpay" className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#325736] bg-[#EEF5EE] dark:bg-[#142318] cursor-pointer">
                  <input
                    id="payment-razorpay"
                    type="radio"
                    name="paymentMethod"
                    aria-label="Razorpay Secure Checkout"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-[#325736]"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">
                        Razorpay Secure Checkout (UPI, Cards, Netbanking)
                      </div>
                      <div className="text-[10px] text-[#5E8662] dark:text-[#A3C2A5]">
                        Instant confirmation • UPI QR &amp; Intent • Test Mode Active
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#325736] text-white">
                      Instant
                    </span>
                  </div>
                </label>
              </div>
            </div>

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
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#325736] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7FBFA] shadow-xl hover:bg-[#284A2D] transition-all disabled:opacity-50"
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
        <div className="lg:col-span-5 bg-white dark:bg-[#1F3A24] p-6 rounded-3xl border border-[#325736]/20 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-[#325736]/15 pb-4">
            <h2 className="font-display uppercase text-sm font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA]">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>
            <Link to="/menu" className="text-[11px] font-semibold text-[#325736] dark:text-[#A3C2A5] hover:underline">
              Edit Cart
            </Link>
          </div>

          {/* Item details list */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-start text-xs">
                <div className="flex gap-3">
                  <span className="font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
                    {item.quantity}×
                  </span>
                  <div>
                    <span className="font-semibold text-[#142318] dark:text-[#F7FBFA]">
                      {item.menuItem.name}
                    </span>
                    {item.selectedCustomizations.length > 0 && (
                      <div className="text-[10px] text-[#5E8662] dark:text-[#A3C2A5]">
                        {item.selectedCustomizations.map(c => c.selectedOptionName).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums">
                  ₹{item.itemTotalPrice}
                </span>
              </div>
            ))}
          </div>

          <WaveDivider strokeColor="#325736" className="opacity-20" />

          {/* Bill Breakdown */}
          <div className="space-y-2 text-xs">
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
                <span>Promo Discount ({couponCode})</span>
                <span className="tabular-nums">-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#142318] dark:text-[#F7FBFA] pt-3 border-t border-[#325736]/15">
              <span>Total Payable (Est.)</span>
              <span className="text-[#325736] dark:text-[#A3C2A5] tabular-nums">₹{total}</span>
            </div>
          </div>

          {/* Pure Vegetarian Notice */}
          <div className="p-3.5 rounded-2xl bg-[#EEF5EE] dark:bg-[#142318] border border-[#325736]/20 flex items-start gap-3">
            <div className="w-4 h-4 rounded-sm border border-emerald-600 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <p className="text-[11px] text-[#325736] dark:text-[#A3C2A5] leading-relaxed">
              <strong>100% Pure Vegetarian Kitchen</strong>. No meat, no fish, no poultry, no gelatin, strictly no alcohol.
            </p>
          </div>

          {/* Trust Badge */}
          <div className="text-center text-[10px] text-[#5E8662] dark:text-[#A3C2A5] space-y-1">
            <div className="font-semibold text-[#142318] dark:text-[#F7FBFA]">
              {BUSINESS_FACTS.name}
            </div>
            <div>{BUSINESS_FACTS.address}</div>
            <div>Google Rating: ★ 4.9 (646 reviews)</div>
          </div>
        </div>
      </div>
    </main>
  );
};
