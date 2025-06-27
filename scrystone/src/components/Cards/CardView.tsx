import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { CardFooter } from "./CardFooter";

interface CardViewProps {
  card:
    | DeckCard
    | (CollectionCard & { quantityOwned: number; quantityNeeded?: number });
  editable: boolean;
  isDeckView: boolean;
  onChangeQuantity: (cardName: string, amount: number) => void;
}

export function CardView({
  card,
  editable,
  isDeckView,
  onChangeQuantity,
}: CardViewProps) {
  return (
    <div className={`${editable ? "editableCard card" : "card"}`}>
      {card.imageUrl && (
        <img
          alt={card.name}
          className={`cardArt ${
            isDeckView && card.quantityOwned < (card.quantityNeeded ?? 0)
              ? "opacity-50"
              : ""
          }`}
          src={card.imageUrl}
        />
      )}
      <CardFooter
        cardName={card.name}
        editable={editable}
        isDeckView={isDeckView}
        onChangeQuantity={onChangeQuantity}
        quantityNeeded={card.quantityNeeded ?? 0}
        quantityOwned={card.quantityOwned}
      />
    </div>
  );
}
