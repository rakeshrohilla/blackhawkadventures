/**
 * End-to-end smoke test against a running server.
 *
 *   npm run build && npm start      # in one shell
 *   npm run smoke                   # in another
 *
 * Drives the real browser through the booking flow and the admin panel, so a
 * pass means a visitor can actually book and staff can actually manage it.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { chromium, type Browser, type Page } from "playwright";

/** Use a preinstalled Chromium when one is present (CI images often ship one). */
function findChromium(): string | undefined {
  if (process.env.PW_CHROME_PATH && existsSync(process.env.PW_CHROME_PATH)) {
    return process.env.PW_CHROME_PATH;
  }

  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(root)) return undefined;

  for (const entry of readdirSync(root)) {
    if (!entry.startsWith("chromium-")) continue;
    const candidate = join(root, entry, "chrome-linux", "chrome");
    if (existsSync(candidate)) return candidate;
  }

  return undefined;
}

const BASE = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@blackhawkadventures.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "blackhawk-admin-2026";

let failures = 0;

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`  PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function publicSite(page: Page) {
  console.log("\nPublic site");

  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  check("homepage loads", (await page.title()).includes("Black Hawk"));
  check("hero headline renders", (await page.locator("h1").first().innerText()).length > 5);
  const cards = await page.locator("article").count();
  check("featured trips render", cards >= 4, `found ${cards} cards`);
  check(
    "live departures table renders",
    (await page.getByText(/seats left|Sold out/).count()) > 0,
  );

  await page.goto(`${BASE}/tours`, { waitUntil: "domcontentloaded" });
  const allTours = await page.locator("article").count();
  check("tours listing lists every trip", allTours === 12, `found ${allTours}`);

  await page.goto(`${BASE}/tours?region=Ladakh`, { waitUntil: "domcontentloaded" });
  const ladakh = await page.locator("article").count();
  check("region filter narrows results", ladakh > 0 && ladakh < 12, `found ${ladakh}`);

  await page.goto(`${BASE}/tours/spiti-valley-winter-circuit`, { waitUntil: "domcontentloaded" });
  check("tour detail loads", (await page.locator("h1").first().innerText()).includes("Spiti"));
  check("itinerary renders", (await page.locator("details").count()) >= 8);
  check("departures sidebar renders", (await page.getByText(/seats left/).count()) > 0);

  await page.goto(`${BASE}/about`, { waitUntil: "domcontentloaded" });
  check("about page loads", (await page.locator("h1, h2").first().count()) > 0);

  await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });
  check("contact form renders", await page.locator('textarea[name="message"]').isVisible());
}

async function enquiry(page: Page) {
  console.log("\nEnquiry form");

  await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="name"]', "Smoke Test");
  await page.fill('input[name="email"]', "smoke@example.com");
  await page.fill('textarea[name="message"]', "This is an automated smoke test enquiry, please ignore.");
  await page.click('button[type="submit"]');
  await page.waitForSelector("text=Message received", { timeout: 15000 });
  check("enquiry submits and confirms", await page.getByText("Message received").isVisible());
}

async function booking(page: Page): Promise<string | null> {
  console.log("\nBooking flow");

  await page.goto(`${BASE}/tours/kedarkantha-summit-trek`, { waitUntil: "domcontentloaded" });
  await page.locator('a:has-text("Book this date")').first().click();
  await page.waitForURL(/\/book\/[^/]+$/, { timeout: 20000 });
  check("booking page opens", /\/book\/[^/]+$/.test(page.url()), page.url());

  // The selector only offers as many seats as the departure actually has left,
  // so pick the largest option up to two rather than assuming availability.
  const options = await page
    .locator('select[name="guests"] option')
    .evaluateAll((elements) => elements.map((element) => Number((element as HTMLOptionElement).value)));
  const guests = Math.min(2, Math.max(...options));
  check("guest selector is capped at remaining seats", options.length > 0 && Math.max(...options) <= 10);

  await page.selectOption('select[name="guests"]', String(guests));
  const travellerInputs = await page.locator('input[name="travellerName"]').count();
  check("traveller rows match guest count", travellerInputs === guests, `found ${travellerInputs}`);

  for (let index = 0; index < guests; index += 1) {
    await page.locator('input[name="travellerName"]').nth(index).fill(`Smoke Tester ${index + 1}`);
  }
  await page.locator('input[name="travellerAge"]').nth(0).fill("30");
  await page.fill('input[name="customerName"]', "Smoke Tester 1");
  await page.fill('input[name="customerEmail"]', "smoke.booking@example.com");
  await page.fill('input[name="customerPhone"]', "+91 90000 00000");
  await page.fill('textarea[name="notes"]', "Automated smoke test booking.");

  await page.click('button[type="submit"]');
  await page.waitForURL(/\/book\/confirmation\//, { timeout: 20000 });

  const reference = (await page.locator("text=/BHA-[A-Z0-9]{6}/").first().innerText()).trim();
  check("confirmation shows a reference", /^BHA-[A-Z0-9]{6}$/.test(reference), reference);
  check("confirmation lists the travellers", (await page.getByText("Smoke Tester 1").count()) > 0);
  return /^BHA-[A-Z0-9]{6}$/.test(reference) ? reference : null;
}

async function bookingLookup(page: Page, reference: string) {
  console.log("\nBooking lookup");

  const context = page.context();
  await context.clearCookies(); // forget that this browser made the booking

  await page.goto(`${BASE}/book/confirmation/${reference}`, { waitUntil: "domcontentloaded" });
  check("booking details are gated without the email", await page.getByText("Confirm it is you").isVisible());

  await page.fill('input[name="reference"]', reference);
  await page.fill('input[name="email"]', "smoke.booking@example.com");
  await page.click('button[type="submit"]');
  await page.waitForLoadState("domcontentloaded");
  check("correct email unlocks the booking", (await page.getByText(reference).count()) > 0);

  await page.goto(`${BASE}/book/confirmation/${reference}?email=wrong@example.com`, {
    waitUntil: "domcontentloaded",
  });
  check("wrong email stays locked", await page.getByText("Confirm it is you").isVisible());
}

async function admin(page: Page, reference: string | null) {
  console.log("\nAdmin panel");

  await page.context().clearCookies();
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  check("admin redirects anonymous users to login", page.url().includes("/admin/login"));

  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', "definitely-the-wrong-password");
  await page.click('button[type="submit"]');
  await page.waitForSelector("text=/not right/", { timeout: 15000 });
  check("wrong password is rejected", (await page.getByText(/not right/).count()) > 0);

  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin$/, { timeout: 20000 });
  check("correct password signs in", page.url().endsWith("/admin"));
  check("dashboard shows stats", (await page.getByText("Bookings to action").count()) > 0);

  await page.goto(`${BASE}/admin/bookings`, { waitUntil: "domcontentloaded" });
  check(
    "new booking appears in admin",
    reference ? (await page.getByText(reference).count()) > 0 : false,
  );

  if (reference) {
    await page.getByText(reference).first().click();
    await page.waitForURL(/\/admin\/bookings\/[^/?]+$/, { timeout: 20000 });
    const heading = await page.locator("h1").first().innerText();
    check("booking detail opens", heading.includes(reference), heading);

    await page.selectOption('select[name="status"]', "CONFIRMED");
    await page.selectOption('select[name="paymentStatus"]', "DEPOSIT_PAID");
    await page.fill('textarea[name="internalNotes"]', "Confirmed by smoke test.");
    await page.click('button:has-text("Save changes")');
    await page.waitForTimeout(2500);
    check("status change persists", (await page.getByText("Confirmed").count()) > 0);
  }

  await page.goto(`${BASE}/admin/enquiries`, { waitUntil: "domcontentloaded" });
  check("smoke enquiry reached the inbox", (await page.getByText("Smoke Test").count()) > 0);

  await page.goto(`${BASE}/admin/tours`, { waitUntil: "domcontentloaded" });
  check("trips list renders", (await page.getByText("Spiti Valley Winter Circuit").count()) > 0);

  await page.goto(`${BASE}/admin/departures`, { waitUntil: "domcontentloaded" });
  const departureRows = await page.locator("tbody tr").count();
  check("departures list renders", departureRows > 0, `${departureRows} rows`);
  check("departures show seat counts", (await page.getByText(/ left$/).count()) > 0);

  await page.goto(`${BASE}/admin/settings`, { waitUntil: "domcontentloaded" });
  check("settings form renders", await page.locator('input[name="contactEmail"]').isVisible());
}

async function main() {
  const executablePath = findChromium();
  const browser: Browser = await chromium.launch(executablePath ? { executablePath } : {});

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  page.on("pageerror", (error) => {
    failures += 1;
    console.log(`  FAIL  browser console error — ${error.message}`);
  });

  await publicSite(page);
  await enquiry(page);
  const reference = await booking(page);
  if (reference) await bookingLookup(page, reference);
  await admin(page, reference);

  await browser.close();

  console.log(failures === 0 ? "\nAll smoke checks passed.\n" : `\n${failures} check(s) failed.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
