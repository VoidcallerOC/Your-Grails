import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { CardGrid, CardTile } from "@/components/slab";
import { BlockedAction, EmptyPanel, PartView } from "@/components/states";
import { getTradeDiscovery } from "@/lib/api";
import { count } from "@/lib/format";

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
      <PageHead title="Trade card for card">
        Find a card in someone's collection and offer one of yours for it. The owner accepts or declines. Cards move only if they accept.
      </PageHead>
      <div className="wrap">
        <BlockedAction className="mb-8 max-w-md" label="Make a trade offer" does="Offers one or more of your cards for a card another collector owns." />
        <form method="get" action="/trading" className="mb-6 flex max-w-md gap-2" role="search">
          <label htmlFor="tq" className="sr-only">Search cards open to trade</label>
          <input id="tq" name="query" defaultValue={search.query} className="field" placeholder="Search cards open to trade" />
          <button className="btn-quiet" type="submit">Search</button>
        </form>
        <PartView part={discovery} what="Cards open to trade">
          {({ cards, pagination }) => (
            <>
              <p className="mb-6 text-sm text-paper-dim">{pagination ? `${count(pagination.total)} cards open to trade offers · market value shown on each card` : "Market value shown on each card"}</p>
              {cards.length ? (
                <CardGrid>
                  {cards.map(({ card, owner }) => (
                    <CardTile
                      key={card.token?.tokenId ?? card.id}
                      card={card}
                      footer={
                        owner?.username ? (
                          <p className="mt-1 truncate text-xs text-muted">
                            Owner <Link to="/u/$username" params={{ username: owner.username }} search={{ page: 1 }} className="link">{owner.username}</Link>
                          </p>
                        ) : null
                      }
                    />
                  ))}
                </CardGrid>
              ) : (
                <EmptyPanel>No cards match.</EmptyPanel>
              )}
              {pagination && pagination.totalPages > 1 && (
                <nav aria-label="Pages" className="mt-12 flex items-center justify-between text-sm">
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
