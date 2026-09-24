import { NextResponse } from "next/server";
import { verifyRecord } from "@/lib/sign";
import type { SignedRecord } from "@/lib/types";

export async function POST(req: Request) {
  const record = (await req.json()) as SignedRecord;
  return NextResponse.json({ valid: verifyRecord(record) });
}
