# The Leaf – Cafe and Brew · System Architecture & Entity Inventory

> **Document:** Comprehensive Technical & Operational Inventory  
> **Application:** The Leaf – Cafe and Brew (100% Pure Vegetarian Culinary & Specialty Coffee Sanctuary)  
> **Location:** 1st Floor, E7/161, E-7, Arera Colony, Bhopal, MP 462016  
> **Version:** 1.1.0  
> **Last Updated:** November 2026

---

## 1. Frontend Page & Route Inventory

| Route | View Component | Access / Auth | Key Features | Responsiveness Range |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `HomePage.tsx` | Public | Hero with 3D tilt, Story scroll, Signature carousel, Live counters, Review marquee, Ambience lightbox, Location map | 320px – 2560px |
| `/menu` | `MenuPage.tsx` | Public | Category tabs, Real-time search, Dietary filters (Jain, Vegan, Gluten-free), Item customizer modal, Cart drawer trigger | 320px – 2560px |
| `/book` | `BookingPage.tsx` | Public | Slot date/time picker, Section selector (Arched window, Quiet corner, Main), Guest contact form, 5-min slot hold, Confetti confirmation | 320px – 2560px |
| `/pre-order` | `PreOrderPage.tsx` | Public | Scheduled curbside or dine-in pre-ordering, Arrival buffer steppers (+15m, +30m, +45m), Direct cart synchronization | 320px – 2560px |
| `/checkout` | `CheckoutPage.tsx` | Public | Cart review, Contact info, Payment methods (Razorpay, Pay-at-Counter, Running Tab), Coupon codes (`LEAF10`, `BHOPALBEATS`), 5% GST computation | 320px – 2560px |
| `/t/:tableId` | `TableQRPage.tsx` | Public / Dine-in | Table-specific contactless ordering (Tables 1–12), Waiter / Water / Bill call triggers, Live running tab | 320px – 2560px |
| `/order/:id` | `OrderTrackerPage.tsx` | Public (Order ID) | Live order timeline (`received` → `preparing` → `ready` → `served`), Arrival alert button ("I am Here"), Socket.IO updates | 320px – 2560px |
| `/about` | `AboutPage.tsx` | Public | 100% pure vegetarian ethos, Bhopal coffee heritage, Single-origin sourcing, Bean-to-cup philosophy | 320px – 2560px |
| `/account` | `AccountPage.tsx` | Public / Member | Tabbed guest hub: Recent orders, Table reservations, Saved creations, Botanical Club tier status | 320px – 2560px |
| `/contact` | `InfoLegalPage.tsx` | Public | Cafe location, contact placeholders, hours, parking info, Google Maps iframe | 320px – 2560px |
| `/faq` | `InfoLegalPage.tsx` | Public | FAQ accordion on Jain options, reservations, pet policy, private dining | 320px – 2560px |
| `/privacy` | `InfoLegalPage.tsx` | Public | Privacy policy compliant with Indian DPDP Act 2023 | 320px – 2560px |
| `/terms` | `InfoLegalPage.tsx` | Public | Terms of service, table reservation cancellation terms, payment conditions | 320px – 2560px |
| `/design` | `DesignSystemPage.tsx` | Public / Dev | Brand tokens, typography scale, 60-25-12-3 palette, button states, monoline icons | 320px – 2560px |
| `/admin` | `AdminDashboardPage.tsx` | Staff / Protected | Live KDS kitchen board, Floor & table manager, Menu 86 & CRUD, Reports & CSV export, Settings & coupons, Audit logs | 320px – 2560px |
| `*` | `NotFoundPage.tsx` | Public | Branded 404 error page with quick links back to sanctuary views | 320px – 2560px |

---

## 2. Animated Components Inventory

