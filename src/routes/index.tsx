import { createFileRoute, Link } from "@tanstack/react-router";
import { PackCard, PullsList, SectionHead, StatsLedger } from "@/components/blocks";
import { CardGrid, CardTile, SlabPhoto } from "@/components/slab";
import { ErrorPanel, PartView } from "@/components/states";
import { getHome } from "@/lib/api";
import { gradeLabel, usd } from "@/lib/format";
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

function Home() {
  const { stats, packs, pulls, listings, fetchedAt } = Route.useLoaderData();
  const chase = packs.ok ? topChase(packs.data, 3) : [];

  return (
    <>
      <section className="wrap grid grid-cols-1 items-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <h1 className="display text-4xl sm:text-5xl">
            Real graded cards,
            <br />
            sealed in packs.
          </h1>
          <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-paper-dim">
            Every pack holds one slab from the vault. Open it, keep it, list it, battle with it, or sell it back for 90% of
            market value within five days.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/packs" className="btn-primary">
              Open a pack
            </Link>
            <Link to="/market" className="btn-quiet">
              Browse the market
            </Link>
          </div>
        </div>
        {chase.length > 0 ? (
          <figure>
            <div className="grid grid-cols-3 gap-3">
              {chase.map((c) => (
                <Link key={c.id} to="/packs" className="group">
                  <div className="transition-transform duration-200 group-hover:-translate-y-1">
                    <SlabPhoto card={c} eager sizes="(min-width: 1024px) 200px, 30vw" />
                  </div>
                  <p className="mt-2.5 truncate text-sm font-medium text-paper">{c.title}</p>
                  <p className="text-[13px] text-paper-dim">
                    {gradeLabel(c)} · <span className="money">{usd(c.valueUsd)}</span>
                  </p>
                </Link>
              ))}
            </div>
            <figcaption className="label mt-4">Chase cards in today's packs</figcaption>
          </figure>
        ) : (
          !packs.ok && <ErrorPanel what="Chase cards" error={packs.error} />
        )}
      </section>

      <PartView part={stats} what="Live figures">
        {(s) => <StatsLedger stats={s} fetchedAt={fetchedAt} />}
      </PartView>

      <section className="wrap mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <SectionHead title="Pick a pack" action={{ to: "/packs", label: "All packs" }} />
          <PartView part={packs} what="Packs">
            {(list) => (
              <div className="grid grid-cols-1 gap-4">
                {list.map((p, i) => (
                  <PackCard key={p.id} pack={p} eager={i === 0} />
                ))}
              </div>
            )}
          </PartView>
        </div>
        <div>
          <SectionHead title="Recent pulls" />
          <PartView part={pulls} what="Recent pulls">
            {(list) => <PullsList pulls={list.slice(0, 8)} now={fetchedAt} />}
          </PartView>
        </div>
      </section>

      <section className="wrap mt-20">
        <SectionHead title="For sale now" action={{ to: "/market", label: "See every listing" }} />
        <PartView part={listings} what="Listings">
          {({ listings: list }) => (
            <CardGrid>
              {list.map((l) => (
                <CardTile key={l.id} card={l.card} href={`/market/${l.listingId ?? l.id}`} price={l.priceUsd} priceLabel="Price" />
              ))}
            </CardGrid>
          )}
        </PartView>
      </section>

      <section className="band mb-[-6rem] mt-24 py-14">
        <div className="wrap">
        <SectionHead title="From sealed pack to your shelf" />
        <ol className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Buy a pack", "Pay in USDC on Avalanche, or from another chain and we bridge it with Circle CCTP."],
            ["Open it", "A Chainlink VRF draw picks your card from the pack's published pool. The website can't choose it."],
            ["Own the slab", "The graded card stays insured in the vault. You hold it as a token you can list, trade, lend against or battle."],
            ["Sell back or keep", "Don't want it? Original buyers can sell it back for 90% of market value within five days."],
          ].map(([t, d], i) => (
            <li key={t}>
              <h3 className="text-base font-semibold">
                <span className="mr-2 text-muted tabular-nums">{i + 1}.</span>
                {t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-dim">{d}</p>
            </li>
          ))}
        </ol>
        </div>
      </section>
    </>
  );
}
