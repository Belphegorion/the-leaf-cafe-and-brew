import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MonolineIcon } from '../brand/MonolineIcon';

gsap.registerPlugin(ScrollTrigger);

interface RitualStep {
  num: string;
  title: string;
  desc: string;
  icon: 'table' | 'clock' | 'cup';
  pill: string;
  image: string;
  alt: string;
}

const STEPS: RitualStep[] = [
  {
    num: '01',
    title: 'RESERVE YOUR CORNER',
    desc: 'Lock in your preferred indoor seating, whether by the arched botanical window or our quiet corner table, held with precision for your party in Arera Colony.',
    icon: 'table',
    pill: 'Window & Corner Tables · Zero Booking Fee',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    alt: 'Serene indoor seating at The Leaf Cafe with natural light and botanical accents',
  },
  {
    num: '02',
    title: 'PRE-ORDER & CRAFT AHEAD',
    desc: 'Tell the baristas your custom pour-over beans and artisanal wood-fired crust preferences in advance. Our kitchen times preparation so food arrives hot on your arrival.',
    icon: 'clock',
    pill: 'Timed Kitchen Firing · 100% Pure Vegetarian',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    alt: 'Artisanal coffee brewing and fresh preparation at the espresso bar',
  },
  {
    num: '03',
    title: 'SIP, BREATHE & BELONG',
    desc: 'Walk into a serene sanctuary free from the city rush. Fresh aromas, chilled cold brews, and purely vegetarian nourishment crafted with soulful care.',
    icon: 'cup',
    pill: 'Single-Origin Roasts · Arera Sanctuary',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    alt: 'Freshly served artisanal coffee cup in a warm and calming cafe atmosphere',
  },
];

