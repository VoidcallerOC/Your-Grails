import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHead } from "@/components/blocks";
import { PageHead } from "@/components/chrome";
import { PersonLink } from "@/components/person";
import { BlockedAction, PartView } from "@/components/states";
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
  return (
    <>
      <PageHead kicker="Pack battles" title="Open head to head">
        Two collectors open the same pack at the same time. Both keep what they pull. The bigger pull wins a bonus pack.
      </PageHead>
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <ol className="border-t border-line">
            {RULES.map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[40px_minmax(0,1fr)] gap-3 border-b border-line py-5">
                <span className="font-mono text-sm text-brass">0{i + 1}</span>
                <div>
                  <h2 className="font-semibold">{t}</h2>
                  <p className="mt-1 text-sm text-paper-dim">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-muted">
            Battles are for collectors aged 21 and over, and are not offered where they aren't allowed. A battle can take up to six
            transactions: both openings, the bonus pack, and any buybacks.
          </p>
          <PartView part={packs} what="Battle packs">
            {(list) => (
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {list.map((p) => (
                  <BlockedAction key={p.id} label={`Start a ${p.name} battle · ${usd(p.priceUsd)}`} does="Creates a battle for this pack. Another collector or the YG Battle Bot can join." />
                ))}
              </div>
            )}
          </PartView>
          <p className="mt-4 text-sm text-muted">
            Joining open battles needs the live battle lobby. That feed isn't connected in this build yet.
          </p>
        </div>
        <aside>
          <PartView part={stats} what="Battle figures">
            {(s) => (
              <dl className="grid grid-cols-2 border-y border-line">
                <div className="border-r border-line py-4 pr-4"><dt className="label">Battles fought</dt><dd className="mt-1 font-mono text-2xl">{count(s.completedBattles)}</dd></div>
                <div className="py-4 pl-4"><dt className="label">Live right now</dt><dd className="mt-1 font-mono text-2xl">{count(s.liveBattles)}</dd></div>
              </dl>
            )}
          </PartView>
          <div className="mt-8">
            <SectionHead title="Most wins" action={{ to: "/leaderboard", label: "Leaderboard" }} />
            <PartView part={top} what="Battle standings">
              {(rows) => (
                <ol className="border-b border-line">
                  {rows.map((r, i) => (
                    <li key={r.address} className="ledger-row grid-cols-[32px_minmax(0,1fr)_auto]">
                      <span className="font-mono text-xs text-muted">#{i + 1}</span>
                      <PersonLink person={r} size={32} />
                      <span className="font-mono text-sm">{r.wins}W · {r.losses}L</span>
                    </li>
                  ))}
                </ol>
              )}
            </PartView>
          </div>
          <p className="mt-6 text-sm">
            <Link to="/terms" className="link">Battle terms</Link>
          </p>
        </aside>
      </div>
    </>
  );
}
