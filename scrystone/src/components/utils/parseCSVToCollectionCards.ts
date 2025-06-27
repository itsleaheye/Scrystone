import type { CollectionCard } from "../../types/MagicTheGathering";
import { getScryfallCard } from "./scryfall";

export async function parseCSVToCollectionCards(
  rawCards: any[]
): Promise<CollectionCard[]> {
  //  Combine CSV card data with Scryfall card data
  const cards = await Promise.all(
    rawCards.map(async (rawCard) => {
      const name = rawCard.Name?.trim();

      if (
        !name ||
        name.toLowerCase().includes("token") ||
        name.toLowerCase().includes("checklist")
      )
        return null;

      const scryfallDetails = await getScryfallCard(name);

      return {
        name,
        manaCost: scryfallDetails?.manaCost,
        manaTypes: scryfallDetails?.manaTypes,
        number: rawCard["Card Number"],
        price: scryfallDetails?.price
          ? scryfallDetails.price * 1.37
          : undefined, // To do: Grab the real time exchange rate
        rarity: rawCard["Rarity"],
        set: rawCard["Set"],
        type: scryfallDetails?.type,
        isFoil: rawCard.isFoil, // To do: Maybe remove this? Or render foil art?
        imageUrl: scryfallDetails?.previewUrl,
        quantityOwned: rawCard["Quantity"] || 1,
      } as CollectionCard;
    })
  );

  // Combine cards with duplicate names
  return (cards.filter(Boolean) as CollectionCard[]).reduce((acc, card) => {
    const existingCard = acc.find(
      (c) => c.name.toLowerCase() === card.name.toLowerCase()
    );

    // Combine quantities
    if (existingCard) {
      existingCard.quantityOwned += Number(card.quantityOwned) || 1;
    } else {
      acc.push({ ...card });
    }

    return acc;
  }, [] as CollectionCard[]);
}
