import { Container, Point, type PointData } from "pixi.js";

import { Card } from "@/scenes/AceOfShadows/Card";
import { CardPile } from "@/scenes/AceOfShadows/CardPile";
import { degreesToRadians } from "@/utils/degreesToRadians";
import { getRandomInRange } from "@/utils/getRandomInRange";
import { getRandomOffset } from "@/utils/getRandomOffset";
import { lerp } from "@/utils/lerp";
import { Ease } from "@/services/tweens/Ease";
import { TweenManager } from "@/services/tweens/TweenManager";

const LAND_OFFSET_RANGE = 50;
const LAND_ROTATION_RANGE_DEGREES = 10;

const MOVE_DURATION_MS = 2000;
const MOVE_LIFT_PX = 36;
const MOVE_ROTATION = 0.06;

const FLIP_DELAY_MS = 650;
const FLIP_DURATION_MS = 320;

/**
 * Provides small, reusable card and pile animations built on the shared tween manager.
 */
export class CardAnimationService {
  constructor(
    private readonly animationLayer: Container,
    private readonly tweenManager: TweenManager = TweenManager.shared,
  ) {}

  /**
   * Runs a quick horizontal card flip by collapsing and restoring the x scale.
   */
  public async flipCard(card: Card, side: "open" | "close", delay = 0): Promise<void> {
    const halfDuration = FLIP_DURATION_MS / 2;
    const baseScaleX = Math.abs(card.scale.x);

    await this.tweenManager.addAsync({
      target: card.scale,
      duration: halfDuration,
      delay,
      ease: Ease.easeInQuad,
      onUpdate: (scale, tween) => {
        scale.x = lerp(baseScaleX, 0, tween.easedProgress);
      },
    });

    card.flip(side);

    await this.tweenManager.addAsync({
      target: card.scale,
      duration: halfDuration,
      ease: Ease.easeOutQuad,
      onUpdate: (scale, tween) => {
        scale.x = lerp(0, baseScaleX, tween.easedProgress);
      },
    });
  }

  /**
   * Moves a card along a short eased arc.
   */
  public moveCard(card: Card, from: PointData, to: PointData, endRotation: number): Promise<void> {
    const startPosition = new Point(from.x, from.y);
    const targetPosition = new Point(to.x, to.y);
    const startRotation = card.rotation;

    card.position.copyFrom(startPosition);

    return this.tweenManager.addAsync({
      target: card,
      duration: MOVE_DURATION_MS,
      ease: Ease.easeInOutCubic,
      onUpdate: (movingCard, tween) => {
        const progress = tween.easedProgress;
        const arcOffsetY = Math.sin(progress * Math.PI) * MOVE_LIFT_PX;

        movingCard.position.set(lerp(startPosition.x, targetPosition.x, progress), lerp(startPosition.y, targetPosition.y, progress) - arcOffsetY);
        movingCard.rotation = lerp(startRotation, endRotation, progress) + Math.sin(progress * Math.PI) * MOVE_ROTATION;
      },
      onComplete: (movingCard) => {
        movingCard.position.copyFrom(targetPosition);
        movingCard.rotation = endRotation;
      },
    });
  }

  /**
   * Runs the common source move, source reveal, and target landing sequence for the top card.
   */
  public async transferTopCard(sourcePile: CardPile, targetPile: CardPile): Promise<Card | undefined> {
    const sourceTopCard = sourcePile.getTopCard();

    if (!sourceTopCard) {
      return undefined;
    }

    const startWorldPosition = sourceTopCard.getGlobalPosition(new Point());
    const landingBasePosition = targetPile.getNextCardPosition();
    const landingOffset = getRandomOffset(LAND_OFFSET_RANGE);
    const landingRotation = degreesToRadians(getRandomInRange(-LAND_ROTATION_RANGE_DEGREES, LAND_ROTATION_RANGE_DEGREES));
    const landingPosition = new Point(landingBasePosition.x + landingOffset.x, landingBasePosition.y + landingOffset.y);
    const landingWorldPosition = targetPile.toGlobal(landingPosition);
    const movingCard = sourcePile.removeCard();

    if (!movingCard) {
      return undefined;
    }

    movingCard.flip("open");

    this.animationLayer.addChild(movingCard);
    movingCard.position.copyFrom(this.animationLayer.toLocal(startWorldPosition));

    const movePromise = this.moveCard(movingCard, movingCard.position, this.animationLayer.toLocal(landingWorldPosition), landingRotation);

    const nextSourceCard = sourcePile.getTopCard();
    const revealPromise = nextSourceCard ? this.flipCard(nextSourceCard, "open", FLIP_DELAY_MS) : Promise.resolve();

    await movePromise;

    const currentWorldPosition = movingCard.getGlobalPosition(new Point());

    targetPile.addCard(movingCard);
    movingCard.position.copyFrom(targetPile.toLocal(currentWorldPosition));

    await revealPromise;

    return movingCard;
  }
}
