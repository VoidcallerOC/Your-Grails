import { createFileRoute, Link } from "@tanstack/react-router";
import { OddsTable, PullsList, SectionHead } from "@/components/blocks";
import { packAvailability } from "@/lib/packs";
import { PackStage } from "@/components/pack-art";
import { CardGrid, CardTile } from "@/components/slab";
import { BlockedAction, PartView } from "@/components/states";
import { getPack } from "@/lib/api";
import { dateShort, usd } from "@/lib/format";

export const Route = createFileRoute("/packs/$packId")({
  loader: ({ params }) => getPack({ data: { packId: params.packId } }),
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.pack.ok ? loaderData.pack.data.name : "Pack"} · YourGrails` }],
  }),
  component: PackPage,
});

function PackPage() {
  const { pack, pulls, fetchedAt } = Route.useLoaderData();
  return (
    <div className="wrap pt-8">
      <nav aria-label="Breadcrumb" className="label mb-6">
        <Link to="/packs" className="hover:text-paper">Packs</Link> / {pack.ok ? pack.data.name : "Pack"}
      </nav>
      <PartView part={pack} what="This pack" heading="Pack">
        {(p) => {
          const avail = packAvailability(p);
          return (
            <>
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
                <PackStage tier={p.tier} name={p.name} />
                <div>
                  <p className="label">{p.tier} tier · {p.category}</p>
                  <h1 className="display mt-2 text-5xl sm:text-6xl">{p.name}</h1>
                  <dl className="mt-6 grid max-w-md grid-cols-2 gap-y-3 border-y border-line py-4">
                    <dt className="text-muted">Price</dt>
                    <dd className="text-right font-mono text-lg">{usd(p.priceUsd)} USDC</dd>
                    <dt className="text-muted">Expected pull value</dt>
                    <dd className="text-right font-mono text-lg">{usd(p.evUsd)}</dd>
                    <dt className="text-muted">Cards in the pool</dt>
                    <dd className="text-right font-mono">{p.availableInventory ?? "—"}</dd>
                    {p.buybackEnabled && p.buybackPercentage !== null && (
                      <>
                        <dt className="text-muted">Instant buyback</dt>
                        <dd className="text-right font-mono">{p.buybackPercentage}% of market value</dd>
                      </>
                    )}
                  </dl>
                  <p className={`mt-3 text-sm ${avail.ok ? "text-ok" : "text-warn"}`}>{avail.ok ? "On sale now" : avail.text}</p>
                  <BlockedAction
                    className="mt-6 max-w-md"
                    label={`Buy and open · ${usd(p.priceUsd)}`}
                    does="In production this buys the pack in USDC on Avalanche (or from another chain through Circle CCTP), then a Chainlink VRF draw reveals your card."
                  />
                  <div className="mt-8 max-w-md">
                    <OddsTable odds={p.odds} caption={`Odds from the current pool${p.oddsCalculatedAt ? ` · ${dateShort(p.oddsCalculatedAt)}` : ""}`} />
                  </div>
                </div>
              </div>
              {p.chase.length > 0 && (
                <section className="mt-16">
                  <SectionHead kicker="In this pack" title="Chase cards" />
                  <CardGrid>
                    {p.chase.map((c) => (
                      <CardTile key={c.id} card={c} />
                    ))}
                  </CardGrid>
                </section>
              )}
            </>
          );
        }}
      </PartView>
      <section className="mt-16 max-w-2xl">
        <SectionHead kicker="Opened recently" title="Pulls from this pack" />
        <PartView part={pulls} what="Recent pulls">
          {(list) => <PullsList pulls={list} now={fetchedAt} />}
        </PartView>
      </section>
    </div>
  );
}
