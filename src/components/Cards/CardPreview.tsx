import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { getCardsFromStorage } from "../utils/storage";
import { getDecksFromStorage } from "../utils/storage";
import { normalizeCardName } from "../utils/normalize";
import { CardView } from "./CardView";
import { mergeCardQuantities } from "../utils/cards";
import { useState } from "react";
import React from "react";
import { EmptyView } from "../shared/EmptyView";
import { BsFillGridFill } from "react-icons/bs";
import { FaList } from "react-icons/fa";
import { useCardFiltersAndSort } from "../../hooks/useCardFiltersAndSort";
import { CardListView } from "./CardListView";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface CardPreviewProps {
  collectionCards?: CollectionCard[];
  deckCards?: DeckCard[];
  editable?: boolean;
  isDeckView?: boolean;
  setCards?: React.Dispatch<React.SetStateAction<DeckCard[]>>;
}
export function CardPreview({
  collectionCards,
  deckCards,
  editable = false,
  isDeckView = false,
  setCards,
}: CardPreviewProps) {
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

  const decks = getDecksFromStorage();
  const [viewStyle, setViewStyle] = useState<string>("Grid");
  const [filterColour, setFilterColour] = useState<string>("All"); // To do: Support multi select
  const [filterType, setFilterType] = useState<string>("All"); // To do: Support multi select
  const [filterDeck, setFilterDeck] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Name");

  const filteredAndSortedCards = useCardFiltersAndSort({
    cards: cardsWithQuantities,
    decks,
    filterDeck,
    sortBy,
    filterType,
    filterColour,
  });

  const isMobile = useMediaQuery("(max-width: 650px)");

  return (
    <>
      {!deckCards && (
        <div className="centred filtersRow">
          <div className="flexRow viewStylesContainer">
            {isMobile && <p className="bold">Select View Style</p>}
            <div className="viewButtons">
              <div
                className={`cursor-pointer p-2 ${
                  viewStyle !== "List" ? "opacity-50" : "opacity-100"
                }`}
                onClick={() => setViewStyle("List")}
              >
                <FaList />
              </div>
              <div
                className={`cursor-pointer p-2 ${
                  viewStyle !== "Grid" ? "opacity-50" : "opacity-100"
                }`}
                onClick={() => setViewStyle("Grid")}
              >
                <BsFillGridFill />
              </div>
            </div>
          </div>
          <div className="flexCol">
            <p>In Deck</p>
            <select
              className="selectDeckInput"
              value={filterDeck}
              onChange={(e) => setFilterDeck(e.target.value)}
            >
              <option value="All">All Decks</option>
              {decks.length > 0 &&
                decks.map((deck, index) => {
                  const deckName = deck.name;
                  return (
                    <option key={index} value={deckName}>
                      {deckName}
                    </option>
                  );
                })}
            </select>
          </div>
          <div className="flexCol">
            <p>Colour</p>
            <select
              value={filterColour}
              onChange={(e) => setFilterColour(e.target.value)}
            >
              <option value="All">All Colours</option>
              <option value="B">Black</option>
              <option value="U">Blue</option>
              <option value="G">Green</option>
              <option value="R">Red</option>
              <option value="W">White</option>
            </select>
          </div>
          <div className="flexCol">
            <p>Type</p>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Artifact">Artifacts</option>
              <option value="Creature">Creatures</option>
              <option value="Enchantment">Enchantments</option>
              <option value="Land">Land</option>
              <option value="Sorcery">Sorcery</option>
            </select>
          </div>
          <div className="flexCol">
            <p>Sort By</p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="Name">Name</option>
              <option value="Price">Price</option>
              <option value="Type">Type</option>
            </select>
          </div>
        </div>
      )}

      {viewStyle == "Grid" ? (
        <div className="grid">
          {filteredAndSortedCards.map((card, index) => {
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
      ) : (
        <CardListView
          filteredAndSortedCards={filteredAndSortedCards}
          editable={editable}
          onChangeQuantity={onChangeQuantity}
          isDeckView={isDeckView}
        />
      )}
    </>
  );
}
