import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { CardFooter } from "./CardFooter";
import "./Card.css";
import { CardHeader } from "./CardHeader";
import cardDefault from "../../assets/cardBackDefault.jpg";
import { useEffect, useState } from "react";
import { getAllPrintings } from "../../utils/scryfall";

interface CardViewProps {
  card:
    | DeckCard
    | (CollectionCard & { quantityOwned: number; quantityNeeded?: number });
  editable: boolean;
  isDeckView: boolean;
  isMobile?: boolean;
  onChangeSet: (cardName: string, newSetName: string) => void;
  onChangeQuantity: (cardName: string, amount: number) => void;
}

export function CardView({
  card,
  editable,
  isDeckView,
  isMobile = false,
  onChangeSet,
  onChangeQuantity,
}: CardViewProps) {
  const [availableSets, setAvailableSets] = useState<
    { set: string; setName: string }[]
  >([]);

  useEffect(() => {
    if (!editable || !card?.name) return;

    getAllPrintings(card.name).then((sets) => {
      setAvailableSets([{ set: "All", setName: "All" }, ...sets]);
    });
  }, [card.name, editable]);

  return (
    <div className={`${editable ? "editableCard card" : "card"}`}>
      {/* Set Selector */}
      {editable && availableSets.length > 2 && (
        <div className="setSelector">
          <label htmlFor={`set-${card.name}`}>Set:</label>
          <select
            id={`set-${card.name}`}
            value={card.set}
            onChange={(e) => onChangeSet(card.name, e.target.value)}
          >
            {availableSets.map((s, idx) => (
              <option key={idx} value={s.setName}>
                {s.setName}
              </option>
            ))}
          </select>
        </div>
      )}

      <img
        alt={card.name}
        className={`cardArt ${
          isDeckView && card.quantityOwned < (card.quantityNeeded ?? 0)
            ? "opacity-50"
            : ""
        }`}
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
}
