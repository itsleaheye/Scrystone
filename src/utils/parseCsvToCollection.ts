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

    // TCGPlayer has a bug that SetCodes are not being exported. This patches it for my case
    const { setCodeToNameMap, setNameToCodeMap } = await fetchScryfallSetMaps();

    const resolveSetCode = (
      rawSetCode?: string,
      rawSetName?: string
    ): string | undefined => {
      const code =
        rawSetCode != null ? String(rawSetCode).trim().toLowerCase() : "";
      const name = rawSetName != null ? String(rawSetName).toLowerCase() : "";

      // If the name is valid > map to code
      if (name && setNameToCodeMap[name]) {
        return setNameToCodeMap[name];
      }

      // If the code is valid > return as is
      if (code && setCodeToNameMap[code]) {
        return code;
      }

      // If the code is actually a name > map to code
      if (code && setNameToCodeMap[code]) {
        return setNameToCodeMap[code];
      }

      return undefined;
    };

    const setCode = resolveSetCode(rawCard["Set Code"], rawCard["Set"]);

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
