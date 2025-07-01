import { useMemo } from "react";
import type { CollectionCard, Deck } from "../types/MagicTheGathering";

interface UseCardFiltersAndSort {
  cards: (CollectionCard & {
    quantityOwned: number;
    quantityNeeded?: number;
  })[];
  decks: Deck[];
  filterColour: string;
  filterDeck: string;
  filterType: string;
  sortBy: string;
}

export function useCardFiltersAndSort({
  cards,
  decks,
  filterColour,
  filterDeck,
  filterType,
  sortBy,
}: UseCardFiltersAndSort) {
  return useMemo(() => {
    let filtered = [...cards];

    // Filter handling
    if (filterType !== "All") {
      filtered = filtered.filter((c) => c.type?.includes(filterType));
    }
    if (filterColour !== "All") {
      filtered = filtered.filter((c) => c.manaTypes?.includes(filterColour));
    }
    if (filterDeck !== "All") {
      const matchingDeck = decks.find((d) => d.name === filterDeck);
      if (matchingDeck) {
        const deckCardNames = new Set(
          matchingDeck.cards.map((c) => c.name.toLowerCase())
        );
        filtered = filtered.filter((c) =>
          deckCardNames.has(c.name?.toLowerCase() ?? "")
        );
      }
    }

    // Follow with sort handling
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "Type":
          return (a.type ?? "").localeCompare(b.type ?? "");
        case "Price":
          return (b.price ?? 0) - (a.price ?? 0);
        default:
          return (a.name ?? "").localeCompare(b.name ?? "");
      }
    });
  }, [cards, sortBy, filterType, filterColour, filterDeck]);
}
