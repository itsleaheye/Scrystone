import React from "react";
import type { CollectionCard, DeckCard } from "../types/MagicTheGathering";
import Papa from "papaparse";

export function getMana(manaCostStr: string): {
  cost?: number;
  colour?: string;
} {
  // manaCostStr comes from scryfall as '2{B}' or '{2}{W}{W}'
  const numberMatch = manaCostStr.match(/{(\d+)}/);
  const letterMatch = manaCostStr.match(/{([WUBRG])}/);

  return {
    cost: numberMatch ? parseInt(numberMatch[1], 10) : undefined,
    colour: letterMatch ? letterMatch[1] : undefined,
  };
}

export function getCardsFromStorage(): CollectionCard[] {
  const rawCards = localStorage.getItem("mtg_cards");

  return rawCards ? (JSON.parse(rawCards) as CollectionCard[]) : [];
}

export function getCollectionSummary(cards?: CollectionCard[]): {
  size: number;
  value: number;
} {
  return (cards ?? []).reduce(
    (acc, card) => {
      const quantity = card.quantityOwned ?? 0;
      const price = parseFloat(card.price?.toString() ?? "0");

      acc.size += quantity;
      // If is a valid number
      if (!isNaN(price)) {
        acc.value += quantity * price;
      }

      return acc;
    },
    { size: 0, value: 0 }
  );
}

export function normalizeName(name: string): string {
  return name
    .replace(/\s*\([^)]+\)/g, "") // Remove all '()' groups
    .split(" - ")[0] // Use only the part before ' - s'
    .split("//")[0] // Use only the part before '//'
    .replace(/^(Checklist Card|Token|Token Card|Emblem|Plane)\s*-\s*/i, "") // Remove prefix
    .replace(/"/g, "") // Remove quotation marks
    .trim(); // Remove trailing white spaces
}

interface ScryfallDetails {
  manaCost?: number;
  manaType?: string;
  previewUrl?: string;
  price: number;
  type: string;
}

const getScryfallCardDetails = async (
  cardName: string
): Promise<ScryfallDetails | undefined> => {
  const query = encodeURIComponent(normalizeName(cardName));
  const urls = [
    `https://api.scryfall.com/cards/named?fuzzy=${query}`, //fuzzy search
    `https://api.scryfall.com/cards/search?q=${query}`, // general search
    `https://api.scryfall.com/cards/search?q=!${query}`, // exact search
  ];

  try {
    let data: any;
    // Run through each query url and check for a match of scyfall card data
    for (const url of urls) {
      const response = await fetch(url);
      if (!response.ok) continue;

      data = await response.json();

      // If response returns an array, take the first card data and stop if valid
      data = Array.isArray(data.data) ? data.data[0] : data;
      if (data) break;
    }

    // If no matching cards were ever found, log it
    if (!data) {
      console.warn(`Card details not found: ${cardName}`);
      return;
    }

    // Normalizes our returned data to a single card object
    const card = Array.isArray(data.data) ? data.data[0] : data;

    // Parse mana string
    const { cost, colour } = card.mana_cost
      ? getMana(card.mana_cost)
      : { cost: undefined, colour: undefined };

    return {
      previewUrl:
        card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal,
      price: parseFloat(card.prices?.usd) || 0,
      manaCost: cost,
      manaType: colour,
      type: card.type_line?.split("—")[0]?.trim().split(" ")[0],
    };
  } catch (error) {
    console.error(`Error fetching card details for "${cardName}":`, error);

    return;
  }
};

export function useCardParser() {
  const [cards, setCards] = React.useState<DeckCard[]>([]); // Track temp cards
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleError = (message: string) => {
    setLoading(false);
    setError(message);
  };

  const onCollectionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return handleError("Please select a .csv file to upload");
    }

    setLoading(true);

    // Parse the CSV file of your MTG cards
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawCards = results.data as any[];
          const cardsWithDetails = await Promise.all(
            rawCards.map(async (rawCard) => {
              const name = rawCard.Name?.trim();
              if (
                !name ||
                name.toLowerCase().includes("token") ||
                name.toLowerCase().includes("checklist")
              )
                return null;

              const scryfallDetails = await getScryfallCardDetails(name);

              const collectionCard: CollectionCard = {
                name,
                manaCost: scryfallDetails?.manaCost,
                manaType: scryfallDetails?.manaType,
                number: rawCard["Card Number"],
                price: scryfallDetails?.price
                  ? scryfallDetails?.price * 1.37
                  : undefined, //Find a way to grab the real time exchange rate
                rarity: rawCard["Rarity"],
                set: rawCard["Set"],
                type: scryfallDetails?.type,
                isFoil: rawCard.isFoil,
                imageUrl: scryfallDetails?.previewUrl,
                quantityOwned: rawCard["Quantity"] || 1,
              };

              return collectionCard;
            })
          );

          const combineCardQuantities = (
            cardsWithDetails.filter(Boolean) as CollectionCard[]
          ).reduce((acc, card) => {
            const cardName = card.name.toLowerCase();
            const existingCard = acc.find(
              (c) => c.name.toLowerCase() === cardName
            );

            if (existingCard) {
              existingCard.quantityOwned += Number(card.quantityOwned) || 1;
            } else {
              acc.push({
                ...card,
                quantityOwned: Number(card.quantityOwned) || 1,
              });
            }
            return acc;
          }, [] as CollectionCard[]);

          localStorage.setItem(
            "mtg_cards",
            JSON.stringify(combineCardQuantities)
          );
          setLoading(false);
        } catch {
          setLoading(false);
          handleError("Error uploading cards. Try again later.");
        }
      },
    });
  };

  const onDeckCardAdd = async (cardName: string) => {
    const ownedCards = getCardsFromStorage();
    const ownedMatch = ownedCards.find(
      (card) => card.name.trim().toLowerCase() === cardName.trim().toLowerCase()
    );

    const scryfallDetails = await getScryfallCardDetails(cardName);
    const newCard = {
      imageUrl: scryfallDetails?.previewUrl,
      name: cardName,
      price: scryfallDetails?.price,
      type: scryfallDetails?.type,
      quantityNeeded: 1,
      quantityOwned: ownedMatch?.quantityOwned,
    } as DeckCard;

    setCards((prevCards) => [...prevCards, newCard]);
  };

  const storedCards = getCardsFromStorage();

  return {
    cards,
    setCards,
    loading,
    error,
    collection: {
      size: storedCards.length,
      value: storedCards.reduce(
        (sum, card) => sum + (card.price ?? 0) * card.quantityOwned,
        0
      ),
    },
    onCollectionUpload,
    onDeckCardAdd,
  };
}
