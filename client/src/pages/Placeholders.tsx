import React from 'react';
import { Link } from 'react-router-dom';
import { MonolineIcon } from '../components/brand/MonolineIcon';

export const MenuPagePlaceholder: React.FC = () => (
  <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
    <div className="h-16 w-16 mx-auto rounded-full bg-[#325736]/10 flex items-center justify-center text-[#325736] mb-4">
      <MonolineIcon name="spoon" size={28} />
    </div>
    <h1 className="text-3xl font-display uppercase tracking-wider font-bold">Artisanal Menu</h1>
    <p className="mt-2 text-sm text-[#38483C]">Phase 2 Engine: Categories, Customizer, and Search.</p>
    <div className="mt-6 flex justify-center gap-4">
      <Link to="/" className="text-xs uppercase underline tracking-wider font-semibold text-[#325736]">Back to Home</Link>
      <Link to="/design" className="text-xs uppercase underline tracking-wider font-semibold text-[#325736]">View Design System</Link>
    </div>
  </div>
);

export const BookingPagePlaceholder: React.FC = () => (
  <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
    <div className="h-16 w-16 mx-auto rounded-full bg-[#325736]/10 flex items-center justify-center text-[#325736] mb-4">
      <MonolineIcon name="table" size={28} />
    </div>
    <h1 className="text-3xl font-display uppercase tracking-wider font-bold">Reserve a Table</h1>
    <p className="mt-2 text-sm text-[#38483C]">Phase 3 Engine: Date strip, 5-min Redis slot-lock, party stepper.</p>
  </div>
);

export const PreOrderPagePlaceholder: React.FC = () => (
  <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
    <div className="h-16 w-16 mx-auto rounded-full bg-[#325736]/10 flex items-center justify-center text-[#325736] mb-4">
      <MonolineIcon name="clock" size={28} />
    </div>
    <h1 className="text-3xl font-display uppercase tracking-wider font-bold">Order Ahead</h1>
    <p className="mt-2 text-sm text-[#38483C]">Phase 4 Engine: Arrival scheduling, takeaway pickup &amp; live kitchen buffer.</p>
  </div>
);

export const TableQRPagePlaceholder: React.FC = () => (
  <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
    <div className="h-16 w-16 mx-auto rounded-full bg-[#325736]/10 flex items-center justify-center text-[#325736] mb-4">
      <MonolineIcon name="qr" size={28} />
    </div>
    <h1 className="text-3xl font-display uppercase tracking-wider font-bold">Dine-In QR Table Ordering</h1>
    <p className="mt-2 text-sm text-[#38483C]">Phase 5 Engine: Table pre-fill, waiter call, running tabs, split bill.</p>
  </div>
);

export const OrderTrackerPagePlaceholder: React.FC = () => (
  <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
    <div className="h-16 w-16 mx-auto rounded-full bg-[#325736]/10 flex items-center justify-center text-[#325736] mb-4">
      <MonolineIcon name="cup" size={28} />
    </div>
    <h1 className="text-3xl font-display uppercase tracking-wider font-bold">Live Order Tracker</h1>
    <p className="mt-2 text-sm text-[#38483C]">Phase 4 Engine: 4-stage filling cup progress with live Socket.IO updates.</p>
  </div>
);

export const AdminDashboardPagePlaceholder: React.FC = () => (
  <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
    <div className="h-16 w-16 mx-auto rounded-full bg-[#325736]/10 flex items-center justify-center text-[#325736] mb-4">
      <MonolineIcon name="receipt" size={28} />
    </div>
    <h1 className="text-3xl font-display uppercase tracking-wider font-bold">Admin &amp; KDS Portal</h1>
    <p className="mt-2 text-sm text-[#38483C]">Phase 6 Engine: Orders Kanban, KDS mode, table status &amp; sales reports.</p>
  </div>
);
