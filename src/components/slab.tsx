import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cardLine, gradeLabel, usd } from "@/lib/format";
import type { CardSummary } from "@/lib/types";

/** Real photography only. When production has no photo, say so instead of drawing a card. */
export function SlabPhoto({ card, eager = false, sizes }: { card: CardSummary; eager?: boolean; sizes?: string }) {
  const src = card.images.slab ?? card.images.front ?? card.images.thumb;
  return (
    <div className="slab">
      {src ? (
        <img
          src={src}
          alt={`${card.title}${card.grader ? `, ${card.grader} ${card.grade ?? ""}` : ""}`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          width={500}
          height={800}
          sizes={sizes}
        />
      ) : (
        <span className="px-4 text-center text-sm text-muted">Photo not provided</span>
      )}
    </div>
  );
}

export function GradeMark({ card }: { card: Pick<CardSummary, "grader" | "grade"> }) {
  if (!card.grader && !card.grade) return null;
  return <span className="font-medium text-paper">{gradeLabel(card)}</span>;
}

/**
 * Catalog entry: the slab photo leads, then name and amount on one scannable line,
 * then grade, set and cert as quiet metadata.
 */
export function CardTile({
  card,
  href,
  price,
  priceLabel = "Market value",
  footer,
}: {
  card: CardSummary;
  href?: string;
  price?: number | null;
  priceLabel?: string;
  footer?: ReactNode;
}) {
  const amount = usd(price === undefined ? card.valueUsd : price);
  const grade = card.grader || card.grade ? gradeLabel(card) : "";
  const body = (
    <>
      <div className="transition-transform duration-200 group-hover:-translate-y-1">
        <SlabPhoto card={card} sizes="(min-width: 1024px) 290px, 45vw" />
      </div>
      <div className="px-0.5 pt-3">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-paper">{card.title}</h3>
          <p className="shrink-0 leading-snug sm:text-right">
            <span className="sr-only">{priceLabel}: </span>
            <span className="money text-[15px]">{amount}</span>
          </p>
        </div>
        <p className="mt-1 truncate text-[13px] text-paper-dim">{[grade, cardLine(card)].filter(Boolean).join(" · ") || " "}</p>
        {card.cert && <p className="truncate text-xs text-muted">Cert {card.cert}</p>}
        {footer}
      </div>
    </>
  );
  return (
    <article className="group">
      {href ? (
        <Link to={href} className="block rounded-[var(--radius-slab)]">
          {body}
        </Link>
      ) : (
        body
      )}
    </article>
  );
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">{children}</div>;
}
