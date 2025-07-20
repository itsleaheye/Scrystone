import React from "react";
import type { Deck, DeckCard, DeckFormat } from "../types/MagicTheGathering";
import {
  generateUniqueDeckId,
  getDeckCost,
  getDeckManaSummary,
} from "../utils/decks";
import { getCardsFromStorage } from "../utils/storage";
import { normalizeCardName } from "../utils/normalize";

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

    const ownedCards = getCardsFromStorage();

    const deckCards: DeckCard[] = cards.map((card) => {
      const normalizedName = card.name ? normalizeCardName(card.name) : "";
      let quantityOwned = 0;

      if (card.setName === "Any") {
        // Sum all owned cards with matching name
        quantityOwned = ownedCards
          .filter((owned) => normalizeCardName(owned.name) === normalizedName)
          .reduce((sum, owned) => sum + (owned.quantityOwned ?? 0), 0);
      } else {
        // Match by name and set
        const match = ownedCards.find(
          (owned) =>
            normalizeCardName(owned.name) === normalizedName &&
            owned.set === card.set
        );
        quantityOwned = match?.quantityOwned ?? 0;
      }

      return {
        ...card,
        quantityOwned,
      };
    });

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
      fileContent += `${card.quantityNeeded}x ${card.name} \n`;
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

        fileContent += `${stillNeeds}x ${card.name} \n`;
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
