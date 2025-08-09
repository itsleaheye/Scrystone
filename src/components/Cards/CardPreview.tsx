import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { getCardsFromStorage } from "../../utils/storage";
import { normalizeCardName } from "../../utils/normalize";
import { CardView } from "./CardView";
import { mergeCardQuantities } from "../../utils/cards";
import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { EmptyView } from "../shared/EmptyView";
import { useCardFiltersAndSort } from "../../hooks/useCardFiltersAndSort";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import {
  TbSortAscendingLetters,
  TbSortAscendingShapesFilled,
  TbSortDescendingNumbers,
} from "react-icons/tb";
import Select from "react-select";
import { ViewStyleFilter } from "../shared/ViewStyleFilter";
import { CardList } from "./CardList";
import { FaSearch } from "react-icons/fa";
import { ImSpinner6 } from "react-icons/im";

interface CardPreviewProps {
  activeCardPreview?: DeckCard;
  collectionCards?: CollectionCard[];
  deckCards?: DeckCard[];
  editable?: boolean;
  isDeckView?: boolean;
  loading?: boolean;
  setCards?: React.Dispatch<React.SetStateAction<DeckCard[]>>;
  viewPreference?: string;
}
export function CardPreview({
  activeCardPreview,
  collectionCards,
  deckCards,
  editable = false,
  isDeckView = false,
  loading = false,
  setCards,
  viewPreference,
}: CardPreviewProps) {
  // If there are no cards to render, early return
  const hasCards =
    (collectionCards && collectionCards.length > 0) ||
    (deckCards && deckCards.length > 0);

  const [ownedCards, setOwnedCards] = useState<CollectionCard[]>([]);

  useEffect(() => {
    getCardsFromStorage()
      .then((data) => {
        setOwnedCards(data);
      })
      .catch(() => {
        setOwnedCards([]);
      });
  }, []);

  const sourceCards = deckCards ?? collectionCards ?? [];
  const cardsWithQuantities = useMemo(
    () => mergeCardQuantities(sourceCards, ownedCards, isDeckView),
    [sourceCards, ownedCards, isDeckView]
  );

  function onChangeQuantity(cardName: string, amount: number) {
    if (!setCards) return;

    setCards((prevCards) => {
      const updatedCards = prevCards
        .map((card) => {
          if (normalizeCardName(card.name) === normalizeCardName(cardName)) {
            const isLand = card.type?.toLowerCase().includes("land");

            let newQuantity = Math.max(0, (card.quantityNeeded ?? 0) + amount);
            if (!isLand && newQuantity > 4) {
              newQuantity = 4;
            }

            return {
              ...card,
              quantityNeeded: newQuantity,
            };
          }
          return card;
        })
        .filter((card): card is DeckCard => (card.quantityNeeded ?? 1) > 0);

      const changedCard = updatedCards.find(
        (card) => normalizeCardName(card.name) === normalizeCardName(cardName)
      );
      if (!changedCard || (changedCard.quantityNeeded ?? 0) <= 0) {
        setCardFocused(undefined);
      } else {
        // Update cardFocused if it matches the changed card. Keeps quantity in sync
        setCardFocused((prevFocused) => {
          if (!prevFocused) return prevFocused;
          if (
            normalizeCardName(prevFocused.name) === normalizeCardName(cardName)
          ) {
            return {
              ...prevFocused,
              quantityNeeded: changedCard.quantityNeeded,
              quantityOwned: changedCard.quantityOwned,
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
    { value: "Instant", label: "Instant" },
  ];

  const isMobile = useMediaQuery("(max-width: 650px)");

  const [viewStyle, setViewStyle] = useState<string>(viewPreference ?? "Grid");
  const [filterColour, setFilterColour] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [rawSearchTerm, setRawSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Name");
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (rawSearchTerm.length < 3) {
      setSearchTerm("");
      setFilterLoading(false);
      return;
    }

    setFilterLoading(true);

    debounceTimeout.current = setTimeout(() => {
      setSearchTerm(rawSearchTerm);
      setFilterLoading(false);
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [rawSearchTerm]);

  useEffect(() => {
    if (isMobile) {
      setCardFocused(undefined);
    }
  }, [viewStyle]);

  useEffect(() => {
    if (viewPreference) setViewStyle(viewPreference);
  }, [viewPreference]);

  const filteredAndSortedCards = useCardFiltersAndSort({
    cards: cardsWithQuantities,
    sortBy,
    filterType,
    filterColour,
    searchTerm,
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

  const getSortIcon = () => {
    if (sortBy === "Name") return <TbSortAscendingLetters />;
    if (sortBy === "Price") return <TbSortDescendingNumbers />;
    return <TbSortAscendingShapesFilled />;
  };

  return (
    <>
      {!editable && (
        <>
          <div
            className="centred filtersRow"
            style={{
              opacity: loading ? 0.5 : 1,
              pointerEvents: loading ? "none" : "auto",
              transition: "opacity 0.5s ease",
            }}
          >
            <ViewStyleFilter
              isMobile={isMobile}
              viewStyle={viewStyle}
              setViewStyle={setViewStyle}
            />
            {!editable && (
              <div className="flexCol">
                <p>Search</p>
                {filterLoading ? (
                  <ImSpinner6 className="inlineIcon searchSpinner" />
                ) : (
                  <FaSearch className="inlineIcon" />
                )}
                <input
                  type="text"
                  className="searchInput"
                  placeholder="Card name..."
                  onChange={(e) => {
                    setCardFocused(undefined);
                    setRawSearchTerm(e.target.value);
                  }}
                />
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
                {getSortIcon()}
                Sort By
              </p>
              <Select
                className="selectMulti"
                classNamePrefix="selectMulti"
                options={[
                  { value: "Name", label: "Name" },
                  { value: "Price", label: "Price" },
                  { value: "Type", label: "Type" },
                ]}
                placeholder="Name"
                isSearchable={false}
                value={{ value: sortBy, label: sortBy }}
                onChange={(selected) => {
                  if (selected) {
                    setSortBy(selected.value);
                  }
                }}
              />
            </div>
          </div>
          {!loading && (
            <div className="cardFoundTotal">
              <p>
                {filteredAndSortedCards.length} unique card
                {(filteredAndSortedCards.length > 1 ||
                  filteredAndSortedCards.length == 0) &&
                  "s"}{" "}
                {(filterColour.length > 0 ||
                  filterType.length > 0 ||
                  searchTerm.length > 1) &&
                  "found"}
              </p>
            </div>
          )}
        </>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p className="text-center">Loading cards...</p>
        </div>
      ) : hasCards ? (
        viewStyle == "Grid" ? (
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
          <CardList
            cardFocused={cardFocused}
            editable={editable}
            filteredAndSortedCards={filteredAndSortedCards}
            isDeckView={isDeckView}
            onChangeQuantity={onChangeQuantity}
            setCardFocused={setCardFocused}
            hasCards={hasCards}
          />
        )
      ) : (
        <EmptyView
          description={
            location.pathname.includes("edit") ||
            location.pathname.includes("new")
              ? "Search for a card name in the above search bar to add it to your deck"
              : isDeckView
              ? "No cards added to this deck"
              : "Upload your collection to start previewing card"
          }
          title="No cards yet"
        />
      )}
    </>
  );
}
