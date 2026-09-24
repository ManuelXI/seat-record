"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import type { Session } from "@/lib/people";
import { Loading } from "./ui";

/**
 * Demo access control. Sends signed-out visitors to the sign-in page and shows a clear
 * message when a role opens a page that belongs to someone else.
 */
export function Guard({ allow, children }: { allow: (s: Session) => boolean; children: React.ReactNode }) {
  const { ready, session } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (ready && !session) router.replace("/signin");
  }, [ready, session, router]);
  if (!ready || !session) return <Loading />;
  if (!allow(session)) {
    return (
      <div className="card mx-auto max-w-lg space-y-3 p-6">
        <p className="eyebrow">Not yours to see</p>
        <h1 className="text-2xl font-semibold">This page belongs to someone else</h1>
        <p className="text-ink-2">Each worker&rsquo;s log, drafts and profile are theirs. Managers see engagement status and client-approved lines, never unshared entries.</p>
        <Link href="/" className="text-accent hover:underline">Go to your home page</Link>
      </div>
    );
  }
  return <>{children}</>;
}
