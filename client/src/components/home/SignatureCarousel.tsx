import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { MonolineIcon } from '../brand/MonolineIcon';
import { useCartStore } from '../../stores/useCartStore';
import type { MenuItem } from '../../../../shared/types';

export const SIGNATURE_ITEMS: MenuItem[] = [
  {
    id: 'sig-1',
    name: 'Peri Peri Paneer Pizza',
    slug: 'peri-peri-paneer-pizza',
    category: 'pizza',
    description: 'Fresh artisanal wood-fired crust topped with spiced cottage cheese, bell peppers, mozzarella, and fiery peri-peri drizzle.',
    price: 380,
    isPriceTbc: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80',
    tags: ['bestseller', 'spicy'],
    isAvailable: true,
    prepTimeMinutes: 18,
    sortOrder: 1,
  },
  {
    id: 'sig-2',
    name: 'Truffle Alfredo Pasta',
    slug: 'alfredo-pasta',
    category: 'pasta',
    description: 'Penne tossed in slow-simmered rich parmesan garlic cream, exotic mushrooms, and fresh basil herb garnish.',
    price: 340,
    isPriceTbc: true,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=700&q=80',
    tags: ['bestseller'],
    isAvailable: true,
    prepTimeMinutes: 15,
    sortOrder: 2,
  },
  {
    id: 'sig-3',
    name: 'Exotic Cheesy Garlic Bread',
    slug: 'exotic-garlic-bread',
    category: 'garlic-bread-bruschetta',
    description: 'Toasted baguette slathered in house herb butter, laden with sweet corn, jalapeños, olives, and molten mozzarella.',
    price: 240,
    isPriceTbc: true,
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=700&q=80',
    tags: ['bestseller'],
    isAvailable: true,
    prepTimeMinutes: 12,
    sortOrder: 3,
  },
  {
    id: 'sig-4',
    name: 'Spinach & Corn Bruschetta',
    slug: 'spinach-corn-bruschetta',
    category: 'garlic-bread-bruschetta',
    description: 'Crisp sourdough slices layered with creamy sautéed garden spinach, golden sweet corn, and a hint of nutmeg.',
    price: 250,
    isPriceTbc: true,
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=700&q=80',
    tags: ['chef-special'],
    isAvailable: true,
    prepTimeMinutes: 12,
    sortOrder: 4,
  },
  {
    id: 'sig-5',
    name: 'Fattoush Garden Salad',
    slug: 'fattoush-salad',
    category: 'salads',
    description: 'Crisp romaine, vine tomatoes, cucumbers, and radish tossed in sumac pomegranate molasses vinaigrette with toasted pita chips.',
    price: 260,
    isPriceTbc: true,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
    tags: ['vegan'],
    isAvailable: true,
    prepTimeMinutes: 10,
    sortOrder: 5,
  },
  {
    id: 'sig-6',
    name: 'Chocolate Brownie Shake',
    slug: 'chocolate-brownie-shake',
    category: 'shakes',
    description: 'Thick Belgian chocolate cream blended with freshly baked fudge brownie chunks and cocoa nibs.',
    price: 260,
    isPriceTbc: true,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=700&q=80',
    tags: ['bestseller'],
    isAvailable: true,
    prepTimeMinutes: 8,
    sortOrder: 6,
  },
  {
    id: 'sig-7',
    name: 'Single-Origin Pour Over',
    slug: 'single-origin-pour-over',
    category: 'coffee',
    description: 'Lightly roasted Chikmagalur Arabica beans, hand-poured through V60 to bring out delicate citrus and jasmine blossom notes.',
    price: 220,
    isPriceTbc: true,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
    tags: ['bestseller', 'vegan'],
    isAvailable: true,
    prepTimeMinutes: 6,
    sortOrder: 7,
  },
];

// Interactive 3D Tilt Card component
const TiltCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore(state => state.addItem);
  const openCart = useCartStore(state => state.openDrawer);
  const [added, setAdded] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleQuickAdd = () => {
    addItem(item);
    setAdded(true);
    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 600);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="double-bezel-shell w-[300px] sm:w-[340px] shrink-0 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="double-bezel-core p-4 flex flex-col h-full bg-white dark:bg-[#1F3A24]">
        {/* Card Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-xl bg-[#EEF5EE] dark:bg-[#142318]">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110 pointer-events-none"
            loading="lazy"
          />
          {/* Badge */}
          {item.tags.includes('bestseller') && (
            <span className="absolute top-3 left-3 rounded-full bg-[#325736] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F7FBFA] shadow-md">
              Bestseller
            </span>
          )}
          {item.tags.includes('vegan') && (
            <span className="absolute top-3 right-3 rounded-full bg-[#5E8662] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F7FBFA] shadow-md">
              Vegan
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="font-display text-lg uppercase font-bold text-[#142318] dark:text-[#F7FBFA] tracking-wide line-clamp-1">
              {item.name}
            </h3>
            <p className="mt-1 text-xs text-[#142318]/70 dark:text-[#F7FBFA]/70 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Price & Add Button */}
          <div className="mt-5 flex items-center justify-between border-t border-[#325736]/10 dark:border-[#F7FBFA]/10 pt-3">
            <div>
              <span className="text-base font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums">
                ₹{item.price}
              </span>
              <span className="ml-1 text-[10px] text-[#5E8662] uppercase tracking-wider">
                (Est. TBC)
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={added}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 min-h-[44px] text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 ${
                added
                  ? 'bg-[#5E8662] text-white shadow-md'
                  : 'bg-[#325736] text-[#F7FBFA] hover:bg-[#284A2D] dark:bg-[#5E8662] dark:hover:bg-[#325736]'
              }`}
              aria-label={`Add ${item.name} to cart`}
              data-cursor="Add"
            >
              {added ? (
                <>
                  <MonolineIcon name="check" size={14} color="#F7FBFA" strokeWidth={2.4} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <span className="text-base leading-none">+</span>
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const SignatureCarousel: React.FC = () => {
  return (
    <section className="py-24 bg-[#F5EFE4] dark:bg-[#101C13] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#5E8662] dark:text-[#A3C2A5]">
            Handcrafted with Care
          </span>
          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
            SIGNATURE CREATIONS
          </h2>
          <p className="text-sm text-[#142318]/70 dark:text-[#F7FBFA]/70 mt-2">
            Top customer favourites curated from 646+ genuine guest reviews in Arera Colony.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#5E8662] dark:text-[#A3C2A5] font-medium">
          <MonolineIcon name="sparkles" size={16} color="#5E8662" />
          <span>Swipe or drag horizontally</span>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div className="flex gap-6 overflow-x-auto px-4 sm:px-8 lg:px-12 pb-6 pt-2 no-scrollbar scroll-smooth">
        {SIGNATURE_ITEMS.map(item => (
          <TiltCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
