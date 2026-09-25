import Link from "next/link";
import { AccordionItem } from "@/components/Accordion";

type QA = { q: string; a: React.ReactNode };

const GROUPS: { title: string; items: QA[] }[] = [
  {
    title: "The idea",
    items: [
      { q: "What problem does Seat Record solve?", a: "When someone works inside a client team, everything they build lives in the client’s systems under NDA. When the engagement ends, the evidence ends with it. Seat Record captures the work while it is fresh, removes anything confidential, and gets the client to approve it, so the worker leaves with a record they can use and Bonarda can re-engage them on evidence." },
      { q: "Who is it for?", a: "Employees, contractors and freelancers placed with clients. Contractors and freelancers benefit most, because they usually get no review at all. Managers use it to prompt a checkpoint and see what clients approved. Client leads only ever see a short approval email." },
      { q: "How is this different from a reference or a LinkedIn recommendation?", a: "A reference is written once, from memory, and nobody can check it. Each Seat Record line is tied to something the worker wrote at the time, approved line by line by a named client lead on a date, and signed by Bonarda Works. Change a single word and the signature fails." },
      { q: "Doesn’t Bonarda already interview people after a project?", a: "Post-project interviews happen long after roll-off, when memory has faded and the client relationship is gone, and they are not screened for confidential detail. Seat Record captures at the time, screens before anything is stored, and produces material those interviews could reuse." },
    ],
  },
  {
    title: "Confidentiality and control",
    items: [
      { q: "What stops confidential client detail getting into a record?", a: "Three layers. A check in the browser catches client names, system names, people, figures, tickets and hostnames before anything is sent, with one-tap generic replacements. The model then flags subtler signals, such as domain terms, with a reason. Finally the client lead approves every line, so nothing they object to survives." },
      { q: "What are the replacement suggestions?", a: "When the screen catches something, it offers generic alternatives you can tap, such as “a production bug” for a ticket number or “upstream” for a system name, and adjusts the wording around it. They come from a fixed list, not the AI, because nothing leaves your browser until the screen is clear. You can always write your own instead." },
      { q: "Does my raw text ever reach the AI?", a: "No. Only text that has passed the browser check is sent. Your original wording is discarded when you approve an entry." },
      { q: "Can my manager read my log?", a: "No. A manager sees engagement status, what the client approved, and a count of lines you have not shared. They can open a checkpoint with a note, but only you choose and send lines." },
      { q: "Who can see my record, and can I share it?", a: "Your seat history is private to you and Bonarda Works. From My profile you can turn on an unlisted share link, copy it, or replace it so the old link stops working. Shared pages are not indexed by search engines." },
      { q: "Can the client change what I wrote?", a: "They can approve, edit or decline each line. Declined lines are deleted. Edited lines are what gets signed, so the record reflects what the client actually stands behind." },
      { q: "What if the client lead never replies?", a: "Your lines stay in your record, clearly labelled as your own account, or as manager-witnessed if your manager saw them. A checkpoint can also be opened early, for example before a client lead leaves." },
      { q: "What happens when I move to a new project?", a: "Your record follows you. Each engagement keeps its own log, checkpoints and signed lines. When one ends, its log closes and new entries go to your next engagement. Your profile, seat history and shared link show every engagement, newest first, and search shows which engagement each piece of evidence came from. Time on an internal Bonarda project between clients counts too, approved by its product owner." },
      { q: "Can I keep my record if I leave?", a: "Yes. Export my record downloads your client-approved lines with their signatures. Nothing in it belongs to a client, because it only contains screened, approved lines." },
    ],
  },
  {
    title: "The AI",
    items: [
      { q: "What does the AI actually do?", a: "Two jobs a form can’t: flag confidential detail a word list misses, with a reason, and rewrite a true, specific sentence into a true, generic one at skill level. Everything else, including the first screen, the grounding check, tiers, signing and storage, is plain code with tests." },
      { q: "Does the AI score or rank people?", a: "Never. There is no score field anywhere. Find people shows, for each requirement, the approved lines that support it. People are ordered by how many requirements have at least one approved line, then by availability, and the count is shown on each card so it can be checked quote by quote. The manager reads the quotes and decides." },
      { q: "How does Find people work?", a: "A manager describes what the client needs. The model breaks it into requirements and points at client-approved lines that support each one, with a short reason; it can only cite lines that exist. Keyword matching runs alongside, so nothing depends on the model alone. Only client-approved lines are searched; a worker’s private log never is." },
      { q: "What if the AI gets something wrong?", a: "A grounding check greys out any drafted line that claims a number or outcome you never wrote. You approve every line, and the client approves again. If the model is unavailable, you get a plain, clearly labelled draft instead." },
      { q: "Which model does it use?", a: "The code calls Claude Opus 5 through the Anthropic API, with structured output and a server-side fallback if a request is declined. This demo runs without an API key: the scripted entries and example requests show illustrative responses written to show what the model returns, and anything else you type gets a basic draft or keyword matching, labelled as such." },
    ],
  },
  {
    title: "Evidence tiers",
    items: [
      { q: "What do the three tiers mean?", a: "Client-approved: a named client lead approved the line on a date and Bonarda Works signed it. Manager-witnessed: your own account, read by your manager when you wrote it. Own account: dated and self-written, clearly labelled. Tiers are always shown, so nobody mistakes one for another." },
      { q: "What does the signature prove?", a: "That the exact wording, the approver and the date have not changed since Bonarda Works signed them. The seat history and shared pages check each signature live." },
    ],
  },
  {
    title: "This demo",
    items: [
      { q: "Is any of this real data?", a: "No. Bonarda Works, every person and every client are fictional." },
      { q: "Who should I sign in as?", a: "Start as Efua, a worker whose engagement is ending: log an entry, then send lines for approval and approve them as the client. Switch to Ama, her manager, to open a checkpoint or use Find people. Switch users any time from the card at the bottom of the sidebar." },
      { q: "Why is there a list of shared records if links are unlisted?", a: "The Shared records page exists so you can see shared records in this demo. In the product there is no directory: a record is only visible to people its owner sends the link to." },
      { q: "What is real and what is mocked?", a: <>The screen, grounding check, tiers, signing and share links are real. Client emails, the placement list and reminder delivery are mocked. The full table is on <Link href="/about" className="text-accent hover:underline">How it works</Link>.</> },
      { q: "Why doesn’t a link I created work on another device?", a: "The demo keeps changes in your browser. Records and links in the seed data work anywhere; ones you create while trying the demo live in that browser only." },
      { q: "How do I start again?", a: "Use Reset demo data in the sidebar, then Sign out just below it." },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="max-w-3xl space-y-10">
      <header className="space-y-3">
        <p className="eyebrow">Questions and answers</p>
        <h1 className="text-4xl font-semibold">Frequently asked questions</h1>
        <p className="text-lg text-ink-2">
          About the idea, confidentiality, the AI and this demo. Can&rsquo;t find something? <Link href="/about" className="text-accent hover:underline">How it works</Link> has the details.
        </p>
      </header>

      <nav aria-label="FAQ sections" className="flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <a key={g.title} href={`#${g.title.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="rounded-full border border-line px-3 py-1 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink">
            {g.title}
          </a>
        ))}
      </nav>

      {GROUPS.map((g) => (
        <section key={g.title} id={g.title.toLowerCase().replace(/[^a-z]+/g, "-")} className="scroll-mt-24 space-y-3">
          <h2 className="text-2xl font-semibold">{g.title}</h2>
          <div className="divide-y divide-line rounded-xl border border-line bg-surface-1">
            {g.items.map((it) => (
              <AccordionItem key={it.q} question={it.q}>{it.a}</AccordionItem>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
