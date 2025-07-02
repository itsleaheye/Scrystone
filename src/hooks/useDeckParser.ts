import React from "react";
import type { Deck, DeckCard } from "../types/MagicTheGathering";
import {
  generateUniqueDeckId,
  getDeckCost,
  getDeckManaSummary,
} from "../components/utils/decks";

export function useDeckParser() {
  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const onDeckSave = (
    cards: DeckCard[],
    name: string,
    format: string,
    id?: number,
    description?: string
  ) => {
    setLoading(true);

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
      name: name.length > 1 ? name : "Unnamed Deck",
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
    setLoading(false);

    return deck;
  };

  return {
    decks,
    setDecks,
    loading,
    onDeckSave,
  };
}
