import React, { useState, useEffect } from 'react';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { TheLeafMark } from '../components/brand/TheLeafMark';
import { FALLBACK_MENU_ITEMS } from '../data/fallbackMenu';
import type { Order, OrderStatus, TableStatus, MenuItem, SeatingPreference } from '../../../shared/types';

type AdminViewRole = 'manager' | 'kds' | 'floor' | 'qr_generator';

const FALLBACK_TABLES: TableStatus[] = Array.from({ length: 12 }, (_, i) => {
  const tableNum = i + 1;
  const isOccupied = [2, 5, 8].includes(tableNum);
  const section: SeatingPreference = tableNum <= 4 ? 'indoor-main' : tableNum <= 8 ? 'arched-window' : 'quiet-corner';
  return {
    tableNumber: tableNum,
    capacity: tableNum <= 4 ? 2 : tableNum <= 8 ? 4 : 6,
    section,
    isOccupied,
    currentOrderId: isOccupied ? `ORD-${9800 + tableNum}` : undefined,
    runningTotal: isOccupied ? 680 : undefined,
    waiterCallActive: tableNum === 5,
    waterRequested: false,
    billRequested: false,
    activeAlerts: tableNum === 5 ? [{ type: 'call_waiter', createdAt: new Date().toISOString() }] : [],
  };
});

