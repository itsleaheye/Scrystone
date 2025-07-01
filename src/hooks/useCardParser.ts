import React from "react";
import type { DeckCard } from "../types/MagicTheGathering";
import Papa from "papaparse";
import { getScryfallCard } from "../components/utils/scryfall";
import {
  normalizeCardName,
  normalizeCardType,
} from "../components/utils/normalize";
import { parseCSVToCollectionCards } from "../components/utils/parseCSVToCollectionCards";
import { getCardsFromStorage } from "../components/utils/storage";
import { getCollectionSummary } from "../components/utils/summaries";
import { format } from "date-fns";

export function useCardParser() {
  const [cards, setCards] = React.useState<DeckCard[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleError = (message: string) => {
    setLoading(false);
    setError(message);
  };

  const onCollectionUpload = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return handleError("Please select a .csv file to upload");

      setLoading(true);
      try {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            const rawCards = results.data as any[];
            const parsedCards = await parseCSVToCollectionCards(rawCards);

            localStorage.setItem("mtg_cards", JSON.stringify(parsedCards));
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
      price: scryfallCard?.price,
      type,
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
    error,
    collection: {
      size: collectionSummary.size,
      value: collectionSummary.value,
      updatedAt: format(new Date(), "MMMM dd yyyy,  hh:mm a"),
    },
    onCollectionUpload,
    onDeckCardAdd,
  };
}
