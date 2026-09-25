import { expect, type Locator, type Page } from "@playwright/test";

/**
 * The walkthrough from submission/demo-script.md, as one sequence of steps.
 * demo.spec.ts runs it twice: fast as a check ("check" project), and slowly with a visible
 * cursor and a saved video ("record" project). Keep this in step with the script.
 */

export interface Pace {
  /** Pause after each visible action, in ms. 0 when checking. */
  beat: number;
  /** Delay per typed character, in ms. 0 fills instantly. */
  typing: number;
  /** Called at the start of each section, for the chapter list. */
  chapter: (title: string) => void;
}

export const FAST: Pace = { beat: 0, typing: 0, chapter: () => {} };

export async function runDemo(page: Page, pace: Pace) {
  const beat = (times = 1) => (pace.beat ? page.waitForTimeout(pace.beat * times) : Promise.resolve());

  // Glide the cursor to the target before clicking, so a viewer can follow it in the video.
  const click = async (target: Locator) => {
    if (pace.beat) {
      // Best effort: the element can re-render mid-glide; click() below re-resolves and retries.
      try {
        await target.scrollIntoViewIfNeeded({ timeout: 5_000 });
        const box = await target.boundingBox();
        if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 });
        await page.waitForTimeout(250);
      } catch {}
    }
    await target.click();
    await beat();
  };

  const type = async (target: Locator, text: string) => {
    if (pace.typing) {
      await click(target);
      await target.press("ControlOrMeta+a");
      await target.pressSequentially(text, { delay: pace.typing });
      await beat();
    } else {
      await target.fill(text);
    }
  };

  const main = page.getByRole("main");
  const sidebar = (name: string) => page.getByRole("complementary").getByRole("link", { name, exact: true });

  const switchTo = async (who: RegExp) => {
    await click(page.getByRole("button", { name: /· Switch/ }));
    await click(page.getByRole("dialog", { name: "Switch user" }).getByRole("button", { name: who }).first());
    await expect(page.getByRole("button", { name: /· Switch/ })).toContainText(who);
    await page.waitForLoadState("networkidle");
  };

  // 0:00 The problem
  pace.chapter("The problem: landing page, Efua's profile before Seat Record");
  if (new URL(page.url()).pathname !== "/" || page.url() === "about:blank") await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A dated client approval");
  await beat(3);
  await click(page.getByRole("link", { name: /Try the demo/ }).first());
  await click(page.getByText("Sign in as Efua →"));
  await expect(page).toHaveURL(/\/worker\/w1$/);
  await click(sidebar("My profile"));
  await click(page.getByRole("radio", { name: "Before Seat Record" }));
  await expect(main.getByText("Worked on client systems (confidential).").first()).toBeVisible();
  await beat(3);

  // 0:30 Efua logs her work
  pace.chapter("Efua logs her work: screen, replacement, illustrative draft, grounding");
  await click(sidebar("My seat log"));
  await beat(2);
  await click(main.getByRole("link", { name: "Log your work" }).first());
  await click(page.getByRole("button", { name: /Client system name/ }));
  const entry = page.locator("textarea");
  await expect(entry).toHaveValue(/Aurora/);
  await beat(2);
  await click(page.getByRole("button", { name: "upstream", exact: true }));
  await expect(entry).toHaveValue(/the upstream ledger feed/);
  await beat();
  await click(page.getByRole("button", { name: "Check and draft lines" }));
  await expect(page.getByText(/Illustrative response, written to show what the model returns/)).toBeVisible();
  await beat(2);
  await click(page.getByRole("button", { name: "Use “risk”" }));

  const lines = page.getByRole("textbox", { name: "Line text" });
  await expect(lines.first()).toBeVisible();
  let greyed: Locator | undefined;
  for (let i = 0; i < (await lines.count()); i++) {
    if ((await lines.nth(i).inputValue()).startsWith("Eliminated")) greyed = lines.nth(i);
  }
  if (!greyed) throw new Error("Expected the greyed 'Eliminated all failures' line");
  await expect(page.getByText(/Not in your entry/)).toBeVisible();
  await beat();
  await type(greyed, "Removed recurring failures in an overnight process");
  await expect(page.getByText(/Not in your entry/)).toHaveCount(0);
  await click(page.getByRole("button", { name: /^Approve \d+ lines$/ }));
  await expect(page).toHaveURL(/\/worker\/w1$/);

  // 1:30 Ama opens a checkpoint
  pace.chapter("Ama, her manager, opens a checkpoint with a note");
  await switchTo(/Ama Boateng/);
  await expect(main.getByText("Needs attention")).toBeVisible();
  await beat(2);
  await click(main.getByRole("link", { name: "Engagement", exact: true }).first());
  await expect(main.getByText(/lines in Efua’s log not yet shared/)).toBeVisible();
  await beat(2);
  await page.getByLabel("Reason").selectOption("lead-change");
  await beat();
  await type(page.getByLabel("Note, visible to Efua"), "Your client lead moves on next month");
  await click(page.getByRole("button", { name: "Open checkpoint" }));
  await expect(page.getByText(/Opened\. Efua will see your note/)).toBeVisible();

  // 2:00 Efua sends, the client approves
  pace.chapter("Efua sends her lines; the client lead approves in the email");
  await switchTo(/Efua Mensah/);
  await expect(main.getByText(/Your client lead moves on next month/)).toBeVisible();
  await beat(2);
  await click(main.getByRole("link", { name: "Review lines" }).first());
  await click(page.getByRole("checkbox", { name: /React risk dashboard/ }));
  await expect(page.getByRole("checkbox", { name: /incident review/ })).toBeChecked();
  await click(page.getByRole("button", { name: /^Approve and send/ }));
  await click(page.getByRole("link", { name: "Open client email (mock)" }));

  await expect(page.getByText(/A short testimonial for Efua Mensah/)).toBeVisible();
  await beat(2);
  const decide = (text: string, action: "approve" | "edit" | "decline") =>
    click(main.locator("ul > li").filter({ hasText: text }).getByRole("button", { name: action, exact: true }));
  await decide("incident review", "approve");
  await decide("Rebuilt an overnight risk batch job", "approve");
  await decide("Set up contract tests", "approve");
  await decide("Removed recurring failures", "edit");
  await type(page.getByLabel("Edited line"), "Removed recurring failures in an overnight risk process");
  await decide("Worked across team boundaries", "decline");
  await type(page.getByLabel(/Anything you would like to add/), "Efua was calm under pressure and left the team in better shape.");
  await click(page.getByRole("button", { name: "Confirm" }));
  await expect(page.getByText("Thank you. Your approval is recorded.")).toBeVisible();
  await beat(2);

  // 2:50 The payoff
  pace.chapter("The payoff: profile, seat history, signatures, Find people");
  await click(page.getByRole("link", { name: /Back to Efua/ }));
  await click(page.getByRole("radio", { name: "With Seat Record" }));
  await expect(main.getByText(/incident review for a failed overnight run/).first()).toBeVisible();
  await beat(2);
  await click(main.getByRole("link", { name: "Seat history" }).first());
  await expect(page.getByText("Signature valid").first()).toBeVisible();
  await expect(page.getByText("Signature invalid")).toHaveCount(0);
  await beat(2);
  await click(page.getByRole("button", { name: "Try editing a word" }).first());
  await expect(page.getByText("Signature invalid")).toHaveCount(1);
  await beat();
  await click(page.getByRole("button", { name: "Undo edit" }));
  await expect(page.getByText("Signature invalid")).toHaveCount(0);

  await switchTo(/Ama Boateng/);
  await click(sidebar("Find people"));
  await click(page.getByRole("button", { name: /Java developer who has handled Kafka failures/ }));
  await expect(page.getByText(/from an illustrative response/)).toBeVisible();
  await click(page.getByRole("radio", { name: "Evidence for every requirement" }));
  await expect(page.getByText(/of 3 requirements evidenced/)).toHaveCount(1);
  await expect(page.getByText("3 of 3 requirements evidenced")).toBeVisible();
  await expect(main.getByText("Efua Mensah").first()).toBeVisible();
  await beat(4);

  // 3:30 Close
  pace.chapter("Close: How it works, Evaluation");
  await click(sidebar("How it works"));
  await expect(page.getByRole("heading", { name: "Real and mocked" })).toBeVisible();
  await page.getByRole("heading", { name: "Real and mocked" }).scrollIntoViewIfNeeded();
  await beat(3);
  await click(sidebar("Evaluation"));
  await expect(page.getByText(/planted terms caught by rules alone/)).toBeVisible();
  await beat(3);
}
