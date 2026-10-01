import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { count, shortAddress, usd } from "@/lib/format";
import { compartmentParam, gradeCompartments, isCompartment } from "@/lib/grades";
import type { Facet, Listing } from "@/lib/types";
import { Slab, Tilt } from "./slab";

/*
 * THE DEALER'S CASE.
 * Collectors work a case at a show the same way every time: go to the grade compartment, read the slab LABELS down the
 * glass (year, set, card, number, grade, cert), then ask for one to be pulled out and inspected in hand. This marketplace
 * is built on that behaviour instead of a product grid. Same production listings, filters and pages underneath.
 */

/** The grade word printed on a PSA label. Other graders use different scales, so only PSA's whole grades are named. */
const PSA_WORD: Record<string, string> = { "10": "GEM MT", "9": "MINT", "8": "NM-MT", "7": "NM", "6": "EX-MT", "5": "EX", "4": "VG-EX", "3": "VG", "2": "GOOD", "1": "PR" };
function gradeWord(l: Listing): string | undefined {
  return l.card.grader === "PSA" && l.card.grade ? PSA_WORD[String(Number(l.card.grade))] : undefined;
}

/**
 * Compartments of the case, one per grade, with production's slab counts. Each compartment filters by every
 * production spelling of its grade (see lib/grades), so the count on it is the number of listings it opens.
 */
// The router marks a link current when its search is a subset of the URL's; "All grades" (no grade) must not match a graded page.
const exact = { explicitUndefined: true };

