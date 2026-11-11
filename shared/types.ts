// Shared TypeScript domain types and contracts for The Leaf – Cafe and Brew

export type DietaryTag = 'jain' | 'vegan' | 'spicy' | 'bestseller' | 'gluten-free' | 'chef-special' | 'contains-nuts' | 'contains-dairy';

export type CategorySlug =
  | 'coffee'
  | 'cold-brews'
  | 'shakes'
  | 'mojitos-coolers'
  | 'pizza'
  | 'pasta'
  | 'garlic-bread-bruschetta'
  | 'salads'
  | 'chinese'
  | 'sandwiches'
  | 'desserts';

export interface CustomizationOption {
  id: string;
  name: string;
  priceDelta: number; // in INR
  isDefault?: boolean;
}

export interface CustomizationGroup {
  id: string;
  name: string; // e.g. "Size", "Milk Choice", "Sweetness", "Add-on"
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  category: CategorySlug;
  description: string;
  price: number; // in INR (tagged as TBC estimate in demo)
  isPriceTbc: boolean;
  image: string;
  tags: DietaryTag[];
  customizations?: CustomizationGroup[];
  isAvailable: boolean;
  isPopular?: boolean;
  prepTimeMinutes: number;
  calories?: number;
  sortOrder: number;
}

export interface CartCustomizationSelection {
  groupId: string;
  groupName: string;
  selectedOptionId: string;
  selectedOptionName: string;
  priceDelta: number;
}

export interface CartItem {
  cartItemId: string; // generated client-side id (id + options hash)
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: CartCustomizationSelection[];
  specialInstructions?: string;
  itemTotalPrice: number; // unit price with customizations * quantity
}

export type OrderType = 'dine-in-table' | 'dine-in-arrival' | 'takeaway-pickup' | 'delivery-aggregator';

export type OrderStatus =
  | 'pending-payment'
  | 'received'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export interface OrderItemPayload {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedCustomizations: CartCustomizationSelection[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  diningType?: string; // Ergonomic alias for UI
  tableNumber?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customer?: { name: string; phone: string; email?: string }; // Ergonomic object format
  items: OrderItemPayload[];
  subtotal: number;
  gstAmount: number; // 5% standard restaurant GST in India
  gst?: number; // Ergonomic alias
  tipAmount: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  total?: number; // Ergonomic alias
  status: OrderStatus;
  estimatedPrepMinutes: number;
  scheduledArrivalTime?: string; // ISO string for pre-orders
  paymentMethod: 'razorpay' | 'pay-at-counter' | 'running-tab';
  paymentStatus: 'pending' | 'captured' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export type SeatingPreference = 'indoor-main' | 'arched-window' | 'quiet-corner' | 'group-table' | 'indoor' | 'window' | 'quiet_corner' | 'group_table';

export type BookingStatus = 'locked' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';

export interface TableBooking {
  id: string;
  bookingRef: string;
  bookingReference?: string; // Alias
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm (e.g. "13:30", "19:00")
  partySize: number; // 1 to 12
  seatingPreference: SeatingPreference;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  occasion?: 'birthday' | 'anniversary' | 'date' | 'meeting' | 'casual' | 'other';
  specialNotes?: string;
  specialRequests?: string; // Alias
  preOrderId?: string;
  status: BookingStatus;
  depositAmount: number; // 0 if waived, or admin configurable e.g. 500
  depositPaymentStatus?: 'none' | 'paid' | 'refunded';
  lockExpiresAt?: string; // ISO timestamp for 5-minute Redis hold
  createdAt: string;
}

export interface TableAlert {
  type: 'call_waiter' | 'water' | 'bill' | 'clear';
  createdAt: string;
}

export interface TableStatus {
  tableNumber: number;
  capacity: number;
  section: SeatingPreference;
  isOccupied: boolean;
  currentOrderId?: string;
  runningTotal?: number;
  waiterCallActive?: boolean;
  waterRequested?: boolean;
  billRequested?: boolean;
  activeAlerts?: TableAlert[];
}

export interface CafeConfig {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  instagramUrl?: string;
  instagramHandle?: string;
  hoursDisplay: string;
  isPureVeg: boolean;
  dietaryStandard?: string;
  phonePlaceholder?: string;
  averageCostForTwo: number;
  googleRating: number;
  googleRatingCount: number;
  preOrderMinBufferMinutes: number;
  tableDepositDefault: number;
  deliveryEnabled: boolean;
  gstRate: number; // 0.05
}
