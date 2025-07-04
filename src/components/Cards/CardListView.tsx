import { GiTripleClaws } from "react-icons/gi";
import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { FaBookOpen, FaTree } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { LuPickaxe } from "react-icons/lu";
import { HiQuestionMarkCircle } from "react-icons/hi";
import "../styles.css";
import { CardView } from "./CardView";
import React, { useEffect } from "react";
import { EmptyView } from "../shared/EmptyView";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { MdCancel } from "react-icons/md";

interface CardListViewProps {
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
}

export function CardListView({
  cardFocused,
  editable,
  filteredAndSortedCards,
  isDeckView,
  onChangeQuantity,
  setCardFocused,
  hasCards,
}: CardListViewProps) {
  const isMobile = useMediaQuery("(max-width: 650px)");

  return (
    <div className="cardListContainer">
      <div className="flexCol">
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
              onChangeQuantity={onChangeQuantity}
              isMobile={isMobile}
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
  const showWarning = (card.quantityOwned ?? 0) < (card.quantityNeeded ?? 1);

  return (
    <div
      className="flexRow cardListRow"
      onClick={() => setCardFocused && setCardFocused(card)}
    >
      <div
        className={`${
          showWarning ? "redText primaryDetails" : "primaryDetails"
        } ${isMobile ? "primaryExtended" : ""}`}
      >
        {getTypeIcon(card.type)}
        <p className="bold overflowElipse">
          {card.name}{" "}
          {isDeckView
            ? `${card.quantityOwned}/${card.quantityNeeded}`
            : `x${card.quantityOwned}`}
        </p>
      </div>
      {!isMobile && <p className="overflowElipse setDetails">({card.set})</p>}
      <p className="priceDetails">
        {typeof card.price === "number" ? `$${card.price.toFixed(2)}` : "$n/a"}
      </p>
    </div>
  );
}

function getTypeIcon(type?: string) {
  if (!type) return;

  switch (type) {
    case "Creature":
      return <GiTripleClaws />;
    case "Enchantment":
      return <FaBookOpen />;
    case "Sorcery":
      return <BsStars />;
    case "Instant":
      return <BsStars />;
    case "Artifact":
      return <LuPickaxe />;
    case "Land":
      return <FaTree />;
    default:
      return <HiQuestionMarkCircle />;
  }
}
