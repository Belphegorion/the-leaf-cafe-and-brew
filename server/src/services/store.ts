import { MenuItem, TableBooking, Order, TableStatus, OrderStatus, BookingStatus } from '../../../shared/types';
import { INITIAL_MENU_ITEMS, MENU_CATEGORIES, MenuCategoryDef } from '../data/seedData';
import { AppError } from '../middleware/errorHandler';

export interface AuditLogEntry {
  id: string;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  action: string;
  entity: string;
  entityId: string;
  before?: any;
  after?: any;
  ip?: string;
  timestamp: string;
}

export interface CouponDef {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // percentage (e.g. 10) or rupees (e.g. 100)
  minOrderAmount: number;
  maxDiscount?: number;
  isActive: boolean;
}

export interface CafeSettings {
  openingTime: string; // e.g. "11:00"
  closingTime: string; // e.g. "23:30"
  hoursDisplay: string;
  isPureVeg: boolean;
  tableDepositDefault: number;
  deliveryEnabled: boolean;
  maxCapacityPerSlot: number;
  coupons: CouponDef[];
}

export interface ReportSummary {
  period: string;
  totalRevenue: number;
  ordersCount: number;
  averageOrderValue: number;
  ordersByType: Record<string, number>;
  ordersByStatus: Record<string, number>;
  topItems: { menuItemId: string; name: string; quantity: number; revenue: number }[];
  occupiedTablesCount: number;
  totalTablesCount: number;
}

/**
 * High-Reliability Data Store for The Leaf – Cafe and Brew.
 * Supports Atomic state transitions, Idempotency caching, Concurrency-safe slot locking,
 * Audit logging, Reports generation, and Resilient Menu/Order/Booking management.
 */
class MemoryDataStore {
  private categories: MenuCategoryDef[] = [...MENU_CATEGORIES];
  private menuItems: MenuItem[] = [...INITIAL_MENU_ITEMS];
  private orders: Map<string, Order> = new Map();
  private bookings: Map<string, TableBooking> = new Map();
  private tables: Map<number, TableStatus> = new Map();
  private slotLocks: Map<string, { bookingId: string; expiresAt: number }> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private idempotencyCache: Map<string, { result: any; createdAt: number }> = new Map();

  private settings: CafeSettings = {
    openingTime: '11:00',
    closingTime: '23:30',
    hoursDisplay: '11:00 AM – 11:30 PM daily',
    isPureVeg: true,
    tableDepositDefault: 0,
    deliveryEnabled: false,
    maxCapacityPerSlot: 6,
    coupons: [
      { code: 'LEAF10', discountType: 'percentage', value: 10, minOrderAmount: 0, isActive: true },
      { code: 'BHOPALBEATS', discountType: 'fixed', value: 100, minOrderAmount: 500, isActive: true },
    ],
  };

  constructor() {
    this.initTables();
    this.seedSampleOrders();
  }

  private initTables() {
    const defaultTables: TableStatus[] = [
      { tableNumber: 1, capacity: 2, section: 'arched-window', isOccupied: false },
      { tableNumber: 2, capacity: 2, section: 'arched-window', isOccupied: false },
      { tableNumber: 3, capacity: 4, section: 'arched-window', isOccupied: false },
      { tableNumber: 4, capacity: 4, section: 'indoor-main', isOccupied: false },
      { tableNumber: 5, capacity: 4, section: 'indoor-main', isOccupied: false },
      { tableNumber: 6, capacity: 2, section: 'quiet-corner', isOccupied: false },
      { tableNumber: 7, capacity: 2, section: 'quiet-corner', isOccupied: false },
      { tableNumber: 8, capacity: 6, section: 'group-table', isOccupied: false },
      { tableNumber: 9, capacity: 8, section: 'group-table', isOccupied: false },
      { tableNumber: 10, capacity: 4, section: 'indoor-main', isOccupied: false },
      { tableNumber: 11, capacity: 2, section: 'indoor-main', isOccupied: false },
      { tableNumber: 12, capacity: 12, section: 'group-table', isOccupied: false },
    ];
    defaultTables.forEach(t => this.tables.set(t.tableNumber, t));
  }

