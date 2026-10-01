import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { Avatar, PersonLink } from "@/components/person";
import { EmptyPanel, PartView } from "@/components/states";
import { getLeaderboard, type BoardTab } from "@/lib/api";
import { count, dateShort, personName, profileHref } from "@/lib/format";
import type { Person, RaceCategory, RaceEntry } from "@/lib/types";
import type { ReactNode } from "react";

/** The top three on plinths: second, first, third. Gold, silver, bronze. */
const PLACE = [
  { h: "h-28 sm:h-36", ring: "#d4a84b", label: "1st" },
  { h: "h-20 sm:h-24", ring: "#c9c1b2", label: "2nd" },
  { h: "h-14 sm:h-16", ring: "#b97a4a", label: "3rd" },
];
function Podium({ rows }: { rows: { person: Person; metric: ReactNode }[] }) {
  if (rows.length < 3) return null;
  const order = [1, 0, 2];
  return (
    <ol className="mb-10 grid grid-cols-3 items-end gap-2 sm:gap-6" aria-label="Top three">
      {order.map((i) => {
        const r = rows[i];
        const pl = PLACE[i];
        return (
          <li key={r.person.address} className={`rise flex flex-col items-center text-center ${i === 0 ? "" : "pt-6"}`}>
            <Link to={profileHref(r.person)} className="group flex min-w-0 max-w-full flex-col items-center">
              <span className="rounded-full p-[3px]" style={{ background: pl.ring }}>
                <Avatar person={r.person} size={i === 0 ? 76 : 58} />
              </span>
              <span className="mt-3 block max-w-full truncate font-display text-sm font-semibold group-hover:text-gold sm:text-base">{personName(r.person)}</span>
              <span className="mt-1 block">{r.metric}</span>
            </Link>
            <span className={`mt-4 flex w-full items-start justify-center ${pl.h} cut`} style={{ background: `linear-gradient(180deg, ${pl.ring}33, ${pl.ring}0d)` }}>
              <span className="shout mt-2 text-3xl sm:text-4xl" style={{ color: pl.ring }}>{pl.label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

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
            className={`btn min-h-10 px-4 text-sm ${c.key === cat.key ? "bg-gold text-ink" : "bg-raised text-paper-dim hover:text-paper"}`}
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
      <div className="mt-10">
        <Podium rows={cat.entries.slice(0, 3).map((e) => ({ person: e, metric: <><span className="num text-xl text-paper">{count(metric(e, cat.key))}</span> <span className="text-xs text-muted">{cat.metricLabel}</span></> }))} />
      </div>
      <ol className="border-b border-line">
        {cat.entries.slice(cat.entries.length >= 3 ? 3 : 0).map((e) => (
          <li key={e.address} className="ledger-row grid-cols-[48px_minmax(0,1fr)_auto]">
            <span className="shout text-xl text-line-strong">{e.rank}</span>
            <PersonLink person={e} />
            <span className="text-right">
              <span className="money text-lg">{count(metric(e, cat.key))}</span> <span className="text-xs text-muted">{cat.metricLabel}</span>
              <span className="block text-xs text-muted">{e.battleWins}W · {e.battleLosses}L · {e.battleDraws}D</span>
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
      <PageHead eyebrow="Rankings" title="Leaderboard">
        Points can be earned from paid pack opens, battles, coupon pulls and repaid loans, under rules YourGrails sets. Battle records count completed battles only.
      </PageHead>
      <div className="wrap">
        <nav aria-label="Leaderboard views" className="mb-10 inline-flex bg-velvet p-1 cut">
          {TABS.map(([t, label]) => (
            <Link
              key={t}
              to="/leaderboard"
              search={{ tab: t, sort: "wins" }}
              aria-current={search.tab === t ? "page" : undefined}
              className={`flex min-h-11 items-center px-4 font-display text-[15px] font-semibold sm:px-6 cut-sm ${search.tab === t ? "bg-paper text-ink" : "text-muted hover:text-paper"}`}
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
                  <p className="eyebrow">{race.status !== "ended" && race.status !== "scheduled" && <span className="live-dot mr-2 align-middle" aria-hidden="true" />}{race.status === "ended" ? "Final standings" : race.status === "scheduled" ? "Starts soon" : "Live"} · {dateShort(race.startAt, race.timeZone)} to {dateShort(race.endAt, race.timeZone)}</p>
                  <h2 className="shout mt-2 text-4xl sm:text-5xl">{race.title}</h2>
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
                <>
                <Podium rows={rows.slice(0, 3).map((r) => ({ person: r, metric: <><span className="num text-xl text-paper">{count(r.lifetimePointsEarned)}</span> <span className="text-xs text-muted">pts</span></> }))} />
                <ol className="border-b border-line">
                  {rows.slice(rows.length >= 3 ? 3 : 0).map((r) => (
                    <li key={r.address} className="ledger-row grid-cols-[48px_minmax(0,1fr)_auto]">
                      <span className="shout text-xl text-line-strong">{r.rank}</span>
                      <PersonLink person={r} />
                      <span className="money">{count(r.lifetimePointsEarned)} <span className="text-xs text-muted">pts</span></span>
                    </li>
                  ))}
                </ol>
                </>
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
                  className={`btn min-h-10 px-4 text-sm ${search.sort === s ? "bg-gold text-ink" : "bg-raised text-paper-dim hover:text-paper"}`}>
                  {s === "wins" ? "Most wins" : "Best streak"}
                </Link>
              ))}
            </div>
            <PartView part={data.battles} what="Battle standings">
              {(rows) =>
                rows.length ? (
                  <>
                  <Podium rows={rows.slice(0, 3).map((r) => ({ person: r, metric: <span className="num text-lg text-paper">{search.sort === "bestWinStreak" ? `${r.bestWinStreak} streak` : `${r.wins}W · ${r.losses}L`}</span> }))} />
                  <ol className="border-b border-line">
                    {rows.map((r, i) => i < (rows.length >= 3 ? 3 : 0) ? null : (
                      <li key={r.address} className="ledger-row grid-cols-[48px_minmax(0,1fr)_auto]">
                        <span className="shout text-xl text-line-strong">{i + 1}</span>
                        <PersonLink person={r} />
                        <span className="text-right text-sm tabular-nums">
                          {r.wins}W · {r.losses}L{r.draws ? ` · ${r.draws}D` : ""}
                          <span className="block text-xs text-muted">best streak {r.bestWinStreak}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  </>
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
