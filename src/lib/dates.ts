/** Fixed "today" so the demo is identical every time it runs. */
export const DEMO_TODAY = "2026-09-26";
export const ROLL_OFF_WINDOW_WORKING_DAYS = 15;

export function workingDaysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + "T00:00:00Z");
  const to = new Date(toIso + "T00:00:00Z");
  if (to <= from) return 0;
  let n = 0;
  for (let d = new Date(from); d < to; d.setUTCDate(d.getUTCDate() + 1)) {
    const next = new Date(d);
    next.setUTCDate(next.getUTCDate() + 1);
    const day = next.getUTCDay();
    if (day !== 0 && day !== 6) n++;
  }
  return n;
}

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function monthsBetween(a: string, b: string): number {
  const x = new Date(a + "T00:00:00Z");
  const y = new Date(b + "T00:00:00Z");
  return Math.max(1, Math.round((y.getTime() - x.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
}
