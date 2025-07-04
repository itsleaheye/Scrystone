import type {
  Card,
  CardTypeSummary,
  CollectionCard,
  Deck,
  DeckCard,
} from "../../types/MagicTheGathering";
import { normalizeCardName } from "./normalize";
import { getCardsFromStorage } from "./storage";

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

export function getDeckCost(cards: Card[] | DeckCard[]) {
  return (
    cards.reduce(
      (sum, card) =>
        sum +
        (typeof card.price === "number" ? card.price : Number(card.price) || 0),
      0
    ) ?? 0
  );
}

export function generateUniqueDeckId() {
  return Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);
}

export function getDeckTypeSummary(cards: DeckCard[]) {
  const ownedCards: CollectionCard[] = getCardsFromStorage();
  const ownedByName = new Map(
    ownedCards.map((card) => [normalizeCardName(card.name), card])
  );

  const deckCountByName = new Map<
    string,
    { type: string; quantityNeeded: number }
  >();

  cards.forEach((card) => {
    if (!card.name || !card.type) return;

    deckCountByName.set(normalizeCardName(card.name), {
      type: card.type,
      quantityNeeded: card?.quantityNeeded ?? 0,
    });
  });

  const quantityNeededByType = new Map<string, number>();
  const quantityOwnedByType = new Map<string, number>();

  deckCountByName.forEach(({ type, quantityNeeded }, cardName) => {
    const quantityOwned = ownedByName.get(cardName)?.quantityOwned ?? 0;

    quantityNeededByType.set(
      type,
      (quantityNeededByType.get(type) ?? 0) + quantityNeeded
    );

    quantityOwnedByType.set(
      type,
      (quantityOwnedByType.get(type) ?? 0) +
        Math.min(quantityOwned, quantityNeeded)
    );
  });

  return Array.from(quantityNeededByType.entries()).map(
    ([type, quantityNeeded]) => ({
      type,
      quantityNeeded,
      quantityOwned: quantityOwnedByType.get(type) ?? 0,
    })
  );
}

const DEFAULT_TYPES = [
  "Artifact",
  "Creature",
  "Enchantment",
  "Land",
  "Sorcery",
];

export function getDeckTypeSummaryWithDefaults(
  cards: DeckCard[]
): CardTypeSummary[] {
  const summary = getDeckTypeSummary(cards);
  const summaries = new Map(summary.map((item) => [item.type, item]));

  return DEFAULT_TYPES.map(
    (type) =>
      summaries.get(type) ?? { type, quantityNeeded: 0, quantityOwned: 0 }
  );
}

export function isDeckFullyOwned(deck: Deck): boolean {
  return deck.cards.every(
    (card) => (card.quantityOwned ?? 0) >= (card.quantityNeeded ?? 0)
  );
}
