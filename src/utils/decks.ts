import type {
  Card,
  CardTypeSummary,
  CollectionCard,
  Deck,
  DeckCard,
} from "../types/MagicTheGathering";
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

export async function getDeckTypeSummary(cards: DeckCard[]) {
  const ownedCards: CollectionCard[] = await getCardsFromStorage();

  const totalQuantityByName = new Map<string, number>();
  ownedCards.forEach((card) => {
    const normalizedName = normalizeCardName(card.name);
    totalQuantityByName.set(
      normalizedName,
      (totalQuantityByName.get(normalizedName) ?? 0) + (card.quantityOwned ?? 0)
    );
  });

  const deckCountByName = new Map<
    string,
    { type: string; quantityNeeded: number; setName: string }
  >();

  cards.forEach((card) => {
    if (!card.name || !card.type) return;

    deckCountByName.set(normalizeCardName(card.name), {
      type: card.type,
      quantityNeeded: card?.quantityNeeded ?? 0,
      setName: card.setName,
    });
  });

  const quantityNeededByType = new Map<string, number>();
  const quantityOwnedByType = new Map<string, number>();

  deckCountByName.forEach(({ type, quantityNeeded, setName }, cardName) => {
    let quantityOwned = 0;

    if (setName === "Any") {
      // Sum quantity of all cards with this name
      quantityOwned = totalQuantityByName.get(cardName) ?? 0;
    } else {
      // Match by both name and set
      const match = ownedCards.find(
        (card) =>
          normalizeCardName(card.name) === cardName && card.setName === setName
      );
      quantityOwned = match?.quantityOwned ?? 0;
    }

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
  "Instant",
];

export async function getDeckTypeSummaryWithDefaults(
  cards: DeckCard[]
): Promise<CardTypeSummary[]> {
  const summary = await getDeckTypeSummary(cards);
  const summaries = new Map(summary.map((item) => [item.type, item]));

  return DEFAULT_TYPES.map(
    (type) =>
      summaries.get(type) ?? { type, quantityNeeded: 0, quantityOwned: 0 }
  );
}

export function isDeckReady(deck: Deck): boolean {
  const deckSize = deck.cards.reduce(
    (sum, card) => sum + (card.quantityNeeded || 0),
    0
  );
  let requiredSize = 60;
  switch (deck.format) {
    case "Commander":
      requiredSize = 100;
      break;
    case "Standard":
      requiredSize = 60;
      break;
    case "Draft":
      requiredSize = 40;
      break;
    default:
      requiredSize = 60; // Default to standard size
      break;
  }

  return deckSize == requiredSize;
}
