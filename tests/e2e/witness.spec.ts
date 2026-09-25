import { expect, test } from "@playwright/test";

// Manager-witnessed: Efua asks Ama to confirm an entry from a 1-on-1, Ama confirms, the lines change tier.
// Not part of the recorded walkthrough.
test("a manager confirms an entry the worker showed them in a 1-on-1", async ({ page }, info) => {
  test.skip(info.project.name !== "check", "Checked in the check project only");
  const main = page.getByRole("main");
  const entry = main.locator("li.relative").filter({ hasText: "Moved a React risk dashboard" });
  const switchTo = async (who: RegExp) => {
    await page.getByRole("button", { name: /· Switch/ }).click();
    await page.getByRole("dialog", { name: "Switch user" }).getByRole("button", { name: who }).first().click();
    await expect(page.getByRole("button", { name: /· Switch/ })).toContainText(who);
  };

  await page.goto("/signin");
  await page.getByText("Sign in as Efua →").click();
  await expect(page).toHaveURL(/\/worker\/w1$/);
  await expect(entry.getByText("Own account")).toBeVisible();

  // Efua asks. Only this entry goes to Ama.
  await entry.getByRole("button", { name: "Ask Ama to confirm" }).click();
  await expect(entry.getByText(/Waiting for Ama to confirm/)).toBeVisible();

  // Ama is prompted on her dashboard and sees only that entry.
  await switchTo(/Ama Boateng/);
  await expect(main.getByText("1 entry to confirm from a 1-on-1")).toBeVisible();
  await main.getByRole("link", { name: "Engagement", exact: true }).first().click();
  const card = main.getByRole("region", { name: "Waiting for you to confirm" });
  await expect(card.getByText("Moved a React risk dashboard onto a shared component library")).toBeVisible();
  await expect(card.getByText(/incident review/)).toHaveCount(0);
  await card.getByRole("button", { name: "I saw this" }).click();
  await expect(main.getByRole("region", { name: "Waiting for you to confirm" })).toHaveCount(0);

  // Back as Efua: the entry is manager-witnessed, with Ama's confirmation dated.
  await switchTo(/Efua Mensah/);
  await expect(entry.getByText(/Ama Boateng confirmed a 1-on-1/)).toBeVisible();
  await expect(entry.getByText("Manager-witnessed")).toBeVisible();
  await expect(entry.getByRole("button", { name: "Ask Ama to confirm" })).toHaveCount(0);
});