export const StoryScrollSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const cupFillRef = useRef<SVGRectElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [fillPercent, setFillPercent] = useState(25);

  useEffect(() => {
    const el = containerRef.current;
    const leftCol = leftColumnRef.current;
    const rightCol = rightColumnRef.current;
    if (!el || !leftCol || !rightCol) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setFillPercent(100);
      return;
    }

    ScrollTrigger.config({ ignoreMobileResize: true });

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 768px)',
          isMobile: '(max-width: 767px)',
        },
        context => {
          const { isDesktop } = context.conditions as { isDesktop: boolean; isMobile: boolean };

          if (isDesktop) {
            // Desktop entrance: refined horizontal glide
            gsap.fromTo(
              rightCol,
              { opacity: 0, x: 48 },
              {
                opacity: 1,
                x: 0,
                duration: 0.7,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 80%',
                  toggleActions: 'play none none none',
                },
              }
            );

            gsap.fromTo(
              leftCol,
              { opacity: 0, x: -48 },
              {
                opacity: 1,
                x: 0,
                duration: 0.7,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 80%',
                  toggleActions: 'play none none none',
                },
              }
            );
          } else {
            // Mobile entrance: subtle vertical reveal without horizontal overflow risk
            gsap.fromTo(
              leftCol,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.45,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 85%',
                  toggleActions: 'play none none none',
                },
              }
            );

            gsap.fromTo(
              rightCol,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.45,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 80%',
                  toggleActions: 'play none none none',
                },
              }
            );
          }
        }
      );

      // 2. Smooth ScrollTrigger scrub to drive liquid filling and step advancement as user scrolls through the section
      // Natural document flow: NO pin: true, completely eliminating section overlap and containing-block traps
      ScrollTrigger.create({
        trigger: el,
        start: 'top 70%',
        end: 'bottom 35%',
        scrub: 0.5,
        onUpdate: self => {
          const progress = self.progress; // 0 to 1

          // Fill cup height: from 20 to 140
          const computedFill = Math.min(100, Math.max(15, Math.round(20 + progress * 80)));
          setFillPercent(computedFill);

          if (cupFillRef.current) {
            const fillHeight = (computedFill / 100) * 140;
            const fillY = 160 - fillHeight;
            cupFillRef.current.setAttribute('y', fillY.toString());
            cupFillRef.current.setAttribute('height', fillHeight.toString());
          }

          // Advance step index based on progress
          if (progress < 0.35) {
            setActiveStep(0);
          } else if (progress < 0.7) {
            setActiveStep(1);
          } else {
            setActiveStep(2);
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      className="relative z-10 bg-[#1F3A24] dark:bg-[#101C13] dark text-[#F7FBFA] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden select-none border-b border-[#325736]/40 shadow-2xl"
    >
      {/* Background subtle botanical pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#A3C2A5_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="mx-auto max-w-7xl w-full relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#A3C2A5]">
            The Ritual Experience
          </span>
          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wider font-bold mt-2 text-white">
            HOW THE LEAF WORKS
          </h2>
          <p className="text-xs sm:text-sm text-[#C9DCC9] mt-2 font-light">
            Watch the craft unfold from table reservation to your first artisanal sip.
          </p>
        </div>

        {/* Balanced Two-Column Grid: Images on Left, Coffee Mug & 3 Points on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ================= LEFT COLUMN: ARCHED EDITORIAL PHOTOGRAPHY ================= */}
          <div
            ref={leftColumnRef}
            className="lg:col-span-5 relative order-2 lg:order-1"
          >
            <div className="relative w-full max-w-[420px] mx-auto aspect-[4/5] rounded-t-[140px] sm:rounded-t-[180px] rounded-b-3xl overflow-hidden shadow-2xl border-2 border-[#325736] bg-[#142318]">
              {/* Crossfading Step Photography */}
              {STEPS.map((step, idx) => (
                <div
                  key={step.num}
                  className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                    activeStep === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={step.image}
                    alt={step.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Subtle Dark Gradient Overlay for Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#142318] via-black/25 to-transparent" />
                </div>
              ))}

              {/* Decorative inner arch stroke echoing brand mark */}
              <div className="absolute inset-2 rounded-t-[132px] sm:rounded-t-[172px] rounded-b-2xl border border-white/20 pointer-events-none" />

              {/* Floating Active Step Badge on Photo */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-[#142318]/90 backdrop-blur-md border border-[#325736]/60 shadow-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#325736] text-white flex items-center justify-center shrink-0 shadow-md">
                    <MonolineIcon name={STEPS[activeStep].icon} size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#A3C2A5]">
                      Step {STEPS[activeStep].num} of 03
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                      {STEPS[activeStep].title}
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/10 text-[#C9DCC9] shrink-0">
                  {fillPercent}% Craft
                </span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: COFFEE MUG + 3 RITUAL POINTS ================= */}
          <div
            ref={rightColumnRef}
            className="lg:col-span-7 flex flex-col gap-5 order-1 lg:order-2"
          >
            {/* Top Interactive Coffee Mug Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#142318] border border-[#284A2D] shadow-xl flex items-center gap-5">
              {/* Vector Coffee Cup Graphic with Liquid Fill */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 240 240"
                  width="72"
                  height="72"
                  className="overflow-visible"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <clipPath id="storyCupInteriorClip">
                      <path d="M 45 40 L 195 40 C 190 130, 160 170, 120 170 C 80 170, 50 130, 45 40 Z" />
                    </clipPath>
                    <linearGradient id="storyLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A3C2A5" />
                      <stop offset="60%" stopColor="#5E8662" />
                      <stop offset="100%" stopColor="#325736" />
                    </linearGradient>
                  </defs>

                  {/* Cup Body Outline */}
                  <path
                    d="M 40 40 L 200 40 C 195 140, 165 180, 120 180 C 75 180, 45 140, 40 40 Z"
                    fill="#101C13"
                    stroke="#F7FBFA"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />

                  {/* Cup Handle */}
                  <path
                    d="M 195 55 C 240 55, 240 130, 185 130"
                    fill="none"
                    stroke="#F7FBFA"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />

                  {/* Saucer */}
                  <path
                    d="M 30 195 C 60 215, 180 215, 210 195"
                    fill="none"
                    stroke="#F7FBFA"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />

                  {/* Filling Liquid inside Cup (Masked) */}
                  <g clipPath="url(#storyCupInteriorClip)">
                    <rect
                      ref={cupFillRef}
                      x="30"
                      y="135"
                      width="180"
                      height="25"
                      fill="url(#storyLiquidGrad)"
                    />
                  </g>

                  {/* Rising Steam Wisps */}
                  <g stroke="#A3C2A5" strokeWidth="3" strokeLinecap="round" opacity="0.7">
                    <path d="M 100 25 Q 95 12, 105 2" />
                    <path d="M 120 28 Q 125 14, 115 2" />
                    <path d="M 140 25 Q 135 12, 145 2" />
                  </g>
                </svg>
              </div>

              {/* Progress Summary & Live Status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#A3C2A5]">
                    Craft &amp; Pour Progress
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {fillPercent}% Extracted
                  </span>
                </div>
                {/* Horizontal Progress Track */}
                <div className="w-full h-2 rounded-full bg-[#101C13] overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#325736] via-[#5E8662] to-[#A3C2A5] transition-all duration-300"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-[#C9DCC9] truncate font-light">
                  {STEPS[activeStep].pill}
                </div>
              </div>
            </div>

            {/* The 3 Progressive Ritual Cards */}
            <div className="flex flex-col gap-3" role="group" aria-label="Ritual steps">
              {STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={step.num}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    aria-label={`Step ${step.num}: ${step.title}`}
                    onClick={() => setActiveStep(idx)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveStep(idx);
                      }
                    }}
                    className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3C2A5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101C13] ${
                      isActive
                        ? 'bg-[#142318] border-[#5E8662] shadow-xl ring-1 ring-[#5E8662]/50 translate-x-1 sm:translate-x-2'
                        : 'bg-[#142318]/45 border-white/5 opacity-55 hover:opacity-85 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start gap-4 sm:gap-5">
                      {/* Step Number Badge */}
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-base font-bold transition-all ${
                          isActive
                            ? 'bg-[#325736] text-white shadow-md ring-2 ring-[#A3C2A5]/30'
                            : 'bg-[#1F3A24] text-[#A3C2A5]'
                        }`}
                      >
                        {step.num}
                      </span>

                      {/* Content */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MonolineIcon
                              name={step.icon}
                              size={16}
                              color={isActive ? '#A3C2A5' : '#8FA892'}
                              strokeWidth={2}
                            />
                            <h3 className="font-display uppercase tracking-wider text-base sm:text-lg font-bold text-white truncate">
                              {step.title}
                            </h3>
                          </div>
                          {isActive && (
                            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#325736] text-[#F7FBFA] shrink-0 font-semibold">
                              Active
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 text-xs sm:text-sm text-[#C9DCC9] leading-relaxed font-light">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
