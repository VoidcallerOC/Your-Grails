import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { CardTile } from "@/components/slab";
import { BlockedAction, EmptyPanel, PartView } from "@/components/states";
import { getTradeDiscovery } from "@/lib/api";
import { count } from "@/lib/format";
import { Avatar } from "@/components/person";
import { TradePair } from "@/components/experience";

export const Route = createFileRoute("/trading")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: Number(s.page) > 0 ? Math.floor(Number(s.page)) : 1,
    query: typeof s.query === "string" && s.query.trim() ? s.query.trim().slice(0, 80) : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getTradeDiscovery({ data: deps }),
  head: () => ({ meta: [{ title: "Trading · YourGrails" }] }),
  component: Trading,
});

function Trading() {
  const { discovery } = Route.useLoaderData();
  const search = Route.useSearch();
  return (
    <>
      <PageHead
        eyebrow="Collector to collector"
        title="Trade card for card"
        aside={<BlockedAction tone="primary" className="w-full max-w-sm" label="Make a trade offer" does="Offers one or more of your cards for a card another collector owns." />}
      >
        Find a card in someone's collection and offer one of yours for it. The owner accepts or declines. Cards move only if they accept.
      </PageHead>
      <div className="wrap">
        <form method="get" action="/trading" className="mb-8 flex max-w-xl gap-2" role="search">
          <label htmlFor="tq" className="sr-only">Search cards open to trade</label>
          <input id="tq" name="query" defaultValue={search.query} className="field" placeholder="Search cards open to trade" />
          <button className="btn-quiet" type="submit">Search</button>
        </form>
        <PartView part={discovery} what="Cards open to trade">
          {({ cards, pagination }) => (
            <>
              <p className="mb-6 text-sm text-paper-dim">{pagination ? `${count(pagination.total)} cards open to trade offers · market value shown on each card` : "Market value shown on each card"}</p>
              {cards.length ? (
                <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2">
                  {cards.map(({ card, owner }) => (
                    <TradePair
                      key={card.token?.tokenId ?? card.id}
                      owner={
                        owner?.username ? (
                          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                            <Avatar person={{ address: "", username: owner.username }} size={22} />
                            <span className="truncate">Owner <Link to="/u/$username" params={{ username: owner.username }} search={{ page: 1 }} className="font-semibold text-paper-dim hover:text-gold">{owner.username}</Link></span>
                          </p>
                        ) : null
                      }
                    >
                      <CardTile card={card} />
                    </TradePair>
                  ))}
                </div>
              ) : (
                <EmptyPanel>No cards match.</EmptyPanel>
              )}
              {pagination && pagination.totalPages > 1 && (
                <nav aria-label="Pages" className="mt-16 flex items-center justify-between text-sm">
                  {pagination.hasPrev ? <Link to="/trading" search={{ ...search, page: pagination.page - 1 }} className="btn-quiet">← Previous</Link> : <span />}
                  <span className="text-muted">Page {pagination.page} of {pagination.totalPages}</span>
                  {pagination.hasNext ? <Link to="/trading" search={{ ...search, page: pagination.page + 1 }} className="btn-quiet">Next →</Link> : <span />}
                </nav>
              )}
            </>
          )}
        </PartView>
      </div>
    </>
  );
}
