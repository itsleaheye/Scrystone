import type { CollectionCard, Deck } from "../../types/MagicTheGathering";

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
