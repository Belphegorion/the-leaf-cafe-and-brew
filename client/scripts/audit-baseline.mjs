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

  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    }
  });

  const auditResults = {
    overflows: [],
    a11y: {},
    consoleIssues: [],
  };

  console.log('1. Checking baseline screenshots & axe audits...');
  for (const r of ROUTES) {
    console.log(`Checking route: ${r.name} (${r.path})`);
    await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600); // Wait for preloader & animations

    // Capture desktop baseline screenshot
    await page.setViewportSize({ width: 1440, height: 900 });
    const screenPathBefore = path.resolve(`../audit/before-after/before-${r.name}-desktop.png`);
    await page.screenshot({ path: screenPathBefore, fullPage: false });

    // Capture mobile baseline screenshot
    await page.setViewportSize({ width: 375, height: 812 });
    const screenPathMobile = path.resolve(`../audit/before-after/before-${r.name}-mobile.png`);
    await page.screenshot({ path: screenPathMobile, fullPage: false });

    // Run Axe
    try {
      const axeResults = await new AxeBuilder({ page }).analyze();
      auditResults.a11y[r.name] = {
        violationsCount: axeResults.violations.length,
        violations: axeResults.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length,
          nodeSummary: v.nodes.slice(0, 3).map(n => n.html),
        })),
      };
    } catch (e) {
      console.error(`Axe error on ${r.name}:`, e.message);
    }
  }

  console.log('2. Checking responsive overflows across all breakpoints...');
  for (const bp of BREAKPOINTS) {
    for (const r of [ROUTES[0], ROUTES[1], ROUTES[2], ROUTES[3]]) {
      await page.setViewportSize({ width: bp, height: 800 });
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const hasOverflow = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        return {
          overflow: scrollWidth > innerWidth,
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
        console.warn(`OVERFLOW detected on ${r.name} at ${bp}px: scrollWidth ${hasOverflow.scrollWidth} > innerWidth ${hasOverflow.innerWidth}`);
      }
    }
  }

  auditResults.consoleIssues = consoleLogs;
  const outPath = path.resolve(process.cwd(), '../audit/baseline-audit.json');
  fs.writeFileSync(outPath, JSON.stringify(auditResults, null, 2));
  console.log('Baseline audit finished and saved to ' + outPath);

  await browser.close();
}

run().catch(console.error);
