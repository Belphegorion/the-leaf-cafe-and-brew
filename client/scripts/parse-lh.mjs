import fs from 'fs';

const d = JSON.parse(fs.readFileSync('../audit/lighthouse/baseline-desktop.json', 'utf8'));
const m = JSON.parse(fs.readFileSync('../audit/lighthouse/baseline-mobile.json', 'utf8'));

console.log('--- BASELINE LIGHTHOUSE ---');
console.log('DESKTOP:', {
  performance: Math.round((d.categories.performance?.score || 0) * 100),
  accessibility: Math.round((d.categories.accessibility?.score || 0) * 100),
  bestPractices: Math.round((d.categories['best-practices']?.score || 0) * 100),
  seo: Math.round((d.categories.seo?.score || 0) * 100),
  lcp: d.audits['largest-contentful-paint']?.displayValue,
  cls: d.audits['cumulative-layout-shift']?.displayValue,
  tbt: d.audits['total-blocking-time']?.displayValue,
});

console.log('MOBILE:', {
  performance: Math.round((m.categories.performance?.score || 0) * 100),
  accessibility: Math.round((m.categories.accessibility?.score || 0) * 100),
  bestPractices: Math.round((m.categories['best-practices']?.score || 0) * 100),
  seo: Math.round((m.categories.seo?.score || 0) * 100),
  lcp: m.audits['largest-contentful-paint']?.displayValue,
  cls: m.audits['cumulative-layout-shift']?.displayValue,
  tbt: m.audits['total-blocking-time']?.displayValue,
});
