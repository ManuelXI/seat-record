import Link from "next/link";
import type { Tier, WorkerType } from "@/lib/types";

const TIER_LABEL: Record<Tier, string> = {
  "client-approved": "Client-approved",
  "manager-witnessed": "Manager-witnessed",
  "engineer-account": "Own account",
};

export function TierChip({ tier }: { tier: Tier }) {
  const cls =
    tier === "client-approved"
      ? "bg-accent text-accent-ink"
      : tier === "manager-witnessed"
        ? "bg-warn-soft text-warn"
        : "border border-line-strong text-ink-2";
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wide ${cls}`}>
      {tier === "client-approved" && <CheckIcon className="h-3 w-3" />}
      {TIER_LABEL[tier]}
    </span>
  );
}

export function TypeBadge({ type }: { type: WorkerType }) {
  return (
    <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-wide text-ink-2">{type}</span>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" };
export function Button({ variant = "primary", className = "", ...props }: BtnProps) {
  const v = {
    primary: "bg-accent text-accent-ink hover:bg-accent-hover disabled:opacity-40",
    secondary: "border border-line-strong bg-surface-1 text-ink hover:bg-surface-2 disabled:opacity-40",
    ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
    danger: "border border-line-strong text-danger hover:bg-danger-soft",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${v} ${className}`}
    />
  );
}

export function ButtonLink({ href, variant = "primary", children, className = "" }: { href: string; variant?: "primary" | "secondary"; children: React.ReactNode; className?: string }) {
  const v = variant === "primary" ? "bg-accent text-accent-ink hover:bg-accent-hover" : "border border-line-strong bg-surface-1 text-ink hover:bg-surface-2";
  return (
    <Link href={href} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${v} ${className}`}>
      {children}
    </Link>
  );
}

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-ink-3">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden>/</span>}
          {it.href ? <Link href={it.href} className="hover:text-ink">{it.label}</Link> : <span className="text-ink-2">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function MockBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-2 text-xs text-ink-3">
      <span className="font-mono uppercase tracking-wide">Mocked</span>
      <span>{children}</span>
    </div>
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M3 8.5l3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Loading() {
  return <p className="text-ink-3">Loading…</p>;
}
