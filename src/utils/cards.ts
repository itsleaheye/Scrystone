import type { CollectionCard, DeckCard } from "../types/MagicTheGathering";
import { normalizeCardName } from "./normalize";

export function mergeCardQuantities<T extends { name: string }>(
  cards: T[],
  ownedCards: CollectionCard[],
  isDeckView: boolean
): (T & { quantityOwned: number; quantityNeeded?: number })[] {
  return cards.map((card) => {
    const normalizedName = normalizeCardName(card.name);

    const quantityOwned = ownedCards
      .filter((owned) => normalizeCardName(owned.name) === normalizedName)
      .reduce((sum, match) => sum + (Number(match.quantityOwned) || 0), 0);

    return isDeckView
      ? { ...card, quantityOwned }
      : { ...card, quantityNeeded: 0, quantityOwned };
  });
}

export function getColoursFromCards(cards?: DeckCard[]): string[] {
  if (!cards || cards.length === 0) {
    return [];
  }

  const colourSet = new Set<string>();
  for (const card of cards) {
    (card.manaTypes || []).forEach((colour) => {
      colourSet.add(colour);
    });
  }

  return Array.from(colourSet).sort();
}
