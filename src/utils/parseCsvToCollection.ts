import type { CollectionCard } from "../types/MagicTheGathering";
import { loadBulkCardData } from "./cards";
import { fetchScryfallSetMaps, normalizeCardName } from "./normalize";
import { getScryfallCard } from "./scryfall";

const REQUEST_DELAY_MS = 100;

export async function parseCsvToCollection(
  rawCards: any[],
  onProgress?: (processed: number, total: number) => void
): Promise<CollectionCard[]> {
  await loadBulkCardData(); // Preload bulk JSON if not done already

  let completedCards = 0;
  const total = rawCards.length;

  const processCard = async (rawCard: any): Promise<CollectionCard | null> => {
    if (!rawCard.Name && !rawCard["Product Name"]) return null;
    const cardName = normalizeCardName(rawCard.Name || rawCard["Product Name"]);

    if (
      !cardName ||
      cardName.toLowerCase().includes("token") ||
      cardName.toLowerCase().includes("checklist") ||
      cardName.toLowerCase().includes("art card")
    ) {
      return null; // Skips unplayable cards
    }

    // TCGPlayer has a bug that no longer includes a "Set Code" in the export. This works around their bug:
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

    const setCode = resolveSetCode(
      rawCard["Set Code"], // TCGPlayer retired "Set Code" for future .csv's 09/2025
      rawCard["Set"] || rawCard["Set Name"] // TCGPlayer swapped from "Set" to "Set Name" for future .csv's 09/2025
    );

    try {
      const scryfallData = await getScryfallCard({
        cardName,
        set: setCode,
        tcgPlayerId: rawCard["Product ID"] || rawCard["TCGplayer Id"], //TCGPlayer swapped their .csv from "Product ID" to "TCGplayer Id" 09/2025
      });
      if (!scryfallData) return null;

      return {
        ...scryfallData,
        set: setCode ?? "Any",
        setName: rawCard["Set"] || rawCard["Set Name"], // TCGPlayer swapped from "Set" to "Set Name" for future .csv's 09/2025
        quantityOwned: rawCard["Quantity"] || rawCard["Add to Quantity"] || 1, // TCGPlayer swapped from "Qauntity" to "Add to Quantity" for future .csv's 09/2025
      };
    } catch (error) {
      console.warn(`Failed to fetch card: ${cardName}`, error);
      return null;
    }
  };

  // Fetch all cards in parallel, but staggered to avoid CORS header policy breakage
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
    (card): card is CollectionCard => card !== null
  );
  // Deduplicate existing cards using the map
  const dedupedMap = new Map<string, CollectionCard>();
  for (const card of cleanedCards) {
    const key = `${normalizeCardName(card.name)}-${card.setName}`;
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
