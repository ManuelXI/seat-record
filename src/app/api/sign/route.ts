import { NextResponse } from "next/server";
import { signRecord, type UnsignedRecord } from "@/lib/sign";

export async function POST(req: Request) {
  const record = (await req.json()) as UnsignedRecord;
  return NextResponse.json(signRecord(record));
}
