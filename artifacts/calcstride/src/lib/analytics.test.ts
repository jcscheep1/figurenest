import assert from 'node:assert/strict';
import test from 'node:test';
import { GA_MEASUREMENT_ID, isAnalyticsEligible, safeAnalyticsData } from './analytics';

test('uses the fixed FigureNest GA4 measurement ID', () => {
  assert.equal(GA_MEASUREMENT_ID, 'G-DXVBC2FNSS');
});

test('allows only exact production hosts and indexable routes', () => {
  assert.equal(isAnalyticsEligible('figurenest.com', '/calculators/finance/loan?secret=1'), true);
  assert.equal(isAnalyticsEligible('www.figurenest.com', '/about#team'), true);
  assert.equal(isAnalyticsEligible('preview.figurenest.com', '/'), false);
  assert.equal(isAnalyticsEligible('figurenest.com.evil.example', '/'), false);
  assert.equal(isAnalyticsEligible('figurenest.com', '/sign-in'), false);
  assert.equal(isAnalyticsEligible('figurenest.com', '/not-a-real-page'), false);
});

test('filters analytics payloads to safe allowlisted dimensions', () => {
  assert.deepEqual(safeAnalyticsData({
    calculator_slug: 'loan',
    action: 'currency_change',
    link_domain: 'example.com',
    email: 'visitor@example.com',
    result: '1000',
    free_text: 'do not send this',
  }), {
    calculator_slug: 'loan',
    action: 'currency_change',
    link_domain: 'example.com',
  });
});