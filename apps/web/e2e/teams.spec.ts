import { test, expect, type Page } from '@playwright/test';

// Runs against the local seed data. Run `pnpm db:reset` first.

test.describe.configure({ mode: 'serial' });

const TEAMS = '/o/acme-office/people?tab=teams';
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

function teamRow(page: Page, name: string | RegExp) {
  return page.getByRole('button', { name });
}

test('the teams tab lists named and unnamed teams', async ({ page }) => {
  await logIn(page, 'bob@bigdogs.app');
  await page.goto(TEAMS);
  await expect(teamRow(page, /Bag Daddies/)).toContainText('Alice & Bob');
  await expect(teamRow(page, /^Carol & Dave/)).toBeVisible();
});

test('rename a team and see it on the board', async ({ page }) => {
  await logIn(page, 'bob@bigdogs.app');
  await page.goto(TEAMS);
  await teamRow(page, /^Carol & Dave/).click();
  await page.getByLabel('Team name').fill('Corn Stars');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(teamRow(page, /Corn Stars/)).toContainText('Carol & Dave');

  await page.goto(CORNHOLE);
  await expect(page.getByRole('button', { name: /Corn Stars/ })).toBeVisible();
});

test('create a team, and spot an existing roster', async ({ page }) => {
  await logIn(page, 'bob@bigdogs.app');
  await page.goto(TEAMS);

  await page.getByRole('button', { name: 'New team' }).click();
  await page.getByRole('button', { name: /^Dave$/ }).click();
  await page.getByRole('button', { name: /^Erin$/ }).click();
  await page.getByLabel('Team name').fill('Night Shift');
  await page.getByRole('button', { name: 'Create team' }).click();
  await expect(teamRow(page, /Night Shift/)).toContainText('Dave & Erin');

  await page.getByRole('button', { name: 'New team' }).click();
  await page.getByRole('button', { name: /^Alice$/ }).click();
  await page.getByRole('button', { name: /^Bob$/ }).click();
  await expect(page.getByText('These players are already a team: Bag Daddies.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rename team' })).toBeDisabled();
  await shot(page, 'teams-tab');
});

test('the log form names new teams and recognizes existing ones', async ({ page }) => {
  await logIn(page, 'bob@bigdogs.app');
  await page.goto(`${CORNHOLE}/log`);

  // Bob is preselected
  await page.getByRole('button', { name: /^Alice/ }).click();
  await expect(page.getByText('Team: Bag Daddies')).toBeVisible();

  await page.getByRole('button', { name: /^Alice/ }).click(); // swap Alice for Dave
  await page.getByRole('button', { name: /^Dave/ }).click();
  await page.getByLabel('Team name').fill('Kernels');
  await page.getByLabel('Score', { exact: true }).fill('17');
  await page.getByRole('button', { name: 'Log score' }).click();

  await expect(page.getByRole('button', { name: /Kernels/ })).toContainText('17.0 pts');
});

test('only admins can delete teams', async ({ page, browser }) => {
  await logIn(page, 'bob@bigdogs.app');
  await page.goto(TEAMS);
  await teamRow(page, /Night Shift/).click();
  await expect(page.getByRole('button', { name: 'Delete team' })).toHaveCount(0);

  const alice = await (await browser.newContext()).newPage();
  await logIn(alice, 'alice@bigdogs.app');
  await alice.goto(TEAMS);
  await teamRow(alice, /Night Shift/).click();
  alice.once('dialog', (d) => d.accept());
  await alice.getByRole('button', { name: 'Delete team' }).click();
  await expect(teamRow(alice, /Night Shift/)).toHaveCount(0);
});
