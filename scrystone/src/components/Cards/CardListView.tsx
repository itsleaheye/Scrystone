import type { CollectionCard, DeckCard } from "../../types/MagicTheGathering";
import { getCardsFromStorage } from "../utils/storage";
import { normalizeCardName } from "../utils/normalize";
import { CardView } from "./CardView";
import { mergeCardQuantities } from "../utils/cards";

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
  if (!hasCards) return <></>;

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
