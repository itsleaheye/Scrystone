import type { CollectionCard } from "../../types/MagicTheGathering";

export function getCollectionSummary(cards?: CollectionCard[]): {
  size: number;
  value: number;
} {
  return (cards ?? []).reduce(
    (acc, card) => {
      const quantity = Number(card.quantityOwned) ?? 0;
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
