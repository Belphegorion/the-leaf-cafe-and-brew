import React from 'react';
import { Link } from 'react-router-dom';
import { WaveDivider } from '../brand/WaveDivider';
import { TheLeafLogo } from '../brand/TheLeafLogo';
import { TheLeafWordmark } from '../brand/TheLeafWordmark';
import { MonolineIcon } from '../brand/MonolineIcon';
import { BUSINESS_FACTS, PLACEHOLDERS } from '../../../../shared/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="dark relative bg-[#142318] text-[#F7FBFA] overflow-hidden pt-12 pb-8">
      {/* Top undulating wave divider */}
      <WaveDivider strokeColor="#5E8662" animated={true} className="mb-8" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#284A2D]">
          {/* Column 1: Brand & Pure Veg Statement */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <TheLeafLogo variant="horizontal" size={36} theme="dark" />
            <p className="text-sm text-[#C9DCC9] max-w-sm font-light leading-relaxed mt-2">
              A serene culinary sanctuary in the heart of Arera Colony, Bhopal. Artisanal coffees, handcrafted brews, and 100% pure-vegetarian continental delicacies crafted with mindfulness and warmth.
            </p>

            {/* Google Rating 4.9 Trust Badge */}
            <div className="inline-flex items-center gap-3 rounded-full border border-[#5E8662]/40 bg-[#1F3A24]/60 px-4 py-2 w-max mt-2 shadow-sm">
              <div className="flex items-center gap-1 text-[#E2EEE2]">
                <MonolineIcon name="star" size={16} color="#C98A1B" />
                <span className="font-bold text-sm tracking-tight text-white">4.9</span>
              </div>
              <span className="text-xs text-[#A3C2A5]">
                Google Trust Score · <strong>646</strong> Bhopal Foodies
              </span>
            </div>

            {/* Pure Veg & Amenities Pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="rounded-full bg-[#325736] px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-[#E2EEE2]">
                🌱 100% Pure Vegetarian
              </span>
              <span className="rounded-full border border-[#284A2D] bg-[#1F3A24] px-3 py-1 text-[11px] text-[#A3C2A5]">
                🚗 Parking Available
              </span>
              <span className="rounded-full border border-[#284A2D] bg-[#1F3A24] px-3 py-1 text-[11px] text-[#A3C2A5]">
                ☕ Indoor Artisanal Seating
              </span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A3C2A5]">
              Quick Links
            </h2>
            <ul className="flex flex-col gap-2 text-sm text-[#C9DCC9]">
              <li><Link to="/menu" className="hover:text-white transition-colors">Artisanal Menu</Link></li>
              <li><Link to="/book" className="hover:text-white transition-colors">Reserve a Table</Link></li>
              <li><Link to="/pre-order" className="hover:text-white transition-colors">Pre-Order Ahead</Link></li>
              <li><Link to="/t/1" className="hover:text-white transition-colors">Dine-In QR Order</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">My Account &amp; Loyalty</Link></li>
              <li><Link to="/design" className="hover:text-white transition-colors">Living Design System</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Staff &amp; Admin</Link></li>
            </ul>
          </div>

          {/* Column 3: The Sanctuary & Hours */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A3C2A5]">
              Visit Us
            </h2>
            <p className="text-sm text-[#C9DCC9] leading-relaxed">
              1st Floor, E7/161, E-7, Arera Colony,<br />
              Bhopal, Madhya Pradesh 462016
            </p>
            <div className="mt-2 text-xs text-[#A3C2A5]">
              <p className="font-semibold text-white">Opening Hours</p>
              <p>11:00 AM – 11:30 PM daily</p>
              <p className="text-[10px] text-[#A3C2A5]/70 italic mt-0.5">(Subject to seasonal confirmation)</p>
            </div>
            <p className="text-xs text-[#C9DCC9] mt-1">
              Average cost for two: <span className="text-white font-medium">₹1000 approx.</span>
            </p>
          </div>

          {/* Column 4: Connect & Social */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A3C2A5]">
              Connect
            </h2>
            <a
              href="https://www.instagram.com/theleafverse/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#C9DCC9] hover:text-white transition-colors"
            >
              <span>Instagram:</span>
              <span className="text-[#A3C2A5] font-semibold underline decoration-[#5E8662]">@theleafverse</span>
            </a>
            <div className="text-xs text-[#C9DCC9]/80 flex flex-col gap-1 mt-1">
              <p><span className="text-[#A3C2A5]">Phone:</span> {BUSINESS_FACTS.phone}</p>
              <p><span className="text-[#A3C2A5]">WhatsApp:</span> {BUSINESS_FACTS.whatsapp}</p>
              <p><span className="text-[#A3C2A5]">GSTIN:</span> {PLACEHOLDERS.GSTIN}</p>
              <p><span className="text-[#A3C2A5]">FSSAI:</span> {PLACEHOLDERS.FSSAI}</p>
            </div>
          </div>
        </div>

        {/* Giant Outlined Wordmark */}
        <div className="py-12 flex justify-center items-center opacity-30 select-none overflow-hidden" aria-hidden="true">
          <TheLeafWordmark size={680} color="#5E8662" showWaves={true} />
        </div>

        {/* Bottom copyright & legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-[#A3C2A5]/80 border-t border-[#284A2D]">
          <p>© {new Date().getFullYear()} The Leaf – Cafe and Brew. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-white">About</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <span>·</span>
            <Link to="/faq" className="hover:text-white">FAQ</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
