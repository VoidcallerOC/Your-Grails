import { createFileRoute, Link } from "@tanstack/react-router";
import { PackCard, PullsList, SectionHead, StatsLedger } from "@/components/blocks";
import { CardGrid, CardTile, SlabPhoto } from "@/components/slab";
import { ErrorPanel, PartView } from "@/components/states";
import { getHome } from "@/lib/api";
import { usd } from "@/lib/format";
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
      <section className="wrap grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="label mb-4">PSA · BGS · CGC graded · vaulted · yours</p>
          <h1 className="display text-6xl sm:text-7xl">
            Real graded cards,
            <br />
            sealed in packs.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-paper-dim">
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
              {chase.map((c, i) => (
                <Link key={c.id} to="/packs" className={i === 1 ? "-translate-y-4" : ""}>
                  <SlabPhoto card={c} eager sizes="(min-width: 1024px) 200px, 30vw" />
                  <p className="mt-2 truncate text-xs text-paper-dim">{c.title}</p>
                  <p className="font-mono text-xs text-muted">
                    {c.grader} {c.grade} · {usd(c.valueUsd)}
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

      <section className="wrap mt-16 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <SectionHead kicker="Packs" title="Pick a pack" action={{ to: "/packs", label: "All packs" }} />
          <PartView part={packs} what="Packs">
            {(list) => (
              <div className="grid gap-4">
                {list.map((p, i) => (
                  <PackCard key={p.id} pack={p} eager={i === 0} />
                ))}
              </div>
            )}
          </PartView>
        </div>
        <div>
          <SectionHead kicker="Just opened" title="Recent pulls" />
          <PartView part={pulls} what="Recent pulls">
            {(list) => <PullsList pulls={list.slice(0, 8)} now={fetchedAt} />}
          </PartView>
        </div>
      </section>

      <section className="wrap mt-16">
        <SectionHead kicker="Marketplace" title="For sale now" action={{ to: "/market", label: "See every listing" }} />
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

      <section className="wrap mt-20">
        <SectionHead kicker="How it works" title="From sealed pack to your shelf" />
        <ol className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Buy a pack", "Pay in USDC on Avalanche, or from another chain and we bridge it with Circle CCTP."],
            ["Open it", "A Chainlink VRF draw picks your card from the pack's published pool. The website can't choose it."],
            ["Own the slab", "The graded card stays insured in the vault. You hold it as a token you can list, trade, lend against or battle."],
            ["Sell back or keep", "Don't want it? Original buyers can sell it back for 90% of market value within five days."],
          ].map(([t, d], i) => (
            <li key={t} className="border-b border-line py-6 pr-6 lg:border-b-0 lg:[&:not(:last-child)]:border-r lg:[&:not(:first-child)]:pl-6">
              <p className="font-mono text-xs text-brass">0{i + 1}</p>
              <h3 className="mt-2 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-paper-dim">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
