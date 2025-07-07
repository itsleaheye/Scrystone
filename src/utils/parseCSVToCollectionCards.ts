import type { CollectionCard } from "../types/MagicTheGathering";
import { normalizeCardName, normalizeCardType } from "./normalize";
import { getScryfallCard } from "./scryfall";

const REQUEST_DELAY_MS = 100; // Scryfall API rate limit is 100ms

export async function parseCSVToCollectionCards(
  rawCards: any[],
  onProgress?: (processed: number, total: number) => void
): Promise<CollectionCard[]> {
  const cards: CollectionCard[] = [];
  const total = rawCards.length;

  for (let i = 0; i < total; i++) {
    const rawCard = rawCards[i];
    const name = normalizeCardName(rawCard.Name);
    if (
      !name ||
      name.toLowerCase().includes("token") ||
      name.toLowerCase().includes("checklist")
    ) {
      onProgress?.(i + 1, total);
      continue;
    }

    try {
      await delay(REQUEST_DELAY_MS);

      const scryfallDetails = await getScryfallCard(name);
      if (!scryfallDetails) {
        console.warn(`No Scryfall data found for: ${name}`);
        onProgress?.(i + 1, total);
        continue;
      }

      const type = normalizeCardType(scryfallDetails.type);

      cards.push({
        name,
        manaCost: scryfallDetails.manaCost,
        manaTypes: scryfallDetails.manaTypes,
        number: rawCard["Card Number"],
        price: scryfallDetails.price ? scryfallDetails.price * 1.37 : undefined,
        rarity: rawCard["Rarity"],
        set: rawCard["Set"],
        type,
        isFoil: rawCard.isFoil,
        imageUrl: scryfallDetails.previewUrl,
        quantityOwned: rawCard["Quantity"] || 1,
      });
    } catch (err) {
      console.warn(`Failed to fetch Scryfall data for ${name}:`, err);
    }

    onProgress?.(i + 1, total);
  }

  // Combine duplicate cards
  return cards.reduce((acc, card) => {
    const existing = acc.find(
      (c) => normalizeCardName(c.name) === normalizeCardName(card.name)
    );

    //  Combine quantities
    if (existing) {
      existing.quantityOwned =
        Number(existing.quantityOwned) + Number(card.quantityOwned);
    } else {
      acc.push({ ...card });
    }
    return acc;
  }, [] as CollectionCard[]);
}

// Hitting Scryfall rate limitations
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
