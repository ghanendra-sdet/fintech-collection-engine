/**
 * Sample Playwright + TypeScript regression test for the Collection Engine.
 * Uses the Page Object Model pattern. All data below is DUMMY/SAMPLE data
 * for portfolio demonstration only — no real credentials or endpoints.
 */

import { test, expect, Page } from '@playwright/test';

// ── Dummy test data ─────────────────────────────────────────────
const DUMMY_MERCHANT = {
  id: 'DEMOMERCHANT001',
  password: 'Dummy@Passw0rd',
};

const DUMMY_TRANSACTION = {
  amount: '500',
  vpa: 'test123@dummybank',
};

// ── Page Objects ─────────────────────────────────────────────────
class LoginPage {
  constructor(private page: Page) { }

  async goto() {
    await this.page.goto('/login');
  }

  async loginAs(merchantId: string, password: string) {
    await this.page.getByLabel('Merchant ID').fill(merchantId);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}

class DashboardPage {
  constructor(private page: Page) { }

  async getTotalTransactionsText() {
    return this.page.getByTestId('dashboard-total-transactions').innerText();
  }

  async goToCollection() {
    await this.page.getByRole('link', { name: 'Collection' }).click();
  }
}

class CollectionPage {
  constructor(private page: Page) { }

  async initiateCollection(amount: string, vpa: string) {
    await this.page.getByLabel('Amount').fill(amount);
    await this.page.getByLabel('VPA').fill(vpa);
    await this.page.getByRole('button', { name: 'Initiate Payment' }).click();
  }

  async getStatusBadgeText() {
    return this.page.getByTestId('collection-status-badge').innerText();
  }
}

class TransactionSearchPage {
  constructor(private page: Page) { }

  async goto() {
    await this.page.getByRole('link', { name: 'Transaction Search' }).click();
  }

  async searchByStatus(status: string) {
    await this.page.getByLabel('Status').selectOption(status);
    await this.page.getByRole('button', { name: 'Search' }).click();
  }

  async getResultsCount() {
    return this.page.getByTestId('search-results-row').count();
  }
}

// ── Tests ────────────────────────────────────────────────────────
test.describe('Collection Engine — Primary Regression Flow', () => {
  test('merchant can log in and reach the dashboard', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(DUMMY_MERCHANT.id, DUMMY_MERCHANT.password);

    await expect(page).toHaveURL(/dashboard/);
  });

  test('dashboard totals stay consistent after a new collection', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const collection = new CollectionPage(page);

    await login.goto();
    await login.loginAs(DUMMY_MERCHANT.id, DUMMY_MERCHANT.password);

    const totalBefore = await dashboard.getTotalTransactionsText();

    await dashboard.goToCollection();
    await collection.initiateCollection(DUMMY_TRANSACTION.amount, DUMMY_TRANSACTION.vpa);

    await expect(collection.getStatusBadgeText()).resolves.toMatch(/INITIATED|SUCCESS/);

    // Business rule: dashboard total transaction count must increase by exactly 1
    await page.goto('/dashboard');
    const totalAfter = await dashboard.getTotalTransactionsText();
    expect(Number(totalAfter)).toBe(Number(totalBefore) + 1);
  });

  test('transaction search filters correctly by status', async ({ page }) => {
    const login = new LoginPage(page);
    const search = new TransactionSearchPage(page);

    await login.goto();
    await login.loginAs(DUMMY_MERCHANT.id, DUMMY_MERCHANT.password);

    await search.goto();
    await search.searchByStatus('SUCCESS');

    const resultsCount = await search.getResultsCount();
    expect(resultsCount).toBeGreaterThanOrEqual(0);
    // Every visible row's status badge should read SUCCESS — spot-check the first row
    const firstStatus = await page.getByTestId('search-results-row').first()
      .getByTestId('row-status').innerText();
    expect(firstStatus).toBe('SUCCESS');
  });
});
