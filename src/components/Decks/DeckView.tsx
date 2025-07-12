import type {
  Card,
  CardTypeSummary,
  Deck,
} from "../../types/MagicTheGathering";
import { TypeSummary } from "../shared/TypeSummary";
import "../styles.css";
import { getDeckTypeSummaryWithDefaults, isDeckReady } from "../../utils/decks";
import { getCardsFromStorage } from "../../utils/storage";
import { ManaRow } from "./ManaRow";
import { useEffect, useState } from "react";

interface Props {
  deck: Deck;
  setCurrentView?: (view: string) => void;
}

export function DeckView({ deck, setCurrentView }: Props) {
  const [summary, setSummary] = useState<CardTypeSummary[]>([]);

  useEffect(() => {
    getDeckTypeSummaryWithDefaults(deck.cards).then((typeSummary) => {
      setSummary(typeSummary);
    });
  }, [deck.cards]);

  const handleClick = () => {
    if (typeof setCurrentView === "function") {
      setCurrentView(`deckCreateEditView=${deck.id}`);
    }
  };

  return (
    <div
      className={`deck cursor-pointer ${
        isDeckReady(deck) ? "opacity-100" : "opacity-60"
      }`}
      onClick={handleClick}
    >
      <div className="deckTop">
        <p className="emphasis">{deck.name}</p>
        {deck.description && (
          <p className="truncate w-40">{deck.description}</p>
        )}
      </div>
      {deck.colours && deck.colours.length > 0 && (
        <ManaRow colours={deck.colours} />
      )}
      <TypeSummary summary={summary} />
      <div className="formatTag">
        <p>{deck.format}</p>
      </div>
    </div>
  );
}

export async function CardTypeDetailRow({
  allCardsofType,
  type,
}: {
  allCardsofType: Card[];
  type?: string;
}) {
  if (!type) return <></>;

  const cards = await getCardsFromStorage();
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
    sorcery: "Sorcery",
    artifact: "Artifacts",
    land: "Lands",
  };
  const cardTypeLabel = cardTypeLabels[type as string] || type;

  return (
    <div className="flexRow">{`${cardTypeLabel} ${ownedDeckCardsofType}/${allCardsofType.length}`}</div>
  );
}
