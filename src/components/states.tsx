import { Link } from "@tanstack/react-router";
import { Lock, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { Part } from "@/lib/types";

export function ErrorPanel({ what, error }: { what: string; error: string }) {
  return (
    <div role="status" className="panel flex gap-3 p-4 text-sm">
      <TriangleAlert className="mt-0.5 shrink-0 text-warn" size={18} aria-hidden="true" />
      <div>
        <p className="font-semibold text-paper">{what} could not be loaded from YourGrails.</p>
        <p className="mt-1 text-muted">{error} Nothing is shown in its place. Try again shortly.</p>
      </div>
    </div>
  );
}

export function EmptyPanel({ children }: { children: ReactNode }) {
  return <div className="panel p-6 text-center text-sm text-muted">{children}</div>;
}

/** Renders a data part, or an honest error when that source failed. */
export function PartView<T>({ part, what, children, heading }: { part: Part<T>; what: string; children: (data: T) => ReactNode; heading?: string }) {
  if (!part.ok)
    return (
      <>
        {heading && <h1 className="display mb-4 text-4xl">{heading}</h1>}
        <ErrorPanel what={what} error={part.error} />
      </>
    );
  return <>{children(part.data)}</>;
}

/**
 * A production action this build cannot perform yet. Says what it does in production and why it is off.
 * Never fakes a result.
 */
export function BlockedAction({ label, does, className = "" }: { label: string; does: string; className?: string }) {
  return (
    <div className={`panel p-4 ${className}`}>
      <button type="button" className="btn-primary w-full" disabled aria-describedby={`why-${label.replace(/\W+/g, "-")}`}>
        <Lock size={15} aria-hidden="true" /> {label}
      </button>
      <p id={`why-${label.replace(/\W+/g, "-")}`} className="mt-3 text-xs leading-relaxed text-muted">
        {does} Wallet sign-in isn't connected in this build yet, so this action is off.{" "}
        <Link to="/account" className="link">
          Details
        </Link>
      </p>
    </div>
  );
}
