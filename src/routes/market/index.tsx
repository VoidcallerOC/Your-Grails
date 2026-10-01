import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { PageHead } from "@/components/chrome";
import { DealerCase, GradeCompartments } from "@/components/case";
import { EmptyPanel, PartView } from "@/components/states";
import { getMarket, sanitizeListingQuery, type ListingQuery } from "@/lib/api";
import { count } from "@/lib/format";

// A hand-typed or shared URL like ?grade=10 or ?query=151 arrives as a number; keep it as the text the filter expects.
const text = (v: unknown) => (typeof v === "number" ? String(v) : (v as string));

export const Route = createFileRoute("/market/")({
  validateSearch: (s: Record<string, unknown>): ListingQuery =>
    sanitizeListingQuery({
      page: Number(s.page) || 1,
      query: text(s.query),
      gradingCompany: text(s.gradingCompany),
      grade: text(s.grade),
      set: text(s.set),
      priceMin: text(s.priceMin),
      priceMax: text(s.priceMax),
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
  const grades = facets.ok ? facets.data.grades : [];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => (String(f.get(k) ?? "").trim() || undefined);
    navigate({
      search: { page: 1, query: v("query"), gradingCompany: v("gradingCompany"), grade: v("grade"), set: v("set"), priceMin: v("priceMin"), priceMax: v("priceMax") },
    });
  };
  const filtered = Boolean(search.query || search.gradingCompany || search.grade || search.set || search.priceMin || search.priceMax);
  // Small screens: filters fold behind a toggle so the cards come first. Open by default when a filter is set.
  const [showFilters, setShowFilters] = useState(Boolean(search.gradingCompany || search.set || search.priceMin || search.priceMax));

  return (
    <>
      <PageHead
        eyebrow="Collector to collector"
        title="Graded cards for sale"
      >
        Every card listed here is a vaulted slab held in escrow until it sells. Prices are set by sellers in USDC.
      </PageHead>
      <div className="sticky top-14 z-30 border-y border-line/70 bg-ink/90 backdrop-blur-md lg:top-16">
      <div className="wrap py-3">
        <form onSubmit={onSubmit} aria-label="Filter listings" key={JSON.stringify(search)}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,4.2fr)]">
            <div className="relative">
              <label htmlFor="q" className="sr-only">Search by card name</label>
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted" />
              <input id="q" name="query" type="search" className="field pl-9" defaultValue={search.query} placeholder="Search cards" />
            </div>
            <button
              type="button"
              className="btn-quiet lg:hidden"
              aria-expanded={showFilters}
              aria-controls="market-filters"
              onClick={() => setShowFilters((o) => !o)}
            >
              <SlidersHorizontal size={16} aria-hidden="true" /> Filters
            </button>
            {/* The grade is chosen from the case's compartments below; the form carries it so other filters keep it. */}
            <input type="hidden" name="grade" value={search.grade ?? ""} />
            <div id="market-filters" className={`${showFilters ? "grid" : "hidden"} col-span-2 grid-cols-2 gap-2 lg:col-span-1 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_auto]`}>
              <div className="col-span-2 lg:col-span-1">
                <label htmlFor="grader" className="sr-only">Grader</label>
                <select id="grader" name="gradingCompany" className="field" defaultValue={search.gradingCompany ?? ""}>
                  <option value="">Any grader</option>
                  {graders.map((g) => (
                    <option key={g.value} value={g.value}>{g.value} ({g.count})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 lg:col-span-1">
                <label htmlFor="set" className="sr-only">Set</label>
                <select id="set" name="set" className="field" defaultValue={search.set ?? ""}>
                  <option value="">Any set</option>
                  {sets.map((s) => (
                    <option key={s.value} value={s.value}>{s.value} ({s.count})</option>
                  ))}
                </select>
              </div>
              <fieldset className="col-span-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 lg:col-span-1">
                <legend className="sr-only">Price in USDC</legend>
                <input name="priceMin" className="field" inputMode="decimal" aria-label="Minimum price, USDC" placeholder="Min $" defaultValue={search.priceMin} />
                <span className="text-muted" aria-hidden="true">–</span>
                <input name="priceMax" className="field" inputMode="decimal" aria-label="Maximum price, USDC" placeholder="Max $" defaultValue={search.priceMax} />
              </fieldset>
              <button type="submit" className="btn-primary col-span-2 lg:col-span-1">Apply</button>
            </div>
          </div>
        </form>
      </div>
      </div>
      <div className="wrap pt-6">
        <div className="mb-8">
          <GradeCompartments grades={grades} current={search.grade} base={search} />
        </div>

        <section aria-label="Listings">
          <PartView part={listings} what="Listings">
            {({ listings: list, pagination }) => (
              <>
                <div className="mb-8 flex items-baseline justify-between gap-4">
                  <p className="text-sm text-paper-dim" aria-live="polite">
                    {pagination ? `${count(pagination.total)} ${pagination.total === 1 ? "listing" : "listings"}` : `${list.length} listings`}
                    {filtered ? ((pagination?.total ?? list.length) === 1 ? " matches your filters" : " match your filters") : " active"}
                  </p>
                  {filtered && <Link to="/market" search={{ page: 1 }} className="text-sm text-paper-dim underline underline-offset-4 hover:text-paper">Clear filters</Link>}
                </div>
                {list.length ? (
                  <DealerCase key={list.map((l) => l.id).join()} list={list} />
                ) : (
                  <EmptyPanel>No listings match. Try fewer filters.</EmptyPanel>
                )}
                {pagination && pagination.totalPages > 1 && (
                  <nav aria-label="Pages" className="mt-16 flex items-center justify-between gap-4 text-sm">
                    {pagination.hasPrev ? (
                      <Link to="/market" search={{ ...search, page: pagination.page - 1 }} className="btn-quiet">← Previous</Link>
                    ) : <span />}
                    <span className="font-display text-muted">Page <span className="text-paper">{pagination.page}</span> of {pagination.totalPages}</span>
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
