import React from "react";
import type { Card } from "../types/MagicTheGathering";
import Papa from "papaparse";

const parseMana = (
  manaCostStr: string
): { number?: number; letter?: string } => {
  const numberMatch = manaCostStr.match(/{(\d+)}/);
  const letterMatch = manaCostStr.match(/{([WUBRG])}/);

  return {
    number: numberMatch ? parseInt(numberMatch[1], 10) : undefined,
    letter: letterMatch ? letterMatch[1] : undefined,
  };
};

const fetchCardDetails = async (cardName: string): Promise<Partial<Card>> => {
  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
        cardName
      )}`
    );
    const data = await response.json();

    // To do, based on the type of card, we can generate different images like art crop, border crop, large, normal, png small
    const imageUrl =
      data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal;

    const manaType = parseMana(data.mana_cost || "");

    return {
      artist: data.artist,
      imageUrl: imageUrl || "",
      isFoil: data.foil || false,
      manaCost: manaType.number,
      manaType: manaType.letter,
      name: data.name,
      number: data.collector_number,
      price: parseFloat(data.prices?.usd ?? "0"), //To do: Fetch price based on card condition then translate into CAD
      rarity: data.rarity,
      set: data.set_name,
      type: data.type_line,
    };
  } catch (error) {
    console.error(`Error fetching card details for "${cardName}":`, error);
    return {};
  }
};

export function useCardParser() {
  const [cards, setCards] = React.useState<Card[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleError = (message: string) => {
    setLoading(false);
    setError(message);
  };

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return handleError("Please select a file to upload.");
    }

    setLoading(true);

    // Parse the CSV file of MTG cards
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rawCards = results.data as any[];
        const cardMap: { [key: string]: Card } = {};

        // Collect unique card names and their quantities
        const nameQuantityMap: { [key: string]: number } = {};
        for (const row of rawCards) {
          const name = row["Product Name"] || row["Card Name"] || row["Name"];
          // Skip rows without a valid name
          if (!name) continue;

          let quantity = parseInt(row["Quantity"] || "1", 10);
          // Ensure quantity is a valid number and at least 1
          if (isNaN(quantity) || quantity < 1) quantity = 1;

          // Aggregate quantities for the same card name
          nameQuantityMap[name] = (nameQuantityMap[name] || 0) + quantity;
        }

        // Fetch all card details in parallel
        const cardNames = Object.keys(nameQuantityMap);
        const cardDetails = await Promise.all(
          cardNames.map((name) => fetchCardDetails(name))
        );

        // Build card map
        cardNames.forEach((name, idx) => {
          cardMap[name] = {
            ...cardDetails[idx],
            name,
            quantity: nameQuantityMap[name],
          } as Card;
        });

        setCards(Object.values(cardMap));
        setLoading(false);
      },
    });
  };

  // To do: Fetch summary of cards and filtering

  return {
    cards,
    setCards,
    loading,
    error,
    collection: {
      size: cards.length,
      value: cards.reduce(
        (sum, card) => sum + (card.price ?? 0) * card.quantity,
        0
      ),
    },
    onFileUpload,
  };
}
