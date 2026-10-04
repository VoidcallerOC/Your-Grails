import { Link } from "@tanstack/react-router";
import { Lock, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { Part } from "@/lib/types";

export function ErrorPanel({ what, error }: { what: string; error: string }) {
  return (
    <div role="status" className="panel flex gap-3 border-l-2 border-warn p-5 text-sm">
      <TriangleAlert className="mt-0.5 shrink-0 text-warn" size={18} aria-hidden="true" />
      <div>
        <p className="font-semibold text-paper">{what} could not be loaded from YourGrails.</p>
        <p className="mt-1 text-muted">{error} Nothing is shown in its place. Try again shortly.</p>
      </div>
    </div>
  );
}

/** An empty case in the shop: the shelf is there, nothing is on it. */
export function EmptyPanel({ children }: { children: ReactNode }) {
  return (
    <div className="shelf px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-paper-dim">{children}</p>
    </div>
  );
}

/** Renders a data part, or an honest error when that source failed. */
export function PartView<T>({ part, what, children, heading }: { part: Part<T>; what: string; children: (data: T) => ReactNode; heading?: string }) {
  if (!part.ok)
    return (
      <>
        {heading && <h1 className="shout mb-5 text-4xl">{heading}</h1>}
        <ErrorPanel what={what} error={part.error} />
      </>
    );
  return <>{children(part.data)}</>;
}

/**
 * A production action this build cannot perform yet: a locked plaque, with what it does in production and why it is off.
 * Never fakes a result.
 */
export function BlockedAction({ label, does, className = "", tone = "quiet" }: { label: string; does: string; className?: string; tone?: "quiet" | "primary" }) {
  const id = `why-${label.replace(/\W+/g, "-")}`;
  return (
    <div className={className}>
      <button type="button" className={`${tone === "primary" ? "btn-primary" : "btn-quiet"} min-h-12 w-full`} disabled aria-describedby={id}>
        <Lock size={15} aria-hidden="true" /> {label}
      </button>
      <p id={id} className="mt-2.5 text-xs leading-relaxed text-muted">
        {does} Wallet sign-in isn't connected in this build yet, so this action is off.{" "}
        <Link to="/account" className="link">
          Details
        </Link>
      </p>
    </div>
  );
}

/** Phones: the price and the main action stay under the thumb, docked above the tab bar. Same locked action as on the page. */
export function MobileBuyBar({ price, label }: { price: string; label: string }) {
  return (
    <>
    <div className="h-16 lg:hidden" aria-hidden="true" />
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t border-line bg-ink lg:hidden">
      <div className="wrap flex items-center justify-between gap-4 py-2.5">
        <p className="leading-none">
          <span className="money text-2xl">{price}</span> <span className="text-xs text-muted">USDC</span>
          <Link id="buybar-why" to="/account" className="mt-1 block text-[11px] text-muted underline underline-offset-2">Sign-in is off in this build</Link>
        </p>
        <button type="button" className="btn-primary min-h-11" disabled aria-describedby="buybar-why">
          <Lock size={14} aria-hidden="true" /> {label}
        </button>
      </div>
    </div>
    </>
  );
}
