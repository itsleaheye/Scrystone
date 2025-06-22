import { useCardParser } from "../../hooks/useCardParser";
import type { Card, Deck } from "../../types/MagicTheGathering";
import "../styles.css";

export function Deck({ deck }: { deck: Deck }) {
  return (
    <div className="deck">
      <div className="deckTop">
        <p className="emphasis">{deck.name}</p>
        {deck.description && <p>{deck.description}</p>}
      </div>
      {deck.colours && deck.colours.length > 0 && (
        <DeckMana colours={deck.colours} />
      )}
      {[...new Set(deck.cards.map((card) => card.type?.toLowerCase()))]
        .filter((type) => type) // This removes undefined/null types
        // Map through each unique type
        .map((type) => {
          const cardsOfType = deck.cards.filter(
            (card) => card.type?.toLowerCase() === type
          );

          return (
            <CardTypeDetailRow
              key={type}
              type={type?.toLowerCase()}
              allCardsofType={cardsOfType}
            />
          );
        })}
      <div className="playStyleTag">
        <p>{deck.format}</p>
      </div>
    </div>
  );
}

export function CardTypeDetailRow({
  allCardsofType,
  type,
}: {
  allCardsofType: Card[];
  type?: string;
}) {
  if (!type) {
    return <></>; // If type is undefined or empty, don't render anything
  }

  // Match owned cards of type by name to the matching cards required in the deck
  const { collectionCards: collectionCards } = useCardParser();
  const ownedDeckCardsofType = allCardsofType.filter((cardOfType) =>
    collectionCards.some(
      (collectionCard) =>
        collectionCard.type?.toLowerCase() === type &&
        collectionCard.name.toLowerCase() === cardOfType.name.toLowerCase()
    )
  ).length;

  const cardTypeLabels: Record<string, string> = {
    creature: "Creatures",
    planeswalker: "Planeswalkers",
    enchantment: "Enchantments",
    artifact: "Artifacts",
    land: "Lands",
    instant: "Instants",
  };
  const cardTypeLabel = cardTypeLabels[type as string] || type;

  return (
    <div className="flexRow">{`${cardTypeLabel} ${ownedDeckCardsofType}/${allCardsofType.length}`}</div>
  );
}

export function DeckMana({ colours }: { colours: string[] }) {
  return (
    <>
      {colours.map((colour, index) => (
        <span key={index} className={`manaSymbol ${colour.toLowerCase()}`}>
          {colour}
        </span>
      ))}
    </>
  );
}
