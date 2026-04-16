import { Ticker } from "pixi.js";

import { eventBus } from "@/services/events/Events";
import { Tween, type TweenOptions } from "@/services/tweens/Tween";

/**
 * Manages active tweens and advances them on each tick.
 */
export class TweenManager {
  private static sharedInstance?: TweenManager;

  private readonly tweens = new Set<Tween<unknown>>();
  private readonly ticker?: Ticker;
  private readonly unsubscribePause: () => void;
  private readonly unsubscribeResume: () => void;
  private readonly unsubscribeSceneClose: () => void;

  private isPaused = false;

  constructor(ticker?: Ticker) {
    this.ticker = ticker;
    this.ticker?.add(this.handleTick);
    this.unsubscribePause = eventBus.subscribe("pause", this.handlePause);
    this.unsubscribeResume = eventBus.subscribe("resume", this.handleResume);
    this.unsubscribeSceneClose = eventBus.subscribe("sceneClose", this.handleSceneClose);
  }

  /**
   * App-wide tween manager instance for places where dependency injection would be too noisy.
   */
  public static get shared(): TweenManager {
    if (!TweenManager.sharedInstance) {
      throw new Error("TweenManager.shared was accessed before initialization.");
    }

    return TweenManager.sharedInstance;
  }

  public static setShared(tweenManager: TweenManager): void {
    TweenManager.sharedInstance = tweenManager;
  }

  public static clearShared(): void {
    TweenManager.sharedInstance = undefined;
  }

  public get paused(): boolean {
    return this.isPaused;
  }

  public get activeTweenCount(): number {
    return this.tweens.size;
  }

  /**
   * Creates and registers a tween with the manager.
   */
  public add<TTarget>(options: TweenOptions<TTarget>): Tween<TTarget> {
    const tween = new Tween(options);

    return this.register(tween);
  }

  /**
   * Creates and registers a tween, resolving when it completes or is cancelled.
   */
  public addAsync<TTarget>(options: TweenOptions<TTarget>): Promise<void> {
    return new Promise((resolve) => {
      this.add({
        ...options,
        onComplete: (target, tween) => {
          options.onComplete?.(target, tween);
          resolve();
        },
        onCancel: (target, tween) => {
          options.onCancel?.(target, tween);
          resolve();
        },
      });
    });
  }

  /**
   * Registers an existing tween instance with the manager.
   */
  public register<TTarget>(tween: Tween<TTarget>): Tween<TTarget> {
    this.tweens.add(tween as Tween<unknown>);

    return tween;
  }

  public remove(tween: Tween<unknown>): void {
    tween.cancel();
    this.tweens.delete(tween);
  }

  public clear(): void {
    for (const tween of this.tweens) {
      this.remove(tween);
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  /**
   * Advances all active tweens using elapsed milliseconds.
   */
  public update(deltaMS: number): void {
    if (this.isPaused || this.tweens.size === 0) {
      return;
    }

    const completedTweens: Tween<unknown>[] = [];

    for (const tween of this.tweens) {
      tween.update(deltaMS);

      if (tween.completed) {
        completedTweens.push(tween);
      }
    }

    completedTweens.forEach((tween) => {
      this.tweens.delete(tween);
    });
  }

  public destroy(): void {
    this.ticker?.remove(this.handleTick);
    this.unsubscribePause();
    this.unsubscribeResume();
    this.unsubscribeSceneClose();
    this.clear();

    if (TweenManager.sharedInstance === this) {
      TweenManager.clearShared();
    }
  }

  private readonly handlePause = (): void => {
    this.isPaused = true;
  };

  private readonly handleResume = (): void => {
    this.isPaused = false;
  };

  private readonly handleSceneClose = (): void => {
    this.clear();
  };

  private readonly handleTick = (): void => {
    if (!this.ticker) {
      return;
    }

    this.update(this.ticker.deltaMS);
  };
}
