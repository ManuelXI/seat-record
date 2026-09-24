"use client";

import type { AppState } from "@/lib/types";
import { Button } from "./ui";

/** Worker keeps a copy of their screened, client-approved lines. Nothing in it belongs to a client. */
export function ExportButton({ state, workerId }: { state: AppState; workerId: string }) {
  const onClick = () => {
    const w = state.workers.find((x) => x.id === workerId)!;
    const records = state.records.filter((r) => r.workerId === workerId).map((r) => {
      const eng = state.engagements.find((e) => e.id === r.engagementId)!;
      return { ...r, engagement: eng.clientLabel, role: eng.role, period: `${eng.start} to ${eng.end}` };
    });
    const blob = new Blob(
      [JSON.stringify({ format: "seat-record/v1", issuer: "Bonarda Works", worker: w.name, exportedAt: new Date().toISOString(), verifyAt: "/history/" + workerId, records }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${w.name.toLowerCase().replace(/\s+/g, "-")}-seat-record.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return <Button variant="secondary" onClick={onClick}>Export my record</Button>;
}
