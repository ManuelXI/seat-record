import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import { canonicalJson } from "./canonical";
import { DEMO_KEY_ID, DEMO_PRIVATE_KEY_PEM, DEMO_PUBLIC_KEY_PEM } from "./demo-key";
import type { SignedRecord } from "./types";

export type UnsignedRecord = Omit<SignedRecord, "signature" | "keyId">;

function payload(r: UnsignedRecord): Buffer {
  const { id, workerId, engagementId, checkpointId, approver, approvedAt, lines } = r;
  return Buffer.from(canonicalJson({ id, workerId, engagementId, checkpointId, approver, approvedAt, lines }));
}

export function signRecord(r: UnsignedRecord): SignedRecord {
  const key = createPrivateKey(DEMO_PRIVATE_KEY_PEM);
  const signature = sign(null, payload(r), key).toString("base64");
  return { ...r, signature, keyId: DEMO_KEY_ID };
}

export function verifyRecord(r: SignedRecord): boolean {
  try {
    const key = createPublicKey(DEMO_PUBLIC_KEY_PEM);
    return verify(null, payload(r), key, Buffer.from(r.signature, "base64"));
  } catch {
    return false;
  }
}
