import type { CollectionCard } from "../types/MagicTheGathering";
import { loadBulkCardData } from "./cards";
import { fetchScryfallSetMaps, normalizeCardName } from "./normalize";
import { getScryfallCard } from "./scryfall";

const REQUEST_DELAY_MS = 100;

export async function parseCsvToCollection(
  rawCards: any[],
  onProgress?: (processed: number, total: number) => void
): Promise<CollectionCard[]> {
  await loadBulkCardData();

  let completedCards = 0;
  const total = rawCards.length;

  const processCard = async (rawCard: any): Promise<CollectionCard | null> => {
    const cardName = normalizeCardName(rawCard.Name);

    // Skips unwanted card types
    if (
      !cardName ||
      cardName.toLowerCase().includes("token") ||
      cardName.toLowerCase().includes("checklist") ||
      cardName.toLowerCase().includes("art card")
    ) {
      return null;
    }

    // TCGPlayer has a bug that SetCodes are not being exported. This patches it for my case.
    const { setCodeToNameMap, setNameToCodeMap } = await fetchScryfallSetMaps();
    const resolveSetCode = (rawCard: any): string | undefined => {
      const rawSetCode = (rawCard["Set Code"] ?? "").toLowerCase();
      const rawSetName = (rawCard["Set"] ?? "").toLowerCase();

      // If rawCard["Set Code"] is a valid set name map to a set code
      if (rawSetCode && setNameToCodeMap[rawSetCode]) {
        return setNameToCodeMap[rawSetCode];
      }

      // If rawCard["Set Code"] is a valid set code return it
      if (rawSetCode && setCodeToNameMap[rawSetCode]) {
        return rawSetCode;
      }

      // Fallback try rawCard["Set"] (name) mapped to code
      if (rawSetName && setNameToCodeMap[rawSetName]) {
        return setNameToCodeMap[rawSetName];
      }

      return undefined;
    };

    const setCode = resolveSetCode(rawCard);

    try {
      const scryfallData = await getScryfallCard({
        cardName,
        set: setCode,
        tcgPlayerId: rawCard["Product ID"],
      });
      if (!scryfallData) return null;

      return {
        ...scryfallData,
        quantityOwned: rawCard["Quantity"] || 1,
        setName: rawCard["Set"],
        set: setCode ?? "Any",
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
