import type { CollectionCard } from "../../types/MagicTheGathering";
import { normalizeCardName, normalizeCardType } from "./normalize";
import { getScryfallCard } from "./scryfall";

export async function parseCSVToCollectionCards(
  rawCards: any[],
  onProgress?: (processed: number, total: number) => void
): Promise<CollectionCard[]> {
  //  Combine CSV card data with Scryfall card data
  const cards: CollectionCard[] = [];
  const total = rawCards.length;

  // Allows us to track parsing progress
  for (let i = 0; i < rawCards.length; i++) {
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

    const scryfallDetails = await getScryfallCard(name);
    if (!scryfallDetails) {
      console.warn(`No Scryfall data found for: ${name}`);
      onProgress?.(i + 1, total);
      continue;
    }
    await delay(100); // Scryfall was throwing a CORS policy: No 'Access-Control-Allow-Origin' exception and rate limit

    const type = normalizeCardType(scryfallDetails?.type);

    cards.push({
      name,
      manaCost: scryfallDetails?.manaCost,
      manaTypes: scryfallDetails?.manaTypes,
      number: rawCard["Card Number"],
      price: scryfallDetails?.price ? scryfallDetails.price * 1.37 : undefined,
      rarity: rawCard["Rarity"],
      set: rawCard["Set"],
      type,
      isFoil: rawCard.isFoil,
      imageUrl: scryfallDetails?.previewUrl,
      quantityOwned: rawCard["Quantity"] || 1,
    });

    onProgress?.(i + 1, total);
  }

  // Combine cards with duplicate names
  return (cards.filter(Boolean) as CollectionCard[]).reduce((acc, card) => {
    const existingCard = acc.find(
      (c) => normalizeCardName(c.name) === normalizeCardName(card.name)
    );

    // Combine quantities
    if (existingCard) {
      existingCard.quantityOwned =
        Number(card.quantityOwned) + Number(existingCard.quantityOwned);
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
