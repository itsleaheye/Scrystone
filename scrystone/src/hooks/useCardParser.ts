import React from "react";
import type {
  Card,
  CollectionCard,
  DeckCard,
} from "../types/MagicTheGathering";
import Papa from "papaparse";

export function getCardsFromStorage(): CollectionCard[] {
  const rawCards = localStorage.getItem("mtg_cards");

  return rawCards ? (JSON.parse(rawCards) as CollectionCard[]) : [];
}

interface ScryfallDetails {
  previewUrl?: string;
  price: number;
  manaCost?: number;
  manaType?: string;
  type: string;
}

const getScryfallCardDetails = async (
  cardName: string
): Promise<ScryfallDetails | undefined> => {
  try {
    // This will remove anything in brackets at the end of the card name (e.g., "Card Name (Set)") and trim whitespace
    const normalizedCardName = cardName.replace(/\s*\(.*\)\s*$/, "").trim();

    const query = encodeURIComponent(normalizedCardName);
    const response = await fetch(
      `https://api.scryfall.com/cards/named?exact=${query}`
    );
    if (!response.ok) return;

    const data = await response.json();

    const parseMana = (
      manaCostStr: string
    ): { cost?: number; colour?: string } => {
      const numberMatch = manaCostStr.match(/{(\d+)}/);
      const letterMatch = manaCostStr.match(/{([WUBRG])}/);

      return {
        cost: numberMatch ? parseInt(numberMatch[1], 10) : undefined,
        colour: letterMatch ? letterMatch[1] : undefined,
      };
    };
    const { cost, colour } = parseMana(data.mana_cost);

    return {
      previewUrl:
        data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal,
      price: data.prices.usd,
      manaCost: cost,
      manaType: colour,
      type: data.type_line.split("—")[0].trim().split(" ")[0],
    };
  } catch (error) {
    console.error(`Error fetching card preview for "${cardName}":`, error);
    return;
  }
};

export function useCardParser() {
  const [cards, setCards] = React.useState<Card[] | DeckCard[]>([]); // Used to track temporary cards
  // const [collectionCards, setCollectionCards] = React.useState<
  //   CollectionCard[]
  // >([]); // Used to track owned cards
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

    // Parse the CSV file of MTG cards
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawCards = results.data as any[];
          const cardsWithDetails = await Promise.all(
            rawCards.map(async (rawCard) => {
              const name = rawCard.Name?.trim();
              if (!name || name.toLowerCase().includes("token")) return null;

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
    const scryfallDetails = await getScryfallCardDetails(cardName);
    const newCard = {
      imageUrl: scryfallDetails?.previewUrl,
      name: cardName,
      price: scryfallDetails?.price,
      type: scryfallDetails?.type,
      quantityNeeded: 1,
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
