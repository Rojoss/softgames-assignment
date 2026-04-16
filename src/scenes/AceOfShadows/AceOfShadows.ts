import { Container } from "pixi.js";

import { Card } from "@/scenes/AceOfShadows/Card";
import { CardAnimationService } from "@/scenes/AceOfShadows/CardAnimationService";
import { CardPile } from "@/scenes/AceOfShadows/CardPile";
import { Scene } from "@/scenes/Scene";
import { ACE_OF_SHADOWS_CARDS } from "@/scenes/AceOfShadows/cards";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/services/window/AutoScaler";
import type { SceneManager } from "@/services/scenes/SceneManager";
import { BackButton } from "@/ui/BackButton";
import { shuffleArray } from "@/utils/shuffleArray";

const TRANSFER_INTERVAL_MS = 1000;
const CARD_HORIZONTAL_OFFSET = 300;

export class AceOfShadows extends Scene {
  private readonly leftPile = new CardPile();
  private readonly rightPile = new CardPile(true);
  private readonly animationLayer = new Container();
  private readonly cardAnimations = new CardAnimationService(this.animationLayer);

  private transferIntervalId?: number;

  constructor(sceneManager: SceneManager) {
    super(sceneManager);
  }

  protected async load(): Promise<void> {
    // Create back button
    const backButton = new BackButton();
    backButton.position.set(VIEWPORT_WIDTH / 2, 48 + (BackButton.HEIGHT + BackButton.SHADOW_OFFSET_Y) / 2);
    backButton.on("pointertap", () => {
      void this.sceneManager.switchTo("MainMenu");
    });
    this.addChild(backButton);

    // Create card piles
    this.leftPile.position.set(VIEWPORT_WIDTH / 2 - CARD_HORIZONTAL_OFFSET, VIEWPORT_HEIGHT / 2);
    this.rightPile.position.set(VIEWPORT_WIDTH / 2 + CARD_HORIZONTAL_OFFSET, VIEWPORT_HEIGHT / 2);
    this.addChild(this.leftPile, this.rightPile, this.animationLayer);

    // Add shuffled cards to left pile
    shuffleArray(ACE_OF_SHADOWS_CARDS).forEach((cardType) => {
      this.leftPile.addCard(new Card(cardType));
    });

    // Initialize card piles
    this.leftPile.setOpen(false);
    this.rightPile.setOpen(true);
    this.leftPile.flipTopCard("open");

    this.on("added", this.handleAddedToStage);
    this.on("removed", this.handleRemovedFromStage);

    return Promise.resolve();
  }

  protected override unload(): void {
    this.stopTransferLoop();
  }

  private readonly handleAddedToStage = (): void => {
    this.startTransferLoop();
  };

  private readonly handleRemovedFromStage = (): void => {
    this.stopTransferLoop();
  };

  private startTransferLoop(): void {
    if (this.transferIntervalId !== undefined) {
      return;
    }

    this.transferIntervalId = window.setInterval(() => {
      void this.transferTopCard();
    }, TRANSFER_INTERVAL_MS);
  }

  private stopTransferLoop(): void {
    if (this.transferIntervalId === undefined) {
      return;
    }

    window.clearInterval(this.transferIntervalId);
    this.transferIntervalId = undefined;
  }

  private transferTopCard(): void {
    this.cardAnimations.transferTopCard(this.leftPile, this.rightPile, (card) => {
      if (!card || !this.leftPile.hasCards()) {
        this.stopTransferLoop();
      }
    });
  }
}
