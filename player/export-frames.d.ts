// TypeScript definitions for player/export-frames.js — DOM-free deterministic per-frame SVG rendering for export.
// v0.2 (issue #1648 follow-up) mirrors the bounded curve / trajectory extension in the same contract.
export const version: string;
export function shapeMarkup(shape: Record<string, unknown>): string;
export function sceneShapes(spec: Record<string, unknown>, sceneIdx: number, ms: number): Record<string, unknown>[];
export function renderFrame(spec: Record<string, unknown>, sceneIdx: number, ms: number): string;
export function frameMs(frameIdx: number, fps: number): number;
export function sceneFrameCount(spec: Record<string, unknown>, sceneIdx: number, fps: number): number;
