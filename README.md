# 🍃 The Leaf – Cafe and Brew

> **100% Pure-Vegetarian Artisanal Cafe & Specialty Brew Bar**  
> 1st Floor, E7/161, E-7, Arera Colony, Bhopal, MP 462016  
> Rated ★ **4.9** on Google (646 reviews) • Instagram: [@theleafverse](https://www.instagram.com/theleafverse/)

---

## 📖 Overview
**The Leaf – Cafe and Brew** is a modern full-stack web application and operations management platform designed and engineered for an artisanal pure-vegetarian cafe in Bhopal. It pairs award-winning Art Deco botanical visual design with a real-time ordering and kitchen management system.

---

## 🛠 Tech Stack

### Frontend Client
- **Framework**: React 18 + Vite 8 + TypeScript
- **Styling**: Tailwind CSS v4, Custom Design Tokens (`#325736` Leaf Green, `#F7FBFA` Soft White)
- **Animation & Motion**: Motion (Framer Motion), GSAP ScrollTrigger (pinned coffee-cup storytelling), Lenis Smooth Scroll
- **Icons**: Custom 2px Monoline SVG Icon System
- **State Management**: Zustand (persistent cart store)
- **Real-time Client**: Socket.IO client
- **PWA**: Installable web app with `manifest.json` and offline menu caching service worker

### Backend API & Real-time Server
- **Runtime**: Node.js + Express + TypeScript
- **Real-time Engine**: Socket.IO (bidirectional order updates and live table alerts)
- **Database & Store**: MongoDB (Mongoose models) + High-reliability In-Memory Data Store fallback
- **Slot Locking**: 5-minute reservation hold mechanism
- **Payment Gateway**: Razorpay Orders API with seamless test mock fallback

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+ (tested on Node v22 and v24)
- npm v9+

### 2. Installation
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run Locally (Development)
```bash
# Terminal 1: Start Backend API (Port 5000)
cd server
npx tsx src/server.ts

# Terminal 2: Start Frontend Client (Port 5173)
cd client
npm run dev -- --port 5173
```
Visit `http://localhost:5173` in your browser.

### 4. Run with Docker Compose
```bash
docker-compose up --build
```
This spins up MongoDB, Redis, the Node.js API server, and the client container in a unified bridge network.

---

## 🌐 Routes & Pages

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Home Page** | Hero parallax, pinned ScrollTrigger storytelling, 3D tilt signature carousel, counters, ambience gallery, Instagram grid, reviews marquee, live open/closed status. |
| `/menu` | **Artisanal Menu** | Category tabs, multi-dietary filters (Jain, Vegan, Spicy, Bestseller), search, customizer bottom-sheet, and slide-in cart drawer. |
| `/book` | **Table Reservation** | 14-day date strip, time slot chips, party stepper (1–12), seating ambience cards, 5-minute countdown ring, `.ics` calendar download. |
| `/pre-order` | **Order Ahead** | Takeaway vs Dine-In toggle, arrival time selector (20-min minimum buffer), cart summary. |
| `/checkout` | **Contactless Checkout** | Contact information form, special instructions, Razorpay payment bridge with mock test fallback. |
| `/order/:id` | **Live Order Tracker** | Real-time 4-stage filling coffee cup stepper (Received → Preparing → Ready → Served), live Socket.IO connection, "I'm Here" button. |
| `/t/:tableId` | **At-Table QR Ordering** | Table welcome plinth, instant waiter alerts ("Call Waiter", "Water", "Bill"), table menu, interactive Split Bill calculator. |
| `/admin` | **Control Center** | Manager analytics, Kitchen KDS touch screen, Floor Table plan with live alerts, Printable Table QR stand cards. |
| `/about` | **Our Story** | Philosophy, botanical atmosphere, and pure-vegetarian culinary commitments. |
| `/design` | **Design System** | Brand tokens, vector logo geometry, typography specimen, and icon catalog. |

---

## 📋 Regulatory & Operational Placeholders
All phone numbers, WhatsApp lines, GSTIN certificates, and FSSAI IDs are managed via environment variables and configuration placeholders. See [TODO.md](TODO.md) for the complete checklist.

---

## 📄 License
Artisanal design and engineering created for **The Leaf – Cafe and Brew**, Bhopal.
