import { useEffect, useRef, useState } from "react";
import { packArtSrc } from "@/lib/packs";

/** Flat pack art: exact pixels, no filters. Used on lists and the homepage. */
export function PackArt({ tier, name, eager = false }: { tier: string; name: string; eager?: boolean }) {
  const src = packArtSrc(tier);
  if (!src) return <div className="flex aspect-[2/3] items-center justify-center text-sm text-muted">{name}</div>;
  return (
    <img
      src={src}
      alt={`${name} pack`}
      width={600}
      height={900}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className="mx-auto aspect-[2/3] h-auto w-full object-contain"
    />
  );
}

/**
 * The pack as a rendered 3D object. Server-renders the flat art; in the browser, Three.js loads on demand and replaces it
 * with the extruded pouch, floating and following the pointer. The printed face keeps the artwork's exact pixels
 * (see src/lib/pack-gl.js). Reduced motion or no WebGL keeps the flat art. Rendering pauses while off-screen.
 */
export function LivePack({
  tier,
  name,
  eager = false,
  phase = 0,
  amp = 1,
  minWidth = 0,
}: {
  tier: string;
  name: string;
  eager?: boolean;
  phase?: number;
  /** Float strength: 1 on the packs pages, lower where the pack sits beside other content. */
  amp?: number;
  /** Only go live at or above this viewport width (px); narrower screens keep the flat art. */
  minWidth?: number;
}) {
  const src = packArtSrc(tier);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptr = useRef({ x: 0, y: 0, z: 0 });
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!src) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const probe = document.createElement("canvas");
    if (reduce || window.innerWidth < minWidth || !(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
    let raf = 0;
    let onScreen = true;
    let engine: { frame(t: number): void; setPointer(p: unknown): void; dispose(): void } | null = null;
    let cancelled = false;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    if (boxRef.current) io.observe(boxRef.current);
    import("@/lib/pack-gl")
      .then(({ createPackEngine }) => {
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        engine = createPackEngine(canvas, { src, tier: tier.toLowerCase(), mode: "idle", phase, amp });
        setLive(true);
        const loop = (t: number) => {
          if (onScreen) {
            engine?.setPointer(ptr.current);
            engine?.frame(t);
          }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      })
      .catch(() => setLive(false));
    return () => {
      cancelled = true;
      io.disconnect();
      cancelAnimationFrame(raf);
      engine?.dispose();
    };
  }, [src, tier, phase, amp, minWidth]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ptr.current = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1, z: 1 };
  };

  return (
    <div
      ref={boxRef}
      data-live={live || undefined}
      className="relative aspect-[2/3] w-full"
      onPointerMove={onMove}
      onPointerLeave={() => (ptr.current = { x: 0, y: 0, z: 0 })}
    >
      <div className={live ? "invisible" : ""}>
        <PackArt tier={tier} name={name} eager={eager} />
      </div>
      <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${live ? "" : "hidden"}`} aria-hidden="true" />
    </div>
  );
}

/** Pack detail stage: the live pack at its largest. */
export function PackStage({ tier, name }: { tier: string; name: string }) {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <LivePack tier={tier} name={name} eager />
    </div>
  );
}
