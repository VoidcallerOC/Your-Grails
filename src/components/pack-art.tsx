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
 * Pack detail stage. Server-renders the flat art. In the browser, Three.js loads on demand (pack detail only)
 * and adds depth and tilt. The printed face keeps the artwork's exact pixels (see src/lib/pack-gl.js).
 * Reduced motion or no WebGL keeps the flat art.
 */
export function PackStage({ tier, name }: { tier: string; name: string }) {
  const src = packArtSrc(tier);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptr = useRef({ x: 0, y: 0, z: 0 });
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!src) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const probe = document.createElement("canvas");
    if (reduce || !(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
    let raf = 0;
    let engine: { frame(t: number): void; setPointer(p: unknown): void; dispose(): void } | null = null;
    let cancelled = false;
    import("@/lib/pack-gl")
      .then(({ createPackEngine }) => {
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        engine = createPackEngine(canvas, { src, tier: tier.toLowerCase(), mode: "idle" });
        setLive(true);
        const loop = (t: number) => {
          engine?.setPointer(ptr.current);
          engine?.frame(t);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      })
      .catch(() => setLive(false));
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      engine?.dispose();
    };
  }, [src, tier]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ptr.current = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1, z: 1 };
  };

  return (
    <div
      className="relative mx-auto aspect-[2/3] w-full max-w-[420px]"
      onPointerMove={onMove}
      onPointerLeave={() => (ptr.current = { x: 0, y: 0, z: 0 })}
    >
      <div className={live ? "invisible" : ""}>
        <PackArt tier={tier} name={name} eager />
      </div>
      <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${live ? "" : "hidden"}`} aria-hidden="true" />
    </div>
  );
}
