import React from "react";
import type { DeckCard } from "../types/MagicTheGathering";
import Papa from "papaparse";
import { getScryfallCard } from "../components/utils/scryfall";
import { normalizeCardName } from "../components/utils/normalize";
import { parseCSVToCollectionCards } from "../components/utils/parseCSVToCollectionCards";
import { getCardsFromStorage } from "../components/utils/storage";

export function useCardParser() {
  const [cards, setCards] = React.useState<DeckCard[]>([]); // Track temporary cards to display that haven't been comitted to storage
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
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const parsedCards = await parseCSVToCollectionCards(
              results.data as any[]
            );
            localStorage.setItem("mtg_cards", JSON.stringify(parsedCards));

            setLoading(false);
          } catch (err) {
            handleError("Error uploading cards. Try again later.");
          }
        },
      });
    },
    []
  );

  const onDeckCardAdd = React.useCallback(async (cardName: string) => {
    const ownedCards = getCardsFromStorage();
    const ownedMatch = ownedCards.find(
      (card) => normalizeCardName(card.name) === normalizeCardName(cardName)
    );

    const scryfallCard = await getScryfallCard(cardName);
    const newCard: DeckCard = {
      imageUrl: scryfallCard?.previewUrl,
      name: cardName,
      price: scryfallCard?.price,
      type: scryfallCard?.type,
      quantityNeeded: 1,
      quantityOwned: ownedMatch?.quantityOwned ?? 0,
      manaCost: scryfallCard?.manaCost,
      manaTypes: scryfallCard?.manaTypes,
    };

    setCards((prevCards) => [...prevCards, newCard]);
  }, []);

  const storedCards = getCardsFromStorage();

  return {
    cards,
    setCards,
    loading,
    error,
    collection: {
      size: storedCards.length,
      value: storedCards.reduce(
        (sum, card) => sum + (card.price ?? 0) * card.quantityOwned,
        0
      ),
    },
    onCollectionUpload,
    onDeckCardAdd,
  };
}
