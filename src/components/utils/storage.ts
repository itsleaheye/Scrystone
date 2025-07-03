import type { CollectionCard, Deck } from "../../types/MagicTheGathering";
import { normalizeCardName } from "./normalize";

export function getCardsFromStorage(): CollectionCard[] {
  const rawCards = localStorage.getItem("mtg_cards");

  return rawCards ? (JSON.parse(rawCards) as CollectionCard[]) : [];
}

export function getDecksFromStorage(deckId?: number): Deck[] {
  const rawDecks = localStorage.getItem("mtg_decks");
  const allDecks = rawDecks ? (JSON.parse(rawDecks) as Deck[]) : [];

  if (deckId === undefined) {
    return allDecks;
  } else {
    return allDecks.filter((d) => d.id == deckId);
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
