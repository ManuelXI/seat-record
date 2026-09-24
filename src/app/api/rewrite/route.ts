import { NextResponse } from "next/server";
import { rewrite } from "@/lib/rewrite";
import { screenText } from "@/lib/screen";

export async function POST(req: Request) {
  const body = (await req.json()) as { text?: string; clientType?: string; stack?: string[]; protectedTerms?: string[] };
  const text = (body.text ?? "").slice(0, 2000);
  // Defence in depth: refuse anything the browser screen should already have caught.
  if (screenText(text, body.protectedTerms ?? []).length > 0) {
    return NextResponse.json({ error: "Entry still contains screened terms. Replace the red highlights first." }, { status: 400 });
  }
  const result = await rewrite(text, { clientType: body.clientType ?? "Client", stack: body.stack ?? [] });
  return NextResponse.json(result);
}
