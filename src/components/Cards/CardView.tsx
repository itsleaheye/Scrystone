import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { CardFooter } from "./CardFooter";
import "./Card.css";
import { CardHeader } from "./CardHeader";
import cardDefault from "../../assets/cardBackDefault.jpg";
import { useEffect, useState } from "react";
import { getCardSets } from "../../utils/cards";
import { getCardsFromStorage } from "../../utils/storage";
import { normalizeCardName } from "../../utils/normalize";

interface CardViewProps {
  card:
    | DeckCard
    | (CollectionCard & { quantityOwned: number; quantityNeeded?: number });
  editable: boolean;
  isDeckView: boolean;
  isMobile?: boolean;
  onChangeQuantity: (cardName: string, amount: number) => void;
  onSetChange?: (cardName: string, set: string) => void;
}

export function CardView({
  card,
  editable,
  isDeckView,
  isMobile = false,
  onChangeQuantity,
  onSetChange,
}: CardViewProps) {
  const [availableSets, setAvailableSets] = useState<
    { set: string; set_name: string }[]
  >([]); // Have to conform to scryfall naming format
  const [cardSet, setCardSet] = useState(card.set);
  const [quantityOwned, setQuantityOwned] = useState(card.quantityOwned);

  useEffect(() => {
    if (!editable) return;

    getCardSets(card.name)
      .then((sets) => {
        setAvailableSets(sets);
      })
      .catch((err) => {
        console.error(`Failed to fetch sets for ${card.name}`, err);
      });
  }, [card.name, editable]);

  useEffect(() => {
    const ownedCards = getCardsFromStorage();
    const normalizedName = normalizeCardName(card.name);

    const quantityOwned = ownedCards
      .filter(
        (owned) =>
          normalizeCardName(owned.name) === normalizedName &&
          (cardSet === "Any" || owned.set === cardSet)
      )
      .reduce(
        (sum, match) => sum + (parseInt(match.quantityOwned as any, 10) || 0),
        0
      );
    setQuantityOwned(quantityOwned);
  }, [card.name, cardSet]);

  useEffect(() => {
    if (card.set) {
      const match = availableSets.find((s) => s.set_name === card.set);
      if (match) {
        setCardSet(match.set_name);
      } else {
        setCardSet("Any");
      }
    }
  }, [card.set, availableSets]);

  return (
    <div className={`${editable ? "editableCard card" : "card"}`}>
      <img
        alt={card.name}
        className={`cardArt ${
          isDeckView && card.quantityOwned < (card.quantityNeeded ?? 0)
            ? "opacity-50"
            : ""
        }`}
        src={card.imageUrl ?? cardDefault}
      />
      {editable && onSetChange && (
        <div className="flexCol cardSet">
          <h3>Set</h3>
          <select
            onChange={(e) => {
              setCardSet(e.target.value);
              onSetChange(card.name, e.target.value);
            }}
            value={cardSet}
          >
            <option value="Any">Any</option>
            {availableSets.map(({ set_name }) => (
              <option key={set_name} value={set_name}>
                {set_name}
              </option>
            ))}
          </select>
        </div>
      )}
      {editable && (
        <CardHeader
          isMobile={isMobile}
          quantityNeeded={card.quantityNeeded ?? 0}
          quantityOwned={
            !editable || card.set == "Any" ? card.quantityOwned : quantityOwned
          }
        />
      )}
      <CardFooter
        cardName={card.name}
        editable={editable}
        isDeckView={isDeckView}
        isMobile={isMobile}
        onChangeQuantity={onChangeQuantity}
        quantityNeeded={card.quantityNeeded ?? 0}
        quantityOwned={!editable ? card.quantityOwned : quantityOwned}
      />
    </div>
  );
}