| Component | Animation Library | Trigger / Interaction | GPU Hardware Gating | Reduced Motion Fallback |
| :--- | :--- | :--- | :--- | :--- |
| `HeroSection.tsx` | Motion + CSS | Page mount steam & typography reveal; mouse move 3D tilt | `(hover: hover) and (pointer: fine)` | Flat card, instant opacity |
| `StoryScrollSection.tsx` | GSAP + ScrollTrigger | Sticky scroll timeline through cafe pillars | Window scroll listener | Normal vertical flow |
| `SignatureCarousel.tsx` | Motion | Drag & momentum swipe for signature items | Pointer capability gated | Standard horizontal overflow |
| `CountersSection.tsx` | GSAP / RAF | Viewport intersection trigger number counting | `useReducedMotion()` check | Displays static final value |
| `ReviewMarquee.tsx` | CSS Animation | Continuous 35s linear marquee ribbon | Pauses on `:hover` and `:focus-visible` | `motion-reduce:animate-none` |
| `AmbienceGallery.tsx` | Motion | Lightbox modal zoom and backdrop blur | Closes on `Escape` key | Instant fade |
| `CartDrawer.tsx` | Motion | Slide-over drawer with spring physics | Lenis scroll engine paused | Instant display |
| `TasteQuizModal.tsx` | Motion | Scale-in modal questionnaire | Lenis scroll engine paused | Instant display |
| `ItemCustomizerModal.tsx` | Motion | Spring scale dialog for sizes and toppings | Lenis scroll engine paused | Instant display |
| `CustomCursor.tsx` | Motion / Vanilla | Mouse-following botanical cursor | Desktop only: `(pointer: fine)` | Completely hidden on touch |
| `ScrollProgressWave.tsx` | CSS / SVG | Top header scroll progress tracking | Lightweight GPU transform | Linear bar |
| `Preloader.tsx` | Motion | Initial brand splash screen (2.5s initial, 0.6s repeat) | `localStorage` visit check | Skipped immediately |

---

## 3. Backend API Endpoints Inventory

| Method | Endpoint Path | Auth Required | Allowed Roles | Request Validation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | No | Any | None | Server health check (uptime, memory, status) |
| `GET` | `/ready` | No | Any | None | Server readiness check (store ready, sockets listening) |
| `POST` | `/api/v1/auth/login` | No | Any | Zod: `{ email/role, password }` | Staff authentication; issues JWT access & refresh tokens |
| `POST` | `/api/v1/auth/refresh` | No | Any | Zod: `{ refreshToken }` | Refreshes short-lived JWT access token |
| `POST` | `/api/v1/auth/logout` | Yes | Any authenticated | None | Revokes refresh token |
| `GET` | `/api/v1/auth/me` | Yes | Any authenticated | None | Returns currently logged-in staff profile |
| `GET` | `/api/v1/menu` | No | Any | Query: `{ category, search, tag }` | Lists all menu items with search/filter |
| `GET` | `/api/v1/menu/categories` | No | Any | None | Lists all 11 culinary categories |
| `GET` | `/api/v1/menu/items/:id` | No | Any | Params: `{ id }` | Gets individual menu item details |
| `POST` | `/api/v1/menu/items` | Yes | `owner`, `manager` | Zod: `MenuItemSchema` | Creates new menu item |
| `PUT` | `/api/v1/menu/items/:id` | Yes | `owner`, `manager` | Zod: `MenuItemSchema` | Updates existing menu item |
| `DELETE` | `/api/v1/menu/items/:id` | Yes | `owner`, `manager` | Params: `{ id }` | Soft-deletes item (preserves order history) |
| `PATCH` | `/api/v1/menu/items/:id/availability` | Yes | `owner`, `manager`, `kitchen` | Zod: `{ isAvailable }` | Quick 86 / Sold-out toggle |
| `POST` | `/api/v1/menu/import-csv` | Yes | `owner`, `manager` | Body: `{ csvData }` | Bulk CSV import with schema validation & error reports |
| `GET` | `/api/v1/menu/export-csv` | Yes | `owner`, `manager` | None | Exports menu to sanitized CSV |
| `POST` | `/api/v1/orders` | No | Any | Zod: `OrderCreateSchema` | Places order; server calculates subtotal, GST, discounts |
| `GET` | `/api/v1/orders` | Yes | Staff (`owner`, `manager`, `kitchen`, `waiter`) | Query: `{ status, date, limit, page }` | Lists orders with pagination |
| `GET` | `/api/v1/orders/:id` | No | Any (Guest tracker / Staff) | Params: `{ id }` | Gets order by ID |
| `PATCH` | `/api/v1/orders/:id/status` | Yes | `owner`, `manager`, `kitchen`, `waiter` | Zod: `{ status }` | Advances order state machine atomically |
| `POST` | `/api/v1/orders/:id/iam-here` | No | Customer | Params: `{ id }` | Notifies kitchen of guest curbside or table arrival |
| `POST` | `/api/v1/bookings/lock-slot` | No | Any | Zod: `{ date, timeSlot, partySize }` | 5-minute atomic slot hold |
| `POST` | `/api/v1/bookings` | No | Any | Zod: `BookingCreateSchema` | Finalizes table booking, creates ICS calendar |
| `GET` | `/api/v1/bookings` | Yes | Staff | Query: `{ date, status, limit, page }` | Lists reservations |
| `GET` | `/api/v1/bookings/:id` | No | Customer / Staff | Params: `{ id }` | Gets booking by ID or reference |
| `PATCH` | `/api/v1/bookings/:id/status` | Yes | `owner`, `manager`, `waiter` | Zod: `{ status }` | Changes booking status (`confirmed`, `seated`, `cancelled`) |
| `GET` | `/api/v1/tables` | No | Public / Staff | None | Returns status of all 12 boutique tables |
| `GET` | `/api/v1/tables/:tableNumber`| No | Public / Staff | Params: `{ tableNumber }` | Returns details for table |
| `POST` | `/api/v1/tables/:tableNumber/alert` | No | Customer / Staff | Zod: `{ action: 'waiter'\|'water'\|'bill'\|'clear' }` | Triggers or clears at-table steward call |
| `POST` | `/api/v1/payments/create-order` | No | Customer | Zod: `{ orderId }` | Creates Razorpay order in paise |
| `POST` | `/api/v1/payments/verify` | No | Customer | Zod: `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }` | Verifies HMAC-SHA256 signature |
| `POST` | `/api/v1/payments/webhook` | No | Razorpay Gateway | Raw body HMAC verification (`X-Razorpay-Signature`) | Idempotent webhook processing |
| `POST` | `/api/v1/payments/refund` | Yes | `owner`, `manager` | Zod: `{ orderId, amount, reason }` | Refunds payment (capped to order total, audit logged) |
| `GET` | `/api/v1/admin/reports` | Yes | `owner`, `manager` | Query: `{ startDate, endDate, groupBy }` | Sales volume, IST revenue aggregations, average order value |
| `GET` | `/api/v1/admin/reports/export-csv` | Yes | `owner`, `manager` | Query: `{ startDate, endDate }` | Formula-injection-sanitized CSV export |
| `GET` | `/api/v1/admin/settings` | Yes | `owner`, `manager` | None | Returns cafe operational configuration |
| `PATCH` | `/api/v1/admin/settings` | Yes | `owner` | Zod: `SettingsUpdateSchema` | Updates opening hours, deposit rules, capacity |
| `GET` | `/api/v1/admin/audit-logs` | Yes | `owner`, `manager` | Query: `{ limit, page }` | Returns immutable audit trail of admin writes |

