import type { Deck } from "../../types/MagicTheGathering";
import { TypeSummary } from "../shared/TypeSummary";
import "../styles.css";
import { getDeckTypeSummaryWithDefaults, isDeckReady } from "../../utils/decks";
import { ManaRow } from "./components/ManaRow";
import { useNavigate } from "react-router-dom";

interface Props {
  deck: Deck;
}

export function DeckView({ deck }: Props) {
  const summary = getDeckTypeSummaryWithDefaults(deck.cards);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/deck/${deck.id}/`);
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
