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
          "set" in card &&
          owned.set === card.set
      )
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

export async function getCardSets(
  cardName: string
): Promise<{ set: string; set_name: string }[]> {
  // Have to conform to scryfall naming format
  const normalizedName = normalizeCardName(cardName);
  const query = encodeURIComponent(normalizedName);
  const response = await fetch(
    `https://api.scryfall.com/cards/named?fuzzy=${query}`
  );
  if (!response.ok) return [];

  const namedCard = await response.json();
  const possiblePrints = namedCard.prints_search_uri;

  const uniqueSets = new Map<string, string>();
  let nextPage = possiblePrints;

  while (nextPage) {
    const res = await fetch(nextPage);
    if (!res.ok) break;

    const data = await res.json();
    for (const card of data.data) {
      if (!uniqueSets.has(card.set)) {
        uniqueSets.set(card.set, card.set_name);
      }
    }

    nextPage = data.has_more ? data.next_page : null;
  }

  return Array.from(uniqueSets.entries())
    .map(([set, set_name]) => ({ set, set_name }))
    .sort((a, b) => a.set_name.localeCompare(b.set_name)); // optional: alphabetize
}
