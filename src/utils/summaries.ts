import type { CollectionCard } from "../types/MagicTheGathering";

export function getCollectionSummary(cards?: CollectionCard[]): {
  size: number;
  value: number;
} {
  return (cards ?? []).reduce(
    (acc, card) => {
      const quantity = Number(card.quantityOwned) ?? 0;
      const price = parseFloat(card.price?.toString() ?? "0");

      if (card.type == "Land") {
        console.log(card.name, card.quantityOwned);
      }

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
