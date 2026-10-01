export function createPackEngine(
  canvas: HTMLCanvasElement,
  opts: { src: string; tier: string; mode?: "idle" | "rip"; pose?: unknown; phase?: number; ripBeat?: string | null; slabSrc?: string | null },
): {
  frame(now: number): void;
  setPointer(p: unknown): void;
  setBeat(beat: string | null): void;
  setPose(pose: unknown): void;
  setSlab(url: string | null): void;
  setReduce(v: boolean): void;
  resize(): void;
  dispose(): void;
};
