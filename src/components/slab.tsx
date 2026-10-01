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
        <span className="label px-4 text-center">Photo not provided</span>
      )}
    </div>
  );
}

export function GradeMark({ card }: { card: Pick<CardSummary, "grader" | "grade"> }) {
  if (!card.grader && !card.grade) return null;
  return <span className="font-mono text-[11px] font-medium text-paper">{gradeLabel(card)}</span>;
}

/** Catalog entry: slab photo, cert strip, title, set line and value. */
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
  const body = (
    <>
      <SlabPhoto card={card} sizes="(min-width: 1024px) 260px, 45vw" />
      <div className="cert-strip">
        <GradeMark card={card} />
        {card.cert && <span className="truncate">Cert {card.cert}</span>}
      </div>
      <div className="px-2.5 pb-3 pt-1">
        <h3 className="truncate text-sm font-semibold text-paper">{card.title}</h3>
        <p className="truncate text-xs text-muted">{cardLine(card) || " "}</p>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="label">{priceLabel}</span>
          <span className="font-mono text-sm text-paper">{usd(price === undefined ? card.valueUsd : price)}</span>
        </div>
        {footer}
      </div>
    </>
  );
  return (
    <article className="panel overflow-hidden transition-colors hover:border-line-strong">
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

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{children}</div>;
}
