import type { CollectionCard } from "../types/MagicTheGathering";
import { normalizeCardName, normalizeCardType } from "./normalize";
import { getScryfallCard } from "./scryfall";

const REQUEST_DELAY_MS = 100;

export async function parseCSVToCollectionCards(
  rawCards: any[],
  onProgress?: (processed: number, total: number) => void
): Promise<CollectionCard[]> {
  const total = rawCards.length;

  const processCard = async (
    rawCard: any,
    index: number
  ): Promise<CollectionCard | null> => {
    const name = normalizeCardName(rawCard.Name);
    if (
      !name ||
      name.toLowerCase().includes("token") ||
      name.toLowerCase().includes("checklist")
    ) {
      onProgress?.(index + 1, total);
      return null;
    }

    try {
      const scryfallDetails = await getScryfallCard(
        name,
        rawCard["Set"],
        rawCard["Product ID"]
      );
      if (!scryfallDetails) {
        console.warn(`No Scryfall data found for: ${name}`);
        onProgress?.(index + 1, total);
        return null;
      }

      const type = normalizeCardType(scryfallDetails.type);

      onProgress?.(index + 1, total);

      return {
        name,
        manaTypes: scryfallDetails.manaTypes,
        number: rawCard["Card Number"],
        price: scryfallDetails.price ? scryfallDetails.price * 1.37 : undefined,
        rarity: rawCard["Rarity"],
        set: rawCard["Set"],
        type,
        tcgPlayerId: rawCard["Product ID"],
        imageUrl: scryfallDetails.previewUrl,
        quantityOwned: rawCard["Quantity"] || 1,
      };
    } catch (err) {
      console.warn(`Failed to fetch Scryfall data for ${name}:`, err);
      onProgress?.(index + 1, total);
      return null;
    }
  };

  // Fetch all cards in parallel, staggered
  const parsedCards = await Promise.all(
    rawCards.map(
      (rawCard, i) =>
        new Promise<CollectionCard | null>((resolve) =>
          setTimeout(async () => {
            const result = await processCard(rawCard, i);
            resolve(result);
          }, i * REQUEST_DELAY_MS)
        )
    )
  );

  // Remove failed or skipped cards
  const cleanedCards = parsedCards.filter(
    (c): c is CollectionCard => c !== null
  );

  // Deduplicate existing cards using the name and set
  const deduped = cleanedCards.reduce((acc, card) => {
    const existing = acc.find(
      (c) =>
        normalizeCardName(c.name) === normalizeCardName(card.name) &&
        c.set === card.set
    );

    if (existing) {
      existing.quantityOwned =
        Number(existing.quantityOwned) + Number(card.quantityOwned);
    } else {
      acc.push({ ...card });
    }

    return acc;
  }, [] as CollectionCard[]);

  return deduped;
}
