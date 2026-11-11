import React, { useState } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { StoryScrollSection } from '../components/home/StoryScrollSection';
import { SignatureCarousel } from '../components/home/SignatureCarousel';
import { CountersSection } from '../components/home/CountersSection';
import { AmbienceGallery } from '../components/home/AmbienceGallery';
import { ReviewMarquee } from '../components/home/ReviewMarquee';
import { LocationSection } from '../components/home/LocationSection';
import { BrewVisualizer } from '../components/extras/BrewVisualizer';
import { InstagramSection } from '../components/home/InstagramSection';
import { TasteQuizModal } from '../components/extras/TasteQuizModal';
import { MonolineIcon } from '../components/brand/MonolineIcon';

export const HomePage: React.FC = () => {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <main id="main-content" className="flex flex-col w-full">
      {/* 1. Hero Section with parallax and magnetic CTAs */}
      <HeroSection />

      {/* 2. Counters section: 4.9 rating, 100% pure veg */}
      <CountersSection />

      {/* 3. Taste Matcher Interactive Banner */}
      <section className="py-8 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#EEF5EE] to-[#E2EEE2] dark:from-[#1F3A24] dark:to-[#142318] border border-[#325736]/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#325736] text-white flex items-center justify-center shrink-0">
              <MonolineIcon name="sparkles" size={26} />
            </div>
            <div>
              <h2 className="font-display uppercase text-lg md:text-xl font-bold text-[#142318] dark:text-[#F7FBFA]">
                Undecided on Your Order?
              </h2>
              <p className="text-xs text-[#5E8662] dark:text-[#A3C2A5] mt-0.5">
                Take our 30-second Palate Quiz to match your mood with our chef's signature roasts and sourdoughs.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setQuizOpen(true)}
            className="shrink-0 rounded-full bg-[#325736] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#284A2D] transition-colors"
          >
            Start Palate Matcher
          </button>
        </div>
      </section>

      {/* 4. Pinned GSAP ScrollTrigger Storytelling section */}
      <StoryScrollSection />

      {/* 5. Signature Items with 3D Tilt Cards */}
      <SignatureCarousel />

      {/* 6. Interactive Bespoke Brew Visualizer */}
      <BrewVisualizer />

      {/* 7. Ambience Masonry Gallery */}
      <AmbienceGallery />

      {/* 8. Instagram Community Grid */}
      <InstagramSection />

      {/* 9. Infinite Review Marquee */}
      <ReviewMarquee />

      {/* 10. Location, Live Open/Closed Status & Map Plinth */}
      <LocationSection />

      {/* Interactive Palate Quiz Modal */}
      <TasteQuizModal isOpen={quizOpen} onClose={() => setQuizOpen(false)} />
    </main>
  );
};