---

## 4. Socket.IO Real-Time Events Inventory

| Event Name | Direction | Payload | Auth / Room Requirement | Description |
| :--- | :--- | :--- | :--- | :--- |
| `join:table` | Client → Server | `{ tableNumber: number }` | Public (Patron) | Joins room `table_${tableNumber}` |
| `join:order` | Client → Server | `{ orderId: string }` | Public (Patron) | Joins room `order_${orderId}` |
| `join:staff` | Client → Server | `{ token: string }` | Role: `owner`, `manager`, `kitchen`, `waiter` | Joins room `staff_channel` |
| `order:new` | Server → Client | `Order` | `staff_channel` | Emitted when a new order is received |
| `order:status-changed` | Server → Client | `{ orderId, status, order }` | `staff_channel` & `order_${orderId}` | Emitted when order status advances |
| `guest:arrived` | Server → Client | `{ orderId, customerName, tableNumber, message }` | `staff_channel` | Alert when guest arrives at cafe |
| `booking:new` | Server → Client | `TableBooking` | `staff_channel` | Alert when table is reserved |
| `booking:status-changed`| Server → Client | `{ bookingId, status, booking }` | `staff_channel` | Reservation updated |
| `table:service-alert` | Server → Client | `{ tableNumber, action, active, message, timestamp }` | `staff_channel` & `table_${tableNumber}` | Steward call chime |
| `menu:updated` | Server → Client | `{ action, item, timestamp }` | Broadcast to all clients | Menu item price / 86 status change |

---

## 5. Domain Models & Schemas

