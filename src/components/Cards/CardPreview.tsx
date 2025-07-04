import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { getCardsFromStorage } from "../utils/storage";
import { getDecksFromStorage } from "../utils/storage";
import { normalizeCardName } from "../utils/normalize";
import { CardView } from "./CardView";
import { mergeCardQuantities } from "../utils/cards";
import { useEffect, useState } from "react";
import React from "react";
import { EmptyView } from "../shared/EmptyView";
import { useCardFiltersAndSort } from "../../hooks/useCardFiltersAndSort";
import { CardListView } from "./CardListView";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { TbArrowsSort, TbSortAscendingLetters } from "react-icons/tb";
import Select from "react-select";
import { ViewStyleFilter } from "../shared/ViewStyleFilter";

interface CardPreviewProps {
  activeCardPreview?: DeckCard;
  collectionCards?: CollectionCard[];
  deckCards?: DeckCard[];
  editable?: boolean;
  isDeckView?: boolean;
  setCards?: React.Dispatch<React.SetStateAction<DeckCard[]>>;
  viewPreference?: string;
}
export function CardPreview({
  activeCardPreview,
  collectionCards,
  deckCards,
  editable = false,
  isDeckView = false,
  setCards,
  viewPreference,
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

    setCards((prevCards) => {
      const updatedCards = prevCards
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
        .filter((card): card is DeckCard => (card.quantityNeeded ?? 1) > 0);

      const changedCard = updatedCards.find(
        (card) => normalizeCardName(card.name) === normalizeCardName(cardName)
      );
      if (!changedCard || (changedCard.quantityNeeded ?? 0) <= 0) {
        setCardFocused(undefined);
      } else {
        // Update cardFocused if it matches the changed card. Keeps the quantities up to date
        setCardFocused((prevFocused) => {
          if (!prevFocused) return prevFocused;
          if (
            normalizeCardName(prevFocused.name) === normalizeCardName(cardName)
          ) {
            return {
              ...prevFocused,
              quantityNeeded: changedCard.quantityNeeded,
            };
          }
          return prevFocused;
        });
      }

      return updatedCards;
    });
  }

  type OptionType = { value: string; label: string };
  const colourFilters: OptionType[] = [
    { value: "W", label: "White" },
    { value: "U", label: "Blue" },
    { value: "B", label: "Black" },
    { value: "R", label: "Red" },
    { value: "G", label: "Green" },
  ];
  const typeFilters: OptionType[] = [
    { value: "Artifact", label: "Artifact" },
    { value: "Creature", label: "Creature" },
    { value: "Enchantment", label: "Enchantment" },
    { value: "Land", label: "Land" },
    { value: "Sorcery", label: "Sorcery" },
  ];

  const isMobile = useMediaQuery("(max-width: 650px)");
  const decks = getDecksFromStorage();

  const [viewStyle, setViewStyle] = useState<string>(viewPreference ?? "Grid");
  const [filterColour, setFilterColour] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterDeck, setFilterDeck] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Name");

  useEffect(() => {
    if (isMobile) {
      setCardFocused(undefined);
    }
  }, [viewStyle]);

  const filteredAndSortedCards = useCardFiltersAndSort({
    cards: cardsWithQuantities,
    decks,
    filterDeck,
    sortBy,
    filterType,
    filterColour,
  });

  const [cardFocused, setCardFocused] = useState<
    | DeckCard
    | (CollectionCard & {
        quantityOwned: number;
        quantityNeeded?: number;
      })
    | undefined
  >(!isMobile && activeCardPreview ? activeCardPreview : undefined);
  useEffect(() => {
    if (activeCardPreview && activeCardPreview !== cardFocused) {
      setCardFocused(activeCardPreview);
    }
  }, [activeCardPreview]);

  return (
    <>
      {!editable && (
        <>
          <div className="centred filtersRow">
            <ViewStyleFilter
              isMobile={isMobile}
              viewStyle={viewStyle}
              setViewStyle={setViewStyle}
            />
            {!isDeckView && (
              <div className="flexCol">
                <p>In Deck</p>
                <select
                  className="selectDeckInput"
                  value={filterDeck}
                  onChange={(e) => {
                    setFilterDeck(e.target.value);
                    setCardFocused(undefined);
                  }}
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
            )}
            <div className="flexCol">
              <p>Colour</p>
              <Select
                className="selectMulti"
                classNamePrefix="selectMulti"
                isClearable={false}
                isMulti
                isSearchable={false}
                options={colourFilters}
                placeholder="All Colours"
                value={colourFilters.filter((filter) =>
                  filterColour.includes(filter.value)
                )}
                onChange={(selected) => {
                  setFilterColour(selected.map((s) => s.value));
                  setCardFocused(undefined);
                }}
              />
            </div>
            <div className="flexCol">
              <p>Type</p>
              <Select
                className="selectMulti"
                classNamePrefix="selectMulti"
                isClearable={false}
                isMulti
                isSearchable={false}
                options={typeFilters}
                placeholder="All Types"
                value={typeFilters.filter((filter) =>
                  filterType.includes(filter.value)
                )}
                onChange={(selected) => {
                  setFilterType(selected.map((s) => s.value));
                  setCardFocused(undefined);
                }}
              />
            </div>
            <div className="flexCol">
              <p className="filterIconAndText">
                {sortBy === "Name" ? (
                  <TbSortAscendingLetters />
                ) : (
                  <TbArrowsSort />
                )}
                Sort By
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Name">Name</option>
                <option value="Price">Price</option>
                <option value="Type">Type</option>
              </select>
            </div>
          </div>
          <div className="cardFoundTotal">
            <p>
              {filteredAndSortedCards.length} unique cards{" "}
              {(filterColour.length > 0 ||
                filterDeck !== "All" ||
                filterType.length > 0) &&
                "found"}
            </p>
          </div>
        </>
      )}

      {viewStyle == "Grid" ? (
        <div className="grid">
          {filteredAndSortedCards.map((card, index) => {
            return (
              <CardView
                key={index}
                card={card}
                editable={editable}
                isDeckView={isDeckView}
                onChangeQuantity={onChangeQuantity}
              />
            );
          })}
        </div>
      ) : (
        <CardListView
          cardFocused={cardFocused}
          editable={editable}
          filteredAndSortedCards={filteredAndSortedCards}
          isDeckView={isDeckView}
          onChangeQuantity={onChangeQuantity}
          setCardFocused={setCardFocused}
          hasCards={hasCards}
        />
      )}
    </>
  );
}
