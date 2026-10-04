import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { OddsTable, PullsList, SectionHead } from "@/components/blocks";
import { packAvailability } from "@/lib/packs";
import { PackStage } from "@/components/pack-art";
import { PoolView, RevealReplay } from "@/components/experience";
import { CardGrid, CardTile } from "@/components/slab";
import { BlockedAction, MobileBuyBar, PartView } from "@/components/states";
import { getPack } from "@/lib/api";
import { count, dateShort, usd } from "@/lib/format";

export const Route = createFileRoute("/packs/$packId")({
  loader: async ({ params }) => {
    const data = await getPack({ data: { packId: params.packId } });
    // Production answers 404 "Pack not found" for unknown ids (observed 2026-10-01).
    if (!data.pack.ok && data.pack.status === 404) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.pack.ok ? loaderData.pack.data.name : "Pack"} · YourGrails` }],
  }),
  component: PackPage,
});

function PackPage() {
  const { pack, pulls, fetchedAt } = Route.useLoaderData();
  return (
    <>
      <div className="wrap pt-6">
        <nav aria-label="Breadcrumb" className="label">
          <Link to="/packs" className="hover:text-paper">Packs</Link> / {pack.ok ? pack.data.name : "Pack"}
        </nav>
      </div>
      {!pack.ok && <div className="wrap mt-6"><PartView part={pack} what="This pack" heading="Pack">{() => null}</PartView></div>}
      {pack.ok && (() => {
          const p = pack.data;
          const avail = packAvailability(p);
          return (
            <>
              {/* The product on its plinth. */}
              <section className="relative overflow-hidden">
                <div className="wrap relative grid grid-cols-1 items-center gap-10 pb-16 pt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
                  <div className="mx-auto w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[440px]">
                    <PackStage tier={p.tier} name={p.name} />
                  </div>
                  <div>
                    <p className="eyebrow first-letter:uppercase">{p.tier} tier · {p.category}</p>
                    <h1 className="shout mt-2 text-5xl sm:text-6xl lg:text-7xl">{p.name}</h1>
                    <p className="mt-7">
                      <span className="money text-6xl leading-none">{usd(p.priceUsd)}</span> <span className="text-base text-muted">USDC</span>
                    </p>
                    <dl className="mt-7 grid max-w-lg grid-cols-3 gap-4 border-y border-line py-4">
                      <div>
                        <dt className="label">Expected pull value</dt>
                        <dd className="num mt-1 text-2xl text-paper">{usd(p.evUsd)}</dd>
                      </div>
                      <div>
                        <dt className="label">Cards in the pool</dt>
                        <dd className="num mt-1 text-2xl">{p.availableInventory !== null ? count(p.availableInventory) : "—"}</dd>
                      </div>
                      {p.buybackEnabled && p.buybackPercentage !== null && (
                        <div>
                          <dt className="label">Instant buyback</dt>
                          <dd className="num mt-1 text-2xl">{p.buybackPercentage}%<span className="block font-sans text-xs font-normal text-muted">of market value</span></dd>
                        </div>
                      )}
                    </dl>
                    <p className={`mt-4 flex items-center gap-2 text-sm ${avail.ok ? "text-ok" : "text-warn"}`}>
                      {avail.ok && <span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />}
                      {avail.ok ? "On sale now" : avail.text}
                    </p>
                    <BlockedAction
                      tone="primary"
                      className="mt-6 max-w-md"
                      label={`Buy and open · ${usd(p.priceUsd)}`}
                      does="In production this buys the pack in USDC on Avalanche (or from another chain through Circle CCTP), then a Chainlink VRF draw reveals your card."
                    />
                    {avail.ok && <MobileBuyBar price={usd(p.priceUsd)} label="Buy and open" />}
                  </div>
                </div>
              </section>

              {/* What's inside: the actual pool. A pack is one draw from these slabs. */}
              <section className="border-y border-line bg-velvet">
                <div className="wrap py-14">
                  <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
                    <div>
                      <h2 className="shout text-4xl">
                        {p.odds.reduce((n, o) => n + o.count, 0) > 0 ? <>One draw from these {count(p.odds.reduce((n, o) => n + o.count, 0))} slabs</> : "What's inside"}
                      </h2>
                      <p className="mt-4 max-w-sm text-paper-dim">
                        Every card in the pool sits in a value tier. Your chance of each tier is its share of the pool right now, and it
                        moves as cards are pulled and restocked.
                      </p>
                    </div>
                    <PoolView odds={p.odds} />
                  </div>
                  <div className="mt-12 lg:ml-[calc(4/11*100%+2.5rem)]">
                    <OddsTable odds={p.odds} caption={`Odds from the current pool${p.oddsCalculatedAt ? ` · ${dateShort(p.oddsCalculatedAt)}` : ""}`} />
                  </div>
                </div>
              </section>

              {/* The reveal, as an event: the latest real pull from this pack, replayed. */}
              {pulls.ok && pulls.data[0] && (
                <section className="wrap mt-20">
                  <RevealReplay pull={pulls.data[0]} tier={p.tier} now={fetchedAt} />
                </section>
              )}

              {p.chase.length > 0 && (
                <section className="wrap mt-20">
                  <SectionHead eyebrow="The ones to chase" title="Chase cards" note="Market value shown on each card." />
                  <CardGrid>
                    {p.chase.map((c) => (
                      <CardTile key={c.id} card={c} />
                    ))}
                  </CardGrid>
                </section>
              )}
            </>
          );
        })()}
      <section className="wrap mt-20">
        <SectionHead eyebrow="Fresh from this pack" title="Pulls from this pack" />
        <PartView part={pulls} what="Recent pulls">
          {(list) => <PullsList pulls={list} now={fetchedAt} />}
        </PartView>
      </section>
    </>
  );
}
