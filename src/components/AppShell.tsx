"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { MANAGERS } from "@/lib/people";
import { ThemeToggle } from "./ThemeToggle";
import { UserSwitcher } from "./UserSwitcher";
import { IconChart, IconClose, IconGrid, IconInfo, IconLog, IconMenu, IconPen, IconReset, IconSearch, IconSwitch, IconUser, IconHelp, IconShare } from "./icons";

type NavItem = { href: string; label: string; icon: () => React.JSX.Element; match: (p: string) => boolean };

/** Pages that always render as the outside world sees them, even when someone is signed in. */
const PUBLIC_ONLY = ["/signin", "/client/", "/share/", "/shared"];

function Brand() {
  return (
    <Link href="/" className="flex flex-col leading-tight">
      <span className="font-display text-xl font-semibold text-ink">Seat Record</span>
      <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink-3">Bonarda Works</span>
    </Link>
  );
}

/** Slim bar for signed-out pages: sign-in, the client's email, the public seat history. */
function PublicShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const label = path.startsWith("/client/") ? "Client lead’s inbox" : path.startsWith("/share/") || path === "/shared" ? "Shared record" : null;
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <Brand />
          {label && <span className="hidden rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-ink-3 sm:inline">{label}</span>}
          <nav aria-label="Site" className="ml-auto hidden items-center gap-1 text-sm sm:flex">
            {[["/about", "How it works"], ["/faq", "FAQ"], ["/shared", "Shared records"]].map(([href, label]) => (
              <Link key={href} href={href} className={`rounded-md px-2.5 py-1.5 ${path.startsWith(href) ? "bg-surface-2 text-ink" : "text-ink-2 hover:text-ink"}`}>{label}</Link>
            ))}
          </nav>
          <div className="ml-auto sm:ml-2"><ThemeToggle /></div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6">{children}</main>
    </>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { session, state, reset } = useStore();
  const path = usePathname();
  const [confirming, setConfirming] = useState(false);
  const [switching, setSwitching] = useState(false);
  if (!session) return null;

  const isWorker = session.role === "worker";
  const person = isWorker ? state.workers.find((w) => w.id === session.personId) : MANAGERS.find((m) => m.id === session.personId);
  const name = person?.name ?? "";
  const initials = name.split(" ").map((p) => p[0]).join("");
  const id = session.personId;

  const primary: NavItem[] = isWorker
    ? [
        { href: `/worker/${id}`, label: "My seat log", icon: IconLog, match: (p) => p === `/worker/${id}` || p.startsWith(`/worker/${id}/checkpoint`) },
        { href: `/worker/${id}/new`, label: "Log your work", icon: IconPen, match: (p) => p === `/worker/${id}/new` },
        { href: `/profile/${id}`, label: "My profile", icon: IconUser, match: (p) => p.startsWith(`/profile/${id}`) || p.startsWith(`/history/${id}`) },
      ]
    : [
        { href: "/", label: "Your engagements", icon: IconGrid, match: (p) => p === "/" || p.startsWith("/worker/") || p.startsWith("/profile/") || p.startsWith("/history/") },
        { href: "/#find", label: "Find people", icon: IconSearch, match: () => false },
      ];
  const reference: NavItem[] = [
    { href: "/eval", label: "Evaluation", icon: IconChart, match: (p) => p.startsWith("/eval") },
    { href: "/about", label: "How it works", icon: IconInfo, match: (p) => p.startsWith("/about") },
    { href: "/faq", label: "FAQ", icon: IconHelp, match: (p) => p.startsWith("/faq") },
    { href: "/shared", label: "Shared records", icon: IconShare, match: (p) => p.startsWith("/shared") },
  ];

  const Item = ({ item }: { item: NavItem }) => {
    const active = item.match(path);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-accent-soft font-medium text-accent-soft-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
      >
        <Icon />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-5">
      <div className="px-2"><Brand /></div>

      <nav aria-label="Main" className="space-y-1">
        <p className="eyebrow px-3 pb-1">{isWorker ? "Your work" : "Manage"}</p>
        {primary.map((i) => <Item key={i.href} item={i} />)}
      </nav>

      <nav aria-label="Reference" className="space-y-1">
        <p className="eyebrow px-3 pb-1">About this demo</p>
        {reference.map((i) => <Item key={i.href} item={i} />)}
      </nav>

      <div className="mt-auto space-y-3">
        <ThemeToggle compact />
        {confirming ? (
          <div className="flex items-center gap-1 px-1 text-xs">
            <span className="text-ink-3">Reset all data?</span>
            <button className="rounded-md px-2 py-1 text-danger hover:bg-danger-soft" onClick={() => { reset(); setConfirming(false); }}>Reset</button>
            <button className="rounded-md px-2 py-1 text-ink-2 hover:bg-surface-2" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-ink-3 hover:bg-surface-2 hover:text-ink">
            <IconReset /> Reset demo data
          </button>
        )}
        <button
          onClick={() => setSwitching(true)}
          aria-haspopup="dialog"
          className="group flex w-full items-center gap-3 rounded-xl border border-line bg-surface-1 p-3 text-left transition-colors hover:border-line-strong hover:bg-surface-2"
        >
          <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-semibold text-accent-soft-ink">{initials}</span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-medium text-ink">{name}</span>
            <span className="block truncate font-mono text-[0.65rem] uppercase tracking-wider text-ink-3">{isWorker ? "Worker" : "Manager"} · Switch</span>
          </span>
          <span className="text-ink-3 group-hover:text-ink"><IconSwitch /></span>
        </button>
        <UserSwitcher open={switching} onClose={() => setSwitching(false)} onSwitched={onNavigate} />
      </div>
    </div>
  );
}

/** Signed-in layout: fixed sidebar on large screens, a top bar with a drawer on small ones. */
function SignedInShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-surface-1/40 lg:block">
        <Sidebar />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="rounded-md p-2 text-ink-2 hover:bg-surface-2">
          <IconMenu />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button aria-label="Close menu" className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-canvas">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 rounded-md p-2 text-ink-2 hover:bg-surface-2"><IconClose /></button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, session } = useStore();
  const path = usePathname();
  const publicOnly = PUBLIC_ONLY.some((p) => path.startsWith(p));
  // Session is read from browser storage; wait for hydration so server and client render the same shell.
  if (!ready || !session || publicOnly) return <PublicShell>{children}</PublicShell>;
  return <SignedInShell>{children}</SignedInShell>;
}
