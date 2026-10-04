import { Link } from "@tanstack/react-router";
import { Avatar } from "@/components/person";
import { CardGrid, CardTile } from "@/components/slab";
import { EmptyPanel, ErrorPanel, PartView } from "@/components/states";
import { count, dateShort, personName, shortAddress, usd } from "@/lib/format";
import type { Collection, Part, Profile } from "@/lib/types";
import { GradeTag, Slab, Tilt } from "@/components/slab";

/**
 * THEIR GRAIL. Every collector has one: the most valuable card they hold, on its own pedestal.
 * Chosen from the cards production returned; when the collection spans pages, it says so.
 */
function TheirGrail({ c }: { c: Collection }) {
  const grail = c.cards
    .filter((k) => k.valueUsd !== null && (k.images.slab || k.images.front))
    .sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0))[0];
  if (!grail) return null;
  const paged = Boolean(c.pagination && c.pagination.totalPages > 1);
  return (
    <figure className="mx-auto grid w-full max-w-sm grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end gap-5 lg:max-w-none">
      <Tilt max={7}>
        <div className="relative">
          <Slab card={grail} eager sizes="220px" />
          <GradeTag card={grail} className="absolute bottom-3 left-0 z-10" />
        </div>
      </Tilt>
      <figcaption className="pb-6">
        <p className="eyebrow">Their grail</p>
        <p className="mt-2 font-display text-xl font-semibold leading-tight">{grail.title}</p>
        <p className="num mt-2 text-3xl text-paper">{usd(grail.valueUsd)}</p>
        <p className="label mt-1">{paged ? "Most valuable card on this page" : "Most valuable card in the collection"}</p>
      </figcaption>
    </figure>
  );
}

/** Public profile: identity from /users/by-username, cards from /users/:address/collection. One token per tile. */
export function ProfileView({ profile, address, collection }: { profile: Part<Profile | null>; address: string | null; collection: Part<Collection> }) {
  const p = profile.ok ? profile.data : null;
  const person = p ?? (address ? { address } : null);
  return (
    <>
      {!profile.ok && (
        <div className="wrap pt-10">
          <h1 className="shout mb-5 text-4xl">Collector</h1>
          <ErrorPanel what="This profile" error={profile.error} />
        </div>
      )}
      {person && (
        <section className="relative overflow-hidden border-b border-line">
          <div className="wrap relative grid grid-cols-1 items-center gap-10 py-12 sm:py-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-5 sm:gap-7">
                <span className="shrink-0 rounded-full bg-gradient-to-b from-gold to-gold-deep p-[3px]">
                  <Avatar person={person} size={88} />
                </span>
                <div className="min-w-0">
                  <p className="eyebrow">Collector</p>
                  <h1 className="shout mt-1 truncate text-4xl sm:text-6xl">{personName(person)}</h1>
                  <p className="mt-2 text-sm text-muted">
                    <span className="font-mono">{shortAddress(person.address)}</span>
                    {p?.memberSince && <> · Joined {dateShort(p.memberSince)}</>}
                  </p>
                </div>
              </div>
              {p?.bio && <p className="mt-5 max-w-md text-paper-dim">{p.bio}</p>}
              {collection.ok && (
                <dl className="mt-8 flex gap-10">
                  <div className="flex flex-col-reverse">
                    <dt className="label mt-1">Cards</dt>
                    <dd className="num text-4xl leading-none sm:text-5xl">{count(collection.data.totalCards ?? collection.data.cards.length)}</dd>
                  </div>
                  <div className="flex flex-col-reverse">
                    <dt className="label mt-1">Collection value</dt>
                    <dd className="num text-4xl leading-none text-paper sm:text-5xl">{usd(collection.data.totalValueUsd)}</dd>
                  </div>
                </dl>
              )}
            </div>
            {collection.ok && <TheirGrail c={collection.data} />}
          </div>
        </section>
      )}
      <div className="wrap mt-12">
        <PartView part={collection} what="This collection">
          {(c) => (
            <>
              {c.cards.length ? (
                <>
                  <div className="mb-8 flex items-end justify-between gap-4">
                    <h2 className="shout text-3xl sm:text-4xl">On the wall</h2>
                    <p className="label">Market value shown on each card.</p>
                  </div>
                  <CardGrid>
                    {c.cards.map((card) => (
                      <CardTile
                        key={card.token?.tokenId ?? card.id}
                        card={card}
                        footer={card.status === "listed" ? <p className="mt-1.5 inline-block bg-gold/15 px-1.5 py-0.5 font-display text-[11.5px] font-semibold text-gold cut-sm">Listed for sale</p> : null}
                      />
                    ))}
                  </CardGrid>
                </>
              ) : (
                <EmptyPanel>No cards in this collection.</EmptyPanel>
              )}
              {c.pagination && c.pagination.totalPages > 1 && (
                <p className="mt-12 text-sm text-muted">
                  Page {c.pagination.page} of {c.pagination.totalPages}.{" "}
                  {c.pagination.hasNext && <Link to="." search={{ page: c.pagination.page + 1 }} className="link">Next page</Link>}
                </p>
              )}
            </>
          )}
        </PartView>
      </div>
    </>
  );
}
