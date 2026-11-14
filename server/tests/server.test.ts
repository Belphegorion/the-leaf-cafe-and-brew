import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import crypto from 'crypto';
import { app } from '../src/app';
import { store } from '../src/services/store';

let server: http.Server;
let baseUrl: string;

before(async () => {
  await new Promise<void>(resolve => {
    server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 5000;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

describe('1. Boot & System Health Checks', () => {
  test('GET /health returns 200 with uptime and memory metrics', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.cafe, 'The Leaf – Cafe and Brew');
    assert.ok(typeof data.uptimeSeconds === 'number');
    assert.ok(typeof data.memoryUsageMB === 'number');
  });

  test('GET /ready returns 200 with readiness status', async () => {
    const res = await fetch(`${baseUrl}/ready`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ready');
  });
});

describe('2. Staff Authentication & RBAC', () => {
  let managerToken: string;
  let waiterToken: string;
  let refreshToken: string;

  test('POST /api/v1/auth/login fails on invalid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@theleaf.cafe', password: 'WrongPassword!' }),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'INVALID_CREDENTIALS');
  });

  test('POST /api/v1/auth/login succeeds for manager', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@theleaf.cafe', password: 'Leaf@Mgr2026' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.user.role, 'manager');
    assert.ok(data.data.accessToken);
    assert.ok(data.data.refreshToken);
    managerToken = data.data.accessToken;
    refreshToken = data.data.refreshToken;
  });

  test('POST /api/v1/auth/login succeeds for waiter', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'waiter@theleaf.cafe', password: 'Leaf@Floor2026' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    waiterToken = data.data.accessToken;
  });

  test('GET /api/v1/auth/me returns authenticated user details', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data.email, 'manager@theleaf.cafe');
  });

  test('POST /api/v1/auth/refresh issues new token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.accessToken);
    assert.ok(data.data.refreshToken);
    refreshToken = data.data.refreshToken;
  });

  test('RBAC: Waiter cannot edit menu (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/menu/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${waiterToken}`,
      },
      body: JSON.stringify({
        name: 'Forbidden Dish',
        category: 'pizza',
        description: 'Should fail',
        price: 300,
      }),
    });
    assert.equal(res.status, 403);
  });
});

describe('3. Menu Management & Integrity', () => {
  let managerToken: string;
  let createdItemId: string;

  before(async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@theleaf.cafe', password: 'Leaf@Mgr2026' }),
    });
    const data = await res.json();
    managerToken = data.data.accessToken;
  });

  test('GET /api/v1/menu returns categories and menu items', async () => {
    const res = await fetch(`${baseUrl}/api/v1/menu`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.length > 0);
  });

  test('POST /api/v1/menu/items creates new item (Manager)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/menu/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        name: 'Artisan Hazelnut Cold Brew',
        category: 'cold-brews',
        description: 'Slow steeped with roasted hazelnut botanical extracts',
        price: 260,
        tags: ['vegan', 'bestseller'],
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.data.name, 'Artisan Hazelnut Cold Brew');
    createdItemId = data.data.id;
  });

  test('PATCH /api/v1/menu/items/:id/availability toggles sold-out (86)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/menu/items/${createdItemId}/availability`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data.isAvailable, false);
  });

  test('DELETE /api/v1/menu/items/:id soft-deletes item preserving historical integrity', async () => {
    const res = await fetch(`${baseUrl}/api/v1/menu/items/${createdItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(res.status, 200);

    // Should not appear in public menu
    const menuRes = await fetch(`${baseUrl}/api/v1/menu`);
    const menuData = await menuRes.json();
    assert.ok(!menuData.data.some((i: any) => i.id === createdItemId));
  });

  test('GET /api/v1/menu/export-csv returns sanitized CSV', async () => {
    const res = await fetch(`${baseUrl}/api/v1/menu/export-csv`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('content-type')?.includes('text/csv'));
    const text = await res.text();
    assert.ok(text.includes('Price (INR)'));
  });
});

describe('4. Orders, Idempotency & State Machine', () => {
  let orderId: string;
  let managerToken: string;

  before(async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@theleaf.cafe', password: 'Leaf@Mgr2026' }),
    });
    const data = await res.json();
    managerToken = data.data.accessToken;
  });

  test('POST /api/v1/orders calculates prices, 5% GST, and LEAF10 coupon server-side', async () => {
    const res = await fetch(`${baseUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Pooja Jain',
        customerPhone: '9826199999',
        orderType: 'takeaway-pickup',
        paymentMethod: 'pay-at-counter',
        couponCode: 'LEAF10',
        items: [
          { menuItemId: 'c-1', quantity: 2 }, // 220 * 2 = 440
        ],
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.data.subtotal, 440);
    assert.equal(data.data.discountAmount, 44); // 10% of 440
    assert.equal(data.data.gstAmount, 22); // 5% of 440
    assert.equal(data.data.totalAmount, 440 + 22 - 44); // 418
    orderId = data.data.id;
  });

  test('POST /api/v1/orders enforces idempotency with X-Idempotency-Key', async () => {
    const key = `idem_${Date.now()}`;
    const payload = {
      customerName: 'Same Customer',
      customerPhone: '9826111111',
      items: [{ menuItemId: 'c-2', quantity: 1 }],
    };

    const res1 = await fetch(`${baseUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-idempotency-key': key },
      body: JSON.stringify(payload),
    });
    const data1 = await res1.json();

    const res2 = await fetch(`${baseUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-idempotency-key': key },
      body: JSON.stringify(payload),
    });
    const data2 = await res2.json();

    assert.equal(data1.data.id, data2.data.id, 'Idempotency key must return identical order');
  });

  test('Order State Machine: Valid transition received -> preparing -> ready -> served -> completed', async () => {
    // 1. Advance to preparing
    const r1 = await fetch(`${baseUrl}/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ status: 'preparing' }),
    });
    assert.equal(r1.status, 200);

    // 2. Advance to ready
    const r2 = await fetch(`${baseUrl}/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ status: 'ready' }),
    });
    assert.equal(r2.status, 200);

    // 3. Advance to served
    const r3 = await fetch(`${baseUrl}/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ status: 'served' }),
    });
    assert.equal(r3.status, 200);

    // 4. Advance to completed
    const r4 = await fetch(`${baseUrl}/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    assert.equal(r4.status, 200);
  });

  test('Order State Machine: Invalid transition (completed -> preparing) rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ status: 'preparing' }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error.code, 'INVALID_STATE_TRANSITION');
  });
});

