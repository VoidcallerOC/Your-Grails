import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PackPedestal } from "@/components/blocks";
import { PersonLink } from "@/components/person";
import { BlockedAction, EmptyPanel, PartView } from "@/components/states";
import { getBattlesOverview } from "@/lib/api";
import { count, usd } from "@/lib/format";

export const Route = createFileRoute("/battles")({
  loader: () => getBattlesOverview(),
  head: () => ({ meta: [{ title: "Battles · YourGrails" }] }),
  component: Battles,
});

/** Rules as published in production's docs and Terms §7. Nobody loses the card they pull. */
const RULES: [string, string][] = [
  ["Two packs, same price", "You start or join a battle for a pack. Another collector, or the YG Battle Bot, opens an identical pack."],
  ["Both cards are revealed fairly", "Each side's card comes from a Chainlink VRF draw. If someone misses their reveal, the timeout process reveals for them."],
  ["You keep your pull", "Win or lose, the card from your own pack stays yours. You can still sell it back if it qualifies."],
  ["Higher value wins a bonus pack", "The card with the higher market value wins. The winner gets a bonus pack of equal value, opened on the spot."],
];

function Battles() {
  const { stats, top, packs } = Route.useLoaderData();
  const poster = packs.ok ? packs.data[0] : undefined;
  return (
    <>
      {/* The fight poster. */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="wrap relative grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div>
            <p className="eyebrow mb-4 !text-live"><span className="live-dot mr-2 align-middle" aria-hidden="true" />Pack battles</p>
            <h1 className="shout text-6xl sm:text-7xl lg:text-[5.4rem]">Open head to head</h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-paper-dim">
              Two collectors open the same pack at the same time. Both keep what they pull. The bigger pull wins a bonus pack.
            </p>
            <PartView part={stats} what="Battle figures">
              {(s) => (
                <dl className="mt-9 flex gap-12">
                  <div className="flex flex-col-reverse">
                    <dt className="label mt-1">Battles fought</dt>
                    <dd className="num text-5xl leading-none">{count(s.completedBattles)}</dd>
                  </div>
                  <div className="flex flex-col-reverse">
                    <dt className="label mt-1">Live right now</dt>
                    <dd className="num text-5xl leading-none text-live">{count(s.liveBattles)}</dd>
                  </div>
                </dl>
              )}
            </PartView>
          </div>
          {poster && (
            <div className="relative mx-auto grid w-full max-w-md grid-cols-[1fr_auto_1fr] items-center" aria-hidden="true">
              <div className="-rotate-[8deg]"><PackPedestal tier={poster.tier} name={poster.name} eager /></div>
              <span className="shout px-1 text-6xl text-live sm:text-7xl">VS</span>
              <div className="rotate-[8deg]"><PackPedestal tier={poster.tier} name={poster.name} eager /></div>
            </div>
          )}
        </div>
      </section>

      {/* The rules, as rounds. */}
      <section className="wrap mt-16">
        <h2 className="shout text-4xl">How a battle plays out</h2>
        <ol className="mt-8 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {RULES.map(([t, d], i) => (
            <li key={t} className="rise border-t-2 border-line-strong pt-4">
              <p className="font-display text-sm font-semibold text-live">Round {i + 1}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-dim">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-3xl text-sm text-muted">
          Battles are for collectors aged 21 and over, and are not offered where they aren't allowed. A battle can take up to six
          transactions: both openings, the bonus pack, and any buybacks.
        </p>
      </section>

      <div className="wrap mt-16 grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Pick a fight. */}
        <section>
          <h2 className="shout text-4xl">Start a battle</h2>
          <PartView part={packs} what="Battle packs">
            {(list) => list.length === 0 ? (
              <p className="mt-6 text-sm text-muted">No packs are on sale right now, so no battles can be started.</p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {list.map((p) => (
                  <article key={p.id} className="panel grid grid-cols-[96px_minmax(0,1fr)] items-center gap-5 p-5">
                    <PackPedestal tier={p.tier} name={p.name} />
                    <div>
                      <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                      <p className="money mt-1 text-2xl">{usd(p.priceUsd)} <span className="font-sans text-xs font-normal text-muted">a side</span></p>
                      {(() => {
                        const top = Math.max(0, ...p.chase.map((c) => c.valueUsd ?? 0));
                        return (
                          <p className="mt-2 text-[12px] text-muted">
                            {top > 0 && <>Top chase <span className="num text-paper">{usd(top)}</span></>}
                            {top > 0 && p.availableInventory !== null && " · "}
                            {p.availableInventory !== null && <>{count(p.availableInventory)} slabs in the pool</>}
                          </p>
                        );
                      })()}
                    </div>
                    <BlockedAction className="col-span-2" tone="primary" label={`Start a ${p.name} battle · ${usd(p.priceUsd)}`} does="Creates a battle for this pack. Another collector or the YG Battle Bot can join." />
                  </article>
                ))}
              </div>
            )}
          </PartView>
          <p className="mt-5 text-sm text-muted">
            Joining open battles needs the live battle lobby. That feed isn't connected in this build yet.
          </p>
          <p className="mt-2 text-sm">
            <Link to="/terms" className="link">Battle terms</Link>
          </p>
        </section>

        {/* The ladder. */}
        <aside>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="shout text-4xl">Most wins</h2>
            <Link to="/leaderboard" search={{ tab: "race", sort: "wins" }} className="group flex items-center gap-1.5 font-display text-[15px] font-semibold text-paper-dim hover:text-gold">
              Leaderboard <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <PartView part={top} what="Battle standings">
            {(rows) => rows.length === 0 ? (
              <EmptyPanel>No battles fought yet.</EmptyPanel>
            ) : (
              <ol className="panel divide-y divide-line px-5">
                {rows.map((r, i) => {
                  const total = r.wins + r.losses || 1;
                  return (
                    <li key={r.address} className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 py-4">
                      <span className={`shout text-2xl ${i === 0 ? "text-paper" : "text-line-strong"}`}>{i + 1}</span>
                      <div className="min-w-0">
                        <PersonLink person={r} size={32} />
                        <span className="mt-2 flex h-1 overflow-hidden bg-shelf" aria-hidden="true">
                          <span className="bg-ok" style={{ width: `${(r.wins / total) * 100}%` }} />
                          <span className="bg-live/70" style={{ width: `${(r.losses / total) * 100}%` }} />
                        </span>
                      </div>
                      <span className="num text-right text-sm">{r.wins}W · {r.losses}L</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </PartView>
        </aside>
      </div>
    </>
  );
}
