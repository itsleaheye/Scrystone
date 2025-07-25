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
          (("setName" in card && card.setName == "Any") ||
            ("setName" in card && owned.setName === card.setName))
      )
      .reduce(
        (sum, match) => sum + (parseInt(match.quantityOwned as any, 10) || 0),
        0
      );

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

// Load datas from our slimmed JSON file
let bulkCardData: any[] = [];

export async function loadBulkCardData(): Promise<void> {
  if (bulkCardData.length > 0) return; // If already loaded

  try {
    const res = await fetch("/mtg-cards-slim.json");
    if (!res.ok) throw new Error("Failed to load: 'mtg-cards-slim.json'");

    const json = await res.json();
    bulkCardData = json;
  } catch (error) {
    console.error("[!] Error loading bulk card data:", error);
  }
}

export function findCardByNameAndSet(
  cardName: string,
  set?: string
): any | undefined {
  const normalizedName = normalizeCardName(cardName);

  return bulkCardData.find((card) => {
    const nameMatch = normalizeCardName(card.name) === normalizedName;

    if (set) {
      const setMatch = !set || card.set.toLowerCase() === set.toLowerCase();
      return nameMatch && setMatch;
    }

    return nameMatch;
  });
}