1. **MenuItem**: `id`, `name`, `slug`, `category`, `description`, `price` (INR), `isPriceTbc`, `image`, `tags`, `customizations`, `isAvailable`, `isPopular`, `prepTimeMinutes`, `sortOrder`, `deletedAt?`.
2. **Order**: `id`, `orderNumber`, `orderType`, `tableNumber`, `customerName`, `customerPhone`, `customerEmail`, `items`, `subtotal`, `gstAmount`, `tipAmount`, `discountAmount`, `couponCode`, `totalAmount`, `status`, `estimatedPrepMinutes`, `scheduledArrivalTime`, `paymentMethod`, `paymentStatus`, `razorpayOrderId`, `razorpayPaymentId`, `createdAt`, `updatedAt`.
3. **TableBooking**: `id`, `bookingRef`, `date`, `timeSlot`, `partySize`, `seatingPreference`, `guestName`, `guestPhone`, `guestEmail`, `occasion`, `specialNotes`, `preOrderId`, `status`, `depositAmount`, `depositPaymentStatus`, `lockExpiresAt`, `createdAt`.
4. **TableStatus**: `tableNumber` (1–12), `capacity`, `section`, `isOccupied`, `currentOrderId`, `runningTotal`, `waiterCallActive`, `waterRequested`, `billRequested`, `activeAlerts`.
5. **StaffUser**: `id`, `name`, `email`, `role` (`owner` | `manager` | `kitchen` | `waiter`), `passwordHash`, `salt`, `failedLoginAttempts`, `lockoutUntil`, `createdAt`.
6. **AuditLog**: `id`, `actor`: `{ id, name, role }`, `action`, `entity`, `entityId`, `before`, `after`, `ip`, `timestamp`.
7. **CafeSettings**: `openingTime`, `closingTime`, `isPureVeg`, `tableDepositDefault`, `deliveryEnabled`, `maxCapacityPerSlot`, `coupons`: `[{ code, discountPercent, fixedDiscount, minOrder, active }]`.

---

## 6. Environment Variables Inventory

| Variable Name | Required | Default / Mode | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `5000` | HTTP & WebSocket port |
| `NODE_ENV` | Optional | `development` | Environment mode (`development`, `production`, `test`) |
| `CLIENT_ORIGIN` | Optional | `http://localhost:5173` | Allowed CORS origin |
| `JWT_SECRET` | Required (Prod) | `leaf_jwt_secret_dev_key_2026_sanctuary` | HMAC-SHA256 signature key for staff JWT |
| `JWT_EXPIRES_IN` | Optional | `15m` | Access token lifespan |
| `REFRESH_TOKEN_SECRET` | Required (Prod)| `leaf_refresh_secret_dev_key_2026_sanctuary` | Refresh token signing secret |
| `REFRESH_TOKEN_EXPIRES_IN`| Optional | `7d` | Refresh token lifespan |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_placeholder_key` | Razorpay API key (Mock mode if placeholder) |
| `RAZORPAY_KEY_SECRET` | Optional | `rzp_test_placeholder_secret` | Razorpay API secret |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | `rzp_webhook_placeholder_secret` | Webhook signature verification secret |
| `MONGODB_URI` | Optional | `mongodb://localhost:27017/the_leaf_db` | MongoDB connection string (falls back to memory store) |
| `REDIS_URL` | Optional | `redis://localhost:6379` | Redis connection string (falls back to memory store) |
| `VITE_CAFE_PHONE` | Config | `+91 755 XXXXXXX (Config Placeholder)` | Public cafe phone placeholder |
| `VITE_CAFE_WHATSAPP` | Config | `+91 98930 XXXXX (Config Placeholder)` | Public cafe WhatsApp placeholder |
| `VITE_CAFE_GSTIN` | Config | `23AAAAA0000A1Z5 (PLACEHOLDER)` | Cafe GSTIN certificate placeholder |
| `VITE_CAFE_FSSAI` | Config | `10020000000000 (PLACEHOLDER)` | Cafe FSSAI license placeholder |

---

## 7. Third-Party Integrations Inventory

1. **Razorpay Payment Gateway**: Orders creation (`/orders`), payment signature verification, and raw body webhook handling. Graceful test mock fallback when credentials are not configured.
2. **QR Server API**: Contactless dine-in QR generation (`https://api.qrserver.com/v1/create-qr-code/`) encoding table-specific ordering URLs for all 12 tables.
3. **iCalendar (.ics)**: Native RFC 5545 calendar event generation for instant download upon reservation confirmation.
4. **Google Maps Platform**: Embed and navigation link pointing to 1st Floor, E7/161, Arera Colony, Bhopal.
