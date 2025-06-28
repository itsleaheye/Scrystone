import type { Card, DeckCard } from "../../types/MagicTheGathering";

export function getDeckManaSummary(cards: DeckCard[]) {
  const allSymbols: string[] = [];

  for (const card of cards) {
    if (!card.manaTypes) continue;

    for (const symbol of card.manaTypes) {
      const upper = symbol.toUpperCase();
      if (/^[A-Z]$/.test(upper)) {
        allSymbols.push(upper);
      }
    }
  }

  return Array.from(new Set(allSymbols)).sort();
}

export const getDeckCost = (cards: Card[] | DeckCard[]) => {
  return (
    cards.reduce(
      (sum, card) =>
        sum +
        (typeof card.price === "number" ? card.price : Number(card.price) || 0),
      0
    ) ?? 0
  );
};
