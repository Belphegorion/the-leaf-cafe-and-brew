import { MenuItem, TableBooking, Order, TableStatus } from '../../../shared/types';
import { INITIAL_MENU_ITEMS, MENU_CATEGORIES, MenuCategoryDef } from '../data/seedData';

/**
 * High-Reliability Data Store for The Leaf – Cafe and Brew.
 * Maintains in-memory persistent cache loaded with realistic Bhopal cafe seed data,
 * with atomic slot-locking and fast lookup.
 */
class MemoryDataStore {
  private categories: MenuCategoryDef[] = [...MENU_CATEGORIES];
  private menuItems: MenuItem[] = [...INITIAL_MENU_ITEMS];
  private orders: Map<string, Order> = new Map();
  private bookings: Map<string, TableBooking> = new Map();
  private tables: Map<number, TableStatus> = new Map();
  private slotLocks: Map<string, { bookingId: string; expiresAt: number }> = new Map();

  constructor() {
    this.initTables();
  }

  private initTables() {
    // Initialize 12 boutique cafe tables with varying capacities and sections
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

  // === MENU ===
  getCategories(): MenuCategoryDef[] {
    return this.categories;
  }

  getMenuItems(category?: string, search?: string, tag?: string): MenuItem[] {
    let result = this.menuItems;

    if (category) {
      result = result.filter(item => item.category === category);
    }
    if (tag) {
      result = result.filter(item => item.tags.includes(tag as any));
    }
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getMenuItemById(id: string): MenuItem | undefined {
    return this.menuItems.find(item => item.id === id);
  }

  toggleMenuItemAvailability(id: string): MenuItem | undefined {
    const item = this.getMenuItemById(id);
    if (item) {
      item.isAvailable = !item.isAvailable;
    }
    return item;
  }

  // === ORDERS ===
  createOrder(order: Order): Order {
    this.orders.set(order.id, order);

    // If dine-in, link to table
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

  getAllOrders(): Order[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateOrderStatus(id: string, status: Order['status']): Order | undefined {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();

      if (status === 'completed' && order.tableNumber) {
        const table = this.tables.get(order.tableNumber);
        if (table) {
          table.isOccupied = false;
          table.currentOrderId = undefined;
          table.runningTotal = 0;
        }
      }
    }
    return order;
  }

  // === TABLE BOOKINGS & 5-MIN REDIS-STYLE SLOT LOCKING ===
  lockSlot(date: string, timeSlot: string, partySize: number, bookingId: string): { success: boolean; expiresAt?: string; message?: string } {
    const lockKey = `${date}_${timeSlot}`;
    const now = Date.now();

    // Clean expired locks
    for (const [key, lock] of this.slotLocks.entries()) {
      if (lock.expiresAt < now) {
        this.slotLocks.delete(key);
      }
    }

    // Check capacity: max 6 bookings per timeSlot
    let activeBookingsForSlot = 0;
    for (const b of this.bookings.values()) {
      if (b.date === date && b.timeSlot === timeSlot && b.status !== 'cancelled' && b.status !== 'no-show') {
        activeBookingsForSlot++;
      }
    }

    if (activeBookingsForSlot >= 6) {
      return { success: false, message: 'All tables for this time slot are fully committed. Please pick another slot or join waitlist.' };
    }

    const lockDurationMs = 5 * 60 * 1000; // 5 minutes lock
    const expiresAt = now + lockDurationMs;

    this.slotLocks.set(lockKey, { bookingId, expiresAt });

    return {
      success: true,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  createBooking(booking: TableBooking): TableBooking {
    this.bookings.set(booking.id, booking);
    // Release slot lock once booking is finalized
    const lockKey = `${booking.date}_${booking.timeSlot}`;
    this.slotLocks.delete(lockKey);
    return booking;
  }

  getBookingById(id: string): TableBooking | undefined {
    return this.bookings.get(id);
  }

  getAllBookings(): TableBooking[] {
    return Array.from(this.bookings.values()).sort(
      (a, b) => new Date(b.date + ' ' + b.timeSlot).getTime() - new Date(a.date + ' ' + a.timeSlot).getTime()
    );
  }

  updateBookingStatus(id: string, status: TableBooking['status']): TableBooking | undefined {
    const b = this.bookings.get(id);
    if (b) {
      b.status = status;
    }
    return b;
  }

  // === TABLES & AT-TABLE CALLS ===
  getTables(): TableStatus[] {
    return Array.from(this.tables.values());
  }

  getTableByNumber(tableNumber: number): TableStatus | undefined {
    return this.tables.get(tableNumber);
  }

  setTableServiceAlert(tableNumber: number, action: 'waiter' | 'water' | 'bill', active: boolean): TableStatus | undefined {
    const table = this.tables.get(tableNumber);
    if (table) {
      if (action === 'waiter') table.waiterCallActive = active;
      if (action === 'water') table.waterRequested = active;
      if (action === 'bill') table.billRequested = active;
    }
    return table;
  }
}

export const store = new MemoryDataStore();
