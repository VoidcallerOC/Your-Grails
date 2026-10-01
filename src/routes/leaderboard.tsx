import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { PersonLink } from "@/components/person";
import { EmptyPanel, PartView } from "@/components/states";
import { getLeaderboard, type BoardTab } from "@/lib/api";
import { count, dateShort } from "@/lib/format";
import type { RaceCategory, RaceEntry } from "@/lib/types";

type Search = { tab: BoardTab; sort: "wins" | "bestWinStreak"; category?: string };

export const Route = createFileRoute("/leaderboard")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tab: s.tab === "points" || s.tab === "battles" ? s.tab : "race",
    sort: s.sort === "bestWinStreak" ? "bestWinStreak" : "wins",
    category: typeof s.category === "string" ? s.category.slice(0, 40) : undefined,
  }),
  loaderDeps: ({ search }) => ({ tab: search.tab, sort: search.sort }),
  loader: ({ deps }) => getLeaderboard({ data: deps }),
  head: () => ({ meta: [{ title: "Leaderboard · YourGrails" }] }),
  component: Board,
});

const TABS: [BoardTab, string][] = [["race", "Monthly race"], ["points", "Overall points"], ["battles", "Battles"]];

function metric(e: RaceEntry, key: string): number {
  return (e as unknown as Record<string, number>)[key] ?? 0;
}

function RaceView({ cats, selected, sort }: { cats: RaceCategory[]; selected?: string; sort: Search["sort"] }) {
  const cat = cats.find((c) => c.key === selected) ?? cats[0];
  if (!cat) return <EmptyPanel>No race categories published.</EmptyPanel>;
  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Race category">
        {cats.map((c) => (
          <Link
            key={c.key}
            to="/leaderboard"
            search={{ tab: "race", sort, category: c.key }}
            aria-current={c.key === cat.key ? "true" : undefined}
            className={`btn min-h-10 text-xs ${c.key === cat.key ? "border-brass text-paper" : "border-line text-muted hover:text-paper"}`}
          >
            {c.shortTitle} · {c.totalParticipants}
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">{cat.title}</h2>
        <p className="mt-1 text-sm text-muted">{cat.description}</p>
        {cat.prizes.length > 0 && (
          <p className="mt-2 text-sm text-paper-dim">Prizes: {cat.prizes.map((p) => `${p.place}. ${p.label}`).join(" · ")}</p>
        )}
      </div>
      <ol className="mt-4 border-b border-line">
        {cat.entries.map((e) => (
          <li key={e.address} className="table-row grid-cols-[48px_1fr_auto]">
            <span className="font-mono text-sm text-muted">#{e.rank}</span>
            <PersonLink person={e} />
            <span className="text-right">
              <span className="font-mono text-lg">{count(metric(e, cat.key))}</span> <span className="text-xs text-muted">{cat.metricLabel}</span>
              <span className="block text-[11px] text-muted">{e.battleWins}W · {e.battleLosses}L · {e.battleDraws}D</span>
            </span>
          </li>
        ))}
      </ol>
      {!cat.entries.length && <EmptyPanel>No qualifying activity yet.</EmptyPanel>}
      <p className="mt-4 text-xs text-muted">Ties are broken by the category's supporting result, then fewer battles played, then wallet address.</p>
    </>
  );
}

function Board() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  return (
    <>
      <PageHead kicker="Rankings" title="Leaderboard">
        Points can be earned from paid pack opens, battles, coupon pulls and repaid loans, under rules YourGrails sets. Battle records count completed battles only.
      </PageHead>
      <div className="wrap">
        <nav aria-label="Leaderboard views" className="mb-8 flex border-b border-line">
          {TABS.map(([t, label]) => (
            <Link
              key={t}
              to="/leaderboard"
              search={{ tab: t, sort: "wins" }}
              aria-current={search.tab === t ? "page" : undefined}
              className={`-mb-px min-h-12 border-b-2 px-4 py-3 text-sm font-semibold ${search.tab === t ? "border-brass text-paper" : "border-transparent text-muted hover:text-paper"}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {data.tab === "race" && "race" in data && (
          <PartView part={data.race} what="The race leaderboard">
            {(race) => (
              <>
                <div className="mb-6">
                  <p className="label">{race.status === "ended" ? "Final standings" : race.status === "scheduled" ? "Starts soon" : "Live"} · {dateShort(race.startAt, race.timeZone)} to {dateShort(race.endAt, race.timeZone)}</p>
                  <h2 className="display mt-1 text-3xl">{race.title}</h2>
                  {race.subtitle && <p className="text-paper-dim">{race.subtitle}</p>}
                </div>
                <RaceView cats={race.categories} selected={search.category} sort={search.sort} />
              </>
            )}
          </PartView>
        )}

        {data.tab === "points" && "points" in data && (
          <PartView part={data.points} what="The points leaderboard">
            {(rows) =>
              rows.length ? (
                <ol className="border-b border-line">
                  {rows.map((r) => (
                    <li key={r.address} className="table-row grid-cols-[48px_1fr_auto]">
                      <span className="font-mono text-sm text-muted">#{r.rank}</span>
                      <PersonLink person={r} />
                      <span className="font-mono">{count(r.lifetimePointsEarned)} <span className="text-xs text-muted">pts</span></span>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyPanel>No points have been earned yet.</EmptyPanel>
              )
            }
          </PartView>
        )}

        {data.tab === "battles" && "battles" in data && (
          <>
            <div className="mb-4 flex gap-2">
              {(["wins", "bestWinStreak"] as const).map((s) => (
                <Link key={s} to="/leaderboard" search={{ tab: "battles", sort: s }} aria-current={search.sort === s ? "true" : undefined}
                  className={`btn min-h-10 text-xs ${search.sort === s ? "border-brass text-paper" : "border-line text-muted"}`}>
                  {s === "wins" ? "Most wins" : "Best streak"}
                </Link>
              ))}
            </div>
            <PartView part={data.battles} what="Battle standings">
              {(rows) =>
                rows.length ? (
                  <ol className="border-b border-line">
                    {rows.map((r, i) => (
                      <li key={r.address} className="table-row grid-cols-[48px_1fr_auto]">
                        <span className="font-mono text-sm text-muted">#{i + 1}</span>
                        <PersonLink person={r} />
                        <span className="text-right font-mono text-sm">
                          {r.wins}W · {r.losses}L{r.draws ? ` · ${r.draws}D` : ""}
                          <span className="block text-[11px] text-muted">best streak {r.bestWinStreak}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <EmptyPanel>No battles fought yet.</EmptyPanel>
                )
              }
            </PartView>
          </>
        )}
      </div>
    </>
  );
}
