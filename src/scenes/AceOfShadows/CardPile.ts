import { Container, Point } from "pixi.js";

import { Card, type CardSide } from "@/scenes/AceOfShadows/Card";

const DEFAULT_CARD_OFFSET = { x: -20, y: -35 };

/**
 * Stores a stack of cards.
 */
export class CardPile extends Container {
  private readonly cards: Card[] = [];
  private readonly preserveCardPositions: boolean;

  private isOpen = false;
  private topCardSide: CardSide = "close";

  constructor(preserveCardPositions = false) {
    super();

    this.preserveCardPositions = preserveCardPositions;
  }

  public getTopCard(): Card | undefined {
    return this.cards[this.cards.length - 1];
  }

  /**
   * Returns the local position where the next pushed card will land.
   */
  public getNextCardPosition(): Point {
    if (this.preserveCardPositions) {
      return new Point(0, 0);
    }

    return this.cards.length === 0 ? new Point(0, 0) : new Point(DEFAULT_CARD_OFFSET.x, DEFAULT_CARD_OFFSET.y);
  }

  private getSourceTopCardPosition(): Point {
    return this.cards.length > 1 ? new Point(DEFAULT_CARD_OFFSET.x, DEFAULT_CARD_OFFSET.y) : new Point(0, 0);
  }

  /**
   * Adds a card on top of the pile.
   */
  public addCard(card: Card): void {
    if (this.preserveCardPositions) {
      this.cards.push(card);
      card.flip(this.isOpen ? "open" : "close");
      this.addChild(card);
      return;
    }

    const previousTopCard = this.getTopCard();

    if (previousTopCard) {
      previousTopCard.position.set(0, 0);
      previousTopCard.flip(this.isOpen ? "open" : "close");
    }

    this.cards.push(card);

    card.position.copyFrom(this.getSourceTopCardPosition());
    card.flip(this.isOpen || this.topCardSide === "open" ? "open" : "close");
    this.addChild(card);
  }

  /**
   * Removes the current top card from the pile.
   */
  public removeCard(): Card | undefined {
    const card = this.cards.pop();

    this.topCardSide = "close";

    if (!card) {
      return undefined;
    }

    if (this.preserveCardPositions) {
      if (card.parent === this) {
        this.removeChild(card);
      }

      return card;
    }

    if (card.parent === this) {
      this.removeChild(card);
    }

    this.updateSourceTopCard();

    return card;
  }

  /**
   * Sets whether the pile should render face-up or face-down.
   */
  public setOpen(isOpen: boolean): void {
    this.isOpen = isOpen;
    this.topCardSide = isOpen ? "open" : "close";

    if (this.preserveCardPositions) {
      this.cards.forEach((card) => {
        card.flip(this.topCardSide);
      });

      return;
    }

    this.cards.forEach((card) => {
      card.position.set(0, 0);
      card.flip(this.isOpen ? "open" : "close");
    });

    this.updateSourceTopCard();
  }

  /**
   * Flips the top card to the requested side, or toggles it when no side is provided.
   */
  public flipTopCard(side?: CardSide): void {
    const topCard = this.getTopCard();

    if (!topCard) {
      return;
    }

    if (this.isOpen) {
      topCard.flip(side);
      return;
    }

    this.topCardSide = side ?? (this.topCardSide === "open" ? "close" : "open");
    this.updateSourceTopCard();
  }

  public hasCards(): boolean {
    return this.cards.length > 0;
  }

  /**
   * Updates the position and side of the top card based on the current pile state.
   * This is used to ensure the correct card side is shown when cards are added or removed,
   * and to reset the position of the source top card when a card is removed from the pile.
   */
  private updateSourceTopCard(): void {
    if (this.preserveCardPositions) {
      return;
    }

    const topCard = this.getTopCard();

    if (!topCard) {
      return;
    }

    topCard.position.copyFrom(this.getSourceTopCardPosition());
    topCard.flip(this.isOpen || this.topCardSide === "open" ? "open" : "close");
  }
}
