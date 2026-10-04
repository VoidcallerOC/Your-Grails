import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { PackCard, PackPedestal, PullTicker, SectionHead, StatsLedger } from "@/components/blocks";
import { CardTile, ShelfRow } from "@/components/slab";
import { ErrorPanel, PartView } from "@/components/states";
import { getHome } from "@/lib/api";
import { count, usd } from "@/lib/format";
import type { CardSummary, Pack } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: () => getHome(),
  component: Home,
});

/** The highest-value chase cards currently seeded across live packs: real slabs, real values. */
function topChase(packs: Pack[], n: number): (CardSummary & { packName: string })[] {
  return packs
    .flatMap((p) => p.chase.map((c) => ({ ...c, packName: p.name })))
    .filter((c) => c.images.slab || c.images.front)
    .sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0))
    .slice(0, n);
}

/** One slab in the window: the photo as supplied, in a plain catalogue frame. */
function CaseFrame({ card }: { card: CardSummary }) {
  const src = card.images.slab ?? card.images.front ?? card.images.thumb;
  return (
    <div className="aspect-[3/5] overflow-hidden rounded-[3px] border border-line bg-vault">
      {src ? (
        <img src={src} alt={`${card.title}${card.grader ? `, ${card.grader} ${card.grade ?? ""}` : ""}`} loading="eager" decoding="async" width={300} height={500} className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-full items-center justify-center px-3 text-center text-sm text-muted">Photo not provided</span>
      )}
    </div>
  );
}

function ShowWindow({ cards }: { cards: (CardSummary & { packName: string })[] }) {
  return (
    <figure className="relative">
      <div className="grid grid-cols-3 items-start gap-3 sm:gap-5">
        {cards.map((c) => {
          return (
            <Link key={c.id} to="/packs" className="group block min-w-0">
              <CaseFrame card={c} />
              <figcaption className="mt-4 text-center sm:text-left">
                <span className="num block text-lg leading-none text-paper sm:text-xl">{usd(c.valueUsd)}</span>
                <span className="mt-1.5 block truncate text-[12px] text-muted sm:text-[13px]">
                  {c.grade ? <span className="hidden text-paper-dim sm:inline">{c.grader ?? "Grade"} {c.grade} · </span> : null}
                  {c.title}
                </span>
              </figcaption>
            </Link>
          );
        })}
      </div>
      <p className="label mt-14 text-center sm:mt-16 lg:text-left">Top slabs in today's pools</p>
    </figure>
  );
}

const STEPS: [string, string][] = [
  ["Buy a pack", "Pay in USDC on Avalanche, or from another chain and we bridge it with Circle CCTP."],
  ["Open it", "A Chainlink VRF draw picks your card from the pack's published pool. The website can't choose it."],
  ["Own the slab", "The graded card stays insured in the vault. You hold it as a token you can list, trade, lend against or battle."],
  ["Sell back or keep", "Don't want it? Original buyers can sell it back for 90% of market value within five days."],
];

