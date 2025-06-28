import React from "react";
import type {
  CollectionCard,
  Deck,
  DeckCard,
  CardTypeSummary,
} from "../types/MagicTheGathering";
import { getCardsFromStorage } from "../components/utils/storage";
import { getDeckCost, getDeckManaSummary } from "../components/utils/decks";

const CARD_TYPES = ["Creature", "Enchantment", "Instant", "Land"];

const normalizeName = (name: string) => {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
};

const generateUniqueDeckId = (): number => {
  return Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);
};

export function useDeckParser() {
  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleError = (message: string) => {
    setLoading(false);
    setError(message);
  };

  const onDeckSave = (
    cards: DeckCard[],
    name: string,
    format: string,
    id?: number,
    description?: string
  ) => {
    const existingRawDecks = localStorage.getItem("mtg_decks");
    const existingDecks: Deck[] = existingRawDecks
      ? JSON.parse(existingRawDecks)
      : [];

    const deckCards: DeckCard[] = cards.map((card) => ({
      ...card,
      quantityNeeded: card.quantityNeeded,
      quantityOwned: card.quantityOwned,
    }));

    const colours = getDeckManaSummary(deckCards);
    const deckPrice = getDeckCost(cards);

    const deck: Deck = {
      id: id ?? generateUniqueDeckId(),
      name: name ?? "Unnamed Deck",
      description,
      format: format == "Commander" ? "Commander" : "Standard",
      colours: colours,
      cards: deckCards,
      size: cards.length,
      price: deckPrice,
    };

    const updatedDecks = (() => {
      const index = existingDecks.findIndex((d) => d.id === deck.id);

      if (index !== -1) {
        const decksCopy = [...existingDecks];
        decksCopy[index] = deck;

        return decksCopy;
      } else {
        return [...existingDecks, deck];
      }
    })();

    localStorage.setItem("mtg_decks", JSON.stringify(updatedDecks));
    setDecks(updatedDecks);

    return deck;
  };

  const getDeckTypeSummary = (cards: DeckCard[]) => {
    const ownedCards: CollectionCard[] = getCardsFromStorage();
    const ownedByName = new Map(
      ownedCards.map((card) => [normalizeName(card.name), card])
    );

    const deckCountByName = new Map<
      string,
      { type: string; quantityNeeded: number }
    >();

    cards.forEach((card) => {
      if (!card.name || !card.type) return;

      const cardName = normalizeName(card.name);

      deckCountByName.set(cardName, {
        type: card.type,
        quantityNeeded: card?.quantityNeeded ?? 0,
      });
    });

    const quantityNeededByType = new Map<string, number>();
    const quantityOwnedByType = new Map<string, number>();

    deckCountByName.forEach(({ type, quantityNeeded }, cardName) => {
      const quantityOwned = ownedByName.get(cardName)?.quantityOwned ?? 0;

      quantityNeededByType.set(
        type,
        (quantityNeededByType.get(type) ?? 0) + quantityNeeded
      );

      quantityOwnedByType.set(
        type,
        (quantityOwnedByType.get(type) ?? 0) +
          Math.min(quantityOwned, quantityNeeded)
      );
    });

    return Array.from(quantityNeededByType.entries()).map(
      ([type, quantityNeeded]) => ({
        type,
        quantityNeeded,
        quantityOwned: quantityOwnedByType.get(type) ?? 0,
      })
    );
  };

  const getDeckTypeSummaryWithDefaults = (
    cards: DeckCard[]
  ): CardTypeSummary[] => {
    const deckTypeSummary = getDeckTypeSummary(cards);

    const summaries = new Map(deckTypeSummary.map((item) => [item.type, item]));

    const mergedSummary = CARD_TYPES.map((type) => {
      if (summaries.has(type)) {
        return summaries.get(type)!;
      } else {
        return {
          type,
          quantityNeeded: 0,
          quantityOwned: 0,
        };
      }
    });

    return mergedSummary;
  };

  return {
    decks,
    setDecks,
    loading,
    error,
    onDeckSave,
    getDeckTypeSummary,
    getDeckTypeSummaryWithDefaults,
  };
}
