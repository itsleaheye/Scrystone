import type {
  Card,
  CollectionCard,
  DeckCard,
} from "../types/MagicTheGathering";

interface Props {
  cards: Card[] | CollectionCard[] | DeckCard[];
  showSearchAndFilters?: boolean;
}

export function CardsView({
  cards,
  showSearchAndFilters = false,
}: Props): React.JSX.Element {
  if (!cards || cards.length === 0) {
    return <></>;
  }

  return (
    <>
      {showSearchAndFilters && (
        <div className="flexRow centred">
          <p>Filters and sorting tbd...</p>
        </div>
      )}
      <div className="grid">
        {cards.map((card, index) => (
          <div key={index} className="card">
            {card.imageUrl ? (
              <img src={card.imageUrl} alt={card.name} className="cardArt" />
            ) : (
              // To do: Find placeholder card or generate placeholder based on details.
              <div className="cardPlaceholder">
                <p className="emphasis">{card.name}</p>
                <p>{card.type}</p>
                <p>
                  {card.manaCost}
                  {card.manaType}
                </p>
              </div>
            )}
            {Array.isArray(cards) &&
              "quantityOwned" in cards[0] &&
              (card as CollectionCard | DeckCard).quantityOwned > 0 && (
                <div className="quantity rounded-tr-[100%]">
                  <p>x{(card as CollectionCard | DeckCard).quantityOwned}</p>
                </div>
              )}
          </div>
        ))}
      </div>
    </>
  );
}
