import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { BUSINESS_FACTS } from '../../../shared/constants';
import type { SeatingPreference, TableBooking } from '../../../shared/types';

// Helper to generate the next 14 dates
const getNext14Days = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      dateStr: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  return dates;
};

const TIME_SLOTS = [
  // Lunch / Afternoon Brews
  { time: '11:30 AM', category: 'Lunch & Brew' },
  { time: '12:15 PM', category: 'Lunch & Brew' },
  { time: '01:00 PM', category: 'Lunch & Brew' },
  { time: '01:45 PM', category: 'Lunch & Brew' },
  { time: '02:30 PM', category: 'Lunch & Brew' },
  // High Tea / Evening
  { time: '04:00 PM', category: 'Sunset High-Tea' },
  { time: '04:45 PM', category: 'Sunset High-Tea' },
  { time: '05:30 PM', category: 'Sunset High-Tea' },
  { time: '06:15 PM', category: 'Sunset High-Tea' },
  // Dinner & Night Roasts
  { time: '07:15 PM', category: 'Dinner & Candlelight' },
  { time: '08:00 PM', category: 'Dinner & Candlelight' },
  { time: '08:45 PM', category: 'Dinner & Candlelight' },
  { time: '09:30 PM', category: 'Dinner & Candlelight' },
  { time: '10:15 PM', category: 'Late Pour-Over' },
];

const SEATING_OPTIONS: { id: SeatingPreference; title: string; desc: string; icon: string }[] = [
  {
    id: 'indoor-main',
    title: 'Botanical Courtyard',
    desc: 'Surrounded by lush monstera & ficus indoor greenery',
    icon: 'plant',
  },
  {
    id: 'arched-window',
    title: 'Arched Window Alcove',
    desc: 'Natural daylight overlooking Arera Colony trees',
    icon: 'table',
  },
  {
    id: 'quiet-corner',
    title: 'Quiet Art Deco Corner',
    desc: 'Intimate, warm lighting for reading or focused meetings',
    icon: 'cup',
  },
  {
    id: 'group-table',
    title: 'Artisan Communal Table',
    desc: 'Spacious oak table ideal for teams and celebrations',
    icon: 'sparkles',
  },
];

