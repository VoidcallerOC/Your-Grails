import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GradeMark, SlabPhoto } from "@/components/slab";
import { BlockedAction, PartView } from "@/components/states";
import { getListing } from "@/lib/api";
import { contractUrl, txUrl } from "@/lib/contracts";
import { cardLine, count, dateShort, shortAddress, usd } from "@/lib/format";

export const Route = createFileRoute("/market/$listingId")({
  loader: async ({ params }) => {
    if (!/^[0-9a-fA-F]{24}$|^\d{1,9}$/.test(params.listingId)) throw notFound();
    const data = await getListing({ data: { listingId: params.listingId } });
    // Production answers 404 "Listing not found" for unknown ids (observed 2026-10-01).
    if (!data.listing.ok && data.listing.status === 404) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.listing.ok ? loaderData.listing.data.card.title : "Listing"} · YourGrails` }],
  }),
  component: ListingPage,
});

const BASIS: Record<string, string> = {
  recent10: "last 10 sales",
  recent25: "last 25 sales",
  recent50: "last 50 sales",
  recent100: "last 100 sales",
  buyNowBestOffer50: "last 50 buy-now and best-offer sales",
  buyNowBestOffer100: "last 100 buy-now and best-offer sales",
};

function ListingPage() {
  const { listing } = Route.useLoaderData();
  return (
    <div className="wrap pt-8">
      <nav aria-label="Breadcrumb" className="label mb-6">
        <Link to="/market" search={{ page: 1 }} className="hover:text-paper">Marketplace</Link> / {listing.ok ? listing.data.card.title : "Listing"}
      </nav>
      <PartView part={listing} what="This listing" heading="Listing">
        {(l) => {
          const c = l.card;
          const active = l.status === "active";
          return (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
              <div>
                <SlabPhoto card={c} eager sizes="(min-width: 1024px) 440px, 90vw" />
                {c.images.back && (
                  <a href={c.images.back} className="link mt-3 inline-block text-sm" target="_blank" rel="noopener noreferrer">
                    View the back of the slab
                  </a>
                )}
              </div>
              <div>
                <p className="label"><GradeMark card={c} />{c.rarity ? ` · ${c.rarity}` : ""}</p>
                <h1 className="display mt-2 text-5xl">{c.title}</h1>
                <p className="mt-2 text-paper-dim">{cardLine(c)}</p>

                <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-3 border-y border-line py-4">
                  <div>
                    <p className="label">Price</p>
                    <p className="font-mono text-3xl">{usd(l.priceUsd)} <span className="text-sm text-muted">USDC</span></p>
                  </div>
                  <div>
                    <p className="label">Market value</p>
                    <p className="font-mono text-xl text-paper-dim">{usd(c.valueUsd)}</p>
                  </div>
                  <div>
                    <p className="label">Offers</p>
                    <p className="font-mono text-xl text-paper-dim">{l.bidCount}</p>
                  </div>
                </div>
                {!active && <p className="mt-3 text-sm text-warn">This listing is {l.status}. It can't be bought.</p>}

                <div className="mt-6 grid grid-cols-1 max-w-xl gap-3 sm:grid-cols-2">
                  <BlockedAction label="Buy now" does="Buys the card from escrow in USDC. The token moves to your wallet when the sale settles." />
                  <BlockedAction label="Make an offer" does="Uses your offer balance. Deposit USDC first; the seller decides whether to accept." />
                </div>

                <section className="mt-10 max-w-xl">
                  <h2 className="label mb-3">The slab</h2>
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
                    <dt className="text-muted">Grader</dt><dd>{c.grader ?? "—"} {c.grade}</dd>
                    <dt className="text-muted">Cert number</dt>
                    <dd className="font-mono">
                      {c.cert ?? "—"}
                      {c.certUrl && <> · <a className="link" href={c.certUrl} target="_blank" rel="noopener noreferrer">Verify with PSA</a></>}
                    </dd>
                    {c.popAtGrade !== undefined && (<><dt className="text-muted">Population at this grade</dt><dd className="font-mono">{count(c.popAtGrade)}{c.popHigher !== undefined ? ` · ${count(c.popHigher)} higher` : ""}</dd></>)}
                    {c.token && (
                      <>
                        <dt className="text-muted">Token</dt>
                        <dd className="font-mono break-all">
                          #{c.token.tokenId} · <a className="link" href={contractUrl(c.token.contract)} target="_blank" rel="noopener noreferrer">CardNFT</a>
                        </dd>
                      </>
                    )}
                    <dt className="text-muted">Seller</dt>
                    <dd><Link to="/u/address/$address" params={{ address: l.seller.toLowerCase() }} search={{ page: 1 }} className="link font-mono">{shortAddress(l.seller)}</Link></dd>
                    {l.createdAt && (<><dt className="text-muted">Listed</dt><dd>{dateShort(l.createdAt)}{l.txHash && <> · <a className="link" href={txUrl(l.txHash)} target="_blank" rel="noopener noreferrer">transaction</a></>}</dd></>)}
                  </dl>
                </section>

                {c.comps && c.comps.count > 0 && (
                  <section className="mt-10 max-w-xl">
                    <h2 className="label mb-3">Recent sales at this grade</h2>
                    <p className="text-sm text-paper-dim">
                      Median {usd(c.comps.medianUsd)} across the {BASIS[c.comps.basis] ?? `${c.comps.count} sales`}, ranging {usd(c.comps.minUsd)} to {usd(c.comps.maxUsd)}.
                      {c.comps.fetchedAt && <> Data as of {dateShort(c.comps.fetchedAt)}.</>}
                    </p>
                  </section>
                )}
              </div>
            </div>
          );
        }}
      </PartView>
    </div>
  );
}
