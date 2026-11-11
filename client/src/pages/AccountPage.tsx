import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { TheLeafMark } from '../components/brand/TheLeafMark';
import { WaveDivider } from '../components/brand/WaveDivider';
import { useCartStore } from '../stores/useCartStore';
import { FALLBACK_MENU_ITEMS } from '../data/fallbackMenu';

type AccountTab = 'orders' | 'bookings' | 'favourites' | 'loyalty';

export const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const addItem = useCartStore(state => state.addItem);
  const openDrawer = useCartStore(state => state.openDrawer);

  // Mock data for user's past orders
  const pastOrders = [
    {
      id: 'ORD-9821',
      date: 'Today, 12:45 PM',
      type: 'Takeaway',
      items: '1× Cold Brew Tonic, 1× Peri Peri Paneer Pizza',
      total: 785,
      status: 'Ready for Pickup',
      statusColor: 'bg-[#325736]',
    },
    {
      id: 'ORD-8942',
      date: 'Yesterday, 04:30 PM',
      type: 'Dine-In (Table 4)',
      items: '2× Pour-Over V60, 1× Handcrafted Tiramisu',
      total: 920,
      status: 'Served',
      statusColor: 'bg-[#325736]',
    },
  ];

  // Mock data for user's table bookings
  const bookings = [
    {
      ref: 'LEAF-B429',
      date: 'Tomorrow, Nov 12',
      time: '01:00 PM',
      partySize: 2,
      seating: 'Arched Window Alcove',
      status: 'Confirmed',
    },
    {
      ref: 'LEAF-A118',
      date: 'Oct 28, 2026',
      time: '07:15 PM',
      partySize: 4,
      seating: 'Botanical Courtyard',
      status: 'Completed',
    },
  ];

  // Favourites items from fallback menu
  const favouriteItems = FALLBACK_MENU_ITEMS.slice(0, 3);

  return (
    <main id="main-content" className="min-h-[100dvh] pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Profile Header Plinth */}
      <div className="bg-white dark:bg-[#1F3A24] p-6 md:p-8 rounded-3xl border border-[#E0D2B8] dark:border-[#284A2D] shadow-md mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-[#325736] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            <span>AS</span>
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="font-display text-2xl uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#EDE3D1]">
                Aryan Sharma
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#325736] text-white">
                Leaf Member
              </span>
            </div>
            <p className="text-xs text-[#38483C] dark:text-[#C9DCC9] mt-0.5">
              aryan.sharma@example.com • +91 98260 00000
            </p>
          </div>
        </div>

        {/* Loyalty Quick Pill */}
        <div className="flex items-center gap-3 bg-[#F5EFE4] dark:bg-[#101C13] px-4 py-2.5 rounded-2xl border border-[#E0D2B8] dark:border-[#284A2D]">
          <TheLeafMark size={24} strokeColor="#325736" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#38483C] dark:text-[#C9DCC9] font-medium">
              Leaf Club Points
            </div>
            <div className="text-base font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
              350 pts
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        className="flex items-center gap-2 border-b border-[#E0D2B8] dark:border-[#284A2D] pb-3 mb-8 overflow-x-auto no-scrollbar"
        role="tablist"
        aria-label="Account management tabs"
      >
        {[
          { id: 'orders' as const, label: 'Order History', icon: 'bag' as const },
          { id: 'bookings' as const, label: 'Table Bookings', icon: 'table' as const },
          { id: 'favourites' as const, label: 'Saved Favourites', icon: 'star' as const },
          { id: 'loyalty' as const, label: 'Club & Loyalty', icon: 'sparkles' as const },
        ].map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[44px] px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-[#325736] text-white shadow-md'
                : 'text-[#38483C] dark:text-[#C9DCC9] hover:bg-[#EDE3D1] dark:hover:bg-[#1F3A24]'
            }`}
          >
            <MonolineIcon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'orders' && (
        <section aria-labelledby="orders-heading" className="space-y-4">
          <h2 id="orders-heading" className="font-display uppercase text-lg font-bold text-[#1F2A22] dark:text-[#EDE3D1] mb-4">
            Recent Orders ({pastOrders.length})
          </h2>
          {pastOrders.map(order => (
            <div
              key={order.id}
              className="bg-white dark:bg-[#1F3A24] p-5 rounded-2xl border border-[#E0D2B8] dark:border-[#284A2D] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#1F2A22] dark:text-[#EDE3D1]">
                    {order.id}
                  </span>
                  <span className="text-[10px] text-[#38483C] dark:text-[#C9DCC9]">
                    • {order.date} • {order.type}
                  </span>
                </div>
                <div className="text-xs text-[#1F2A22] dark:text-[#EDE3D1] mt-1 font-medium">
                  {order.items}
                </div>
                <div className="text-xs font-bold text-[#325736] dark:text-[#A3C2A5] mt-1 tabular-nums">
                  ₹{order.total} (Paid via UPI)
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className={`text-[10px] uppercase font-bold text-white px-2.5 py-1 rounded-full ${order.statusColor}`}>
                  {order.status}
                </span>
                <Link
                  to={`/order/${order.id}`}
                  className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded-full border border-[#325736] text-xs font-semibold text-[#325736] dark:text-[#A3C2A5] hover:bg-[#F5EFE4] transition-colors"
                >
                  Track / Receipt
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === 'bookings' && (
        <section aria-labelledby="bookings-heading" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 id="bookings-heading" className="font-display uppercase text-lg font-bold text-[#1F2A22] dark:text-[#EDE3D1]">
              Table Reservations ({bookings.length})
            </h2>
            <Link
              to="/book"
              className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#325736] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#284A2D]"
            >
              + Book New Table
            </Link>
          </div>

          {bookings.map(b => (
            <div
              key={b.ref}
              className="bg-white dark:bg-[#1F3A24] p-5 rounded-2xl border border-[#E0D2B8] dark:border-[#284A2D] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5EFE4] dark:bg-[#101C13] flex items-center justify-center text-[#325736] dark:text-[#A3C2A5] font-bold shrink-0">
                  <MonolineIcon name="table" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#1F2A22] dark:text-[#EDE3D1]">
                      {b.ref}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#325736] dark:text-[#A3C2A5] bg-[#EEF5EE] dark:bg-[#142318] px-2 py-0.5 rounded-full">
                      {b.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#1F2A22] dark:text-[#EDE3D1] mt-0.5">
                    {b.date} at {b.time} • {b.partySize} Guests
                  </div>
                  <div className="text-[11px] text-[#38483C] dark:text-[#C9DCC9]">
                    Seating: {b.seating}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('The Leaf Cafe Bhopal')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center px-4 py-2 rounded-full border border-[#E0D2B8] text-xs font-medium hover:border-[#325736] transition-colors"
                >
                  Directions
                </a>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === 'favourites' && (
        <section aria-labelledby="favourites-heading" className="space-y-4">
          <h2 id="favourites-heading" className="font-display uppercase text-lg font-bold text-[#1F2A22] dark:text-[#EDE3D1] mb-4">
            Saved Creations ({favouriteItems.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {favouriteItems.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1F3A24] p-4 rounded-2xl border border-[#E0D2B8] dark:border-[#284A2D] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-36 rounded-xl object-cover mb-3"
                    loading="lazy"
                  />
                  <h3 className="font-display uppercase text-sm font-bold text-[#1F2A22] dark:text-[#EDE3D1]">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-[#38483C] dark:text-[#C9DCC9] line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E0D2B8]/40">
                  <span className="text-xs font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
                    ₹{item.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addItem(item);
                      openDrawer();
                    }}
                    className="min-h-[44px] px-4 py-1.5 rounded-full bg-[#325736] text-white text-xs font-semibold hover:bg-[#284A2D] transition-colors"
                    aria-label={`Order ${item.name} again`}
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'loyalty' && (
        <section aria-labelledby="loyalty-heading" className="space-y-6">
          <h2 id="loyalty-heading" className="font-display uppercase text-lg font-bold text-[#1F2A22] dark:text-[#EDE3D1]">
            The Leaf Botanical Club
          </h2>

          {/* Membership Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1F3A24] via-[#325736] to-[#142318] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none" aria-hidden="true">
              <TheLeafMark size={180} strokeColor="#FFFFFF" />
            </div>

            <div className="flex justify-between items-start mb-12">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#A3C2A5] font-semibold">
                  Member Since 2026
                </span>
                <div className="font-display text-2xl uppercase tracking-wider font-bold mt-1">
                  Sanctuary Patron Tier
                </div>
              </div>
              <TheLeafMark size={32} strokeColor="#FFFFFF" />
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs text-[#E2EEE2]">
                <span>Progress to Free V60 Pour-Over</span>
                <span className="font-bold tabular-nums">350 / 500 pts</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/30 overflow-hidden">
                <div className="h-full bg-[#A3C2A5] rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/20 gap-3">
              <div className="text-xs text-[#E2EEE2]">
                Referral Code: <strong className="font-mono text-white">LEAF-ARYAN20</strong>
              </div>
              <span className="text-[11px] text-[#A3C2A5]">
                Earn 50 pts when friends place their first brew order
              </span>
            </div>
          </div>

          <WaveDivider strokeColor="#325736" className="opacity-30 my-6" />

          {/* Tier Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1F3A24] p-5 rounded-2xl border border-[#E0D2B8] dark:border-[#284A2D]">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5EE] dark:bg-[#142318] text-[#325736] flex items-center justify-center mb-3">
                <MonolineIcon name="cup" size={20} />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F2A22] dark:text-[#EDE3D1]">
                10% High-Tea Discount
              </h3>
              <p className="text-[11px] text-[#38483C] dark:text-[#C9DCC9] mt-1">
                Valid on all artisanal bakery &amp; pour-over orders from 4:00 PM to 6:30 PM.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1F3A24] p-5 rounded-2xl border border-[#E0D2B8] dark:border-[#284A2D]">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5EE] dark:bg-[#142318] text-[#325736] flex items-center justify-center mb-3">
                <MonolineIcon name="table" size={20} />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F2A22] dark:text-[#EDE3D1]">
                Priority Weekend Alcove
              </h3>
              <p className="text-[11px] text-[#38483C] dark:text-[#C9DCC9] mt-1">
                Guaranteed window and corner table holds during peak Saturday and Sunday dinner roasts.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1F3A24] p-5 rounded-2xl border border-[#E0D2B8] dark:border-[#284A2D]">
              <div className="w-10 h-10 rounded-xl bg-[#EEF5EE] dark:bg-[#142318] text-[#325736] flex items-center justify-center mb-3">
                <MonolineIcon name="sparkles" size={20} />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F2A22] dark:text-[#EDE3D1]">
                Birthday Tasting Flight
              </h3>
              <p className="text-[11px] text-[#38483C] dark:text-[#C9DCC9] mt-1">
                Complimentary 3-bean cold brew tasting flight and dessert on your birthday month.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};
