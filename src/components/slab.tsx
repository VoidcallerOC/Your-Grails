import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { cardLine, usd } from "@/lib/format";
import type { CardSummary } from "@/lib/types";

/** The slab's own label, as an object: grader on cream, grade on black; gem-mint 10s turn gold. */
export function GradeTag({ card, className = "" }: { card: Pick<CardSummary, "grader" | "grade">; className?: string }) {
  if (!card.grader && !card.grade) return null;
  const gem = Number(card.grade) === 10;
  return (
    <span role="img" className={`grade-tag ${gem ? "is-gem" : ""} ${className}`} aria-label={`${card.grader ?? "Grade"} ${card.grade ?? ""}`.trim()}>
      <span className="gt-who" aria-hidden="true">{card.grader ?? "GRADE"}</span>
      <span className="gt-num" aria-hidden="true">{card.grade ?? "—"}</span>
    </span>
  );
}

/** Kept for existing call sites: plain-text grade. */
export function GradeMark({ card }: { card: Pick<CardSummary, "grader" | "grade"> }) {
  return <GradeTag card={card} />;
}

/** Pointer-follow tilt for objects. CSS disables it under reduced motion. */
export function Tilt({ children, className = "" }: { children: ReactNode; max?: number; className?: string }) {
  // Kept as a plain wrapper so call sites stay put; cards no longer lean toward the pointer. It stays the positioning
  // anchor for the card's absolutely placed parts (the old transform did that implicitly), so they stay inside scrollers.
  return <div className={`relative ${className}`}>{children}</div>;
}

/** A real slab photograph standing in its own light. When production has no photo, say so instead of drawing a card. */
export function Slab({ card, eager = false, sizes, className = "" }: { card: CardSummary; eager?: boolean; sizes?: string; className?: string }) {
  const src = card.images.slab ?? card.images.front ?? card.images.thumb;
  return (
    <div className={`stage ${className}`}>
      {src ? (
        <img
          className="slab-img"
          src={src}
          alt={`${card.title}${card.grader ? `, ${card.grader} ${card.grade ?? ""}` : ""}`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          width={500}
          height={800}
          sizes={sizes}
        />
      ) : (
        <span className="relative z-10 mb-[30%] px-4 text-center text-sm text-muted">Photo not provided</span>
      )}
    </div>
  );
}

/** Kept name for existing call sites. */
export const SlabPhoto = Slab;

/**
 * A slab on the shelf: the object first, then a museum-style placard (name, set, price).
 * `priceLabel` is announced to screen readers; grids of market values say so once at the grid.
 */
export function CardTile({
  card,
  href,
  price,
  priceLabel = "Market value",
  footer,
  eager = false,
}: {
  card: CardSummary;
  href?: string;
  price?: number | null;
  priceLabel?: string;
  footer?: ReactNode;
  eager?: boolean;
}) {
  const amount = usd(price === undefined ? card.valueUsd : price);
  const body = (
    <>
      <Tilt>
        <div className="shelf relative pb-px">
          <Slab card={card} eager={eager} sizes="(min-width: 1024px) 280px, 46vw" />
          <GradeTag card={card} className="absolute bottom-3 left-1 z-10" />
        </div>
      </Tilt>
      <div className="pt-3">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-paper group-hover:text-gold-bright">{card.title}</h3>
        <p className="mt-0.5 truncate text-[12.5px] text-muted">{cardLine(card) || " "}</p>
        <p className="mt-1.5 leading-none">
          <span className="sr-only">{priceLabel}: </span>
          <span className="money text-xl">{amount}</span>
        </p>
        {footer}
      </div>
    </>
  );
  return (
    <article className="group rise">
      {href ? (
        <Link to={href} className="block">
          {body}
        </Link>
      ) : (
        body
      )}
    </article>
  );
}

/** A display case: rows of slabs, each on its own lit ledge. */
export function CardGrid({ children, dense = false }: { children: ReactNode; dense?: boolean }) {
  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-14 ${dense ? "md:grid-cols-4 xl:grid-cols-5" : "sm:grid-cols-3 lg:grid-cols-4"}`}>
      {children}
    </div>
  );
}

/** One long shelf you can swipe along: used where a few objects should tease a whole room. */
export function ShelfRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="region" aria-label={label} className="relative -mx-4 overflow-x-auto px-4 pb-4 [contain:paint] [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="grid auto-cols-[44%] grid-flow-col gap-5 sm:auto-cols-[30%] lg:auto-cols-[calc((100%-6rem)/5)] [&>*]:snap-start" style={{ scrollSnapType: "x mandatory" }}>
        {children}
      </div>
    </div>
  );
}
