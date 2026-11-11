import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MonolineIcon } from '../brand/MonolineIcon';

gsap.registerPlugin(ScrollTrigger);

export const StoryScrollSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cupFillRef = useRef<SVGRectElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'RESERVE YOUR CORNER',
      desc: 'Lock in your preferred indoor seating, whether by the arched botanical window or our quiet corner table, held with precision for your party.',
      icon: 'table' as const,
    },
    {
      num: '02',
      title: 'PRE-ORDER & CRAFT AHEAD',
      desc: 'Tell the baristas your custom pour-over beans and pizza preferences in advance. Our kitchen times preparation so food arrives hot on your arrival.',
      icon: 'clock' as const,
    },
    {
      num: '03',
      title: 'SIP, BREATHE & BELONG',
      desc: 'Walk into a serene sanctuary free from the city rush. Fresh aromas, chilled cold brews, and purely vegetarian nourishment crafted with care.',
      icon: 'cup' as const,
    },
  ];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 0.6,
        onUpdate: self => {
          const progress = self.progress; // 0 to 1

          // Fill cup height: from 0 to 140
          if (cupFillRef.current) {
            const fillHeight = progress * 140;
            const fillY = 160 - fillHeight;
            cupFillRef.current.setAttribute('y', fillY.toString());
            cupFillRef.current.setAttribute('height', fillHeight.toString());
          }

          // Step progression
          if (progress < 0.33) {
            setActiveStep(0);
          } else if (progress < 0.66) {
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
      className="relative min-h-screen bg-[#1F3A24] text-[#F7FBFA] flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      <div className="mx-auto max-w-7xl w-full">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#A3C2A5]">
            The Ritual Experience
          </span>
          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wider font-bold mt-2 text-white">
            HOW THE LEAF WORKS
          </h2>
          <p className="text-sm text-[#C9DCC9] mt-3 font-light">
            Scroll down to watch the craft unfold from reservation to your first sip.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: The Interactive Filling Coffee Cup Graphic */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl bg-[#142318] border border-[#284A2D] shadow-2xl">
              {/* SVG Coffee Cup Graphic with Dynamic Liquid Fill */}
              <svg
                viewBox="0 0 240 240"
                width="220"
                height="220"
                className="overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Cup Mask */}
                  <clipPath id="cupInteriorClip">
                    <path d="M 45 40 L 195 40 C 190 130, 160 170, 120 170 C 80 170, 50 130, 45 40 Z" />
                  </clipPath>
                  {/* Liquid gradient */}
                  <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#5E8662" />
                    <stop offset="100%" stopColor="#325736" />
                  </linearGradient>
                </defs>

                {/* Cup Outline Stroke */}
                <path
                  d="M 40 40 L 200 40 C 195 140, 165 180, 120 180 C 75 180, 45 140, 40 40 Z"
                  fill="#101C13"
                  stroke="#F7FBFA"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Cup Handle */}
                <path
                  d="M 195 55 C 240 55, 240 130, 185 130"
                  fill="none"
                  stroke="#F7FBFA"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Saucer */}
                <path
                  d="M 30 195 C 60 215, 180 215, 210 195"
                  fill="none"
                  stroke="#F7FBFA"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Filling Liquid inside Cup (Masked) */}
                <g clipPath="url(#cupInteriorClip)">
                  <rect
                    ref={cupFillRef}
                    x="30"
                    y="160"
                    width="180"
                    height="0"
                    fill="url(#liquidGrad)"
                  />
                  {/* Liquid surface wave ripple line */}
                  <path
                    d="M 40 0 Q 80 8, 120 0 T 200 0"
                    fill="none"
                    stroke="#A3C2A5"
                    strokeWidth="3"
                  />
                </g>

                {/* Rising Steam Lines */}
                <g stroke="#A3C2A5" strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
                  <path d="M 100 25 Q 95 10, 105 0" />
                  <path d="M 120 28 Q 125 12, 115 0" />
                  <path d="M 140 25 Q 135 10, 145 0" />
                </g>
              </svg>

              {/* Live filling percentage pill */}
              <div className="mt-4 rounded-full bg-[#325736] px-4 py-1 text-xs font-semibold tracking-wider text-[#F7FBFA]">
                Step {activeStep + 1} of 3 · {activeStep === 0 ? 'Table Reserved' : activeStep === 1 ? 'Brewing Order' : 'Served Fresh'}
              </div>
            </div>
          </div>

          {/* Right Column: Progressive Steps with Highlight Transition */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.num}
                  className={`p-6 sm:p-8 rounded-2xl border transition-all duration-500 ${
                    isActive
                      ? 'bg-[#142318] border-[#5E8662] shadow-xl scale-[1.02]'
                      : 'bg-[#142318]/40 border-[#284A2D]/50 opacity-40'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold transition-colors ${
                        isActive
                          ? 'bg-[#325736] text-white shadow-md'
                          : 'bg-[#1F3A24] text-[#A3C2A5]'
                      }`}
                    >
                      {step.num}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <MonolineIcon
                          name={step.icon}
                          size={18}
                          color={isActive ? '#A3C2A5' : '#5E8662'}
                        />
                        <h3 className="font-display uppercase tracking-wider text-xl font-bold text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm text-[#C9DCC9] leading-relaxed font-light">
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
    </section>
  );
};
