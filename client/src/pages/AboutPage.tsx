import React from 'react';
import { WaveDivider } from '../components/brand/WaveDivider';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import { TheLeafMark } from '../components/brand/TheLeafMark';

export const AboutPage: React.FC = () => {
  return (
    <main id="main-content" className="min-h-[100dvh] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#38483C] dark:text-[#A3C2A5]">
          Our Story &amp; Philosophy
        </span>
        <h1 className="text-4xl sm:text-6xl font-display uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#F7FBFA] mt-2">
          CRAFTED BY NATURE, BREWED WITH INTENTION
        </h1>
        <p className="mt-4 text-sm sm:text-base text-[#1F2A22]/70 dark:text-[#F7FBFA]/70 leading-relaxed font-light">
          "The Leaf" began with a simple yearning: to create a mindful culinary refuge in Arera Colony, Bhopal, where pure vegetarian cuisine and artisanal coffee extraction harmonize in stillness.
        </p>
      </div>

      <WaveDivider strokeColor="#325736" animated={true} className="mb-16" />

      {/* Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#325736]/10 px-3.5 py-1 text-xs font-semibold text-[#325736] dark:bg-white/10 dark:text-[#A3C2A5]">
            <TheLeafMark size={16} strokeColor="#325736" />
            <span>100% Pure Vegetarian Integrity</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#F7FBFA]">
            A ZERO-COMPROMISE VEGETARIAN SANCTUARY
          </h2>
          <p className="text-sm text-[#1F2A22]/75 dark:text-[#F7FBFA]/75 leading-relaxed">
            In a dining culture where vegetarian options are often afterthoughts, The Leaf is built from the ground up to celebrate the soil. We serve strictly pure vegetarian delicacies—no meat, no poultry, no fish, and no gelatin. Every sauce, reduction, and broth is made fresh in our kitchen daily.
          </p>
          <p className="text-sm text-[#1F2A22]/75 dark:text-[#F7FBFA]/75 leading-relaxed">
            From our hand-stretched Neapolitan-style dough to our slow-simmered mushroom truffle alfredo and spiced peri peri paneer pizzas, our culinary team proves that pure vegetarian cooking can be deeply indulgent and memorable.
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="double-bezel-shell">
            <div className="double-bezel-core p-3 arch-mask bg-[#284A2D] dark">
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
                alt="Artisan coffee beans and brew bar at The Leaf Bhopal"
                className="w-full h-[400px] object-cover arch-mask"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillars Section */}
      <div className="mb-6">
        <h2 className="sr-only">Our Core Culinary and Hospitality Pillars</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-white/90 dark:bg-[#1A261D] border border-[#E0D2B8] dark:border-[#325736]/20 shadow-sm flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-full bg-[#325736]/10 flex items-center justify-center text-[#325736] dark:bg-white/10 dark:text-[#A3C2A5] mb-5">
              <MonolineIcon name="cup" size={24} strokeWidth={2.2} />
            </div>
            <h3 className="font-display uppercase text-lg font-bold text-[#1F2A22] dark:text-[#F7FBFA]">
              Artisanal Extraction
            </h3>
            <p className="mt-2 text-xs text-[#1F2A22]/70 dark:text-[#F7FBFA]/70 leading-relaxed">
              We source specialty Arabica beans directly from sustainable estates in Chikmagalur and Coorg, dialing in grind sizes and temperatures for each brewing method: V60 pour-overs, aeropress, and 18-hour cold extractions.
            </p>
          </div>
          <span className="mt-6 text-[10px] uppercase font-mono tracking-widest text-[#38483C] dark:text-[#A3C2A5]">Pillar 01</span>
        </div>

        <div className="p-8 rounded-3xl bg-white/90 dark:bg-[#1A261D] border border-[#E0D2B8] dark:border-[#325736]/20 shadow-sm flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-full bg-[#325736]/10 flex items-center justify-center text-[#325736] dark:bg-white/10 dark:text-[#A3C2A5] mb-5">
              <MonolineIcon name="plant" size={24} strokeWidth={2.2} />
            </div>
            <h3 className="font-display uppercase text-lg font-bold text-[#1F2A22] dark:text-[#F7FBFA]">
              Botanical Architecture
            </h3>
            <p className="mt-2 text-xs text-[#1F2A22]/70 dark:text-[#F7FBFA]/70 leading-relaxed">
              Our 1st-floor space in E-7 Arera Colony is designed as an unhurried green haven. Flooded with natural daylight, arched windows, living plants, and ergonomic wood seating for work or intimate conversations.
            </p>
          </div>
          <span className="mt-6 text-[10px] uppercase font-mono tracking-widest text-[#38483C] dark:text-[#A3C2A5]">Pillar 02</span>
        </div>

        <div className="p-8 rounded-3xl bg-white/90 dark:bg-[#1A261D] border border-[#E0D2B8] dark:border-[#325736]/20 shadow-sm flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-full bg-[#325736]/10 flex items-center justify-center text-[#325736] dark:bg-white/10 dark:text-[#A3C2A5] mb-5">
              <MonolineIcon name="star" size={24} strokeWidth={2.2} />
            </div>
            <h3 className="font-display uppercase text-lg font-bold text-[#1F2A22] dark:text-[#F7FBFA]">
              Bhopal Hospitality
            </h3>
            <p className="mt-2 text-xs text-[#1F2A22]/70 dark:text-[#F7FBFA]/70 leading-relaxed">
              Honoured by a 4.9-star Google rating across 646+ genuine reviews. We greet each guest with warmth, accommodating Jain diets, gluten sensitivities, and customized brew strengths.
            </p>
          </div>
          <span className="mt-6 text-[10px] uppercase font-mono tracking-widest text-[#38483C] dark:text-[#A3C2A5]">Pillar 03</span>
        </div>
      </div>
    </main>
  );
};
