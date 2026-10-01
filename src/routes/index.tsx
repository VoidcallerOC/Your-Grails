import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { tierColor } from "@/lib/packs";
import { PackCard, PackPedestal, PullTicker, SectionHead, StatsLedger } from "@/components/blocks";
import { CardTile, ShelfRow, Tilt } from "@/components/slab";
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
/**
 * One slab in the window, as the object it is: the real photo is the front face of a clear acrylic block (see .slab3d).
 * The photo is shown as supplied; the side slabs turn in toward the centre like a dealer's display.
 */
function CaseFrame({ card, yaw }: { card: CardSummary; yaw: number }) {
  const src = card.images.slab ?? card.images.front ?? card.images.thumb;
  return (
    <div className="relative [perspective:1100px]">
      <div className="slab3d-shadow" aria-hidden="true" />
      <div className="slab3d" style={{ "--yaw": `${yaw}deg` } as React.CSSProperties}>
        <div className="slab3d-back" aria-hidden="true" />
        <span className="slab3d-edge l" aria-hidden="true" />
        <span className="slab3d-edge r" aria-hidden="true" />
        <span className="slab3d-edge t" aria-hidden="true" />
        <span className="slab3d-edge b" aria-hidden="true" />
        <div className="slab3d-face">
          {src ? (
            <img src={src} alt={`${card.title}${card.grader ? `, ${card.grader} ${card.grade ?? ""}` : ""}`} loading="eager" decoding="async" width={300} height={500} />
          ) : (
            <span className="flex h-full items-center justify-center bg-velvet px-3 text-center text-sm text-muted">Photo not provided</span>
          )}
          <span className="slab3d-glare" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

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
                <CaseFrame card={c} yaw={hero ? 0 : i === 0 ? 16 : -16} />
              </Tilt>
              <figcaption className="mt-4 text-center sm:text-left">
                <span className={`num block leading-none ${hero ? "text-2xl text-gold sm:text-3xl" : "text-lg text-paper sm:text-xl"}`}>{usd(c.valueUsd)}</span>
                <span className="mt-1.5 block truncate text-[12px] text-muted sm:text-[13px]">
                  {c.grade ? <span className="hidden text-paper-dim sm:inline">{c.grader ?? "Grade"} {c.grade} · </span> : null}
                  {c.title}
                </span>
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
  const latestPull = pulls.ok ? pulls.data.find((p) => p.image) : undefined;

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
            // Desktop: the packs float, at half the strength of the packs page, so they sit quietly beside the copy.
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
                    <span className="absolute inset-[-30%] rounded-full" style={{ background: `radial-gradient(closest-side, ${tierColor(latestPull.pullTier)}55, transparent)` }} />
                    <img src={latestPull.image} alt="" loading="lazy" className="relative h-[150px] w-auto object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.6)]" />
                  </div>
                )}
                {i === 2 && latestPull?.image && (
                  <div className="relative border border-line-strong bg-velvet px-5 pb-4 pt-5">
                    <img src={latestPull.image} alt="" loading="lazy" className="h-[118px] w-auto object-contain opacity-90" />
                    <span className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center bg-gold text-ink cut-sm"><Lock size={14} /></span>
                  </div>
                )}
                {i === 3 && <span className="shout pb-6 text-7xl text-gold">90%</span>}
              </div>
              <p className="mt-5 font-display text-sm font-semibold text-gold">Step {i + 1}</p>
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
