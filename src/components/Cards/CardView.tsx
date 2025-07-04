import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { CardFooter } from "./CardFooter";
import "./Card.css";
import { CardHeader } from "./CardHeader";

interface CardViewProps {
  card:
    | DeckCard
    | (CollectionCard & { quantityOwned: number; quantityNeeded?: number });
  editable: boolean;
  isDeckView: boolean;
  isMobile?: boolean;
  onChangeQuantity: (cardName: string, amount: number) => void;
}

export function CardView({
  card,
  editable,
  isDeckView,
  isMobile = false,
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
      {editable && (
        <CardHeader
          isMobile={isMobile}
          quantityNeeded={card.quantityNeeded ?? 0}
          quantityOwned={card.quantityOwned}
        />
      )}
      <CardFooter
        cardName={card.name}
        editable={editable}
        isDeckView={isDeckView}
        isMobile={isMobile}
        onChangeQuantity={onChangeQuantity}
        quantityNeeded={card.quantityNeeded ?? 0}
        quantityOwned={card.quantityOwned}
      />
    </div>
  );
}
