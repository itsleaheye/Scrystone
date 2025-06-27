import type { CollectionCard } from "../../types/MagicTheGathering";

export function getCardsFromStorage(): CollectionCard[] {
  const rawCards = localStorage.getItem("mtg_cards");

  return rawCards ? (JSON.parse(rawCards) as CollectionCard[]) : [];
}
