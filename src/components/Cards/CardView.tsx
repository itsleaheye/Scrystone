import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { CardFooter } from "./CardFooter";
import "./Card.css";
import { CardHeader } from "./CardHeader";
import cardDefault from "../../assets/cardBackDefault.jpg";
import React, { useState } from "react";

interface CardViewProps {
  card:
    | DeckCard
    | (CollectionCard & { quantityOwned: number; quantityNeeded?: number });
  editable: boolean;
  isDeckView: boolean;
  isMobile?: boolean;
  onChangeQuantity: (cardName: string, amount: number) => void;
}

export const CardView = React.memo(function CardView({
  card,
  editable,
  isDeckView,
  isMobile = false,
  onChangeQuantity,
}: CardViewProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div
      className={`${editable ? "editableCard card" : "card"}`}
      style={{ opacity: loading ? 0 : 1, transition: "var(--ease-in)" }}
    >
      <img
        loading="lazy"
        alt={card.name}
        className={`cardArt ${
          isDeckView && card.quantityOwned < (card.quantityNeeded ?? 0)
            ? "opacity-50"
            : ""
        }`}
        onLoad={() => setLoading(false)}
        src={card.imageUrl ?? cardDefault}
      />
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
});
