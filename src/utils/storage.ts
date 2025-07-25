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

  if (deckId === undefined) {
    return decks;
  } else {
    return decks.filter((d) => d.id == deckId);
  }
}

// For the sake of performance, let's cache previously fetched cards
type ScryfallCardCache = Record<string, any>;
const LOCAL_STORAGE_KEY = "scryfall_card_cache";

export function getCachedCard(cacheKey: string): any | null {
  const cache = getCache();

  return cache[cacheKey] || null;
}

export function setCachedCard(cacheKey: string, data: any) {
  const cache = getCache();

  cache[cacheKey] = data;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
}

function getCache(): ScryfallCardCache {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
