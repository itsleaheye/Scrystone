import type { DeckCard } from "../types/MagicTheGathering";
import Papa from "papaparse";
import { getScryfallCard } from "../utils/scryfall";
import { normalizeCardName, normalizeCardType } from "../utils/normalize";
import { parseCsvToCollection } from "../utils/parseCsvToCollection";
import { getCardsFromStorage } from "../utils/storage";
import { getCollectionSummary } from "../utils/summaries";
import { format } from "date-fns";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { auth, db } from "../firebase";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { getCardKey, loadBulkCardData } from "../utils/cards";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { updateDecksQuantities } from "./useDeckParser";

export function useCardParser() {
  const navigate = useNavigate();

  const [cards, setCards] = useState<DeckCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [uploadTime, setUploadTime] = useState<string | null>(null);

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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const uid = user.uid;
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.collectionUpdatedAt) {
          setUploadTime(data.collectionUpdatedAt);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleError = (message: string) => {
    setLoading(false);
    setError(message);
  };

  const onCollectionUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file)
        return handleError(
          "Unsupported file type. Please upload a .csv or .txt file"
        );

      setLoading(true);
      setCurrentProgress(0);
      setTotalProgress(0);

      try {
        const collectionFile = file.name.toLowerCase().endsWith(".txt")
          ? await file.text()
          : file;

        Papa.parse(collectionFile, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            if (!auth.currentUser) {
              handleError("You must be logged in to upload your collection.");
              return;
            }

            const uid = auth.currentUser.uid;
            const userCollectionRef = collection(db, "users", uid, "cards");
            const rawCards = results.data as any[];

            // Load existing cards from the db
            const existingCardsMap = new Map<string, number>();
            const snapshot = await getDocs(userCollectionRef);
            snapshot.forEach((doc) => {
              const data = doc.data();
              const key = getCardKey(data.name, data.set);
              existingCardsMap.set(key, data.quantityOwned ?? 0);
            });

            const parsedCards = await parseCsvToCollection(
              rawCards,
              (processed, total) => {
                setCurrentProgress(processed);
                setTotalProgress(total);
              }
            );

            await Promise.all(
              parsedCards.map(async (card) => {
                const cacheKey = getCardKey(card.name, card.set);
                const cardRef = doc(userCollectionRef, cacheKey);

                // If already in Firebase db, we only update the quantity
                if (existingCardsMap.has(cacheKey)) {
                  await setDoc(
                    cardRef,
                    { quantityOwned: Number(card.quantityOwned ?? 1) },
                    { merge: true }
                  );
                } else {
                  const type = normalizeCardType(card.type);

                  const sanitizedCard = {
                    ...card,
                    price: card.price ?? null,
                    manaTypes: card.manaTypes ?? [],
                    set: card.set ?? null,
                    setName: card.setName ?? null,
                    type,
                    quantityOwned: card.quantityOwned ?? 1,
                  };
                  await setDoc(cardRef, sanitizedCard);
                }
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

            // await updateDecksQuantities(uid, parsedCards);

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

        let setName = scryfallCard?.setName;
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
        const type = normalizeCardType(ownedMatch?.type);
        let setName = ownedMatch?.setName;
        let set = ownedMatch?.set;
        if (
          normalizedCardName === "Mountain" ||
          normalizedCardName === "Plains" ||
          normalizedCardName == "Island" ||
          normalizedCardName === "Swamp" ||
          normalizedCardName === "Forest"
        ) {
          setName = "Any";
          set = "Any";
        }

        newCard = {
          ...ownedMatch,
          type: type,
          set: set,
          setName: setName,
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
          const trimmed = line.trim();

          if (trimmed.startsWith("**The Following Cards Are Still Needed")) {
            readingDeck = false;
            break;
          }

          if (!readingDeck || !trimmed) continue;

          const match = trimmed.match(/^\s*(\d+)[xX]?\s+(.+)$/); // Supports `1x name`, `1 name`, `1 x name`, and `1X name`
          if (!match) continue;

          const quantity = parseInt(match[1], 10);
          const name = match[2].trim();

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
