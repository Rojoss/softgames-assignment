import { Ease } from "@/services/tweens/Ease";
import { type Tween } from "@/services/tweens/Tween";
import { TweenManager } from "@/services/tweens/TweenManager";
import { Container } from "pixi.js";

interface EnterAnimationOptions {
  target: Container;
  finalX: number;
  finalY: number;
  direction: number;
  delay?: number;
}

interface ExitAnimationOptions {
  target: Container;
  direction: number;
  onComplete: () => void;
}

/**
 * Handles enter and exit motion for the Magic Words scene UI.
 */
export class MagicWordsAnimator {
  private static readonly ENTER_OFFSET_X = 44;
  private static readonly ENTER_OFFSET_Y = 10;
  private static readonly EXIT_OFFSET_X = 28;
  private static readonly EXIT_OFFSET_Y = 6;
  private static readonly ENTER_START_SCALE = 0.94;
  private static readonly EXIT_END_SCALE = 0.96;
  private static readonly TWEEN_IN_DURATION_MS = 260;
  private static readonly TWEEN_OUT_DURATION_MS = 180;

  private readonly activeTweens: Tween<unknown>[] = [];

  constructor(private readonly tweenManager: TweenManager) {}

  public clear(): void {
    this.activeTweens.splice(0).forEach((tween) => {
      this.tweenManager.remove(tween);
    });
  }

  public animateIn(options: EnterAnimationOptions): void {
    const { target, finalX, finalY, direction, delay = 0 } = options;
    const startX = finalX + direction * MagicWordsAnimator.ENTER_OFFSET_X;
    const startY = finalY + MagicWordsAnimator.ENTER_OFFSET_Y;

    target.visible = true;
    target.alpha = 0;
    target.scale.set(MagicWordsAnimator.ENTER_START_SCALE);
    target.position.set(startX, startY);

    const tween = this.tweenManager.add({
      target,
      duration: MagicWordsAnimator.TWEEN_IN_DURATION_MS,
      delay,
      ease: Ease.easeOutBack,
      onUpdate: (displayObject, activeTween) => {
        const progress = activeTween.easedProgress;

        displayObject.alpha = progress;
        displayObject.x = this.interpolate(startX, finalX, progress);
        displayObject.y = this.interpolate(startY, finalY, progress);

        const scale = this.interpolate(MagicWordsAnimator.ENTER_START_SCALE, 1, progress);

        displayObject.scale.set(scale);
      },
      onCancel: (displayObject) => {
        this.resetDisplayObject(displayObject, finalX, finalY);
      },
      onComplete: (displayObject) => {
        this.resetDisplayObject(displayObject, finalX, finalY);
      },
    });

    this.activeTweens.push(tween as Tween<unknown>);
  }

  public animateOut(options: ExitAnimationOptions): void {
    const { target, direction, onComplete } = options;
    const startX = target.x;
    const startY = target.y;
    const endX = startX + direction * MagicWordsAnimator.EXIT_OFFSET_X;
    const endY = startY - MagicWordsAnimator.EXIT_OFFSET_Y;

    const tween = this.tweenManager.add({
      target,
      duration: MagicWordsAnimator.TWEEN_OUT_DURATION_MS,
      ease: Ease.easeInCubic,
      onUpdate: (displayObject, activeTween) => {
        const progress = activeTween.easedProgress;

        displayObject.alpha = 1 - progress;
        displayObject.x = this.interpolate(startX, endX, progress);
        displayObject.y = this.interpolate(startY, endY, progress);

        const scale = this.interpolate(1, MagicWordsAnimator.EXIT_END_SCALE, progress);

        displayObject.scale.set(scale);
      },
      onCancel: (displayObject) => {
        this.resetDisplayObject(displayObject, startX, startY);
      },
      onComplete: (displayObject) => {
        this.resetDisplayObject(displayObject, startX, startY);
        onComplete();
      },
    });

    this.activeTweens.push(tween as Tween<unknown>);
  }

  private resetDisplayObject(target: Container, x: number, y: number): void {
    target.alpha = 1;
    target.scale.set(1);
    target.position.set(x, y);
  }

  private interpolate(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }
}
