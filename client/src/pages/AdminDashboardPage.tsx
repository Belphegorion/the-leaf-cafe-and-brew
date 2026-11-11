import React, { useState, useEffect } from 'react';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { TheLeafMark } from '../components/brand/TheLeafMark';
import type { Order, OrderStatus, TableStatus, MenuItem } from '../../../shared/types';

type AdminViewRole = 'manager' | 'kds' | 'floor' | 'qr_generator';

export const AdminDashboardPage: React.FC = () => {
  const [role, setRole] = useState<AdminViewRole>('manager');
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll / load backend state
  const loadDashboardData = async () => {
    try {
      const [ordersRes, tablesRes, menuRes] = await Promise.all([
        fetch('/api/v1/orders'),
        fetch('/api/v1/tables'),
        fetch('/api/v1/menu'),
      ]);

      if (ordersRes.ok) {
        const o = await ordersRes.json();
        setOrders(o.orders || o.data || []);
      }
      if (tablesRes.ok) {
        const t = await tablesRes.json();
        setTables(t.tables || t.data || []);
      }
      if (menuRes.ok) {
        const m = await menuRes.json();
        setMenuItems(m.items || m.data || []);
      }
    } catch (e) {
      console.error('Failed to load admin data', e);
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
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(ord => (ord.id === orderId ? { ...ord, status } : ord))
        );
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  // Toggle Menu Item Availability (86 / In Stock)
  const handleToggleAvailability = async (item: MenuItem) => {
    const nextAvail = !item.isAvailable;
    try {
      const res = await fetch(`/api/v1/menu/items/${item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: nextAvail }),
      });
      if (res.ok) {
        setMenuItems(prev =>
          prev.map(m => (m.id === item.id ? { ...m, isAvailable: nextAvail } : m))
        );
      }
    } catch (e) {
      console.error('Failed to toggle availability', e);
    }
  };

  // Clear Table Alert
  const handleClearTableAlert = async (tableNum: number) => {
    try {
      const res = await fetch(`/api/v1/tables/${tableNum}/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'clear' }),
      });
      if (res.ok) {
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
      }
    } catch (e) {
      console.error('Failed to clear alert', e);
    }
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
    <main className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row items-center justify-between pb-6 mb-8 border-b border-[#325736]/20 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#5E8662] dark:text-[#A3C2A5]">
              Real-time Operations Portal
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
            The Leaf Control Center
          </h1>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap items-center bg-[#EEF5EE] dark:bg-[#142318] p-1.5 rounded-2xl border border-[#325736]/30 gap-1">
          {[
            { id: 'manager' as const, label: 'Manager Overview', icon: 'sparkles' },
            { id: 'kds' as const, label: 'Kitchen KDS', icon: 'cup' },
            { id: 'floor' as const, label: 'Floor & Tables', icon: 'table' },
            { id: 'qr_generator' as const, label: 'QR Print Sheets', icon: 'qr' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRole(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                role === tab.id
                  ? 'bg-[#325736] text-white shadow-sm'
                  : 'text-[#142318]/70 dark:text-[#F7FBFA]/70 hover:text-[#142318] dark:hover:text-white'
              }`}
            >
              <MonolineIcon name={tab.icon as any} size={14} color={role === tab.id ? '#FFF' : 'currentColor'} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-[#5E8662]">Connecting to cafe services...</div>
      ) : (
        <div>
          {/* VIEW 1: MANAGER OVERVIEW */}
          {role === 'manager' && (
            <div className="space-y-8">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-[#5E8662] dark:text-[#A3C2A5]">
                    Total Revenue Today
                  </div>
                  <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums mt-1">
                    ₹{totalRevenue}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Est. sales volume</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-[#5E8662] dark:text-[#A3C2A5]">
                    Active Live Orders
                  </div>
                  <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums mt-1">
                    {activeOrdersCount}
                  </div>
                  <div className="text-[10px] text-[#5E8662] mt-0.5">Queued / In Kitchen</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-[#5E8662] dark:text-[#A3C2A5]">
                    Occupied Tables
                  </div>
                  <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums mt-1">
                    {occupiedTablesCount} / {tables.length}
                  </div>
                  <div className="text-[10px] text-[#5E8662] mt-0.5">Indoor sanctuary seats</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-[#5E8662] dark:text-[#A3C2A5]">
                    Google Rating Trust
                  </div>
                  <div className="text-2xl font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums mt-1">
                    ★ 4.9
                  </div>
                  <div className="text-[10px] text-[#5E8662] mt-0.5">646 Bhopal reviews</div>
                </div>
              </div>

              {/* Menu Item 86 / Out of Stock Manager */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
                      Quick 86 / Availability Control
                    </h2>
                    <p className="text-xs text-[#5E8662] dark:text-[#A3C2A5]">
                      Toggle items out-of-stock when fresh ingredient batches run low
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#5E8662]">{menuItems.length} items registered</span>
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
                          <div className="text-[10px] text-[#5E8662] dark:text-[#A3C2A5]">₹{item.price}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
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
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                              Ready Hot
                            </span>
                          </div>

                          <div className="text-xs">
                            {ord.customerName || ord.customer?.name} ({ord.customerPhone || ord.customer?.phone})
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'served')}
                            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
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
                <p className="text-xs text-[#5E8662] dark:text-[#A3C2A5]">
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
                        <span className="text-[10px] text-[#5E8662] dark:text-[#A3C2A5]">
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
                        <div className="text-[10px] uppercase font-semibold text-[#5E8662] dark:text-[#A3C2A5]">
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
                  <p className="text-xs text-[#5E8662] dark:text-[#A3C2A5]">
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
                        <div className="text-[10px] text-[#5E8662] uppercase tracking-wider mt-0.5">
                          Scan to View Menu &amp; Order
                        </div>
                      </div>

                      <div className="text-[9px] text-[#5E8662]/80 border-t border-[#325736]/15 pt-2">
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
