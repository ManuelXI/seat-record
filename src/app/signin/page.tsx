"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MANAGERS } from "@/lib/people";
import { engagementsFor } from "@/lib/store";
import { Loading, TypeBadge } from "@/components/ui";

const FEATURED = ["w1", "w2"];

export default function SignIn() {
  const { state, ready, signIn } = useStore();
  const router = useRouter();
  if (!ready) return <Loading />;

  const asWorker = (id: string) => { signIn({ role: "worker", personId: id }); router.push(`/worker/${id}`); };
  const asManager = (id: string) => { signIn({ role: "manager", personId: id }); router.push("/"); };
  const featured = state.workers.filter((w) => FEATURED.includes(w.id));
  const others = state.workers.filter((w) => !FEATURED.includes(w.id));

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="space-y-3">
        <p className="eyebrow"><Link href="/" className="hover:text-ink">← About Seat Record</Link> · Demo sign-in, no passwords</p>
        <h1 className="text-4xl font-semibold">Who are you today?</h1>
        <p className="max-w-2xl text-ink-2">Each role sees a different app. Workers own their log and decide what reaches a client. Managers see engagements and can open a checkpoint, but never read or send a worker&rsquo;s lines.</p>
      </header>

      <section className="space-y-3" aria-labelledby="workers">
        <h2 id="workers" className="text-xl font-semibold">Workers</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {featured.map((w) => {
            const eng = engagementsFor(state, w.id)[0];
            return (
              <button key={w.id} onClick={() => asWorker(w.id)} className="card group flex flex-col items-stretch justify-start gap-2 p-5 text-left transition-colors hover:border-accent">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-xl font-semibold group-hover:text-accent">{w.name}</span>
                  <TypeBadge type={w.type} />
                </div>
                <p className="text-sm text-ink-2">{eng.role} · {eng.clientLabel}</p>
                <p className="text-sm text-accent">Sign in as {w.name.split(" ")[0]} →</p>
              </button>
            );
          })}
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer text-ink-3 hover:text-ink">Sign in as another worker</summary>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {others.map((w) => (
              <li key={w.id}>
                <button onClick={() => asWorker(w.id)} className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
                  <span>{w.name}</span><TypeBadge type={w.type} />
                </button>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="space-y-3" aria-labelledby="managers">
        <h2 id="managers" className="text-xl font-semibold">Managers</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MANAGERS.map((m) => {
            const n = state.engagements.filter((e) => e.engagementOwner === m.name).length;
            return (
              <button key={m.id} onClick={() => asManager(m.id)} className="card group flex flex-col items-stretch justify-start gap-2 p-5 text-left transition-colors hover:border-accent">
                <span className="font-display text-xl font-semibold group-hover:text-accent">{m.name}</span>
                <p className="text-sm text-ink-2">{m.title} · {n} engagements</p>
                <p className="text-sm text-accent">Sign in as {m.name.split(" ")[0]} →</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-line-strong p-5 text-sm text-ink-2">
        <p className="font-medium text-ink">Client leads have no account.</p>
        <p>They only ever see the approval link inside an email they already receive. Once a worker sends lines, the email opens from the worker&rsquo;s page.</p>
      </section>
    </div>
  );
}
