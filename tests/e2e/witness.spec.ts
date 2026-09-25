import { expect, test, type Page } from "@playwright/test";

// Manager-witnessed: Efua asks Ama to confirm an entry from a 1-on-1 and Ama answers.
// Not part of the recorded walkthrough. Each test starts from the seed in a fresh browser.

const DASHBOARD_LINE = "Moved a React risk dashboard onto a shared component library";

async function switchTo(page: Page, who: RegExp) {
  await page.getByRole("button", { name: /· Switch/ }).click();
  await page.getByRole("dialog", { name: "Switch user" }).getByRole("button", { name: who }).first().click();
  await expect(page.getByRole("button", { name: /· Switch/ })).toContainText(who);
}

/** Signs in as Efua, asks Ama about the dashboard entry, and opens Ama's confirm card. */
async function askAndOpenAsAma(page: Page) {
  const main = page.getByRole("main");
  const entry = main.locator("li.relative").filter({ hasText: DASHBOARD_LINE });
  await page.goto("/signin");
  await page.getByText("Sign in as Efua →").click();
  await expect(page).toHaveURL(/\/worker\/w1$/);
  await expect(entry.getByText("Own account", { exact: true })).toBeVisible();
  await entry.getByRole("button", { name: "Ask Ama to confirm" }).click();
  await expect(entry.getByText(/Waiting for Ama to confirm/)).toBeVisible();

  await switchTo(page, /Ama Boateng/);
  await expect(main.getByText("1 entry to confirm from a 1-on-1")).toBeVisible();
  await main.getByRole("link", { name: "Engagement", exact: true }).first().click();
  const card = main.getByRole("region", { name: "Waiting for you to confirm" });
  await expect(card.getByText(DASHBOARD_LINE)).toBeVisible();
  // Only the entry Efua chose: nothing else from her log.
  await expect(card.getByRole("listitem").filter({ hasText: "Logged" })).toHaveCount(1);
  return { main, entry, card };
}

test.describe("manager-witnessed", () => {
  test.beforeEach(() => test.skip(test.info().project.name !== "check", "Checked in the check project only"));

  test("confirmed lines stay manager-witnessed through a checkpoint, then become client-approved", async ({ page }) => {
    const { main, entry, card } = await askAndOpenAsAma(page);
    await card.getByRole("button", { name: "I saw this" }).click();
    await expect(main.getByRole("region", { name: "Waiting for you to confirm" })).toHaveCount(0);
    await page.getByRole("link", { name: "Your engagements" }).first().click();
    await expect(main.getByText(/to confirm from a 1-on-1/)).toHaveCount(0);

    // Efua's seat log and profile show the new tier.
    await switchTo(page, /Efua Mensah/);
    await expect(entry.getByText(/Ama Boateng confirmed a 1-on-1/)).toBeVisible();
    await expect(entry.getByText("Manager-witnessed", { exact: true })).toBeVisible();
    await expect(entry.getByRole("button", { name: "Ask Ama to confirm" })).toHaveCount(0);
    await page.goto("/profile/w1");
    await page.getByRole("radio", { name: "With Seat Record" }).click();
    await expect(main.locator("li").filter({ hasText: DASHBOARD_LINE }).getByText("Manager-witnessed", { exact: true })).toBeVisible();

    // The checkpoint shows the tier, and the client can still approve the line as usual.
    await page.goto("/worker/w1");
    await main.getByRole("link", { name: "Review lines" }).first().click();
    const row = page.locator("label").filter({ hasText: DASHBOARD_LINE });
    await expect(row.getByText("Manager-witnessed", { exact: true })).toBeVisible();
    await expect(row.getByRole("checkbox")).toBeChecked();
    await page.getByRole("button", { name: /^Approve and send/ }).click();
    await page.getByRole("link", { name: "Open client email (mock)" }).click();
    const approve = main.getByRole("button", { name: "approve", exact: true });
    await expect(approve.first()).toBeVisible();
    for (let i = await approve.count(); i > 0; i--) await approve.nth(i - 1).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText("Thank you. Your approval is recorded.")).toBeVisible();

    await page.goto("/history/w1");
    await expect(page.getByText(DASHBOARD_LINE)).toBeVisible();
    await expect(page.getByText("Signature invalid")).toHaveCount(0);
    await expect(page.getByText("Signature valid").first()).toBeVisible();
  });

  test("a declined entry stays the worker's own account and cannot be asked again", async ({ page }) => {
    const { main, entry, card } = await askAndOpenAsAma(page);
    await card.getByRole("button", { name: "Not this one" }).click();
    await expect(main.getByRole("region", { name: "Waiting for you to confirm" })).toHaveCount(0);

    await switchTo(page, /Efua Mensah/);
    await expect(entry.getByText(/Ama could not confirm this one/)).toBeVisible();
    await expect(entry.getByText("Own account", { exact: true })).toBeVisible();
    await expect(entry.getByRole("button", { name: "Ask Ama to confirm" })).toHaveCount(0);
  });

  test("a worker can withdraw a request, and another manager never sees it", async ({ page }) => {
    const main = page.getByRole("main");
    const entry = main.locator("li.relative").filter({ hasText: DASHBOARD_LINE });
    await page.goto("/signin");
    await page.getByText("Sign in as Efua →").click();
    await entry.getByRole("button", { name: "Ask Ama to confirm" }).click();

    // Yaw does not own Efua's engagement: no confirm card for him.
    await switchTo(page, /Yaw Darko/);
    await page.goto("/worker/w1");
    await expect(main.getByRole("region", { name: "Waiting for you to confirm" })).toHaveCount(0);
    await expect(main.getByText(DASHBOARD_LINE)).toHaveCount(0);

    await switchTo(page, /Efua Mensah/);
    await entry.getByRole("button", { name: "Withdraw" }).click();
    await expect(entry.getByRole("button", { name: "Ask Ama to confirm" })).toBeVisible();

    await switchTo(page, /Ama Boateng/);
    await expect(main.getByText(/to confirm from a 1-on-1/)).toHaveCount(0);
  });
});
