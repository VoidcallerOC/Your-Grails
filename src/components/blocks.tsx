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
    <section aria-label="Live figures" className="border-y border-line">
      <dl className="wrap grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {rows.map(([k, v]) => (
          <div key={k} className="border-line py-4 pr-4 [&:not(:last-child)]:border-r max-sm:[&:nth-child(2n)]:border-r-0">
            <dt className="label">{k}</dt>
            <dd className="mt-1 font-mono text-xl text-paper">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="wrap pb-3 text-[11px] text-muted">
        Live from YourGrails · loaded {new Date(fetchedAt).toISOString().slice(11, 16)} UTC
      </p>
    </section>
  );
}

export function OddsTable({ odds, caption }: { odds: OddsTier[]; caption?: string }) {
  if (!odds.length) return <p className="text-sm text-muted">Odds are not published for this pack right now.</p>;
  return (
    <table className="w-full text-sm">
      {caption && <caption className="label mb-2 text-left">{caption}</caption>}
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
            <th scope="row" className="py-2 text-left font-semibold">{o.label}</th>
            <td className="py-2 font-mono text-paper-dim">{o.displayRange}</td>
            <td className="py-2 text-right font-mono">{pct(o.percentage)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PackCard({ pack, eager = false }: { pack: Pack; eager?: boolean }) {
  const avail = packAvailability(pack);
  return (
    <Link to="/packs/$packId" params={{ packId: pack.id }} className="panel group grid gap-4 p-4 transition-colors hover:border-line-strong sm:grid-cols-[180px_1fr]">
      <div className="mx-auto w-40 sm:w-full">
        <PackArt tier={pack.tier} name={pack.name} eager={eager} />
      </div>
      <div className="flex flex-col">
        <p className="label">{pack.tier} tier · {pack.cardsPerPack} graded card</p>
        <h3 className="display mt-1 text-3xl">{pack.name}</h3>
        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted">Price</dt>
          <dd className="text-right font-mono">{usd(pack.priceUsd)} USDC</dd>
          <dt className="text-muted">Expected pull value</dt>
          <dd className="text-right font-mono">{usd(pack.evUsd)}</dd>
          {pack.buybackEnabled && pack.buybackPercentage !== null && (
            <>
              <dt className="text-muted">Instant buyback</dt>
              <dd className="text-right font-mono">{pack.buybackPercentage}% for 5 days</dd>
            </>
          )}
        </dl>
        <p className={`mt-4 text-xs ${avail.ok ? "text-ok" : "text-warn"}`}>{avail.text}</p>
        <span className="mt-auto pt-4 text-sm font-semibold text-brass group-hover:underline">See odds and chase cards →</span>
      </div>
    </Link>
  );
}

export function PullsList({ pulls, now }: { pulls: Pull[]; now: number }) {
  if (!pulls.length) return <p className="text-sm text-muted">No pulls reported yet.</p>;
  return (
    <ol className="divide-y divide-line border-y border-line">
      {pulls.map((p) => (
        <li key={p.id} className="flex items-center gap-3 py-2.5">
          {p.image ? (
            <img src={p.image} alt="" width={36} height={58} loading="lazy" className="h-[58px] w-9 shrink-0 rounded-[2px] object-cover" />
          ) : (
            <span className="h-[58px] w-9 shrink-0 rounded-[2px] border border-line" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{p.title}</p>
            <p className="truncate text-xs text-muted">
              {p.packName}
              {p.pullTier ? ` · ${p.pullTier}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm">{usd(p.valueUsd)}</p>
            <p className="text-[11px] text-muted">{ago(p.revealedAt, now)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SectionHead({ title, kicker, action }: { title: string; kicker?: string; action?: { to: string; label: string } }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {kicker && <p className="label mb-2">{kicker}</p>}
        <h2 className="display text-3xl sm:text-4xl">{title}</h2>
      </div>
      {action && (
        <Link to={action.to} className="shrink-0 text-sm font-semibold text-brass hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  );
}
