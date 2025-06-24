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

function normalizeCardName(cardname: string) {
  // Remove parenthetical suffixes like (Showcase)
  let normalized = cardname.replace(/\s*\([^)]+\)\s*$/, "").trim();

  // Remove anything after ' - '
  normalized = normalized.split(" - ")[0].trim();

  // Remove prefixes like "Checklist Card - ", "Token - ", etc.
  normalized = normalized.replace(
    /^(Checklist Card|Token|Token Card|Emblem|Plane) - /i,
    ""
  );

  // Remove quotation marks (") and trim
  normalized = normalized.replace(/"/g, "").trim();

  return normalized;
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
    // This will remove anything in brackets at the end of the card name ("Card Name (Set)")
    // const normalizedCardName = cardName.replace(/\s*\(.*\)\s*$/, "").trim();
    const normalizedCardName = normalizeCardName(cardName);
    const query = encodeURIComponent(normalizedCardName);

    // Exact match
    let response = await fetch(
      `https://api.scryfall.com/cards/named?exact=${query}`
    );
    if (!response.ok) {
      response = await fetch(
        `https://api.scryfall.com/cards/search?q=${query}`
      );

      if (!response.ok) return;
    }

    let data = await response.json();
    data = Array.isArray(data.data) ? data.data[0] : data;

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
