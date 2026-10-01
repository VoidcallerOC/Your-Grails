import { Link } from "@tanstack/react-router";
import { ago, count, pct, usd, usdCompact } from "@/lib/format";
import { packAvailability } from "@/lib/packs";
import type { OddsTier, Pack, Pull, SiteStats } from "@/lib/types";
import { PackArt } from "./pack-art";

/** One ruled ledger line of live figures. Every number comes from /activity/stats. */
export function StatsLedger({ stats, fetchedAt }: { stats: SiteStats; fetchedAt: number }) {
  const rows: [string, string][] = [
    ["Packs opened", count(stats.packsOpened)],
    ["Chase pulls", count(stats.chaseCards)],
    ["Grails pulled", count(stats.grails)],
    ["Battles fought", count(stats.completedBattles)],
    ["Cards for sale", count(stats.activeListings)],
    ["Buybacks paid", usdCompact(stats.buybackPaidUsd)],
  ];
  return (
    <section aria-label="Live figures" className="band">
      <dl className="wrap grid grid-cols-2 gap-x-6 pt-2 sm:grid-cols-3 lg:grid-cols-6">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col-reverse py-4">
            <dt className="label mt-0.5">{k}</dt>
            <dd className="money text-2xl">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="wrap pb-4 text-xs text-muted">
        Live from YourGrails · loaded {new Date(fetchedAt).toISOString().slice(11, 16)} UTC
      </p>
    </section>
  );
}

export function OddsTable({ odds, caption }: { odds: OddsTier[]; caption?: string }) {
  if (!odds.length) return <p className="text-sm text-muted">Odds are not published for this pack right now.</p>;
  return (
    <table className="w-full text-sm">
      {caption && <caption className="label mb-3 text-left">{caption}</caption>}
      <thead>
        <tr className="text-left">
          <th scope="col" className="label pb-2 font-normal">Tier</th>
          <th scope="col" className="label pb-2 font-normal">Card value</th>
          <th scope="col" className="label pb-2 text-right font-normal">Chance</th>
        </tr>
      </thead>
      <tbody>
        {odds.map((o) => (
          <tr key={o.label} className="border-t border-line">
            <th scope="row" className="py-2.5 text-left font-medium">{o.label}</th>
            <td className="py-2.5 tabular-nums text-paper-dim">{o.displayRange}</td>
            <td className="money py-2.5 text-right">{pct(o.percentage)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PackCard({ pack, eager = false }: { pack: Pack; eager?: boolean }) {
  const avail = packAvailability(pack);
  return (
    <Link to="/packs/$packId" params={{ packId: pack.id }} className="panel group grid grid-cols-1 gap-5 p-5 transition-colors hover:bg-shelf sm:grid-cols-[160px_minmax(0,1fr)]">
      <div className="mx-auto w-40 sm:w-full">
        <PackArt tier={pack.tier} name={pack.name} eager={eager} />
      </div>
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold">{pack.name}</h3>
        <p className="label mt-0.5 first-letter:uppercase">{pack.tier} tier · {pack.cardsPerPack} graded card</p>
        <p className="mt-4 flex items-baseline gap-2">
          <span className="money text-2xl">{usd(pack.priceUsd)}</span>
          <span className="text-sm text-muted">USDC</span>
        </p>
        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1 text-sm">
          <dt className="text-muted">Expected pull value</dt>
          <dd className="tabular-nums">{usd(pack.evUsd)}</dd>
          {pack.buybackEnabled && pack.buybackPercentage !== null && (
            <>
              <dt className="text-muted">Instant buyback</dt>
              <dd className="tabular-nums">{pack.buybackPercentage}% of market value</dd>
            </>
          )}
        </dl>
        <p className={`mt-3 text-xs ${avail.ok ? "text-ok" : "text-warn"}`}>{avail.text}</p>
        <span className="mt-auto pt-4 text-sm font-medium text-paper-dim group-hover:text-paper">See odds and chase cards →</span>
      </div>
    </Link>
  );
}

export function PullsList({ pulls, now }: { pulls: Pull[]; now: number }) {
  if (!pulls.length) return <p className="text-sm text-muted">No pulls reported yet.</p>;
  return (
    <ol className="divide-y divide-line/70">
      {pulls.map((p) => (
        <li key={p.id} className="flex items-center gap-3 py-2.5">
          {p.image ? (
            <img src={p.image} alt="" width={40} height={64} loading="lazy" className="h-16 w-10 shrink-0 rounded-[3px] object-contain" />
          ) : (
            <span className="h-16 w-10 shrink-0 rounded-[3px] bg-shelf" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.title}</p>
            <p className="truncate text-xs text-muted">
              {p.packName}
              {p.pullTier ? ` · ${p.pullTier}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="money text-sm">{usd(p.valueUsd)}</p>
            <p className="text-xs text-muted">{ago(p.revealedAt, now)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SectionHead({ title, action }: { title: string; action?: { to: string; label: string } }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="display text-xl sm:text-2xl">{title}</h2>
      {action && (
        <Link to={action.to} className="shrink-0 text-sm font-medium text-paper-dim hover:text-paper">
          {action.label} →
        </Link>
      )}
    </div>
  );
}