const FALLBACK_ORDERS: Order[] = [
  {
    id: 'ORD-9821',
    orderNumber: 'ORD-9821',
    orderType: 'dine-in-table',
    status: 'preparing',
    customerName: 'Aarav S.',
    customerPhone: '9876543210',
    tableNumber: 5,
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
    estimatedPrepMinutes: 18,
    paymentMethod: 'pay-at-counter',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD-9822',
    orderNumber: 'ORD-9822',
    orderType: 'takeaway-pickup',
    status: 'received',
    customerName: 'Priya M.',
    customerPhone: '9823456789',
    items: [
      {
        menuItemId: 'sig-7',
        name: 'Single-Origin Pour Over',
        quantity: 1,
        unitPrice: 220,
        selectedCustomizations: [],
        itemTotal: 220,
      },
    ],
    subtotal: 220,
    gstAmount: 11,
    tipAmount: 0,
    discountAmount: 0,
    totalAmount: 231,
    estimatedPrepMinutes: 8,
    paymentMethod: 'razorpay',
    paymentStatus: 'captured',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const AdminDashboardPage: React.FC = () => {
  const [role, setRole] = useState<AdminViewRole>('manager');
  const [orders, setOrders] = useState<Order[]>(FALLBACK_ORDERS);
  const [tables, setTables] = useState<TableStatus[]>(FALLBACK_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(FALLBACK_MENU_ITEMS);
  const [loading, setLoading] = useState(false);

  // Poll / load backend state
  const loadDashboardData = async () => {
    try {
      const [ordersRes, tablesRes, menuRes] = await Promise.all([
        fetch('/api/v1/orders').catch(() => null),
        fetch('/api/v1/tables').catch(() => null),
        fetch('/api/v1/menu').catch(() => null),
      ]);

      if (ordersRes && ordersRes.ok) {
        const o = await ordersRes.json();
        const loadedOrders = o.orders || o.data || [];
        if (loadedOrders.length > 0) setOrders(loadedOrders);
      }
      if (tablesRes && tablesRes.ok) {
        const t = await tablesRes.json();
        const loadedTables = t.tables || t.data || [];
        if (loadedTables.length > 0) setTables(loadedTables);
      }
      if (menuRes && menuRes.ok) {
        const m = await menuRes.json();
        const loadedMenu = m.items || m.data || [];
        if (loadedMenu.length > 0) setMenuItems(loadedMenu);
      }
    } catch (e) {
      console.warn('Backend unavailable; using resilient fallback data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 6000); // 6s poll
    return () => clearInterval(interval);
  }, []);

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.warn('Failed to sync status to backend', e);
    }
    // Optimistic local update
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  // Toggle Menu Item Availability (86 / In Stock)
  const handleToggleAvailability = async (item: MenuItem) => {
    const nextAvail = !item.isAvailable;
    try {
      await fetch(`/api/v1/menu/items/${item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: nextAvail }),
      });
    } catch (e) {
      console.warn('Failed to sync availability to backend', e);
    }
    // Optimistic local update
    setMenuItems(prev =>
      prev.map(m => (m.id === item.id ? { ...m, isAvailable: nextAvail } : m))
    );
  };

  // Clear Table Alert
  const handleClearTableAlert = async (tableNum: number) => {
    try {
      await fetch(`/api/v1/tables/${tableNum}/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'clear' }),
      });
    } catch (e) {
      console.warn('Failed to sync alert clear to backend', e);
    }
    // Optimistic local update
    setTables(prev =>
      prev.map(t =>
        t.tableNumber === tableNum
          ? {
              ...t,
              activeAlerts: [],
              waiterCallActive: false,
              waterRequested: false,
              billRequested: false,
            }
          : t
      )
    );
  };

  // Calculations for Manager
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount || o.total || 0 : 0),
    0
  );
  const activeOrdersCount = orders.filter(
    o => o.status === 'received' || o.status === 'preparing'
  ).length;
  const occupiedTablesCount = tables.filter(t => t.isOccupied).length;

  return (
    <main id="main-content" className="min-h-[100dvh] pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row items-center justify-between pb-6 mb-8 border-b border-[#325736]/20 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#38483C] dark:text-[#A3C2A5]">
              Real-time Operations Portal
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
            The Leaf Control Center
          </h1>
        </div>

        {/* Role Selector Tabs */}
        <div
          role="tablist"
          aria-label="Admin Operations Views"
          className="flex flex-wrap items-center bg-[#EAE0D0] dark:bg-[#142318] p-1.5 rounded-2xl border border-[#D8C7AA] dark:border-[#325736]/30 gap-1"
        >
          {[
            { id: 'manager' as const, label: 'Manager Overview', icon: 'sparkles' },
            { id: 'kds' as const, label: 'Kitchen KDS', icon: 'cup' },
            { id: 'floor' as const, label: 'Floor & Tables', icon: 'table' },
            { id: 'qr_generator' as const, label: 'QR Print Sheets', icon: 'qr' },
          ].map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={role === tab.id}
              type="button"
              onClick={() => setRole(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all touch-manipulation focus-visible:outline-2 focus-visible:outline-[#28492C] ${
                role === tab.id
                  ? 'bg-[#28492C] text-white shadow-sm'
                  : 'text-[#1F2A22] dark:text-[#F7FBFA] hover:text-[#325736] dark:hover:text-white'
              }`}
            >
              <MonolineIcon name={tab.icon as any} size={14} color={role === tab.id ? '#FFF' : 'currentColor'} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-[#38483C]">Connecting to cafe services...</div>
      ) : (
        <div>
          {/* VIEW 1: MANAGER OVERVIEW */}
          {role === 'manager' && (
            <div className="space-y-8">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-[#38483C] dark:text-[#A3C2A5]">
                    Total Revenue Today
                  </div>
                  <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums mt-1">
                    ₹{totalRevenue}
                  </div>
                  <div className="text-[10px] text-[#325736] dark:text-[#A3C2A5] font-semibold mt-0.5">Est. sales volume</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-[#38483C] dark:text-[#A3C2A5]">
                    Active Live Orders
                  </div>
                  <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums mt-1">
                    {activeOrdersCount}
                  </div>
                  <div className="text-[10px] text-[#38483C] mt-0.5">Queued / In Kitchen</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-[#38483C] dark:text-[#A3C2A5]">
                    Occupied Tables
                  </div>
                  <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums mt-1">
                    {occupiedTablesCount} / {tables.length}
                  </div>
                  <div className="text-[10px] text-[#38483C] mt-0.5">Indoor sanctuary seats</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-[#38483C] dark:text-[#A3C2A5]">
                    Google Rating Trust
                  </div>
                  <div className="text-2xl font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums mt-1">
                    ★ 4.9
                  </div>
                  <div className="text-[10px] text-[#38483C] mt-0.5">646 Bhopal reviews</div>
                </div>
              </div>

              {/* Menu Item 86 / Out of Stock Manager */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
                      Quick 86 / Availability Control
                    </h2>
                    <p className="text-xs text-[#38483C] dark:text-[#A3C2A5]">
                      Toggle items out-of-stock when fresh ingredient batches run low
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#38483C]">{menuItems.length} items registered</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                  {menuItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#325736]/15 bg-[#F7FBFA] dark:bg-[#142318]"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA] line-clamp-1">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-[#38483C] dark:text-[#A3C2A5]">₹{item.price}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          item.isAvailable
                            ? 'bg-[#325736] text-white hover:bg-[#28492C]'
                            : 'bg-red-800 text-white hover:bg-red-900'
                        }`}
                      >
                        {item.isAvailable ? 'In Stock' : '86 / Sold Out'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: KITCHEN DISPLAY SYSTEM (KDS) */}
          {role === 'kds' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-black text-white p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    KDS Active Touch Screen
                  </span>
                </div>
                <div className="text-xs font-mono">
                  {orders.filter(o => o.status !== 'served' && o.status !== 'cancelled').length} Active Tickets
                </div>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Received / New */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500">
                    <span className="font-display uppercase text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">
                      1. New Orders ({orders.filter(o => o.status === 'received').length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {orders
                      .filter(o => o.status === 'received')
                      .map(ord => (
                        <div
                          key={ord.id}
                          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3 shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono font-bold text-xs">#{ord.id.slice(-5).toUpperCase()}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                              {(ord.diningType || ord.orderType || 'takeaway').replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs border-y border-amber-200 dark:border-amber-900/50 py-2">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="font-bold">{item.quantity}× {item.name}</span>
                                {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                                  <span className="text-[10px] text-amber-700 dark:text-amber-300">
                                    {item.selectedCustomizations.map(c => c.selectedOptionName).join(', ')}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {ord.specialInstructions && (
                            <div className="p-2 rounded bg-amber-100 dark:bg-amber-900/60 text-[10px] text-amber-900 dark:text-amber-100">
                              <strong>Note:</strong> {ord.specialInstructions}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')}
                            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            Start Brewing / Cooking →
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 2. Preparing / In Kitchen */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-blue-500">
                    <span className="font-display uppercase text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">
                      2. In Preparation ({orders.filter(o => o.status === 'preparing').length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {orders
                      .filter(o => o.status === 'preparing')
                      .map(ord => (
                        <div
                          key={ord.id}
                          className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800 space-y-3 shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono font-bold text-xs">#{ord.id.slice(-5).toUpperCase()}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {ord.tableNumber ? `Table ${ord.tableNumber}` : 'Takeaway'}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs border-y border-blue-200 dark:border-blue-900/50 py-2">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="font-bold">{item.quantity}× {item.name}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'ready')}
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            Mark Ready at Pass ✓
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 3. Ready / At Pass */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
                    <span className="font-display uppercase text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">
                      3. Ready for Server / Pickup ({orders.filter(o => o.status === 'ready').length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {orders
                      .filter(o => o.status === 'ready')
                      .map(ord => (
                        <div
                          key={ord.id}
                          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-3 shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono font-bold text-xs">#{ord.id.slice(-5).toUpperCase()}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#325736] text-white">
                              Ready Hot
                            </span>
                          </div>

                          <div className="text-xs">
                            {ord.customerName || ord.customer?.name} ({ord.customerPhone || ord.customer?.phone})
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'served')}
                            className="w-full py-2.5 rounded-xl bg-[#325736] hover:bg-[#28492C] text-white font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            Mark Served / Handed Over
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: FLOOR & TABLE PLAN */}
          {role === 'floor' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
                  Botanical Dining Sanctuary • Floor Matrix
                </h2>
                <p className="text-xs text-[#38483C] dark:text-[#A3C2A5]">
                  12 Boutique Tables in Arera Colony
                </p>
              </div>

              {/* Floor Plan Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tables.map(table => {
                  const hasAlerts =
                    (table.activeAlerts && table.activeAlerts.length > 0) ||
                    table.waiterCallActive ||
                    table.waterRequested ||
                    table.billRequested;

                  const alertType = table.activeAlerts?.[0]?.type ||
                    (table.billRequested ? 'bill' : table.waterRequested ? 'water' : 'waiter');

                  return (
                    <div
                      key={table.tableNumber}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        hasAlerts
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/40 ring-2 ring-red-400'
                          : table.isOccupied
                          ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-[#325736]/20 bg-white dark:bg-[#1F3A24]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display font-bold text-lg text-[#142318] dark:text-[#F7FBFA]">
                          T-{table.tableNumber}
                        </span>
                        <span className="text-[10px] text-[#38483C] dark:text-[#A3C2A5]">
                          Cap: {table.capacity}p
                        </span>
                      </div>

                      <div className="text-xs text-[#142318] dark:text-[#F7FBFA] mb-3 capitalize">
                        {String(table.section).replace(/[-_]/g, ' ')}
                      </div>

                      {hasAlerts ? (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-red-600 dark:text-red-300">
                            Alert: {String(alertType).toUpperCase()}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleClearTableAlert(table.tableNumber)}
                            className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase"
                          >
                            Resolve Alert
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] uppercase font-semibold text-[#38483C] dark:text-[#A3C2A5]">
                          {table.isOccupied ? 'Occupied / Dining' : 'Available'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: PRINTABLE TABLE QR SHEETS */}
          {role === 'qr_generator' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
                    Printable Table QR Codes (Tables 1 – 12)
                  </h2>
                  <p className="text-xs text-[#38483C] dark:text-[#A3C2A5]">
                    Laminate and affix to the wooden acrylic table stands for instant customer contactless ordering.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-full bg-[#325736] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow hover:bg-[#284A2D]"
                >
                  Print All QR Stands
                </button>
              </div>

              {/* Printable Grid of Stand Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {tables.map(table => {
                  const targetUrl = `${window.location.origin}/t/${table.tableNumber}`;
                  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    targetUrl
                  )}&color=32-57-36&bgcolor=247-251-250`;

                  return (
                    <div
                      key={table.tableNumber}
                      className="p-6 rounded-3xl bg-[#F7FBFA] border-2 border-[#325736] text-center space-y-4 shadow-md text-[#142318]"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <TheLeafMark size={24} strokeColor="#325736" />
                        <span className="font-display uppercase text-xs font-bold tracking-widest text-[#325736]">
                          The Leaf • Bhopal
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-2xl inline-block border border-[#325736]/20 shadow-inner">
                        <img
                          src={qrApiUrl}
                          alt={`QR Code for Table ${table.tableNumber}`}
                          className="w-36 h-36 mx-auto"
                        />
                      </div>

                      <div>
                        <div className="font-display uppercase text-xl font-bold tracking-wider text-[#325736]">
                          Table {table.tableNumber}
                        </div>
                        <div className="text-[10px] text-[#38483C] uppercase tracking-wider mt-0.5">
                          Scan to View Menu &amp; Order
                        </div>
                      </div>

                      <div className="text-[9px] text-[#38483C]/80 border-t border-[#325736]/15 pt-2">
                        100% Pure Vegetarian • Free WiFi Available
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
};
