import { Card } from "@/scenes/AceOfShadows/Card";
import { CardPile } from "@/scenes/AceOfShadows/CardPile";
import { Scene } from "@/scenes/Scene";
import { ACE_OF_SHADOWS_CARDS } from "@/scenes/AceOfShadows/cards";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "@/services/window/AutoScaler";
import type { SceneManager } from "@/services/scenes/SceneManager";
import { BackButton } from "@/ui/BackButton";
import { shuffleArray } from "@/utils/shuffleArray";

const CARD_PILE_LEFT_X = VIEWPORT_WIDTH / 2 - 300;
const CARD_PILE_RIGHT_X = VIEWPORT_WIDTH / 2 + 300;
const CARD_PILE_Y = VIEWPORT_HEIGHT / 2 + 32;
const TRANSFER_INTERVAL_MS = 1000;

export class AceOfShadows extends Scene {
  private readonly leftPile = new CardPile();
  private readonly rightPile = new CardPile();

  private transferIntervalId?: number;

  constructor(sceneManager: SceneManager) {
    super(sceneManager);
  }

  protected async load(): Promise<void> {
    const backButton = new BackButton();
    backButton.position.set(VIEWPORT_WIDTH / 2, 48 + (BackButton.HEIGHT + BackButton.SHADOW_OFFSET_Y) / 2);
    backButton.on("pointertap", () => {
      void this.sceneManager.switchTo("MainMenu");
    });
    this.addChild(backButton);

    this.leftPile.position.set(CARD_PILE_LEFT_X, CARD_PILE_Y);
    this.rightPile.position.set(CARD_PILE_RIGHT_X, CARD_PILE_Y);
    this.addChild(this.leftPile, this.rightPile);

    shuffleArray(ACE_OF_SHADOWS_CARDS).forEach((cardType) => {
      this.leftPile.addCard(new Card(cardType));
    });

    this.leftPile.setOpen(false);
    this.rightPile.setOpen(true);
    this.leftPile.flipTopCard("open");

    this.on("added", this.handleAddedToStage);
    this.on("removed", this.handleRemovedFromStage);

    return Promise.resolve();
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
      this.transferTopCard();
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
    const card = this.leftPile.removeCard();

    if (!card) {
      this.stopTransferLoop();
      return;
    }

    card.flip("open");
    this.rightPile.addCard(card);

    if (this.leftPile.hasCards()) {
      this.leftPile.flipTopCard("open");
      return;
    }

    this.stopTransferLoop();
  }
}
