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
        case "Name":
          return (a.name ?? "").localeCompare(b.name ?? ""); // To do fix: I broke this function
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

  // Other filters, to do: hook them up
  const [viewStyle, setViewStyle] = useState<string>("Grid"); // Handles view "Grid" or "List"
  const [filterColour, setFilterColour] = useState<string>("All"); // To do: Support multi select
  const [filterType, setFilterType] = useState<string>("All"); // To do: Support multi select
  const myDecks = getDecksFromStorage();
  const [filterDeck, setFilterDeck] = useState<string>("All");

  return (
    <>
      {!deckCards && (
        <div className="flexRow centred filtersRow">
          <div className="flexRow viewStylesContainer">
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
          <div className="flexCol">
            <p>In Deck</p>
            <select
              value={filterDeck}
              onChange={(e) => setFilterDeck(e.target.value)}
            >
              <option value="All">All Decks</option>
              {myDecks.length > 0 &&
                myDecks.map((deck, index) => {
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
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="All">All Colours</option>
              <option value="Black">Black</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="Red">Red</option>
              <option value="White">White</option>
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
            <select
              value={filterType}
              onChange={(e) => setSortBy(e.target.value)}
            >
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
