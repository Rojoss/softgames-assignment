import { Ease, type EaseFunction } from "@/services/tweens/Ease";

export interface TweenOptions<TTarget> {
  target: TTarget;
  duration: number;
  delay?: number;
  ease?: EaseFunction;
  onUpdate: TweenUpdateCallback<TTarget>;
  onComplete?: TweenCompleteCallback<TTarget>;
}

export type TweenUpdateCallback<TTarget> = (target: TTarget, tween: Tween<TTarget>) => void;
export type TweenCompleteCallback<TTarget> = (target: TTarget, tween: Tween<TTarget>) => void;

/**
 * Stores the state and callbacks for a single tween.
 */
export class Tween<TTarget> {
  public readonly target: TTarget;
  public readonly duration: number;
  public readonly delay: number;
  public readonly ease: EaseFunction;

  private readonly onUpdate: TweenUpdateCallback<TTarget>;
  private readonly onComplete?: TweenCompleteCallback<TTarget>;

  private remainingDelay: number;
  private elapsedMS = 0;
  private hasStarted = false;
  private isCompleted = false;

  constructor(options: TweenOptions<TTarget>) {
    this.target = options.target;
    this.duration = normalizeTime(options.duration);
    this.delay = normalizeTime(options.delay);
    this.ease = options.ease ?? Ease.linear;
    this.onUpdate = options.onUpdate;
    this.onComplete = options.onComplete;
    this.remainingDelay = this.delay;
  }

  public get elapsedTime(): number {
    return this.elapsedMS;
  }

  public get progress(): number {
    if (!this.hasStarted) {
      return 0;
    }

    if (this.duration === 0) {
      return 1;
    }

    return Math.min(this.elapsedMS / this.duration, 1);
  }

  public get easedProgress(): number {
    return this.ease(this.progress);
  }

  public get started(): boolean {
    return this.hasStarted;
  }

  public get completed(): boolean {
    return this.isCompleted;
  }

  public get remainingDelayTime(): number {
    return this.remainingDelay;
  }

  /**
   * Advances the tween using elapsed milliseconds.
   */
  public update(deltaMS: number): void {
    if (this.isCompleted) {
      return;
    }

    let remainingDeltaMS = normalizeTime(deltaMS);

    if (!this.hasStarted && this.remainingDelay > 0) {
      const delayStep = Math.min(this.remainingDelay, remainingDeltaMS);

      this.remainingDelay -= delayStep;
      remainingDeltaMS -= delayStep;

      if (this.remainingDelay > 0) {
        return;
      }
    }

    this.hasStarted = true;

    if (this.duration === 0) {
      this.finish();
      return;
    }

    this.elapsedMS = Math.min(this.elapsedMS + remainingDeltaMS, this.duration);

    if (this.elapsedMS >= this.duration) {
      this.finish();
      return;
    }

    this.onUpdate(this.target, this);
  }

  /**
   * Immediately completes the tween and runs its completion callback.
   */
  public complete(): void {
    if (this.isCompleted) {
      return;
    }

    this.finish();
  }

  private finish(): void {
    this.hasStarted = true;
    this.remainingDelay = 0;
    this.elapsedMS = this.duration;
    this.onUpdate(this.target, this);
    this.isCompleted = true;
    this.onComplete?.(this.target, this);
  }
}

function normalizeTime(value?: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(value, 0);
}
