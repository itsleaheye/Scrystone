import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { CollectionCard, Deck } from "../types/MagicTheGathering";
import { normalizeCardName } from "./normalize";

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
  console.log("Fetching decks for user:", decks);

  if (deckId === undefined) {
    return decks;
  } else {
    return decks.filter((d) => d.id == deckId);
  }
}

// For the sake of performance, let's cache previously fetched cards
type ScryfallCardCache = Record<string, any>;
const LOCAL_STORAGE_KEY = "scryfall_card_cache";

export function getCachedCard(name: string): any | null {
  const cache = getCache();

  return cache[normalizeCardName(name)] || null;
}

export function setCachedCard(name: string, data: any) {
  const cache = getCache();

  cache[normalizeCardName(name)] = data;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
}

function getCache(): ScryfallCardCache {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

import { onAuthStateChanged } from "firebase/auth";

export function waitForUser(): Promise<string> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // clean up listener
      if (user?.uid) resolve(user.uid);
      else reject(new Error("User not logged in"));
    });
  });
}
