import type { CollectionCard, DeckCard } from "../types/MagicTheGathering";
import { normalizeCardName } from "./normalize";

export function mergeCardQuantities<T extends { name: string }>(
  cards: T[],
  ownedCards: CollectionCard[],
  isDeckView: boolean
): (T & { quantityOwned: number; quantityNeeded?: number })[] {
  return cards.map((card) => {
    const sumQuantity = (
      quantity: number | (number | string)[] | undefined
    ): number => {
      if (Array.isArray(quantity)) {
        return quantity
          .map((q) => Number(q))
          .filter(Number.isFinite)
          .reduce((a, b) => a + b, 0);
      }
      const num = Number(quantity);
      return Number.isFinite(num) ? num : 0;
    };

    const matches = ownedCards.filter((owned) => {
      if (normalizeCardName(owned.name) !== normalizeCardName(card.name))
        return false;

      if (!isDeckView) {
        const cardSet = "set" in card ? card.set : undefined;
        return cardSet === "Any" || cardSet === owned.set;
      }

      return true;
    });

    const quantityOwned = matches.reduce(
      (sum, owned) => sum + sumQuantity(owned.quantityOwned),
      0
    );

    return {
      ...card,
      quantityOwned,
      ...(isDeckView ? {} : { quantityNeeded: 0 }),
    };
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

let bulkCardDataMap: Map<string, any> = new Map();

export async function loadBulkCardData(): Promise<void> {
  if (bulkCardDataMap.size > 0) return; // Already loaded

  try {
    const res = await fetch("/mtg-cards-slim.json");
    if (!res.ok) throw new Error("Failed to load: 'mtg-cards-slim.json'");

    const json = await res.json();

    const cardIndex = json as Record<string, any>;

    for (const card of Object.values(cardIndex)) {
      const nameKey = getCardKey(card.name);
      const setKey = getCardKey(card.name, card.set);

      if (!bulkCardDataMap.has(nameKey)) {
        bulkCardDataMap.set(nameKey, card);
      }

      bulkCardDataMap.set(setKey, card);
    }
  } catch (error) {
    console.error("[!] Error loading bulk card data:", error);
  }
}

export function findCardByNameAndSet(
  cardName: string,
  set: string
): any | undefined {
  const cardKey = getCardKey(cardName, set);

  return bulkCardDataMap.get(cardKey);
}

export function findCardByName(cardName: string): any | undefined {
  const cardKey = getCardKey(cardName);

  return bulkCardDataMap.get(cardKey);
}

export function getCardKey(cardName: string, set?: string): string {
  const normalizedName = normalizeCardName(cardName);
  const safeName = normalizedName.replace(/\//g, "-"); //Firestore treats the '/' as a separator, creating another segment. We need to prevent this
  return set ? `${safeName}-${set.toLowerCase()}` : safeName;
}
