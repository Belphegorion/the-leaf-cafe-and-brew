"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const seedData_1 = require("../data/seedData");
/**
 * High-Reliability Data Store for The Leaf – Cafe and Brew.
 * Maintains in-memory persistent cache loaded with realistic Bhopal cafe seed data,
 * with atomic slot-locking and fast lookup.
 */
class MemoryDataStore {
    categories = [...seedData_1.MENU_CATEGORIES];
    menuItems = [...seedData_1.INITIAL_MENU_ITEMS];
    orders = new Map();
    bookings = new Map();
    tables = new Map();
    slotLocks = new Map();
    constructor() {
        this.initTables();
    }
    initTables() {
        // Initialize 12 boutique cafe tables with varying capacities and sections
        const defaultTables = [
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
    getCategories() {
        return this.categories;
    }
    getMenuItems(category, search, tag) {
        let result = this.menuItems;
        if (category) {
            result = result.filter(item => item.category === category);
        }
        if (tag) {
            result = result.filter(item => item.tags.includes(tag));
        }
        if (search) {
            const q = search.toLowerCase().trim();
            result = result.filter(item => item.name.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.tags.some(t => t.toLowerCase().includes(q)));
        }
        return result;
    }
    getMenuItemById(id) {
        return this.menuItems.find(item => item.id === id);
    }
    toggleMenuItemAvailability(id) {
        const item = this.getMenuItemById(id);
        if (item) {
            item.isAvailable = !item.isAvailable;
        }
        return item;
    }
    // === ORDERS ===
    createOrder(order) {
        this.orders.set(order.id, order);
        // If dine-in, link to table
        if (order.tableNumber && this.tables.has(order.tableNumber)) {
            const table = this.tables.get(order.tableNumber);
            table.isOccupied = true;
            table.currentOrderId = order.id;
            table.runningTotal = (table.runningTotal || 0) + order.totalAmount;
        }
        return order;
    }
    getOrderById(id) {
        return this.orders.get(id);
    }
    getAllOrders() {
        return Array.from(this.orders.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    updateOrderStatus(id, status) {
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
    lockSlot(date, timeSlot, partySize, bookingId) {
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
    createBooking(booking) {
        this.bookings.set(booking.id, booking);
        // Release slot lock once booking is finalized
        const lockKey = `${booking.date}_${booking.timeSlot}`;
        this.slotLocks.delete(lockKey);
        return booking;
    }
    getBookingById(id) {
        return this.bookings.get(id);
    }
    getAllBookings() {
        return Array.from(this.bookings.values()).sort((a, b) => new Date(b.date + ' ' + b.timeSlot).getTime() - new Date(a.date + ' ' + a.timeSlot).getTime());
    }
    updateBookingStatus(id, status) {
        const b = this.bookings.get(id);
        if (b) {
            b.status = status;
        }
        return b;
    }
    // === TABLES & AT-TABLE CALLS ===
    getTables() {
        return Array.from(this.tables.values());
    }
    getTableByNumber(tableNumber) {
        return this.tables.get(tableNumber);
    }
    setTableServiceAlert(tableNumber, action, active) {
        const table = this.tables.get(tableNumber);
        if (table) {
            if (action === 'waiter')
                table.waiterCallActive = active;
            if (action === 'water')
                table.waterRequested = active;
            if (action === 'bill')
                table.billRequested = active;
        }
        return table;
    }
}
exports.store = new MemoryDataStore();
