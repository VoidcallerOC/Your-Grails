import { ArrowLeftRight, Landmark, Lock, Play, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ago, count, usd } from "@/lib/format";
import { glow, packArtSrc, tierColor } from "@/lib/packs";
import type { OddsTier, Pull } from "@/lib/types";

/**
 * THE POOL. A pack is one draw from a finite vault of real slabs. Every mark here is one graded card in this pack's pool,
 * coloured by its value tier, from production's per-tier inventory counts. Rarest first, so the grail is never lost in the noise.
 */
export function PoolView({ odds }: { odds: OddsTier[] }) {
  const tiers = odds.map((o, i) => ({ ...o, color: tierColor(o.label, i) })).filter((o) => o.count > 0);
  const total = tiers.reduce((n, o) => n + o.count, 0);
  if (!total) return null;
  const rarestFirst = [...tiers].reverse();
  return (
    <figure>
      <div
        className="flex flex-wrap gap-[3px]"
        role="img"
        aria-label={`${count(total)} slabs in the pool: ${rarestFirst.map((t) => `${t.count} ${t.label}`).join(", ")}.`}
      >
        {rarestFirst.flatMap((t, ti) =>
          Array.from({ length: t.count }, (_, k) => (
            <span
              key={`${t.label}-${k}`}
              className="h-[13px] w-[8px] sm:h-[15px] sm:w-[9px]"
              style={{ background: t.color, boxShadow: ti < 2 ? `0 0 8px ${t.color}` : undefined, opacity: ti < 2 ? 1 : 0.8 }}
            />
          )),
        )}
      </div>
      <figcaption className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {rarestFirst.map((t) => (
          <span key={t.label} className="inline-flex items-baseline gap-2">
            <span className="h-2.5 w-1.5 self-center" style={{ background: t.color }} aria-hidden="true" />
            <span className="num text-paper">{count(t.count)}</span>
            <span className="text-muted">{t.label}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/** Counts a value up from zero when `run` flips true. Shows the final value immediately without JS or under reduced motion. */
function useCountUp(target: number | null, run: boolean, ms = 900) {
  const [v, setV] = useState<number | null>(target);
  useEffect(() => {
    if (!run || target === null) return void setV(target);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return void setV(target);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setV(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return v;
}

/**
 * THE REVEAL, as an event. Replays a real reveal from this pack: the sealed pack, the flash in the pull's tier colour,
 * the slab rising, the value counting up. It is a replay of production data, labelled as one; nothing is drawn for you.
 */
export function RevealReplay({ pull, tier, now }: { pull: Pull; tier: string; now: number }) {
  const [phase, setPhase] = useState<"done" | "sealed" | "flash" | "rise">("done");
  const timers = useRef<number[]>([]);
  const color = tierColor(pull.pullTier);
  const rgb = glow(tier);
  const value = useCountUp(pull.valueUsd, phase === "rise");
  const art = packArtSrc(tier);

  const play = () => {
    timers.current.forEach(clearTimeout);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setPhase("done");
    setPhase("sealed");
    timers.current = [window.setTimeout(() => setPhase("flash"), 1400), window.setTimeout(() => setPhase("rise"), 1950)];
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const showPack = phase === "sealed" || phase === "flash";
  return (
    <figure data-phase={phase} className="relative grid grid-cols-1 items-center gap-8 overflow-hidden sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative mx-auto aspect-[5/7] w-full max-w-[300px]">
        {/* the burst, in the pull's tier colour */}
        <div
          className="pointer-events-none absolute inset-[-20%] transition-opacity duration-500"
          style={{ background: `radial-gradient(closest-side, ${color}66, ${color}14 55%, transparent)`, opacity: phase === "flash" || phase === "rise" || phase === "done" ? 1 : 0 }}
          aria-hidden="true"
        />
        {art && (
          <img
            src={art}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 m-auto h-[92%] w-auto object-contain transition-all duration-500 ${showPack ? "opacity-100" : "pointer-events-none scale-110 opacity-0"} ${phase === "flash" ? "scale-[1.08] brightness-150" : ""}`}
            style={{ filter: showPack ? `drop-shadow(0 0 40px rgba(${rgb},0.5))` : undefined }}
          />
        )}
        {pull.image ? (
          <img
            src={pull.image}
            alt={pull.title}
            loading="lazy"
            className={`absolute inset-0 m-auto h-[92%] w-auto object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.6)] transition-all duration-700 ease-out ${phase === "rise" || phase === "done" ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          />
        ) : null}
      </div>
      <figcaption>
        <p className="eyebrow" style={{ color: `rgb(${rgb})` }}>Latest reveal from this pack</p>
        {/* Nothing is given away while the pack is still sealed. */}
        <p className="mt-3 font-display text-lg font-bold capitalize italic transition-opacity duration-300" style={{ color, opacity: showPack ? 0 : 1 }}>{pull.pullTier ?? "Pull"} pull</p>
        <h3 className="shout mt-1 text-4xl transition-opacity duration-300 sm:text-5xl" style={{ opacity: showPack ? 0.15 : 1 }}>{showPack ? "Opening…" : pull.title}</h3>
        <p className="money mt-4 text-5xl text-gold">{showPack ? "$ ? ? ?" : value === null ? "—" : usd(value)}</p>
        <p className="label mt-2">Revealed {ago(pull.revealedAt, now)}. A replay of a real pull, not a new draw.</p>
        <button type="button" onClick={play} className="btn-quiet mt-6">
          <Play size={15} aria-hidden="true" /> Replay this reveal
        </button>
      </figcaption>
    </figure>
  );
}

/**
 * WHERE THE SLAB IS. A loan here is backed by a real card, so the question every step answers is physical:
 * who holds the slab right now. Used on lending; positions follow the published loan rules.
 */
export type Holder = "borrower" | "vault" | "lender";
const HOLDERS: [Holder, string, typeof User][] = [
  ["borrower", "Borrower", User],
  ["vault", "Lending vault", Landmark],
  ["lender", "Lender", User],
];
export function CustodyTrack({ at, locked = false, note }: { at: Holder; locked?: boolean; note?: string }) {
  return (
    <div className="mt-4 max-w-md" aria-label={`The slab is with the ${HOLDERS.find((h) => h[0] === at)?.[1].toLowerCase()}${locked ? ", locked" : ""}.`} role="img">
      <div className="relative grid grid-cols-3">
        <span className="absolute left-[16.6%] right-[16.6%] top-[22px] h-px bg-line-strong" aria-hidden="true" />
        {HOLDERS.map(([key, label, Icon]) => {
          const here = key === at;
          return (
            <div key={key} className="relative flex flex-col items-center">
              <span className={`relative z-10 flex h-11 w-[30px] items-center justify-center border ${here ? "border-gold bg-gold/15" : "border-dashed border-line-strong bg-ink"}`}>
                {here ? (locked ? <Lock size={13} className="text-gold" /> : <span className="h-5 w-3 bg-paper/80" />) : <Icon size={12} className="text-muted" />}
              </span>
              <span className={`mt-1.5 text-[11px] ${here ? "font-semibold text-gold" : "text-muted"}`}>{label}</span>
            </div>
          );
        })}
      </div>
      {note && <p className="mt-2 text-[12px] text-muted">{note}</p>}
    </div>
  );
}

/** AGAINST MARKET. Collectors read a price against the card's market value first; both numbers come from production. */
export function MarketDelta({ price, value }: { price: number | null; value: number | null }) {
  if (price === null || value === null || value <= 0) return null;
  const d = Math.round(((price - value) / value) * 100);
  if (Math.abs(d) < 1) return <p className="mt-1 text-[12px] font-semibold text-paper-dim">At market value</p>;
  const under = d < 0;
  return (
    <p className={`mt-1 text-[12px] font-semibold ${under ? "text-ok" : "text-muted"}`}>
      {Math.abs(d)}% {under ? "under" : "over"} market value
    </p>
  );
}

/**
 * A trade, composed as the pairing it is: their slab on the left, an empty slot for one of yours on the right.
 * The slot is the offer you would make; it stays empty because sign-in is off.
 */
export function TradePair({ children, owner }: { children: React.ReactNode; owner?: React.ReactNode }) {
  return (
    <article className="rise grid grid-cols-[minmax(0,1fr)_28px_minmax(0,0.8fr)] items-start gap-2 sm:gap-4">
      <div>{children}</div>
      <div className="flex h-full items-start justify-center pt-[38%]" aria-hidden="true">
        <ArrowLeftRight size={22} className="text-gold" />
      </div>
      <div>
        <div className="flex aspect-[5/7.4] items-center justify-center border border-dashed border-line-strong bg-velvet/60">
          <span className="px-3 text-center font-display text-sm font-semibold italic text-muted">Your card</span>
        </div>
        <p className="mt-3 text-[12.5px] leading-snug text-muted">Offer one of yours. The owner accepts or declines.</p>
        {owner}
      </div>
    </article>
  );
}
