import React, { useState, useEffect } from 'react';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { TheLeafMark } from '../components/brand/TheLeafMark';
import { FALLBACK_MENU_ITEMS } from '../data/fallbackMenu';
import type { Order, OrderStatus, TableStatus, MenuItem, SeatingPreference, TableBooking, BookingStatus } from '../../../shared/types';

type AdminViewRole = 'manager' | 'kds' | 'bookings' | 'menu' | 'floor' | 'reports' | 'audit' | 'qr_generator';

interface StaffUserSession {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'kitchen' | 'waiter';
  token: string;
}

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
    id: 'ORD-9821-42',
    orderNumber: 'ORD-9821-42',
    orderType: 'dine-in-table',
    status: 'preparing',
    customerName: 'Aarav Sharma',
    customerPhone: '9826012345',
    tableNumber: 5,
    items: [
      {
        menuItemId: 'p-1',
        name: 'Peri Peri Paneer Pizza',
        quantity: 2,
        unitPrice: 380,
        selectedCustomizations: [],
        itemTotal: 760,
      },
      {
        menuItemId: 'pa-1',
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
    id: 'ORD-9822-19',
    orderNumber: 'ORD-9822-19',
    orderType: 'takeaway-pickup',
    status: 'received',
    customerName: 'Priya Malviya',
    customerPhone: '9823456789',
    items: [
      {
        menuItemId: 'c-1',
        name: 'Single-Origin V60 Pour Over',
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
  // Staff Auth Session State
  const [session, setSession] = useState<StaffUserSession | null>(() => {
    try {
      const saved = localStorage.getItem('theleaf_staff_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loginEmail, setLoginEmail] = useState('manager@theleaf.cafe');
  const [loginPassword, setLoginPassword] = useState('Leaf@Mgr2026');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<AdminViewRole>('manager');
  const [orders, setOrders] = useState<Order[]>(FALLBACK_ORDERS);
  const [tables, setTables] = useState<TableStatus[]>(FALLBACK_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(FALLBACK_MENU_ITEMS);
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Modals state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showImportCsvModal, setShowImportCsvModal] = useState(false);
  const [showKotOrder, setShowKotOrder] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // New Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('coffee');
  const [newItemPrice, setNewItemPrice] = useState(250);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [csvContent, setCsvContent] = useState('');

  const getAuthHeaders = (): Record<string, string> => {
    return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  };

  // Play audio chime using Web Audio API (zero external asset dependency)
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Ignore audio failure
    }
  };

  // Perform Staff Login
  const handleLogin = async (e?: React.FormEvent, roleQuick?: string) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const creds = roleQuick
      ? roleQuick === 'owner'
        ? { email: 'owner@theleaf.cafe', password: 'Leaf@Owner2026' }
        : roleQuick === 'kitchen'
        ? { email: 'kitchen@theleaf.cafe', password: 'Leaf@Kds2026' }
        : roleQuick === 'waiter'
        ? { email: 'waiter@theleaf.cafe', password: 'Leaf@Floor2026' }
        : { email: 'manager@theleaf.cafe', password: 'Leaf@Mgr2026' }
      : { email: loginEmail, password: loginPassword };

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || err.message || 'Login failed. Please verify credentials.');
      }

      const data = await res.json();
      const userSession: StaffUserSession = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
        token: data.data.accessToken,
      };

      setSession(userSession);
      localStorage.setItem('theleaf_staff_session', JSON.stringify(userSession));
      if (userSession.role === 'kitchen') setActiveTab('kds');
      else if (userSession.role === 'waiter') setActiveTab('floor');
      else setActiveTab('manager');
      setFeedbackMsg(`Logged in as ${userSession.name}`);
    } catch (err: any) {
      setAuthError(err.message || 'Network error logging in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('theleaf_staff_session');
    setFeedbackMsg('Logged out safely.');
  };

  // Poll / load backend state
  const loadDashboardData = async () => {
    const authHeaders = getAuthHeaders();

    try {
      const [ordersRes, tablesRes, menuRes, bookingsRes, reportsRes, auditRes] = await Promise.all([
        fetch('/api/v1/orders', { headers: authHeaders }).catch(() => null),
        fetch('/api/v1/tables', { headers: authHeaders }).catch(() => null),
        fetch('/api/v1/menu', { headers: authHeaders }).catch(() => null),
        fetch('/api/v1/bookings', { headers: authHeaders }).catch(() => null),
        fetch('/api/v1/admin/reports', { headers: authHeaders }).catch(() => null),
        fetch('/api/v1/admin/audit-logs', { headers: authHeaders }).catch(() => null),
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
      if (bookingsRes && bookingsRes.ok) {
        const b = await bookingsRes.json();
        setBookings(b.data || []);
      }
      if (reportsRes && reportsRes.ok) {
        const rep = await reportsRes.json();
        setReportsData(rep.data);
      }
      if (auditRes && auditRes.ok) {
        const aud = await auditRes.json();
        setAuditLogs(aud.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, [session]);

  // Update order status with audio feedback
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    playAlertChime();

    try {
      await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      setFeedbackMsg(`Order ${orderId} moved to ${status}`);
    } catch (e) {
      console.warn('Failed to sync status to backend', e);
    }

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
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ isAvailable: nextAvail }),
      });
      setFeedbackMsg(`${item.name} is now ${nextAvail ? 'In Stock' : '86 / Sold Out'}`);
    } catch (e) {
      console.warn('Failed to sync availability to backend', e);
    }

    setMenuItems(prev =>
      prev.map(m => (m.id === item.id ? { ...m, isAvailable: nextAvail } : m))
    );
  };

  // Create New Menu Item
  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || newItemPrice <= 0) return;

    try {
      const res = await fetch('/api/v1/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          name: newItemName,
          category: newItemCategory,
          price: Number(newItemPrice),
          description: newItemDesc || 'Handcrafted botanical delicacy',
          tags: ['bestseller'],
          prepTimeMinutes: 15,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMenuItems(prev => [data.data, ...prev]);
        setShowAddItemModal(false);
        setNewItemName('');
        setNewItemDesc('');
        setFeedbackMsg(`Created menu item: ${data.data.name}`);
      }
    } catch (err) {
      console.warn('Create item failed', err);
    }
  };

  // Delete Menu Item
  const handleDeleteMenuItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove '${name}' from active service?`)) return;

    try {
      await fetch(`/api/v1/menu/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setMenuItems(prev => prev.filter(m => m.id !== id));
      setFeedbackMsg(`Item '${name}' removed from service.`);
    } catch (e) {
      console.warn('Failed to delete menu item', e);
    }
  };

  // Bulk CSV Import
  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent) return;

    try {
      const res = await fetch('/api/v1/menu/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ csvContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg(`CSV Imported: ${data.data.importedCount} items loaded.`);
        setShowImportCsvModal(false);
        loadDashboardData();
      } else {
        alert(data.error?.message || 'CSV Import failed');
      }
    } catch (err) {
      console.warn('CSV Import failed', err);
    }
  };

  // Clear Table Alert
  const handleClearTableAlert = async (tableNum: number) => {
    try {
      await fetch(`/api/v1/tables/${tableNum}/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ action: 'clear' }),
      });
      setFeedbackMsg(`Alert resolved for Table #${tableNum}`);
    } catch (e) {
      console.warn('Failed to clear alert', e);
    }

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

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await fetch(`/api/v1/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status } : b))
      );
      setFeedbackMsg(`Booking ${bookingId} updated to ${status}`);
    } catch (e) {
      console.warn('Failed to update booking', e);
    }
  };

  // Process Refund
  const handleRefund = async (orderId: string, amount: number) => {
    const reason = prompt('Enter reason for managerial refund:', 'Guest request / satisfaction guarantee');
    if (!reason) return;

    try {
      const res = await fetch('/api/v1/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ orderId, amount, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg(`Refund of ₹${amount} recorded for ${orderId}`);
        loadDashboardData();
      } else {
        alert(data.error?.message || 'Refund failed');
      }
    } catch (err) {
      console.warn('Refund error', err);
    }
  };

  // Render Login Gate Screen if not authenticated
  if (!session) {
    return (
      <main id="main-content" className="min-h-[100dvh] pt-28 pb-20 px-4 max-w-lg mx-auto flex items-center justify-center">
        <div className="w-full p-8 rounded-3xl bg-white dark:bg-[#1F3A24] border border-[#325736]/25 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <TheLeafMark size={32} strokeColor="#142318" />
              <span className="font-display uppercase text-xs font-bold tracking-widest text-[#142318] dark:text-[#F7FBFA]">
                The Leaf • Bhopal
              </span>
            </div>
            <h1 className="font-display text-xl uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA]">
              Staff Sanctuary Login
            </h1>
            <p className="text-xs text-[#1F3A24] dark:text-[#E2EEE2]">
              Administrative access is role-gated and strictly audit-logged.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-bold">
              {authError}
            </div>
          )}

          <form onSubmit={e => handleLogin(e)} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#142318] dark:text-[#F7FBFA] mb-1">Staff Email / Username</label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="manager@theleaf.cafe"
                className="w-full p-3 rounded-xl border border-[#325736]/30 bg-[#F7FBFA] dark:bg-[#142318] text-[#142318] dark:text-[#F7FBFA]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#142318] dark:text-[#F7FBFA] mb-1">Security PIN / Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-[#325736]/30 bg-[#F7FBFA] dark:bg-[#142318] text-[#142318] dark:text-[#F7FBFA]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-[#142318] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-all"
            >
              {authLoading ? 'Verifying...' : 'Sign In to Control Center →'}
            </button>
          </form>

          <div className="border-t border-[#325736]/15 pt-4 space-y-2">
            <div className="text-[10px] font-bold text-center uppercase text-[#1F3A24] dark:text-[#A3C2A5]">
              Quick Demo Access
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLogin(undefined, 'manager')}
                className="p-2.5 rounded-xl bg-[#EAE0D0] text-[#142318] text-xs font-bold hover:bg-[#D8C7AA] border border-[#D8C7AA]"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleLogin(undefined, 'kitchen')}
                className="p-2.5 rounded-xl bg-[#EAE0D0] text-[#142318] text-xs font-bold hover:bg-[#D8C7AA] border border-[#D8C7AA]"
              >
                Kitchen KDS
              </button>
              <button
                type="button"
                onClick={() => handleLogin(undefined, 'waiter')}
                className="p-2.5 rounded-xl bg-[#EAE0D0] text-[#142318] text-xs font-bold hover:bg-[#D8C7AA] border border-[#D8C7AA]"
              >
                Floor Steward
              </button>
              <button
                type="button"
                onClick={() => handleLogin(undefined, 'owner')}
                className="p-2.5 rounded-xl bg-[#EAE0D0] text-[#142318] text-xs font-bold hover:bg-[#D8C7AA] border border-[#D8C7AA]"
              >
                Owner
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Calculations for Manager
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount || o.total || 0 : 0),
    0
  );
  const activeOrdersCount = orders.filter(
    o => o.status === 'received' || o.status === 'preparing'
  ).length;
  const occupiedTablesCount = tables.filter(t => t.isOccupied).length;

  const allTabs = [
    { id: 'manager' as const, label: 'Manager Overview', icon: 'sparkles', roles: ['owner', 'manager'] },
    { id: 'kds' as const, label: 'Kitchen KDS', icon: 'cup', roles: ['owner', 'manager', 'kitchen'] },
    { id: 'bookings' as const, label: 'Reservations', icon: 'table', roles: ['owner', 'manager', 'waiter'] },
    { id: 'menu' as const, label: 'Menu Manager', icon: 'spoon', roles: ['owner', 'manager', 'kitchen'] },
    { id: 'floor' as const, label: 'Floor & Tables', icon: 'table', roles: ['owner', 'manager', 'waiter'] },
    { id: 'reports' as const, label: 'Reports & CSV', icon: 'sparkles', roles: ['owner', 'manager'] },
    { id: 'audit' as const, label: 'Audit Trail', icon: 'star', roles: ['owner', 'manager'] },
    { id: 'qr_generator' as const, label: 'QR Print Stands', icon: 'qr', roles: ['owner', 'manager', 'waiter'] },
  ];

  const visibleTabs = allTabs.filter(t => t.roles.includes(session.role));

  return (
    <main id="main-content" className="min-h-[100dvh] pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-8 border-b border-[#325736]/25 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#142318] dark:text-[#E2EEE2]">
              Real-time Operations Portal • Bhopal Sanctuary
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
            The Leaf Control Center
          </h1>
        </div>

        {/* Staff Session Badge & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-[#EAE0D0] dark:bg-[#142318] px-4 py-2 rounded-2xl border border-[#D8C7AA] dark:border-[#325736]/40">
            <div className="text-right">
              <div className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">{session.name}</div>
              <div className="text-[10px] uppercase font-bold text-[#1F3A24] dark:text-[#A3C2A5]">{session.role}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-[#142318] text-white hover:bg-black text-[11px] font-bold transition-all"
            >
              Sign Out
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
              soundEnabled
                ? 'bg-[#142318] text-white border-[#142318]'
                : 'bg-white text-[#142318] border-[#325736]/30'
            }`}
            title={soundEnabled ? 'Kitchen chime on' : 'Kitchen chime muted'}
          >
            {soundEnabled ? '🔔 Chime On' : '🔕 Muted'}
          </button>
        </div>
      </div>

      {/* Operational Feedback Toast */}
      {feedbackMsg && (
        <div className="mb-6 p-3 rounded-2xl bg-emerald-100 border border-emerald-400 text-emerald-950 text-xs font-bold flex items-center justify-between">
          <span>✓ {feedbackMsg}</span>
          <button type="button" onClick={() => setFeedbackMsg('')} className="text-emerald-900 hover:text-black">
            ✕
          </button>
        </div>
      )}

      {/* Role Navigation Tablist */}
      <div
        role="tablist"
        aria-label="Admin Operations Modules"
        className="flex flex-wrap items-center bg-[#EAE0D0] dark:bg-[#142318] p-1.5 rounded-2xl border border-[#D8C7AA] dark:border-[#325736]/30 gap-1 mb-8"
      >
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all touch-manipulation focus-visible:ring-2 focus-visible:ring-[#142318] ${
              activeTab === tab.id
                ? 'bg-[#142318] text-white shadow-sm'
                : 'text-[#142318] dark:text-[#F7FBFA] hover:bg-[#D8C7AA]/50 dark:hover:bg-[#1F3A24]'
            }`}
          >
            <MonolineIcon name={tab.icon as any} size={14} color={activeTab === tab.id ? '#FFF' : '#142318'} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs font-bold text-[#142318]">Connecting to sanctuary services...</div>
      ) : (
        <div>
          {/* TAB 1: MANAGER OVERVIEW */}
          {activeTab === 'manager' && (
            <div className="space-y-8">
              {/* Metric Cards with High Contrast */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/25 shadow-sm">
                  <div className="text-[11px] uppercase font-bold text-[#1F3A24] dark:text-[#A3C2A5]">
                    Total Revenue Today
                  </div>
                  <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums mt-1">
                    ₹{totalRevenue}
                  </div>
                  <div className="text-[10px] text-[#142318] dark:text-[#A3C2A5] font-semibold mt-0.5">Est. sales volume</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/25 shadow-sm">
                  <div className="text-[11px] uppercase font-bold text-[#1F3A24] dark:text-[#A3C2A5]">
                    Active Live Orders
                  </div>
                  <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums mt-1">
                    {activeOrdersCount}
                  </div>
                  <div className="text-[10px] text-[#142318] dark:text-[#E2EEE2] font-semibold mt-0.5">Queued in kitchen</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/25 shadow-sm">
                  <div className="text-[11px] uppercase font-bold text-[#1F3A24] dark:text-[#A3C2A5]">
                    Occupied Tables
                  </div>
                  <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] tabular-nums mt-1">
                    {occupiedTablesCount} / {tables.length}
                  </div>
                  <div className="text-[10px] text-[#142318] dark:text-[#E2EEE2] font-semibold mt-0.5">Indoor sanctuary seats</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/25 shadow-sm">
                  <div className="text-[11px] uppercase font-bold text-[#1F3A24] dark:text-[#A3C2A5]">
                    Google Rating Trust
                  </div>
                  <div className="text-2xl font-bold text-[#142318] dark:text-[#A3C2A5] tabular-nums mt-1">
                    ★ 4.9
                  </div>
                  <div className="text-[10px] text-[#142318] dark:text-[#E2EEE2] font-semibold mt-0.5">646 Bhopal reviews</div>
                </div>
              </div>

              {/* Quick 86 / Availability Control */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1F3A24] border border-[#325736]/25 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
                      Quick 86 / Availability Control
                    </h2>
                    <p className="text-xs text-[#1F3A24] dark:text-[#E2EEE2]">
                      Toggle items out-of-stock when fresh ingredient batches run low
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#142318] dark:text-[#E2EEE2]">{menuItems.length} items registered</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                  {menuItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#325736]/20 bg-[#F7FBFA] dark:bg-[#142318]"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA] line-clamp-1">
                            {item.name}
                          </div>
                          <div className="text-[10px] font-bold text-[#142318] dark:text-[#A3C2A5]">₹{item.price}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-3 py-1.5 min-h-[36px] rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          item.isAvailable
                            ? 'bg-[#142318] text-white hover:bg-[#28492C]'
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

          {/* TAB 2: KITCHEN DISPLAY SYSTEM (KDS) */}
          {activeTab === 'kds' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-black text-white p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    KDS Active Touch Screen
                  </span>
                </div>
                <div className="text-xs font-mono font-bold">
                  {orders.filter(o => o.status !== 'served' && o.status !== 'cancelled').length} Active Tickets
                </div>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Received / New */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-amber-600">
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
                          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-400 space-y-3 shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono font-bold text-xs text-[#142318]">#{ord.id.slice(-6).toUpperCase()}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-300 text-amber-950">
                              {(ord.orderType || 'takeaway').replace(/[-_]/g, ' ')}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs border-y border-amber-300 py-2 text-[#142318]">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="font-bold">{item.quantity}× {item.name}</span>
                                <span className="text-[10px] font-mono">₹{item.itemTotal}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowKotOrder(ord)}
                              className="px-3 py-2 rounded-xl bg-white border border-amber-400 text-amber-950 font-bold text-xs"
                            >
                              KOT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')}
                              className="flex-1 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                              Start Cooking →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 2. Preparing */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-blue-600">
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
                          className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-400 space-y-3 shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono font-bold text-xs text-[#142318]">#{ord.id.slice(-6).toUpperCase()}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-300 text-blue-950">
                              {ord.tableNumber ? `Table ${ord.tableNumber}` : 'Takeaway'}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs border-y border-blue-300 py-2 text-[#142318]">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="font-bold">{item.quantity}× {item.name}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'ready')}
                            className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            Mark Ready at Pass ✓
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 3. Ready */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-600">
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
                          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400 space-y-3 shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono font-bold text-xs text-[#142318]">#{ord.id.slice(-6).toUpperCase()}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#142318] text-white">
                              Ready Hot
                            </span>
                          </div>

                          <div className="text-xs text-[#142318] font-bold">
                            {ord.customerName} ({ord.customerPhone})
                          </div>

                          <div className="flex gap-2">
                            {ord.paymentStatus === 'captured' && (
                              <button
                                type="button"
                                onClick={() => handleRefund(ord.id, ord.totalAmount)}
                                className="px-3 py-2 rounded-xl bg-red-100 text-red-900 border border-red-300 font-bold text-xs"
                              >
                                Refund
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, 'served')}
                              className="flex-1 py-2.5 rounded-xl bg-[#142318] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                              Mark Served
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESERVATIONS & BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display uppercase text-lg font-bold text-[#142318] dark:text-[#F7FBFA]">
                    Table Bookings &amp; Guest Reservations
                  </h2>
                  <p className="text-xs text-[#1F3A24] dark:text-[#E2EEE2]">
                    Botanical dining sanctuary capacity and scheduled seating
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1F3A24] rounded-2xl border border-[#325736]/25 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EAE0D0] dark:bg-[#142318] text-[11px] uppercase font-bold text-[#142318] dark:text-[#F7FBFA]">
                      <th className="p-3">Ref</th>
                      <th className="p-3">Guest Name</th>
                      <th className="p-3">Date &amp; Time</th>
                      <th className="p-3">Party</th>
                      <th className="p-3">Section</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#325736]/15 text-xs text-[#142318] dark:text-[#F7FBFA]">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-[#1F3A24]">
                          No reservations booked for today.
                        </td>
                      </tr>
                    ) : (
                      bookings.map(b => (
                        <tr key={b.id} className="hover:bg-[#F5EFE4]/50 dark:hover:bg-[#142318]/50">
                          <td className="p-3 font-mono font-bold">{b.bookingRef || b.id}</td>
                          <td className="p-3 font-bold">{b.guestName}</td>
                          <td className="p-3">{b.date} at {b.timeSlot}</td>
                          <td className="p-3">{b.partySize} guests</td>
                          <td className="p-3 capitalize">{String(b.seatingPreference).replace(/[-_]/g, ' ')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-900' :
                              b.status === 'seated' ? 'bg-blue-100 text-blue-900' :
                              b.status === 'cancelled' ? 'bg-red-100 text-red-900' : 'bg-gray-100 text-gray-900'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {b.status === 'confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'seated')}
                                  className="px-2 py-1 rounded bg-[#142318] text-white text-[10px] font-bold"
                                >
                                  Seat
                                </button>
                              )}
                              {b.status !== 'cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                  className="px-2 py-1 rounded bg-red-700 text-white text-[10px] font-bold"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MENU MANAGER */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display uppercase text-lg font-bold text-[#142318] dark:text-[#F7FBFA]">
                    Sanctuary Menu Manager
                  </h2>
                  <p className="text-xs text-[#1F3A24] dark:text-[#E2EEE2]">
                    Create, update, 86, and bulk-import culinary items
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="/api/v1/menu/export-csv"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-[#EAE0D0] text-[#142318] border border-[#D8C7AA] text-xs font-bold hover:bg-[#D8C7AA]"
                  >
                    Export CSV
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowImportCsvModal(true)}
                    className="px-3 py-2 rounded-xl bg-[#EAE0D0] text-[#142318] border border-[#D8C7AA] text-xs font-bold hover:bg-[#D8C7AA]"
                  >
                    Import CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddItemModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#142318] text-white text-xs font-bold hover:bg-[#28492C]"
                  >
                    + Add New Item
                  </button>
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAE0D0] text-[#142318]">
                          {item.category}
                        </span>
                        <span className="font-bold text-sm text-[#142318] dark:text-[#F7FBFA]">₹{item.price}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[#142318] dark:text-[#F7FBFA] line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-[#1F3A24] dark:text-[#E2EEE2] line-clamp-2 mt-1">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#325736]/15">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${
                          item.isAvailable ? 'bg-[#142318] text-white' : 'bg-red-800 text-white'
                        }`}
                      >
                        {item.isAvailable ? 'In Stock' : '86 / Sold Out'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMenuItem(item.id, item.name)}
                        className="text-[11px] font-bold text-red-700 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FLOOR & TABLES */}
          {activeTab === 'floor' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
                  Botanical Dining Sanctuary • Floor Matrix
                </h2>
                <p className="text-xs text-[#1F3A24] dark:text-[#E2EEE2]">
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
                          ? 'border-red-600 bg-red-50 dark:bg-red-950/40 ring-2 ring-red-500'
                          : table.isOccupied
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-[#325736]/25 bg-white dark:bg-[#1F3A24]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display font-bold text-lg text-[#142318] dark:text-[#F7FBFA]">
                          T-{table.tableNumber}
                        </span>
                        <span className="text-[10px] font-bold text-[#142318] dark:text-[#E2EEE2]">
                          Cap: {table.capacity}p
                        </span>
                      </div>

                      <div className="text-xs text-[#142318] dark:text-[#F7FBFA] mb-3 capitalize font-semibold">
                        {String(table.section).replace(/[-_]/g, ' ')}
                      </div>

                      {hasAlerts ? (
                        <div className="space-y-2">
                          <div className="text-[11px] font-bold text-red-700 dark:text-red-300">
                            Alert: {String(alertType).toUpperCase()}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleClearTableAlert(table.tableNumber)}
                            className="w-full py-2 min-h-[44px] rounded-lg bg-red-700 hover:bg-red-800 text-white text-[11px] font-bold uppercase"
                          >
                            Resolve Alert
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] uppercase font-bold text-[#1F3A24] dark:text-[#A3C2A5]">
                          {table.isOccupied ? 'Occupied / Dining' : 'Available'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS & EXPORT */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display uppercase text-lg font-bold text-[#142318] dark:text-[#F7FBFA]">
                    Sales Analytics &amp; Financial Reports
                  </h2>
                  <p className="text-xs text-[#1F3A24] dark:text-[#E2EEE2]">
                    Data aggregated in Asia/Kolkata timezone with formula injection protection
                  </p>
                </div>
                <a
                  href="/api/v1/admin/reports/export-csv"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#142318] text-white text-xs font-bold hover:bg-[#28492C]"
                >
                  Download Sales CSV
                </a>
              </div>

              {reportsData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/25">
                    <div className="text-xs font-bold uppercase text-[#1F3A24] dark:text-[#A3C2A5]">Total Sales Volume</div>
                    <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">₹{reportsData.totalRevenue}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/25">
                    <div className="text-xs font-bold uppercase text-[#1F3A24] dark:text-[#A3C2A5]">Completed Orders</div>
                    <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">{reportsData.ordersCount}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/25">
                    <div className="text-xs font-bold uppercase text-[#1F3A24] dark:text-[#A3C2A5]">Average Order Value</div>
                    <div className="text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">₹{reportsData.averageOrderValue}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: AUDIT LOG VIEWER */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display uppercase text-lg font-bold text-[#142318] dark:text-[#F7FBFA]">
                  Immutable Administrative Audit Trail
                </h2>
                <p className="text-xs text-[#1F3A24] dark:text-[#E2EEE2]">
                  Chronological record of every price edit, status change, and refund
                </p>
              </div>

              <div className="bg-white dark:bg-[#1F3A24] rounded-2xl border border-[#325736]/25 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EAE0D0] dark:bg-[#142318] text-[11px] uppercase font-bold text-[#142318] dark:text-[#F7FBFA]">
                      <th className="p-3">Timestamp (UTC)</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Entity</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#325736]/15 text-xs text-[#142318] dark:text-[#F7FBFA]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-[#1F3A24]">
                          No audit log entries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-[#F5EFE4]/50 dark:hover:bg-[#142318]/50">
                          <td className="p-3 font-mono">{new Date(log.timestamp).toLocaleTimeString('en-IN')}</td>
                          <td className="p-3 font-bold">{log.actor?.name} ({log.actor?.role})</td>
                          <td className="p-3 font-mono font-bold text-[#142318] dark:text-[#A3C2A5]">{log.action}</td>
                          <td className="p-3">{log.entity} #{log.entityId}</td>
                          <td className="p-3 font-mono text-[10px]">
                            {JSON.stringify(log.after || log.before || {})}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: PRINTABLE TABLE QR STANDS */}
          {activeTab === 'qr_generator' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1F3A24] border border-[#325736]/25 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
                    Printable Table QR Codes (Tables 1 – 12)
                  </h2>
                  <p className="text-xs text-[#1F3A24] dark:text-[#E2EEE2]">
                    Affix to the wooden acrylic stands for instant customer contactless ordering.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-full bg-[#142318] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow hover:bg-black"
                >
                  Print All QR Stands
                </button>
              </div>

              {/* Grid of Stand Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {tables.map(table => {
                  const targetUrl = `${window.location.origin}/t/${table.tableNumber}`;
                  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    targetUrl
                  )}&color=20-35-24&bgcolor=247-251-250`;

                  return (
                    <div
                      key={table.tableNumber}
                      className="p-6 rounded-3xl bg-[#F7FBFA] border-2 border-[#142318] text-center space-y-4 shadow-md text-[#142318]"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <TheLeafMark size={24} strokeColor="#142318" />
                        <span className="font-display uppercase text-xs font-bold tracking-widest text-[#142318]">
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
                        <div className="font-display uppercase text-xl font-bold tracking-wider text-[#142318]">
                          Table {table.tableNumber}
                        </div>
                        <div className="text-[10px] text-[#142318] font-bold uppercase tracking-wider mt-0.5">
                          Scan to View Menu &amp; Order
                        </div>
                      </div>

                      <div className="text-[9px] text-[#142318] font-semibold border-t border-[#325736]/15 pt-2">
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

      {/* MODAL: ADD MENU ITEM */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#1F3A24] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#325736]/30">
            <h3 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA] mb-4">
              Add New Dish or Brew
            </h3>
            <form onSubmit={handleCreateMenuItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#142318] mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="e.g. Lavender Smoked Cold Brew"
                  className="w-full p-2.5 rounded-xl border border-[#325736]/30 bg-[#F7FBFA]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#142318] mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#325736]/30 bg-[#F7FBFA]"
                  >
                    <option value="coffee">Coffee</option>
                    <option value="cold-brews">Cold Brews</option>
                    <option value="pizza">Wood-Fired Pizza</option>
                    <option value="pasta">Handmade Pasta</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#142318] mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#325736]/30 bg-[#F7FBFA]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#142318] mb-1">Description</label>
                <textarea
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  placeholder="Notes, origin, dietary notes..."
                  className="w-full p-2.5 rounded-xl border border-[#325736]/30 bg-[#F7FBFA] h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#142318] text-white font-bold hover:bg-[#28492C]"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BULK CSV IMPORT */}
      {showImportCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#1F3A24] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#325736]/30">
            <h3 className="font-display uppercase text-base font-bold text-[#142318] dark:text-[#F7FBFA] mb-2">
              Import Menu via CSV
            </h3>
            <p className="text-xs text-[#1F3A24] mb-3">
              Format: <code>Name,Category,Price,Description,Tags</code>
            </p>
            <form onSubmit={handleImportCsv} className="space-y-4 text-xs">
              <textarea
                value={csvContent}
                onChange={e => setCsvContent(e.target.value)}
                placeholder={"Name,Category,Price,Description,Tags\nSmoked Cortado,coffee,190,Double espresso with steamed milk,bestseller"}
                className="w-full p-3 rounded-xl border border-[#325736]/30 font-mono text-[11px] h-40 bg-[#F7FBFA]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportCsvModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#142318] text-white font-bold hover:bg-[#28492C]"
                >
                  Process CSV Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KOT PRINT TICKET PREVIEW */}
      {showKotOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-black text-black font-mono text-xs space-y-3">
            <div className="text-center border-b pb-2">
              <div className="font-bold text-sm uppercase">KITCHEN ORDER TICKET (KOT)</div>
              <div>The Leaf – Cafe and Brew • Bhopal</div>
              <div className="text-[10px] mt-1">{new Date().toLocaleString('en-IN')}</div>
            </div>

            <div className="flex justify-between border-b pb-2 font-bold">
              <span>TICKET: #{showKotOrder.id.slice(-6).toUpperCase()}</span>
              <span>{showKotOrder.tableNumber ? `TABLE ${showKotOrder.tableNumber}` : 'TAKEAWAY'}</span>
            </div>

            <div className="space-y-1 border-b pb-2">
              {showKotOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="font-bold">{it.quantity} × {it.name}</span>
                </div>
              ))}
            </div>

            {showKotOrder.specialInstructions && (
              <div className="bg-gray-100 p-2 rounded text-[10px]">
                <strong>NOTE:</strong> {showKotOrder.specialInstructions}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded bg-black text-white font-bold"
              >
                Print Ticket
              </button>
              <button
                type="button"
                onClick={() => setShowKotOrder(null)}
                className="px-4 py-2 rounded bg-gray-200 text-black font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
