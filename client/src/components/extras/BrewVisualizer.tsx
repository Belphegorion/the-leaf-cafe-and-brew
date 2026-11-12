import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MonolineIcon } from '../brand/MonolineIcon';
import { TheLeafMark } from '../brand/TheLeafMark';
import { useCartStore } from '../../stores/useCartStore';
import { usePrefersReducedMotion } from '../../motion';

const ROASTS = [
  { id: 'chikmagalur', name: 'Chikmagalur Medium Roast', notes: 'Caramel & chocolate notes', color: '#4A2E18' },
  { id: 'ethiopian', name: 'Ethiopian Floral Light Roast', notes: 'Jasmine & berry blossom', color: '#734A28' },
  { id: 'monsooned', name: 'Malabar Dark Monsooned', notes: 'Bold, smoky spice depth', color: '#2B1A0E' },
];

const BASES = [
  { id: 'oat', name: 'Barista Oat Milk', price: 50, tag: 'Vegan Favorite' },
  { id: 'almond', name: 'Creamy Almond Milk', price: 50, tag: 'Nutty & Smooth' },
  { id: 'tonic', name: 'Artisan Citrus Tonic', price: 40, tag: 'Sparkling Brew' },
  { id: 'steamed', name: 'Fresh Dairy Milk', price: 0, tag: 'Classic Silk' },
  { id: 'water', name: 'Filtered Mineral Water', price: 0, tag: 'Pure Pour-Over' },
];

const FLAVOURS = [
  { id: 'none', name: 'Pure Single-Origin', price: 0 },
  { id: 'vanilla', name: 'Madagascar Vanilla Pod', price: 30 },
  { id: 'cinnamon', name: 'Spiced Ceylon Cinnamon', price: 25 },
  { id: 'hazelnut', name: 'Roasted Hazelnut Elixir', price: 35 },
];

