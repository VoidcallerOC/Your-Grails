import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { GradeTag, Slab, Tilt } from "@/components/slab";
import { MarketDelta } from "@/components/experience";
import { BlockedAction, MobileBuyBar, PartView } from "@/components/states";
import { getListing } from "@/lib/api";
import { contractUrl, txUrl } from "@/lib/contracts";
import { cardLine, count, dateShort, shortAddress, usd } from "@/lib/format";
import type { Comps } from "@/lib/types";

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

/** Recent sales drawn as a range: low to high, the median, and where this asking price sits. All figures from production. */
function CompsRange({ comps, price }: { comps: Comps; price: number | null }) {
  const { minUsd: lo, maxUsd: hi, medianUsd: med } = comps;
  const canDraw = lo !== null && hi !== null && hi > lo;
  const frac = (v: number) => Math.min(100, Math.max(0, ((v - (lo as number)) / ((hi as number) - (lo as number))) * 100));
  const at = (v: number) => `${frac(v)}%`;
  // Keep a marker's label on screen near either end of the range.
  const anchor = (v: number) => (frac(v) > 82 ? "right-0" : frac(v) < 18 ? "left-0" : "left-1/2 -translate-x-1/2");
  return (
    <div>
      <p className="text-sm text-paper-dim">
        Median {usd(med)} across the {BASIS[comps.basis] ?? `${comps.count} sales`}, ranging {usd(lo)} to {usd(hi)}.
        {comps.fetchedAt && <> Data as of {dateShort(comps.fetchedAt)}.</>}
      </p>
      {canDraw && (
        <div className="mt-8 mb-2" aria-hidden="true">
          <div className="relative h-1.5 bg-gradient-to-r from-shelf via-line-strong to-shelf">
            {med !== null && (
              <span className="absolute -top-2 h-5 w-px bg-paper-dim" style={{ left: at(med) }}>
                <span className={`absolute -top-5 whitespace-nowrap font-display text-[11px] font-semibold text-paper-dim ${anchor(med)}`}>median</span>
              </span>
            )}
            {price !== null && (
              <>
                <span className="absolute -top-[5px] h-4 w-4 -translate-x-1/2 rotate-45 bg-gold" style={{ left: at(price) }} />
                <span className="absolute top-4 w-0" style={{ left: at(price) }}>
                  <span className={`absolute whitespace-nowrap font-display text-[11px] font-semibold text-gold ${anchor(price)}`}>this listing</span>
                </span>
              </>
            )}
          </div>
          <div className="mt-7 flex justify-between font-display text-[12px] text-muted">
            <span>{usd(lo)}</span>
            <span>{usd(hi)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ListingPage() {
  const { listing } = Route.useLoaderData();
  return (
    <div className="wrap pt-6">
      <nav aria-label="Breadcrumb" className="label mb-4">
        <Link to="/market" search={{ page: 1 }} className="hover:text-paper">Marketplace</Link> / {listing.ok ? listing.data.card.title : "Listing"}
      </nav>
      <PartView part={listing} what="This listing" heading="Listing">
        {(l) => {
          const c = l.card;
          const active = l.status === "active";
          return (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
              {/* The object. */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="mx-auto max-w-[340px] sm:max-w-[420px] lg:max-w-[500px]">
                  <Tilt max={6}>
                    <Slab card={c} eager sizes="(min-width: 1024px) 500px, 90vw" />
                  </Tilt>
                </div>
                {c.images.back && (
                  <p className="mt-4 text-center">
                    <a href={c.images.back} className="link text-sm text-paper-dim" target="_blank" rel="noopener noreferrer">
                      View the back of the slab
                    </a>
                  </p>
                )}
              </div>

              {/* The placard. */}
              <div className="lg:pt-6">
                <div className="flex items-center gap-3">
                  <GradeTag card={c} className="scale-125 origin-left" />
                  {c.rarity && <span className="ml-3 text-sm text-muted">{c.rarity}</span>}
                </div>
                <h1 className="shout mt-5 text-5xl sm:text-6xl">{c.title}</h1>
                <p className="mt-3 text-paper-dim">{cardLine(c)}</p>

                <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4">
                  <div>
                    <p className="label">Price</p>
                    <p className="mt-1 leading-none"><span className="money text-6xl">{usd(l.priceUsd)}</span> <span className="text-sm text-muted">USDC</span></p>
                  </div>
                  <div>
                    <p className="label">Market value</p>
                    <p className="num mt-1 text-2xl text-paper-dim">{usd(c.valueUsd)}</p>
                  </div>
                  <div>
                    <p className="label">Offers</p>
                    <p className="num mt-1 text-2xl text-paper-dim">{l.bidCount}</p>
                  </div>
                </div>
                <div className="mt-2 text-base"><MarketDelta price={l.priceUsd} value={c.valueUsd} /></div>
                {!active && <p className="mt-4 text-sm text-warn">This listing is {l.status}. It can't be bought.</p>}

                <div className="mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                  <BlockedAction tone="primary" label="Buy now" does="Buys the card from escrow in USDC. The token moves to your wallet when the sale settles." />
                  <BlockedAction label="Make an offer" does="Uses your offer balance. Deposit USDC first; the seller decides whether to accept." />
                </div>

                <section className="mt-12 max-w-xl border-t border-line pt-6">
                  <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <ShieldCheck size={19} className="text-paper-dim" aria-hidden="true" /> The slab
                  </h2>
                  <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-8 gap-y-2.5 text-sm">
                    <dt className="text-muted">Grader</dt><dd>{c.grader ?? "—"} {c.grade}</dd>
                    <dt className="text-muted">Cert number</dt>
                    <dd>
                      <span className="font-mono text-[13px]">{c.cert ?? "—"}</span>
                      {c.certUrl && <> · <a className="link" href={c.certUrl} target="_blank" rel="noopener noreferrer">Verify with PSA</a></>}
                    </dd>
                    {c.popAtGrade !== undefined && (<><dt className="text-muted">Population at this grade</dt><dd className="tabular-nums">{count(c.popAtGrade)}{c.popHigher !== undefined ? ` · ${count(c.popHigher)} higher` : ""}</dd></>)}
                  </dl>
                </section>

                {c.comps && c.comps.count > 0 && (
                  <section className="mt-10 max-w-xl border-t border-line pt-6">
                    <h2 className="mb-2 font-display text-lg font-semibold">Recent sales at this grade</h2>
                    <CompsRange comps={c.comps} price={l.priceUsd} />
                  </section>
                )}

                <details className="group mt-10 max-w-xl border-y border-line">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    Ownership record
                    <ChevronDown size={18} className="text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-8 gap-y-2.5 pb-5 text-sm">
                    {c.token && (
                      <>
                        <dt className="text-muted">Token</dt>
                        <dd>
                          <span className="break-all font-mono text-[13px]">#{c.token.tokenId}</span> · <a className="link" href={contractUrl(c.token.contract)} target="_blank" rel="noopener noreferrer">CardNFT</a>
                        </dd>
                      </>
                    )}
                    <dt className="text-muted">Seller</dt>
                    <dd><Link to="/u/address/$address" params={{ address: l.seller.toLowerCase() }} search={{ page: 1 }} className="link font-mono text-[13px]">{shortAddress(l.seller)}</Link></dd>
                    {l.createdAt && (<><dt className="text-muted">Listed</dt><dd>{dateShort(l.createdAt)}{l.txHash && <> · <a className="link" href={txUrl(l.txHash)} target="_blank" rel="noopener noreferrer">transaction</a></>}</dd></>)}
                  </dl>
                </details>
              </div>
              {active && <MobileBuyBar price={usd(l.priceUsd)} label="Buy now" />}
            </div>
          );
        }}
      </PartView>
    </div>
  );
}
