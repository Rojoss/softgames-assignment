import { lerp } from "@/utils/lerp";

const DEFAULT_ALPHA = 1;

export interface ColorStop {
  progress: number;
  tint: number;
  alpha?: number;
}

export interface ResolvedColorStop {
  progress: number;
  tint: number;
  alpha: number;
}

export function resolveColorStops(colorStops: readonly ColorStop[]): ResolvedColorStop[] {
  if (colorStops.length === 0) {
    return [
      {
        progress: 0,
        tint: 0xffffff,
        alpha: 0,
      },
    ];
  }

  return [...colorStops]
    .map((colorStop) => ({
      progress: clamp(colorStop.progress, 0, 1),
      tint: colorStop.tint,
      alpha: clamp(colorStop.alpha ?? DEFAULT_ALPHA, 0, 1),
    }))
    .sort((left, right) => left.progress - right.progress);
}

export function lerpColorStops(colorStops: readonly ResolvedColorStop[], progress: number): ResolvedColorStop {
  const firstColorStop = colorStops[0];

  if (colorStops.length === 1 || progress <= firstColorStop.progress) {
    return firstColorStop;
  }

  const lastColorStop = colorStops[colorStops.length - 1];

  if (progress >= lastColorStop.progress) {
    return lastColorStop;
  }

  for (let index = 1; index < colorStops.length; index += 1) {
    const toStop = colorStops[index];

    if (progress > toStop.progress) {
      continue;
    }

    const fromStop = colorStops[index - 1];
    const localProgress = (progress - fromStop.progress) / (toStop.progress - fromStop.progress);

    return {
      progress,
      tint: lerpColor(fromStop.tint, toStop.tint, localProgress),
      alpha: lerp(fromStop.alpha, toStop.alpha, localProgress),
    };
  }

  return lastColorStop;
}

function lerpColor(from: number, to: number, progress: number): number {
  const fromRed = (from >> 16) & 0xff;
  const fromGreen = (from >> 8) & 0xff;
  const fromBlue = from & 0xff;

  const toRed = (to >> 16) & 0xff;
  const toGreen = (to >> 8) & 0xff;
  const toBlue = to & 0xff;

  return (
    (Math.round(lerp(fromRed, toRed, progress)) << 16) |
    (Math.round(lerp(fromGreen, toGreen, progress)) << 8) |
    Math.round(lerp(fromBlue, toBlue, progress))
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
