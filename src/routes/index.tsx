import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PackCard, PackPedestal, PullTicker, SectionHead, StatsLedger } from "@/components/blocks";
import { CardTile, GradeTag, ShelfRow, Slab, Tilt } from "@/components/slab";
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

/** Three slabs in the window: the most valuable front and centre, the others set back in the light. */
function ShowWindow({ cards }: { cards: (CardSummary & { packName: string })[] }) {
  const order = cards.length === 3 ? [cards[1], cards[0], cards[2]] : cards;
  return (
    <figure className="relative">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] items-end gap-2 sm:gap-5">
        {order.map((c, i) => {
          const hero = cards.length === 3 ? i === 1 : i === 0;
          return (
            <Link key={c.id} to="/packs" className={`group block min-w-0 ${hero ? "z-10" : "translate-y-6 opacity-90 sm:translate-y-10"}`}>
              <Tilt max={hero ? 9 : 6}>
                <div className="relative">
                  <Slab card={c} eager sizes="(min-width: 1024px) 260px, 34vw" />
                  <GradeTag card={c} className="absolute bottom-3 left-0 z-10 hidden sm:inline-flex" />
                </div>
              </Tilt>
              <figcaption className="mt-3 text-center sm:text-left">
                <span className={`num block leading-none ${hero ? "text-2xl text-gold sm:text-3xl" : "text-lg text-paper sm:text-xl"}`}>{usd(c.valueUsd)}</span>
                <span className="mt-1 block truncate text-[12px] text-muted sm:text-[13px]">{c.title}</span>
              </figcaption>
            </Link>
          );
        })}
      </div>
      <p className="label mt-14 text-center sm:mt-16 lg:text-left">Chase cards in today's packs</p>
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

  return (
    <>
      {/* The window: what's in the vault tonight. */}
      <section className="wrap grid grid-cols-1 items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-10 lg:pb-24">
        <div className="relative z-10">
          {stats.ok && stats.data.packsOpened !== null && (
            <p className="eyebrow mb-5"><span className="live-dot mr-2 align-middle" aria-hidden="true" />{count(stats.data.packsOpened)} packs ripped so far</p>
          )}
          <h1 className="shout text-[3rem] sm:text-7xl lg:text-[4.6rem] xl:text-[5.1rem]">
            Real graded cards,
            <br />
            <span className="text-gold">sealed in packs.</span>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-paper-dim">
            Every pack holds one slab from the vault. Open it, keep it, list it, battle with it, or sell it back for 90% of
            market value within five days.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/packs" className="btn-primary min-h-12 px-7 text-base">
              Open a pack <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/market" className="btn-quiet min-h-12 px-6 text-base">
              Browse the market
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
                <PackCard key={p.id} pack={p} eager={i === 0} compact />
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
              Two collectors rip the same pack at the same time. Both keep what they pull. The bigger pull takes a bonus pack.
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

      <section className="wrap mt-24">
        <SectionHead title="From sealed pack to your shelf" />
        <ol className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="rise border-t border-line pt-5">
              <span className="shout text-5xl text-line-strong">{i + 1}</span>
              <h3 className="mt-3 font-display text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-dim">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
