const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const int = new Intl.NumberFormat("en-US");

/** Money with cents under $1,000 and whole dollars above. Missing values render as an em dash, never as $0. */
export function usd(n: number | null | undefined, opts: { cents?: boolean } = {}): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const cents = opts.cents ?? Math.abs(n) < 1000;
  return (cents ? usd2 : usd0).format(n);
}

/** Compact dollars for large totals: $814K, $1.2M. */
export function usdCompact(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function count(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return int.format(n);
}

export function pct(n: number | null | undefined, digits = 2): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

export function shortAddress(a: string | undefined | null): string {
  if (!a) return "—";
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export function dateShort(iso: string | undefined | null, timeZone?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone }).format(d);
}

/** "3h ago" style, computed against an explicit `now` so server and client agree. */
export function ago(iso: string | undefined | null, now: number): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function cardLine(c: { set?: string; number?: string; year?: number }): string {
  return [c.year, c.set, c.number ? `#${c.number}` : undefined].filter(Boolean).join(" · ");
}

export function personName(p: { displayName?: string; username?: string; address: string }): string {
  return p.displayName || p.username || shortAddress(p.address);
}

export function profileHref(p: { username?: string; address: string }): string {
  return p.username ? `/u/${encodeURIComponent(p.username)}` : `/u/address/${p.address}`;
}

/** "PSA 10", or "Grade 10" when production omits the grading company. */
export function gradeLabel(c: { grader?: string; grade?: string }): string {
  if (c.grader) return `${c.grader} ${c.grade ?? ""}`.trim();
  return c.grade ? `Grade ${c.grade}` : "";
}
