import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import "../styles.css";
import { CardView } from "./CardView";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { EmptyView } from "../shared/EmptyView";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { MdCancel } from "react-icons/md";
import { getTypeIcon } from "../shared/TypeIcon";
import { isCardInOtherDecks } from "../../utils/decks";
import { useAnchor } from "../../hooks/useAnchor";
import { FaStar } from "react-icons/fa";

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
  setCardFocused: Dispatch<
    SetStateAction<
      | DeckCard
      | (CollectionCard & { quantityOwned: number; quantityNeeded?: number })
      | undefined
    >
  >;
  hasCards: boolean;
}

export function CardList({
  cardFocused,
  editable,
  filteredAndSortedCards,
  isDeckView,
  onChangeQuantity,
  setCardFocused,
  hasCards,
}: CardListProps) {
  const isMobile = useMediaQuery("(max-width: 650px)");

  return (
    <div className="cardListContainer">
      <div className="listScrollView">
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
            // Bug here where current quantity isnt reflected until save
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

const CardListItem = memo(function CardListItem({
  card,
  isDeckView,
  isMobile,
  setCardFocused,
}: CardListItemProps) {
  const showWarning = (card.quantityOwned ?? 0) < (card.quantityNeeded ?? 1);
  const currentDeckId = useMemo(
    () => (isDeckView ? location.pathname.split("/")[2] : undefined),
    [isDeckView, location.pathname]
  );

  const [otherUses, setOtherUses] = useState<{
    inOtherDecks: {
      id: number;
      name: string;
    }[];
    count: number;
  }>({
    inOtherDecks: [],
    count: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { coords, anchor } = useAnchor();

  useEffect(() => {
    if (!currentDeckId) return;

    isCardInOtherDecks({
      card: card as DeckCard,
      currentDeckId: Number(currentDeckId),
    }).then((result) => {
      setOtherUses({
        inOtherDecks: result.inOtherDecks,
        count: result.count,
      });
    });
  }, [card, currentDeckId]);

  useLayoutEffect(() => {
    if (!showModal || !divRef.current || !modalRef.current) return;

    const divRect = divRef.current.getBoundingClientRect();
    const modalRect = modalRef.current.getBoundingClientRect();

    anchor(undefined, {
      top: divRect.top + window.scrollY - modalRect.height - 8,
      left:
        divRect.left + window.scrollX + divRect.width / 2 - modalRect.width / 2, // Centre
    });
  }, [showModal, anchor]);

  const onMouseEnter = useCallback(() => {
    anchor(divRef.current);
    setShowModal(true);
  }, [anchor]);

  const onMouseLeave = useCallback(() => setShowModal(false), []);

  return (
    <>
      {showModal && otherUses.count > 0 && coords && (
        <DeckUsageModal
          ref={modalRef}
          coords={coords}
          inOtherDecks={otherUses.inOtherDecks}
        />
      )}
      <div
        className="flexRow cardListRow"
        ref={divRef}
        onClick={() => {
          setCardFocused && setCardFocused(card);
          setShowModal(false);
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
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
        <div>
          {otherUses.count > 0 && (
            <>
              <FaStar />{" "}
              {!isMobile && (
                <p>
                  In {otherUses.count} other deck
                  {otherUses.count === 1 ? "" : "s"}!
                </p>
              )}
            </>
          )}
        </div>
        {!isMobile && (
          <p className="overflowElipse setDetails">({card.setName})</p>
        )}
        <p className="priceDetails">
          {typeof card.price === "number"
            ? `$${card.price.toFixed(2)}`
            : "$n/a"}
        </p>
      </div>
    </>
  );
});

const DeckUsageModal = memo(
  forwardRef<
    HTMLDivElement,
    {
      coords: { top: number; left: number };
      inOtherDecks: { id: number; name: string }[];
    }
  >(({ coords, inOtherDecks }, ref) => {
    return (
      <div
        ref={ref}
        className="deckUsageModal text-center"
        style={{ top: coords.top, left: coords.left }}
      >
        <h3> Used in decks:</h3>
        {inOtherDecks.map((deck) => (
          <div key={deck.id} className="flex justify-center text-center">
            <span>{deck.name}</span>
          </div>
        ))}
      </div>
    );
  })
);
