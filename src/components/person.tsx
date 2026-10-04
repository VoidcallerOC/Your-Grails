import { Link } from "@tanstack/react-router";
import { personName, profileHref, shortAddress } from "@/lib/format";
import type { Person } from "@/lib/types";

export function Avatar({ person, size = 36 }: { person: Person; size?: number }) {
  const name = personName(person);
  if (person.avatarUrl) {
    return <img src={person.avatarUrl} alt="" width={size} height={size} loading="lazy" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-raised font-display font-bold text-paper"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {name.replace(/^0x/, "").slice(0, 1).toUpperCase()}
    </span>
  );
}

export function PersonLink({ person, size = 36 }: { person: Person; size?: number }) {
  return (
    <Link to={profileHref(person)} className="flex min-w-0 items-center gap-3 hover:opacity-85">
      <Avatar person={person} size={size} />
      <span className="min-w-0">
        <span className="block truncate font-semibold text-paper">{personName(person)}</span>
        <span className="block font-mono text-xs text-muted">{shortAddress(person.address)}</span>
      </span>
    </Link>
  );
}
