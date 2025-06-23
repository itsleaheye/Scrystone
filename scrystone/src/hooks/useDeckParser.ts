import React from "react";
import type {
  CollectionCard,
  Card,
  MissingCard,
  Deck,
  DeckCard,
  CardTypeSummary,
} from "../types/MagicTheGathering";

const CARD_TYPES = ["Creature", "Enchantment", "Instant", "Land"];

export function useDeckParser() {
  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleError = (message: string) => {
    setLoading(false);
    setError(message);
  };

  const onCreateDeck = (deck: Deck) => {
    const stored = localStorage.getItem("mtg_decks");
    let decksArray: Deck[] = [];
    setLoading(true);

    if (stored) {
      try {
        decksArray = JSON.parse(stored);
      } catch {
        handleError(
          "Error parsing stored decks. Please check your localStorage config."
        );
        decksArray = [];
      }
    }
    decksArray.push(deck);
    localStorage.setItem("mtg_decks", JSON.stringify(decksArray));

    setDecks(decksArray);
    setLoading(false);
  };

  const getDeckTypeSummary = (cards: DeckCard[] | Card[] | MissingCard[]) => {
    // Fetch owned cards and the quantities of these cards
    const ownedRawCards = localStorage.getItem("mtg_cards");
    const ownedCards: CollectionCard[] = ownedRawCards
      ? JSON.parse(ownedRawCards)
      : [];

    const ownedByName = new Map<string, CollectionCard>();
    ownedCards.forEach((card) => {
      ownedByName.set(card.name, card);
    });

    const quantityNeededByType = new Map<string, number>();
    const quantityOwnedByType = new Map<string, number>();

    cards.forEach((deckCard) => {
      if (!deckCard.type) return;

      quantityNeededByType.set(
        deckCard.type,
        (quantityNeededByType.get(deckCard.type) ?? 0) + 1
      );

      const ownedCard = ownedByName.get(deckCard.name);
      quantityOwnedByType.set(
        deckCard.type,
        (quantityOwnedByType.get(deckCard.type) ?? 0) +
          (ownedCard?.quantityOwned ?? 0)
      );
    });

    return Array.from(quantityNeededByType.entries()).map(
      ([type, quantityNeeded]) => ({
        type,
        quantityNeeded,
        quantityOwned: Number(quantityOwnedByType.get(type)) ?? 0,
      })
    );
  };

  const getDeckTypeSummaryWithDefaults = (
    cards: DeckCard[] | Card[] | MissingCard[]
  ): CardTypeSummary[] => {
    const summary = getDeckTypeSummary(cards);
    const summaryMap = new Map(summary.map((item) => [item.type, item]));

    const merged = CARD_TYPES.map((type) => {
      if (summaryMap.has(type)) {
        return summaryMap.get(type)!;
      } else {
        return {
          type,
          quantityNeeded: 0,
          quantityOwned: 0,
        };
      }
    });

    return merged;
  };

  return {
    decks,
    loading,
    error,
    onCreateDeck,
    getDeckTypeSummary,
    getDeckTypeSummaryWithDefaults,
  };
}
