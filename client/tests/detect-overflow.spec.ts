import { test, expect } from '@playwright/test';

test.describe('True Unintended Spill-Out & Clipping Detector', () => {
  const viewports = [
    { name: 'iPhone SE (320px)', width: 320, height: 667 },
    { name: 'Samsung Galaxy (360px)', width: 360, height: 740 },
    { name: 'iPhone 13 Mini (375px)', width: 375, height: 812 },
    { name: 'iPhone 15 (390px)', width: 390, height: 844 },
    { name: 'iPhone Plus (414px)', width: 414, height: 896 },
  ];

  const routes = [
    '/',
    '/menu',
    '/book',
    '/pre-order',
    '/checkout',
    '/account',
    '/contact',
    '/t/4',
  ];

  for (const vp of viewports) {
    test(`Scan for true layout spills and text clipping on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of routes) {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(400);

        const realIssues = await page.evaluate((vpWidth) => {
          const results: Array<{
            tag: string;
            className: string;
            text: string;
            rect: { left: number; right: number; width: number };
            type: string;
            parentScrollable: boolean;
          }> = [];

          // Helper to check if any ancestor is an intentional scroll or overflow-hidden container that fits within viewport
          function isVisuallyContained(el: Element): boolean {
            let curr: Element | null = el.parentElement;
            while (curr && curr !== document.body && curr !== document.documentElement) {
              const style = window.getComputedStyle(curr);
              const isScroll =
                style.overflowX === 'auto' ||
                style.overflowX === 'scroll' ||
                curr.classList.contains('overflow-x-auto') ||
                curr.classList.contains('overflow-x-scroll');
              if (isScroll) return true;

              const isHidden =
                style.overflowX === 'hidden' ||
                style.overflow === 'hidden' ||
                curr.classList.contains('overflow-hidden');
              if (isHidden) {
                const parentRect = curr.getBoundingClientRect();
                if (parentRect.right <= vpWidth + 2) {
                  return true;
                }
              }
              curr = curr.parentElement;
            }
            return false;
          }

          // 1. Scan elements
          const all = document.querySelectorAll('header, nav, main, footer, section, div, button, a, h1, h2, h3, h4, p, span');
          all.forEach((el) => {
            if (el.classList.contains('sr-only') || el.closest('.sr-only')) return;

            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

            const isContained = isVisuallyContained(el);

            // True viewport overflow: element extends past viewport width AND is NOT inside an intentional horizontal scroll or masked container
            if (rect.right > vpWidth + 1 && !isContained) {
              if (['HTML', 'BODY', '#root'].includes(el.tagName)) return;
              results.push({
                tag: el.tagName.toLowerCase(),
                className: el.className.toString().slice(0, 100),
                text: (el.textContent || '').trim().slice(0, 60),
                rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) },
                type: 'unintended-viewport-spill',
                parentScrollable: false,
              });
            }

            // Check if text element has unintended clipping (scrollWidth > clientWidth without truncate/line-clamp class)
            if (
              el.children.length === 0 &&
              (el.textContent || '').trim().length > 3 &&
              !isContained
            ) {
              const isIntentional =
                el.classList.contains('truncate') ||
                Array.from(el.classList).some(c => c.startsWith('line-clamp-'));

              if (!isIntentional && el.scrollWidth > el.clientWidth + 2 && (style.overflow === 'hidden' || style.textOverflow === 'ellipsis')) {
                results.push({
                  tag: el.tagName.toLowerCase(),
                  className: el.className.toString().slice(0, 100),
                  text: (el.textContent || '').trim().slice(0, 60),
                  rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) },
                  type: 'text-truncated-or-clipped',
                  parentScrollable: false,
                });
              }
            }
          });

          return results;
        }, vp.width);

        if (realIssues.length > 0) {
          console.log(`\n🔴 [TRUE ISSUES on ${route} at ${vp.name}]: Found ${realIssues.length} true spill/clip issues:`);
          realIssues.forEach((iss, idx) => {
            console.log(`  #${idx + 1} [${iss.type}] <${iss.tag} class="${iss.className}">: right=${iss.rect.right}px (vp=${vp.width}px), width=${iss.rect.width}px, text="${iss.text}"`);
          });
        }

        expect(realIssues, `Found ${realIssues.length} layout spill/clip issues on ${route} at ${vp.name}`).toHaveLength(0);
      }
    });
  }
});