export function GradeCompartments({ grades, current, base }: { grades: Facet[]; current?: string; base: Record<string, unknown> }) {
  const compartments = gradeCompartments(grades);
  if (!compartments.length) return null;
  const cell = (on: boolean) =>
    `flex min-w-[92px] shrink-0 flex-col justify-between border px-4 py-3 text-left transition-colors ${on ? "border-gold bg-gold/10" : "border-line bg-velvet hover:border-line-strong"}`;
  return (
    <nav aria-label="Case compartments by grade" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-2">
        <li>
          <Link to="/market" search={{ ...base, grade: undefined, page: 1 }} activeOptions={exact} aria-current={!current ? "page" : undefined} className={cell(!current)}>
            <span className="font-display text-sm font-semibold text-paper-dim">All grades</span>
            <span className="mt-3 text-xs text-muted">Every slab</span>
          </Link>
        </li>
        {compartments.map((c) => {
          const on = isCompartment(current, c);
          return (
            <li key={c.grade}>
              <Link to="/market" search={{ ...base, grade: compartmentParam(c), page: 1 }} activeOptions={exact} aria-current={on ? "page" : undefined} className={cell(on)}>
                <span className="font-display text-sm font-semibold text-paper-dim">Grade</span>
                <span className="mt-1 flex items-baseline gap-2">
                  <span className={`shout text-4xl leading-none ${on ? "text-gold" : "text-paper"}`}>{c.grade}</span>
                  {c.count > 0 && <span className="text-xs text-muted">{count(c.count)} listed</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** One listing, read the way its slab label reads: year and set, card, number on the left; grade and cert on the right. */
function LabelRow({ l, on, onPull }: { l: Listing; on: boolean; onPull: () => void }) {
  const c = l.card;
  const top = [c.year, c.set].filter(Boolean).join(" ");
  const delta = l.priceUsd !== null && c.valueUsd ? Math.round(((l.priceUsd - c.valueUsd) / c.valueUsd) * 100) : null;
  const word = gradeWord(l);
  return (
    <li>
      <Link
        to="/market/$listingId"
        params={{ listingId: String(l.listingId ?? l.id) }}
        onMouseEnter={onPull}
        onFocus={onPull}
        aria-label={`${c.title}, ${c.grader ?? "grade"} ${c.grade ?? ""}, ${usd(l.priceUsd)}`}
        className={`group grid grid-cols-[48px_minmax(0,1fr)] items-stretch gap-3 py-1.5 lg:grid-cols-[minmax(0,1fr)_150px] lg:gap-5 ${on ? "lg:translate-x-1" : ""} transition-transform`}
      >
        {/* phones have no hover tray, so the slab sits beside its label */}
        <span className="lg:hidden">
          {(c.images.slab || c.images.front) && <img src={c.images.slab ?? c.images.front} alt="" loading="lazy" className="h-[72px] w-12 object-contain" />}
        </span>
        <span className="grid min-w-0 grid-cols-1 gap-2 lg:contents">
          {/* the label */}
          <span className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 border-l-[3px] bg-paper px-3 py-2.5 text-ink ${on ? "border-gold" : "border-transparent group-hover:border-gold/60"}`}>
            <span className="min-w-0 font-display uppercase leading-[1.15] tracking-[0.02em]">
              <span className="block truncate text-[11px] font-semibold text-ink/60">{top || " "}</span>
              <span className="block truncate text-[15px] font-bold">{c.title}</span>
              <span className="block truncate text-[11px] font-semibold text-ink/60">{c.number ? `#${c.number}` : " "}{c.rarity ? ` · ${c.rarity}` : ""}</span>
            </span>
            <span className="flex flex-col items-end justify-between text-right font-display uppercase leading-none">
              <span className="text-[11px] font-semibold text-ink/60">{c.grader ?? "Grade"}</span>
              <span className="mt-0.5 flex items-baseline gap-1.5">
                {word && <span className="text-[11px] font-bold">{word}</span>}
                <span className="text-2xl font-bold">{c.grade ?? "—"}</span>
              </span>
              <span className="mt-1 font-mono text-[10.5px] normal-case text-ink/60">{c.cert ?? ""}</span>
            </span>
          </span>
          {/* the ask, against the market */}
          <span className="flex items-center justify-between gap-3 lg:flex-col lg:items-end lg:justify-center lg:gap-0.5 lg:text-right">
            <span className="money text-xl leading-none sm:text-2xl">{usd(l.priceUsd)}</span>
            <span className="text-[11.5px] leading-tight">
              {delta !== null && (
                <span className={delta < -0.5 ? "text-ok" : "text-muted"}>
                  {Math.abs(delta) < 1 ? "at market" : `${Math.abs(delta)}% ${delta < 0 ? "under" : "over"} market`}
                </span>
              )}
              {l.bidCount > 0 && <span className="text-gold">{delta !== null ? " · " : ""}{l.bidCount} {l.bidCount === 1 ? "offer" : "offers"}</span>}
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

/** The slab pulled out of the case: the object, its ask, the market, the offers, and the way into the full listing. */
function Tray({ l }: { l: Listing }) {
  const c = l.card;
  return (
    <div className="rise">
      <p className="eyebrow">Pulled from the case</p>
      <div className="mx-auto mt-4 max-w-[300px]">
        <Tilt max={6}>
          <Slab key={l.id} card={c} sizes="300px" />
        </Tilt>
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold leading-tight">{c.title}</h2>
      <p className="label mt-1">{[c.year, c.set, c.number ? `#${c.number}` : undefined].filter(Boolean).join(" · ")}</p>
      <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-line py-4">
        <div>
          <dt className="label">Ask</dt>
          <dd className="money mt-1 text-2xl">{usd(l.priceUsd)}</dd>
        </div>
        <div>
          <dt className="label">Market value</dt>
          <dd className="num mt-1 text-xl text-paper-dim">{usd(c.valueUsd)}</dd>
        </div>
        <div>
          <dt className="label">Offers</dt>
          <dd className="num mt-1 text-xl text-paper-dim">
            {l.bidCount}
            {l.highestBidUsd !== null && <span className="block font-sans text-xs font-normal text-muted">best {usd(l.highestBidUsd)}</span>}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted">
        In escrow in the vault · listed by <span className="font-mono">{shortAddress(l.seller)}</span>
      </p>
      <Link to="/market/$listingId" params={{ listingId: String(l.listingId ?? l.id) }} className="btn-primary mt-5 w-full">
        Inspect this slab <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </div>
  );
}

/** The case: labels down the glass on the left, the pulled slab in the tray on the right (desktop). */
export function DealerCase({ list }: { list: Listing[] }) {
  const [pulled, setPulled] = useState(list[0]?.id);
  const current = list.find((l) => l.id === pulled) ?? list[0];
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
      <ol className="min-w-0" aria-label="Slabs in the case">
        {list.map((l) => (
          <LabelRow key={l.id} l={l} on={current?.id === l.id} onPull={() => setPulled(l.id)} />
        ))}
      </ol>
      <aside className="hidden lg:block" aria-label="Pulled slab">
        <div className="sticky top-40">{current && <Tray l={current} />}</div>
      </aside>
    </div>
  );
}
