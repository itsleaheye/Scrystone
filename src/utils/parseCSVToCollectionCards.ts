import type { CollectionCard } from "../types/MagicTheGathering";
import { findCardByNameAndSet, loadBulkCardData } from "./cards";
import { normalizeCardName, normalizeCardType } from "./normalize";
import { formatScryfallDetails, getScryfallCard } from "./scryfall";

const REQUEST_DELAY_MS = 100;

export async function parseCSVToCollectionCards(
  rawCards: any[],
  onProgress?: (processed: number, total: number) => void
): Promise<CollectionCard[]> {
  await loadBulkCardData();

  let completedCards = 0;
  const total = rawCards.length;

  // const processCard = async (rawCard: any): Promise<CollectionCard | null> => {
  //   const cardName = normalizeCardName(rawCard.Name);
  //   if (
  //     !cardName ||
  //     cardName.toLowerCase().includes("token") ||
  //     cardName.toLowerCase().includes("checklist") ||
  //     cardName.toLowerCase().includes("art card")
  //   ) {
  //     return null;
  //   }

  //   try {
  //     const scryfallMatch = findCardByNameAndSet(cardName, rawCard["Set"]);
  //     if (scryfallMatch) {
  //       return {
  //         ...formatScryfallDetails(scryfallMatch),
  //         quantityOwned: rawCard["Quantity"] || 1,
  //       };
  //     }

  //     // Fallback with tcg player ID
  //     if (rawCard["Product ID"]) {
  //       const url = `https://api.scryfall.com/cards/tcgplayer/${rawCard["Product ID"]}`;

  //       const res = await fetch(url);
  //       if (res.ok) {
  //         const data = await res.json();

  //         return {
  //           ...formatScryfallDetails(data),
  //           quantityOwned: rawCard["Quantity"] || 1,
  //         };
  //       } else {
  //         const set = rawCard["Set"];
  //         const query = encodeURIComponent(cardName);
  //         const urls = [
  //           `https://api.scryfall.com/cards/search?q=!${query}&set:${set}`, // exact search + set filter
  //           `https://api.scryfall.com/cards/search?q=${query}&set:${set}`, // fuzzy search + set filter
  //           `https://api.scryfall.com/cards/named?fuzzy=${query}`, // fallback fuzzy named search without set filter
  //         ];

  //         let data: any;
  //         for (const url of urls) {
  //           const response = await fetch(url);
  //           if (!response.ok) continue;

  //           data = await response.json();
  //           data = Array.isArray(data.data) ? data.data[0] : data;

  //           if (data) break;
  //         }

  //         if (data) {
  //           return {
  //             ...formatScryfallDetails(data),
  //             quantityOwned: rawCard["Quantity"] || 1,
  //           };
  //         } else {
  //           return null;
  //         }
  //       }
  //     }

  //     const type = normalizeCardType(scryfallMatch.type);

  //     return {
  //       name: scryfallMatch.name,
  //       manaTypes: scryfallMatch.manaTypes,
  //       number: rawCard["Card Number"],
  //       price: scryfallMatch.price ? scryfallMatch.price * 1.37 : undefined,
  //       rarity: rawCard["Rarity"],
  //       set: rawCard["Set"],
  //       setName: scryfallMatch.setName,
  //       type,
  //       tcgPlayerId: rawCard["Product ID"],
  //       imageUrl: scryfallMatch.previewUrl,
  //       quantityOwned: rawCard["Quantity"] || 1,
  //     };
  //   } catch (error) {
  //     console.warn(`Failed to fetch Scryfall data for ${cardName}:`, error);
  //     return null;
  //   }
  // };

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
