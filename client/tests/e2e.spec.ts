import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('The Leaf – Cafe and Brew: E2E Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Disable preloader delay on return visits
    await page.addInitScript(() => {
      window.localStorage.setItem('theleaf_visited', 'true');
    });
  });

  test('Flow 1: Menu browsing, search, item customization & cart drawer', async ({ page }) => {
    await page.goto('/menu', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText(/ARTISANAL MENU/i);

    // Search for a pizza
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('Paneer');
    await page.waitForTimeout(300);

    // Card should be visible
    const pizzaCard = page.locator('text=Peri Peri Paneer Pizza').first();
    await expect(pizzaCard).toBeVisible();

    // Clear search and switch category
    await searchInput.fill('');
    const coffeeTab = page.locator('button[role="tab"]:has-text("Coffee")').first();
    await coffeeTab.click();
    await page.waitForTimeout(300);

    // Pour over item
    const pourOverCard = page.locator('text=Single-Origin V60 Pour Over').first();
    await expect(pourOverCard).toBeVisible();

    // Click customise or add
    const addBtn = page.locator('button[aria-label*="Single-Origin V60"]').first();
    await addBtn.click();
    await page.waitForTimeout(500);

    // If customizer modal opened, select option and click Add
    const modalAdd = page.locator('button:has-text("Add to Order")');
    if (await modalAdd.isVisible()) {
      await modalAdd.click();
      await page.waitForTimeout(600);
    }

    // Ensure cart drawer is open
    const drawer = page.locator('[role="dialog"][aria-label*="Cart" i], dialog[aria-label*="Cart" i]');
    if (!await drawer.isVisible()) {
      const cartToggle = page.locator('button[aria-label*="Cart"]').first();
      await cartToggle.click();
      await page.waitForTimeout(500);
    }

    // Drawer should have items
    await expect(page.locator('text=Single-Origin V60 Pour Over').first()).toBeVisible();

    // Proceed to Checkout button should be visible
    const checkoutBtn = page.locator('a[href="/checkout"], button:has-text("Proceed to Checkout")').first();
    await expect(checkoutBtn).toBeVisible();
  });

  test('Flow 2: Table reservation end-to-end journey', async ({ page }) => {
    await page.goto('/book', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText(/Reserve a Table/i);

    // Fill guest name and phone
    const nameInput = page.locator('input[placeholder*="name" i], input[name*="name" i]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Rohan Sharma');
    }
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone" i], input[name*="phone" i]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('9826012345');
    }

    // Submit reservation
    const submitBtn = page.locator('button:has-text("Confirm Booking"), button:has-text("Reserve Table"), button:has-text("Proceed to Confirmation")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(800);
      // Confirmation reference should appear
      await expect(page.locator('text=LEAF-').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Flow 3: Pre-order & curbside pickup flow', async ({ page }) => {
    await page.goto('/pre-order', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText(/Pre-Order Ahead/i);

    // Buffer buttons
    const bufferBtn = page.locator('button:has-text("+30 mins"), button:has-text("30m")').first();
    if (await bufferBtn.isVisible()) {
      await bufferBtn.click();
    }

    // Switch between takeaway and dine-in mode
    const dineInRadio = page.locator('button:has-text("Dine-In on Arrival"), input[value="dine_in"]').first();
    if (await dineInRadio.isVisible()) {
      await dineInRadio.click();
    }

    // Summary heading
    await expect(page.locator('text=Pre-Order Summary').first()).toBeVisible();
  });

  test('Flow 4: Table QR dine-in experience (Table 12)', async ({ page }) => {
    await page.goto('/t/12', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Table 12').first()).toBeVisible();

    // Call waiter button
    const waiterBtn = page.locator('button:has-text("Call Waiter"), button[aria-label*="waiter" i]').first();
    await expect(waiterBtn).toBeVisible();
    await waiterBtn.click();
    await page.waitForTimeout(400);

    // Split bill modal
    const splitBtn = page.locator('button:has-text("Split Bill"), button[aria-label*="split" i]').first();
    if (await splitBtn.isVisible()) {
      await splitBtn.click();
      await page.waitForTimeout(300);
      await expect(page.locator('text=Split Table Bill').first()).toBeVisible();

      // Test Escape key closes modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  });

  test('Flow 5: Live Order Tracker with arrival notification', async ({ page }) => {
    await page.goto('/order/ORD-9821', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText(/Brewing & Baking/i);
    await expect(page.locator('text=ORD-9821').first()).toBeVisible();

    // Coffee cup visualizer & stage indicators
    await expect(page.locator('text=Brewing & Baking').first()).toBeVisible();

    // Tap "I'm Here!" arrival button
    const arrivalBtn = page.locator('button:has-text("I\'m Here!"), button:has-text("Notify Kitchen")').first();
    if (await arrivalBtn.isVisible()) {
      await arrivalBtn.click();
      await page.waitForTimeout(400);
      await expect(page.locator("text=Host Notified!").first()).toBeVisible();
    }
  });

  test('Flow 6: Account portal and member tabs', async ({ page }) => {
    await page.goto('/account', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText(/Aryan Sharma/i);

    // Switch to Bookings tab
    const bookingsTab = page.locator('button[role="tab"]:has-text("Table Bookings")');
    await bookingsTab.click();
    await page.waitForTimeout(200);
    await expect(page.locator('text=Table Reservations').first()).toBeVisible();

    // Switch to Favourites tab
    const favsTab = page.locator('button[role="tab"]:has-text("Saved Favourites")');
    await favsTab.click();
    await page.waitForTimeout(200);
    await expect(page.locator('text=Saved Creations').first()).toBeVisible();

    // Switch to Botanical Club tab
    const clubTab = page.locator('button[role="tab"]:has-text("Club & Loyalty")');
    await clubTab.click();
    await page.waitForTimeout(200);
    await expect(page.locator('text=The Leaf Botanical Club').first()).toBeVisible();
  });

  test('Flow 7: Zero horizontal overflow across 320px, 375px, 768px, 1024px, 1440px', async ({ page }) => {
    const viewports = [
      { width: 320, height: 700 },
      { width: 375, height: 812 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
    ];

    const routes = ['/', '/menu', '/book', '/checkout', '/account', '/t/12'];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      for (const route of routes) {
        await page.goto(route, { waitUntil: 'networkidle' });
        await page.waitForTimeout(150);

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            hasOverflow: doc.scrollWidth > doc.clientWidth + 1,
          };
        });

        expect(overflow.hasOverflow, `Overflow detected on ${route} at ${vp.width}px: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`).toBe(false);
      }
    }
  });

  test('Flow 8: WCAG AA Accessibility Audit across primary routes', async ({ page }) => {
    test.setTimeout(60000);
    const auditRoutes = ['/', '/menu', '/book', '/account', '/t/12'];

    for (const route of auditRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      // Check critical violations
      const criticalViolations = axeResults.violations.filter(
        v => v.impact === 'critical'
      );

      expect(
        criticalViolations.length,
        `Critical a11y violations found on ${route}: ${JSON.stringify(criticalViolations, null, 2)}`
      ).toBe(0);
    }
  });

});
