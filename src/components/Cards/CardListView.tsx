import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { getCardsFromStorage } from "../utils/storage";
import { normalizeCardName } from "../utils/normalize";
import { CardView } from "./CardView";
import { mergeCardQuantities } from "../utils/cards";
import { useState } from "react";
import React from "react";
import { EmptyView } from "../shared/EmptyView";

interface CardListViewProps {
  collectionCards?: CollectionCard[];
  deckCards?: DeckCard[];
  editable?: boolean;
  isDeckView?: boolean;
  setCards?: React.Dispatch<React.SetStateAction<DeckCard[]>>;
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
  if (!hasCards) {
    return (
      <EmptyView
        description={
          isDeckView
            ? "Search for a card name in the above search bar to add it to your deck"
            : "Upload your collection to start previewing cards"
        }
        title="No cards yet"
      />
    );
  }

  const ownedCards = getCardsFromStorage();
  const sourceCards = deckCards ?? collectionCards ?? [];
  const cardsWithQuantities = mergeCardQuantities(
    sourceCards,
    ownedCards,
    isDeckView
  );

  const [sortBy, setSortBy] = useState<string>("Commander");
  const sortedCards = React.useMemo(() => {
    if (isDeckView) {
      return cardsWithQuantities;
    }

    return [...cardsWithQuantities].sort((a, b) => {
      switch (sortBy) {
        case "Type":
          return (a.type ?? "").localeCompare(b.type ?? "");
        case "Price":
          return (b.price?.toString() ?? "").localeCompare(
            a.price?.toString() ?? ""
          );
        default:
          return (a.name ?? "").localeCompare(b.name ?? "");
      }
    });
  }, [cardsWithQuantities, sortBy, isDeckView]);

  function onChangeQuantity(cardName: string, amount: number) {
    if (!setCards) return;

    setCards((prevCards) =>
      prevCards
        .map((card) =>
          normalizeCardName(card.name) === normalizeCardName(cardName)
            ? {
                ...card,
                quantityNeeded: Math.max(
                  0,
                  (card.quantityNeeded ?? 0) + amount
                ),
              }
            : card
        )
        .filter((card): card is DeckCard => (card.quantityNeeded ?? 1) > 0)
    );
  }

  console.log("sortedCards", sortedCards);

  return (
    <>
      {!deckCards && (
        <div className="flexRow centred">
          <p>Filters and sorting tbd...</p>
          <div className="flexCol">
            <p>Sort by</p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="Name">Name</option>
              <option value="Price">Price</option>
              <option value="Type">Type</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid">
        {sortedCards.map((card, index) => {
          return (
            <CardView
              key={index}
              card={card}
              editable={editable}
              onChangeQuantity={onChangeQuantity}
              isDeckView={isDeckView}
            />
          );
        })}
      </div>
    </>
  );
}
