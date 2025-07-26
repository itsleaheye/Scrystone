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
      .filter(
        (owned) =>
          normalizeCardName(owned.name) === normalizedName &&
          (("set" in card && card.set == "Any") ||
            ("set" in card && owned.set === card.set))
      )
      .reduce((sum, match) => {
        let quantity = match.quantityOwned;

        if (Array.isArray(quantity)) {
          quantity = quantity
            .map((q) => Number(q))
            .filter((q) => Number.isFinite(q))
            .reduce((a, b) => a + b, 0);
        } else {
          quantity = Number(quantity);
          if (!Number.isFinite(quantity)) quantity = 0;
        }

        return sum + quantity;
      }, 0);

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

let bulkCardDataMap: Map<string, any> = new Map();

export async function loadBulkCardData(): Promise<void> {
  if (bulkCardDataMap.size > 0) return; // Already loaded

  try {
    const res = await fetch("/mtg-cards-slim.json");
    if (!res.ok) throw new Error("Failed to load: 'mtg-cards-slim.json'");

    const json = await res.json();

    for (const card of json) {
      const nameKey = getCardKey(card.name);
      const setKey = getCardKey(card.name, card.set);

      // Fall back
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
  return set ? `${normalizedName}-${set}` : normalizedName;
}