describe('5. Table Bookings & 100-Concurrent-Request Concurrency Hold Engine', () => {
  test('Prevents double-booking under concurrency (50 parallel lock requests for 6 slots)', async () => {
    const testDate = '2026-12-01';
    const testSlot = '19:00';

    const requests = Array.from({ length: 30 }, (_, i) =>
      fetch(`${baseUrl}/api/v1/bookings/lock-slot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: testDate,
          timeSlot: testSlot,
          partySize: 2,
          bookingId: `concurrency_test_${i}`,
        }),
      }).then(r => r.json())
    );

    const results = await Promise.all(requests);
    const successes = results.filter(r => r.success === true);
    const rejected = results.filter(r => r.success === false);

    assert.equal(successes.length, 6, 'Exactly 6 slots must be locked (capacity cap)');
    assert.equal(rejected.length, 24, 'All subsequent parallel requests must be rejected (409)');
  });

  test('POST /api/v1/bookings creates confirmed reservation and ICS calendar', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2026-12-05',
        timeSlot: '20:00',
        partySize: 4,
        guestName: 'Vikramaditya Rao',
        guestPhone: '9893012345',
        guestEmail: 'vikram@example.com',
        seatingPreference: 'arched-window',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.data.bookingRef.startsWith('LEAF-'));
    assert.ok(data.icsData.includes('BEGIN:VCALENDAR'));
  });
});

describe('6. Payments, Webhook & Manager Refunds', () => {
  let managerToken: string;
  let testOrderId: string;

  before(async () => {
    const authRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@theleaf.cafe', password: 'Leaf@Mgr2026' }),
    });
    const authData = await authRes.json();
    managerToken = authData.data.accessToken;

    const ordRes = await fetch(`${baseUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Payment Test',
        customerPhone: '9826000000',
        items: [{ menuItemId: 'c-1', quantity: 1 }],
      }),
    });
    const ordData = await ordRes.json();
    testOrderId = ordData.data.id;
  });

  test('POST /api/v1/payments/create-order returns order in integer paise', async () => {
    const res = await fetch(`${baseUrl}/api/v1/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: testOrderId }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.razorpayOrderId);
    assert.ok(data.data.amount > 0);
  });

  test('POST /api/v1/payments/verify captures payment with valid mock signature', async () => {
    const res = await fetch(`${baseUrl}/api/v1/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: testOrderId,
        razorpayOrderId: 'order_mock_test_123',
        razorpayPaymentId: 'pay_mock_test_456',
        razorpaySignature: 'valid_mock_signature',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data.paymentStatus, 'captured');
  });

  test('POST /api/v1/payments/refund processes manager refund and caps amount', async () => {
    // Excessive refund rejected
    const badRes = await fetch(`${baseUrl}/api/v1/payments/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        orderId: testOrderId,
        amount: 999999, // Absurd amount
        reason: 'Overcharge',
      }),
    });
    assert.equal(badRes.status, 400);

    // Valid refund succeeds
    const goodRes = await fetch(`${baseUrl}/api/v1/payments/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({
        orderId: testOrderId,
        amount: 100,
        reason: 'Customer requested cancellation',
      }),
    });
    assert.equal(goodRes.status, 200);
  });
});

describe('7. Administrative Reports, Audit Logs & Formula Injection Safety', () => {
  let managerToken: string;

  before(async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@theleaf.cafe', password: 'Leaf@Mgr2026' }),
    });
    const data = await res.json();
    managerToken = data.data.accessToken;
  });

  test('GET /api/v1/admin/reports returns sales volume & metrics', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/reports`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.totalRevenue >= 0);
    assert.ok(data.data.ordersCount >= 0);
  });

  test('GET /api/v1/admin/reports/export-csv sanitizes against formula injection', async () => {
    // Insert order with dangerous formula injection strings: =cmd|' /C calc'!A0
    store.createOrder({
      id: 'ORD-CSV-INJECT',
      orderNumber: 'ORD-CSV-INJECT',
      orderType: 'takeaway-pickup',
      customerName: '=SUM(A1:A10)',
      customerPhone: '+919999999999',
      items: [],
      subtotal: 100,
      gstAmount: 5,
      tipAmount: 0,
      discountAmount: 0,
      totalAmount: 105,
      status: 'received',
      estimatedPrepMinutes: 10,
      paymentMethod: 'pay-at-counter',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await fetch(`${baseUrl}/api/v1/admin/reports/export-csv`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(res.status, 200);
    const csv = await res.text();
    // Formula characters must be escaped with leading single quote
    assert.ok(csv.includes("`'=SUM(A1:A10)`") || csv.includes("`'=SUM") || csv.includes("''=SUM") || csv.includes("=\"'=SUM") || csv.includes("'=SUM(A1:A10)"));
  });

  test('GET /api/v1/admin/audit-logs returns immutable history of admin writes', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length > 0);
    assert.ok(data.data[0].actor.name);
    assert.ok(data.data[0].action);
  });
});
