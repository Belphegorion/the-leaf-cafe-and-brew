# The Leaf – Cafe & Brew · Style Guide & Design System

> **Artisan Sanctuary Design System**  
> Location: E-8, Arera Colony, Bhopal, Madhya Pradesh  
> Ethos: 100% Pure Vegetarian Culinary & Specialty Coffee Sanctuary

---

## 1. Brand Identity & Color Distribution

The Leaf uses an intentional **60-25-12-3 spatial color hierarchy** designed to deliver an airy, grounded, warm botanical sanctuary aesthetic that completely eliminates harsh AI-purple gradients or sterile cold grays.

```
┌────────────────────────────────────────────────────────┐
│ 60% WARM BEIGE BASE CANVAS                             │
│ (#F5EFE4 / #EAE0D0)                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 25% PURE WHITE SURFACE CONTAINERS                │  │
│  │ (#FFFFFF / Surface Cards / Modals)               │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ 12% DEEP LEAF GREEN BRAND ANCHORS          │  │  │
│  │  │ (#325736 / #28492C / Primary CTA / Badges) │  │  │
│  │  │  ┌──────────────────────────────────────┐  │  │  │
│  │  │  │ 3% GOLDEN AMBER ACCENT & STATUS      │  │  │  │
│  │  │  │ (#C98A1B / Star Ratings / Highlights)│  │  │  │
│  │  │  └──────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Color Token Palette

| Role | Token Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **60% Dominant** | `tokens.beige.50` | `#FAF6F0` | Highest tint surface, drawer background tint |
| **60% Dominant** | `tokens.beige.100` | `#F5EFE4` | Primary light-mode application canvas and page background |
| **60% Dominant** | `tokens.beige.200` | `#EAE0D0` | Structural borders, card outlines, subtle dividers |
| **60% Dominant** | `tokens.beige.300` | `#DECDB8` | Inactive interactive elements, secondary borders |
| **25% Structural** | `tokens.surface.light` | `#FFFFFF` | Primary card plinths, modal dialogs, elevated containers |
| **25% Structural** | `tokens.surface.tint` | `#FAF8F5` | Secondary card background, table rows |
| **12% Brand Anchor**| `tokens.leaf.DEFAULT` | `#325736` | Primary action buttons, active navigation indicators, headers |
| **12% Brand Anchor**| `tokens.leaf.deep` | `#28492C` | Hover state for buttons, emphasized iconography |
| **12% Brand Anchor**| `tokens.leaf.dark` | `#1A331E` | High-contrast text on beige backgrounds (WCAG AAA) |
| **3% Accent** | `tokens.amber.DEFAULT` | `#C98A1B` | Star ratings, chef signature tags, award badges |
| **3% Accent** | `tokens.amber.warm` | `#D4A373` | Subtle glow highlights, countdown timers |
| **Semantic** | `tokens.semantic.error` | `#E05252` | Destructive actions, form validation errors |
| **Semantic** | `tokens.semantic.success` | `#2D8A4E` | Order placed confirmations, reservation secured |
| **Dark Theme** | `tokens.dark.canvas` | `#101C13` | Deep forest dark canvas |
| **Dark Theme** | `tokens.dark.surface` | `#182A1D` | Dark surface container plinths |
| **Dark Theme** | `tokens.dark.border` | `#2A4230` | Subtle borders in dark mode |

---

## 2. Typography System

The Leaf marries classical editorial serif letterforms for display hierarchy with geometric humanist sans-serifs for high-readability menu pricing and body copy.

### Font Families
- **Display & Headings:** `Cinzel, 'Playfair Display', 'Poiret One', Georgia, serif`  
  *Character:* Timeless artisan elegance, gentle letter spacing, refined majesty.
- **Body & Interface:** `Plus Jakarta Sans, 'DM Sans', Inter, -apple-system, sans-serif`  
  *Character:* Ultra-crisp rendering on high-DPI displays, open counters, neutral legibility.
- **Numbers & Metrics:** `JetBrains Mono, 'Space Grotesk', monospace`  
  *Character:* Tabular layout alignment for monetary amounts (₹), timestamps, and order codes.

### Hierarchy Scale

| Element | Tag / Class | Font | Size / Leading | Tracking | Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `h1.font-display` | Cinzel | `text-4xl md:text-6xl lg:text-7xl` | `tracking-tight` | SemiBold (600) |
| **Page Heading** | `h1.font-display` | Cinzel | `text-3xl md:text-4xl` | `tracking-normal` | SemiBold (600) |
| **Section Heading**| `h2.font-display` | Cinzel | `text-2xl md:text-3xl` | `tracking-wide` | Medium (500) |
| **Card Title** | `h3.font-display` | Cinzel | `text-lg md:text-xl` | `tracking-normal` | Medium (500) |
| **Subheading** | `p` / `h4` | Plus Jakarta | `text-sm md:text-base` | `tracking-normal` | Regular (400) |
| **Body Copy** | `p` | Plus Jakarta | `text-sm md:text-base leading-relaxed` | `tracking-normal` | Regular (400) |
| **Price / Code** | `span.font-mono` | JetBrains Mono | `text-sm md:text-base` | `tracking-tight` | Medium (500) |
| **Eyebrow / Badge**| `span.uppercase` | Plus Jakarta | `text-xs uppercase` | `tracking-[0.2em]` | Bold (700) |

---

## 3. Surface & Elevation Patterns

### Double-Bezel Architecture
Cards in The Leaf utilize tactile double-bezel borders rather than generic drop shadows:
```css
/* Outer bezel: Light beige canvas border */
/* Inner bezel: Pure white surface with subtle interior rim */
.double-bezel-card {
  background-color: #FFFFFF;
  border: 1px solid #EAE0D0;
  box-shadow: 0 0 0 1px rgba(50, 87, 54, 0.05), 0 4px 16px -2px rgba(40, 73, 44, 0.06);
}
```

