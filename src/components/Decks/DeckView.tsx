import type { CardTypeSummary, Deck } from "../../types/MagicTheGathering";
import { TypeSummary } from "../shared/TypeSummary";
import "../styles.css";
import { getDeckTypeSummaryWithDefaults } from "../../utils/decks";
import { ManaRow } from "./components/ManaRow";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface Props {
  deck: Deck;
}

export function DeckView({ deck }: Props) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<CardTypeSummary[]>([]);
  deck.cards;

  useEffect(() => {
    getDeckTypeSummaryWithDefaults(deck.cards).then((typeSummary) => {
      setSummary(typeSummary);
    });
  }, [deck.cards]);

  const handleClick = () => {
    navigate(`/deck/${deck.id}/`);
  };

  return (
    <div className={"deck cursor-pointer"} onClick={handleClick}>
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
