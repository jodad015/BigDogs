import { test, expect, type Page } from '@playwright/test';

// Runs against the local seed data (supabase/seed.sql). Some tests change it,
// so run `pnpm db:reset` before re-running. Requires VITE_ENABLE_EMAIL_AUTH=true.

test.describe.configure({ mode: 'serial' });

const shots = process.env.E2E_SCREENSHOTS;
async function shot(page: Page, name: string) {
  if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });
}

async function logIn(page: Page, email: string) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

test('an invite link survives signing in and claims the invited player', async ({ page }) => {
  await page.goto('/join/CLAIMDAVE');
  await expect(page).toHaveURL(/\/signup\?next=%2Fjoin%2FCLAIMDAVE/);

  await page.getByRole('link', { name: 'Log in' }).click();
  await logIn(page, 'dave@bigdogs.app');

  await expect(page).toHaveURL('/join/CLAIMDAVE');
  await expect(page.getByText('Acme Office', { exact: true })).toBeVisible();
  await expect(page.getByText('Dave', { exact: true })).toBeVisible();
  await shot(page, 'join-preview');

  await page.getByRole('button', { name: 'Join Acme Office' }).click();
  await expect(page).toHaveURL('/o/acme-office');
  await expect(page.getByText('Which player are you?')).toHaveCount(0);

  await page.getByRole('link', { name: 'People' }).first().click();
  const dave = page.getByRole('button', { name: /Dave/ });
  await expect(dave.getByText('You')).toBeVisible();
});

test('a new user joins with a code and adds themself as a player', async ({ page }) => {
  const email = `newbie-${Date.now()}@bigdogs.app`;
  await page.goto('/join/ACMEJOIN');
  await page.getByPlaceholder('What should we call you?').fill('Newbie');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign Up' }).click();

  await expect(page).toHaveURL('/join/ACMEJOIN');
  await page.getByRole('button', { name: 'Join Acme Office' }).click();

  await expect(page.getByText('Which player are you?')).toBeVisible();
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Erin' }).getByRole('button', { name: "That's me" }),
  ).toBeVisible();
  await shot(page, 'claim-step');
  await page.getByRole('button', { name: "I'm not on the list, add me" }).click();

  await expect(page).toHaveURL('/o/acme-office');
  await expect(page.getByText('Which player are you?')).toHaveCount(0);
});

test('an admin adds a coworker and creates an invite for them', async ({ page }) => {
  await page.goto('/login');
  await logIn(page, 'admin@bigdogs.app');
  await expect(page).toHaveURL('/o/acme-office');

  await page.goto('/o/acme-office/people');
  await page.getByLabel('Player name').fill('Zed');
  await page.getByRole('button', { name: 'Add' }).click();
  const zed = page.getByRole('button', { name: /Zed/ });
  await expect(zed).toBeVisible();

  await zed.click();
  await page.getByRole('button', { name: 'Invite as Zed' }).click();
  await expect(page.getByText(/\/join\/[A-Z0-9]+/)).toBeVisible();
  await shot(page, 'people-players');

  await page.getByRole('tab', { name: /Members/ }).click();
  await expect(page.getByLabel('Role for Alice')).toHaveValue('admin');
  await shot(page, 'people-members');

  await page.goto('/o/acme-office/invites');
  await expect(page.getByText('ACMEJOIN')).toBeVisible();
  await page.getByRole('button', { name: 'Create invite link' }).click();
  await expect(page.getByText(/localhost:5180\/join\//)).toBeVisible();
  await shot(page, 'invites');
});

test('members only see the controls they are allowed to use', async ({ page }) => {
  await page.goto('/login');
  await logIn(page, 'bob@bigdogs.app');
  await page.goto('/o/acme-office/people');

  await page.getByRole('button', { name: /Erin/ }).click();
  await expect(page.getByRole('button', { name: 'Invite as Erin' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);

  await page.getByRole('tab', { name: /Members/ }).click();
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(0);
});

test('switching orgs and the last owner guard', async ({ page }) => {
  await page.goto('/login');
  await logIn(page, 'carol@bigdogs.app');

  await page.getByRole('button', { name: /Acme Office|Garage Gym/ }).first().click();
  await page.getByRole('menuitem', { name: 'Garage Gym' }).click();
  await expect(page).toHaveURL('/o/garage-gym');

  await page.goto('/o/garage-gym/settings');
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Leave Garage Gym' }).click();
  await expect(page.getByText("You're the only owner")).toBeVisible();
  await shot(page, 'settings');
});

test('people page fits a phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await logIn(page, 'alice@bigdogs.app');
  await page.goto('/o/acme-office/people');
  await expect(page.getByRole('button', { name: /Erin/ })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
  await shot(page, 'people-mobile');
});