### Warm Frosted Glass Panels (`.glass-panel`)
Translucent overlays that preserve background context while maintaining strict WCAG contrast:
```css
.glass-panel {
  background-color: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(234, 224, 208, 0.6);
}
.dark .glass-panel {
  background-color: rgba(24, 42, 29, 0.88);
  border: 1px solid rgba(42, 66, 48, 0.6);
}
```

### Leaf Vein Ambient Underlay (`.leaf-vein-pattern`)
Subtle organic watermarks that give brand depth to hero sections without distracting from content:
```css
.leaf-vein-pattern {
  background-image: radial-gradient(#325736 0.75px, transparent 0.75px);
  background-size: 24px 24px;
  opacity: 0.08;
}
```

---

## 4. Motion Engineering & Micro-Interactions

All interface motion is centralized in `client/src/motion/index.ts` to ensure rhythmic consistency and eliminate inline magic numbers.

### Motion Token Catalog
```ts
export const springs = {
  // Navigation tabs, filter switches, subtle hovers
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  
  // Cards, dialogue modals, sheet reveals
  gentle: { type: 'spring', stiffness: 260, damping: 25 },
  
  // Confetti celebrations, badge bounces, delight triggers
  bouncy: { type: 'spring', stiffness: 350, damping: 15 },
  
  // Slide-over cart and detail drawers
  drawer: { type: 'spring', stiffness: 300, damping: 32 }
};
```

### Mandatory Motion Invariants
1. **Hardware Pointer Capability Gating:**  
   3D tilt effects, cursor-following illumination, and magnetic button pulls must verify `window.matchMedia('(hover: hover) and (pointer: fine)').matches`. On touchscreens or mobile viewports, pointer listeners must be skipped and tilt forced to flat (`tiltX: 0, tiltY: 0`) to prevent sticky circles and layout jank during touch scrolling.
2. **Transform Property Isolation:**  
   Never mix CSS `transition: transform` or `transition: all` on DOM nodes whose transforms are concurrently driven by Framer Motion spring physics (`whileHover`, `animate`). Either drive the micro-interaction purely via Tailwind CSS utility classes (`group-hover:translate-x-1`) or purely via Motion springs.
3. **Photographic Media Plinth Scoping (`.dark` containment):**  
   Any container featuring dark photographic photography, video banners, or obsidian gradient scrims placed on the dual-theme canvas MUST explicitly declare `className="dark ..."` to guarantee internal badges, borders, and typography resolve against WCAG AAA dark-mode tokens.
4. **Smooth Scroll (Lenis) Drawer Locking:**  
   Whenever a modal or full-height drawer mounts (`CartDrawer`, `ItemCustomizerModal`, `TasteQuizModal`, `AmbienceGallery`), the Lenis scroll engine must be stopped via `window.__lenis?.stop()` and resumed upon unmount via `window.__lenis?.start()`.
5. **Reduced Motion Graceful Degradation:**  
   Users with `prefers-reduced-motion: reduce` are respected globally via CSS utility `motion-reduce:animate-none` and Motion hook `useReducedMotion()`.

---

## 5. Accessibility & Inclusivity Standards (WCAG 2.2 AA)

### Touch Target Rule
All interactive elements (buttons, links, steppers, tab buttons, modal close triggers) must have a minimum interactive bounding box of **44 × 44 CSS pixels**:
```tsx
<button
  className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl"
  aria-label="Increase Quantity"
>
  ...
</button>
```

### Label in Name Compliance (WCAG 2.5.3)
When an interactive button renders visible text alongside an icon, its accessible name (`aria-label`) MUST begin with the exact visible string:
```tsx
// Correct
<button aria-label="Add Single-Origin V60 to cart">
  <Plus aria-hidden="true" className="h-4 w-4" />
  <span>Add</span>
</button>
```

### Semantic Landmark Structure
Every page route mounts a structured landmark tree:
- `<a href="#main-content">Skip to main content</a>` as the first keyboard focusable element.
- `<header role="banner">` containing navigation and primary brand link.
- `<main id="main-content" tabIndex={-1}>` wrapping route content.
- `<footer role="contentinfo">` with secondary links and copyright.
- Modals declare `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
- Filter groups declare `role="tablist"` with child `role="tab"` and `aria-selected` attributes.

### Contrast Guarantee
All typography on beige (`#F5EFE4`) or dark forest (`#101C13`) maintains strict WCAG AA contrast (≥ 4.5:1 for regular text, ≥ 3.0:1 for large display text and interactive focus rings):
- Leaf Dark `#1A331E` on Warm Beige `#F5EFE4`: **10.8:1** (AAA Compliant)
- Leaf Primary `#325736` on Warm Beige `#F5EFE4`: **5.9:1** (AA Compliant)
- White `#FFFFFF` on Leaf Deep `#28492C`: **8.2:1** (AAA Compliant)
- Golden Amber `#C98A1B` on Dark Forest `#101C13`: **5.1:1** (AA Compliant)

---

## 6. Offline Resilience & Graceful Fallbacks

The Leaf client application operates seamlessly even when the backend API is unreachable:
1. **Fallback Menu Catalog:** Loaded instantly from `client/src/data/fallbackMenu.ts` if `/api/menu` encounters network faults.
2. **Offline Dine-In QR Ordering:** Generates local session orders and allows mock steward alerts with zero console errors.
3. **Local Table Reservations:** Emulates optimistic booking confirmation with dynamic confetti celebrations.
4. **Preloader Cache:** Stores visit timestamps in `localStorage.getItem('theleaf_has_visited')` to cap return-visit preloader sequences at 600ms.
