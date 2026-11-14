import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { TheLeafMark } from '../components/brand/TheLeafMark';
import { BUSINESS_FACTS } from '../../../shared/constants';

type InfoType = 'contact' | 'faq' | 'privacy' | 'terms';

export const InfoLegalPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.replace('/', '') as InfoType;
  const currentTab: InfoType = ['contact', 'faq', 'privacy', 'terms'].includes(path) ? path : 'faq';

  return (
    <main id="main-content" className="min-h-[100dvh] pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Brand Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="flex justify-center mb-3 text-[#325736] dark:text-[#A3C2A5]">
          <TheLeafMark size={44} />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#142318] dark:text-[#C9DCC9]">
          The Leaf • Cafe &amp; Brew • Arera Colony
        </span>
        <h1 className="font-display text-3xl md:text-5xl uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
          {currentTab === 'contact' && 'Get In Touch'}
          {currentTab === 'faq' && 'Frequently Asked Questions'}
          {currentTab === 'privacy' && 'Privacy Policy'}
          {currentTab === 'terms' && 'Terms & Cancellation Policy'}
        </h1>
        <p className="text-xs md:text-sm text-[#142318] dark:text-[#C9DCC9] mt-2">
          {BUSINESS_FACTS.dietaryStandard} • Pure Vegetarian Sanctuary in Bhopal
        </p>
      </div>

      {/* Navigation Tabs */}
      <nav aria-label="Information and Legal navigation" className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
        {[
          { id: 'faq', label: 'FAQ' },
          { id: 'contact', label: 'Contact & Location' },
          { id: 'privacy', label: 'Privacy Policy' },
          { id: 'terms', label: 'Terms & Refund' },
        ].map(t => (
          <Link
            key={t.id}
            to={`/${t.id}`}
            className={`min-h-[44px] inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              currentTab === t.id
                ? 'bg-[#142318] text-[#FFFFFF] shadow-md'
                : 'border border-[#142318]/30 text-[#142318] dark:text-[#F7FBFA] hover:border-[#142318] bg-[#FFFFFF]/90 dark:bg-[#1F3A24]/60'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* Content Container */}
      <div className="bg-[#F5EFE4] dark:bg-[#1A261D] rounded-3xl p-6 md:p-10 border border-[#E0D2B8] dark:border-[#325736]/30 shadow-lg text-[#1F2A22] dark:text-[#F7FBFA]">
        {/* === 1. FAQ TAB === */}
        {currentTab === 'faq' && (
          <div className="space-y-6">
            <div className="border-b border-[#325736]/10 pb-5">
              <h2 className="text-base font-bold text-[#142318] dark:text-[#F7FBFA] mb-2">
                🌱 Is "The Leaf" strictly pure-vegetarian?
              </h2>
              <p className="text-xs md:text-sm text-[#142318] dark:text-[#C9DCC9] leading-relaxed">
                Yes, absolutely. The Leaf is 100% pure vegetarian. We strictly do not prepare, serve, or allow any meat, poultry, seafood, fish, eggs, gelatin, or animal rennet on our premises.
              </p>
            </div>

            <div className="border-b border-[#325736]/10 pb-5">
              <h2 className="text-base font-bold text-[#142318] dark:text-[#F7FBFA] mb-2">
                🧅 Do you have Jain and Vegan preparation options?
              </h2>
              <p className="text-xs md:text-sm text-[#142318] dark:text-[#C9DCC9] leading-relaxed">
                Yes. Many of our artisan pizzas, pastas, coolers, and coffees can be prepared Jain (no root vegetables, onion, or garlic) upon request. For vegans, we offer oat milk and almond milk alternatives for all espresso beverages.
              </p>
            </div>

            <div className="border-b border-[#325736]/10 pb-5">
              <h2 className="text-base font-bold text-[#142318] dark:text-[#F7FBFA] mb-2">
                🚗 Where are you located and is parking available?
              </h2>
              <p className="text-xs md:text-sm text-[#142318] dark:text-[#C9DCC9] leading-relaxed">
                We are located at 1st Floor, E7/161, E-7, Arera Colony, Bhopal, MP 462016. Dedicated visitor parking is available on-site for both two-wheelers and cars.
              </p>
            </div>

            <div className="border-b border-[#325736]/10 pb-5">
              <h2 className="text-base font-bold text-[#142318] dark:text-[#F7FBFA] mb-2">
                🍷 Do you serve alcohol or have live loud music?
              </h2>
              <p className="text-xs md:text-sm text-[#142318] dark:text-[#C9DCC9] leading-relaxed">
                No alcohol is permitted or served. We do not host loud live music; our cafe plays mellow ambient lo-fi, acoustic, and botanical jazz calibrated for reading, conversation, and calm unwinding.
              </p>
            </div>

            <div>
              <h2 className="text-base font-bold text-[#142318] dark:text-[#F7FBFA] mb-2">
                📱 How do table reservations work?
              </h2>
              <p className="text-xs md:text-sm text-[#142318] dark:text-[#C9DCC9] leading-relaxed">
                Table bookings are free and held for up to 15 minutes past your booked time slot. You can reserve directly on this website, download an .ics calendar invite, and order ahead if desired.
              </p>
            </div>
          </div>
        )}

        {/* === 2. CONTACT TAB === */}
        {currentTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#325736] dark:text-[#A3C2A5] mb-2">
                  Cafe Location
                </h2>
                <p className="text-sm leading-relaxed">{BUSINESS_FACTS.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS_FACTS.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#325736]/30 px-4 py-2 text-xs font-semibold text-[#325736] dark:text-[#A3C2A5] hover:bg-[#325736]/10"
                >
                  <MonolineIcon name="pin" size={14} />
                  Open in Google Maps
                </a>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#325736] dark:text-[#A3C2A5] mb-2">
                  Hours of Sanctuary
                </h2>
                <p className="text-sm">{BUSINESS_FACTS.hoursDisplay}</p>
                <p className="text-xs text-[#142318] dark:text-[#C9DCC9] mt-1">
                  11:00 AM – 11:30 PM daily (Config placeholder, unconfirmed)
                </p>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#325736] dark:text-[#A3C2A5] mb-2">
                  Social &amp; Hospitality
                </h2>
                <div className="space-y-2 text-xs">
                  <p>
                    <span className="font-semibold">Instagram: </span>
                    <a
                      href={BUSINESS_FACTS.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#325736] dark:text-[#A3C2A5]"
                    >
                      {BUSINESS_FACTS.instagramHandle}
                    </a>
                  </p>
                  <p className="text-[#142318] dark:text-[#C9DCC9]">
                    Phone: {BUSINESS_FACTS.phone}
                  </p>
                  <p className="text-[#142318] dark:text-[#C9DCC9]">
                    WhatsApp: {BUSINESS_FACTS.whatsapp}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="p-6 rounded-2xl bg-[#EEF5EE] dark:bg-[#142318] border border-[#325736]/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-1">
                Send Us a Note
              </h2>
              <p className="text-xs text-[#142318] dark:text-[#C9DCC9] mb-4">
                Have a feedback, corporate catering, or private event inquiry?
              </p>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  alert('Thank you! Your note has been received by our Arera Colony hospitality team.');
                }}
                className="space-y-3"
              >
                <div>
                  <label htmlFor="contact-name" className="block text-[11px] font-semibold mb-1">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    name="contactName"
                    aria-label="Your Name"
                    type="text"
                    required
                    placeholder="e.g. Priyanshi Saxena"
                    className="w-full rounded-xl border border-[#325736]/30 px-3 py-2 text-xs bg-white dark:bg-[#1F3A24] text-[#142318] dark:text-[#F7FBFA]"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-[11px] font-semibold mb-1">
                    Email / Phone *
                  </label>
                  <input
                    id="contact-email"
                    name="contactEmail"
                    aria-label="Email or Phone"
                    type="text"
                    required
                    placeholder="e.g. 98260 00000"
                    className="w-full rounded-xl border border-[#325736]/30 px-3 py-2 text-xs bg-white dark:bg-[#1F3A24] text-[#142318] dark:text-[#F7FBFA]"
                  />
                </div>
                <div>
                  <label htmlFor="contact-msg" className="block text-[11px] font-semibold mb-1">
                    Message
                  </label>
                  <textarea
                    id="contact-msg"
                    name="contactMessage"
                    aria-label="Message"
                    rows={3}
                    placeholder="Tell us what you'd like to celebrate..."
                    className="w-full rounded-xl border border-[#325736]/30 px-3 py-2 text-xs bg-white dark:bg-[#1F3A24] text-[#142318] dark:text-[#F7FBFA]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-full bg-[#325736] py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#284A2D] transition-colors"
                >
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        )}

        {/* === 3. PRIVACY TAB === */}
        {currentTab === 'privacy' && (
          <div className="space-y-4 text-xs md:text-sm text-[#142318] dark:text-[#C9DCC9] leading-relaxed">
            <h2 className="text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
              Customer Privacy &amp; Data Safeguards
            </h2>
            <p>
              At <strong>The Leaf – Cafe and Brew</strong>, we respect your personal privacy. We collect guest contact details (name, phone number, email) exclusively for fulfilling orders, confirming table reservations, and sending transactional status updates.
            </p>
            <p>
              <strong>Payment Security:</strong> Online transactions are processed securely via PCI-DSS compliant payment gateways (Razorpay). The Leaf does not store or process raw debit/credit card numbers or UPI PINs on its servers.
            </p>
            <p>
              <strong>No Spam Guarantee:</strong> We do not sell, rent, or lease guest information to third-party marketing brokers. Any transactional notifications (SMS, WhatsApp, or email) pertain solely to your current reservations or food orders.
            </p>
            <p>
              For inquiries regarding data deletion or privacy concerns, please contact our hospitality desk at Arera Colony, Bhopal.
            </p>
          </div>
        )}

        {/* === 4. TERMS TAB === */}
        {currentTab === 'terms' && (
          <div className="space-y-4 text-xs md:text-sm text-[#142318] dark:text-[#C9DCC9] leading-relaxed">
            <h2 className="text-base font-bold text-[#142318] dark:text-[#F7FBFA]">
              Terms of Service &amp; Cancellation Policy
            </h2>
            <p>
              <strong>1. Sanctuary Principles:</strong> The Leaf is a 100% pure vegetarian culinary haven. Bringing non-vegetarian food, outside beverages, or alcohol into the premises is strictly prohibited.
            </p>
            <p>
              <strong>2. Table Reservation Policy:</strong> Reserved tables are held with a 15-minute grace period from the reserved start time. If the party does not check in within 15 minutes, the table may be released to waiting guests.
            </p>
            <p>
              <strong>3. Pre-Order &amp; Food Preparation:</strong> As our sourdough pizzas, pour-overs, and pastas are handcrafted fresh upon receipt of order, cancellations after food preparation has begun are not refundable.
            </p>
            <p>
              <strong>4. Pricing Notice:</strong> Current prices listed on this demonstration platform represent provisional estimates pending final commercial launch by the cafe management.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};
