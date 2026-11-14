# Operational Runbook: The Leaf – Cafe and Brew
**Bhopal Sanctuary Web Platform & High-Throughput Hospitality API**  
*Location: E-8, Arera Colony, Bhopal, MP 462016*

---

## 1. System Architecture Overview

```
                      [ Public Clients / QR Stands ]
                                    │
                                    ▼ (Port 4173 / 5173)
                             [ Vite Proxy ]
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
       [ Express 4 REST API ]          [ Socket.IO Engine ]
         (/api/v1/*, Port 5000)        (Rooms: table_*, order_*, staff_channel)
                     │                             │
                     └──────────────┬──────────────┘
                                    ▼
                         [ In-Memory Store Engine ]
                         - Atomic State Machine
                         - 5-Min Slot Hold Lock Table
                         - 24h Idempotency Cache
                         - Ring Buffer Audit Logs
                                    │ (Optional Fallback Layer)
                                    ▼
                         [ MongoDB / Redis Pool ]
```

---

## 2. Standard Operating Procedures (SOPs)

### SOP-01: Razorpay Webhook Signature Failure & Gateway Reconciliation
- **Symptoms:**
  - Guests report successful UPI/Card deduction, but Order Tracker remains on `pending-payment` or does not appear in Kitchen KDS.
  - Server logs indicate: `Webhook signature verification failed` (HTTP 400).
- **Root Causes:**
  - Secret mismatch between Razorpay Dashboard (`RAZORPAY_WEBHOOK_SECRET`) and server environment.
  - JSON body parsing stripped or normalized whitespace before HMAC calculation. (The Leaf server retains `req.rawBody` specifically to guarantee bitwise verification).
- **Incident Mitigation Steps:**
  1. Inspect incoming request header `x-razorpay-signature` in monitoring logs.
  2. Verify that `RAZORPAY_WEBHOOK_SECRET` matches the webhook secret configured in the active Razorpay Dashboard.
  3. For manual verification and reconciliation, use the managerial payment verification endpoint:
     ```bash
     curl -X POST http://localhost:5000/api/v1/payments/verify \
       -H "Content-Type: application/json" \
       -d '{
         "razorpay_order_id": "order_XXXXXX",
         "razorpay_payment_id": "pay_XXXXXX",
         "razorpay_signature": "SIG_XXXXXX"
       }'
     ```
  4. If gateway downtime occurred, staff can manually advance order to `received` from the Admin Portal using Manager credentials (`Leaf@Mgr2026`).

---

### SOP-02: Stuck Pending Orders Reconciliation & Auto-Expiry
- **Symptoms:**
  - Orders stay in `pending-payment` status for extended periods, cluttering analytics.
- **Root Causes:**
  - Guest initiated online checkout, abandoned browser tab or dismissed Razorpay UPI push without completing transaction.
- **Remediation Procedures:**
  1. The in-memory store automatically flags orders older than 30 minutes in `pending-payment`.
  2. To query all pending orders:
     ```bash
     curl -X GET "http://localhost:5000/api/v1/orders?status=pending-payment" \
       -H "Authorization: Bearer <MANAGER_JWT>"
     ```
  3. Cancel unfulfilled pending orders to restore inventory and unlock reserved dining resources:
     ```bash
     curl -X PATCH http://localhost:5000/api/v1/orders/<ORDER_ID>/status \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer <MANAGER_JWT>" \
       -d '{"status": "cancelled"}'
     ```

---

### SOP-03: Redis / MongoDB Degradation Fallback
- **Symptoms:**
  - Database connection timeout errors (`ECONNREFUSED`, `ETIMEDOUT`) logged on startup.
- **Architecture Defense:**
  - The Leaf API utilizes an **Active In-Memory Store (`server/src/services/store.ts`)** as its foundational high-speed engine.
  - If `MONGODB_URI` or `REDIS_URL` are unreachable or unset:
    - The server logs a non-fatal warning: `DB/Redis disconnected; operating in zero-latency In-Memory resilient mode`.
    - No customer routes or KDS tickets fail.
    - All table holds, idempotency keys, and order state machines function in memory.
- **Recovery Steps:**
  1. Check database container status:
     ```bash
     docker ps | grep mongo
     ```
  2. Restart persistence container if needed:
     ```bash
     docker restart theleaf-mongo theleaf-redis
     ```
  3. Once database recovers, trigger background sync without dropping active WebSocket connections.

---

### SOP-04: High-Concurrency Table Slot Contention (Holiday / Peak Rush)
- **Symptoms:**
  - Peak holiday traffic (Diwali, New Year, Sunday evenings) results in 50+ simultaneous guests attempting to reserve the 6 available indoor table slots.
- **Engine Mechanics:**
  - The Leaf booking engine enforces a **5-Minute Hold Lock**:
    - Each pending reservation locks table capacity for exactly 300,000 ms.
    - If hold expires without confirmation, slot is atomically released.
    - If capacity (6 concurrent parties per time slot) is reached, `POST /api/v1/bookings/lock-slot` returns:
      `{ success: false, error: { message: "Selected time slot is fully booked for this date", code: "SLOT_UNAVAILABLE" } }` with HTTP 409.
- **Staff Operational Actions:**
  1. View live slot contention in Admin Portal under `Reservations` tab.
  2. If guests call the desk, Floor Stewards can allocate overflow patio seating or seat walk-ins directly from `Floor & Tables` tab.
  3. Active holds expire cleanly without administrative intervention.

---

## 3. Disaster Recovery & Health Verification

### Quick Health Check
```bash
curl -s http://localhost:5000/health
# Expected: {"status":"ok","uptimeSeconds":...,"memoryUsageMB":...,"cafe":"The Leaf – Cafe and Brew"}
```

### Readiness Check
```bash
curl -s http://localhost:5000/ready
# Expected: {"status":"ready","database":"in-memory-ready","sockets":"ready"}
```

### Full Automated Verification Suite
To rerun all 25 backend tests and 11 end-to-end / accessibility tests in a single command:
```bash
npm run audit
```
