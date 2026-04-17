import { Container, Point, type PointData } from "pixi.js";

import { Card } from "@/scenes/AceOfShadows/Card";
import { CardPile } from "@/scenes/AceOfShadows/CardPile";
import { degreesToRadians } from "@/utils/degreesToRadians";
import { getRandomOffset } from "@/utils/getRandomOffset";
import { Ease } from "@/services/tweens/Ease";
import { TweenManager } from "@/services/tweens/TweenManager";
import { getRandomInRange } from "@/utils/getRandomInRange";
import { lerp } from "@/utils/lerp";

const LAND_OFFSET_RANGE = 70;
const LAND_ROTATION_RANGE_DEGREES = 16;

const MOVE_DURATION_MS = 1800;
const MOVE_DURATION_VARIANCE_MS = 300;
const MOVE_LIFT_PX = 68;
const MOVE_LIFT_VARIANCE_PX = 22;
const MOVE_SWAY_PX = 52;
const MOVE_ROTATION = 0.12;
const MOVE_ROTATION_VARIANCE = 0.05;
const MOVE_SCALE_BOOST = 0.16;
const MOVE_SCALE_BOOST_VARIANCE = 0.06;

const FLIP_DELAY_MS = 650;
const FLIP_DURATION_MS = 320;

interface CardMoveProfile {
  duration: number;
  lift: number;
  sway: number;
  rotationAmplitude: number;
  scaleBoost: number;
}

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
  private flipCard(card: Card, side: "open" | "close", delay = 0, onComplete?: () => void): void {
    const halfDuration = FLIP_DURATION_MS / 2;
    const baseScaleX = Math.abs(card.scale.x);

    this.tweenManager.add({
      target: card.scale,
      duration: halfDuration,
      delay,
      ease: Ease.easeInQuad,
      onUpdate: (scale, tween) => {
        scale.x = lerp(baseScaleX, 0, tween.easedProgress);
      },
      onComplete: () => {
        card.flip(side);

        this.tweenManager.add({
          target: card.scale,
          duration: halfDuration,
          ease: Ease.easeOutQuad,
          onUpdate: (scale, tween) => {
            scale.x = lerp(0, baseScaleX, tween.easedProgress);
          },
          onComplete: () => {
            onComplete?.();
          },
        });
      },
    });
  }

  /**
   * Moves a card along a short eased arc.
   */
  private moveCard(card: Card, from: PointData, to: PointData, endRotation: number, moveProfile: CardMoveProfile, onComplete?: () => void): void {
    const startPosition = new Point(from.x, from.y);
    const targetPosition = new Point(to.x, to.y);
    const startRotation = card.rotation;
    const startScaleX = card.scale.x;
    const startScaleY = card.scale.y;

    card.position.copyFrom(startPosition);

    this.tweenManager.add({
      target: card,
      duration: moveProfile.duration,
      ease: Ease.easeInOutCubic,
      onUpdate: (movingCard, tween) => {
        const progress = tween.easedProgress;
        const arcProgress = Math.sin(progress * Math.PI);
        const wobbleProgress = Math.sin(progress * Math.PI * 2);
        const arcOffsetX = arcProgress * moveProfile.sway;
        const arcOffsetY = arcProgress * moveProfile.lift;
        const scaleBoost = 1 + arcProgress * moveProfile.scaleBoost;

        movingCard.position.set(
          lerp(startPosition.x, targetPosition.x, progress) + arcOffsetX,
          lerp(startPosition.y, targetPosition.y, progress) - arcOffsetY,
        );
        movingCard.rotation =
          lerp(startRotation, endRotation, progress) +
          arcProgress * moveProfile.rotationAmplitude +
          wobbleProgress * moveProfile.rotationAmplitude * 0.35;
        movingCard.scale.set(startScaleX * scaleBoost, startScaleY * scaleBoost);
      },
      onComplete: (movingCard) => {
        movingCard.position.copyFrom(targetPosition);
        movingCard.rotation = endRotation;
        movingCard.scale.set(startScaleX, startScaleY);
        onComplete?.();
      },
    });
  }

  private createMoveProfile(): CardMoveProfile {
    return {
      duration: MOVE_DURATION_MS + getRandomInRange(-MOVE_DURATION_VARIANCE_MS, MOVE_DURATION_VARIANCE_MS),
      lift: MOVE_LIFT_PX + getRandomInRange(-MOVE_LIFT_VARIANCE_PX, MOVE_LIFT_VARIANCE_PX),
      sway: getRandomInRange(-MOVE_SWAY_PX, MOVE_SWAY_PX),
      rotationAmplitude: MOVE_ROTATION + getRandomInRange(-MOVE_ROTATION_VARIANCE, MOVE_ROTATION_VARIANCE),
      scaleBoost: MOVE_SCALE_BOOST + getRandomInRange(-MOVE_SCALE_BOOST_VARIANCE, MOVE_SCALE_BOOST_VARIANCE),
    };
  }

  /**
   * Runs the common source move, source reveal, and target landing sequence for the top card.
   */
  public transferTopCard(sourcePile: CardPile, targetPile: CardPile, onComplete?: (card?: Card) => void): void {
    const sourceTopCard = sourcePile.getTopCard();

    if (!sourceTopCard) {
      onComplete?.();
      return;
    }

    const startWorldPosition = sourceTopCard.getGlobalPosition(new Point());
    const landingBasePosition = targetPile.getNextCardPosition();
    const landingOffset = getRandomOffset(LAND_OFFSET_RANGE);
    const landingRotation = degreesToRadians(getRandomInRange(-LAND_ROTATION_RANGE_DEGREES, LAND_ROTATION_RANGE_DEGREES));
    const landingPosition = new Point(landingBasePosition.x + landingOffset.x, landingBasePosition.y + landingOffset.y);
    const landingWorldPosition = targetPile.toGlobal(landingPosition);
    const moveProfile = this.createMoveProfile();
    const movingCard = sourcePile.removeCard();

    if (!movingCard) {
      onComplete?.();
      return;
    }

    movingCard.flip("open");

    this.animationLayer.addChild(movingCard);
    movingCard.position.copyFrom(this.animationLayer.toLocal(startWorldPosition));

    const nextSourceCard = sourcePile.getTopCard();
    if (nextSourceCard) {
      this.flipCard(nextSourceCard, "open", FLIP_DELAY_MS);
    }

    this.moveCard(movingCard, movingCard.position, this.animationLayer.toLocal(landingWorldPosition), landingRotation, moveProfile, () => {
      const currentWorldPosition = movingCard.getGlobalPosition(new Point());

      targetPile.addCard(movingCard);
      movingCard.position.copyFrom(targetPile.toLocal(currentWorldPosition));
      onComplete?.(movingCard);
    });
  }
}
