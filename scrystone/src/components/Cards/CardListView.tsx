import { useEffect, useState } from "react";
import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { getCardsFromStorage } from "../../hooks/useCardParser";

interface CardListViewProps {
  collectionCards?: CollectionCard[];
  deckCards?: DeckCard[];
  editable?: boolean;
  isDeckView?: boolean;
  setCards?: React.Dispatch<React.SetStateAction<DeckCard[]>>;
}

// function isDeckCard(card: any): card is DeckCard {
//   return (
//     card &&
//     typeof card.quantityOwned === "number" &&
//     typeof card.quantityNeeded === "number"
//   );
// }

function isCollectionCard(card: any): card is CollectionCard {
  return (
    card &&
    typeof card.quantityOwned === "number" &&
    !("quantityNeeded" in card)
  );
}

export function CardListView({
  collectionCards,
  deckCards,
  editable = false,
  isDeckView = false,
  setCards,
}: CardListViewProps) {
  // If there are no cards to render, early return
  const hasCards =
    (collectionCards && collectionCards.length > 0) ||
    (deckCards && deckCards.length > 0);
  if (!hasCards) return <></>;

  const ownedCards = getCardsFromStorage();
  const cardsWithQuantities = (deckCards ?? collectionCards ?? []).map(
    (card) => {
      const ownedMatch = ownedCards.find(
        (owned) =>
          owned.name.trim().toLowerCase() === card.name.trim().toLowerCase()
      );
      const quantityOwned = ownedMatch?.quantityOwned ?? 0;

      return isDeckView
        ? { ...card, quantityOwned }
        : { ...card, quantityNeeded: 0, quantityOwned };
    }
  );

  function onChangeQuantity(cardName: string, amount: number) {
    if (!setCards) return;

    setCards((prevCards) => {
      const updated = prevCards
        .map((card) => {
          if (
            card.name.trim().toLowerCase() === cardName.trim().toLowerCase()
          ) {
            const newQuantityNeeded = (card.quantityNeeded ?? 0) + amount;
            if (newQuantityNeeded <= 0) return null;
            return { ...card, quantityNeeded: newQuantityNeeded };
          }
          return card;
        })
        .filter((card): card is DeckCard => card !== null);

      return updated;
    });
  }

  return (
    <>
      {!deckCards && (
        <div className="flexRow centred">
          <p>Filters and sorting tbd...</p>
        </div>
      )}
      <div className="grid">
        {cardsWithQuantities.map((card, index) => {
          return (
            <div
              key={index}
              className={`${editable ? "editableCard card" : "card"}`}
            >
              {card.imageUrl && (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className={`cardArt ${
                    isDeckView &&
                    card.quantityOwned <
                      ("quantityNeeded" in card ? card.quantityNeeded : 0)
                      ? "opacity-50"
                      : undefined
                  }`}
                />
              )}
              <CardFooter
                cardName={card.name}
                quantityOwned={card.quantityOwned}
                quantityNeeded={
                  "quantityNeeded" in card ? card.quantityNeeded : 0
                }
                editable={editable}
                isDeckView={isDeckView}
                onChangeQuantity={onChangeQuantity}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

interface CardFooterProps {
  cardName: string;
  quantityOwned: number;
  quantityNeeded: number;
  editable: boolean;
  isDeckView: boolean;
  onChangeQuantity: (cardName: string, amount: number) => void;
}

function CardFooter({
  cardName,
  quantityOwned,
  quantityNeeded,
  editable,
  isDeckView,
  onChangeQuantity,
}: CardFooterProps) {
  const quantityChip = (
    <div className="quantity rounded-tr-[100%] rounded-bl-[10%]">
      <p>
        {isDeckView
          ? `${quantityOwned}/${quantityNeeded}`
          : `x${quantityOwned}`}
      </p>
    </div>
  );

  if (isDeckView) {
    const cardChipButton = (icon: React.ReactNode, amount: number) => (
      <div
        className={`cardChip ${
          amount === -1
            ? "cardChipLeft rounded-tr-[100%] rounded-bl-[20%]"
            : "cardChipRight rounded-tl-[100%] rounded-br-[20%]"
        }`}
      >
        <div onClick={() => onChangeQuantity(cardName, amount)}>
          <p>{icon}</p>
        </div>
      </div>
    );

    if (editable) {
      return (
        <div className="cardFooterGroup">
          <div className="cardFooter">
            {cardChipButton(<FaMinus />, -1)}
            {cardChipButton(<FaPlus />, 1)}
          </div>
          <div className="cardQuantity">{quantityChip}</div>
        </div>
      );
    } else {
      return <div className="cardQuantity">{quantityChip}</div>;
    }

    return null;
  } else if (quantityOwned > 1) {
    return <>{quantityChip}</>;
  }
}
