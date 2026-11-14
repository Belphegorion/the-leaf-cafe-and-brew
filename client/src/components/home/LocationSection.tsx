import React, { useState, useEffect } from 'react';
import { MonolineIcon } from '../brand/MonolineIcon';
import { BUSINESS_FACTS, PLACEHOLDERS } from '../../../../shared/constants';

export const LocationSection: React.FC = () => {
  const [isOpenNow, setIsOpenNow] = useState(true);
  const [closingMessage, setClosingMessage] = useState('Open Now · Closes at 11:30 PM');

  useEffect(() => {
    // Dynamic open/close calculator based on 11:00 to 23:30
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const openTime = 11 * 60; // 11:00 AM
    const closeTime = 23 * 60 + 30; // 11:30 PM

    if (currentTime >= openTime && currentTime < closeTime) {
      setIsOpenNow(true);
      const remainingMinutes = closeTime - currentTime;
      if (remainingMinutes <= 120) {
        setClosingMessage(`Closing in ${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`);
      } else {
        setClosingMessage('Open Now · Closes at 11:30 PM');
      }
    } else {
      setIsOpenNow(false);
      setClosingMessage('Closed Now · Opens at 11:00 AM');
    }
  }, []);

  return (
    <section className="py-24 bg-[#F7FBFA] dark:bg-[#101C13]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="double-bezel-shell">
          <div className="double-bezel-core p-4 min-[360px]:p-6 sm:p-10 bg-white dark:bg-[#1F3A24]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Details */}
              <div className="lg:col-span-6 flex flex-col items-start min-w-0 w-full">
                {/* Live Open / Closing Pill */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#325736]/20 bg-[#EEF5EE] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#325736] dark:border-[#F7FBFA]/20 dark:bg-[#142318] dark:text-[#A3C2A5] mb-4 max-w-full">
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      isOpenNow ? 'bg-[#5E8662] animate-pulse' : 'bg-[#B3402F]'
                    }`}
                  />
                  <span className="truncate">{closingMessage}</span>
                </div>

                <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl font-display uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA] break-words">
                  FIND YOUR HAVEN IN ARERA COLONY
                </h2>

                <p className="mt-3 text-sm text-[#142318]/70 dark:text-[#F7FBFA]/70 leading-relaxed">
                  Located on the 1st Floor at E7/161 in Arera Colony, Bhopal. Plentiful street &amp; dedicated parking available for patrons.
                </p>

                {/* Information List */}
                <div className="mt-6 flex flex-col gap-3.5 w-full text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#325736]/10 text-[#325736] dark:bg-white/10 dark:text-[#A3C2A5]">
                      <MonolineIcon name="pin" size={16} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#142318] dark:text-[#F7FBFA]">Full Address</p>
                      <p className="text-[#38483C] dark:text-[#C9DCC9]">{BUSINESS_FACTS.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#325736]/10 text-[#325736] dark:bg-white/10 dark:text-[#A3C2A5]">
                      <MonolineIcon name="clock" size={16} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#142318] dark:text-[#F7FBFA]">Operating Hours</p>
                      <p className="text-[#38483C] dark:text-[#C9DCC9]">{BUSINESS_FACTS.hoursDisplay}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#325736]/10 text-[#325736] dark:bg-white/10 dark:text-[#A3C2A5]">
                      <MonolineIcon name="phone" size={16} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#142318] dark:text-[#F7FBFA]">Telephone Contact</p>
                      <p className="text-[#38483C] dark:text-[#C9DCC9]">{BUSINESS_FACTS.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Get Directions & Call */}
                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href={PLACEHOLDERS.GOOGLE_MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#325736] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#F7FBFA] shadow-md hover:bg-[#284A2D] transition-colors dark:bg-[#325736] dark:hover:bg-[#284A2D]"
                  >
                    <MonolineIcon name="pin" size={14} color="#F7FBFA" />
                    <span>Get Directions</span>
                  </a>

                  <a
                    href={`tel:${BUSINESS_FACTS.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[#325736]/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#325736] hover:bg-[#EEF5EE] transition-colors dark:border-[#F7FBFA]/30 dark:text-[#F7FBFA] dark:hover:bg-[#142318]"
                  >
                    <MonolineIcon name="phone" size={14} />
                    <span>Click to Call</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Styled Dark Green Themed Map Embed */}
              <div className="lg:col-span-6 relative h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-[#325736]/20 bg-[#142318] shadow-inner">
                {/* Visual Map Plinth */}
                <iframe
                  title="The Leaf Cafe Bhopal Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14674.321708893976!2d77.4243642!3d23.2125867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c43093c834a31%3A0xe54ec0478051e9ea!2sArera%20Colony%2C%20Bhopal%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-80 hover:opacity-100 transition-opacity"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Overlaid location tag */}
                <div className="absolute top-4 left-4 rounded-xl bg-[#325736]/90 text-white p-3 backdrop-blur-md border border-white/20 shadow-lg pointer-events-none">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-[#A3C2A5]">E-7 Arera Colony</p>
                  <p className="text-xs font-bold">1st Floor, Bhopal, MP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
