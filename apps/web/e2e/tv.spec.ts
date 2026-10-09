import { test, expect, type Page } from '@playwright/test';

// Runs against the local seed data. Run `pnpm db:reset` first.

test.describe.configure({ mode: 'serial' });

const TOKEN = 'local-display-token';
const PULL_UPS = '40000000-0000-0000-0000-000000000002';
const RUBIKS = '40000000-0000-0000-0000-000000000006';

const shots = process.env.E2E_SCREENSHOTS;
async function shot(page: Page, name: string) {
  if (shots) await page.screenshot({ path: `${shots}/${name}.png` });
}

async function logIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

test('a bad display token explains itself', async ({ page }) => {
  await page.goto('/tv/not-a-real-token');
  await expect(page.getByText("This display link isn't active")).toBeVisible();
});

test('the display works without signing in and rotates boards', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/tv/${TOKEN}?interval=5`);

  await expect(page.getByText('· Acme Office')).toBeVisible();
  const first = await page.getByRole('heading', { level: 1 }).textContent();
  await expect(page.getByText(/^1\/\d+$/)).toBeVisible();
  await shot(page, 'tv-landscape');

  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(first ?? '', {
    timeout: 8_000,
  });
  await expect(page.getByText(/^2\/\d+$/)).toBeVisible();
});

test('a pinned board shows its standings', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1280 });
  await page.goto(`/tv/${TOKEN}?board=${PULL_UPS}`);

  await expect(page.getByRole('heading', { name: 'Pull-ups' })).toBeVisible();
  const leader = page.getByRole('listitem').first();
  await expect(leader).toContainText('Bob');
  await expect(leader).toContainText('18 reps');
  await expect(page.getByText(/^1\/\d+$/)).toHaveCount(0);
  await shot(page, 'tv-portrait');
});

test('a new #1 gets a banner on the display', async ({ page, browser }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/tv/${TOKEN}?board=${RUBIKS}`);
  await expect(page.getByRole('listitem').first()).toContainText('Bob');

  const carol = await (await browser.newContext()).newPage();
  await logIn(carol, 'carol@bigdogs.app');
  await carol.goto(`/o/acme-office/b/${RUBIKS}/log`);
  await carol.getByLabel('Score', { exact: true }).fill('31.5');
  await carol.getByRole('button', { name: 'Log score' }).click();
  await expect(carol.getByRole('heading', { name: /Rubik/ })).toBeVisible();

  // The display polls every 15s
  await expect(page.getByRole('status')).toContainText('Carol took #1', { timeout: 25_000 });
  await expect(page.getByRole('listitem').first()).toContainText('31.50s');
  await shot(page, 'tv-celebration');
});

test('admins manage display links; members do not see them', async ({ page }) => {
  await logIn(page, 'alice@bigdogs.app');
  await page.goto('/o/acme-office/settings');
  await expect(page.getByText('Kitchen tablet')).toBeVisible();
  await page.getByLabel('Display name').fill('Lobby TV');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Lobby TV')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Lobby TV' })).toHaveAttribute(
    'href',
    /\/tv\/[0-9a-f]{64}$/,
  );

  const bob = await (await page.context().browser()!.newContext()).newPage();
  await logIn(bob, 'bob@bigdogs.app');
  await bob.goto('/o/acme-office/settings');
  await expect(bob.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(bob.getByText('TV displays')).toHaveCount(0);
});
