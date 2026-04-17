import { getSheetTexture } from "@/services/assets/getSheetTexture";
import type { Texture } from "pixi.js";

export const CARD_SUITS = ["Clubs", "Diamonds", "Hearts", "Spades"] as const;
export const CARD_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

export type CardSuit = (typeof CARD_SUITS)[number];
export type CardRank = (typeof CARD_RANKS)[number];

export interface CardType {
  suit: CardSuit;
  rank: CardRank;
}

function createDeck(suits: readonly CardSuit[] = CARD_SUITS, ranks: readonly CardRank[] = CARD_RANKS): CardType[] {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      suit,
      rank,
    })),
  );
}

export const ACE_OF_SHADOWS_CARDS: ReadonlyArray<CardType> = [...createDeck(), ...createDeck(), ...createDeck(CARD_SUITS, CARD_RANKS.slice(0, 10))];

export function getCardTextureId(card: CardType): string {
  return `cards/card${card.suit}${card.rank}.png`;
}

export function getCardTexture(card: CardType): Texture {
  return getSheetTexture("AceOfShadows", getCardTextureId(card));
}
