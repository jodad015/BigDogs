import { test, expect, type Page } from '@playwright/test';

// Runs against the local seed data (supabase/seed.sql). Run `pnpm db:reset`
// first; these tests add boards and scores.

test.describe.configure({ mode: 'serial' });

const DEAD_HANG = '/o/acme-office/b/40000000-0000-0000-0000-000000000001';
const PUTTING = '/o/acme-office/b/40000000-0000-0000-0000-000000000003';
const PULL_UPS = '/o/acme-office/b/40000000-0000-0000-0000-000000000002';
const CORNHOLE = '/o/acme-office/b/40000000-0000-0000-0000-000000000005';

const shots = process.env.E2E_SCREENSHOTS;
async function shot(page: Page, name: string) {
  if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });
}

async function logIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

function standingRow(page: Page, name: string) {
  return page
    .getByRole('listitem')
    .filter({ has: page.getByRole('button', { name: new RegExp(name) }) })
    .first();
}

test('boards list shows each board with its leaders', async ({ page }) => {
  await logIn(page, 'alice@bigdogs.app');
  await expect(page).toHaveURL('/o/acme-office');

  const deadHang = page.getByRole('link', { name: /Dead Hang/ });
  await expect(deadHang).toContainText('Dave');
  await expect(deadHang).toContainText('1:42.3');
  await expect(page.getByRole('link', { name: /Hallway Putting/ })).toContainText('9/10');
  await shot(page, 'boards');
});

test('create a board from a template and log the first score', async ({ page }) => {
  await logIn(page, 'alice@bigdogs.app');
  await page.getByRole('link', { name: 'New board' }).click();
  await page.getByRole('button', { name: /Plank/ }).click();
  await page.getByLabel('Board name').fill('Wall Sit');
  await shot(page, 'new-board-form');
  await page.getByRole('button', { name: 'Create leaderboard' }).click();

  await expect(page.getByRole('heading', { name: /Wall Sit/ })).toBeVisible();
  await expect(page.getByText('No scores yet')).toBeVisible();

  await page.getByRole('button', { name: 'Log a score' }).click();
  // Your own player is preselected and the score field is focused
  await expect(page.getByRole('button', { name: /Alice/ })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.type('1:30');
  await expect(page.getByText('1:30', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Log score' }).click();

  await expect(page.getByRole('heading', { name: /Wall Sit/ })).toBeVisible();
  await expect(standingRow(page, 'Alice')).toContainText('1:30');
});

test('log an X of Y score for a coworker and add someone new', async ({ page }) => {
  await logIn(page, 'alice@bigdogs.app');
  await page.goto(`${PUTTING}/log`);

  await expect(page.getByLabel('Attempts')).toHaveValue('10'); // board default
  await page.getByRole('button', { name: /Alice/ }).click(); // deselect me
  await page.getByLabel('Find or add a player').fill('Quinn');
  await page.getByRole('button', { name: 'Add "Quinn"' }).click();
  await expect(page.getByRole('button', { name: /Quinn/ })).toHaveAttribute('aria-pressed', 'true');

  await page.getByLabel('putts made').fill('10');
  await shot(page, 'log-x-of-y');
  await page.getByRole('button', { name: 'Log score' }).click();

  const quinn = standingRow(page, 'Quinn');
  await expect(quinn).toContainText('10/10');
  await expect(quinn).toContainText('100%');
  await expect(quinn.getByText('1', { exact: true })).toBeVisible(); // rank 1
});

test('team boards take a full roster and reuse teams', async ({ page }) => {
  await logIn(page, 'bob@bigdogs.app');
  await page.goto(`${CORNHOLE}/log`);

  // Bob is preselected; add Carol to make a new pair
  await page.getByRole('button', { name: /Carol/ }).click();
  await page.getByLabel('Score', { exact: true }).fill('24');
  await page.getByRole('button', { name: 'Log score' }).click();
  await expect(standingRow(page, 'Bob & Carol')).toContainText('24.0 pts');

  // Alice & Bob already exist as "Bag Daddies"
  await page.goto(`${CORNHOLE}/log`);
  await page.getByRole('button', { name: /Alice/ }).click();
  await page.getByLabel('Score', { exact: true }).fill('21');
  await page.getByRole('button', { name: 'Log score' }).click();
  await expect(standingRow(page, 'Bag Daddies')).toContainText('19.0 pts'); // avg of 21, 15, 21
  await shot(page, 'team-board');
});

test('time windows change the standings', async ({ page }) => {
  await logIn(page, 'bob@bigdogs.app');
  await page.goto(PULL_UPS);

  await expect(page.getByRole('tab', { name: 'This month' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByRole('tab', { name: 'All time' }).click();
  await expect(page).toHaveURL(/w=all_time/);
  await expect(standingRow(page, 'Bob')).toContainText('18 reps');
});

test('edit and delete your own score', async ({ page }) => {
  await logIn(page, 'carol@bigdogs.app');
  await page.goto(DEAD_HANG);

  await page.getByRole('button', { name: /Carol/ }).first().click(); // filter to Carol
  await page.getByRole('link', { name: 'Edit score' }).first().click();
  await expect(page.getByLabel('Score', { exact: true })).toHaveValue('1:04.0');
  await page.getByLabel('Score', { exact: true }).fill('1:50');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(standingRow(page, 'Carol')).toContainText('1:50.0');
  await expect(standingRow(page, 'Carol').getByText('1', { exact: true })).toBeVisible();

  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Delete score' }).first().click();
  await expect(page.getByRole('button', { name: /Carol/ })).toHaveCount(0);
});

test('a board updates live when someone else logs a score', async ({ browser }) => {
  const alice = await (await browser.newContext()).newPage();
  const bob = await (await browser.newContext()).newPage();
  await logIn(alice, 'alice@bigdogs.app');
  await logIn(bob, 'bob@bigdogs.app');

  await alice.goto(DEAD_HANG);
  await expect(standingRow(alice, 'Bob')).toContainText('1:35.7');

  await bob.goto(`${DEAD_HANG}/log`);
  await bob.getByLabel('Score', { exact: true }).fill('3:00');
  await bob.getByRole('button', { name: 'Log score' }).click();
  await expect(bob.getByRole('heading', { name: /Dead Hang/ })).toBeVisible();

  // No reload on Alice's side
  await expect(standingRow(alice, 'Bob')).toContainText('3:00.0', { timeout: 10_000 });
});

test('a board with scores locks what it measures', async ({ page }) => {
  await logIn(page, 'alice@bigdogs.app');
  await page.goto(`${DEAD_HANG}/edit`);
  await expect(page.getByText(/what it measures and who competes are locked/)).toBeVisible();
  await expect(page.getByRole('button', { name: /^Count/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /^Average/ })).toBeEnabled();
});

test('board and log pages fit a phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await logIn(page, 'alice@bigdogs.app');

  for (const path of ['/o/acme-office', PUTTING, `${CORNHOLE}/log`, '/o/acme-office/new']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBe(0);
  }
  await page.goto(PUTTING);
  await page.waitForLoadState('networkidle');
  await shot(page, 'board-mobile');
});
