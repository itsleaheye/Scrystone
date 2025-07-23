import type { CollectionCard } from "../types/MagicTheGathering";
import { normalizeCardName, normalizeCardType } from "./normalize";
import { getScryfallCard } from "./scryfall";

const REQUEST_DELAY_MS = 100;

export async function parseCSVToCollectionCards(
  rawCards: any[],
  onProgress?: (processed: number, total: number) => void
): Promise<CollectionCard[]> {
  let completedCards = 0;
  const total = rawCards.length;

  const processCard = async (rawCard: any): Promise<CollectionCard | null> => {
    const name = normalizeCardName(rawCard.Name);
    if (
      !name ||
      name.toLowerCase().includes("token") ||
      name.toLowerCase().includes("checklist")
    ) {
      return null;
    }

    try {
      const scryfallDetails = await getScryfallCard({
        cardName: name,
        set: rawCard["Set"],
        tcgPlayerId: rawCard["Product ID"],
      });
      if (!scryfallDetails) {
        console.warn(`No Scryfall data found for: ${name}`);
        return null;
      }

      const type = normalizeCardType(scryfallDetails.type);

      return {
        name,
        manaTypes: scryfallDetails.manaTypes,
        number: rawCard["Card Number"],
        price: scryfallDetails.price ? scryfallDetails.price * 1.37 : undefined,
        rarity: rawCard["Rarity"],
        set: rawCard["Set"],
        setName: scryfallDetails.setName,
        type,
        tcgPlayerId: rawCard["Product ID"],
        imageUrl: scryfallDetails.previewUrl,
        quantityOwned: rawCard["Quantity"] || 1,
      };
    } catch (error) {
      console.warn(`Failed to fetch Scryfall data for ${name}:`, error);
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
