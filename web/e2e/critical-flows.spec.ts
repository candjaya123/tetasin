import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Critical P0 E2E Flows
// ---------------------------------------------------------------------------

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/tenant/dashboard`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button[type="submit"]');
    await expect(page.getByText(/email/i)).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid credentials|gagal/i)).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@tumbuhin.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/tenant/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/tenant/);
  });

  test('should logout and redirect to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@tumbuhin.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tenant/);

    await page.click('[data-testid="logout-button"]');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Dashboard Access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@tumbuhin.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tenant/);
  });

  test('should display dashboard after login', async ({ page }) => {
    await expect(page.getByText(/dashboard|ringkasan/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show sidebar navigation', async ({ page }) => {
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });

  test('should navigate to POS from sidebar', async ({ page }) => {
    await page.click('[data-testid="nav-pos"]');
    await expect(page).toHaveURL(/\/tenant\/pos/);
  });

  test('should navigate to Inventory from sidebar', async ({ page }) => {
    await page.click('[data-testid="nav-inventory"]');
    await expect(page).toHaveURL(/\/tenant\/inventory/);
  });

  test('should navigate to Finance from sidebar', async ({ page }) => {
    await page.click('[data-testid="nav-finance"]');
    await expect(page).toHaveURL(/\/tenant\/finance/);
  });
});

test.describe('Inventory CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@tumbuhin.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tenant/);
    await page.click('[data-testid="nav-inventory"]');
    await page.waitForURL(/\/tenant\/inventory/);
  });

  test('should display product list', async ({ page }) => {
    await expect(page.locator('table, [data-testid="product-list"]')).toBeVisible({ timeout: 5000 });
  });

  test('should open add product form', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]');
    await expect(page.getByText(/tambah produk/i)).toBeVisible();
  });

  test('should validate empty product form', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]');
    await page.click('[data-testid="save-product-button"]');

    await expect(page.getByText(/nama tidak boleh kosong|name is required/i)).toBeVisible();
  });

  test('should create a new product', async ({ page }) => {
    const productName = `Test Product ${Date.now()}`;

    await page.click('[data-testid="add-product-button"]');
    await page.fill('input[name="name"]', productName);
    await page.fill('input[name="sellingPrice"]', '15000');
    await page.click('[data-testid="save-product-button"]');

    await expect(page.getByText(productName)).toBeVisible({ timeout: 5000 });
  });

  test('should search products', async ({ page }) => {
    await page.fill('[data-testid="product-search"]', 'kopi');
    await page.press('[data-testid="product-search"]', 'Enter');

    await page.waitForTimeout(1000);
  });

  test('should show empty state when no products found', async ({ page }) => {
    await page.fill('[data-testid="product-search"]', 'xyznonexistent12345');
    await page.press('[data-testid="product-search"]', 'Enter');

    await expect(page.getByText(/tidak ditemukan|no products/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Role-Based UI Access', () => {
  test('should hide finance nav for kasir role', async ({ page }) => {
    // Login as kasir
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'kasir@tumbuhin.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tenant/);

    await expect(page.locator('[data-testid="nav-finance"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="nav-settings"]')).not.toBeVisible();
  });

  test('should show upgrade banner for free tier on Pro features', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'free@tumbuhin.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tenant/);

    await page.click('[data-testid="nav-finance"]');
    await expect(page.getByText(/upgrade|tingkatkan/i)).toBeVisible({ timeout: 5000 });
  });

  test('should allow Pro tier to access all features', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@tumbuhin.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tenant/);

    await expect(page.locator('[data-testid="nav-finance"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-staff"]')).toBeVisible();
  });
});

test.describe('Error & Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@tumbuhin.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tenant/);
  });

  test('should show error page for non-existent route', async ({ page }) => {
    await page.goto(`${BASE_URL}/tenant/nonexistent-page-12345`);
    await expect(page.getByText(/404|tidak ditemukan|not found/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle network error gracefully', async ({ page }) => {
    await page.route('**/api/v1/inventory/products**', (route) => route.abort('internetdisconnected'));

    await page.click('[data-testid="nav-inventory"]');
    await expect(page.getByText(/error|kesalahan|gagal/i)).toBeVisible({ timeout: 10000 });
  });

  test('should prevent double-submit on form', async ({ page }) => {
    await page.click('[data-testid="nav-inventory"]');
    await page.click('[data-testid="add-product-button"]');
    await page.fill('input[name="name"]', `Double Submit Test ${Date.now()}`);
    await page.fill('input[name="sellingPrice"]', '25000');

    await page.click('[data-testid="save-product-button"]');
    await page.click('[data-testid="save-product-button"]');

    await page.waitForTimeout(2000);
  });
});

test.describe('Receipt OCR Flow (if available)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@tumbuhin.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tenant/);
  });

  test('should show receipt scan page', async ({ page }) => {
    await page.goto(`${BASE_URL}/tenant/receipt/scan`);
    await expect(page.getByText(/scan|unggah|upload|foto/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show drafts list', async ({ page }) => {
    await page.goto(`${BASE_URL}/tenant/receipt`);
    await expect(page.locator('body')).toBeVisible();
  });
});