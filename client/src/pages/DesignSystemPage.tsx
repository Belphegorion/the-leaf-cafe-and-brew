import React, { useState } from 'react';
import { TheLeafMark } from '../components/brand/TheLeafMark';
import { TheLeafWordmark } from '../components/brand/TheLeafWordmark';
import { TheLeafLogo } from '../components/brand/TheLeafLogo';
import { WaveDivider } from '../components/brand/WaveDivider';
import { MonolineIcon } from '../components/brand/MonolineIcon';
import type { MonolineIconName } from '../components/brand/MonolineIcon';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { BRAND_TOKENS } from '../../../shared/constants';

const ICONS_LIST: MonolineIconName[] = [
  'cup',
  'leaf',
  'table',
  'clock',
  'bag',
  'qr',
  'pin',
  'spoon',
  'plant',
  'bell',
  'receipt',
  'star',
  'phone',
  'search',
  'filter',
  'check',
  'arrow-right',
  'sparkles',
];

export const DesignSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'typography' | 'logos' | 'icons' | 'components'>('tokens');

  return (
    <main id="main-content" className="min-h-[100dvh] pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#325736]/20 pb-8 mb-10">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#38483C] dark:text-[#A3C2A5]">
          Brand Architecture &amp; Token Library
        </span>
        <h1 className="text-4xl sm:text-5xl font-display uppercase tracking-wider font-bold text-[#1F2A22] dark:text-[#F7FBFA] mt-2">
          THE LEAF DESIGN SYSTEM
        </h1>
        <p className="mt-2 text-sm text-[#38483C] dark:text-[#C9DCC9] max-w-2xl">
          Calibrated to the 60/25/12/3 Sanctuary Color Formula: 60% Warm Beige base, 25% Pure White crispness, 12% Leaf Green identity, and 3% Amber accents.
        </p>

        {/* Tab Navigation */}
        <div role="tablist" aria-label="Design System Sections" className="flex flex-wrap gap-2 mt-6">
          {(['tokens', 'typography', 'logos', 'icons', 'components'] as const).map(tab => (
            <button
              key={tab}
              id={`design-tab-${tab}`}
              role="tab"
              aria-selected={activeTab === tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`min-h-[44px] inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'bg-[#325736] text-white dark:bg-[#325736]'
                  : 'border border-[#325736]/20 bg-[#F5EFE4] dark:bg-[#1F3A24] text-[#1F2A22] dark:text-[#F7FBFA] hover:bg-[#EAE0D0]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Tokens */}
      {activeTab === 'tokens' && (
        <section className="space-y-12">
          <div>
            <h2 className="text-xl font-display uppercase tracking-wider font-bold mb-2">
              Calibrated Sanctuary Color Palette (60 / 25 / 12 / 3)
            </h2>
            <p className="text-xs text-[#38483C] dark:text-[#A3C2A5] mb-4">
              Eliminated generic stark white and sterile grey defaults. Every surface bathes in natural warm beige harmony.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#F5EFE4] text-[#1F2A22] border border-[#E0D2B8] shadow-md">
                <p className="text-xs font-bold uppercase tracking-wider">60% Warm Beige Base</p>
                <p className="text-sm font-mono mt-1">#F5EFE4</p>
              </div>
              <div className="p-4 rounded-2xl bg-white text-[#1F2A22] border border-[#E0D2B8] shadow-md">
                <p className="text-xs font-bold uppercase tracking-wider">25% Pure White Core</p>
                <p className="text-sm font-mono mt-1">#FFFFFF</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#325736] text-white shadow-md">
                <p className="text-xs font-bold uppercase tracking-wider">12% Leaf Green Mark</p>
                <p className="text-sm font-mono mt-1">#325736</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#C98A1B] text-[#142318] shadow-md">
                <p className="text-xs font-bold uppercase tracking-wider">3% Golden Roast Accent</p>
                <p className="text-sm font-mono mt-1 font-bold">#C98A1B</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display uppercase tracking-wider font-bold mb-4">
              Green Scale (50 – 950)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(BRAND_TOKENS.greenScale).map(([scale, hex]) => (
                <div
                  key={scale}
                  className="p-3 rounded-xl bg-white dark:bg-[#1F3A24] border border-[#325736]/15 shadow-sm"
                >
                  <div
                    className="h-10 w-full rounded-lg mb-2 border border-black/10"
                    style={{ backgroundColor: String(hex) }}
                    aria-hidden="true"
                  />
                  <p className="text-xs font-bold uppercase text-[#142318] dark:text-[#F7FBFA]">Green {scale}</p>
                  <p className="text-[11px] font-mono mt-0.5 text-[#38483C] dark:text-[#A3C2A5]">{String(hex)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tab: Typography */}
      {activeTab === 'typography' && (
        <section className="space-y-8">
          <div className="p-6 rounded-2xl border border-[#325736]/20 bg-white dark:bg-[#1F3A24]">
            <span className="text-[10px] uppercase tracking-widest text-[#38483C]">Display Font</span>
            <p className="font-display text-4xl uppercase font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
              Josefin Sans &amp; Poiret One
            </p>
            <p className="text-xs text-[#38483C] mt-1">
              Geometric Art Deco capitals with wide tracking, echoing the original logo typography.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#325736]/20 bg-white dark:bg-[#1F3A24]">
            <span className="text-[10px] uppercase tracking-widest text-[#38483C]">Body &amp; UI Font</span>
            <p className="font-body text-xl font-medium text-[#142318] dark:text-[#F7FBFA] mt-1">
              DM Sans — Clean, high-legibility sans-serif for descriptions, menus, and forms.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#325736]/20 bg-white dark:bg-[#1F3A24]">
            <span className="text-[10px] uppercase tracking-widest text-[#38483C]">Tabular Pricing Figures</span>
            <p className="text-3xl font-bold text-[#325736] dark:text-[#A3C2A5] tabular-nums mt-1">
              ₹240 · ₹380 · ₹1,000 · ₹12,450
            </p>
            <p className="text-xs text-[#38483C] mt-1">
              Enforces monospaced numeric alignment to eliminate layout shifts in checkout totals.
            </p>
          </div>
        </section>
      )}

      {/* Tab: Logos */}
      {activeTab === 'logos' && (
        <section className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="p-8 rounded-3xl bg-[#EEF5EE] dark:bg-[#142318] flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-widest font-bold text-[#38483C] mb-4">
                Circular Emblem Lockup
              </span>
              <TheLeafLogo variant="emblem" size={220} />
            </div>

            <div className="p-8 rounded-3xl bg-[#EEF5EE] dark:bg-[#142318] flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-widest font-bold text-[#38483C] mb-6">
                Horizontal Navbar Lockup
              </span>
              <TheLeafLogo variant="horizontal" size={44} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="p-8 rounded-3xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-widest font-bold text-[#38483C] mb-4">
                Isolated Mark
              </span>
              <TheLeafMark size={80} strokeColor="#325736" />
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20 flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-widest font-bold text-[#38483C] mb-4">
                Isolated Wordmark &amp; Waves
              </span>
              <TheLeafWordmark size={260} color="#325736" />
            </div>
          </div>
        </section>
      )}

      {/* Tab: Icons */}
      {activeTab === 'icons' && (
        <section>
          <h2 className="text-xl font-display uppercase tracking-wider font-bold mb-4">
            2px Monoline Brand Icon Suite
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {ICONS_LIST.map(iconName => (
              <div
                key={iconName}
                className="p-5 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/15 flex flex-col items-center justify-center gap-2"
              >
                <div className="text-[#325736] dark:text-[#A3C2A5]">
                  <MonolineIcon name={iconName} size={28} strokeWidth={2} />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#142318]/70 dark:text-[#F7FBFA]/70">
                  {iconName}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Components */}
      {activeTab === 'components' && (
        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-display uppercase tracking-wider font-bold mb-4">
              Machined Double-Bezel Card Shell
            </h2>
            <div className="double-bezel-shell max-w-md">
              <div className="double-bezel-core p-6 bg-white dark:bg-[#1F3A24]">
                <h3 className="font-display uppercase text-lg font-bold">Concentric Radii Container</h3>
                <p className="text-xs text-[#142318]/70 dark:text-[#F7FBFA]/70 mt-1">
                  Outer shell with 1px border and soft background, housing an inner core with inset highlight.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display uppercase tracking-wider font-bold mb-4">
              Three-Wave Section Divider
            </h2>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1F3A24] border border-[#325736]/20">
              <WaveDivider strokeColor="#325736" animated={true} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display uppercase tracking-wider font-bold mb-4">
              Animated Theme Toggle
            </h2>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-xs text-[#38483C]">Click to trigger leaf-to-cup spring morph</span>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};
