import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4173';
const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'menu', path: '/menu' },
  { name: 'booking', path: '/book' },
  { name: 'checkout', path: '/checkout' },
  { name: 'preorder', path: '/pre-order' },
  { name: 'tableqr', path: '/t/12' },
  { name: 'ordertracker', path: '/order/ORD-9821' },
  { name: 'account', path: '/account' },
  { name: 'about', path: '/about' },
  { name: 'design', path: '/design' },
  { name: 'admin', path: '/admin' },
];

const BREAKPOINTS = [
  320, 360, 375, 390, 414, 600, 768, 820, 1024, 1280, 1440, 1920, 2560
];

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/atlas/AppData/Local/ms-playwright/chromium-1254/chrome-win64/chrome.exe',
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set visited flag to bypass preloader animation delay
  await page.addInitScript(() => {
    window.localStorage.setItem('theleaf_visited', 'true');
  });

  const auditResults = {
    overflows: [],
    a11y: {},
    consoleIssues: [],
  };

  console.log('1. Capturing post-fix screenshots & running axe audits...');
  for (const r of ROUTES) {
    console.log(`Processing route: ${r.name} (${r.path})`);
    await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Desktop after screenshot
    await page.setViewportSize({ width: 1440, height: 900 });
    const screenPathAfterDesktop = path.resolve(`../audit/before-after/after-${r.name}-desktop.png`);
    await page.screenshot({ path: screenPathAfterDesktop, fullPage: false });

    // Mobile after screenshot
    await page.setViewportSize({ width: 375, height: 812 });
    const screenPathAfterMobile = path.resolve(`../audit/before-after/after-${r.name}-mobile.png`);
    await page.screenshot({ path: screenPathAfterMobile, fullPage: false });

    // Run Axe
    try {
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      auditResults.a11y[r.name] = {
        violationsCount: axeResults.violations.length,
        criticalCount: axeResults.violations.filter(v => v.impact === 'critical').length,
        seriousCount: axeResults.violations.filter(v => v.impact === 'serious').length,
        moderateCount: axeResults.violations.filter(v => v.impact === 'moderate').length,
        minorCount: axeResults.violations.filter(v => v.impact === 'minor').length,
        violations: axeResults.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length,
        })),
      };
    } catch (e) {
      console.error(`Axe error on ${r.name}:`, e.message);
    }
  }

  console.log('2. Checking responsive overflows across all breakpoints...');
  for (const bp of BREAKPOINTS) {
    for (const r of ROUTES) {
      await page.setViewportSize({ width: bp, height: 800 });
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);

      const hasOverflow = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        return {
          overflow: scrollWidth > innerWidth + 1,
          scrollWidth,
          innerWidth,
        };
      });

      if (hasOverflow.overflow) {
        auditResults.overflows.push({
          route: r.name,
          breakpoint: bp,
          scrollWidth: hasOverflow.scrollWidth,
          innerWidth: hasOverflow.innerWidth,
        });
      }
    }
  }

  fs.writeFileSync('../audit/post-audit.json', JSON.stringify(auditResults, null, 2));
  console.log('Post-audit complete! Saved to ../audit/post-audit.json');

  await browser.close();
}

run().catch(console.error);
