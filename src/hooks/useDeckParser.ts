import React from "react";
import type { Deck, DeckCard, DeckFormat } from "../types/MagicTheGathering";
import {
  generateUniqueDeckId,
  getDeckCost,
  getDeckManaSummary,
} from "../utils/decks";
import { getCardsFromStorage, getDecksFromStorage } from "../utils/storage";
import { normalizeCardName } from "../utils/normalize";
import { auth, db } from "../firebase";
import { deleteDoc, doc, setDoc } from "firebase/firestore";

export function useDeckParser() {
  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const isValidFormat = (value: any): value is DeckFormat => {
    return ["Commander", "Standard", "Draft"].includes(value);
  };

  const onDeckSave = async (
    cards: DeckCard[],
    name: string,
    format: string,
    id?: number,
    description?: string
  ) => {
    setLoading(true);

    const existingDecks = await getDecksFromStorage();
    const ownedCards = await getCardsFromStorage();

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
            owned.setName === card.setName
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
      description: description,
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

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await setDoc(doc(db, "users", uid, "decks", String(deck.id)), deck);

    setDecks(updatedDecks);
    setLoading(false);

    return deck;
  };

  const onDeckDelete = async (id: number) => {
    setLoading(true);

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const deckRef = doc(db, "users", uid, "decks", id.toString());
      await deleteDoc(deckRef);

      setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== id));
    } catch (error) {
      console.error("Error deleting card:", error);
    } finally {
      setLoading(false);
    }
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
      fileContent += `${card.quantityNeeded} ${card.name} \n`;
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
