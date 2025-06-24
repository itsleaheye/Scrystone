import { getCardsFromStorage } from "../../hooks/useCardParser";
import { useDeckParser } from "../../hooks/useDeckParser";
import type { Card, Deck } from "../../types/MagicTheGathering";
import "../styles.css";

interface Props {
  deck: Deck;
  setCurrentView?: (view: string) => void;
}

export function DeckView({ deck, setCurrentView }: Props) {
  const { getDeckTypeSummaryWithDefaults } = useDeckParser();
  const summary = getDeckTypeSummaryWithDefaults(deck.cards);

  const handleClick = () => {
    if (typeof setCurrentView === "function") {
      setCurrentView(`deckCreateEditView=${deck.id}`);
    }
  };

  return (
    <div className="deck cursor-pointer" onClick={handleClick}>
      <div className="deckTop">
        <p className="emphasis">{deck.name}</p>
        {deck.description && <p>{deck.description}</p>}
      </div>
      {deck.colours && deck.colours.length > 0 && (
        <DeckMana colours={deck.colours} />
      )}
      <div className="deckCardSummary">
        <ul>
          {summary.map(({ type, quantityNeeded, quantityOwned }) => (
            <li key={type}>
              {type} {quantityOwned}/{quantityNeeded}
            </li>
          ))}
        </ul>
      </div>
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
  if (!type) return <></>;

  const cards = getCardsFromStorage();
  const ownedDeckCardsofType = allCardsofType.filter((cardOfType) =>
    cards.some(
      (card) =>
        card.type?.toLowerCase() === type &&
        card.name.toLowerCase() === cardOfType.name.toLowerCase()
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