function Home() {
  const { stats, packs, pulls, listings, fetchedAt } = Route.useLoaderData();
  const chase = packs.ok ? topChase(packs.data, 3) : [];
  const firstPack = packs.ok ? packs.data[0] : undefined;
  const latestPull = pulls.ok ? pulls.data.find((p) => p.image) : undefined;

  return (
    <>
      {/* The window: what's in the vault tonight. */}
      <section className="wrap grid grid-cols-1 items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-10 lg:pb-24">
        <div className="relative z-10">
          {stats.ok && stats.data.packsOpened !== null && (
            <p className="eyebrow mb-5"><span className="live-dot mr-2 align-middle" aria-hidden="true" />{count(stats.data.packsOpened)} packs opened so far</p>
          )}
          <h1 className="shout text-[2.6rem] sm:text-6xl lg:text-[3.3rem] xl:text-[3.6rem]">
            See the whole pool
            <br />
            <span className="text-paper-dim">before you open.</span>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-paper-dim">
            Each pack is one draw from a published pool of PSA, BGS and CGC slabs held in the vault. What you open is yours:
            keep it, list it, borrow USDC against it, or put it up in a battle.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/packs" className="btn-primary min-h-12 px-7 text-base">
              See the pools <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/market" className="btn-quiet min-h-12 px-6 text-base">
              Browse slabs for sale
            </Link>
          </div>
        </div>
        {chase.length > 0 ? <ShowWindow cards={chase} /> : !packs.ok && <ErrorPanel what="Chase cards" error={packs.error} />}
      </section>

      <PartView part={pulls} what="Recent pulls">
        {(list) => list.length ? <PullTicker pulls={list.slice(0, 12)} now={fetchedAt} /> : <p className="wrap border-y border-line py-5 text-sm text-muted">No pulls reported yet.</p>}
      </PartView>

      <section className="wrap mt-24">
        <SectionHead eyebrow="Sealed product" title="Pick your pack" action={{ to: "/packs", label: "All packs" }} />
        <PartView part={packs} what="Packs">
          {(list) => list.length === 0 ? (
            <p className="text-muted">No packs are on sale right now.</p>
          ) : (
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-12">
              {list.map((p, i) => (
                <PackCard key={p.id} pack={p} eager={i === 0} compact live amp={0.5} minWidth={1024} phase={i * 1.9} />
              ))}
            </div>
          )}
        </PartView>
      </section>

      <div className="mt-24">
        <PartView part={stats} what="Live figures">
          {(s) => <StatsLedger stats={s} fetchedAt={fetchedAt} />}
        </PartView>
      </div>

      <section className="wrap mt-24">
        <SectionHead eyebrow="Collector to collector" title="On the market" action={{ to: "/market", label: "Enter the market" }} />
        <PartView part={listings} what="Listings">
          {({ listings: list }) => list.length === 0 ? (
            <p className="text-muted">No slabs are listed for sale right now.</p>
          ) : (
            <ShelfRow label="Slabs for sale">
              {list.map((l) => (
                <CardTile key={l.id} card={l.card} href={`/market/${l.listingId ?? l.id}`} price={l.priceUsd} priceLabel="Price" />
              ))}
            </ShelfRow>
          )}
        </PartView>
      </section>

      {/* Battles, sold like a fight card. */}
      <section className="mt-24 overflow-hidden border-y border-line bg-velvet">
        <div className="wrap grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <p className="eyebrow mb-3 !text-live"><span className="live-dot mr-2 align-middle" aria-hidden="true" />Battles</p>
            <h2 className="shout text-5xl sm:text-6xl">Open head to head.</h2>
            <p className="mt-5 max-w-md text-paper-dim">
              Two collectors open the same pack at the same time. Both keep the slab they open. The higher market value takes a bonus pack.
            </p>
            {stats.ok && (
              <p className="mt-6">
                <span className="num text-4xl text-paper">{count(stats.data.completedBattles)}</span>{" "}
                <span className="label">battles fought</span>
              </p>
            )}
            <Link to="/battles" className="btn-quiet mt-8">
              Enter battles <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {firstPack && (
            <div className="relative mx-auto grid w-full max-w-md grid-cols-[1fr_auto_1fr] items-center" aria-hidden="true">
              <div className="-rotate-6"><PackPedestal tier={firstPack.tier} name={firstPack.name} /></div>
              <span className="shout px-2 text-5xl text-live sm:text-6xl">VS</span>
              <div className="rotate-6"><PackPedestal tier={firstPack.tier} name={firstPack.name} /></div>
            </div>
          )}
        </div>
      </section>

      {/* A slab's journey: the real objects at each step, from sealed pack to your shelf. */}
      <section className="wrap mt-24">
        <SectionHead title="From sealed pack to your shelf" />
        <ol className="relative grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          <span className="absolute left-[12.5%] right-[12.5%] top-[86px] hidden h-px bg-gradient-to-r from-line-strong via-gold/50 to-line-strong lg:block" aria-hidden="true" />
          {STEPS.map(([t, d], i) => (
            <li key={t} className="rise relative">
              <div className="relative z-10 mx-auto flex h-[172px] items-end justify-center" aria-hidden="true">
                {i === 0 && firstPack && <div className="w-[104px]"><PackPedestal tier={firstPack.tier} name={firstPack.name} /></div>}
                {i === 1 && latestPull?.image && (
                  <div className="relative">
                    <img src={latestPull.image} alt="" loading="lazy" className="relative h-[150px] w-auto object-contain" />
                  </div>
                )}
                {i === 2 && latestPull?.image && (
                  <div className="relative border border-line-strong bg-velvet px-5 pb-4 pt-5">
                    <img src={latestPull.image} alt="" loading="lazy" className="h-[118px] w-auto object-contain opacity-90" />
                    <span className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center bg-gold text-label cut-sm"><Lock size={14} /></span>
                  </div>
                )}
                {i === 3 && <span className="shout pb-6 text-7xl text-paper">90%</span>}
              </div>
              <p className="mt-5 font-display text-sm font-semibold text-muted">Step {i + 1}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-dim">{d}</p>
            </li>
          ))}
        </ol>
        {latestPull && <p className="label mt-8">Shown with the latest real pull: {latestPull.title}{latestPull.packName ? `, from the ${latestPull.packName}` : ""}.</p>}
      </section>
    </>
  );
}