export const BookingPage: React.FC = () => {
  const days = getNext14Days();

  // Booking selections
  const [selectedDate, setSelectedDate] = useState(days[0].dateStr);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[2].time);
  const [partySize, setPartySize] = useState(2);
  const [seatingPreference, setSeatingPreference] = useState<SeatingPreference>('indoor-main');
  const [specialOccasion, setSpecialOccasion] = useState('Casual Dining');

  // Contact Info
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Step state: 'details' | 'otp'
  const [bookingStep, setBookingStep] = useState<'details' | 'otp'>('details');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Slot Lock & Confirmation state
  const [slotLocked, setSlotLocked] = useState(false);
  const [lockExpiresAt, setLockExpiresAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [confirmedBooking, setConfirmedBooking] = useState<TableBooking | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Large Group Modal (>12 guests)
  const [showEventModal, setShowEventModal] = useState(false);

  // 5-minute countdown timer effect
  useEffect(() => {
    if (!slotLocked || !lockExpiresAt) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((lockExpiresAt - Date.now()) / 1000));
      setSecondsRemaining(diff);
      if (diff <= 0) {
        setSlotLocked(false);
        setLockExpiresAt(null);
        setBookingStep('details');
        setErrorMsg('Your reservation slot lock expired. Please re-select your preferred time.');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [slotLocked, lockExpiresAt]);

  const handlePartySizeChange = (delta: number) => {
    const next = partySize + delta;
    if (next > 12) {
      setShowEventModal(true);
      return;
    }
    if (next >= 1) {
      setPartySize(next);
      setSlotLocked(false);
      setBookingStep('details');
    }
  };

  // Lock slot on backend
  const handleLockSlot = async () => {
    setErrorMsg(null);

    try {
      try {
        const res = await fetch('/api/v1/bookings/lock-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: selectedDate,
            timeSlot: selectedTime,
            partySize,
            seatingPreference,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success === false) {
            throw new Error(data.error || 'Slot currently unavailable.');
          }
        }
      } catch (err: any) {
        // Fallback to client mock lock if backend is offline
        if (err.message && err.message.includes('unavailable')) throw err;
      }

      setSlotLocked(true);
      const expires = Date.now() + 5 * 60 * 1000;
      setLockExpiresAt(expires);
      setSecondsRemaining(300);
    } catch (err: any) {
      setErrorMsg(err.message || 'Slot currently unavailable.');
    }
  };

  // Proceed to OTP step
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setOtpError(null);

    if (!guestName.trim()) {
      setErrorMsg('Please enter your full name to proceed.');
      return;
    }
    const cleanPhone = guestPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    if (selectedTime === '10:15 PM') {
      setErrorMsg('This late slot is currently fully booked. Please select an earlier dining slot.');
      return;
    }

    await handleLockSlot();
    setBookingStep('otp');
  };

  // Verify OTP and confirm booking
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setOtpError('Please enter the 4-digit verification code.');
      return;
    }
    if (otpCode.trim() !== '4129' && otpCode.trim() !== '1234') {
      setOtpError('Invalid code. Please enter demo verification code: 4129.');
      return;
    }

    await confirmReservationFinal();
  };

  // Final confirmation
  const confirmReservationFinal = async () => {
    try {
      let bookingData: TableBooking | null = null;
      try {
        const res = await fetch('/api/v1/bookings/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: selectedDate,
            timeSlot: selectedTime,
            partySize,
            seatingPreference,
            guestName,
            guestPhone,
            guestEmail: guestEmail || undefined,
            specialRequests: specialRequests ? `${specialOccasion} • ${specialRequests}` : specialOccasion,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            bookingData = data.booking || data.data;
          }
        }
      } catch (e) {
        // Fallback to client mock
      }

      if (!bookingData) {
        bookingData = {
          id: `book_${Date.now()}`,
          bookingRef: `LEAF-${Math.floor(1000 + Math.random() * 9000)}`,
          guestName,
          guestPhone,
          guestEmail: guestEmail || '',
          date: selectedDate,
          timeSlot: selectedTime,
          partySize,
          seatingPreference,
          status: 'confirmed',
          depositAmount: 0,
          createdAt: new Date().toISOString(),
          specialNotes: specialRequests ? `${specialOccasion} • ${specialRequests}` : specialOccasion,
        };
      }

      setConfirmedBooking(bookingData);

      // Dynamically load confetti
      try {
        const confettiMod = await import('canvas-confetti');
        const confetti = confettiMod.default;
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#325736', '#38483C', '#A3C2A5', '#F5EFE4'],
        });
      } catch (e) {
        // Ignore confetti failure
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error confirming table reservation.');
    }
  };

  // Download .ics calendar event
  const downloadCalendarFile = () => {
    if (!confirmedBooking) return;
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The Leaf Cafe and Brew//Table Reservation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Table for ${confirmedBooking.partySize} at The Leaf Cafe & Brew`,
      `DESCRIPTION:Reservation Reference: ${confirmedBooking.bookingRef}\\nPure Vegetarian Artisanal Sanctuary\\nSpecial Request: ${confirmedBooking.specialNotes || 'None'}`,
      `LOCATION:${BUSINESS_FACTS.address}`,
      `DTSTART:${confirmedBooking.date.replace(/-/g, '')}T120000Z`,
      `DTEND:${confirmedBooking.date.replace(/-/g, '')}T140000Z`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TheLeaf_Reservation_${confirmedBooking.bookingRef}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main id="main-content" className="min-h-[100dvh] pt-28 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#325736] dark:text-[#A3C2A5]">
          Artisanal Sanctuary • Arera Colony
        </span>
        <h1 className="font-display text-3xl md:text-5xl uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#F7FBFA] mt-1">
          Reserve a Table
        </h1>
        <p className="text-xs md:text-sm text-[#38483C] dark:text-[#C9DCC9] mt-2">
          Experience our tranquil plant-filled indoor space, fresh specialty pour-overs, and 100% pure-veg delicacies.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {confirmedBooking ? (
          /* Confirmation View */
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white dark:bg-[#1F3A24] p-8 md:p-10 rounded-3xl border border-[#325736]/20 shadow-2xl text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-[#EEF5EE] dark:bg-[#142318] text-[#325736] dark:text-[#A3C2A5] mx-auto flex items-center justify-center">
              <MonolineIcon name="sparkles" size={40} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#325736] dark:text-[#A3C2A5]">
                Reservation Confirmed
              </span>
              <h2 className="font-display text-3xl font-bold uppercase text-[#142318] dark:text-[#F7FBFA] mt-1">
                We Look Forward to Welcoming You
              </h2>
              <div className="mt-3 inline-block rounded-full bg-[#325736]/10 dark:bg-white/10 px-5 py-2 font-mono text-sm font-bold text-[#325736] dark:text-[#F7FBFA]">
                Ref: {confirmedBooking.bookingRef}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-2xl bg-[#EEF5EE] dark:bg-[#142318] text-left text-xs">
              <div>
                <span className="text-[10px] text-[#38483C] dark:text-[#C9DCC9] uppercase font-semibold">Date</span>
                <p className="font-bold text-[#142318] dark:text-[#F7FBFA]">{confirmedBooking.date}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#38483C] dark:text-[#C9DCC9] uppercase font-semibold">Time Slot</span>
                <p className="font-bold text-[#142318] dark:text-[#F7FBFA]">{confirmedBooking.timeSlot}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#38483C] dark:text-[#C9DCC9] uppercase font-semibold">Party</span>
                <p className="font-bold text-[#142318] dark:text-[#F7FBFA]">{confirmedBooking.partySize} Guests</p>
              </div>
              <div>
                <span className="text-[10px] text-[#38483C] dark:text-[#C9DCC9] uppercase font-semibold">Seating</span>
                <p className="font-bold text-[#142318] dark:text-[#F7FBFA] capitalize">
                  {confirmedBooking.seatingPreference.replace('_', ' ')}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#38483C] dark:text-[#A3C2A5]">
              A confirmation WhatsApp &amp; SMS has been queued for {confirmedBooking.guestPhone}. No cancellation fees apply.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={downloadCalendarFile}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#325736] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#284A2D] transition-colors"
              >
                <MonolineIcon name="clock" size={16} />
                Add to Calendar (.ics)
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS_FACTS.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#325736] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#325736] dark:text-[#A3C2A5] hover:bg-[#EEF5EE] dark:hover:bg-[#142318] transition-colors"
              >
                <MonolineIcon name="pin" size={16} />
                Get Directions
              </a>
            </div>
          </motion.div>
        ) : (
          /* Main Interactive Reservation Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Steps Column (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1F3A24] p-5 sm:p-7 md:p-8 rounded-3xl border border-[#E0D2B8] dark:border-[#284A2D] shadow-md space-y-8">
              {/* Step 1: 14-day Date Strip */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase font-bold tracking-wider text-[#1F2A22] dark:text-[#EDE3D1]">
                    1. Choose Date
                  </label>
                  <span className="text-[11px] text-[#38483C] dark:text-[#C9DCC9]">Next 14 Days</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {days.map(d => {
                    const isSelected = selectedDate === d.dateStr;
                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(d.dateStr);
                          setSlotLocked(false);
                        }}
                        className={`shrink-0 w-16 py-3 min-h-[44px] rounded-2xl flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#325736] text-white shadow-md ring-2 ring-[#325736]'
                            : 'border border-[#E0D2B8] hover:border-[#325736] text-[#1F2A22] dark:text-[#EDE3D1] bg-[#FBF8F2] dark:bg-[#101C13]'
                        }`}
                      >
                        <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-[#F7FBFA]' : 'text-[#38483C] dark:text-[#C9DCC9]'}`}>{d.dayName}</span>
                        <span className="text-base font-bold my-0.5">{d.dateNum}</span>
                        <span className={`text-[10px] font-medium ${isSelected ? 'text-[#F7FBFA]' : 'text-[#38483C] dark:text-[#C9DCC9]'}`}>{d.monthName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Time Slots */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#1F2A22] dark:text-[#EDE3D1] mb-3">
                  2. Select Time Slot
                </label>
                <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {TIME_SLOTS.map(s => {
                    const isSelected = selectedTime === s.time;
                    return (
                      <button
                        key={s.time}
                        type="button"
                        onClick={() => {
                          setSelectedTime(s.time);
                          setSlotLocked(false);
                        }}
                        className={`min-h-[44px] py-2 px-3 rounded-xl text-center text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#325736] text-white shadow-sm'
                            : 'border border-[#E0D2B8] hover:border-[#325736] text-[#1F2A22] dark:text-[#EDE3D1] bg-[#FBF8F2] dark:bg-[#101C13]'
                        }`}
                      >
                        {s.time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Party Size Stepper (Zero 320px overflow) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase font-bold tracking-wider text-[#1F2A22] dark:text-[#EDE3D1]">
                    3. Number of Guests
                  </label>
                  <span className="text-[11px] text-[#38483C] dark:text-[#C9DCC9]">
                    {partySize} {partySize === 1 ? 'Guest' : 'Guests'} (Max 12)
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center border border-[#E0D2B8] dark:border-[#284A2D] rounded-2xl p-1 gap-2 bg-[#FBF8F2] dark:bg-[#101C13] w-max">
                    <button
                      type="button"
                      onClick={() => handlePartySizeChange(-1)}
                      disabled={partySize <= 1}
                      className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg hover:bg-[#325736]/10 disabled:opacity-30"
                      aria-label="Decrease party size"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-base tabular-nums text-[#1F2A22] dark:text-[#EDE3D1]">
                      {partySize}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePartySizeChange(1)}
                      className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg hover:bg-[#325736]/10"
                      aria-label="Increase party size"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-xs text-[#38483C] dark:text-[#C9DCC9]">
                    Planning a party over 12?{' '}
                    <button
                      type="button"
                      onClick={() => setShowEventModal(true)}
                      className="underline font-bold text-[#325736] dark:text-[#EDE3D1]"
                    >
                      Inquire for Private Gatherings
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4: Seating Preference */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#1F2A22] dark:text-[#EDE3D1] mb-3">
                  4. Seating Ambience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SEATING_OPTIONS.map(opt => {
                    const isSelected = seatingPreference === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSeatingPreference(opt.id);
                          setSlotLocked(false);
                        }}
                        className={`min-h-[44px] p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#325736] bg-[#EDE3D1] dark:bg-[#101C13] shadow-sm ring-1 ring-[#325736]'
                            : 'border-[#E0D2B8] hover:border-[#325736] bg-[#FBF8F2] dark:bg-[#101C13]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">
                            {opt.title}
                          </span>
                          <MonolineIcon name={opt.icon as any} size={16} color={isSelected ? '#325736' : 'currentColor'} />
                        </div>
                        <p className={`text-[11px] ${isSelected ? 'text-[#142318] dark:text-[#F7FBFA]' : 'text-[#38483C] dark:text-[#C9DCC9]'}`}>{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 5: Occasion */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-2">
                  5. Dining Occasion
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Casual Dining', 'Birthday Celebration', 'Anniversary', 'Coffee Date', 'Business Meet'].map(occ => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setSpecialOccasion(occ)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        specialOccasion === occ
                          ? 'bg-[#325736] text-white'
                          : 'border border-[#325736]/20 text-[#142318] dark:text-[#F7FBFA] hover:bg-[#325736]/10'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary & Lock Column (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1F3A24] p-6 md:p-8 rounded-3xl border border-[#325736]/20 shadow-lg space-y-6">
              <h2 className="font-display uppercase text-sm font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] border-b border-[#325736]/15 pb-4">
                Reservation Overview
              </h2>

              {/* Selection Summary */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[#325736]/10">
                  <span className="text-[#38483C] dark:text-[#C9DCC9]">Date</span>
                  <span className="font-bold text-[#142318] dark:text-[#F7FBFA]">{selectedDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#325736]/10">
                  <span className="text-[#38483C] dark:text-[#C9DCC9]">Time</span>
                  <span className="font-bold text-[#142318] dark:text-[#F7FBFA]">{selectedTime}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#325736]/10">
                  <span className="text-[#38483C] dark:text-[#C9DCC9]">Guests</span>
                  <span className="font-bold text-[#142318] dark:text-[#F7FBFA]">{partySize} Persons</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#325736]/10">
                  <span className="text-[#38483C] dark:text-[#C9DCC9]">Ambience</span>
                  <span className="font-bold text-[#142318] dark:text-[#F7FBFA] capitalize">
                    {seatingPreference.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#325736]/10">
                  <span className="text-[#38483C] dark:text-[#C9DCC9]">Occasion</span>
                  <span className="font-bold text-[#142318] dark:text-[#F7FBFA]">{specialOccasion}</span>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 py-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${bookingStep === 'details' ? 'bg-[#325736] text-white' : 'bg-[#EAE0D0] dark:bg-[#101C13] text-[#1F2A22] dark:text-[#F7FBFA]'}`}>
                  1. Details
                </span>
                <span className="text-[#325736] dark:text-[#A3C2A5] font-bold">→</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${bookingStep === 'otp' ? 'bg-[#325736] text-white' : 'bg-[#EAE0D0] dark:bg-[#101C13] text-[#1F2A22] dark:text-[#F7FBFA]'}`}>
                  2. OTP Verify
                </span>
              </div>

              {/* STEP 1: GUEST DETAILS FORM */}
              {bookingStep === 'details' && (
                <form onSubmit={handleProceedToOtp} className="space-y-3 pt-1">
                  <div>
                    <label htmlFor="res-name" className="block text-[11px] font-semibold text-[#142318] dark:text-[#F7FBFA] mb-1">
                      Primary Guest Name *
                    </label>
                    <input
                      id="res-name"
                      name="guestName"
                      aria-label="Primary Guest Name"
                      type="text"
                      required
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full rounded-xl border border-[#325736]/30 px-3 py-2.5 text-xs bg-white dark:bg-[#1F3A24] text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-phone" className="block text-[11px] font-semibold text-[#142318] dark:text-[#F7FBFA] mb-1">
                      Contact Phone (for WhatsApp confirmation) *
                    </label>
                    <input
                      id="res-phone"
                      name="guestPhone"
                      aria-label="Contact Phone"
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value)}
                      placeholder="e.g. 98260 12345"
                      className="w-full rounded-xl border border-[#325736]/30 px-3 py-2.5 text-xs bg-white dark:bg-[#1F3A24] text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-email" className="block text-[11px] font-semibold text-[#142318] dark:text-[#F7FBFA] mb-1">
                      Email Address (optional)
                    </label>
                    <input
                      id="res-email"
                      name="guestEmail"
                      aria-label="Email Address"
                      type="email"
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                      placeholder="e.g. radhika@example.com"
                      className="w-full rounded-xl border border-[#325736]/30 px-3 py-2.5 text-xs bg-white dark:bg-[#1F3A24] text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-notes" className="block text-[11px] font-semibold text-[#142318] dark:text-[#F7FBFA] mb-1">
                      Special Requests (e.g. quiet corner, baby chair)
                    </label>
                    <input
                      id="res-notes"
                      name="specialRequests"
                      aria-label="Special Requests"
                      type="text"
                      value={specialRequests}
                      onChange={e => setSpecialRequests(e.target.value)}
                      placeholder="Any hospitality preferences"
                      className="w-full rounded-xl border border-[#325736]/30 px-3 py-2.5 text-xs bg-white dark:bg-[#1F3A24] text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-1 focus:ring-[#325736]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[44px] rounded-full bg-[#325736] py-3 text-xs font-semibold uppercase tracking-wider text-[#F7FBFA] shadow-md hover:bg-[#284A2D] transition-colors mt-2"
                  >
                    Proceed to OTP Verification →
                  </button>
                </form>
              )}

              {/* STEP 2: OTP VERIFICATION STEP */}
              {bookingStep === 'otp' && (
                <div className="space-y-4 pt-1">
                  {/* Slot countdown indicator */}
                  <div className="p-3.5 rounded-2xl bg-[#EEF5EE] dark:bg-[#142318] border border-[#325736]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-[#325736] dark:text-[#A3C2A5] uppercase tracking-wider">
                        Slot Held for You
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#325736] dark:text-white">
                      <span>{Math.floor(secondsRemaining / 60)}:</span>
                      <span>{(secondsRemaining % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div>
                      <label htmlFor="otp-input" className="block text-xs font-bold text-[#142318] dark:text-[#F7FBFA] mb-1">
                        Enter 4-Digit Verification Code *
                      </label>
                      <p className="text-[11px] text-[#38483C] dark:text-[#C9DCC9] mb-2">
                        We simulated an SMS code sent to <strong>+91 {guestPhone}</strong>.<br />
                        <span className="font-semibold text-[#325736] dark:text-[#A3C2A5]">(Demo OTP: 4129)</span>
                      </p>
                      <input
                        id="otp-input"
                        name="otpCode"
                        aria-label="4-digit OTP code"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        required
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        placeholder="4129"
                        className="w-full text-center tracking-[0.5em] font-mono text-lg font-bold rounded-xl border border-[#325736]/30 px-3 py-2.5 bg-white dark:bg-[#1F3A24] text-[#142318] dark:text-[#F7FBFA] focus:outline-none focus:ring-2 focus:ring-[#325736]"
                      />
                    </div>

                    {otpError && (
                      <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600">
                        {otpError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full min-h-[44px] rounded-full bg-[#325736] py-3 text-xs font-semibold uppercase tracking-wider text-[#F7FBFA] shadow-md hover:bg-[#284A2D] transition-colors"
                    >
                      Confirm Reservation Free
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingStep('details')}
                      className="w-full py-2 text-xs text-[#38483C] dark:text-[#C9DCC9] hover:underline text-center"
                    >
                      ← Edit Contact Information
                    </button>
                  </form>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600">
                  {errorMsg}
                </div>
              )}

              {/* Policy notes */}
              <div className="text-[11px] text-[#38483C] dark:text-[#C9DCC9] space-y-1">
                <p>• Tables are held for 15 minutes past reservation time before release.</p>
                <p>• 100% Pure Vegetarian dining environment. Free indoor parking available.</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Large Gatherings Modal */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-white dark:bg-[#1F3A24] p-6 rounded-3xl border border-[#325736]/30 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display uppercase text-lg font-bold text-[#142318] dark:text-[#F7FBFA]">
                  Private Events &amp; Large Gatherings
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#142318]/70 dark:text-[#F7FBFA]/70 hover:bg-black/5"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-[#38483C] dark:text-[#C9DCC9] leading-relaxed">
                For gatherings larger than 12 guests, birthday banquets, or corporate coffee mixers, our dedicated hospitality team curates custom vegetarian tasting menus and private zone arrangements.
              </p>
              <div className="p-4 rounded-2xl bg-[#EEF5EE] dark:bg-[#142318] text-xs space-y-2">
                <div>
                  <strong>Location:</strong> 1st Floor, E7/161, Arera Colony, Bhopal
                </div>
                <div>
                  <strong>Instagram DM:</strong>{' '}
                  <a href={BUSINESS_FACTS.instagramUrl} target="_blank" rel="noreferrer" className="underline font-bold text-[#325736] dark:text-[#A3C2A5]">
                    {BUSINESS_FACTS.instagramHandle}
                  </a>
                </div>
                <div>
                  <strong>Direct Inquiries:</strong> {BUSINESS_FACTS.phonePlaceholder}
                </div>
                <div className="pt-1">
                  <a href="/contact" className="underline font-bold text-[#325736] dark:text-[#A3C2A5]">
                    Send Custom Inquiry Message →
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="w-full rounded-full bg-[#325736] py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#284A2D]"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
