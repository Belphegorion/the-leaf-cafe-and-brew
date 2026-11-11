import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { TheLeafMark } from '../brand/TheLeafMark';
import { MonolineIcon } from '../brand/MonolineIcon';
import { LeafVeinPattern } from '../brand/LeafVeinPattern';

const ROTATING_WORDS = ['BREATHE', 'SAVOUR', 'BELONG', 'UNWIND'];

export const HeroSection: React.FC = () => {
  const [wordIndex, setWordIndex] = useState(0);

  // Rotating words interval
  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex(prev => (prev + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Parallax / mouse reaction for floating cup & leaf
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const cupRotate = useTransform(smoothX, [-300, 300], [-12, 12]);
  const leafTranslateY = useTransform(smoothY, [-300, 300], [-18, 18]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-[92dvh] flex items-center justify-center pt-28 pb-16 overflow-hidden leaf-vein-pattern"
    >
      <LeafVeinPattern opacity={0.04} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Line-masked headline, Rotating word, Magnetic CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-[#325736]/20 bg-[#EEF5EE] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#325736] dark:border-[#F7FBFA]/20 dark:bg-[#1F3A24] dark:text-[#A3C2A5] mb-6 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#5E8662] animate-pulse" />
              <span>Arera Colony, Bhopal · 100% Pure Vegetarian</span>
            </motion.div>

            {/* Headline with Mask Reveal */}
            <h1 className="font-display uppercase text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#142318] dark:text-[#F7FBFA] leading-[1.05]">
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  WHERE ARTISAN BREWS
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="block text-[#325736] dark:text-[#5E8662]"
                >
                  MEET PEACEFUL
                </motion.span>
              </span>
              <span className="flex items-center gap-3 overflow-hidden mt-1">
                <motion.span
                  key={wordIndex}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[#5E8662] dark:text-[#A3C2A5] underline decoration-[#325736]/30 font-artdeco italic font-normal"
                >
                  {ROTATING_WORDS[wordIndex]}.
                </motion.span>
              </span>
            </h1>

            {/* Sub-headline description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-6 text-base sm:text-lg text-[#142318]/80 dark:text-[#F7FBFA]/80 max-w-xl font-normal leading-relaxed"
            >
              Step away from the rush. Experience single-origin pour-overs, chilled botanical cold brews, and hand-tossed artisan pizzas in Bhopal’s calmest vegetarian haven.
            </motion.p>

            {/* Magnetic CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/book"
                data-cursor="Book"
                className="group relative inline-flex items-center justify-center rounded-full bg-[#325736] px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#F7FBFA] shadow-lg transition-all duration-300 hover:bg-[#284A2D] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] dark:bg-[#5E8662] dark:hover:bg-[#325736]"
              >
                <span>Reserve a Table</span>
                <span className="ml-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
                  <MonolineIcon name="arrow-right" size={14} color="#F7FBFA" strokeWidth={2.4} />
                </span>
              </Link>

              <Link
                to="/menu"
                data-cursor="Menu"
                className="group relative inline-flex items-center justify-center rounded-full border border-[#325736]/30 bg-transparent px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#325736] transition-all duration-300 hover:border-[#325736] hover:bg-[#EEF5EE] active:scale-[0.98] dark:border-[#F7FBFA]/30 dark:text-[#F7FBFA] dark:hover:bg-[#1F3A24]"
              >
                <span>Explore Menu</span>
                <span className="ml-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#325736]/10 transition-transform duration-300 group-hover:translate-x-1 dark:bg-white/10">
                  <MonolineIcon name="spoon" size={14} strokeWidth={2.4} />
                </span>
              </Link>
            </motion.div>

            {/* Trust and Social Proof Pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-10 flex items-center gap-4 text-xs text-[#142318]/70 dark:text-[#F7FBFA]/70"
            >
              <div className="flex items-center gap-1 text-[#C98A1B]">
                {[...Array(5)].map((_, i) => (
                  <MonolineIcon key={i} name="star" size={14} color="#C98A1B" />
                ))}
              </div>
              <span className="font-medium text-[#142318] dark:text-[#F7FBFA]">
                <strong>4.9 / 5.0</strong> Rating on Google
              </span>
              <span className="text-[#5E8662]">·</span>
              <span>646+ Bhopal Reviewers</span>
            </motion.div>
          </div>

          {/* Right Column: Arched Parallax Frame with Interactive Floating Coffee & Leaf Assets */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Outer Machined Double-Bezel Arched Shell */}
            <div className="double-bezel-shell w-full max-w-md">
              <div className="double-bezel-core p-2 arch-mask bg-gradient-to-b from-[#EEF5EE] to-[#E2EEE2] dark:from-[#1F3A24] dark:to-[#142318]">
                {/* Photo Arched Container with natural cafe placeholder visuals */}
                <div className="relative h-[440px] sm:h-[490px] w-full arch-mask overflow-hidden bg-[#284A2D]">
                  <img
                    src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80"
                    alt="The Leaf Cafe Ambience in Arera Colony Bhopal"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="eager"
                  />
                  {/* Subtle dark green vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#142318]/80 via-transparent to-transparent" />

                  {/* Bottom Arched Tag */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl bg-[#F7FBFA]/90 dark:bg-[#101C13]/90 p-4 backdrop-blur-md border border-[#325736]/20">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-[#325736] dark:text-[#A3C2A5]">
                        Arera Colony, E-7
                      </p>
                      <p className="text-sm font-semibold text-[#142318] dark:text-[#F7FBFA]">
                        The Leaf – Cafe and Brew
                      </p>
                    </div>
                    <span className="rounded-full bg-[#325736] px-3 py-1 text-[10px] font-bold uppercase text-[#F7FBFA]">
                      Open Now
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Floating Cup & Leaf reaction cutouts */}
            <motion.div
              style={{
                x: smoothX,
                y: leafTranslateY,
                rotate: cupRotate,
              }}
              className="absolute -top-6 -left-6 z-20 flex h-24 w-24 items-center justify-center rounded-full bg-[#325736] text-[#F7FBFA] shadow-2xl border-4 border-[#F7FBFA] dark:border-[#101C13]"
              aria-hidden="true"
            >
              <TheLeafMark size={56} strokeColor="#F7FBFA" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -bottom-4 -right-4 z-20 hidden sm:flex items-center gap-2 rounded-full bg-[#F7FBFA] px-4 py-2 text-xs font-semibold text-[#325736] shadow-xl border border-[#325736]/20 dark:bg-[#1F3A24] dark:text-[#A3C2A5]"
            >
              <MonolineIcon name="plant" size={16} color="#5E8662" />
              <span>100% Pure Veg Sanctuary</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
