import { NextResponse } from "next/server";
import { searchEvidence, type EvidenceLine } from "@/lib/search";

export async function POST(req: Request) {
  const body = (await req.json()) as { request?: string; lines?: EvidenceLine[] };
  const request = (body.request ?? "").slice(0, 600).trim();
  if (!request) return NextResponse.json({ error: "Describe what the client needs." }, { status: 400 });
  const lines = (body.lines ?? []).slice(0, 500).map((l) => ({ id: String(l.id), text: String(l.text).slice(0, 400) }));
  return NextResponse.json(await searchEvidence(request, lines));
}
