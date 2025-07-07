import React from "react";
import type { DeckCard } from "../types/MagicTheGathering";
import Papa from "papaparse";
import { getScryfallCard } from "../utils/scryfall";
import { normalizeCardName, normalizeCardType } from "../utils/normalize";
import { parseCSVToCollectionCards } from "../utils/parseCSVToCollectionCards";
import { getCardsFromStorage } from "../utils/storage";
import { getCollectionSummary } from "../utils/summaries";
import { format } from "date-fns";

export function useCardParser() {
  const [cards, setCards] = React.useState<DeckCard[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = React.useState<number>(0);
  const [totalProgress, setTotalProgress] = React.useState<number>(0);
  const [uploadTime, setUploadTime] = React.useState<string | null>(() => {
    const saved = localStorage.getItem("mtg_cards_updated_at");
    return saved ? saved : null;
  });

  const handleError = (message: string) => {
    setLoading(false);
    setError(message);
  };

  const onCollectionUpload = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const onDeckCardAdd = React.useCallback(async (cardName: string) => {
    const ownedCards = getCardsFromStorage();
    const ownedMatch = ownedCards.find(
      (card) => normalizeCardName(card.name) === normalizeCardName(cardName)
    );

    const scryfallCard = await getScryfallCard(cardName);
    const type = normalizeCardType(scryfallCard?.type);

    const newCard: DeckCard = {
      imageUrl: scryfallCard?.previewUrl,
      name: cardName,
      price: scryfallCard?.price, //To do, convert to CAD
      type,
      set: scryfallCard?.set,
      quantityNeeded: 1,
      quantityOwned: ownedMatch?.quantityOwned ?? 0,
      manaCost: scryfallCard?.manaCost,
      manaTypes: scryfallCard?.manaTypes,
    };

    setCards((prevCards) => [...prevCards, newCard]);
  }, []);

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
  };
}
