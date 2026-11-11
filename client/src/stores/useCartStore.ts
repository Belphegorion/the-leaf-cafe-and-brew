import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem, CartCustomizationSelection } from '../../../shared/types';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  tipAmount: number;
  couponCode: string | null;
  discountAmount: number;

  // Actions
  addItem: (
    menuItem: MenuItem,
    customizations?: CartCustomizationSelection[],
    quantity?: number,
    instructions?: string
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setTip: (tip: number) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Computed getters
  getItemCount: () => number;
  getSubtotal: () => number;
  getGst: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      tipAmount: 0,
      couponCode: null,
      discountAmount: 0,

  addItem: (menuItem, customizations = [], quantity = 1, instructions = '') => {
    // Generate a unique id based on item and selected customization options
    const optKey = customizations
      .map(c => `${c.groupId}:${c.selectedOptionId}`)
      .sort()
      .join('|');
    const cartItemId = `${menuItem.id}_${optKey}`;

    const customPriceDeltas = customizations.reduce((sum, c) => sum + c.priceDelta, 0);
    const unitPrice = menuItem.price + customPriceDeltas;

    set(state => {
      const existingIndex = state.items.findIndex(i => i.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...state.items];
        const current = updated[existingIndex];
        const newQty = current.quantity + quantity;
        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          itemTotalPrice: newQty * unitPrice,
        };
        return { items: updated };
      } else {
        const newItem: CartItem = {
          cartItemId,
          menuItem,
          quantity,
          selectedCustomizations: customizations,
          specialInstructions: instructions,
          itemTotalPrice: quantity * unitPrice,
        };
        return { items: [...state.items, newItem] };
      }
    });
  },

  removeItem: cartItemId => {
    set(state => ({
      items: state.items.filter(i => i.cartItemId !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId, newQty) => {
    if (newQty <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    set(state => ({
      items: state.items.map(item => {
        if (item.cartItemId === cartItemId) {
          const customPriceDeltas = item.selectedCustomizations.reduce((s, c) => s + c.priceDelta, 0);
          const unitPrice = item.menuItem.price + customPriceDeltas;
          return {
            ...item,
            quantity: newQty,
            itemTotalPrice: newQty * unitPrice,
          };
        }
        return item;
      }),
    }));
  },

  clearCart: () => {
    set({ items: [], couponCode: null, discountAmount: 0, tipAmount: 0 });
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),

  setTip: tip => set({ tipAmount: Math.max(0, tip) }),

  applyCoupon: code => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'LEAF10') {
      const sub = get().getSubtotal();
      const disc = Math.round(sub * 0.1);
      set({ couponCode: cleanCode, discountAmount: disc });
      return { success: true, message: '10% discount applied!' };
    }
    if (cleanCode === 'BHOPALBEATS') {
      set({ couponCode: cleanCode, discountAmount: 100 });
      return { success: true, message: '₹100 flat discount applied!' };
    }
    return { success: false, message: 'Invalid or expired coupon code.' };
  },

  removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.itemTotalPrice, 0);
  },

  getGst: () => {
    const subtotal = get().getSubtotal();
    return Math.round(subtotal * 0.05); // 5% GST
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const gst = get().getGst();
    const { tipAmount, discountAmount } = get();
    return Math.max(0, subtotal + gst + tipAmount - discountAmount);
  },
    }),
    {
      name: 'the-leaf-cart-storage',
      partialize: state => ({
        items: state.items,
        tipAmount: state.tipAmount,
        couponCode: state.couponCode,
        discountAmount: state.discountAmount,
      }),
    }
  )
);
