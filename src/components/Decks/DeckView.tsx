import type { Card, Deck } from "../../types/MagicTheGathering";
import { CardTypeSummary } from "../shared/CardTypeSummary";
import "../styles.css";
import { getDeckTypeSummaryWithDefaults } from "../utils/decks";
import { getCardsFromStorage } from "../utils/storage";
import { ManaRow } from "./ManaRow";

interface Props {
  deck: Deck;
  setCurrentView?: (view: string) => void;
}

export function DeckView({ deck, setCurrentView }: Props) {
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
        {deck.description && (
          <p className="truncate w-40">{deck.description}</p>
        )}
      </div>
      {deck.colours && deck.colours.length > 0 && (
        <ManaRow colours={deck.colours} />
      )}
      <CardTypeSummary summary={summary} />
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
    enchantment: "Enchantments",
    artifact: "Artifacts",
    land: "Lands",
  };
  const cardTypeLabel = cardTypeLabels[type as string] || type;

  return (
    <div className="flexRow">{`${cardTypeLabel} ${ownedDeckCardsofType}/${allCardsofType.length}`}</div>
  );
}
