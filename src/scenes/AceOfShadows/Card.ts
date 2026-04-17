import { getCardTexture, type CardType } from "@/scenes/AceOfShadows/cards";
import { getSheetTexture } from "@/services/assets/getSheetTexture";
import { Sprite } from "pixi.js";

export type CardSide = "open" | "close";

/**
 * Renders a single card and can swap between open and closed sides.
 */
export class Card extends Sprite {
  public readonly cardType: CardType;

  private side: CardSide;

  constructor(cardType: CardType, side: CardSide = "close") {
    super(side === "open" ? getCardTexture(cardType) : getSheetTexture("AceOfShadows", "cards/cardBack.png"));

    this.cardType = cardType;
    this.side = side;

    this.anchor.set(0.5);
    this.scale.set(2);
  }

  /**
   * Flips the card to a specific side, or toggles it when no side is provided.
   */
  public flip(side?: CardSide): void {
    this.side = side ?? (this.side === "open" ? "close" : "open");
    this.texture = this.side === "open" ? getCardTexture(this.cardType) : getSheetTexture("AceOfShadows", "cards/cardBack.png");
  }
}
