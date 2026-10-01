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
      <PageHead eyebrow="Sealed product" title="Sealed packs, graded cards">
        Each pack opens into one real graded card from that pack's pool. Odds and expected value are recalculated from the cards in
        the pool, so they move as cards are pulled and restocked.
      </PageHead>
      {!packs.ok && <div className="wrap"><PartView part={packs} what="Packs">{() => null}</PartView></div>}
      <PartView part={packs.ok ? packs : { ok: true, data: [] }} what="Packs">
        {(list) =>
          list.length ? (
            <div className="space-y-6">
              {list.map((p, i) => (
                <section key={p.id} className={i % 2 ? "border-y border-line bg-velvet" : ""}>
                  <div className="wrap py-14 lg:py-20">
                    <PackCard pack={p} eager={i < 2} flip={i % 2 === 1} live phase={i * 1.9} />
                  </div>
                </section>
              ))}
            </div>
          ) : packs.ok ? (
            <p className="wrap text-muted">No packs are on sale right now.</p>
          ) : null
        }
      </PartView>
    </>
  );
}
