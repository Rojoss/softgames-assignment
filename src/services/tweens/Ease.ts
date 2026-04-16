export type EaseFunction = (progress: number) => number;

/**
 * Collection of easing helpers for motion-based tweens.
 */
export class Ease {
  public static linear(progress: number): number {
    return progress;
  }

  public static easeInQuad(progress: number): number {
    return progress * progress;
  }

  public static easeOutQuad(progress: number): number {
    return 1 - (1 - progress) * (1 - progress);
  }

  public static easeInOutQuad(progress: number): number {
    if (progress < 0.5) {
      return 2 * progress * progress;
    }

    return 1 - Math.pow(-2 * progress + 2, 2) / 2;
  }

  public static easeInCubic(progress: number): number {
    return progress * progress * progress;
  }

  public static easeOutCubic(progress: number): number {
    return 1 - Math.pow(1 - progress, 3);
  }

  public static easeInOutCubic(progress: number): number {
    if (progress < 0.5) {
      return 4 * progress * progress * progress;
    }

    return 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }

  public static easeOutBack(progress: number): number {
    const overshoot = 1.70158;
    const scaledProgress = progress - 1;

    return 1 + (overshoot + 1) * Math.pow(scaledProgress, 3) + overshoot * Math.pow(scaledProgress, 2);
  }
}
