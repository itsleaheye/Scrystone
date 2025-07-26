import type { CollectionCard } from "../types/MagicTheGathering";
import { loadBulkCardData } from "./cards";
import { normalizeCardName } from "./normalize";
import { getScryfallCard } from "./scryfall";

const REQUEST_DELAY_MS = 100;

export async function parseCSVToCollectionCards(
  rawCards: any[],
  onProgress?: (processed: number, total: number) => void
): Promise<CollectionCard[]> {
  await loadBulkCardData();

  let completedCards = 0;
  const total = rawCards.length;

  const processCard = async (rawCard: any): Promise<CollectionCard | null> => {
    const cardName = normalizeCardName(rawCard.Name);
    if (
      !cardName ||
      cardName.toLowerCase().includes("token") ||
      cardName.toLowerCase().includes("checklist") ||
      cardName.toLowerCase().includes("art card")
    ) {
      return null;
    }

    try {
      const scryfallData = await getScryfallCard({
        cardName,
        set: rawCard["Set"],
        tcgPlayerId: rawCard["Product ID"],
      });

      if (!scryfallData) return null;

      return {
        ...scryfallData,
        quantityOwned: rawCard["Quantity"] || 1,
      };
    } catch (error) {
      console.warn(`Failed to fetch card: ${cardName}`, error);

      return null;
    }
  };

  // Fetch all cards in parallel, staggered
  const parsedCards = await Promise.all(
    rawCards.map(
      (rawCard, i) =>
        new Promise<CollectionCard | null>((resolve) =>
          setTimeout(async () => {
            try {
              const result = await processCard(rawCard);
              resolve(result);
            } finally {
              completedCards++;
              onProgress?.(completedCards, total);
            }
          }, i * REQUEST_DELAY_MS)
        )
    )
  );

  // Remove failed or skipped cards
  const cleanedCards = parsedCards.filter(
    (c): c is CollectionCard => c !== null
  );

  // Deduplicate existing cards using the name and set
  const dedupedMap = new Map<string, CollectionCard>();

  for (const card of cleanedCards) {
    const normalizedName = normalizeCardName(card.name);
    const key = `${normalizedName}-${card.setName}`;
    const existing = dedupedMap.get(key);

    if (existing) {
      existing.quantityOwned =
        Number(existing.quantityOwned) + Number(card.quantityOwned);
    } else {
      dedupedMap.set(key, { ...card });
    }
  }

  return Array.from(dedupedMap.values());
}
