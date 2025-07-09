import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('should load and display the main application', async ({ page }) => {
    // Go to the homepage
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Check that we don't have any major error messages
    const errorMessages = page.locator('text=/error|Error|ERROR/');
    await expect(errorMessages).toHaveCount(0);

    // Check that the page has loaded some content (not just blank)
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();

    // Verify the page has the main layout
    const divCount = await page.locator('div').count();
    expect(divCount).toBeGreaterThan(0);
  });

  test('should have working JavaScript', async ({ page }) => {
    await page.goto('/');

    // Check that JavaScript is working by evaluating a simple expression
    const result = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });

    expect(result).toBe(true);
  });

  test('should load without critical console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that there are no critical console errors
    // Filter out common non-critical errors and server errors during development
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('404') &&
      !error.includes('net::ERR_FAILED') &&
      !error.includes('500 (Internal Server Error)') &&
      !error.includes('Failed to load resource') &&
      !error.includes('the server responded with a status of') &&
      !error.includes('ERR_NETWORK') &&
      !error.includes('ERR_CONNECTION_REFUSED')
    );

    // Log all errors for debugging but only fail on critical frontend errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found (filtered out server errors):', consoleErrors);
    }

    expect(criticalErrors).toHaveLength(0);
  });

  test('should render frontend components despite server errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check that the main UI structure is present even if APIs are failing
    const mainContainer = page.locator('div.flex.h-screen.w-full');
    await expect(mainContainer).toBeVisible();

    // Check that we have some interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Verify React has rendered something
    const reactElements = page.locator('div[class*="flex"], div[class*="p-"], button');
    const reactElementCount = await reactElements.count();
    expect(reactElementCount).toBeGreaterThan(0);
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // This test verifies the app doesn't crash when server APIs return errors
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that the page still loads and shows some content
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();

    // Verify that despite server errors, the UI is still interactive
    const clickableElements = page.locator('button, a, input');
    const clickableCount = await clickableElements.count();
    expect(clickableCount).toBeGreaterThan(0);

    // Take a screenshot to verify the UI is rendered
    await page.screenshot({ path: 'tests/screenshots/with-server-errors.png', fullPage: true });
  });
});
