# Vercel Deployment Guide: The Leaf – Cafe and Brew

This document provides step-by-step instructions for deploying "The Leaf – Cafe and Brew" web application to [Vercel](https://vercel.com) with global edge caching, single-page application (SPA) routing, and production security headers.

---

## 1. Quick Deploy via Vercel Dashboard (Recommended)

1. **Log in to Vercel**: Visit [vercel.com](https://vercel.com) and log in with your GitHub account (`Belphegorion`).
2. **Add New Project**: Click **"Add New..."** → **"Project"**.
3. **Import Git Repository**: Find and select **`Belphegorion/the-leaf-cafe-and-brew`**.
4. **Project Configuration**:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Leave as `./` (default)
   - **Build Command**: `npm --prefix client run build` (configured automatically via `vercel.json`)
   - **Output Directory**: `client/dist` (configured automatically via `vercel.json`)
   - **Install Command**: `npm --prefix client install` (configured automatically via `vercel.json`)

*(Alternative: If you set Root Directory to `client`, Vercel will automatically use `npm run build` and output to `dist` using `client/vercel.json`)*.

5. **Environment Variables (Optional)**:
   Add any desired client branding or config overrides (see Section 3).
6. **Deploy**: Click **"Deploy"**. The site will build in ~30 seconds and be live globally with an SSL certificate.

---

## 2. Deploy via Vercel CLI

If you prefer deploying from your terminal:

```bash
# 1. Install or update Vercel CLI
npm i -g vercel

# 2. Login to your account
vercel login

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod
```

---

## 3. Environment Variables Reference

All client-facing variables start with `VITE_` and are bundled at build time:

| Environment Variable | Default / Placeholder | Description |
| :--- | :--- | :--- |
| `VITE_CAFE_PHONE` | `+91 755 XXXXXXX (Config Placeholder)` | Public contact phone for inquiries |
| `VITE_CAFE_WHATSAPP` | `+91 98930 XXXXX (Config Placeholder)` | WhatsApp reservation and pre-order desk |
| `VITE_CAFE_GSTIN` | `23AAAAA0000A1Z5 (PLACEHOLDER)` | Indian GSTIN number shown in invoice & footer |
| `VITE_CAFE_FSSAI` | `10020000000000 (PLACEHOLDER)` | FSSAI food safety license number in footer |
| `VITE_API_URL` | *Empty (uses relative `/api`)* | Optional external backend URL if hosted separately |

---

## 4. Key Architectural Features on Vercel

1. **SPA Client Routing**:
   - All deep links (`/menu`, `/book`, `/pre-order`, `/checkout`, `/account`, `/t/4`, `/order/ORD-1234`, `/admin`) rewrite seamlessly to `/index.html` with zero 404s.
2. **Immutable Asset Caching**:
   - Static bundles in `/assets/*` are served with `Cache-Control: public, max-age=31536000, immutable`.
3. **PWA Service Worker & Manifest Freshness**:
   - `sw.js` is served with `no-cache, no-store, must-revalidate` to ensure immediate service worker updates.
   - `manifest.json` is cached for 24 hours.
4. **Hardened Security Headers**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
5. **Zero-Dependency Resilience**:
   - The public website includes built-in offline seed data and fallbacks (`FALLBACK_MENU_ITEMS`, simulated booking holds, client cart persistence), meaning the full user experience operates smoothly on Vercel even before connecting a dedicated backend cluster.

---

## 5. Custom Domain Configuration

To point your custom domain (e.g., `theleaf.cafe` or `theleafcafe.in`):
1. In the Vercel dashboard, go to **Settings** → **Domains**.
2. Enter your domain name and click **Add**.
3. Follow the DNS instructions to add either:
   - **CNAME record**: `cname.vercel-dns.com` (for subdomains like `www.theleaf.cafe`)
   - **A record**: `76.76.21.21` (for apex domains like `theleaf.cafe`)
4. Vercel automatically issues and renews a free Let's Encrypt SSL/TLS certificate.
