import { useMemo, useState } from "react";
import type { Deck } from "../types/MagicTheGathering";

export type FilterByStatus = "all" | "isReady" | "isNotReady";
export type FilterByFormat = "all" | "commander" | "standard" | "draft";
export type SortBy =
  | "nameAsc"
  | "nameDesc"
  | "format"
  | "priceDesc"
  | "priceAsc";

export function useDeckFiltersAndSort(initialDecks: Deck[]) {
  const [filters, setFilters] = useState<{
    status: FilterByStatus;
    format: FilterByFormat;
    sort: SortBy;
  }>({
    status: "all",
    format: "all",
    sort: "nameAsc",
  });

  const statusFilters: Record<FilterByStatus, (deck: Deck) => boolean> = {
    all: () => true,
    isReady: (deck) =>
      deck.cards.every(
        (card) =>
          Number(card.quantityOwned ?? 0) >= Number(card.quantityNeeded ?? 0)
      ),
    isNotReady: (deck) =>
      deck.cards.some(
        (card) =>
          Number(card.quantityOwned ?? 0) < Number(card.quantityNeeded ?? 0)
      ),
  };

  const formatFilters: Record<FilterByFormat, (deck: Deck) => boolean> = {
    all: () => true,
    commander: (deck) => deck.format.toLowerCase() === "commander",
    standard: (deck) => deck.format.toLowerCase() === "standard",
    draft: (deck) => deck.format.toLowerCase() === "draft",
  };

  const sortFunctions: Record<SortBy, (a: Deck, b: Deck) => number> = {
    nameAsc: (a, b) => a.name.localeCompare(b.name),
    nameDesc: (a, b) => b.name.localeCompare(a.name),
    format: (a, b) => a.format.localeCompare(b.format),
    priceDesc: (a, b) => (b.price ?? 0) - (a.price ?? 0),
    priceAsc: (a, b) => (a.price ?? 0) - (b.price ?? 0),
  };

  const filteredAndSortedDecks = useMemo(() => {
    return initialDecks
      .filter(statusFilters[filters.status])
      .filter(formatFilters[filters.format])
      .sort(sortFunctions[filters.sort]);
  }, [initialDecks, filters]);

  return { filteredAndSortedDecks, filters, setFilters };
}
