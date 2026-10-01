import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { CardGrid, CardTile } from "@/components/slab";
import { EmptyPanel, PartView } from "@/components/states";
import { getMarket, sanitizeListingQuery, type ListingQuery } from "@/lib/api";
import { count } from "@/lib/format";

export const Route = createFileRoute("/market/")({
  validateSearch: (s: Record<string, unknown>): ListingQuery =>
    sanitizeListingQuery({
      page: Number(s.page) || 1,
      query: s.query as string,
      gradingCompany: s.gradingCompany as string,
      grade: s.grade as string,
      set: s.set as string,
      priceMin: s.priceMin as string,
      priceMax: s.priceMax as string,
    }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getMarket({ data: deps }),
  head: () => ({ meta: [{ title: "Marketplace · YourGrails" }] }),
  component: Market,
});

function Market() {
  const { listings, facets } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/market/" });
  const graders = facets.ok ? facets.data.graders : [];
  const sets = facets.ok ? facets.data.sets : [];
  const grades = facets.ok
    ? [...new Map(facets.data.grades.map((g) => [String(Number(g.value)), g])).keys()].sort((a, b) => Number(b) - Number(a))
    : [];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => (String(f.get(k) ?? "").trim() || undefined);
    navigate({
      search: { page: 1, query: v("query"), gradingCompany: v("gradingCompany"), grade: v("grade"), set: v("set"), priceMin: v("priceMin"), priceMax: v("priceMax") },
    });
  };
  const filtered = Boolean(search.query || search.gradingCompany || search.grade || search.set || search.priceMin || search.priceMax);

  return (
    <>
      <PageHead kicker="Marketplace" title="Graded cards for sale">
        Every card listed here is a vaulted slab held in escrow until it sells. Prices are set by sellers in USDC.
      </PageHead>
      <div className="wrap grid gap-8 lg:grid-cols-[250px_1fr]">
        <form onSubmit={onSubmit} className="space-y-4 self-start lg:sticky lg:top-20" aria-label="Filter listings" key={JSON.stringify(search)}>
          <div>
            <label htmlFor="q" className="label mb-1.5 block">Search</label>
            <input id="q" name="query" className="field" defaultValue={search.query} placeholder="Card name" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div>
              <label htmlFor="grader" className="label mb-1.5 block">Grader</label>
              <select id="grader" name="gradingCompany" className="field" defaultValue={search.gradingCompany ?? ""}>
                <option value="">Any</option>
                {graders.map((g) => (
                  <option key={g.value} value={g.value}>{g.value} ({g.count})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="grade" className="label mb-1.5 block">Grade</label>
              <select id="grade" name="grade" className="field" defaultValue={search.grade ?? ""}>
                <option value="">Any</option>
                {grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="set" className="label mb-1.5 block">Set</label>
            <select id="set" name="set" className="field" defaultValue={search.set ?? ""}>
              <option value="">Any set</option>
              {sets.map((s) => (
                <option key={s.value} value={s.value}>{s.value} ({s.count})</option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="label mb-1.5">Price, USDC</legend>
            <div className="grid grid-cols-2 gap-3">
              <input name="priceMin" className="field" inputMode="decimal" aria-label="Minimum price" placeholder="Min" defaultValue={search.priceMin} />
              <input name="priceMax" className="field" inputMode="decimal" aria-label="Maximum price" placeholder="Max" defaultValue={search.priceMax} />
            </div>
          </fieldset>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Apply</button>
            {filtered && <Link to="/market" search={{ page: 1 }} className="btn-quiet">Clear</Link>}
          </div>
        </form>

        <section aria-label="Listings">
          <PartView part={listings} what="Listings">
            {({ listings: list, pagination }) => (
              <>
                <p className="mb-4 text-sm text-muted" aria-live="polite">
                  {pagination ? `${count(pagination.total)} ${pagination.total === 1 ? "listing" : "listings"}` : `${list.length} listings`}
                  {filtered ? " match your filters" : " active"}
                </p>
                {list.length ? (
                  <CardGrid>
                    {list.map((l) => (
                      <CardTile
                        key={l.id}
                        card={l.card}
                        href={`/market/${l.listingId ?? l.id}`}
                        price={l.priceUsd}
                        priceLabel="Price"
                        footer={
                          l.bidCount > 0 ? <p className="mt-1 text-[11px] text-muted">{l.bidCount} {l.bidCount === 1 ? "offer" : "offers"}</p> : null
                        }
                      />
                    ))}
                  </CardGrid>
                ) : (
                  <EmptyPanel>No listings match. Try fewer filters.</EmptyPanel>
                )}
                {pagination && pagination.totalPages > 1 && (
                  <nav aria-label="Pages" className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-4 text-sm">
                    {pagination.hasPrev ? (
                      <Link to="/market" search={{ ...search, page: pagination.page - 1 }} className="btn-quiet">← Previous</Link>
                    ) : <span />}
                    <span className="font-mono text-muted">Page {pagination.page} of {pagination.totalPages}</span>
                    {pagination.hasNext ? (
                      <Link to="/market" search={{ ...search, page: pagination.page + 1 }} className="btn-quiet">Next →</Link>
                    ) : <span />}
                  </nav>
                )}
              </>
            )}
          </PartView>
        </section>
      </div>
    </>
  );
}