  private seedSampleOrders() {
    const sample: Order = {
      id: 'ORD-9821-42',
      orderNumber: 'ORD-9821-42',
      orderType: 'dine-in-table',
      tableNumber: 5,
      customerName: 'Aarav Sharma',
      customerPhone: '9826012345',
      items: [
        {
          menuItemId: 'sig-1',
          name: 'Peri Peri Paneer Pizza',
          quantity: 2,
          unitPrice: 380,
          selectedCustomizations: [],
          itemTotal: 760,
        },
        {
          menuItemId: 'sig-2',
          name: 'Truffle Alfredo Pasta',
          quantity: 1,
          unitPrice: 340,
          selectedCustomizations: [],
          itemTotal: 340,
        },
      ],
      subtotal: 1100,
      gstAmount: 55,
      tipAmount: 0,
      discountAmount: 0,
      totalAmount: 1155,
      status: 'preparing',
      estimatedPrepMinutes: 18,
      paymentMethod: 'pay-at-counter',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.createOrder(sample);
  }

  // === IDEMPOTENCY ===
  getIdempotentResponse(key: string): any | undefined {
    const cached = this.idempotencyCache.get(key);
    if (cached) {
      if (Date.now() - cached.createdAt < 24 * 60 * 60 * 1000) {
        return cached.result;
      }
      this.idempotencyCache.delete(key);
    }
    return undefined;
  }

  setIdempotentResponse(key: string, result: any) {
    this.idempotencyCache.set(key, { result, createdAt: Date.now() });
  }

  // === AUDIT LOGGING ===
  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.unshift(fullEntry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.length = 500; // Cap log history
    }
    return fullEntry;
  }

  getAuditLogs(limit: number = 50, page: number = 1): { logs: AuditLogEntry[]; total: number } {
    const start = (page - 1) * limit;
    return {
      logs: this.auditLogs.slice(start, start + limit),
      total: this.auditLogs.length,
    };
  }

