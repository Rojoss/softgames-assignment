import { Container, PointData } from "pixi.js";

import { Card, type CardSide } from "@/scenes/AceOfShadows/Card";

const DEFAULT_VISIBLE_CARDS_COUNT = 2;
const DEFAULT_CARD_OFFSET = { x: -20, y: -35 };

interface CardPileOptions {
  isOpen?: boolean;
  visibleCardsCount?: number;
  cardOffset?: PointData;
}

/**
 * Stores a stack of cards and only renders the configurable number of top cards.
 */
export class CardPile extends Container {
  private readonly cards: Card[] = [];

  private isOpen: boolean;
  private visibleCardsCount: number;
  private cardOffset: PointData;
  private topCardSide: CardSide = "close";

  constructor(options: CardPileOptions = {}) {
    super();

    this.isOpen = options.isOpen ?? false;
    this.visibleCardsCount = options.visibleCardsCount ?? DEFAULT_VISIBLE_CARDS_COUNT;
    this.cardOffset = options.cardOffset ?? DEFAULT_CARD_OFFSET;
  }

  public get size(): number {
    return this.cards.length;
  }

  /**
   * Adds a card on top of the pile.
   */
  public addCard(card: Card): void {
    this.cards.push(card);
    this.updateVisibleCards();
  }

  /**
   * Removes the current top card from the pile.
   */
  public removeCard(): Card | undefined {
    const card = this.cards.pop();

    this.topCardSide = "close";

    this.updateVisibleCards();

    return card;
  }

  /**
   * Sets whether the pile should render face-up or face-down.
   */
  public setOpen(isOpen: boolean): void {
    this.isOpen = isOpen;

    if (isOpen) {
      this.topCardSide = "open";
    } else {
      this.topCardSide = "close";
    }

    this.updateVisibleCards();
  }

  /**
   * Updates how many top cards remain visible in the stack.
   */
  public setVisibleCardsCount(visibleCardsCount: number): void {
    this.visibleCardsCount = Math.max(1, visibleCardsCount);
    this.updateVisibleCards();
  }

  /**
   * Updates the offset that is applied between visible cards.
   */
  public setCardOffset(cardOffset: PointData): void {
    this.cardOffset = cardOffset;
    this.updateVisibleCards();
  }

  /**
   * Flips the top card to the requested side, or toggles it when no side is provided.
   */
  public flipTopCard(side?: CardSide): void {
    const topCard = this.cards[this.cards.length - 1];

    if (!topCard) {
      return;
    }

    if (!this.isOpen) {
      this.topCardSide = side ?? (this.topCardSide === "open" ? "close" : "open");
      this.updateVisibleCards();
      return;
    }

    topCard.flip(side);

    if (this.children.includes(topCard)) {
      this.updateVisibleCards();
    }
  }

  public hasCards(): boolean {
    return this.cards.length > 0;
  }

  private updateVisibleCards(): void {
    this.removeChildren();

    const visibleCards = this.cards.slice(-this.visibleCardsCount);

    visibleCards.forEach((card, index) => {
      const isTopCard = index === visibleCards.length - 1;
      const cardSide: CardSide = this.isOpen || (isTopCard && this.topCardSide === "open") ? "open" : "close";

      card.flip(cardSide);
      card.position.set(index * this.cardOffset.x, index * this.cardOffset.y);
      this.addChild(card);
    });
  }
}
