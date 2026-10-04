import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { ago, count, pct, usd, usdCompact } from "@/lib/format";
import { glow, packArtSrc, packAvailability, tierColor } from "@/lib/packs";
import type { CardSummary, OddsTier, Pack, Pull, SiteStats } from "@/lib/types";
import { LivePack } from "./pack-art";
import { Slab } from "./slab";

export function SectionHead({ title, eyebrow, note, action }: { title: string; eyebrow?: ReactNode; note?: string; action?: { to: string; label: string } }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="shout text-3xl sm:text-[2.6rem]">{title}</h2>
        {note && <p className="label mt-2">{note}</p>}
      </div>
      {action && (
        <Link to={action.to} className="group flex shrink-0 items-center gap-1.5 pb-1 font-display text-[15px] font-semibold text-paper-dim hover:text-gold">
          {action.label} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** The shop's scoreboard. Every number comes from /activity/stats. */
export function StatsLedger({ stats, fetchedAt }: { stats: SiteStats; fetchedAt: number }) {
  const rows: [string, string, boolean?][] = [
    ["Packs ripped", count(stats.packsOpened)],
    ["Chase pulls", count(stats.chaseCards)],
    ["Grails pulled", count(stats.grails)],
    ["Battles fought", count(stats.completedBattles)],
    ["Slabs for sale", count(stats.activeListings)],
    ["Bought back", usdCompact(stats.buybackPaidUsd)],
  ];
  return (
    <section aria-label="Live figures" className="border-y border-line bg-velvet">
      <dl className="wrap grid grid-cols-3 gap-x-4 lg:grid-cols-6">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col-reverse border-line py-5 lg:border-l lg:pl-5 lg:first:border-l-0 lg:first:pl-0">
            <dt className="label mt-1">{k}</dt>
            <dd className="num text-[1.7rem] leading-none text-paper sm:text-4xl">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="wrap pb-3 text-[11px] text-muted">
        <span className="live-dot mr-2 align-middle" aria-hidden="true" />
        Live from YourGrails · loaded {new Date(fetchedAt).toISOString().slice(11, 16)} UTC
      </p>
    </section>
  );
}

/** Odds at a glance: one bar, each tier's share of the pool. */
export function OddsBar({ odds }: { odds: OddsTier[] }) {
  if (!odds.length) return <p className="text-sm text-muted">Odds are not published for this pack right now.</p>;
  return (
    <figure>
      <div className="flex h-2.5 w-full gap-[2px] overflow-hidden" role="img" aria-label={odds.map((o) => `${o.label} ${pct(o.percentage)}`).join(", ")}>
        {odds.map((o, i) => (
          <span key={o.label} style={{ flexGrow: Math.max(o.percentage, 1.6), background: tierColor(o.label, i) }} />
        ))}
      </div>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
        {odds.map((o, i) => (
          <span key={o.label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2" style={{ background: tierColor(o.label, i) }} aria-hidden="true" />
            {o.label} <span className="num text-paper-dim">{pct(o.percentage)}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/** Odds in full: a ladder from common to grail, each rung's chance drawn to scale. */
export function OddsTable({ odds, caption }: { odds: OddsTier[]; caption?: string }) {
  if (!odds.length) return <p className="text-sm text-muted">Odds are not published for this pack right now.</p>;
  const max = Math.max(...odds.map((o) => o.percentage), 1);
  return (
    <table className="w-full text-sm">
      {caption && <caption className="label mb-3 text-left">{caption}</caption>}
      <thead className="sr-only">
        <tr>
          <th scope="col">Tier</th>
          <th scope="col">Card value</th>
          <th scope="col">Chance</th>
        </tr>
      </thead>
      <tbody>
        {[...odds].reverse().map((o, ri) => {
          const i = odds.length - 1 - ri;
          return (
            <tr key={o.label} className="border-t border-line">
              <th scope="row" className="w-24 py-3 text-left font-display text-[15px] font-semibold" style={{ color: tierColor(o.label, i) }}>
                {o.label}
              </th>
              <td className="py-3 tabular-nums text-paper-dim">{o.displayRange}</td>
              <td className="w-[42%] py-3">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 flex-1 bg-shelf">
                    <span className="block h-full" style={{ width: `${Math.max((o.percentage / max) * 100, 2)}%`, background: tierColor(o.label, i) }} />
                  </span>
                  <span className="num w-16 text-right text-paper">{pct(o.percentage)}</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** The sealed pack, standing on a lit pedestal in its own colour. Exact artwork pixels, no filters. */
export function PackPedestal({ tier, name, eager = false, live = false, phase = 0, amp = 1, minWidth = 0, className = "" }: { tier: string; name: string; eager?: boolean; live?: boolean; phase?: number; amp?: number; minWidth?: number; className?: string }) {
  const src = packArtSrc(tier);
  return (
    <div className={`relative flex items-end justify-center ${className}`}>
      {src && live ? (
        <div className="relative z-10 w-full">
          <LivePack tier={tier} name={name} eager={eager} phase={phase} amp={amp} minWidth={minWidth} />
        </div>
      ) : src ? (
        <img src={src} alt={`${name} pack`} width={600} height={900} loading={eager ? "eager" : "lazy"} decoding="async" className="relative z-10 aspect-[2/3] w-full object-contain" />
      ) : (
        <div className="relative z-10 flex aspect-[2/3] w-full items-center justify-center text-sm text-muted">{name}</div>
      )}
    </div>
  );
}

/** A pack presented as a product: the object, the price, what's inside, and the best cards in it. */
export function PackCard({ pack, eager = false, flip = false, compact = false, live = false, phase = 0, amp = 1, minWidth = 0 }: { pack: Pack; eager?: boolean; flip?: boolean; compact?: boolean; live?: boolean; phase?: number; amp?: number; minWidth?: number }) {
  const avail = packAvailability(pack);
  const chase = pack.chase.filter((c) => c.images.slab || c.images.front).slice(0, compact ? 3 : 4);
  return (
    <article className={`grid grid-cols-1 items-center gap-8 ${compact ? "sm:grid-cols-[200px_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14"}`}>
      <Link to="/packs/$packId" params={{ packId: pack.id }} className={`mx-auto block w-56 sm:w-64 ${compact ? "sm:w-full" : "lg:w-full lg:max-w-[400px]"} ${flip ? "lg:order-2" : ""}`}>
        <PackPedestal tier={pack.tier} name={pack.name} eager={eager} live={live} phase={phase} amp={amp} minWidth={minWidth} />
      </Link>
      <div>
        <p className="eyebrow first-letter:uppercase" style={{ color: `rgb(${glow(pack.tier)})` }}>
          {pack.tier} tier · {pack.cardsPerPack} graded card
        </p>
        <h3 className={`shout mt-2 ${compact ? "text-3xl" : "text-4xl sm:text-5xl"}`}>
          <Link to="/packs/$packId" params={{ packId: pack.id }} className="hover:text-gold-bright">{pack.name}</Link>
        </h3>
        <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
          <p>
            <span className="money text-4xl leading-none">{usd(pack.priceUsd)}</span> <span className="text-sm text-muted">USDC</span>
          </p>
          <dl className="flex gap-6 text-sm">
            <div>
              <dt className="label">Expected pull</dt>
              <dd className="num text-lg text-paper">{usd(pack.evUsd)}</dd>
            </div>
            {pack.buybackEnabled && pack.buybackPercentage !== null && (
              <div>
                <dt className="label">Instant buyback</dt>
                <dd className="num text-lg text-paper">{pack.buybackPercentage}% of market value</dd>
              </div>
            )}
          </dl>
        </div>
        <p className={`mt-3 text-sm ${avail.ok ? "text-ok" : "text-warn"}`}>{avail.text}</p>
        <div className="mt-6 max-w-lg">
          <OddsBar odds={pack.odds} />
        </div>
        {!compact && chase.length > 0 && (
          <div className="mt-8">
            <p className="label mb-2">Chase cards in this pack</p>
            <div className="grid max-w-lg grid-cols-4 gap-3">
              {chase.map((c) => (
                <ChaseThumb key={c.id} card={c} />
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/packs/$packId" params={{ packId: pack.id }} className="btn-primary">
            Look inside <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ChaseThumb({ card }: { card: CardSummary }) {
  return (
    <figure className="min-w-0">
      <Slab card={card} sizes="120px" />
      <figcaption className="mt-1.5">
        <span className="num block text-sm text-paper">{usd(card.valueUsd)}</span>
        <span className="block truncate text-[11.5px] text-muted">{card.title}</span>
      </figcaption>
    </figure>
  );
}

function PullItem({ p, now }: { p: Pull; now: number }) {
  return (
    <span className="flex shrink-0 items-center gap-3 pr-10">
      {p.image ? (
        <img src={p.image} alt="" width={30} height={48} loading="lazy" className="h-12 w-[30px] object-contain" />
      ) : (
        <span className="h-12 w-[30px] bg-shelf" aria-hidden="true" />
      )}
      <span className="leading-tight">
        <span className="block text-sm font-medium text-paper">{p.title}</span>
        <span className="block text-[12px] text-muted">
          <span style={{ color: tierColor(p.pullTier) }} className="font-display font-semibold capitalize">{p.pullTier ?? "pull"}</span>
          {p.packName ? ` · ${p.packName}` : ""} · {ago(p.revealedAt, now)}
        </span>
      </span>
      <span className="num text-lg text-paper">{usd(p.valueUsd)}</span>
    </span>
  );
}

/** The "just pulled" row: real reveals, newest first, scrolled sideways by hand. */
export function PullTicker({ pulls, now }: { pulls: Pull[]; now: number }) {
  if (!pulls.length) return null;
  return (
    <section aria-label="Just pulled" className="border-y border-line bg-velvet">
      <div className="flex items-center">
        <p className="z-10 flex h-[72px] shrink-0 items-center gap-2 border-r border-line bg-velvet px-4 font-display text-sm font-bold text-paper sm:px-6">
          <span className="live-dot" aria-hidden="true" /> Just pulled
        </p>
        <div className="ticker min-w-0 flex-1">
          <ul className="ticker-track items-center py-3 pl-6">
            {pulls.map((p) => (
              <li key={p.id}><PullItem p={p} now={now} /></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Reveals from one pack, newest first: the slab, its tier, its value. */
export function PullsList({ pulls, now }: { pulls: Pull[]; now: number }) {
  if (!pulls.length) return <p className="text-sm text-muted">No pulls reported yet.</p>;
  return (
    <ol className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
      {pulls.map((p) => (
        <li key={p.id} className="rise">
          <div className="stage">
            {p.image ? <img className="slab-img" src={p.image} alt="" width={300} height={480} loading="lazy" /> : <span className="relative z-10 mb-[30%] text-sm text-muted">No photo</span>}
          </div>
          <p className="mt-2 truncate text-sm font-medium">{p.title}</p>
          <p className="flex items-baseline justify-between gap-2 text-[12px]">
            <span className="font-display font-semibold capitalize" style={{ color: tierColor(p.pullTier) }}>{p.pullTier ?? "Pull"}</span>
            <span className="text-muted">{ago(p.revealedAt, now)}</span>
          </p>
          <p className="num text-lg text-paper">{usd(p.valueUsd)}</p>
        </li>
      ))}
    </ol>
  );
}