export const BrewVisualizer: React.FC = () => {
  const [selectedRoast, setSelectedRoast] = useState(ROASTS[0]);
  const [selectedBase, setSelectedBase] = useState(BASES[0]);
  const [selectedFlavour, setSelectedFlavour] = useState(FLAVOURS[0]);
  const [temperature, setTemperature] = useState<'hot' | 'iced'>('hot');
  const [addedNotice, setAddedNotice] = useState(false);

  const { addItem } = useCartStore();
  const prefersReduced = usePrefersReducedMotion();

  const basePrice = 240;
  const totalPrice = basePrice + selectedBase.price + selectedFlavour.price;

  const handleAddToCart = () => {
    // Construct bespoke item
    const customItem = {
      id: `custom_brew_${Date.now()}`,
      name: `Custom ${temperature === 'hot' ? 'Hot' : 'Iced'} ${selectedRoast.name}`,
      slug: `custom-brew-${Date.now()}`,
      category: 'coffee' as const,
      description: `Customized with ${selectedBase.name}, ${selectedFlavour.name}, ${selectedRoast.notes}.`,
      price: totalPrice,
      isPriceTbc: false,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      tags: ['vegan' as const],
      isAvailable: true,
      prepTimeMinutes: 10,
      sortOrder: 99,
      customizations: [],
    };

    addItem(customItem);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="bg-[#EEF5EE] dark:bg-[#142318] rounded-3xl p-6 md:p-12 border border-[#325736]/20 shadow-xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#38483C] dark:text-[#A3C2A5]">
            Artisanal Laboratory
          </span>
          <h2 className="font-display text-2xl md:text-4xl uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
            Craft Your Bespoke Brew
          </h2>
          <p className="text-xs md:text-sm text-[#38483C] dark:text-[#A3C2A5] mt-2">
            Tailor bean origin, non-dairy plant milks, and botanicals. Our master baristas will brew it fresh on your arrival.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Interactive Cup Visualizer (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-white dark:bg-[#1F3A24] rounded-3xl border border-[#325736]/20 shadow-inner">
            <div className="relative w-44 h-56 flex flex-col items-center justify-end">
              {/* Steam or Ice Cubes */}
              {temperature === 'hot' ? (
                <div className="absolute top-2 flex gap-2">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={
                        prefersReduced
                          ? { y: -8, opacity: 0.5 }
                          : { y: [-4, -16, -4], opacity: [0.3, 0.8, 0] }
                      }
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { duration: 1.8, repeat: Infinity, delay: i * 0.3 }
                      }
                      className="w-1.5 h-6 rounded-full bg-[#5E8662]/50"
                    />
                  ))}
                </div>
              ) : (
                <div className="absolute top-12 flex gap-1 z-10">
                  <div className="w-5 h-5 rounded-md bg-white/70 backdrop-blur-sm border border-white rotate-12 shadow" />
                  <div className="w-4 h-4 rounded-md bg-white/60 backdrop-blur-sm border border-white -rotate-6 shadow" />
                </div>
              )}

              {/* Glass Cup Body */}
              <div className="relative w-36 h-44 rounded-b-[48px] border-4 border-[#325736] overflow-hidden bg-white/40 dark:bg-black/20 flex flex-col justify-end">
                {/* Milk Layer */}
                <motion.div
                  animate={{
                    height: selectedBase.id === 'water' || selectedBase.id === 'tonic' ? '20%' : '55%',
                    backgroundColor:
                      selectedBase.id === 'tonic'
                        ? '#C9DCC9'
                        : selectedBase.id === 'water'
                        ? '#E2EEE2'
                        : '#F7FBFA',
                  }}
                  className="w-full transition-colors flex items-center justify-center"
                >
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#F7FBFA]">
                    {selectedBase.name.split(' ')[0]}
                  </span>
                </motion.div>

                {/* Espresso Extraction Layer */}
                <motion.div
                  animate={{
                    height: selectedBase.id === 'water' || selectedBase.id === 'tonic' ? '80%' : '45%',
                    backgroundColor: selectedRoast.color,
                  }}
                  className="w-full transition-colors flex items-center justify-center relative"
                >
                  <TheLeafMark size={20} strokeColor="#F7FBFA" />
                </motion.div>
              </div>

              {/* Saucer */}
              <div className="w-48 h-3.5 rounded-full bg-[#325736] mt-1 shadow-md" />
            </div>

            {/* Live Pricing & Tag */}
            <div className="mt-6 text-center">
              <div className="font-display uppercase text-lg font-bold text-[#142318] dark:text-[#F7FBFA]">
                {temperature === 'hot' ? 'Hot Infusion' : 'Cold Brew On Ice'}
              </div>
              <div className="font-display text-2xl font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums mt-1">
                ₹{totalPrice}
              </div>
            </div>
          </div>

          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Temp Toggle */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-2">
                1. Temperature Profile
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTemperature('hot')}
                  className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    temperature === 'hot'
                      ? 'bg-[#325736] text-white border-[#325736]'
                      : 'border-[#325736]/20 text-[#142318] dark:text-[#F7FBFA]'
                  }`}
                >
                  ♨ Hot &amp; Steamed
                </button>
                <button
                  type="button"
                  onClick={() => setTemperature('iced')}
                  className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    temperature === 'iced'
                      ? 'bg-[#325736] text-white border-[#325736]'
                      : 'border-[#325736]/20 text-[#142318] dark:text-[#F7FBFA]'
                  }`}
                >
                  ❄ Chilled / Over Ice
                </button>
              </div>
            </div>

            {/* Roast Selection */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-2">
                2. Select Single-Origin Coffee Bean
              </label>
              <div className="space-y-2">
                {ROASTS.map(roast => (
                  <button
                    key={roast.id}
                    type="button"
                    onClick={() => setSelectedRoast(roast)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedRoast.id === roast.id
                        ? 'border-[#325736] bg-white dark:bg-[#1F3A24] ring-1 ring-[#325736]'
                        : 'border-[#325736]/15 hover:border-[#325736]/40'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">
                        {roast.name}
                      </div>
                      <div className="text-[11px] text-[#38483C] dark:text-[#A3C2A5]">{roast.notes}</div>
                    </div>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: roast.color }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Milk / Liquid Base Selection */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-2">
                3. Choose Plant Milk or Mineral Base
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BASES.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBase(b)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedBase.id === b.id
                        ? 'border-[#325736] bg-white dark:bg-[#1F3A24] ring-1 ring-[#325736]'
                        : 'border-[#325736]/15 hover:border-[#325736]/40'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">{b.name}</div>
                    <div className="text-[10px] text-[#38483C] dark:text-[#A3C2A5]">
                      {b.price === 0 ? 'Included' : `+₹${b.price}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Flavour Hint Selection */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#142318] dark:text-[#F7FBFA] mb-2">
                4. Botanical Flavour Infusion
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FLAVOURS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFlavour(f)}
                    className={`min-h-[44px] p-3 rounded-2xl border text-left transition-all touch-press active:scale-[0.98] ${
                      selectedFlavour.id === f.id
                        ? 'border-[#325736] bg-white dark:bg-[#1F3A24] ring-1 ring-[#325736]'
                        : 'border-[#325736]/15 hover:border-[#325736]/40'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA] line-clamp-1">{f.name}</div>
                    <div className="text-[10px] text-[#38483C] dark:text-[#A3C2A5]">
                      {f.price === 0 ? 'Pure' : `+₹${f.price}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-full bg-[#325736] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7FBFA] shadow-lg hover:bg-[#284A2D] touch-press active:scale-[0.98] transition-all"
              >
                <MonolineIcon name="cup" size={16} />
                <span>Add Bespoke Brew to Cart (₹{totalPrice})</span>
              </button>

              {addedNotice && (
                <div className="mt-2 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  ✓ Custom brew added to your artisanal cart!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
