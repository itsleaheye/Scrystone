import { GiTripleClaws } from "react-icons/gi";
import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { FaBookOpen, FaTree } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { LuPickaxe } from "react-icons/lu";
import { HiQuestionMarkCircle } from "react-icons/hi";
import "../styles.css";
import { CardView } from "./CardView";
import { useState } from "react";
import React from "react";
import { EmptyView } from "../shared/EmptyView";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface CardListViewProps {
  filteredAndSortedCards: (CollectionCard & {
    quantityOwned: number;
    quantityNeeded?: number;
  })[];
  editable: boolean;
  isDeckView: boolean;
  onChangeQuantity: (cardName: string, amount: number) => void;
}
// To do, support deck editing views from this list
export function CardListView({
  filteredAndSortedCards,
  editable,
  isDeckView,
  onChangeQuantity,
}: CardListViewProps) {
  const isMobile = useMediaQuery("(max-width: 650px)");
  const [cardFocused, setCardFocused] = useState<
    | DeckCard
    | (
        | (CollectionCard & { quantityOwned: number; quantityNeeded?: number })
        | undefined
      )
  >(undefined);

  return (
    <div className="cardListContainer">
      <div className="flexCol">
        {filteredAndSortedCards.map((card, index) => {
          return (
            <CardListItem
              key={index}
              card={card}
              editable={editable}
              onChangeQuantity={onChangeQuantity}
              isDeckView={isDeckView}
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
              editable={false}
              isDeckView={false}
              onChangeQuantity={onChangeQuantity}
            />
          ) : (
            <EmptyView
              title="Preview a card"
              description="Click on a card from the left to preview it"
            />
          )}
        </div>
      )}
    </div>
  );
}

interface CardListItemProps {
  card:
    | DeckCard
    | (CollectionCard & { quantityOwned: number; quantityNeeded?: number });
  editable: boolean;
  isDeckView: boolean;
  onChangeQuantity: (cardName: string, amount: number) => void;
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
  editable,
  isDeckView,
  onChangeQuantity,
  setCardFocused,
}: CardListItemProps) {
  // To do: placeholders
  console.log("editable", editable);
  console.log("isDeckView", isDeckView);
  console.log("onChangeQuantity", onChangeQuantity);

  return (
    <div
      className="flexRow cardListRow"
      onClick={() => setCardFocused && setCardFocused(card)}
    >
      <div className="primaryDetails">
        {getTypeIcon(card.type)}
        <p className="bold  overflowElipse">
          {card.name} x{card.quantityOwned}
        </p>
      </div>
      <p className="overflowElipse setDetails">({card.set})</p>
      <p className="priceDetails">${card.price?.toFixed(2) ?? "$n/a"}</p>
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
