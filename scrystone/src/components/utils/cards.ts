import type { CollectionCard } from "../../types/MagicTheGathering";
import { normalizeCardName } from "./normalize";

export function mergeCardQuanties<T extends { name: string }>(
  cards: T[],
  ownedCards: CollectionCard[],
  isDeckView: boolean
): (T & { quantityOwned: number; quantityNeeded?: number })[] {
  return cards.map((card) => {
    const ownedMatch = ownedCards.find(
      (owned) => normalizeCardName(owned.name) === normalizeCardName(card.name)
    );
    const quantityOwned = ownedMatch?.quantityOwned ?? 0;

    return isDeckView
      ? { ...card, quantityOwned }
      : { ...card, quantityNeeded: 0, quantityOwned };
  });
}
