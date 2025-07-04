import type { CollectionCard } from "../../types/MagicTheGathering";
import { normalizeCardName, normalizeCardType } from "./normalize";
import { getScryfallCard } from "./scryfall";

export async function parseCSVToCollectionCards(
  rawCards: any[],
  onProgress?: (processed: number, total: number) => void
): Promise<CollectionCard[]> {
  const cards: CollectionCard[] = [];

  // Step 1: Group all CSV rows by name
  const grouped = new Map<string, any[]>();

  for (const rawCard of rawCards) {
    const name = normalizeCardName(rawCard.Name);

    if (
      !name ||
      name.toLowerCase().includes("token") ||
      name.toLowerCase().includes("checklist")
    ) {
      continue;
    }

    if (!grouped.has(name)) {
      grouped.set(name, []);
    }
    grouped.get(name)!.push(rawCard);
  }

  // Step 2: Process each unique card
  const uniqueEntries = Array.from(grouped.entries());
  const total = uniqueEntries.length;

  for (let i = 0; i < uniqueEntries.length; i++) {
    const [name, cardGroup] = uniqueEntries[i];

    const scryfallDetails = await getScryfallCard(name);
    if (!scryfallDetails) {
      console.warn(`No Scryfall data found for: ${name}`);
      onProgress?.(i + 1, total);
      continue;
    }

    await delay(100); // Optional with proxy, but avoids Scryfall pushback

    const type = normalizeCardType(scryfallDetails.type);
    const first = cardGroup[0];

    const totalQuantity = cardGroup.reduce(
      (sum, card) => sum + (Number(card["Quantity"]) || 1),
      0
    );

    cards.push({
      name,
      manaCost: scryfallDetails.manaCost,
      manaTypes: scryfallDetails.manaTypes,
      number: first["Card Number"],
      price: scryfallDetails.price ? scryfallDetails.price * 1.37 : undefined,
      rarity: first["Rarity"],
      set: first["Set"],
      type,
      isFoil: first.isFoil,
      imageUrl: scryfallDetails.previewUrl,
      quantityOwned: totalQuantity,
    });

    onProgress?.(i + 1, total);
  }

  return cards;
}

// Delay to space out requests (optional with proxy)
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
