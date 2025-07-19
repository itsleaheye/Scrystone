import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import "../styles.css";
import { CardView } from "./CardView";
import React from "react";
import { EmptyView } from "../shared/EmptyView";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { MdCancel } from "react-icons/md";
import { getTypeIcon } from "../shared/TypeIcon";
import { getCardsFromStorage } from "../../utils/storage";
import { normalizeCardName } from "../../utils/normalize";

interface CardListProps {
  cardFocused:
    | DeckCard
    | (CollectionCard & { quantityOwned: number; quantityNeeded?: number })
    | undefined;
  editable: boolean;
  filteredAndSortedCards: (CollectionCard & {
    quantityOwned: number;
    quantityNeeded?: number;
  })[];
  isDeckView: boolean;
  onChangeQuantity: (cardName: string, amount: number) => void;
  setCardFocused: React.Dispatch<
    React.SetStateAction<
      | DeckCard
      | (CollectionCard & { quantityOwned: number; quantityNeeded?: number })
      | undefined
    >
  >;
  hasCards: boolean;
  onSetChange?: (cardName: string, set: string) => void;
}

export function CardList({
  cardFocused,
  editable,
  filteredAndSortedCards,
  hasCards,
  isDeckView,
  onChangeQuantity,
  onSetChange,
  setCardFocused,
}: CardListProps) {
  const isMobile = useMediaQuery("(max-width: 650px)");

  return (
    <div className="cardListContainer">
      <div>
        {filteredAndSortedCards.map((card, index) => {
          return (
            <CardListItem
              card={card}
              isDeckView={isDeckView}
              isMobile={isMobile}
              key={index}
              setCardFocused={setCardFocused}
            />
          );
        })}
      </div>
      {!isMobile && (
        <div className="cardListPreview">
          {cardFocused ? (
            <CardView
              card={cardFocused}
              editable={editable}
              isDeckView={isDeckView}
              onChangeQuantity={onChangeQuantity}
              onSetChange={onSetChange}
            />
          ) : (
            <EmptyView
              title={
                hasCards && filteredAndSortedCards.length < 1
                  ? "No cards found"
                  : "Preview a card"
              }
              description={
                hasCards && filteredAndSortedCards.length < 1
                  ? "No cards in this deck match your filters"
                  : "Click on a card from the left to view it's details"
              }
            />
          )}
        </div>
      )}
      {isMobile && cardFocused && (
        <div className="overlayContainer">
          <div className="overlayContent">
            <div className="flexRow">
              <h3>
                {getTypeIcon(cardFocused.type)}
                <span className={"overflowElipse"}>{cardFocused.name}</span>
              </h3>
              <button
                onClick={() => setCardFocused(undefined)}
                className="cancelButton"
              >
                <MdCancel />
              </button>
            </div>

            <CardView
              card={cardFocused}
              editable={editable}
              isDeckView={isDeckView}
              isMobile={isMobile}
              onChangeQuantity={onChangeQuantity}
              onSetChange={onSetChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface CardListItemProps {
  card:
    | DeckCard
    | (CollectionCard & { quantityOwned: number; quantityNeeded?: number });
  isDeckView: boolean;
  isMobile: boolean;
  setCardFocused?: React.Dispatch<
    React.SetStateAction<
      | DeckCard
      | (CollectionCard & {
          quantityOwned: number;
          quantityNeeded?: number;
        })
      | undefined
    >
  >;
}

function CardListItem({
  card,
  isDeckView,
  isMobile,
  setCardFocused,
}: CardListItemProps) {
  const ownedCards = getCardsFromStorage();
  const quantityOwned = ownedCards
    .filter(
      (owned) =>
        normalizeCardName(owned.name) === card.name &&
        (card.set === "Any" || owned.set === card.set)
    )
    .reduce(
      (sum, match) => sum + (parseInt(match.quantityOwned as any, 10) || 0),
      0
    );

  const showWarning = (quantityOwned ?? 0) < (card.quantityNeeded ?? 1);

  return (
    <div
      className="flexRow cardListRow"
      onClick={() => setCardFocused && setCardFocused(card)}
    >
      <div
        className={`${
          showWarning ? "redText primaryDetails" : "primaryDetails"
        } ${isMobile ? "primaryExtended" : ""}`}
        // onMouseEnter={() => setCardFocused && setCardFocused(card)}
      >
        {getTypeIcon(card.type)}
        <p className="bold overflowElipse">
          {card.name}{" "}
          {isDeckView
            ? `${quantityOwned}/${card.quantityNeeded}`
            : `x${quantityOwned}`}
        </p>
      </div>
      {!isMobile && <p className="overflowElipse setDetails">({card.set})</p>}
      <p className="priceDetails">
        {typeof card.price === "number" ? `$${card.price.toFixed(2)}` : "$n/a"}
      </p>
    </div>
  );
}
