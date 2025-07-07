import React from "react";
import type { Deck, DeckCard, DeckFormat } from "../types/MagicTheGathering";
import {
  generateUniqueDeckId,
  getDeckCost,
  getDeckManaSummary,
} from "../utils/decks";

export function useDeckParser() {
  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const isValidFormat = (value: any): value is DeckFormat => {
    return ["Commander", "Standard", "Draft"].includes(value);
  };

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
    const validFormat: DeckFormat = isValidFormat(format)
      ? format
      : "Commander";

    const deck: Deck = {
      id: id ?? generateUniqueDeckId(),
      name: name.length > 1 ? name : "Unnamed Deck",
      description,
      format: validFormat,
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

  const onDeckDelete = (id: number) => {
    setLoading(true);

    const existingRawDecks = localStorage.getItem("mtg_decks");
    const existingDecks: Deck[] = existingRawDecks
      ? JSON.parse(existingRawDecks)
      : [];

    const updatedDecks = existingDecks.filter((deck) => deck.id !== id);

    localStorage.setItem("mtg_decks", JSON.stringify(updatedDecks));
    setDecks(updatedDecks);
    setLoading(false);
  };

  const onDeckExport = (
    deckCards: DeckCard[],
    deckName: string,
    format: string
  ) => {
    const sortedCards = [...deckCards].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

    // Deck list full header
    const header = `**${deckName} Complete Card List | ${format}**\n`;
    let fileContent = header;
    fileContent += "=".repeat(header.length) + "\n";

    // Add individual card
    sortedCards.forEach((card) => {
      const price = card.price ? `$${Number(card.price).toFixed(2)}` : "$n/a";

      fileContent += `${card.quantityNeeded} ${card.name} | (${
        card.set ?? "Unknown Set"
      }) | ${price} per\n`;
    });

    // Seperate section for missing cards
    const missingCards = sortedCards.filter(
      (card) => (card.quantityOwned ?? 0) < (card.quantityNeeded ?? 0)
    );
    if (missingCards.length > 0) {
      // Missing cards list header
      const missingHeader = `\n**The Following Cards Are Still Needed**\n`;
      fileContent += missingHeader;
      fileContent += "=".repeat(missingHeader.length) + "\n";

      missingCards.forEach((card) => {
        const stillNeeds =
          (card.quantityNeeded ?? 0) - (card.quantityOwned ?? 0);
        const price = card.price ? `$${Number(card.price).toFixed(2)}` : "$n/a";

        fileContent += `${stillNeeds} ${card.name} | (${
          card.set ?? "Unknown Set"
        }) | ${price} per\n`;
      });
    }

    // Binary Large Object
    const blob = new Blob([fileContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${deckName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    decks,
    isValidFormat,
    loading,
    onDeckDelete,
    onDeckExport,
    onDeckSave,
    setDecks,
  };
}
