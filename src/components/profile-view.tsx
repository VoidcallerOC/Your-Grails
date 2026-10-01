import { Link } from "@tanstack/react-router";
import { PageHead } from "@/components/chrome";
import { Avatar } from "@/components/person";
import { CardGrid, CardTile } from "@/components/slab";
import { EmptyPanel, ErrorPanel, PartView } from "@/components/states";
import { count, dateShort, personName, shortAddress, usd } from "@/lib/format";
import type { Collection, Part, Profile } from "@/lib/types";

/** Public profile: identity from /users/by-username, cards from /users/:address/collection. One token per tile. */
export function ProfileView({ profile, address, collection }: { profile: Part<Profile | null>; address: string | null; collection: Part<Collection> }) {
  const p = profile.ok ? profile.data : null;
  const person = p ?? (address ? { address } : null);
  return (
    <>
      {!profile.ok && (
        <div className="wrap pt-10">
          <h1 className="display mb-4 text-3xl">Collector</h1>
          <ErrorPanel what="This profile" error={profile.error} />
        </div>
      )}
      {person && (
        <PageHead title={personName(person)}>
          <div className="flex items-center gap-4">
            <Avatar person={person} size={56} />
            <div className="text-sm">
              <p className="font-mono text-muted">{shortAddress(person.address)}</p>
              {p?.memberSince && <p className="text-muted">Joined {dateShort(p.memberSince)}</p>}
              {p?.bio && <p className="mt-1 text-paper-dim">{p.bio}</p>}
            </div>
          </div>
        </PageHead>
      )}
      <div className="wrap">
        <PartView part={collection} what="This collection">
          {(c) => (
            <>
              <dl className="mb-6 flex gap-10 border-y border-line py-4">
                <div><dt className="label">Cards</dt><dd className="money text-xl">{count(c.totalCards ?? c.cards.length)}</dd></div>
                <div><dt className="label">Collection value</dt><dd className="money text-xl">{usd(c.totalValueUsd)}</dd></div>
              </dl>
              {c.cards.length ? (
                <CardGrid>
                  {c.cards.map((card) => (
                    <CardTile key={card.token?.tokenId ?? card.id} card={card} footer={card.status === "listed" ? <p className="mt-1 text-xs text-paper-dim">Listed for sale</p> : null} />
                  ))}
                </CardGrid>
              ) : (
                <EmptyPanel>No cards in this collection.</EmptyPanel>
              )}
              {c.pagination && c.pagination.totalPages > 1 && (
                <p className="mt-6 text-sm text-muted">
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
