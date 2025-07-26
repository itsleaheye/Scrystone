import type { DeckCard } from "../types/MagicTheGathering";
import Papa from "papaparse";
import { getScryfallCard } from "../utils/scryfall";
import { normalizeCardName, normalizeCardType } from "../utils/normalize";
import { parseCSVToCollectionCards } from "../utils/parseCSVToCollectionCards";
import { getCardsFromStorage } from "../utils/storage";
import { getCollectionSummary } from "../utils/summaries";
import { format } from "date-fns";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { auth, db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { getCardKey, loadBulkCardData } from "../utils/cards";
import { useNavigate } from "react-router-dom";

export function useCardParser() {
  const navigate = useNavigate();

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
            if (!auth.currentUser) {
              handleError("You must be logged in to upload your collection.");
              return;
            }

            const rawCards = results.data as any[];
            const parsedCards = await parseCSVToCollectionCards(
              rawCards,
              (processed, total) => {
                setCurrentProgress(processed);
                setTotalProgress(total);
              }
            );

            const uid = auth.currentUser.uid;
            const userCollectionRef = collection(db, "users", uid, "cards");

            await Promise.all(
              parsedCards.map((card) => {
                const cacheKey = getCardKey(card.name, card.set);
                const cardRef = doc(userCollectionRef, cacheKey);

                const sanitizedCard = {
                  ...card,
                  price: card.price ?? null,
                  manaTypes: card.manaTypes ?? [],
                  set: card.set ?? null,
                  setName: card.setName ?? null,
                  type: card.type ?? null,
                  quantityOwned: card.quantityOwned ?? 1,
                };

                return setDoc(cardRef, sanitizedCard);
              })
            );

            const timestamp = format(new Date(), "MMMM dd yyyy,  hh:mm a");
            await setDoc(
              doc(db, "users", uid),
              {
                collectionUpdatedAt: timestamp,
              },
              { merge: true }
            );

            setUploadTime(timestamp);
            setCollectionSummary(getCollectionSummary(parsedCards));
            setLoading(false);

            navigate("/collection?reload=true");
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
      await loadBulkCardData();

      const normalizedCardName = normalizeCardName(cardName);
      const ownedCards = await getCardsFromStorage();
      const ownedMatch = ownedCards.find(
        (card) => normalizeCardName(card.name) === normalizedCardName
      );

      let newCard: DeckCard;
      if (!ownedMatch) {
        const scryfallCard = await getScryfallCard({
          cardName: normalizedCardName,
          set: setPreference,
        });

        const type = normalizeCardType(scryfallCard?.type);
        let setName = scryfallCard?.setName; // To do: Fix this to use scryfall set name, currently not exposed
        if (
          normalizedCardName === "Mountain" ||
          normalizedCardName === "Plains" ||
          normalizedCardName == "Island" ||
          normalizedCardName === "Swamp" ||
          normalizedCardName === "Forest"
        ) {
          setName = "Any";
        }

        newCard = {
          imageUrl: scryfallCard?.imageUrl,
          name: normalizedCardName,
          price: scryfallCard?.price && scryfallCard.price * 1.37, //To do, convert to CAD
          type,
          set: scryfallCard?.set ?? "Any",
          setName: setName ?? "Any",
          quantityNeeded: quantityNeeded ?? 1,
          quantityOwned: 0,
          manaTypes: scryfallCard?.manaTypes,
        };
      } else {
        newCard = {
          ...ownedMatch,
          quantityNeeded: quantityNeeded ?? 1,
          quantityOwned: ownedMatch.quantityOwned,
        };
      }

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
          await onDeckCardAdd(name, quantity, undefined);
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
