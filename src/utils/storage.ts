import { collection, getDocs } from "firebase/firestore";
import type { CollectionCard, Deck } from "../types/MagicTheGathering";
import { waitForUser } from "./auth";
import { db } from "../firebase";

export async function getCardsFromStorage(): Promise<CollectionCard[]> {
  const uid = await waitForUser();
  if (!uid) return [];

  const snapshot = await getDocs(collection(db, "users", uid, "cards"));
  return snapshot.docs.map((doc) => doc.data() as CollectionCard);
}

export async function getDecksFromStorage(deckId?: number): Promise<Deck[]> {
  const uid = await waitForUser();
  if (!uid) return [];

  const snapshot = await getDocs(collection(db, "users", uid, "decks"));
  const decks = snapshot.docs.map((doc) => doc.data() as Deck);

  // Handle querying for a single deck or all
  if (deckId === undefined) {
    return decks;
  } else {
    return decks.filter((deck) => deck.id == deckId);
  }
}
