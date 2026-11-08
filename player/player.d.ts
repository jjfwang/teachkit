// TypeScript definitions for player/player.js — animath browser player.
// DOM-free: the container is a minimal structural interface, so these types
// compile with --lib es2020 only (no DOM lib reference needed).
export interface PlayerContainer {
  innerHTML: string;
  className: string;
  setAttribute(name: string, value: string): void;
  addEventListener(type: string, listener: (...args: unknown[]) => void): void;
  appendChild(child: unknown): unknown;
}
// The animation spec document (see SPEC.md v0.1 and "Animation spec v0.2";
// player/validate.js is the authoritative runtime checker). Index signature
// keeps the type honest about author-added fields on shape/step records.
export interface AnimathSpec {
  animath: '0.1' | '0.2';
  title: string;
  level: string;
  subject: string;
  topic: string;
  kind: string;
  canvas: { width: number; height: number };
  scenes: unknown[];
  [key: string]: unknown;
}
export interface PlayerController {
  spec: AnimathSpec;
  play(): void;
  pause(): void;
  restart(): void;
  nextScene(): void;
  prevScene(): void;
  seekScene(index: number, ms?: number): void;
  setSpeed(x: number): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
  destroy(): void;
}
export function mount(container: PlayerContainer, spec: AnimathSpec): PlayerController;
export const version: string;
export interface LatexFit {
  width: number;
  height: number;
  scale: number;
}
export interface TipPoint {
  x: number;
  y: number;
}
/** @internal */ export interface AxesGeometry {
  /** @internal */ mapX(v: number): number;
  /** @internal */ mapY(v: number): number;
  /** @internal */ xAxisY: number;
  /** @internal */ yAxisX: number;
  /** @internal */ xTicks: number[];
  /** @internal */ yTicks: number[];
}
/** @internal */ export interface PlayerInternals {
/** @internal */ katexAvailable(katex: unknown): boolean;
/** @internal */ latexFallbackText(tex: string): string;
/** @internal */ latexFit(contentW: number, contentH: number, availW: number): LatexFit;
/** @internal */ fitLatex(node: unknown, availW: number): unknown;
/** @internal */ stripLabels(scenes: unknown): unknown;
/** @internal */ stripAria(index: number, scene: unknown): unknown;
/** @internal */ fullCaption(scene: unknown): string;
/** @internal */ keyAction(eventLike: unknown): string | null;
/** @internal */ controlButtons(): unknown[];
/** @internal */ shortcutHint(): string;
/** @internal */ prefersReducedMotion(matcher: unknown): boolean;
/** @internal */ interpFields(from: unknown, to: unknown, p: number): unknown;
/** @internal */ applyPos(node: unknown, shape: unknown, pos: unknown): void;
/** @internal */ sectorPath(shape: unknown): string;
/** @internal */ dashAttr(shape: unknown): unknown;
/** @internal */ taperShaft(shape: unknown, wt: number, wh: number, headSize: number): unknown;
/** @internal */ isWidths(x: unknown): boolean;
/** @internal */ explainText(shape: unknown): string;
/** @internal */ tipPoint(px: number, py: number, stageW: number, stageH: number): TipPoint;
/** @internal */ applyEasing(name: string, p: number): number;
/** @internal */ samplePolynomial(shape: unknown): number[][];
/** @internal */ pathPoints(shape: unknown): number[][];
/** @internal */ polylineLength(points: number[][]): number;
/** @internal */ pointAtProgress(points: number[][], progress: number): number[];
/** @internal */ partialPolyline(points: number[][], frac: number): number[][];
/** @internal */ polylinePath(points: number[][]): string;
/** @internal */ markerPos(shape: unknown, points: number[][], progress: number): Record<string, number>;
/** @internal */ axesGeometry(shape: unknown): AxesGeometry;
}
/** @internal */ export const internals: PlayerInternals;
