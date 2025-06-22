import React from "react";
import type { Card, Deck, DeckCard } from "../types/MagicTheGathering";

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
  return { decks, loading, error, onCreateDeck };
}
