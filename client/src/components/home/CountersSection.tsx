import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

interface CounterItemProps {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  sublabel: string;
}

const AnimatedCounter: React.FC<CounterItemProps> = ({
  label,
  value,
  suffix = '',
  decimals = 0,
  sublabel,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1600; // ms
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (value - start) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [isInView, value]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center p-6 sm:p-8">
      <div className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#325736] dark:text-[#A3C2A5] tabular-nums">
        {decimals > 0 ? displayValue.toFixed(decimals) : Math.floor(displayValue)}
        {suffix}
      </div>
      <h3 className="mt-2 text-sm sm:text-base font-semibold uppercase tracking-wider text-[#142318] dark:text-[#F7FBFA]">
        {label}
      </h3>
      <p className="mt-1 text-xs text-[#5E8662] dark:text-[#A3C2A5]/80 font-normal">
        {sublabel}
      </p>
    </div>
  );
};

export const CountersSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#F5EFE4] dark:bg-[#142318] border-y border-[#325736]/15 dark:border-[#F7FBFA]/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">Key Milestones & Cafe Credentials</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-[#325736]/15 dark:divide-[#F7FBFA]/15">
          <AnimatedCounter
            label="Google Trust Score"
            value={4.9}
            decimals={1}
            sublabel="Verified across 646+ Reviews"
          />
          <AnimatedCounter
            label="100% Pure Veg"
            value={100}
            suffix="%"
            sublabel="Strictly zero meat or alcohol"
          />
          <AnimatedCounter
            label="Sanctuary Visitors"
            value={646}
            suffix="+"
            sublabel="Cherished patrons in Arera Colony"
          />
          <AnimatedCounter
            label="Artisanal Recipes"
            value={52}
            suffix="+"
            sublabel="Brews, Pizzas, Shakes & Bowls"
          />
        </div>
      </div>
    </section>
  );
};
