import { createFileRoute } from "@tanstack/react-router";
import { PackCard } from "@/components/blocks";
import { PageHead } from "@/components/chrome";
import { PartView } from "@/components/states";
import { getPacks } from "@/lib/api";

export const Route = createFileRoute("/packs/")({
  loader: () => getPacks(),
  head: () => ({ meta: [{ title: "Packs · YourGrails" }] }),
  component: PacksPage,
});

function PacksPage() {
  const { packs } = Route.useLoaderData();
  return (
    <>
      <PageHead kicker="Packs" title="Sealed packs, graded cards">
        Each pack opens into one real graded card from that pack's pool. Odds and expected value are recalculated from the cards in
        the pool, so they move as cards are pulled and restocked.
      </PageHead>
      <div className="wrap">
        <PartView part={packs} what="Packs">
          {(list) =>
            list.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {list.map((p, i) => (
                  <PackCard key={p.id} pack={p} eager={i < 2} />
                ))}
              </div>
            ) : (
              <p className="text-muted">No packs are on sale right now.</p>
            )
          }
        </PartView>
      </div>
    </>
  );
}
