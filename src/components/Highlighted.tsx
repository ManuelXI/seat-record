import type { ScreenHit } from "@/lib/screen";

/** Renders text with screen hits marked, for the "what leaves your laptop" preview. */
export function Highlighted({ text, hits }: { text: string; hits: ScreenHit[] }) {
  const parts: React.ReactNode[] = [];
  let at = 0;
  hits.forEach((h, i) => {
    if (h.start > at) parts.push(text.slice(at, h.start));
    parts.push(
      <mark key={i} title={h.reason} className="rounded bg-danger-soft px-0.5 text-danger underline decoration-wavy decoration-1 underline-offset-4">
        {text.slice(h.start, h.end)}
      </mark>,
    );
    at = h.end;
  });
  parts.push(text.slice(at));
  return <p className="whitespace-pre-wrap leading-relaxed">{parts}</p>;
}