  // === CAFE SETTINGS & COUPONS ===
  getSettings(): CafeSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<CafeSettings>): CafeSettings {
    this.settings = { ...this.settings, ...updates };
    return { ...this.settings };
  }

  validateCoupon(code: string, subtotal: number): { valid: boolean; discountAmount: number; message?: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.settings.coupons.find(c => c.code === cleanCode && c.isActive);
    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid or inactive coupon code.' };
    }
    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Coupon ${coupon.code} requires a minimum order of ₹${coupon.minOrderAmount}.`,
      };
    }
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }
    return { valid: true, discountAmount: Math.min(discount, subtotal) };
  }

  // === MENU ===
  getCategories(): MenuCategoryDef[] {
    return this.categories;
  }

  getMenuItems(category?: string, search?: string, tag?: string, includeDeleted: boolean = false): MenuItem[] {
    let result = this.menuItems;
    if (!includeDeleted) {
      result = result.filter(item => !item.deletedAt);
    }
    if (category) {
      result = result.filter(item => item.category === category);
    }
    if (tag) {
      result = result.filter(item => item.tags && item.tags.includes(tag as any));
    }
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return result;
  }

  getMenuItemById(id: string): MenuItem | undefined {
    return this.menuItems.find(item => item.id === id);
  }

  createMenuItem(item: Omit<MenuItem, 'id'> & { id?: string }): MenuItem {
    const id = item.id || `item_${Date.now()}_${Math.floor(10 + Math.random() * 90)}`;
    const newItem: MenuItem = {
      ...item,
      id,
      slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      isAvailable: item.isAvailable !== false,
      isPriceTbc: false,
      prepTimeMinutes: item.prepTimeMinutes || 15,
      sortOrder: item.sortOrder || this.menuItems.length + 1,
    };
    this.menuItems.push(newItem);
    return newItem;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem {
    const index = this.menuItems.findIndex(i => i.id === id);
    if (index === -1) {
      throw new AppError(`Menu item ${id} not found`, 404, 'NOT_FOUND');
    }
    const current = this.menuItems[index];
    const updated = { ...current, ...updates, id }; // id cannot change
    this.menuItems[index] = updated;
    return updated;
  }

  deleteMenuItem(id: string): MenuItem {
    const item = this.getMenuItemById(id);
    if (!item) {
      throw new AppError(`Menu item ${id} not found`, 404, 'NOT_FOUND');
    }
    // Soft delete so past orders citing this item remain valid
    item.deletedAt = new Date().toISOString();
    item.isAvailable = false;
    return item;
  }

  toggleMenuItemAvailability(id: string): MenuItem {
    const item = this.getMenuItemById(id);
    if (!item) {
      throw new AppError(`Menu item ${id} not found`, 404, 'NOT_FOUND');
    }
    item.isAvailable = !item.isAvailable;
    return item;
  }

  bulkImportMenuItems(items: Omit<MenuItem, 'id'>[]): { insertedCount: number; items: MenuItem[] } {
    const inserted: MenuItem[] = [];
    for (const raw of items) {
      const created = this.createMenuItem(raw);
      inserted.push(created);
    }
    return { insertedCount: inserted.length, items: inserted };
  }

  // === ORDERS & STATE TRANSITION ENGINE ===
  private static readonly ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    'pending-payment': ['received', 'cancelled'],
    'received': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['served', 'completed', 'cancelled'],
    'served': ['completed'],
    'completed': [],
    'cancelled': [],
  };

  createOrder(order: Order): Order {
    this.orders.set(order.id, order);

    // If dine-in, assign to table
    if (order.tableNumber && this.tables.has(order.tableNumber)) {
      const table = this.tables.get(order.tableNumber)!;
      table.isOccupied = true;
      table.currentOrderId = order.id;
      table.runningTotal = (table.runningTotal || 0) + order.totalAmount;
    }

    return order;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  getAllOrders(status?: OrderStatus, limit: number = 100, page: number = 1): { orders: Order[]; total: number } {
    let all = Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (status) {
      all = all.filter(o => o.status === status);
    }
    const start = (page - 1) * limit;
    return {
      orders: all.slice(start, start + limit),
      total: all.length,
    };
  }

  updateOrderStatus(id: string, newStatus: OrderStatus): Order {
    const order = this.orders.get(id);
    if (!order) {
      throw new AppError(`Order ${id} not found`, 404, 'NOT_FOUND');
    }

    if (order.status === newStatus) {
      return order; // No-op
    }

    const allowed = MemoryDataStore.ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Invalid state transition: Cannot change order status from '${order.status}' to '${newStatus}'. Allowed: ${allowed.join(', ') || 'None (terminal)'}`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if ((newStatus === 'completed' || newStatus === 'cancelled') && order.tableNumber) {
      const table = this.tables.get(order.tableNumber);
      if (table && table.currentOrderId === order.id) {
        table.isOccupied = false;
        table.currentOrderId = undefined;
        table.runningTotal = 0;
      }
    }

    return order;
  }

  processRefund(orderId: string, amount: number, reason: string): Order {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new AppError(`Order ${orderId} not found`, 404, 'NOT_FOUND');
    }
    if (order.paymentStatus === 'refunded') {
      throw new AppError(`Order ${orderId} has already been fully refunded.`, 400, 'ALREADY_REFUNDED');
    }
    if (amount <= 0 || amount > order.totalAmount) {
      throw new AppError(`Refund amount ₹${amount} must be between ₹1 and order total ₹${order.totalAmount}.`, 400, 'INVALID_REFUND_AMOUNT');
    }

    order.paymentStatus = 'refunded';
    if (order.status !== 'completed') {
      order.status = 'cancelled';
    }
    order.updatedAt = new Date().toISOString();

    return order;
  }

  // === TABLE BOOKINGS & CONCURRENCY SLOT ENGINE ===
  lockSlot(date: string, timeSlot: string, partySize: number, bookingId: string): { success: boolean; expiresAt?: string; message?: string } {
    const lockKey = `${date}_${timeSlot}`;
    const now = Date.now();

    // Clean expired locks
    for (const [key, lock] of this.slotLocks.entries()) {
      if (lock.expiresAt < now) {
        this.slotLocks.delete(key);
      }
    }

    // Count active bookings for slot
    let activeBookingsForSlot = 0;
    for (const b of this.bookings.values()) {
      if (b.date === date && b.timeSlot === timeSlot && b.status !== 'cancelled' && b.status !== 'no-show') {
        activeBookingsForSlot++;
      }
    }

    // Count active temporary unexpired locks for this date_timeSlot
    let activeLocksForSlot = 0;
    for (const [key, lock] of this.slotLocks.entries()) {
      if (key.startsWith(`${lockKey}:`) && lock.expiresAt > now && lock.bookingId !== bookingId) {
        activeLocksForSlot++;
      }
    }

    const totalCommitted = activeBookingsForSlot + activeLocksForSlot;
    if (totalCommitted >= this.settings.maxCapacityPerSlot) {
      return {
        success: false,
        message: `All tables for ${timeSlot} on ${date} are fully committed (${totalCommitted}/${this.settings.maxCapacityPerSlot}). Please select another slot.`,
      };
    }

    const lockDurationMs = 5 * 60 * 1000; // 5 minutes hold
    const expiresAt = now + lockDurationMs;

    this.slotLocks.set(`${lockKey}:${bookingId}`, { bookingId, expiresAt });

    return {
      success: true,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  createBooking(booking: TableBooking): TableBooking {
    this.bookings.set(booking.id, booking);
    // Release hold
    const lockKeyPrefix = `${booking.date}_${booking.timeSlot}:`;
    for (const key of this.slotLocks.keys()) {
      if (key.startsWith(lockKeyPrefix)) {
        this.slotLocks.delete(key);
      }
    }
    return booking;
  }

  getBookingById(id: string): TableBooking | undefined {
    return this.bookings.get(id) || Array.from(this.bookings.values()).find(b => b.bookingRef === id);
  }

  getAllBookings(date?: string, status?: BookingStatus, limit: number = 100, page: number = 1): { bookings: TableBooking[]; total: number } {
    let all = Array.from(this.bookings.values()).sort(
      (a, b) => new Date(b.date + ' ' + b.timeSlot).getTime() - new Date(a.date + ' ' + a.timeSlot).getTime()
    );
    if (date) {
      all = all.filter(b => b.date === date);
    }
    if (status) {
      all = all.filter(b => b.status === status);
    }
    const start = (page - 1) * limit;
    return {
      bookings: all.slice(start, start + limit),
      total: all.length,
    };
  }

  updateBookingStatus(id: string, newStatus: BookingStatus): TableBooking {
    const booking = this.getBookingById(id);
    if (!booking) {
      throw new AppError(`Booking ${id} not found`, 404, 'NOT_FOUND');
    }
    booking.status = newStatus;
    return booking;
  }

  // === TABLES & ALERTS ===
  getTables(): TableStatus[] {
    return Array.from(this.tables.values());
  }

  getTableByNumber(tableNumber: number): TableStatus | undefined {
    return this.tables.get(tableNumber);
  }

  setTableServiceAlert(tableNumber: number, action: 'waiter' | 'water' | 'bill' | 'clear', active: boolean): TableStatus {
    const table = this.tables.get(tableNumber);
    if (!table) {
      throw new AppError(`Table #${tableNumber} not found`, 404, 'NOT_FOUND');
    }

    if (action === 'clear') {
      table.waiterCallActive = false;
      table.waterRequested = false;
      table.billRequested = false;
      table.activeAlerts = [];
      return table;
    }

    if (action === 'waiter') table.waiterCallActive = active;
    if (action === 'water') table.waterRequested = active;
    if (action === 'bill') table.billRequested = active;

    if (!table.activeAlerts) table.activeAlerts = [];
    if (active) {
      table.activeAlerts.push({
        type: action === 'waiter' ? 'call_waiter' : action,
        createdAt: new Date().toISOString(),
      });
    } else {
      table.activeAlerts = table.activeAlerts.filter(a => a.type !== (action === 'waiter' ? 'call_waiter' : action));
    }

    return table;
  }

  // === REPORTS & METRICS (IST TIMEZONE AGGREGATION) ===
  getReports(startDate?: string, endDate?: string): ReportSummary {
    const orders = Array.from(this.orders.values());
    const filtered = orders.filter(o => {
      const orderDate = o.createdAt.split('T')[0];
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      return true;
    });

    let totalRevenue = 0;
    const ordersByType: Record<string, number> = {};
    const ordersByStatus: Record<string, number> = {};
    const itemSales: Map<string, { menuItemId: string; name: string; quantity: number; revenue: number }> = new Map();

    for (const ord of filtered) {
      if (ord.status !== 'cancelled') {
        totalRevenue += ord.totalAmount || 0;
      }
      ordersByType[ord.orderType] = (ordersByType[ord.orderType] || 0) + 1;
      ordersByStatus[ord.status] = (ordersByStatus[ord.status] || 0) + 1;

      for (const it of ord.items) {
        const existing = itemSales.get(it.menuItemId) || {
          menuItemId: it.menuItemId,
          name: it.name,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += it.quantity;
        existing.revenue += it.itemTotal;
        itemSales.set(it.menuItemId, existing);
      }
    }

    const topItems = Array.from(itemSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const averageOrderValue = filtered.length > 0 ? Math.round(totalRevenue / filtered.length) : 0;
    const occupiedTables = Array.from(this.tables.values()).filter(t => t.isOccupied).length;

    return {
      period: `${startDate || 'all'} to ${endDate || 'now'}`,
      totalRevenue,
      ordersCount: filtered.length,
      averageOrderValue,
      ordersByType,
      ordersByStatus,
      topItems,
      occupiedTablesCount: occupiedTables,
      totalTablesCount: this.tables.size,
    };
  }

  // Formula-injection-sanitized CSV export
  private sanitizeCsvCell(value: any): string {
    if (value === null || value === undefined) return '';
    let str = String(value).replace(/"/g, '""');
    // Prevent spreadsheet formula injection (=, +, -, @, \t, \r)
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    return `"${str}"`;
  }

  exportReportsCsv(startDate?: string, endDate?: string): string {
    const orders = Array.from(this.orders.values()).filter(o => {
      const d = o.createdAt.split('T')[0];
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });

    const headers = ['Order ID', 'Date (UTC)', 'Customer Name', 'Phone', 'Type', 'Table', 'Status', 'Payment Method', 'Payment Status', 'Total (INR)'];
    const rows = orders.map(o => [
      this.sanitizeCsvCell(o.id),
      this.sanitizeCsvCell(o.createdAt),
      this.sanitizeCsvCell(o.customerName),
      this.sanitizeCsvCell(o.customerPhone),
      this.sanitizeCsvCell(o.orderType),
      this.sanitizeCsvCell(o.tableNumber || '-'),
      this.sanitizeCsvCell(o.status),
      this.sanitizeCsvCell(o.paymentMethod),
      this.sanitizeCsvCell(o.paymentStatus),
      this.sanitizeCsvCell(o.totalAmount),
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  }

  exportMenuCsv(): string {
    const items = this.menuItems.filter(i => !i.deletedAt);
    const headers = ['ID', 'Name', 'Slug', 'Category', 'Price (INR)', 'Is Available', 'Prep Time (mins)', 'Description', 'Tags'];
    const rows = items.map(i => [
      this.sanitizeCsvCell(i.id),
      this.sanitizeCsvCell(i.name),
      this.sanitizeCsvCell(i.slug),
      this.sanitizeCsvCell(i.category),
      this.sanitizeCsvCell(i.price),
      this.sanitizeCsvCell(i.isAvailable ? 'YES' : 'NO'),
      this.sanitizeCsvCell(i.prepTimeMinutes),
      this.sanitizeCsvCell(i.description),
      this.sanitizeCsvCell((i.tags || []).join(';')),
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  }
}

export const store = new MemoryDataStore();
