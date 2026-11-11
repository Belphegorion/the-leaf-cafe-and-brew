# 🍃 The Leaf – Cafe and Brew: Operational Handover & TODO Checklist

> **Strict Engineering Directive:** Never fabricate real-world phone numbers, WhatsApp lines, GSTIN certificates, or FSSAI license IDs. All such fields across the codebase currently read from secure configuration placeholders and fallbacks.

This checklist outlines the exact items that the cafe owners or devops engineers need to provide before switching from staging to live production:

---

### 1. Official Regulatory & Contact Placeholders
| Item | Current Status | Target Location | Action Needed |
| :--- | :--- | :--- | :--- |
| **Phone Number** | `+91 755 XXXXXXX (Config Placeholder)` | `.env` (`VITE_CAFE_PHONE`) & `shared/constants.ts` | Provide cafe landline or primary ordering mobile |
| **WhatsApp Business Line** | `+91 98930 XXXXX (Config Placeholder)` | `.env` (`VITE_CAFE_WHATSAPP`) & `shared/constants.ts` | Provide verified WhatsApp Business phone number |
| **FSSAI License Number** | `10020000000000 (PLACEHOLDER)` | `.env` (`VITE_CAFE_FSSAI`) & Footer display | Provide 14-digit Food Safety license certificate |
| **GSTIN Certificate** | `23AAAAA0000A1Z5 (PLACEHOLDER)` | `.env` (`VITE_CAFE_GSTIN`) & Receipt footer | Provide Madhya Pradesh (23) State GST registration |
| **Google Maps Place URL** | Generated query link to Arera Colony address | `.env` (`VITE_GOOGLE_MAPS_LINK`) | Provide exact Google Business Profile CID link |
| **Operating Hours Confirmation** | `11:00 AM – 11:30 PM daily (Unconfirmed disclaimer)` | `shared/constants.ts` | Confirm exact opening and last kitchen call timings |

---

### 2. Menu & Pricing Finalization
- [ ] **Exact Menu Item Prices**: All items in `server/src/data/seedData.ts` and `client/src/data/menuData.ts` currently feature initial realistic estimates flagged with `isPriceTbc: true` and disclaimer tag `(Est. TBC)`. Replace with finalized physical menu card pricing.
- [ ] **Food Photography**: All menu photos currently load curated high-definition royalty-free Unsplash gastronomy photos matching each recipe. Upload actual dishes shot on location to `/client/public/photos/` and update references in `seedData.ts`.
- [ ] **Official Vector Logo File**: A faithful, mathematical SVG reproduction matching `logo the leaf.jpg` is currently rendered in `TheLeafMark.tsx` and `TheLeafWordmark.tsx`. If the cafe's branding agency delivers an `.ai` or `.svg` file later, drop it into `/client/public/logo.svg`.

---

### 3. Payment Gateway Credentials (Razorpay)
- [ ] Sign in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
- [ ] Generate Live API Keys (`RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`).
- [ ] Configure Webhook endpoint: `https://api.yourdomain.com/api/v1/payments/webhook` listening for `payment.captured` and `order.paid`.
- [ ] Enable UPI Intent, Google Pay, PhonePe, Paytm, and Domestic RuPay/Visa/MasterCard cards.

---

### 4. Messaging & Notification Service
- [ ] **WhatsApp Business API**: Configure [MSG91](https://msg91.com/) or [Twilio](https://twilio.com/) account credentials in `.env` to send automated booking confirmations and "Order Ready" notifications.
- [ ] **Email Provider**: Configure [Resend](https://resend.com/) API Key (`RESEND_API_KEY`) for instant booking `.ics` ticket delivery and branded order receipts.

---

### 5. Deployment Setup
- [ ] **Client Deployment**: Deploy `client/` to Vercel, Netlify, or Cloudflare Pages.
- [ ] **Server Deployment**: Deploy `server/` with Docker to Render, Railway, AWS ECS, or DigitalOcean Droplet.
- [ ] **Database & Cache**: Connect to MongoDB Atlas (M0/M10 cluster) and Upstash Redis.
