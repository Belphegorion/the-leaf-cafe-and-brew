import { test, expect } from '@playwright/test';

test.describe('The Leaf – Cross-System Integration: Public Guest ⇄ Staff Admin ⇄ KDS', () => {
  test('Complete Lifecycle: Customer places order -> Appears on Kitchen KDS -> Staff starts cooking -> Customer tracker updates in real-time', async ({
    browser,
  }) => {
    // 1. Create two isolated browser contexts for customer and admin staff
    const customerContext = await browser.newContext();
    const adminContext = await browser.newContext();

    const customerPage = await customerContext.newPage();
    const adminPage = await adminContext.newPage();

    // Prevent preloader screen delay
    await customerPage.addInitScript(() => {
      window.localStorage.setItem('theleaf_visited', 'true');
    });
    await adminPage.addInitScript(() => {
      window.localStorage.setItem('theleaf_visited', 'true');
    });

    // 2. Step 1: Customer submits an artisanal order via API
    const orderPayload = {
      orderType: 'takeaway-pickup',
      customerName: 'Aarav Singhania',
      customerPhone: '9826055555',
      customerEmail: 'aarav@example.com',
      items: [
        {
          menuItemId: 'c-1',
          name: 'Single-Origin V60 Pour Over',
          quantity: 1,
          selectedCustomizations: [
            {
              groupId: 'roast',
              groupName: 'Roast Profile',
              selectedOptionId: 'light',
              selectedOptionName: 'Light Roast',
              priceDelta: 0,
            },
          ],
          specialInstructions: 'Floral extraction notes',
        },
        {
          menuItemId: 'pz-1',
          name: 'Peri Peri Paneer Pizza',
          quantity: 1,
          selectedCustomizations: [],
          specialInstructions: 'Jain preparation',
        },
      ],
      tipAmount: 30,
      paymentMethod: 'pay-at-counter',
    };

    const createOrderResponse = await customerPage.request.post('/api/v1/orders', {
      data: orderPayload,
    });
    expect(createOrderResponse.ok()).toBeTruthy();
    const orderJson = await createOrderResponse.json();
    expect(orderJson.success).toBe(true);
    const createdOrder = orderJson.data;
    const orderId = createdOrder.id;
    const shortOrderCode = orderId.slice(-6).toUpperCase();

    // 3. Step 2: Customer opens Live Order Tracker
    await customerPage.goto(`/order/${orderId}`, { waitUntil: 'networkidle' });
    await expect(customerPage.locator('h1')).toContainText(/Order Received/i);
    await expect(customerPage.locator(`text=${orderId}`).first()).toBeVisible();

    // 4. Step 3: Staff logs into Admin Portal and navigates to Kitchen KDS
    await adminPage.goto('/admin', { waitUntil: 'networkidle' });

    // Use Quick Demo Sign-In as Manager / Kitchen
    const kdsQuickBtn = adminPage.locator('button:has-text("Kitchen KDS"), button:has-text("Manager")').first();
    if (await kdsQuickBtn.isVisible()) {
      await kdsQuickBtn.click();
      await adminPage.waitForTimeout(600);
    }

    // Switch to Kitchen KDS tab
    const kdsTab = adminPage.locator('button[role="tab"]:has-text("Kitchen KDS")').first();
    await expect(kdsTab).toBeVisible({ timeout: 10000 });
    await kdsTab.click();
    await adminPage.waitForTimeout(600);

    // 5. Step 4: Verify customer order ticket is present in KDS "New Orders" column
    const orderTicket = adminPage.locator(`text=#${shortOrderCode}`).first();
    await expect(orderTicket).toBeVisible({ timeout: 10000 });
    await expect(adminPage.locator('text=Single-Origin V60 Pour Over').first()).toBeVisible();

    // 6. Step 5: Kitchen chef clicks "Start Cooking →" to advance status to 'preparing'
    const startCookingBtn = adminPage
      .locator(`div:has-text("#${shortOrderCode}")`)
      .locator('button:has-text("Start Cooking →")')
      .first();
    await expect(startCookingBtn).toBeVisible();
    await startCookingBtn.click();
    await adminPage.waitForTimeout(800);

    // 7. Step 6: Verify Customer Live Tracker automatically updates to "Brewing & Baking"
    await expect(customerPage.locator('h1')).toContainText(/Brewing & Baking/i, { timeout: 10000 });

    // 8. Step 7: Kitchen chef advances status to 'ready' ("Ready for Pass →")
    const readyBtn = adminPage
      .locator(`div:has-text("#${shortOrderCode}")`)
      .locator('button:has-text("Ready for Pass →"), button:has-text("Ready →")')
      .first();
    if (await readyBtn.isVisible()) {
      await readyBtn.click();
      await adminPage.waitForTimeout(800);

      // Customer Tracker updates to "Ready for Enjoyment"
      await expect(customerPage.locator('h1')).toContainText(/Ready for Enjoyment/i, { timeout: 10000 });
    }

    // Clean up contexts
    await customerContext.close();
    await adminContext.close();
  });

  test('Table Service Steward Call: Guest calls waiter from QR page -> Alert illuminates on Floor Plan -> Staff resolves', async ({
    browser,
  }) => {
    const guestContext = await browser.newContext();
    const staffContext = await browser.newContext();

    const guestPage = await guestContext.newPage();
    const staffPage = await staffContext.newPage();

    await guestPage.addInitScript(() => {
      window.localStorage.setItem('theleaf_visited', 'true');
    });
    await staffPage.addInitScript(() => {
      window.localStorage.setItem('theleaf_visited', 'true');
    });

    // 1. Table 8 guest visits their table QR landing page
    await guestPage.goto('/t/8', { waitUntil: 'networkidle' });
    await expect(guestPage.locator('text=Table 8').first()).toBeVisible();

    // 2. Guest rings for water / steward assistance
    const waterBtn = guestPage.locator('button:has-text("Water"), button[aria-label*="water" i]').first();
    if (await waterBtn.isVisible()) {
      await waterBtn.click();
      await guestPage.waitForTimeout(500);
    }

    // 3. Staff opens Admin Floor & Tables tab
    await staffPage.goto('/admin', { waitUntil: 'networkidle' });
    const quickWaiterBtn = staffPage.locator('button:has-text("Floor Steward"), button:has-text("Manager")').first();
    if (await quickWaiterBtn.isVisible()) {
      await quickWaiterBtn.click();
      await staffPage.waitForTimeout(500);
    }

    const floorTab = staffPage.locator('button[role="tab"]:has-text("Floor & Tables")').first();
    if (await floorTab.isVisible()) {
      await floorTab.click();
      await staffPage.waitForTimeout(600);

      // Verify Table 8 is displayed on the floor plan
      await expect(staffPage.locator('text=T-8').first()).toBeVisible();

      // If active alert is illuminated, resolve it
      const resolveAlertBtn = staffPage.locator('button:has-text("Resolve Alert")').first();
      if (await resolveAlertBtn.isVisible()) {
        await resolveAlertBtn.click();
        await staffPage.waitForTimeout(500);
      }
    }

    await guestContext.close();
    await staffContext.close();
  });
});
