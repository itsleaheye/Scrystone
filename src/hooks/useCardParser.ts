import React, { useEffect, useState } from "react";
import type { DeckCard } from "../types/MagicTheGathering";
import Papa from "papaparse";
import { getScryfallCard } from "../utils/scryfall";
import { normalizeCardName, normalizeCardType } from "../utils/normalize";
import { parseCSVToCollectionCards } from "../utils/parseCSVToCollectionCards";
import { getCardsFromStorage } from "../utils/storage";
import { getCollectionSummary } from "../utils/summaries";
import { format } from "date-fns";
import { collection, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

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

  const [collectionSummary, setCollectionSummary] = useState({
    size: 0,
    value: 0,
  });

  useEffect(() => {
    const loadSummary = async () => {
      const storedCards = await getCardsFromStorage();
      setCollectionSummary(getCollectionSummary(storedCards));
    };
    loadSummary();
  }, []);

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

            if (!auth.currentUser) {
              handleError("You must be logged in to upload your collection.");
              return;
            }

            const uid = auth.currentUser.uid;
            const userCollectionRef = collection(db, "users", uid, "cards");

            for (const card of parsedCards) {
              const cardRef = doc(userCollectionRef, card.name);
              const sanitizedCard = {
                ...card,
                manaCost: card.manaCost ?? null,
                price: card.price ?? null,
                manaTypes: card.manaTypes ?? [],
              };

              await setDoc(cardRef, sanitizedCard);
            }

            const timestamp = format(new Date(), "MMMM dd yyyy,  hh:mm a");
            await setDoc(
              doc(db, "users", uid),
              {
                collectionUpdatedAt: timestamp,
              },
              { merge: true }
            );
            console.log("timestamp:", timestamp);

            setUploadTime(timestamp);
            setCollectionSummary(getCollectionSummary(parsedCards));
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
    const ownedCards = await getCardsFromStorage();
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
