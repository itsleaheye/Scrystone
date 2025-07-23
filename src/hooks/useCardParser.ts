import type { DeckCard } from "../types/MagicTheGathering";
import Papa from "papaparse";
import { getScryfallCard } from "../utils/scryfall";
import { normalizeCardName, normalizeCardType } from "../utils/normalize";
import { parseCSVToCollectionCards } from "../utils/parseCSVToCollectionCards";
import { getCardsFromStorage } from "../utils/storage";
import { getCollectionSummary } from "../utils/summaries";
import { format } from "date-fns";
import { useCallback, useState, type ChangeEvent } from "react";

export function useCardParser() {
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [uploadTime, setUploadTime] = useState<string | null>(() => {
    const saved = localStorage.getItem("mtg_cards_updated_at");
    return saved ? saved : null;
  });

  const handleError = (message: string) => {
    setLoading(false);
    setError(message);
  };

  const onCollectionUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return handleError("Please select a .csv file to upload");

      setLoading(true);
      setCurrentProgress(0);
      setTotalProgress(0);

      try {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            const rawCards = results.data as any[];
            const parsedCards = await parseCSVToCollectionCards(
              rawCards,
              (processed, total) => {
                setCurrentProgress(processed);
                setTotalProgress(total);
              }
            );

            const timestamp = format(new Date(), "MMMM dd yyyy,  hh:mm a");
            localStorage.setItem("mtg_cards", JSON.stringify(parsedCards));
            localStorage.setItem("mtg_cards_updated_at", timestamp);

            setUploadTime(timestamp);
            setLoading(false);
          },
        });
      } catch {
        handleError("Error uploading cards. Try again later.");
      }
    },
    []
  );

  const onDeckCardAdd = useCallback(
    async (
      cardName: string,
      quantityNeeded?: number,
      setPreference?: string
    ) => {
      const ownedCards = getCardsFromStorage();
      const ownedMatch = ownedCards.find(
        (card) => normalizeCardName(card.name) === normalizeCardName(cardName)
      );

      const scryfallCard = await getScryfallCard({
        cardName,
        set: setPreference,
      });

      const type = normalizeCardType(scryfallCard?.type);
      let setName = scryfallCard?.setName;
      if (
        cardName === "Mountain" ||
        cardName === "Plains" ||
        cardName == "Island" ||
        cardName === "Swamp" ||
        cardName === "Forest"
      ) {
        setName = "Any";
      }

      const newCard: DeckCard = {
        imageUrl: scryfallCard?.previewUrl,
        name: cardName,
        price: scryfallCard?.price && scryfallCard.price * 1.37, //To do, convert to CAD
        type,
        set: scryfallCard?.set ?? "Any",
        setName: setName ?? "Any",
        quantityNeeded: quantityNeeded ?? 1,
        quantityOwned: ownedMatch?.quantityOwned ?? 0,
        manaTypes: scryfallCard?.manaTypes,
      };

      setCards((prevCards) => [...prevCards, newCard]);
    },
    []
  );

  const onCardsImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        handleError?.("Please select a .txt file to upload");
        return;
      }

      setLoading?.(true);

      try {
        const fileText = await file.text();
        const lines = fileText.split("\n");
        let readingDeck = true;

        for (const line of lines) {
          if (
            line.trim().startsWith("**The Following Cards Are Still Needed")
          ) {
            readingDeck = false;
            break;
          }

          if (!readingDeck || !line.trim()) continue;

          const match = line.match(/^\s*(\d+)[xX]?\s+(.+)$/); // Supports `1x name`, `1 name`, `1 x name`, and `1X name`
          if (!match) continue;

          const quantity = parseInt(match[1], 10);
          const name = match[2].trim();

          // Call your existing card adding logic
          await onDeckCardAdd(name, quantity);
        }
      } catch (error) {
        console.error(error);
        handleError?.("Failed to parse or process the deck file.");
      } finally {
        setLoading?.(false);
      }
    },
    [onDeckCardAdd, handleError, setLoading]
  );

  const storedCards = getCardsFromStorage();
  const collectionSummary = getCollectionSummary(storedCards);

  return {
    cards,
    setCards,
    loading,
    currentProgress,
    totalProgress,
    error,
    collection: {
      size: collectionSummary.size,
      value: collectionSummary.value,
      updatedAt: uploadTime,
    },
    onCollectionUpload,
    onDeckCardAdd,
    onCardsImport,
  };
}
