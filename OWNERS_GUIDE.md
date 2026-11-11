# 🍃 The Leaf – Cafe and Brew: Owner & Operations Manual

Welcome to **The Leaf Operations Control Center**. This guide explains how cafe managers, chefs, baristas, and floor servers use the web platform during daily service.

---

### 1. Accessing the Control Center
1. Navigate to: `http://localhost:5173/admin` (or your live domain `/admin`).
2. At the top right of the screen, you will find the **Role Selector**:
   - **Manager Overview**: Executive analytics, daily gross revenue, active order counts, table occupancy, and quick 86 / availability controls.
   - **Kitchen KDS**: Full-screen touch interface designed for kitchen tablets/monitors.
   - **Floor & Tables**: Real-time matrix of Tables 1 to 12 showing guest occupancy and waiter calls.
   - **QR Print Sheets**: Ready-to-print branded acrylic stand inserts for all boutique tables.

---

### 2. Kitchen Display System (KDS) Touch Workflow
Designed for busy cafe kitchen lines with high-contrast colored ticket headers and single-tap status progression:
1. **New Orders (Amber Column)**:
   - When a guest orders online or at their table, a ticket appears immediately in the New Orders column with order number, dining mode (Takeaway vs Table Number), item breakdown, and any dietary customizations.
   - Chef/Barista taps **`Start Brewing / Cooking →`** to shift ticket to In Preparation.
2. **In Preparation (Blue Column)**:
   - Shows active cooking and brewing tasks.
   - Once the barista finishes the pour-over and the chef plates the sourdough pizza, tap **`Mark Ready at Pass ✓`**.
3. **Ready at Pass (Green Column)**:
   - Signals floor servers and counter hosts that the order is hot and ready.
   - Displays guest name and phone number for curbside handoff.
   - Tap **`Mark Served / Handed Over`** once delivered to archive the ticket.

---

### 3. Quick "86 / Sold Out" Item Management
When fresh ingredient stock (e.g. fresh burrata or single-origin Ethiopian beans) runs low:
1. Switch to **Manager Overview** tab.
2. Scroll to the **Quick 86 / Availability Control** card.
3. Locate the item and tap the green **`In Stock`** pill button.
4. It immediately turns red **`86 / Sold Out`**.
5. The item is instantly disabled across the online menu, table ordering QR screens, and search filters so guests cannot order it. Tap again anytime to restore availability.

---

### 4. Table Floor Matrix & Waiter Alerts
1. Switch to **Floor & Tables** tab.
2. Each of the 12 boutique tables shows its capacity, section (Botanical Courtyard, Arched Window, Quiet Deco Corner, Communal Table), and occupancy status.
3. When a seated guest taps **"Call Waiter"**, **"Water / Refill"**, or **"Request Bill"** on their mobile screen, the table card pulses red with an audible visual alert:
   - `Alert: WAITER`
   - `Alert: WATER`
   - `Alert: BILL`
4. Once the floor server attends to the table, tap **`Resolve Alert`** to restore normal state.

---

### 5. Printing Table QR Stand Inserts
1. Switch to **QR Print Sheets** tab.
2. The page renders pre-formatted, high-contrast standalone cards for **Tables 1 to 12**, each with:
   - The Leaf vector emblem
   - High-density QR code linking to `https://theleaf.cafe/t/{tableNumber}`
   - Table number and clear guest instructions
3. Tap **`Print All QR Stands`** to print directly onto card stock or photo paper.
4. Laminate and slide into wooden acrylic stands on each table.

---

### 6. Updating Menu Items & Pricing
- Initial menu item definitions live in `server/src/data/seedData.ts` and `client/src/data/menuData.ts`.
- To update prices, change the `price` field in `seedData.ts` and restart the server, or use MongoDB Atlas collection `menu_items` when connected to MongoDB.
