"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { engagementsFor, useStore } from "@/lib/store";
import { MANAGERS, type Session } from "@/lib/people";
import { TypeBadge } from "./ui";
import { IconClose } from "./icons";

const FEATURED = ["w1", "w2"];

/** Modal list of demo personas. Picking one switches straight into their view. */
export function UserSwitcher({ open, onClose, onSwitched }: { open: boolean; onClose: () => void; onSwitched?: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const { state, session, signIn, signOut } = useStore();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const choose = (s: Session) => {
    signIn(s);
    onClose();
    onSwitched?.();
    router.push(s.role === "worker" ? `/worker/${s.personId}` : "/");
  };

  const workers = [...state.workers].sort((a, b) => Number(FEATURED.includes(b.id)) - Number(FEATURED.includes(a.id)));
  const isCurrent = (role: Session["role"], id: string) => session?.role === role && session.personId === id;

  const Row = ({ role, id, name, detail, badge }: { role: Session["role"]; id: string; name: string; detail: string; badge?: React.ReactNode }) => {
    const current = isCurrent(role, id);
    return (
      <li>
        <button
          onClick={() => (current ? onClose() : choose({ role, personId: id }))}
          aria-current={current ? "true" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${current ? "bg-accent-soft" : "hover:bg-surface-2"}`}
        >
          <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 font-display text-xs font-semibold text-ink-2">
            {name.split(" ").map((p) => p[0]).join("")}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className={`block truncate text-sm ${current ? "font-medium text-accent-soft-ink" : "text-ink"}`}>{name}{current && " · you"}</span>
            <span className="block truncate text-xs text-ink-3">{detail}</span>
          </span>
          {badge}
        </button>
      </li>
    );
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      aria-labelledby="switch-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface-1 p-0 text-ink shadow-xl backdrop:bg-[oklch(15%_0.01_170/0.45)]"
    >
      <div className="flex max-h-[80vh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id="switch-title" className="text-xl font-semibold">Switch user</h2>
            <p className="text-sm text-ink-3">Each role sees a different app. Your demo data stays as it is.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink"><IconClose /></button>
        </header>

        <div className="space-y-5 overflow-y-auto px-3 py-4">
          <section aria-labelledby="sw-managers">
            <p id="sw-managers" className="eyebrow px-3 pb-1">Managers</p>
            <ul>
              {MANAGERS.map((m) => (
                <Row key={m.id} role="manager" id={m.id} name={m.name} detail={`${m.title} · ${state.engagements.filter((e) => e.engagementOwner === m.name).length} engagements`} />
              ))}
            </ul>
          </section>
          <section aria-labelledby="sw-workers">
            <p id="sw-workers" className="eyebrow px-3 pb-1">Workers</p>
            <ul>
              {workers.map((w) => (
                <Row key={w.id} role="worker" id={w.id} name={w.name} detail={engagementsFor(state, w.id)[0]?.clientLabel ?? ""} badge={<TypeBadge type={w.type} />} />
              ))}
            </ul>
          </section>
          <p className="px-3 text-xs text-ink-3">Client leads have no account. They only see the approval email.</p>
        </div>

        <footer className="flex justify-end border-t border-line px-5 py-3">
          <button
            onClick={() => { signOut(); onClose(); onSwitched?.(); router.push("/signin"); }}
            className="rounded-md px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            Sign out
          </button>
        </footer>
      </div>
    </dialog>
  );
}
