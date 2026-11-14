import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Axe Detailed Violation Inspector', () => {
  test('Find all serious and critical violations on primary routes', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theleaf_visited', 'true');
    });

    // Intercept all /api/v1 calls to mock responses cleanly
    await page.route('**/api/v1/**', async route => {
      const url = route.request().url();
      if (url.includes('/menu/items')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      }
      if (url.includes('/orders')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { id: 'ORD-9821' } }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    const routes = [
      '/about',
      '/account',
      '/contact',
      '/design',
      '/admin',
    ];

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const nonCompliant = axeResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      console.log(`\n================ ROUTE: ${route} (Found: ${nonCompliant.length} violations) ================`);
      for (const v of nonCompliant) {
        console.log(`Rule: ${v.id} [${v.impact}] - ${v.description} (${v.nodes.length} nodes)`);
        for (const node of v.nodes.slice(0, 5)) {
          console.log(`  Target: ${JSON.stringify(node.target)}`);
          console.log(`  HTML: ${node.html.substring(0, 120)}`);
          console.log(`  Summary: ${node.failureSummary?.replace(/\n/g, ' ')}`);
        }
      }

      expect(nonCompliant.length).toBe(0);
    }
  });
});
