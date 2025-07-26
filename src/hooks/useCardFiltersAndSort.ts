import { useMemo } from "react";
import type { CollectionCard } from "../types/MagicTheGathering";

interface UseCardFiltersAndSort {
  cards: (CollectionCard & {
    quantityOwned: number;
    quantityNeeded?: number;
  })[];
  filterColour: string[];
  filterType: string[];
  searchTerm?: string;
  sortBy: string;
}

export function useCardFiltersAndSort({
  cards,
  filterColour,
  filterType,
  searchTerm = "",
  sortBy,
}: UseCardFiltersAndSort) {
  return useMemo(() => {
    let filtered = [...cards];

    // Filter handling
    if (filterType.length > 0) {
      filtered = filtered.filter((c) =>
        filterType.some((type) => c.type?.includes(type))
      );
    }
    if (filterColour.length > 0) {
      filtered = filtered.filter((c) =>
        c.manaTypes?.some((colour) => filterColour.includes(colour))
      );
    }

    if (searchTerm?.trim().length > 1) {
      const loweredSearch = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((card) =>
        card.name?.toLowerCase().includes(loweredSearch)
      );
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
  }, [cards, sortBy, filterType, filterColour, searchTerm]);
}
